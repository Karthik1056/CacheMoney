'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { BillingCycle } from '@prisma/client';

// ─── SAVINGS GOALS (WishlistItem) ───
export async function createGoal(data: {
  title: string;
  targetAmount: number;
  coolingDays?: number;
}) {
  try {
    const coolingUntil = new Date();
    coolingUntil.setDate(coolingUntil.getDate() + (data.coolingDays ?? 30));

    await prisma.wishlistItem.create({
      data: {
        title: data.title,
        amount: data.targetAmount,
        coolingUntil,
        status: 'WAITING',
      },
    });
    revalidatePath('/savings');
    return { success: true };
  } catch (error) {
    console.error('Failed to create goal:', error);
    return { success: false, error: 'Failed to create goal' };
  }
}

export async function deleteGoal(id: string) {
  try {
    await prisma.wishlistItem.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidatePath('/savings');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete goal:', error);
    return { success: false };
  }
}

// ─── SUBSCRIPTIONS & GENERAL REMINDERS ───
export async function createSubscription(data: {
  name: string;
  category?: string;
  amount?: number;
  cycle?: BillingCycle;
  nextBilling: string;
  notes?: string;
}) {
  try {
    await prisma.subscription.create({
      data: {
        name: data.name,
        category: data.category || 'General',
        amount: data.amount !== undefined && !isNaN(Number(data.amount)) ? Number(data.amount) : 0,
        cycle: data.cycle || 'MONTHLY',
        nextBilling: new Date(data.nextBilling),
        notes: data.notes || null,
        active: true,
      },
    });
    revalidatePath('/reminders');
    revalidatePath('/overview');
    return { success: true };
  } catch (error) {
    console.error('Failed to create reminder:', error);
    return { success: false, error: 'Failed to create reminder' };
  }
}

export async function deleteSubscription(id: string) {
  try {
    await prisma.subscription.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
    revalidatePath('/reminders');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete subscription:', error);
    return { success: false };
  }
}

// ─── MONTHLY BUDGET ───
export async function upsertMonthlySalaryAndOverallBudget(data: {
  salaryTarget?: number;
  overallExpenseLimit?: number;
  month?: string;
}) {
  try {
    const now = new Date();
    const month =
      data.month ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Ensure Overall Salary category exists
    if (data.salaryTarget !== undefined && data.salaryTarget >= 0) {
      let salaryCat = await prisma.category.findFirst({
        where: { name: 'Overall Salary', isIncome: true, deletedAt: null },
      });
      if (!salaryCat) {
        salaryCat = await prisma.category.create({
          data: { name: 'Overall Salary', isIncome: true, color: '#10B981', icon: 'CreditCard' },
        });
      }
      await prisma.budget.upsert({
        where: { month_categoryId: { month, categoryId: salaryCat.id } },
        update: { amount: data.salaryTarget },
        create: { month, categoryId: salaryCat.id, amount: data.salaryTarget },
      });
    }

    // Ensure Overall Expense category exists
    if (data.overallExpenseLimit !== undefined && data.overallExpenseLimit >= 0) {
      let overallCat = await prisma.category.findFirst({
        where: { name: 'Overall Expense Budget', isIncome: false, deletedAt: null },
      });
      if (!overallCat) {
        overallCat = await prisma.category.create({
          data: { name: 'Overall Expense Budget', isIncome: false, color: '#2F56FF', icon: 'Sparkles' },
        });
      }
      await prisma.budget.upsert({
        where: { month_categoryId: { month, categoryId: overallCat.id } },
        update: { amount: data.overallExpenseLimit },
        create: { month, categoryId: overallCat.id, amount: data.overallExpenseLimit },
      });
    }

    revalidatePath('/overview');
    revalidatePath('/savings');
    revalidatePath('/settings');
    revalidatePath('/expenses');
    return { success: true };
  } catch (error) {
    console.error('Failed to upsert overall salary and budget:', error);
    return { success: false, error: 'Save failed' };
  }
}

export async function upsertBudget(data: {
  categoryId: string;
  amount: number;
  month?: string; // YYYY-MM, defaults to current month
}) {
  try {
    const now = new Date();
    const month =
      data.month ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    await prisma.budget.upsert({
      where: { month_categoryId: { month, categoryId: data.categoryId } },
      update: { amount: data.amount },
      create: { month, categoryId: data.categoryId, amount: data.amount },
    });
    revalidatePath('/overview');
    revalidatePath('/savings');
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to upsert budget:', error);
    return { success: false, error: 'Failed to save budget' };
  }
}

export async function getBudgetsForMonth(month?: string) {
  try {
    const now = new Date();
    const targetMonth =
      month ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budgets = await prisma.budget.findMany({
      where: { month: targetMonth },
      include: { category: true },
    });

    return budgets.map((b) => ({
      id: b.id,
      month: b.month,
      amount: Number(b.amount),
      categoryId: b.categoryId,
      categoryName: b.category.name,
      isIncome: b.category.isIncome,
    }));
  } catch (error) {
    console.error('Failed to fetch budgets:', error);
    return [];
  }
}

export async function deleteBudget(id: string) {
  try {
    await prisma.budget.delete({ where: { id } });
    revalidatePath('/overview');
    revalidatePath('/savings');
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete budget:', error);
    return { success: false };
  }
}
