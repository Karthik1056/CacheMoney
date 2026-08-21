'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { AccountType } from '@prisma/client';

// ─── ACCOUNTS ───
export async function getAccounts() {
  try {
    const accounts = await prisma.account.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return accounts.map((a) => ({ ...a, balance: Number(a.balance) }));
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return [];
  }
}

export async function createAccount(data: {
  name: string;
  type: AccountType;
  currency?: string;
  balance?: number;
  color?: string;
}) {
  try {
    const created = await prisma.account.create({
      data: {
        name: data.name,
        type: data.type,
        currency: data.currency || 'USD',
        balance: data.balance || 0,
        color: data.color || null,
      },
    });
    revalidatePath('/settings');
    revalidatePath('/overview');
    revalidatePath('/entries');
    return { success: true, account: created };
  } catch (error) {
    console.error('Failed to create account:', error);
    return { success: false, error: 'Failed to create account' };
  }
}

export async function updateAccount(
  id: string,
  data: {
    name?: string;
    type?: AccountType;
    balance?: number;
    color?: string;
  },
) {
  try {
    await prisma.account.update({ where: { id }, data });
    revalidatePath('/settings');
    revalidatePath('/overview');
    revalidatePath('/entries');
    return { success: true };
  } catch (error) {
    console.error('Failed to update account:', error);
    return { success: false, error: 'Failed to update account' };
  }
}

export async function deleteAccount(id: string) {
  try {
    await prisma.account.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidatePath('/settings');
    revalidatePath('/overview');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete account:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}

// ─── CATEGORIES ───
const PREDEFINED_CATEGORIES = [
  { name: 'Food & Dining', icon: 'Utensils', color: '#EF4444', isIncome: false },
  { name: 'Rent & Housing', icon: 'Home', color: '#3B82F6', isIncome: false },
  { name: 'Electricity & Utilities', icon: 'Zap', color: '#F59E0B', isIncome: false },
  { name: 'Groceries', icon: 'ShoppingCart', color: '#10B981', isIncome: false },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899', isIncome: false },
  { name: 'Transportation', icon: 'Car', color: '#8B5CF6', isIncome: false },
  { name: 'Entertainment', icon: 'Film', color: '#6366F1', isIncome: false },
  { name: 'Health & Medical', icon: 'Activity', color: '#14B8A6', isIncome: false },
  { name: 'Travel', icon: 'Plane', color: '#06B6D4', isIncome: false },
  { name: 'Subscriptions', icon: 'Tv', color: '#A855F7', isIncome: false },
  { name: 'Salary', icon: 'CreditCard', color: '#10B981', isIncome: true },
  { name: 'Freelance', icon: 'Briefcase', color: '#3B82F6', isIncome: true },
  { name: 'Investments', icon: 'TrendingUp', color: '#8B5CF6', isIncome: true },
];

export async function getCategories() {
  try {
    let categories = await prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });

    if (categories.length === 0) {
      await prisma.category.createMany({
        data: PREDEFINED_CATEGORIES,
        skipDuplicates: true,
      });
      categories = await prisma.category.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      });
    }

    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function createCategory(data: {
  name: string;
  icon?: string;
  color?: string;
  isIncome?: boolean;
}) {
  try {
    const created = await prisma.category.create({
      data: {
        name: data.name,
        icon: data.icon || 'CircleDollarSign',
        color: data.color || '#64748B',
        isIncome: data.isIncome || false,
      },
    });
    revalidatePath('/settings');
    revalidatePath('/overview');
    revalidatePath('/expenses');
    return { success: true, category: created };
  } catch (error) {
    console.error('Failed to create category:', error);
    return { success: false, error: 'Failed to create category' };
  }
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    icon?: string;
    color?: string;
    isIncome?: boolean;
  },
) {
  try {
    await prisma.category.update({ where: { id }, data });
    revalidatePath('/settings');
    revalidatePath('/overview');
    revalidatePath('/expenses');
    return { success: true };
  } catch (error) {
    console.error('Failed to update category:', error);
    return { success: false, error: 'Failed to update category' };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidatePath('/settings');
    revalidatePath('/overview');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}

// ─── RULES ───
export async function getRules() {
  try {
    const rules = await prisma.rule.findMany({
      include: { category: true },
      orderBy: { priority: 'desc' },
    });
    return rules.map((r) => ({
      id: r.id,
      keyword: r.keyword,
      categoryId: r.categoryId,
      categoryName: r.category.name,
      categoryIcon: r.category.icon,
      categoryColor: r.category.color,
      autoConfirm: r.autoConfirm,
      priority: r.priority,
    }));
  } catch (error) {
    console.error('Failed to fetch rules:', error);
    return [];
  }
}

export async function createRule(data: {
  keyword: string;
  categoryId: string;
  autoConfirm?: boolean;
  priority?: number;
}) {
  try {
    const created = await prisma.rule.create({
      data: {
        keyword: data.keyword,
        categoryId: data.categoryId,
        autoConfirm: data.autoConfirm ?? true,
        priority: data.priority ?? 0,
      },
    });
    revalidatePath('/settings');
    return { success: true, rule: created };
  } catch (error) {
    console.error('Failed to create rule:', error);
    return { success: false, error: 'Failed to create rule' };
  }
}

export async function updateRule(
  id: string,
  data: {
    keyword?: string;
    categoryId?: string;
    autoConfirm?: boolean;
    priority?: number;
  },
) {
  try {
    await prisma.rule.update({ where: { id }, data });
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to update rule:', error);
    return { success: false, error: 'Failed to update rule' };
  }
}

export async function deleteRule(id: string) {
  try {
    await prisma.rule.delete({ where: { id } });
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete rule:', error);
    return { success: false, error: 'Failed to delete rule' };
  }
}
