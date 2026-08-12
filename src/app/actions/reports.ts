'use server';

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function getReportsData(params?: {
  categoryId?: string;
  accountId?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}) {
  try {
    const { categoryId, accountId, period = 'month', startDate, endDate } = params || {};
    const now = new Date();

    let fromDate: Date;
    let toDate: Date = new Date();

    if (startDate || endDate) {
      fromDate = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1);
      if (endDate) {
        toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999);
      }
    } else if (period === 'day') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (period === 'week') {
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      fromDate = new Date(now.setDate(diffToMonday));
      fromDate.setHours(0, 0, 0, 0);
    } else if (period === 'year') {
      fromDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    } else {
      // Default: current month
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    }

    // Common transaction filter
    const txWhere: Prisma.TransactionWhereInput = {
      deletedAt: null,
      date: { gte: fromDate, lte: toDate },
    };

    if (categoryId && categoryId !== 'all') {
      txWhere.categoryId = categoryId;
    }
    if (accountId && accountId !== 'all') {
      txWhere.fromAccountId = accountId;
    }

    // 1. Transactions for Spending & Expense Charts
    const transactions = await prisma.transaction.findMany({
      where: txWhere,
      include: { category: true, fromAccount: true },
      orderBy: { date: 'asc' },
    });

    // 2. Bills report data
    const billWhere: Prisma.BillWhereInput = {
      dueDate: { gte: fromDate, lte: toDate },
    };
    if (categoryId && categoryId !== 'all') {
      billWhere.categoryId = categoryId;
    }

    const bills = await prisma.bill.findMany({
      where: billWhere,
      include: { category: true },
      orderBy: { dueDate: 'asc' },
    });

    // 3. Reminders / Subscriptions report data
    const reminders = await prisma.subscription.findMany({
      where: {
        deletedAt: null,
        nextBilling: { gte: fromDate, lte: toDate },
      },
      orderBy: { nextBilling: 'asc' },
    });

    // Aggregate Spends vs Income Breakdown
    let totalSpending = 0;
    let totalExpense = 0;
    let totalIncome = 0;

    const categoryMap: Record<string, { name: string; color: string; total: number }> = {};
    const accountMap: Record<string, { name: string; total: number }> = {};

    transactions.forEach((tx) => {
      const amt = Number(tx.amount);
      if (tx.category?.isIncome) {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        totalSpending += amt;

        // Category distribution
        const catName = tx.category?.name || 'Uncategorized';
        const catColor = tx.category?.color || '#64748B';
        if (!categoryMap[catName]) {
          categoryMap[catName] = { name: catName, color: catColor, total: 0 };
        }
        categoryMap[catName].total += amt;

        // Account distribution
        const accName = tx.fromAccount.name;
        if (!accountMap[accName]) {
          accountMap[accName] = { name: accName, total: 0 };
        }
        accountMap[accName].total += amt;
      }
    });

    const categoryCharts = Object.values(categoryMap).map((c) => ({
      name: c.name,
      value: c.total,
      color: c.color,
    }));

    const accountCharts = Object.values(accountMap).map((a) => ({
      name: a.name,
      value: a.total,
    }));

    // Bills Status Breakdown
    const billPaid = bills.filter((b) => b.status === 'PAID').reduce((sum, b) => sum + Number(b.amount), 0);
    const billDue = bills.filter((b) => b.status === 'DUE' || b.status === 'OVERDUE').reduce((sum, b) => sum + Number(b.amount), 0);

    const billsCharts = [
      { name: 'Paid Bills', value: billPaid, color: '#10B981' },
      { name: 'Due/Overdue', value: billDue, color: '#EF4444' },
    ];

    // Reminders Breakdown by Cycle
    const reminderCycleMap: Record<string, number> = {};
    reminders.forEach((r) => {
      const cyc = r.cycle || 'MONTHLY';
      reminderCycleMap[cyc] = (reminderCycleMap[cyc] || 0) + Number(r.amount);
    });

    const reminderCharts = Object.entries(reminderCycleMap).map(([cycle, total]) => ({
      name: cycle,
      value: total,
    }));

    return {
      summary: {
        totalSpending,
        totalExpense,
        totalIncome,
        totalBills: billPaid + billDue,
        totalReminders: reminders.reduce((sum, r) => sum + Number(r.amount), 0),
        transactionCount: transactions.length,
        billCount: bills.length,
        reminderCount: reminders.length,
      },
      categoryCharts,
      accountCharts,
      billsCharts,
      reminderCharts,
    };
  } catch (error) {
    console.error('Failed to fetch reports data:', error);
    return {
      summary: {
        totalSpending: 0,
        totalExpense: 0,
        totalIncome: 0,
        totalBills: 0,
        totalReminders: 0,
        transactionCount: 0,
        billCount: 0,
        reminderCount: 0,
      },
      categoryCharts: [],
      accountCharts: [],
      billsCharts: [],
      reminderCharts: [],
    };
  }
}
