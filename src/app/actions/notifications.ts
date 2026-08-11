'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getNotifications() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
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
