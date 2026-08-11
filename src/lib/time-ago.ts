import { formatDistanceToNow } from 'date-fns';

export function timeAgo(date: string | Date): string {
  const d = new Date(date);
  const diffInSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffInSec < 10) return 'Just now';
  return formatDistanceToNow(d, { addSuffix: true });
}
