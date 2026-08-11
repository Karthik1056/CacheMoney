import { ResponsiveRouteShell } from '@/components/responsive-route-shell';
import { SavingsWebPage } from '@/components/web-screens';
import { getSavingsData } from '@/app/actions/savings';
import { AddGoalDialog } from '@/components/manage-data-dialogs';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const data = await getSavingsData();

  return (
    <ResponsiveRouteShell
      active="savings"
      title="Savings"
      subtitle="Track your savings goals and monthly budget."
      headerAction={<AddGoalDialog />}
    >
      <SavingsWebPage data={data} />
    </ResponsiveRouteShell>
  );
}
