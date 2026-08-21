'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface OverviewLineChartProps {
  selectedMonth: string;
  totalIncome: number;
  totalExpense: number;
  dailyTrends: Array<{ date: string; Income: number; Expense: number }>;
}

const chartConfig: ChartConfig = {
  Expense: {
    label: 'Expense',
    color: '#3b82f6',
  },
  Income: {
    label: 'Income',
    color: '#10b981',
  },
};

export function OverviewInteractiveLineChart({
  selectedMonth,
  totalIncome,
  totalExpense,
  dailyTrends,
}: OverviewLineChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeChart, setActiveChart] = React.useState<'Expense' | 'Income'>('Expense');

  // Generate month choices (Current month, last 5 months, next month)
  const monthOptions = React.useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = -5; i <= 2; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ val, label });
    }
    return options;
  }, []);

  const handleMonthSelect = (newMonth: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', newMonth);
    router.push(`/overview?${params.toString()}`);
  };

  const totals = React.useMemo(
    () => ({
      Expense: totalExpense,
      Income: totalIncome,
    }),
    [totalExpense, totalIncome]
  );

  return (
    <Card className="border-white/10 bg-[#111a25]/95 shadow-xl rounded-[28px] overflow-hidden">
      <CardHeader className="flex flex-col items-stretch border-b border-white/10 p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1.5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-[18px] font-bold text-white tracking-tight">Interactive Cashflow Trend</CardTitle>
              <CardDescription className="text-[13px] text-white/50">
                Daily breakdown of income & expenses
              </CardDescription>
            </div>
            
            {/* Selectable Month Dropdown */}
            <div className="w-44">
              <Select value={selectedMonth} onValueChange={handleMonthSelect}>
                <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[14px] text-[13px] font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[14px]">
                  {monthOptions.map((m) => (
                    <SelectItem key={m.val} value={m.val}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex border-t border-white/10 sm:border-t-0 sm:border-l">
          {(['Expense', 'Income'] as const).map((key) => {
            const isActive = activeChart === key;
            return (
              <button
                key={key}
                data-active={isActive}
                onClick={() => setActiveChart(key)}
                className={`flex flex-1 flex-col justify-center gap-1 border-r border-white/10 last:border-r-0 px-6 py-4 text-left transition-all ${
                  isActive
                    ? 'bg-[#1b2737] text-white'
                    : 'bg-transparent text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-[12px] font-medium uppercase tracking-wider text-white/50">
                  {key}
                </span>
                <span className={`text-lg font-bold sm:text-2xl ${key === 'Income' ? 'text-emerald-400' : 'text-[#3b82f6]'}`}>
                  ₹{totals[key].toLocaleString('en-IN')}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <LineChart
            accessibilityLayer
            data={dailyTrends}
            margin={{
              left: 12,
              right: 12,
              top: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
              stroke="#94a3b8"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} width={45} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[160px]"
                  nameKey={activeChart}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={activeChart === 'Income' ? '#10b981' : '#3b82f6'}
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
