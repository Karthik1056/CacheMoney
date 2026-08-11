'use server';

import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function getExpensesData(month?: string, selectedDateStr?: string) {
  try {
    const now = new Date();
    const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [year, mon] = targetMonth.split('-').map(Number);

    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59, 999);

    // 1. Fetch transactions and budgets concurrently
    const [transactions, budgets] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          deletedAt: null,
          date: { gte: startDate, lte: endDate },
          category: { isIncome: false },
        },
        include: { category: true, fromAccount: true, attachments: true },
        orderBy: { date: 'desc' },
      }),
      prisma.budget.findMany({
        where: { month: targetMonth },
      }),
    ]);

    // 2. Dates with transactions (for calendar dot markers)
    const transactionDates = [
      ...new Set(transactions.map((tx) => tx.date.toISOString().split('T')[0])),
    ];

    // 3. Filtered transactions for selected date if provided
    let dayTransactions = transactions;
    if (selectedDateStr) {
      dayTransactions = transactions.filter(
        (tx) => tx.date.toISOString().split('T')[0] === selectedDateStr
      );
    }

    // 4. Spent vs Budget Cap
    const totalSpent = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const spentPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    // 5. Per-category breakdown for gauge chart
    const breakdownMap: Record<string, { name: string; color: string; total: number }> = {};
    for (const tx of transactions) {
      const catName = tx.category?.name || 'Uncategorized';
      const catColor = tx.category?.color || '#64748B';
      if (!breakdownMap[catName]) {
        breakdownMap[catName] = { name: catName, color: catColor, total: 0 };
      }
      breakdownMap[catName].total += Number(tx.amount);
    }

    const categoryBreakdown = Object.values(breakdownMap)
      .sort((a, b) => b.total - a.total)
      .map((item) => ({
        ...item,
        percentage: totalSpent > 0 ? Math.round((item.total / totalSpent) * 100) : 0,
      }));

    return {
      month: targetMonth,
      selectedDate: selectedDateStr || null,
      transactionDates,
      totalSpent,
      totalBudget,
      spentPercentage,
      categoryBreakdown,
      transactions: dayTransactions.map((tx) => ({
        id: tx.id,
        description: tx.description,
        amount: Number(tx.amount),
        date: tx.date.toISOString(),
        categoryName: tx.category?.name || 'Uncategorized',
        categoryIcon: tx.category?.icon || 'CircleDollarSign',
        categoryColor: tx.category?.color || '#64748B',
        accountName: tx.fromAccount.name,
        fromAccountId: tx.fromAccountId,
        categoryId: tx.categoryId,
        receiptUrl: tx.attachments?.[0]?.fileUrl || null,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch expenses data:', error);
    return {
      month: month || '',
      selectedDate: null,
      transactionDates: [],
      totalSpent: 0,
      totalBudget: 0,
      spentPercentage: 0,
      categoryBreakdown: [],
      transactions: [],
    };
  }
}

export async function getAnalyticsData(year?: number, month?: string) {
  try {
    const currentYear = year || new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        date: { gte: startOfYear, lte: endOfYear },
      },
      include: { category: true },
    });

    // 1. Monthly Income vs Expense Bar Chart Data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyOverview = monthNames.map((name, index) => {
      const monthTxs = transactions.filter((tx) => tx.date.getMonth() === index);
      const income = monthTxs
        .filter((tx) => tx.category?.isIncome)
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
      const expense = monthTxs
        .filter((tx) => !tx.category?.isIncome)
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
      return { month: name, Income: income, Expense: expense };
    });

    // 2. Category Share Pie Chart Data
    const categoryTotals: Record<string, { name: string; value: number; color: string }> = {};
    for (const tx of transactions) {
      if (tx.category?.isIncome) continue; // expenses only for pie chart
      const name = tx.category?.name || 'Uncategorized';
      const color = tx.category?.color || '#64748B';
      if (!categoryTotals[name]) {
        categoryTotals[name] = { name, value: 0, color };
      }
      categoryTotals[name].value += Number(tx.amount);
    }

    return {
      year: currentYear,
      monthlyOverview,
      categoryDistribution: Object.values(categoryTotals).sort((a, b) => b.value - a.value),
    };
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    return {
      year: new Date().getFullYear(),
      monthlyOverview: [],
      categoryDistribution: [],
    };
  }
}
