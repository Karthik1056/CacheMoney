'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createAmortizedExpenseSchedule(data: {
  title: string;
  totalAmount: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  fromAccountId: string;
  categoryId?: string;
}) {
  try {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    // Compute duration in days (minimum 1 day)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 1);

    const total = Number(data.totalAmount);
    const dailyAmount = Math.round((total / daysCount) * 100) / 100;

    // 1. Immediately deduct the lump-sum from the Bank Account balance (e.g. ₹15,000 -> ₹8,200)
    await prisma.account.update({
      where: { id: data.fromAccountId },
      data: {
        balance: {
          decrement: total,
        },
      },
    });

    // 2. Ensure a Rent/Housing category exists if categoryId is omitted
    let categoryId = data.categoryId;
    if (!categoryId) {
      const rentCat = await prisma.category.findFirst({
        where: { name: { contains: 'Rent', mode: 'insensitive' }, deletedAt: null },
      });
      if (rentCat) {
        categoryId = rentCat.id;
      }
    }

    // 3. Create the AmortizedSchedule record
    const schedule = await (prisma as any).amortizedSchedule.create({
      data: {
        title: data.title,
        totalAmount: total,
        dailyAmount,
        remainingAsset: total,
        startDate: start,
        endDate: end,
        fromAccountId: data.fromAccountId,
        categoryId: categoryId || null,
        active: true,
      },
    });

    // 4. Auto-post daily entries up to today
    await checkAndPostAmortizedExpenses();

    revalidatePath('/overview');
    revalidatePath('/expenses');
    revalidatePath('/savings');
    revalidatePath('/settings');

    return { success: true, scheduleId: schedule.id, dailyAmount, daysCount };
  } catch (error: any) {
    console.error('Failed to create amortized schedule:', error);
    return { success: false, error: error?.message || 'Failed to create rent amortization schedule' };
  }
}

export async function checkAndPostAmortizedExpenses() {
  try {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const today = new Date(todayStr);

    // Fetch active amortized schedules
    const activeSchedules = await (prisma as any).amortizedSchedule.findMany({
      where: {
        active: true,
        startDate: { lte: now },
      },
      include: {
        fromAccount: true,
        category: true,
      },
    });

    let postedCount = 0;

    for (const schedule of activeSchedules) {
      // Start loop from lastPostedDate + 1 day, or startDate
      let current = new Date(schedule.lastPostedDate ? new Date(schedule.lastPostedDate) : schedule.startDate);
      if (schedule.lastPostedDate) {
        current.setDate(current.getDate() + 1);
      }

      const scheduleEnd = new Date(schedule.endDate);
      let remaining = Number(schedule.remainingAsset);
      const dailyAmt = Number(schedule.dailyAmount);

      while (current <= today && current <= scheduleEnd && remaining > 0) {
        const dateStr = current.toISOString().slice(0, 10);
        const postAmt = Math.min(dailyAmt, remaining);

        // Check if an entry for this schedule on this date already exists
        const existingTx = await prisma.transaction.findFirst({
          where: {
            description: `${schedule.title} (Daily Amortized)`,
            date: {
              gte: new Date(`${dateStr}T00:00:00.000Z`),
              lte: new Date(`${dateStr}T23:59:59.999Z`),
            },
            deletedAt: null,
          },
        });

        if (!existingTx) {
          // Post daily expense entry without deducting bank balance (since lump sum was already deducted from bank)
          await prisma.transaction.create({
            data: {
              description: `${schedule.title} (Daily Amortized)`,
              amount: postAmt,
              date: new Date(`${dateStr}T12:00:00.000Z`),
              fromAccountId: schedule.fromAccountId || (await getFirstAccountId()),
              categoryId: schedule.categoryId,
              notes: `Auto-amortized daily rent/PG charge from ₹${Number(schedule.totalAmount)} total prepayment.`,
              status: 'CONFIRMED',
              intent: 'NEED',
            },
          });

          remaining = Math.max(remaining - postAmt, 0);
          postedCount++;

          await (prisma as any).amortizedSchedule.update({
            where: { id: schedule.id },
            data: {
              remainingAsset: remaining,
              lastPostedDate: current,
              active: remaining > 0,
            },
          });
        }

        // Advance to next day
        current.setDate(current.getDate() + 1);
      }
    }

    if (postedCount > 0) {
      revalidatePath('/overview');
      revalidatePath('/expenses');
    }

    return { success: true, postedCount };
  } catch (error: any) {
    console.error('Failed to post amortized expenses:', error);
    return { success: false, error: error?.message || 'Failed to auto-post daily rent expense' };
  }
}

export async function getAmortizedSchedules() {
  try {
    // Ensure daily auto-post runs on fetch
    await checkAndPostAmortizedExpenses();

    const schedules = await (prisma as any).amortizedSchedule.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        fromAccount: true,
        category: true,
      },
    });

    return schedules.map((s: any) => ({
      id: s.id,
      title: s.title,
      totalAmount: Number(s.totalAmount),
      dailyAmount: Number(s.dailyAmount),
      remainingAsset: Number(s.remainingAsset),
      startDate: s.startDate.toISOString().slice(0, 10),
      endDate: s.endDate.toISOString().slice(0, 10),
      lastPostedDate: s.lastPostedDate ? s.lastPostedDate.toISOString().slice(0, 10) : null,
      accountName: s.fromAccount?.name || 'Bank Account',
      categoryName: s.category?.name || 'Rent',
      active: s.active,
    }));
  } catch (error) {
    console.error('Failed to fetch amortized schedules:', error);
    return [];
  }
}

async function getFirstAccountId(): Promise<string> {
  const acc = await prisma.account.findFirst({ where: { deletedAt: null } });
  return acc?.id || '';
}
