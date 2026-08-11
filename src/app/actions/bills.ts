'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function getBillsData() {
  try {
    const bills = await prisma.bill.findMany({
      include: {
        category: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    const categories = await prisma.category.findMany({
      where: { deletedAt: null, isIncome: false },
      orderBy: { name: 'asc' },
    });

    const accounts = await prisma.account.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });

    const now = new Date();

    const formattedBills = bills.map((b) => {
      let status = b.status;
      if (status !== 'PAID' && new Date(b.dueDate) < now) {
        status = 'OVERDUE';
      }
      return {
        id: b.id,
        title: b.title,
        billerName: b.billerName || '',
        amount: Number(b.amount),
        dueDate: b.dueDate.toISOString().slice(0, 10),
        status,
        categoryId: b.categoryId,
        categoryName: b.category?.name || 'Utility Bill',
        categoryColor: b.category?.color || '#2f56ff',
        notes: b.notes || '',
        receiptUrl: b.receiptUrl || '',
        paidAt: b.paidAt ? b.paidAt.toISOString() : null,
      };
    });

    const totalDue = formattedBills
      .filter((b) => b.status === 'DUE' || b.status === 'OVERDUE')
      .reduce((sum, b) => sum + b.amount, 0);

    const totalPaid = formattedBills
      .filter((b) => b.status === 'PAID')
      .reduce((sum, b) => sum + b.amount, 0);

    const overdueCount = formattedBills.filter((b) => b.status === 'OVERDUE').length;

    return {
      bills: formattedBills,
      totalDue,
      totalPaid,
      overdueCount,
      categories: categories.map((c) => ({ id: c.id, name: c.name, color: c.color || '#2f56ff' })),
      accounts: accounts.map((a) => ({ id: a.id, name: a.name, balance: Number(a.balance) })),
    };
  } catch (error) {
    console.error('getBillsData error:', error);
    return {
      bills: [],
      totalDue: 0,
      totalPaid: 0,
      overdueCount: 0,
      categories: [],
      accounts: [],
    };
  }
}

export async function createBill(data: {
  title: string;
  billerName?: string;
  amount: number;
  dueDate: string;
  categoryId?: string;
  notes?: string;
  receiptUrl?: string;
}) {
  try {
    const bill = await prisma.bill.create({
      data: {
        title: data.title,
        billerName: data.billerName,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        categoryId: data.categoryId || null,
        notes: data.notes,
        receiptUrl: data.receiptUrl,
        status: 'DUE',
      },
    });

    // Also trigger an in-app notification
    await prisma.notification.create({
      data: {
        type: 'subscription_due',
        title: `New Bill Added: ${data.title}`,
        subtitle: `₹${data.amount.toLocaleString('en-IN')} due on ${data.dueDate}`,
        icon: 'Receipt',
      },
    });

    revalidatePath('/bills');
    revalidatePath('/overview');
    revalidatePath('/notifications');
    return { success: true, billId: bill.id };
  } catch (error: any) {
    console.error('createBill error:', error);
    return { success: false, error: error?.message || 'Failed to create bill' };
  }
}

export async function payBill(data: {
  billId: string;
  accountId: string;
}) {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id: data.billId },
      include: { category: true },
    });

    if (!bill) return { success: false, error: 'Bill not found' };
    if (bill.status === 'PAID') return { success: false, error: 'Bill already paid' };

    const account = await prisma.account.findUnique({
      where: { id: data.accountId },
    });

    if (!account) return { success: false, error: 'Account not found' };

    // Transactional update:
    // 1. Mark bill as paid
    // 2. Create expense transaction
    // 3. Deduct account balance
    await prisma.$transaction([
      prisma.bill.update({
        where: { id: data.billId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      }),
      prisma.transaction.create({
        data: {
          description: `Bill Payment: ${bill.title}`,
          amount: bill.amount,
          date: new Date(),
          fromAccountId: data.accountId,
          categoryId: bill.categoryId,
          intent: 'NEED',
          notes: `Paid bill for ${bill.billerName || bill.title}`,
        },
      }),
      prisma.account.update({
        where: { id: data.accountId },
        data: {
          balance: { decrement: bill.amount },
        },
      }),
      prisma.notification.create({
        data: {
          type: 'transaction',
          title: `Bill Paid: ${bill.title}`,
          subtitle: `₹${Number(bill.amount).toLocaleString('en-IN')} deducted from ${account.name}`,
          icon: 'CheckCircle2',
        },
      }),
    ]);

    revalidatePath('/bills');
    revalidatePath('/expenses');
    revalidatePath('/overview');
    revalidatePath('/entries');
    return { success: true };
  } catch (error: any) {
    console.error('payBill error:', error);
    return { success: false, error: error?.message || 'Failed to process bill payment' };
  }
}

export async function deleteBill(id: string) {
  try {
    await prisma.bill.delete({ where: { id } });
    revalidatePath('/bills');
    revalidatePath('/overview');
    return { success: true };
  } catch (error: any) {
    console.error('deleteBill error:', error);
    return { success: false, error: error?.message || 'Failed to delete bill' };
  }
}
