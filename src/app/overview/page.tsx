import { ResponsiveRouteShell } from '@/components/responsive-route-shell';
import { OverviewWebPage } from '@/components/web-screens';
import { getOverviewData } from '@/app/actions/overview';
import { getUnreadCount } from '@/app/actions/notifications';

export default async function Page({
  searchParams,
}: {
  searchParams?: { month?: string };
}) {
  const selectedMonth = searchParams?.month;
  const [data, unreadCount] = await Promise.all([
    getOverviewData(selectedMonth),
    getUnreadCount(),
  ]);

  return (
    <ResponsiveRouteShell
      active="overview"
      title="Overview"
      subtitle="A web-first interpretation of the dashboard, tuned for both mobile and desktop."
      hasUnread={unreadCount > 0}
    >
      <OverviewWebPage data={data} />
    </ResponsiveRouteShell>
  );
}
