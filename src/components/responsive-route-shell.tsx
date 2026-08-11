'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  Bell,
  CheckSquare,
  CreditCard,
  Home,
  ListOrdered,
  MoreHorizontal,
  Plus,
  Receipt,
  Settings,
  Sparkles,
  Wallet2,
  type LucideIcon,
} from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export type RouteKey = 'overview' | 'expenses' | 'entries' | 'bills' | 'savings' | 'reminders' | 'notifications' | 'settings';

interface NavItem {
  key: RouteKey;
  href: string;
  label: string;
  Icon: LucideIcon;
}

const allNavItems: NavItem[] = [
  { key: 'overview', href: '/overview', label: 'Overview', Icon: Home },
  { key: 'expenses', href: '/expenses', label: 'Expenses', Icon: CreditCard },
  { key: 'entries', href: '/entries', label: 'Entries', Icon: ListOrdered },
  { key: 'bills', href: '/bills', label: 'Bills & Utilities', Icon: Receipt },
  { key: 'savings', href: '/savings', label: 'Savings', Icon: Wallet2 },
  { key: 'reminders', href: '/reminders', label: 'Reminders', Icon: Sparkles },
  { key: 'notifications', href: '/notifications', label: 'Notifications', Icon: Bell },
  { key: 'settings', href: '/settings', label: 'Settings', Icon: Settings },
];

const secondaryNavKeys = new Set(['bills', 'expenses', 'savings', 'reminders', 'settings']);
const secondaryNavItems: NavItem[] = allNavItems.filter((item) => secondaryNavKeys.has(item.key));


function Avatar() {
  return (
    <div className="h-10 w-10 rounded-full border-2 border-[#1d48ff] bg-[radial-gradient(circle_at_34%_30%,#0b0e13_0_18%,#0f1116_19%_35%,#1d48ff_36%_100%)] shadow-[0_0_0_3px_rgba(29,72,255,0.15)]" />
  );
}

export function ResponsiveRouteShell({
  active,
  title,
  subtitle,
  children,
  headerAction,
  hasUnread = false,
}: {
  active: RouteKey;
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  hasUnread?: boolean;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#182636_0%,#0c131d_42%,#070b12_100%)] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* DESKTOP SIDEBAR (≥ 1024px) */}
        <aside className="hidden border-r border-white/10 bg-black/10 px-6 py-7 backdrop-blur lg:flex lg:flex-col">
          <div className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f56ff] text-lg font-semibold shadow-[0_8px_20px_rgba(47,86,255,0.35)]">
                EM
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">Expense Manager</div>
                <div className="mt-0.5 text-[20px] font-semibold tracking-[-0.02em]">{title}</div>
              </div>
            </div>
          </div>

          <nav className="mt-6 space-y-1.5">
            {allNavItems.map((item) => {
              const isActive = active === item.key || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'inline-flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-medium transition-colors',
                    isActive
                      ? 'bg-[#2f56ff] text-white shadow-[0_10px_22px_rgba(47,86,255,0.35)]'
                      : 'text-white/65 hover:bg-white/5 hover:text-white',
                  )}
                >
                  <item.Icon size={19} strokeWidth={2.1} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
            <div className="text-[12px] uppercase tracking-[0.24em] text-white/40">This Month</div>
            <div className="mt-2 text-[22px] font-semibold text-white">₹0.00</div>
            <div className="mt-0.5 text-[13px] text-white/55">Total expenses</div>
          </div>
        </aside>

        {/* MAIN BODY */}
        <div className="flex min-h-screen flex-col">
          {/* MOBILE TOP BAR (< 640px) - matches OverviewScreen header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0b1119]/90 px-5 py-3.5 backdrop-blur sm:hidden">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">Expense Manager</div>
              <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-white">{title}</h1>
            </div>
            <Avatar />
          </div>

          {/* TABLET / DESKTOP HEADER (≥ 640px) */}
          <header className="hidden border-b border-white/10 bg-[#0b1119]/85 backdrop-blur sm:block">
            <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
              <div>
                <div className="text-[12px] uppercase tracking-[0.28em] text-white/45">Expense Manager</div>
                <h1 className="mt-0.5 text-[26px] font-semibold tracking-[-0.03em] lg:text-[30px]">{title}</h1>
                {subtitle ? <p className="mt-1 text-[14px] leading-6 text-white/60">{subtitle}</p> : null}
              </div>
              <div className="flex items-center gap-3">
                {headerAction && <div>{headerAction}</div>}
              </div>
            </div>
          </header>

          {/* PAGE CONTENT CONTAINER */}
          <div className="mx-auto w-full max-w-[1280px] flex-1 px-3 py-4 pb-28 sm:px-4 sm:py-5 lg:px-8 lg:pb-8">
            {children}
          </div>

          {/* MOBILE BOTTOM NAVIGATION BAR (iOS / Mobile Floating FAB style) */}
          <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#101923]/95 px-6 pb-4 pt-3 backdrop-blur lg:hidden">
            <div className="relative flex items-end justify-between max-w-[440px] mx-auto">
              {/* Home / Overview */}
              <Link
                href="/overview"
                className={cn(
                  'inline-flex items-center justify-center p-1 transition-colors',
                  active === 'overview' ? 'text-[#2f56ff]' : 'text-white/60 hover:text-white',
                )}
                aria-label="Home"
              >
                <Home size={24} strokeWidth={2.1} />
              </Link>

              {/* Entries */}
              <Link
                href="/entries"
                className={cn(
                  'inline-flex items-center justify-center p-1 transition-colors',
                  active === 'entries' ? 'text-[#2f56ff]' : 'text-white/60 hover:text-white',
                )}
                aria-label="Entries"
              >
                <ListOrdered size={24} strokeWidth={2.1} />
              </Link>

              {/* Center Floating Plus Action (FAB) */}
              <Link
                href="/expenses"
                aria-label="Add Expense"
                className={cn(
                  'absolute left-1/2 top-[-32px] z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#2f56ff] text-white shadow-[0_12px_28px_rgba(47,86,255,0.5)] hover:bg-[#315bff] active:scale-95 transition-all',
                  active === 'expenses' && 'ring-4 ring-white/20 scale-[1.05]',
                )}
              >
                <Plus size={30} strokeWidth={2.5} />
              </Link>

              {/* Notifications */}
              <Link
                href="/notifications"
                className={cn(
                  'relative inline-flex items-center justify-center p-1 transition-colors',
                  active === 'notifications' ? 'text-[#2f56ff]' : 'text-white/60 hover:text-white',
                )}
                aria-label="Notifications"
              >
                <Bell size={24} strokeWidth={2.1} />
                {hasUnread && (
                  <span className="absolute right-[0px] top-[0px] h-2.5 w-2.5 rounded-full bg-[#ff5b5b] ring-2 ring-[#101923]" />
                )}
              </Link>

              {/* More Drawer Trigger */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className={cn(
                  'inline-flex items-center justify-center p-1 transition-colors',
                  ['expenses', 'savings', 'reminders', 'settings'].includes(active)
                    ? 'text-[#2f56ff]'
                    : 'text-white/60 hover:text-white',
                )}
                aria-label="More Menu"
              >
                <MoreHorizontal size={24} strokeWidth={2.1} />
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* MOBILE MORE MENU DRAWER (Sheet) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-[32px] border-t border-white/10 bg-[#111a25] px-6 pb-10 pt-4 text-white shadow-[0_-20px_50px_rgba(0,0,0,0.6)]"
        >
          {/* Handle bar */}
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />

          <SheetHeader className="mb-4 text-left">
            <SheetTitle className="text-[18px] font-semibold text-white">Navigation Menu</SheetTitle>
          </SheetHeader>

          <nav className="space-y-2">
            {secondaryNavItems.map((item) => {
              const isActive = active === item.key || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    'flex items-center gap-4 rounded-[20px] px-4 py-3.5 text-[16px] font-semibold transition-colors',
                    isActive
                      ? 'bg-[#2f56ff]/15 text-[#2f56ff] border border-[#2f56ff]/30'
                      : 'text-white hover:bg-white/5 border border-transparent',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-[14px]',
                      isActive ? 'bg-[#2f56ff] text-white' : 'bg-[#4b5767] text-white/90',
                    )}
                  >
                    <item.Icon size={20} strokeWidth={2} />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-white/10 pt-4 text-center text-[13px] text-white/35">
            EM • Expense Manager
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
