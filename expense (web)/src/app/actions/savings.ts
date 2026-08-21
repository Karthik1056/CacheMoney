'use server';

import { prisma } from '@/lib/prisma';

export async function getSavingsData() {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Fetch all savings metrics in parallel
    const [assets, overallBudget, monthExpenses, goals] = await Promise.all([
      prisma.account.findMany({
        where: { type: 'ASSET', deletedAt: null },
      }),
      prisma.budget.findFirst({
        where: { month: currentMonth },
        include: { category: true },
        orderBy: { amount: 'desc' },
      }),
      prisma.transaction.aggregate({
        where: {
          deletedAt: null,
          date: { gte: startDate, lte: endDate },
          category: { isIncome: false },
        },
        _sum: { amount: true },
      }),
      prisma.wishlistItem.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalSavings = assets.reduce((sum, a) => sum + Number(a.balance), 0);
    const spentThisMonth = Number(monthExpenses._sum.amount || 0);

    return {
      totalSavings,
      currentMonth,
      monthlyGoal: overallBudget
        ? {
            cap: Number(overallBudget.amount),
            spent: spentThisMonth,
            categoryName: overallBudget.category.name,
          }
        : null,
      goals: goals.map((g) => ({
        id: g.id,
        title: g.title,
        targetAmount: Number(g.amount),
        status: g.status,
        coolingUntil: g.coolingUntil.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Failed to fetch savings data:', error);
    return {
      totalSavings: 0,
      currentMonth: '',
      monthlyGoal: null,
      goals: [],
    };
  }
}
