import { ResponsiveRouteShell } from '@/components/responsive-route-shell';
import { ExpensesWebPage } from '@/components/web-screens';
import { getExpensesData, getAnalyticsData } from '@/app/actions/expenses';
import { getAccounts, getCategories } from '@/app/actions/manage';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';

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
  let activeTab: 'spends' | 'categories' | 'reports' = 'spends';
  if (searchParams?.tab === 'categories') activeTab = 'categories';
  if (searchParams?.tab === 'reports') activeTab = 'reports';

  const [data, analyticsData, accounts, categories] = await Promise.all([
    getExpensesData(searchParams?.month, searchParams?.date),
    getAnalyticsData(),
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
