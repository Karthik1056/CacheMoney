import { getBillsData } from '@/app/actions/bills';
import { ResponsiveRouteShell } from '@/components/responsive-route-shell';
import { BillsScreen } from '@/components/bills-screen';

export const dynamic = 'force-dynamic';

export default async function BillsPage() {
  const data = await getBillsData();

  return (
    <ResponsiveRouteShell
      active="bills"
      title="Bills & Utilities"
      subtitle="Track recurring bills, set due date reminders, and auto-sync payments."
    >
      <BillsScreen data={data} />
    </ResponsiveRouteShell>
  );
}
