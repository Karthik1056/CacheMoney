import { NextResponse } from 'next/server';
import { checkAndSendTomorrowReminders } from '@/app/actions/whatsapp-reminders';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await checkAndSendTomorrowReminders();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await checkAndSendTomorrowReminders();
  return NextResponse.json(result);
}
