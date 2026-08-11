'use server';

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function getEntries(params?: {
  search?: string;
  categoryId?: string;
  accountId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const {
      search,
      categoryId,
      accountId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = params || {};

    const where: Prisma.TransactionWhereInput = { deletedAt: null };

    if (search && search.trim()) {
      where.description = { contains: search.trim(), mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (accountId) {
      where.fromAccountId = accountId;
    }
    if (status) {
      where.status = status as Prisma.EnumTransactionStatusFilter;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, fromAccount: true, toAccount: true, tags: true, attachments: true },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions: transactions.map((tx) => ({
        id: tx.id,
        description: tx.description,
        amount: Number(tx.amount),
        date: tx.date.toISOString(),
        status: tx.status,
        intent: tx.intent,
        mood: tx.mood,
        categoryName: tx.category?.name || 'Uncategorized',
        categoryIcon: tx.category?.icon || 'CircleDollarSign',
        categoryColor: tx.category?.color || '#64748B',
        accountName: tx.fromAccount.name,
        toAccountName: tx.toAccount?.name || null,
        tags: tx.tags.map((t) => t.name),
        isIncome: tx.category?.isIncome || false,
        receiptUrl: tx.attachments?.[0]?.fileUrl || null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    return { transactions: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getFilterOptions() {
  try {
    const [categories, accounts] = await Promise.all([
      prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } }),
      prisma.account.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } }),
    ]);

    return {
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
      })),
      accounts: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch filter options:', error);
    return { categories: [], accounts: [] };
  }
}
