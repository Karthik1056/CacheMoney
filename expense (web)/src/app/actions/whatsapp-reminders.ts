'use server';

import { prisma } from '@/lib/prisma';
import { sendWhatsAppNotification } from '@/lib/whatsapp-notifier';
import { format } from 'date-fns';

export async function checkAndSendTomorrowReminders(phone?: string, apiKey?: string) {
  try {
    const now = new Date();
    
    // Define "Tomorrow" start & end boundaries
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59);

    // Find all active reminders due tomorrow
    const upcomingReminders = await prisma.subscription.findMany({
      where: {
        active: true,
        deletedAt: null,
        nextBilling: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
      },
    });

    if (upcomingReminders.length === 0) {
      return {
        success: true,
        count: 0,
        message: 'No reminders due tomorrow.',
      };
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const reminder of upcomingReminders) {
      const formattedDate = format(new Date(reminder.nextBilling), 'dd MMM yyyy');
      const amountStr = Number(reminder.amount) > 0 ? `₹${Number(reminder.amount).toLocaleString('en-IN')}` : 'N/A';
      
      const message = 
        `⏰ *REMINDER ALERT (Due Tomorrow!)*\n\n` +
        `📌 *Title*: ${reminder.name}\n` +
        `🏷️ *Category*: ${reminder.category || 'General'}\n` +
        `📅 *Due Date*: ${formattedDate}\n` +
        `🔄 *Frequency*: ${reminder.cycle}\n` +
        (Number(reminder.amount) > 0 ? `💰 *Amount*: ${amountStr}\n` : '') +
        (reminder.notes ? `📝 *Notes*: ${reminder.notes}\n` : '') +
        `\n_Sent automatically by Expense Manager_`;

      const result = await sendWhatsAppNotification({ phone, apiKey, message });
      if (result.success) {
        sentCount++;
        // Also log an in-app notification
        await prisma.notification.create({
          data: {
            type: 'reminder_alert',
            title: `WhatsApp Alert Sent: ${reminder.name}`,
            subtitle: `Reminder due tomorrow (${formattedDate})`,
            icon: 'Bell',
          },
        });
      } else {
        errors.push(`Failed for "${reminder.name}": ${result.error}`);
      }
    }

    return {
      success: sentCount > 0,
      count: sentCount,
      totalDue: upcomingReminders.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Sent ${sentCount} WhatsApp reminder alert(s) for tomorrow.`,
    };
  } catch (error: any) {
    console.error('Error checking WhatsApp reminders:', error);
    return { success: false, error: error?.message || 'Failed to check reminders' };
  }
}

export async function sendTestWhatsAppAlert(phone: string, apiKey: string) {
  const testMessage = 
    `🔔 *Expense Manager - WhatsApp Bot Test*\n\n` +
    `✅ Your WhatsApp reminder notification system is connected and working perfectly!\n\n` +
    `You will receive automated daily alerts 1 day before your scheduled reminders.\n` +
    `📅 Date: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`;

  return await sendWhatsAppNotification({ phone, apiKey, message: testMessage });
}
