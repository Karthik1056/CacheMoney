'use server';

import { prisma } from '@/lib/prisma';

export async function getReminders() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { active: true, deletedAt: null },
      orderBy: { nextBilling: 'asc' },
    });

    return subscriptions.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      category: sub.category || 'General',
      amount: Number(sub.amount || 0),
      cycle: sub.cycle || 'MONTHLY',
      nextBilling: sub.nextBilling.toISOString(),
      createdAt: sub.createdAt.toISOString(),
      notes: sub.notes || null,
      logoUrl: sub.logoUrl,
    }));
  } catch (error) {
    console.error('Failed to fetch reminders:', error);
    return [];
  }
}
