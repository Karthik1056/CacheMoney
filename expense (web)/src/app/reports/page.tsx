import { ResponsiveRouteShell } from '@/components/responsive-route-shell';
import { getAccounts, getCategories } from "@/app/actions/manage";
import { SettingsReportsSection } from "@/components/settings-reports";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const [accounts, categories] = await Promise.all([
    getAccounts(),
    getCategories(),
  ]);

  return (
    <ResponsiveRouteShell
      active="reports"
      title="Reports & Analytics"
      subtitle="Interactive spending, expense, reminder, and bill charts with multi-filter controls."
    >
      <div className="space-y-6">
        <SettingsReportsSection accounts={accounts} categories={categories} />
      </div>
    </ResponsiveRouteShell>
  );
}
