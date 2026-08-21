import { ResponsiveRouteShell } from '@/components/responsive-route-shell';
import { RemindersWebPage } from '@/components/web-screens';
import { getReminders } from '@/app/actions/reminders';
import { AddSubscriptionDialog } from '@/components/manage-data-dialogs';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const reminders = await getReminders();

  return (
    <ResponsiveRouteShell
      active="reminders"
      title="Reminders"
      subtitle="Manage your recurring bills and subscriptions."
      headerAction={<AddSubscriptionDialog />}
    >
      <RemindersWebPage data={reminders} />
    </ResponsiveRouteShell>
  );
}
