'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getNotifications() {
  try {
    const now = new Date();
    const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1. Find bills due within 1 day (or overdue) that are not paid
    const upcomingBills = await prisma.bill.findMany({
      where: {
        status: { in: ['DUE', 'OVERDUE'] },
        dueDate: { lte: oneDayAhead },
      },
    });

    // 2. Find subscriptions/reminders due within 1 day
    const upcomingSubscriptions = await prisma.subscription.findMany({
      where: {
        active: true,
        deletedAt: null,
        nextBilling: { lte: oneDayAhead },
      },
    });

    // 3. Create missing notifications for bills due soon / 1 day before
    for (const bill of upcomingBills) {
      const isOverdue = new Date(bill.dueDate) < now;
      const title = isOverdue ? `Bill Overdue: ${bill.title}` : `Bill Due Soon: ${bill.title}`;
      const subtitle = `Amount: ₹${Number(bill.amount).toLocaleString('en-IN')} | Due: ${new Date(bill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;

      const exists = await prisma.notification.findFirst({
        where: {
          title,
          subtitle,
        },
      });

      if (!exists) {
        await prisma.notification.create({
          data: {
            type: 'subscription_due',
            title,
            subtitle,
            icon: 'FileText',
          },
        });
      }
    }

    // 4. Create missing notifications for subscriptions/reminders due soon / 1 day before
    for (const sub of upcomingSubscriptions) {
      const isOverdue = new Date(sub.nextBilling) < now;
      const title = isOverdue ? `Reminder Overdue: ${sub.name}` : `Reminder Due Soon: ${sub.name}`;
      const subtitle = `${sub.category || 'General'} | Due: ${new Date(sub.nextBilling).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;

      const exists = await prisma.notification.findFirst({
        where: {
          title,
          subtitle,
        },
      });

      if (!exists) {
        await prisma.notification.create({
          data: {
            type: 'subscription_due',
            title,
            subtitle,
            icon: 'Bell',
          },
        });
      }
    }

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    return notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      subtitle: n.subtitle,
      icon: n.icon,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

export async function getUnreadCount() {
  try {
    await getNotifications();
    return await prisma.notification.count({ where: { read: false } });
  } catch (error) {
    console.error('Failed to fetch unread count:', error);
    return 0;
  }
}

export async function markNotificationRead(id: string) {
  try {
    await prisma.notification.update({ where: { id }, data: { read: true } });
    revalidatePath('/notifications');
    return { success: true };
  } catch (error) {
    console.error('Failed to mark notification read:', error);
    return { success: false };
  }
}

export async function markAllRead() {
  try {
    await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
    revalidatePath('/notifications');
    return { success: true };
  } catch (error) {
    console.error('Failed to mark all notifications read:', error);
    return { success: false };
  }
}

export async function deleteNotification(id: string) {
  try {
    await prisma.notification.delete({ where: { id } });
    revalidatePath('/notifications');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return { success: false };
  }
}

export async function createNotification(data: {
  type: string;
  title: string;
  subtitle: string;
  icon: string;
}) {
  try {
    await prisma.notification.create({ data });
    revalidatePath('/notifications');
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
