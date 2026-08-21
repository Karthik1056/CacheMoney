import { ResponsiveRouteShell } from '@/components/responsive-route-shell';
import { NotificationsWebPage } from '@/components/web-screens';
import { getNotifications, getUnreadCount } from '@/app/actions/notifications';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(),
    getUnreadCount(),
  ]);

  return (
    <ResponsiveRouteShell
      active="notifications"
      title="Notifications"
      subtitle="The activity feed translated into a desktop and mobile friendly web pattern."
      hasUnread={unreadCount > 0}
    >
      <NotificationsWebPage data={notifications} unreadCount={unreadCount} />
    </ResponsiveRouteShell>
  );
}
