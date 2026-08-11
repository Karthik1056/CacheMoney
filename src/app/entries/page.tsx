import { ResponsiveRouteShell } from '@/components/responsive-route-shell';
import { EntriesWebPage } from '@/components/web-screens';
import { getEntries, getFilterOptions } from '@/app/actions/entries';
import { getAccounts } from '@/app/actions/manage';
import { getCategories } from '@/app/actions/manage';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    search?: string;
    category?: string;
    account?: string;
    status?: string;
    page?: string;
  };
}) {
  const [entriesData, filterOptions, accounts, categories] = await Promise.all([
    getEntries({
      search: searchParams?.search,
      categoryId: searchParams?.category,
      accountId: searchParams?.account,
      status: searchParams?.status,
      page: searchParams?.page ? parseInt(searchParams.page, 10) : 1,
    }),
    getFilterOptions(),
    getAccounts(),
    getCategories(),
  ]);

  return (
    <ResponsiveRouteShell
      active="entries"
      title="Entries"
      subtitle="All your transactions in one place."
      headerAction={
        <AddTransactionDialog accounts={accounts} categories={categories} />
      }
    >
      <EntriesWebPage data={entriesData} filters={filterOptions} />
    </ResponsiveRouteShell>
  );
}
