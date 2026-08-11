'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

export async function getTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { deletedAt: null },
      orderBy: { date: 'desc' },
      take: 20,
      include: {
        category: true,
        fromAccount: true,
        toAccount: true,
        tags: true,
      },
    });

    return transactions.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
    }));
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return [];
  }
}

export async function createQuickAddTransaction(rawInput: string) {
  try {
    if (!rawInput || !rawInput.trim()) return { success: false, error: 'Input cannot be empty' };

    // Simple deterministic quick-add parser logic
    // Syntax: <Category/Desc> <Amount> [from <Account>] [#tag] [#mood]
    let text = rawInput.trim();

    // Extract tags (#tag) and mood (#stressed, etc.)
    const tagMatches = text.match(/#(\w+)/g) || [];
    const tags = tagMatches.map((t) => t.replace('#', ''));
    
    // Remove tags from main string
    text = text.replace(/#(\w+)/g, '').trim();

    // Extract account ("from Checking", "from Cash")
    let fromAccountName = 'Checking Account';
    const accountMatch = text.match(/from\s+([A-Za-z0-9\s]+)/i);
    if (accountMatch) {
      fromAccountName = accountMatch[1].trim();
      text = text.replace(/from\s+([A-Za-z0-9\s]+)/i, '').trim();
    }

    // Extract numeric amount
    const amountMatch = text.match(/(\d+(?:\.\d{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    
    // Remaining string is Category / Description
    let description = text.replace(/(\d+(?:\.\d{1,2})?)/, '').trim() || 'General Expense';

    // Find account by name, fall back to first ASSET account
    const account =
      (await prisma.account.findFirst({
        where: { name: { contains: fromAccountName, mode: 'insensitive' }, deletedAt: null },
      })) ??
      (await prisma.account.findFirst({ where: { type: 'ASSET', deletedAt: null } }));

    if (!account) {
      return { success: false, error: 'No account found. Please add an account in Settings first.' };
    }

    // Find auto-matched category or fallback
    let category = await prisma.category.findFirst({
      where: { name: { contains: description, mode: 'insensitive' } },
    });

    if (!category) {
      category = await prisma.category.findFirst({
        where: { name: 'Overall' },
      });
    }

    // Extract mood tag if present
    const mood = tags.find((t) => ['stressed', 'impulsive', 'happy', 'bored'].includes(t.toLowerCase())) || null;

    const newTx = await prisma.transaction.create({
      data: {
        description,
        amount,
        rawInput,
        fromAccountId: account.id,
        categoryId: category ? category.id : undefined,
        mood,
        status: 'CONFIRMED',
        intent: 'WANT',
      },
    });

    // Emit notification event
    await createNotification({
      type: 'transaction',
      title: description,
      subtitle: `₹${amount.toFixed(2)} logged from ${account.name}`,
      icon: category?.icon || 'CircleDollarSign',
    });

    revalidatePath('/entries');
    revalidatePath('/overview');
    revalidatePath('/expenses');
    return { success: true, transactionId: newTx.id };
  } catch (error) {
    console.error('Failed to create quick add transaction:', error);
    return { success: false, error: 'Database creation failed' };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const tx = await prisma.transaction.findUnique({
      where: { id },
      include: { category: true },
    });

    if (tx && tx.fromAccountId) {
      const isIncome = tx.category?.isIncome ?? false;
      const amountNum = Number(tx.amount);

      if (!isIncome) {
        // If expense is deleted -> Add amount back to account!
        await prisma.account.update({
          where: { id: tx.fromAccountId },
          data: { balance: { increment: amountNum } },
        });
      } else {
        // If income is deleted -> Deduct amount from account!
        await prisma.account.update({
          where: { id: tx.fromAccountId },
          data: { balance: { decrement: amountNum } },
        });
      }
    }

    await prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath('/entries');
    revalidatePath('/overview');
    revalidatePath('/expenses');
    revalidatePath('/bills');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    return { success: false, error: 'Deletion failed' };
  }
}

export async function createTransaction(data: {
  description: string;
  amount: number;
  date: string;
  categoryId?: string;
  fromAccountId: string;
  intent?: 'NEED' | 'WANT' | 'INVESTMENT';
  notes?: string;
  imageUrl?: string;
  isIncome?: boolean;
}) {
  try {
    const newTx = await prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        date: new Date(data.date),
        fromAccountId: data.fromAccountId,
        categoryId: data.categoryId || undefined,
        intent: data.intent || 'WANT',
        notes: data.notes || null,
        status: 'CONFIRMED',
      },
    });

    // Save attachment if imageUrl provided
    if (data.imageUrl) {
      await prisma.attachment.create({
        data: {
          transactionId: newTx.id,
          filename: data.imageUrl.split('/').pop() || 'receipt.jpg',
          fileUrl: data.imageUrl,
          mimeType: data.imageUrl.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          size: 0,
        },
      });
    }

    // Deduct from account balance if expense
    if (!data.isIncome) {
      await prisma.account.update({
        where: { id: data.fromAccountId },
        data: { balance: { decrement: data.amount } },
      });
    } else {
      await prisma.account.update({
        where: { id: data.fromAccountId },
        data: { balance: { increment: data.amount } },
      });
    }

    // Get category for notification
    const category = data.categoryId
      ? await prisma.category.findUnique({ where: { id: data.categoryId } })
      : null;

    await createNotification({
      type: 'transaction',
      title: data.description,
      subtitle: `₹${data.amount.toFixed(2)} • ${data.isIncome ? 'Income' : 'Expense'}`,
      icon: category?.icon || 'CircleDollarSign',
    });

    revalidatePath('/entries');
    revalidatePath('/overview');
    revalidatePath('/expenses');
    revalidatePath('/savings');
    return { success: true, transactionId: newTx.id };
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return { success: false, error: 'Database creation failed' };
  }
}

export async function updateTransaction(
  id: string,
  data: {
    description?: string;
    amount?: number;
    date?: string;
    categoryId?: string;
    fromAccountId?: string;
    intent?: 'NEED' | 'WANT' | 'INVESTMENT';
    notes?: string;
    imageUrl?: string;
  }
) {
  try {
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) return { success: false, error: 'Transaction not found' };

    await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.description && { description: data.description }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
        ...(data.fromAccountId && { fromAccountId: data.fromAccountId }),
        ...(data.intent && { intent: data.intent }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    });

    if (data.imageUrl) {
      await prisma.attachment.deleteMany({ where: { transactionId: id } });
      await prisma.attachment.create({
        data: {
          transactionId: id,
          filename: data.imageUrl.split('/').pop() || 'receipt.jpg',
          fileUrl: data.imageUrl,
          mimeType: data.imageUrl.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          size: 0,
        },
      });
    }

    revalidatePath('/entries');
    revalidatePath('/overview');
    revalidatePath('/expenses');
    revalidatePath('/savings');
    return { success: true };
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return { success: false, error: 'Update failed' };
  }
}

