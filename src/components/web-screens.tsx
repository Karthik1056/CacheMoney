'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  MoreHorizontal,
  Sparkles,
  Wallet,
  ListOrdered,
  Plus,
  SlidersHorizontal,
  Filter,
  RotateCcw,
  X,
  type LucideIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import { AnalyticsCharts } from '@/components/analytics-charts';
import { OverviewInteractiveLineChart } from '@/components/overview-line-chart';
import { OverviewRadialChart } from '@/components/overview-radial-chart';
import { ExpensesCalendar } from '@/components/calendar';
import { FilterDrawer } from '@/components/filter-drawer';
import { SearchBar } from '@/components/search-bar';
import { getIcon } from '@/lib/icon-map';
import { timeAgo } from '@/lib/time-ago';
import { cn } from '@/lib/utils';
import { markAllRead, markNotificationRead, deleteNotification } from '@/app/actions/notifications';
import {
  DeleteSubscriptionButton,
  DeleteGoalButton,
  EditGoalDialog,
  DeleteTransactionButton,
  AddGoalDialog,
  AddSubscriptionDialog,
  BudgetSalaryDialog,
} from '@/components/manage-data-dialogs';
import { EditTransactionDialog } from '@/components/edit-transaction-dialog';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { AddAmortizedRentDialog } from '@/components/add-amortized-rent-dialog';

import { TransactionDetailDialog, type TransactionItem } from '@/components/transaction-detail-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card className={cn('overflow-hidden bg-[#111a25]/95 shadow-[0_16px_30px_rgba(0,0,0,0.22)] border-white/10', className)}>
      <CardContent className="p-4 sm:p-5">{children}</CardContent>
    </Card>
  );
}

export function SectionLabel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <div className="text-[12px] uppercase tracking-[0.24em] text-white/40 sm:text-[13px]">{title}</div>
      {subtitle ? <div className="mt-1 hidden text-[13px] leading-6 text-white/60 sm:block sm:text-[14px]">{subtitle}</div> : null}
    </div>
  );
}

function MetricCard({
  title,
  value,
  Icon,
  accent = false,
}: {
  title: string;
  value: string;
  Icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-[22px] border p-4 sm:rounded-[26px] sm:p-5',
        accent
          ? 'border-[#2f56ff]/40 bg-[linear-gradient(180deg,#3058ff_0%,#2445f6_100%)] shadow-[0_18px_30px_rgba(47,86,255,0.26)]'
          : 'border-white/10 bg-[#16212d]',
      )}
    >
      <div className="flex items-center justify-between">
        <Icon size={22} strokeWidth={2} className={accent ? 'text-white' : 'text-white/90'} />
        <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', accent ? 'bg-white/65' : 'bg-white/25')} />
      </div>
      <div className="mt-6 text-[13px] text-white/70 sm:mt-8 sm:text-[14px]">{title}</div>
      <div className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white sm:mt-3 sm:text-[26px]">{value}</div>
    </div>
  );
}

function EntryRow({
  icon: Icon,
  iconColor,
  title,
  date,
  amount,
  method,
  isIncome = false,
  receiptUrl,
  editDialog,
}: {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  date: string;
  amount: string;
  method: string;
  isIncome?: boolean;
  receiptUrl?: string | null;
  editDialog?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5 border-b border-white/8 py-3 last:border-b-0 sm:gap-4 sm:py-4">
      <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] text-white sm:h-11 sm:w-11"
          style={{ backgroundColor: iconColor || '#4a5665' }}
        >
          <Icon size={16} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold leading-snug text-white truncate sm:text-[16px]">{title}</div>
          <div className="mt-0.5 text-[11px] text-white/55 truncate sm:text-[12px]">{date}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <div
            className={cn(
              'text-[13px] font-semibold leading-tight sm:text-[15px]',
              isIncome ? 'text-emerald-400' : 'text-white',
            )}
          >
            {isIncome ? `+ ${amount}` : `- ${amount}`}
          </div>
          <div className="mt-0.5 text-[11px] text-white/55 truncate max-w-[90px] sm:max-w-none sm:text-[12px]">{method}</div>
        </div>
        {editDialog}
      </div>
    </div>
  );
}

function ReminderRow({
  id,
  title,
  category = 'General',
  amount,
  cycle,
  due,
  notes,
}: {
  id: string;
  title: string;
  category?: string;
  amount?: number;
  cycle?: string;
  due: string;
  notes?: string | null;
}) {
  const isZeroAmount = !amount || amount <= 0;
  const cycleText = cycle === 'ONE_TIME' ? 'One-Time' : cycle ? cycle.toLowerCase() : 'One-Time';

  return (
    <Alert variant="warning" className="my-2.5 border-white/10 bg-[#141f2c] p-4 rounded-[20px]">
      <Bell size={18} className="text-amber-400 mt-1 shrink-0" />
      <div className="flex items-start justify-between gap-3 pl-2 w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[16px] font-bold text-white">{title}</span>
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 text-[11px] px-2.5 py-0.5 rounded-full">
              {category}
            </Badge>
            <Badge variant="outline" className="border-white/15 bg-white/5 text-white/70 text-[11px] px-2.5 py-0.5 rounded-full">
              {cycleText}
            </Badge>
          </div>
          <AlertDescription className="mt-1.5 text-[13px] text-white/70 flex flex-wrap items-center gap-3">
            <span>Remind Date: <strong className="text-white">{due}</strong></span>
            {!isZeroAmount && (
              <span className="text-emerald-400 font-semibold">• ₹{amount?.toLocaleString('en-IN')}</span>
            )}
            {notes && <span className="text-white/55 font-normal italic">• "{notes}"</span>}
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DeleteSubscriptionButton id={id} />
        </div>
      </div>
    </Alert>
  );
}

function NotificationRow({
  id,
  type,
  icon: Icon,
  title,
  subtitle,
  time,
  read,
}: {
  id: string;
  type?: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  time: string;
  read?: boolean;
}) {
  const router = useRouter();

  const handleRowClick = async () => {
    if (!read) {
      await markNotificationRead(id);
    }
    const lowerTitle = title.toLowerCase();
    const lowerType = (type || '').toLowerCase();

    if (lowerTitle.includes('bill') || lowerType.includes('bill')) {
      router.push('/bills');
    } else if (lowerTitle.includes('reminder') || lowerType.includes('subscription')) {
      router.push('/reminders');
    } else if (lowerTitle.includes('expense') || lowerTitle.includes('spending')) {
      router.push('/expenses');
    } else {
      router.push('/entries');
    }
  };

  return (
    <Alert
      variant={read ? 'default' : 'info'}
      onClick={handleRowClick}
      className="my-2.5 cursor-pointer transition-all hover:bg-white/10 hover:border-white/20"
    >
      <Icon size={18} />
      <div className="flex items-start justify-between gap-3 pl-2 w-full">
        <div className="flex-1 min-w-0">
          <AlertTitle className="text-[15px] font-bold text-white flex items-center gap-2">
            <span>{title}</span>
            {!read ? (
              <Badge className="bg-[#2f56ff] text-white text-[10px] px-1.5 py-0 h-4">
                NEW
              </Badge>
            ) : null}
          </AlertTitle>
          <AlertDescription className="mt-0.5 text-[13px] text-white/70">
            {subtitle}
            <span className="block mt-1 text-[11px] text-white/45">{time}</span>
          </AlertDescription>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="text-white/55 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-white/10 bg-[#111a25] text-white">
              <DropdownMenuItem onClick={() => markNotificationRead(id)} className="focus:bg-white/10">
                Mark Read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteNotification(id)} className="text-red-400 focus:bg-white/10 focus:text-red-400">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Alert>
  );
}

function ProgressBar({ label, left, right, value }: { label: string; left: string; right: string; value: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[14px] sm:text-[15px]">
        <div className="font-medium text-white">{label}</div>
        <div className="text-white/55">
          {left} / {right}
        </div>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-white/10 sm:mt-2">
        <div className="h-2 rounded-full bg-[#2f56ff] transition-all" style={{ width: value }} />
      </div>
    </div>
  );
}

function GaugeCard({
  breakdown = [],
}: {
  breakdown?: Array<{ name: string; color: string; percentage: number; total?: number }>;
}) {
  if (breakdown.length === 0) {
    return (
      <Card className="border-white/10 bg-[#111a25]/95 shadow-xl rounded-[24px]">
        <CardHeader className="pb-2 px-5 pt-5">
          <CardTitle className="text-[17px] font-bold text-white">Categories</CardTitle>
          <CardDescription className="text-[13px] text-white/50 mt-0.5">This month's expense split by category</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-6">
          <div className="py-10 text-center text-[14px] text-white/40">
            No category expenses logged for this month yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = breakdown.reduce((s, i) => s + (i.total ?? 0), 0);

  return (
    <Card className="border-white/10 bg-[#111a25]/95 shadow-xl rounded-[24px]">
      <CardHeader className="pb-2 px-5 pt-5">
        <CardTitle className="text-[17px] font-bold text-white">Categories</CardTitle>
        <CardDescription className="text-[13px] text-white/50 mt-0.5">
          This month's expense split by category
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-5 pt-1">
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          {/* Compact Donut chart */}
          <div className="shrink-0 relative h-[140px] w-[140px] sm:h-[150px] sm:w-[150px] my-1">
            <svg viewBox="0 0 150 150" className="h-full w-full -rotate-90">
              {/* Background ring */}
              <circle cx="75" cy="75" r={58} fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth={16} />
              {(() => {
                let offset = 0;
                const r = 58;
                const circ = 2 * Math.PI * r;
                return breakdown.map((item) => {
                  const dash = (item.percentage / 100) * circ;
                  const el = (
                    <circle
                      key={item.name}
                      cx="75" cy="75" r={r}
                      fill="transparent"
                      stroke={item.color || '#64748b'}
                      strokeWidth={16}
                      strokeDasharray={`${dash} ${circ}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="butt"
                    />
                  );
                  offset += dash + 2;
                  return el;
                });
              })()}
            </svg>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-white/50 font-medium">Top</span>
              <span className="text-[18px] font-bold text-white leading-none">{breakdown.length}</span>
              <span className="text-[10px] text-white/50 font-medium">cats</span>
            </div>
          </div>

          {/* Scrollable Legend list */}
          <div className="flex-1 space-y-2.5 w-full max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
            {breakdown.map((item) => {
              const amtStr = item.total != null
                ? `₹${item.total.toLocaleString('en-IN')}`
                : '';
              const pct = item.percentage;
              return (
                <div key={item.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-2 sm:p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[12px] font-semibold text-white/90 truncate max-w-[120px] sm:max-w-[140px]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {amtStr && <span className="text-[11px] text-white/55 font-medium">{amtStr}</span>}
                      <span className="text-[12px] font-bold text-[#2f56ff]">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SavingsRing({
  value = 0,
  spentPercentage = 0,
  totalBudget = 0,
}: {
  value?: number;
  spentPercentage?: number;
  totalBudget?: number;
}) {
  const clampedPct = Math.min(spentPercentage, 100);
  const isOver = spentPercentage > 100;
  const ringColor = isOver ? '#ef4444' : clampedPct > 80 ? '#f59e0b' : '#2f56ff';

  // Build donut arc data: [spent, remaining]
  const r = 70;
  const circ = 2 * Math.PI * r;
  const spentDash = (clampedPct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-[160px] w-[160px]">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          {/* Track */}
          <circle cx="80" cy="80" r={r} fill="transparent" stroke="rgba(255,255,255,0.07)" strokeWidth={16} />
          {/* Spent arc */}
          {clampedPct > 0 && (
            <circle
              cx="80" cy="80" r={r}
              fill="transparent"
              stroke={ringColor}
              strokeWidth={16}
              strokeDasharray={`${spentDash} ${circ - spentDash}`}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${ringColor}88)` }}
            />
          )}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-medium text-white/50 mb-0.5">Spent</span>
          <span className="text-[22px] font-bold text-white leading-none">{clampedPct}%</span>
          {totalBudget > 0 && (
            <span className="text-[11px] text-white/40 mt-1">of budget</span>
          )}
        </div>
      </div>
      <div className="text-center">
        <div className="text-[20px] font-bold text-white">
          ₹{value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
        <div className="text-[12px] text-white/50 mt-0.5">
          {totalBudget > 0
            ? `of ₹${totalBudget.toLocaleString('en-IN')} budget`
            : 'total spend this month'}
        </div>
      </div>
    </div>
  );
}

function TabHeader({ active }: { active: 'spends' | 'categories' }) {
  return (
    <Tabs value={active} className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 rounded-[22px] border border-white/10 bg-[#16212d] p-1.5 sm:rounded-[24px] sm:p-2">
        <TabsTrigger asChild value="spends" className={cn(active !== 'spends' && 'bg-transparent text-white/55')}>
          <Link href="/expenses?tab=spends">Spends</Link>
        </TabsTrigger>
        <TabsTrigger asChild value="categories" className={cn(active !== 'categories' && 'bg-transparent text-white/55')}>
          <Link href="/expenses?tab=categories">Categories</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function SmallAction({ title, icon: Icon, href, active = false }: { title: string; icon: LucideIcon; href: string; active?: boolean }) {
  return (
    <Button
      asChild
      variant={active ? 'default' : 'outline'}
      className={cn(
        'h-auto rounded-2xl px-3 py-2.5 text-[14px] font-semibold sm:px-4 sm:py-3 sm:text-[15px]',
        active
          ? 'bg-[linear-gradient(180deg,#3058ff_0%,#2445f6_100%)] text-white shadow-[0_14px_24px_rgba(47,86,255,0.28)]'
          : 'border-white/8 bg-white/5 text-white/75 hover:bg-white/10',
      )}
    >
      <Link href={href}>
        <Icon size={17} strokeWidth={2.1} />
        {title}
      </Link>
    </Button>
  );
}

function CategoryDonutRing({
  netBalance = 0,
  breakdown = [],
}: {
  netBalance?: number;
  breakdown?: Array<{ id: string; name: string; color: string; percentage: number; spent: number }>;
}) {
  const [hoveredCategory, setHoveredCategory] = useState<{ name: string; color: string; spent: number; percentage: number } | null>(null);

  const formattedBalance = `₹${netBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const radius = 60;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  const totalSpentInBreakdown = breakdown.reduce((sum, item) => sum + item.spent, 0);
  const startingTotal = netBalance + totalSpentInBreakdown;

  // Build complete donut items including remaining Net Balance
  const displayItems = breakdown
    .filter((item) => item.spent > 0)
    .map((item) => ({
      ...item,
      percentage: startingTotal > 0 ? (item.spent / startingTotal) * 100 : 0,
    }));

  const remainingBalancePercentage = startingTotal > 0 ? (netBalance / startingTotal) * 100 : 100;
  if (remainingBalancePercentage > 0) {
    displayItems.unshift({
      id: 'net-balance-slice',
      name: 'Remaining Balance',
      color: '#2f56ff',
      spent: netBalance,
      percentage: remainingBalancePercentage,
    });
  }

  let cumulativePercentage = 0;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative flex h-[180px] w-[180px] items-center justify-center sm:h-[200px] sm:w-[200px]">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
          {displayItems.map((item) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
            cumulativePercentage += item.percentage;

            return (
              <circle
                key={item.name}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={item.color || '#2f56ff'}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-300 hover:opacity-85 hover:stroke-[18px]"
                onMouseEnter={() => setHoveredCategory(item)}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            );
          })}
        </svg>

        {/* Center Hover / Net Balance Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center pointer-events-none">
          {hoveredCategory ? (
            <div className="animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                {hoveredCategory.name}
              </div>
              <div className="text-[18px] font-bold text-white sm:text-[20px]">
                ₹{hoveredCategory.spent.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] font-semibold text-emerald-400">
                {hoveredCategory.percentage.toFixed(1)}% share
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-white/45">
                Net Balance
              </div>
              <div className="text-[18px] font-bold tracking-tight text-white sm:text-[22px]">
                {formattedBalance}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Hover Pills / Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-2 text-[12px]">
        {displayItems.map((item) => (
          <div
            key={item.name}
            onMouseEnter={() => setHoveredCategory(item)}
            onMouseLeave={() => setHoveredCategory(null)}
            className={cn(
              'flex items-center gap-1.5 cursor-pointer rounded-full px-2.5 py-1 transition-all',
              hoveredCategory?.name === item.name ? 'bg-white/20 text-white font-medium scale-105' : 'text-white/70 hover:bg-white/10'
            )}
          >
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span>{item.name} ({item.percentage.toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 1. OVERVIEW PAGE ───
export function OverviewWebPage({
  data,
}: {
  data: {
    selectedMonth?: string;
    totalIncome: number;
    totalExpense: number;
    totalBudget: number;
    netBalance: number;
    momChange: number;
    dailyTrends?: Array<{ date: string; Income: number; Expense: number }>;
    latestTransactions: Array<{
      id: string;
      description: string;
      amount: number;
      date: string;
      categoryName: string;
      categoryIcon: string;
      categoryColor: string;
      accountName: string;
      isIncome: boolean;
    }>;
    latestSavings?: Array<{
      id: string;
      title: string;
      targetAmount: number;
      status: string;
    }>;
    latestReminders?: Array<{
      id: string;
      name: string;
      amount: number;
      cycle: string;
      nextBilling: string;
    }>;
    categoryBreakdown?: Array<{
      id: string;
      name: string;
      color: string;
      icon: string;
      spent: number;
      percentage: number;
    }>;
    budgetMeters: Array<{
      id: string;
      name: string;
      color: string;
      icon: string;
      spent: number;
      cap: number;
      percentage: number;
    }>;
  };
}) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'savings' | 'reminders' | 'budget'>('all');

  const latestSavingsList = data.latestSavings || [];
  const latestRemindersList = data.latestReminders || [];
  const categoryBreakdownList = data.categoryBreakdown || [];

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 3 Summary Cards matching Picture1.png (Horizontal Scroll on Mobile) */}
      {/* 3 Summary Cards matching Picture1.png (Mobile Optimized Grid) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Card 1: Total Salary / Income */}
        <div className="flex flex-col justify-between rounded-[20px] border border-white/10 bg-[#141d28] p-3 shadow-lg transition-all sm:rounded-[28px] sm:p-5">
          <div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white sm:h-10 sm:w-10 sm:rounded-2xl">
              <Wallet size={16} strokeWidth={2} className="sm:hidden" />
              <Wallet size={20} strokeWidth={2} className="hidden sm:block" />
            </div>
            <div className="mt-2 text-[10px] font-medium text-white/70 sm:mt-3 sm:text-[13px]">Total Salary</div>
          </div>
          <div className="mt-2 text-[13px] font-bold tracking-tight text-white sm:mt-4 sm:text-[24px]">
            ₹{data.totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card 2: Total Expense (Vibrant Blue Active Box Card) */}
        <div className="flex flex-col justify-between rounded-[20px] border border-blue-500/30 bg-[linear-gradient(145deg,#2c54ff_0%,#183cd4_100%)] p-3 text-white shadow-[0_10px_24px_rgba(44,84,255,0.38)] transition-all sm:rounded-[28px] sm:p-5">
          <div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm sm:h-10 sm:w-10 sm:rounded-2xl">
              <Wallet size={16} strokeWidth={2} className="sm:hidden" />
              <Wallet size={20} strokeWidth={2} className="hidden sm:block" />
            </div>
            <div className="mt-2 text-[10px] font-medium text-white/90 sm:mt-3 sm:text-[13px]">Total Expense</div>
          </div>
          <div className="mt-2 text-[13px] font-bold tracking-tight text-white sm:mt-4 sm:text-[24px]">
            ₹{data.totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card 3: Monthly Budget */}
        <div className="flex flex-col justify-between rounded-[20px] border border-white/10 bg-[#141d28] p-3 shadow-lg transition-all sm:rounded-[28px] sm:p-5">
          <div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white sm:h-10 sm:w-10 sm:rounded-2xl">
              <Wallet size={16} strokeWidth={2} className="sm:hidden" />
              <Wallet size={20} strokeWidth={2} className="hidden sm:block" />
            </div>
            <div className="mt-2 text-[10px] font-medium text-white/70 sm:mt-3 sm:text-[13px]">Monthly Budget</div>
          </div>
          <div className="mt-2 text-[13px] font-bold tracking-tight text-white sm:mt-4 sm:text-[24px]">
            ₹{data.totalBudget.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr] xl:gap-6">
        {/* Left Column: Balance Snapshot Donut Chart */}
        <Panel>
          <div className="flex items-center justify-between gap-4">
            <SectionLabel title="Balance snapshot" subtitle="Hover slices for category details." />
            <Badge variant="secondary" className="border-white/10 bg-white/5 text-white/75">
              Categories
            </Badge>
          </div>

          <div className="mt-4 flex flex-col items-center sm:mt-5">
            <CategoryDonutRing netBalance={data.netBalance} breakdown={categoryBreakdownList} />
          </div>
        </Panel>

        {/* Right Column: Top Category Budgets, Savings & Reminders (Top 5 Items) */}
        <Panel>
          <div className="flex items-center justify-between gap-4">
            <SectionLabel
              title={
                activeFilter === 'savings'
                  ? 'Recent Savings Goals'
                  : activeFilter === 'reminders'
                  ? 'Upcoming Reminders'
                  : 'Top Category Budgets'
              }
              subtitle="Showing top 5 activity records."
            />
          </div>

          {/* Filter Buttons */}
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-2.5">
            <Button
              type="button"
              variant={activeFilter === 'savings' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('savings')}
              className={cn(
                'h-auto rounded-2xl px-3 py-2 text-[13px] font-semibold sm:px-4 sm:py-2.5 sm:text-[14px]',
                activeFilter === 'savings'
                  ? 'bg-[linear-gradient(180deg,#3058ff_0%,#2445f6_100%)] text-white shadow-[0_10px_20px_rgba(47,86,255,0.28)]'
                  : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white',
              )}
            >
              <Wallet size={15} strokeWidth={2} />
              Savings
            </Button>
            <Button
              type="button"
              variant={activeFilter === 'reminders' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('reminders')}
              className={cn(
                'h-auto rounded-2xl px-3 py-2 text-[13px] font-semibold sm:px-4 sm:py-2.5 sm:text-[14px]',
                activeFilter === 'reminders'
                  ? 'bg-[linear-gradient(180deg,#3058ff_0%,#2445f6_100%)] text-white shadow-[0_10px_20px_rgba(47,86,255,0.28)]'
                  : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white',
              )}
            >
              <Bell size={15} strokeWidth={2} />
              Remind
            </Button>
            <Button
              type="button"
              variant={activeFilter === 'budget' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('budget')}
              className={cn(
                'h-auto rounded-2xl px-3 py-2 text-[13px] font-semibold sm:px-4 sm:py-2.5 sm:text-[14px]',
                activeFilter === 'budget'
                  ? 'bg-[linear-gradient(180deg,#3058ff_0%,#2445f6_100%)] text-white shadow-[0_10px_20px_rgba(47,86,255,0.28)]'
                  : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white',
              )}
            >
              <CreditCard size={15} strokeWidth={2} />
              Budget
            </Button>
          </div>

          {/* Top 5 In-Place Content Display */}
          <div className="mt-5 space-y-2">
            {activeFilter === 'all' && (
              data.latestTransactions.length > 0 ? (
                data.latestTransactions.slice(0, 5).map((tx) => (
                  <EntryRow
                    key={tx.id}
                    icon={getIcon(tx.categoryIcon)}
                    iconColor={tx.categoryColor}
                    title={tx.description || tx.categoryName}
                    date={format(new Date(tx.date), 'dd MMM yyyy')}
                    amount={`₹${tx.amount.toFixed(2)}`}
                    method={tx.accountName}
                    isIncome={tx.isIncome}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-[14px] text-white/45">No recent transactions found.</div>
              )
            )}

            {activeFilter === 'savings' && (
              latestSavingsList.length > 0 ? (
                latestSavingsList.slice(0, 5).map((goal) => (
                  <EntryRow
                    key={goal.id}
                    icon={Wallet}
                    iconColor="#10B981"
                    title={goal.title}
                    date={`Goal Target: ₹${goal.targetAmount.toLocaleString('en-IN')}`}
                    amount={`₹${goal.targetAmount.toLocaleString('en-IN')}`}
                    method={goal.status}
                    isIncome={true}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-[14px] text-white/45">No savings goals created yet.</div>
              )
            )}

            {activeFilter === 'reminders' && (
              latestRemindersList.length > 0 ? (
                latestRemindersList.slice(0, 5).map((rem) => (
                  <EntryRow
                    key={rem.id}
                    icon={Bell}
                    iconColor="#F59E0B"
                    title={rem.name}
                    date={`Next: ${format(new Date(rem.nextBilling), 'dd MMM yyyy')} (${rem.cycle})`}
                    amount={`₹${rem.amount.toFixed(2)}`}
                    method="Subscription"
                    isIncome={false}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-[14px] text-white/45">No active subscription reminders due.</div>
              )
            )}

            {activeFilter === 'budget' && (
              data.budgetMeters.length > 0 ? (
                data.budgetMeters.slice(0, 5).map((meter) => (
                  <EntryRow
                    key={meter.id}
                    icon={getIcon(meter.icon)}
                    iconColor={meter.color}
                    title={meter.name}
                    date={`${meter.percentage}% of cap used`}
                    amount={`₹${meter.spent.toFixed(0)} / ₹${meter.cap.toFixed(0)}`}
                    method="Budget Limit"
                    isIncome={false}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-[14px] text-white/45">No active category budgets configured.</div>
              )
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ─── 2. EXPENSES PAGE ───
export function ExpensesWebPage({
  activeTab,
  data,
  analyticsData,
  accounts = [],
  categories = [],
}: {
  activeTab: 'spends' | 'categories';
  data: {
    month: string;
    selectedDate?: string | null;
    transactionDates: string[];
    totalSpent: number;
    totalBudget: number;
    spentPercentage: number;
    categoryBreakdown: Array<{ name: string; color: string; percentage: number }>;
    transactions: Array<{
      id: string;
      description: string;
      amount: number;
      date: string;
      categoryName: string;
      categoryIcon: string;
      accountName: string;
      fromAccountId?: string;
      categoryId?: string | null;
      receiptUrl?: string | null;
      intent?: string;
      notes?: string | null;
      isIncome?: boolean;
    }>;
  };
  analyticsData?: {
    year: number;
    monthlyOverview: Array<{ month: string; Income: number; Expense: number }>;
    categoryDistribution: Array<{ name: string; value: number; color: string }>;
  };
  accounts?: Array<{ id: string; name: string; type: string }>;
  categories?: Array<{ id: string; name: string; icon: string | null; color: string | null; isIncome: boolean }>;
}) {
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr] xl:gap-6">
      <div className="space-y-4 sm:space-y-6">
        <Panel>
          <div className="flex items-center justify-between pb-2">
            <SectionLabel title="Calendar View" subtitle="Click any date to see transactions for that day." />
          </div>
          <ExpensesCalendar initialMonth={data.month} transactionDates={data.transactionDates} />
        </Panel>

        <Card className="border-white/10 bg-[#111a25]/95 shadow-xl rounded-[24px] overflow-hidden">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-[17px] font-bold text-white">Spend Total</CardTitle>
            <CardDescription className="text-[13px] text-white/50 mt-0.5">
              Your total spending vs allocated budget
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex justify-center py-2">
              <SavingsRing
                value={data.totalSpent}
                spentPercentage={data.spentPercentage}
                totalBudget={data.totalBudget}
              />
            </div>
            {data.totalBudget > 0 ? (
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-[12px] text-white/50">
                  <span>₹0</span>
                  <span>Budget: ₹{data.totalBudget.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(data.spentPercentage, 100)}%`,
                      backgroundColor: data.spentPercentage > 100 ? '#ef4444' : data.spentPercentage > 80 ? '#f59e0b' : '#2f56ff',
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-2 text-center text-[13px] text-white/40">No budget set for this month</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Panel>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <SectionLabel title="Expenses" subtitle="Switch between spends list and categories view." />
          <div className="flex items-center gap-2">
            <AddTransactionDialog
              accounts={accounts}
              categories={categories}
              trigger={
                <Button className="gap-2 bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white shadow-[0_8px_25px_rgba(47,86,255,0.4)] rounded-[16px] transition-all">
                  <Plus size={16} /> Add Entry
                </Button>
              }
            />
          </div>
        </div>

        <div className="mt-4 sm:mt-5">
          <TabHeader active={activeTab} />
        </div>

        {data.selectedDate && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#2f56ff]/15 border border-[#2f56ff]/30 px-4 py-2.5 text-white">
            <span className="text-[13px] font-medium">
              Filtered for: <strong className="text-white">{format(new Date(data.selectedDate), 'dd MMMM yyyy')}</strong>
            </span>
            <Link href={`/expenses?tab=${activeTab}`} className="text-[12px] underline text-white/80 hover:text-white">
              Clear filter
            </Link>
          </div>
        )}

        {activeTab === 'categories' ? (
          <div className="mt-4 sm:mt-5">
            <GaugeCard breakdown={data.categoryBreakdown} />
          </div>
        ) : (
          <div className="mt-5 space-y-1">
            {data.transactions.length > 0 ? (
              data.transactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="cursor-pointer rounded-[18px] transition-colors hover:bg-white/5"
                >
                  <EntryRow
                    icon={getIcon(tx.categoryIcon)}
                    title={tx.description || tx.categoryName}
                    date={format(new Date(tx.date), 'dd MMM yyyy')}
                    amount={`₹${tx.amount.toFixed(2)}`}
                    method={tx.accountName}
                    receiptUrl={tx.receiptUrl}
                    editDialog={
                      <div onClick={(e) => e.stopPropagation()}>
                        <EditTransactionDialog
                          transaction={tx}
                          accounts={accounts}
                          categories={categories}
                        />
                      </div>
                    }
                  />
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-[14px] text-white/45">
                {data.selectedDate ? 'No expenses logged on this date.' : 'No expenses logged for this period.'}
              </div>
            )}
          </div>
        )}
      </Panel>

      {/* Transaction Detail Card Popup */}
      <TransactionDetailDialog
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
}

// ─── 3. ENTRIES PAGE (PICTURE13.PNG CARD LIST UI) ───
export function EntriesWebPage({
  data,
  filters,
}: {
  data: {
    transactions: Array<{
      id: string;
      description: string;
      amount: number;
      date: string;
      status: string;
      intent: string;
      mood?: string | null;
      categoryName: string;
      categoryIcon: string;
      categoryColor: string;
      accountName: string;
      fromAccountId?: string;
      categoryId?: string | null;
      isIncome: boolean;
      receiptUrl?: string | null;
      notes?: string | null;
    }>;
    total: number;
    page: number;
    totalPages: number;
  };
  filters: {
    categories: Array<{ id: string; name: string }>;
    accounts: Array<{ id: string; name: string }>;
  };
}) {
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Panel>
        <div className="flex items-center justify-between gap-4">
          <SectionLabel title="Latest Entries" subtitle="Search and filter all your transactions." />
        </div>

        {/* Shadcn Filter Controls Header (Popup Modal Filter) */}
        <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center">
          <SearchBar />
          <FilterDrawer categories={filters.categories} accounts={filters.accounts} />
        </div>

        {/* Picture13.png Clean Entry Row List */}
        <div className="mt-6 space-y-2">
          {data.transactions.length > 0 ? (
            data.transactions.map((entry) => (
              <div
                key={entry.id}
                onClick={() => setSelectedTx(entry)}
                className="cursor-pointer rounded-[20px] border border-white/5 bg-[#16212d]/60 p-4 transition-all hover:border-white/15 hover:bg-[#16212d] shadow-sm"
              >
                <EntryRow
                  icon={getIcon(entry.categoryIcon)}
                  iconColor={entry.categoryColor}
                  title={entry.description || entry.categoryName}
                  date={format(new Date(entry.date), 'dd MMM yyyy')}
                  amount={`₹${entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  method={entry.accountName}
                  isIncome={entry.isIncome}
                  receiptUrl={entry.receiptUrl}
                  editDialog={
                    <div onClick={(e) => e.stopPropagation()}>
                      <EditTransactionDialog
                        transaction={entry}
                        accounts={filters.accounts}
                        categories={filters.categories}
                      />
                    </div>
                  }
                />
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-[14px] text-white/45">
              No transactions found matching your criteria.
            </div>
          )}
        </div>
      </Panel>

      {/* Transaction Detail Card Popup */}
      <TransactionDetailDialog
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        accounts={filters.accounts}
        categories={filters.categories}
      />
    </div>
  );
}

// ─── 4. SAVINGS PAGE ───
export function SavingsWebPage({
  data,
}: {
  data: {
    totalSavings: number;
    currentMonth: string;
    monthlyGoal: { cap: number; spent: number; categoryName: string } | null;
    goals: Array<{
      id: string;
      title: string;
      targetAmount: number;
      status: string;
      coolingUntil: string;
    }>;
  };
}) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const filteredGoals = data.goals.filter((g) => {
    const matchesStatus = statusFilter === 'ALL' || g.status.toUpperCase() === statusFilter.toUpperCase();
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeFilterCount = (statusFilter !== 'ALL' ? 1 : 0) + (searchTerm.trim() ? 1 : 0);

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr] xl:gap-6">
      <Panel>
        <div className="flex items-center justify-between gap-4">
          <SectionLabel title="Current Savings" subtitle="Total liquid asset balance." />
          <Badge variant="secondary" className="border-white/10 bg-white/5 text-white/75">
            {data.currentMonth}
          </Badge>
        </div>

        <div className="mt-5 flex justify-center sm:mt-6">
          <SavingsRing value={data.totalSavings} />
        </div>

        <div className="mt-5 rounded-[24px] border border-white/10 bg-[#16212d] p-4">
          <div className="flex items-center gap-2 text-[15px] font-semibold text-white sm:text-[16px]">
            <CalendarDays size={17} />
            <span>Goal for this Month</span>
          </div>
          <div className="mt-3 overflow-hidden rounded-[16px] bg-[#697785] sm:mt-4">
            <div className="flex h-10 w-full sm:h-11">
              <div className="flex w-1/2 items-center justify-center bg-[#2f56ff] text-[14px] font-semibold text-white sm:text-[15px]">
                ₹{data.monthlyGoal ? data.monthlyGoal.spent.toFixed(0) : '0'}
              </div>
              <div className="flex w-1/2 items-center justify-center text-[14px] font-semibold text-white sm:text-[15px]">
                ₹{data.monthlyGoal ? data.monthlyGoal.cap.toFixed(0) : '0'}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <SectionLabel title="Your Goals" subtitle="Track your wishlist and savings progress." />
          <div className="flex items-center gap-2">
            {/* ShadCN Sheet Filter Drawer */}
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 rounded-[16px] border-white/10 bg-[#16212d] text-white hover:bg-white/10"
                >
                  <SlidersHorizontal size={16} className="text-[#2f56ff]" />
                  <span>Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2f56ff] text-[11px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent
                side="bottom"
                className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[85vh] overflow-y-auto p-6 shadow-2xl"
              >
                <SheetHeader className="text-left">
                  <SheetTitle className="text-[20px] font-bold text-white flex items-center gap-2">
                    <Filter size={20} className="text-[#2f56ff]" /> Filter Savings Goals
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-4 mt-4">
                  {/* Search Title */}
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-white/70">Search Goal Title</Label>
                    <Input
                      placeholder="e.g. Laptop, Fund..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-[#16212d] border-white/10 text-white rounded-[16px] placeholder:text-white/30"
                    />
                  </div>

                  {/* Goal Status Filter */}
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-white/70">Status Filter</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'ALL', label: 'All Goals' },
                        { id: 'WAITING', label: 'Waiting' },
                        { id: 'COMPLETED', label: 'Completed' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setStatusFilter(st.id)}
                          className={`py-2 px-3 text-[12px] font-semibold rounded-[14px] border transition-all ${
                            statusFilter === st.id
                              ? 'bg-[#2f56ff] text-white border-[#2f56ff] shadow-[0_4px_12px_rgba(47,86,255,0.3)]'
                              : 'bg-[#16212d] text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 space-y-2">
                    <Button
                      type="button"
                      onClick={() => setIsFilterSheetOpen(false)}
                      className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 text-[15px] font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all"
                    >
                      Apply Filter
                    </Button>
                    {activeFilterCount > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setStatusFilter('ALL');
                          setSearchTerm('');
                          setIsFilterSheetOpen(false);
                        }}
                        className="w-full gap-2 rounded-[16px] border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                      >
                        <RotateCcw size={15} /> Reset Filters
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <AddGoalDialog />
          </div>
        </div>

        <div className="mt-4 space-y-3 sm:mt-5">
          {filteredGoals.length > 0 ? (
            filteredGoals.map((g) => {
              const savedPct = Math.min(Math.round((data.totalSavings / g.targetAmount) * 100), 100);
              return (
                <div key={g.id} className="rounded-[20px] border border-white/10 bg-[#16212d] p-4 transition-all hover:border-white/20">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[15px] font-semibold text-white sm:text-[17px]">{g.title}</div>
                      <div className="mt-1 text-[12px] text-white/55 sm:text-[13px]">
                        Status: <span className="font-semibold text-emerald-400">{g.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-[15px] font-bold text-white">₹{g.targetAmount.toLocaleString('en-IN')}</div>
                      <div className="flex items-center gap-1">
                        <EditGoalDialog goal={g} />
                        <DeleteGoalButton id={g.id} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-[#2f56ff] to-[#10b981] transition-all" style={{ width: `${savedPct}%` }} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-[14px] text-white/45">No savings goals found.</div>
          )}
        </div>
      </Panel>
    </div>
  );
}

// ─── 5. REMINDERS PAGE ───
export function RemindersWebPage({
  data = [],
}: {
  data?: Array<{
    id: string;
    name: string;
    category?: string;
    amount?: number;
    cycle?: string;
    nextBilling: string;
    createdAt: string;
    notes?: string | null;
  }>;
}) {
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [selectedCycle, setSelectedCycle] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = ['All', 'General', 'Bills', 'Health', 'Personal', 'Work', 'Subscription', 'Finance'];

  const filteredData = data.filter((item) => {
    const matchCat =
      selectedCat === 'All' ||
      item.category?.toLowerCase() === selectedCat.toLowerCase() ||
      (selectedCat === 'General' && (!item.category || item.category === 'General'));

    const matchCycle =
      selectedCycle === 'All' ||
      (item.cycle || 'ONE_TIME').toLowerCase() === selectedCycle.toLowerCase();

    return matchCat && matchCycle;
  });

  const activeFilterCount = (selectedCat !== 'All' ? 1 : 0) + (selectedCycle !== 'All' ? 1 : 0);

  const resetFilters = () => {
    setSelectedCat('All');
    setSelectedCycle('All');
  };

  return (
    <Panel>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SectionLabel title="Reminders" subtitle="General task alerts, bill due dates, and recurring subscription renewals." />
        <div className="flex items-center gap-2.5">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#16212d] px-4 py-2.5 text-[14px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <SlidersHorizontal size={16} className="text-[#2f56ff]" />
                <span>Filter</span>
                {activeFilterCount > 0 ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2f56ff] text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
            </SheetTrigger>

            <SheetContent
              side="bottom"
              className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[88vh] overflow-y-auto p-6 shadow-2xl"
            >
              <SheetHeader className="text-left">
                <SheetTitle className="text-[20px] font-bold text-white flex items-center gap-2">
                  <Filter size={20} className="text-[#2f56ff]" /> Filter Reminders
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-5 mt-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-white/70">Category</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        type="button"
                        variant={selectedCat === cat ? 'default' : 'outline'}
                        onClick={() => setSelectedCat(cat)}
                        className={cn(
                          'h-8 rounded-full px-3.5 text-[12px] font-semibold transition-all',
                          selectedCat === cat
                            ? 'bg-[linear-gradient(180deg,#3058ff_0%,#2445f6_100%)] text-white shadow-[0_6px_16px_rgba(47,86,255,0.3)]'
                            : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
                        )}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Billing Cycle Filter */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-white/70">Billing Frequency / Cycle</Label>
                  <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                    <SelectTrigger className="w-full bg-[#16212d] border-white/10 text-white rounded-[16px]">
                      <SelectValue placeholder="All Cycles" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                      <SelectItem value="All">All Cycles</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="ONE_TIME">One-Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action buttons */}
                <div className="pt-2 space-y-2">
                  <Button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 text-[15px] font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all"
                  >
                    Apply Filters
                  </Button>

                  {activeFilterCount > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetFilters}
                      className="w-full gap-2 rounded-[16px] border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <RotateCcw size={15} />
                      Reset Filters
                    </Button>
                  ) : null}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <AddSubscriptionDialog />
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFilterCount > 0 && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[13px] text-white/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/50 font-medium">Active filters:</span>
            {selectedCat !== 'All' && (
              <Badge variant="outline" className="border-[#2f56ff]/40 bg-[#2f56ff]/15 text-white gap-1.5 py-1 px-2.5 rounded-full">
                Category: {selectedCat}
                <X size={12} className="cursor-pointer hover:text-red-400" onClick={() => setSelectedCat('All')} />
              </Badge>
            )}
            {selectedCycle !== 'All' && (
              <Badge variant="outline" className="border-[#2f56ff]/40 bg-[#2f56ff]/15 text-white gap-1.5 py-1 px-2.5 rounded-full">
                Cycle: {selectedCycle}
                <X size={12} className="cursor-pointer hover:text-red-400" onClick={() => setSelectedCycle('All')} />
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="text-[12px] text-[#3058ff] hover:underline font-medium shrink-0"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="mt-5 space-y-1">
        {filteredData.length > 0 ? (
          filteredData.map((row) => (
            <ReminderRow
              key={row.id}
              id={row.id}
              title={row.name}
              category={row.category}
              amount={row.amount}
              cycle={row.cycle}
              due={format(new Date(row.nextBilling), 'dd MMM yyyy')}
              notes={row.notes}
            />
          ))
        ) : (
          <div className="py-12 text-center text-[14px] text-white/45">No reminders found for the selected filters.</div>
        )}
      </div>
    </Panel>
  );
}

// ─── 6. NOTIFICATIONS PAGE ───
export function NotificationsWebPage({
  data = [],
  unreadCount = 0,
}: {
  data?: Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    icon: string;
    read: boolean;
    createdAt: string;
  }>;
  unreadCount?: number;
}) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-4">
        <SectionLabel title="Notification" subtitle="Activity feed and system alerts." />
        <div className="flex items-center gap-3">
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => markAllRead()}
              className="h-8 border-white/10 bg-white/5 text-[12px] text-white/80 hover:bg-white/10 hover:text-white"
            >
              Mark all read
            </Button>
          ) : null}
          <Badge variant="secondary" className="border-white/10 bg-white/5 text-white/75">
            {unreadCount} unread
          </Badge>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        {data.length > 0 ? (
          data.map((row) => (
            <NotificationRow
              key={row.id}
              id={row.id}
              type={row.type}
              icon={getIcon(row.icon)}
              title={row.title}
              subtitle={row.subtitle}
              time={timeAgo(row.createdAt)}
              read={row.read}
            />
          ))
        ) : (
          <div className="py-12 text-center text-[14px] text-white/45">No notifications in your feed.</div>
        )}
      </div>
    </Panel>
  );
}
