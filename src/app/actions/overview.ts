'use server';

import { prisma } from '@/lib/prisma';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';

export async function getOverviewData(month?: string) {
  try {
    const now = new Date();
    const targetDate = month ? new Date(`${month}-01T00:00:00`) : now;
    const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);

    const prevTarget = subMonths(targetDate, 1);
    const prevStart = startOfMonth(prevTarget);
    const prevEnd = endOfMonth(prevTarget);

    // Consolidated single Promise.all batch for optimal Prisma Accelerate execution
    const [
      accounts,
      incomeCategories,
      allCategories,
      budgets,
      latestTransactions,
      latestGoals,
      latestReminders,
      incomeAgg,
      expenseAgg,
      prevExpenseAgg,
      categoryGroupedExpenses,
      monthTransactions,
    ] = await Promise.all([
      prisma.account.findMany({ where: { deletedAt: null } }),
      prisma.category.findMany({ where: { isIncome: true, deletedAt: null }, select: { id: true } }),
      prisma.category.findMany({ where: { deletedAt: null } }),
      prisma.budget.findMany({ where: { month: targetMonth, category: { deletedAt: null } }, include: { category: true } }),
      prisma.transaction.findMany({
        where: { deletedAt: null },
        orderBy: { date: 'desc' },
        take: 5,
        include: { category: true, fromAccount: true },
      }),
      prisma.wishlistItem.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.subscription.findMany({ where: { deletedAt: null }, orderBy: { nextBilling: 'asc' }, take: 5 }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { deletedAt: null, category: { isIncome: true } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { deletedAt: null, OR: [{ category: { isIncome: false } }, { categoryId: null }] },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          deletedAt: null,
          OR: [{ category: { isIncome: false } }, { categoryId: null }],
          date: { gte: prevStart, lte: prevEnd },
        },
      }),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        _sum: { amount: true },
        where: {
          deletedAt: null,
          date: { gte: startDate, lte: endDate },
          OR: [{ category: { isIncome: false } }, { categoryId: null }],
        },
      }),
      prisma.transaction.findMany({
        where: { deletedAt: null, date: { gte: startDate, lte: endDate } },
        include: { category: true },
      }),
    ]);

    const totalIncome = Number(incomeAgg._sum?.amount || 0);
    const totalExpense = Number(expenseAgg._sum?.amount || 0);
    const prevTotalExpense = Number(prevExpenseAgg._sum?.amount || 0);

    const rawAccountBalance = accounts.reduce((sum: number, acc: any) => {
      const bal = Number(acc.balance);
      return acc.type === 'LIABILITY' ? sum - bal : sum + bal;
    }, 0);

    // Dynamic Net Balance = Accounts Capital - Total Expenses
    const netBalance = rawAccountBalance > totalExpense ? rawAccountBalance - totalExpense : rawAccountBalance;

    const momChange =
      prevTotalExpense > 0
        ? Math.round(((totalExpense - prevTotalExpense) / prevTotalExpense) * 100)
        : 0;

    const overallExpenseBudget = budgets.find((b: any) => !b.category.isIncome && b.category.name.includes('Overall'));
    const salaryBudget = budgets.find((b: any) => b.category.isIncome);

    const salaryTarget = salaryBudget ? Number(salaryBudget.amount) : 0;
    const finalIncome = totalIncome > 0 ? totalIncome : salaryTarget;

    const totalBudget = overallExpenseBudget
      ? Number(overallExpenseBudget.amount)
      : budgets.filter((b: any) => !b.category.isIncome).reduce((sum: number, b: any) => sum + Number(b.amount), 0);

    const totalExpenseAll = categoryGroupedExpenses.reduce((sum: number, item: any) => sum + Number(item._sum.amount || 0), 0);
    // Base denominator for category share (net balance + total expenses = original starting balance)
    const baseBalance = netBalance > 0 ? (netBalance + totalExpenseAll) : (totalExpenseAll > 0 ? totalExpenseAll : 1);

    const categoryBreakdown = categoryGroupedExpenses
      .map((item: any) => {
        const cat = allCategories.find((c: any) => c.id === item.categoryId);
        const spent = Number(item._sum.amount || 0);
        const budget = budgets.find((b: any) => b.categoryId === item.categoryId);
        const cap = budget ? Number(budget.amount) : 0;
        const percentage = baseBalance > 0 ? Math.round((spent / baseBalance) * 100) : 0;

        return {
          id: item.categoryId || 'uncategorized',
          name: cat?.name || 'Uncategorized',
          color: cat?.color || '#64748B',
          icon: cat?.icon || 'CircleDollarSign',
          spent,
          cap,
          percentage,
        };
      })
      .sort((a: any, b: any) => b.spent - a.spent);

    const budgetMeters = categoryBreakdown.slice(0, 5);

    const daysInMonth = endDate.getDate();
    const yearNum = targetDate.getFullYear();
    const monthNum = targetDate.getMonth() + 1;
    const monthStr = String(monthNum).padStart(2, '0');

    const dailyTrends = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${yearNum}-${monthStr}-${dayStr}`;

      const dayTxs = monthTransactions.filter((tx: any) => {
        const txDate = new Date(tx.date).toISOString().split('T')[0];
        return txDate === dateKey;
      });

      const income = dayTxs
        .filter((tx: any) => tx.category?.isIncome)
        .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);

      const expense = dayTxs
        .filter((tx: any) => !tx.category?.isIncome)
        .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);

      return {
        date: dateKey,
        Income: income,
        Expense: expense,
      };
    });

    return {
      selectedMonth: targetMonth,
      totalIncome: finalIncome,
      totalExpense,
      totalBudget,
      netBalance,
      momChange,
      dailyTrends,
      latestTransactions: latestTransactions.map((tx: any) => ({
        id: tx.id,
        description: tx.description,
        amount: Number(tx.amount),
        date: tx.date.toISOString(),
        categoryName: tx.category?.name || 'Uncategorized',
        categoryIcon: tx.category?.icon || 'CircleDollarSign',
        categoryColor: tx.category?.color || '#64748B',
        accountName: tx.fromAccount.name,
        isIncome: tx.category?.isIncome || false,
      })),
      latestSavings: latestGoals.map((g: any) => ({
        id: g.id,
        title: g.title,
        targetAmount: Number(g.amount),
        status: g.status,
      })),
      latestReminders: latestReminders.map((r: any) => ({
        id: r.id,
        name: r.name,
        amount: Number(r.amount),
        cycle: r.cycle,
        nextBilling: r.nextBilling.toISOString(),
      })),
      categoryBreakdown,
      budgetMeters,
    };
  } catch (error) {
    console.error('Failed to fetch overview data:', error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      totalBudget: 0,
      netBalance: 0,
      momChange: 0,
      latestTransactions: [],
      latestSavings: [],
      latestReminders: [],
      categoryBreakdown: [],
      budgetMeters: [],
    };
  }
}
