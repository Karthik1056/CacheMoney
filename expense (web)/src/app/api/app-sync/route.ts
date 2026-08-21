import { NextResponse } from 'next/server';
import { getOverviewData } from '@/app/actions/overview';
import { getExpensesData } from '@/app/actions/expenses';
import { getBillsData } from '@/app/actions/bills';
import { getSavingsData } from '@/app/actions/savings';
import { getNotifications } from '@/app/actions/notifications';
import { getEntries } from '@/app/actions/entries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || undefined;

    const [overview, expenses, bills, savings, notifications, entries] = await Promise.all([
      getOverviewData(month),
      getExpensesData(),
      getBillsData(),
      getSavingsData(),
      getNotifications(),
      getEntries(),
    ]);

    return NextResponse.json({
      source: 'expense-manager-mobile-app',
      overview,
      expenses,
      bills,
      savings,
      notifications,
      entries,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch mobile app sync data' }, { status: 500 });
  }
}
