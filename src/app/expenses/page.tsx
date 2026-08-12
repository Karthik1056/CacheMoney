import { ResponsiveRouteShell } from '@/components/responsive-route-shell';
import { ExpensesWebPage } from '@/components/web-screens';
import { getExpensesData, getAnalyticsData } from '@/app/actions/expenses';
import { getAccounts, getCategories } from '@/app/actions/manage';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    tab?: string;
    month?: string;
    date?: string;
  };
}) {
  let activeTab: 'spends' | 'categories' = 'spends';
  if (searchParams?.tab === 'categories') activeTab = 'categories';

  const targetDateStr = searchParams?.date;
  const targetMonthStr = searchParams?.month ?? (targetDateStr ? targetDateStr.substring(0, 7) : format(new Date(), 'yyyy-MM'));

  const [data, analyticsData, accounts, categories] = await Promise.all([
    getExpensesData(targetMonthStr, targetDateStr),
    getAnalyticsData(undefined, targetMonthStr, targetDateStr),
    getAccounts(),
    getCategories(),
  ]);

  return (
    <ResponsiveRouteShell
      active="expenses"
      title="Expenses"
      subtitle="Track and log your spending with interactive analytics."
      headerAction={
        <AddTransactionDialog accounts={accounts} categories={categories} />
      }
    >
      <ExpensesWebPage
        activeTab={activeTab}
        data={data}
        analyticsData={analyticsData}
        accounts={accounts}
        categories={categories}
      />
    </ResponsiveRouteShell>
  );
}
