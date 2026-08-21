'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { LabelList, RadialBar, RadialBarChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

export interface OverviewRadialChartProps {
  totalIncome: number;
  totalExpense: number;
  totalBudget: number;
  netBalance: number;
  momChange: number;
}

const chartConfig = {
  amount: {
    label: 'Amount',
  },
  income: {
    label: 'Income',
    color: '#10b981',
  },
  expense: {
    label: 'Expense',
    color: '#3b82f6',
  },
  budget: {
    label: 'Budget',
    color: '#a855f7',
  },
  balance: {
    label: 'Net Balance',
    color: '#f59e0b',
  },
} satisfies ChartConfig;

export function OverviewRadialChart({
  totalIncome,
  totalExpense,
  totalBudget,
  netBalance,
  momChange,
}: OverviewRadialChartProps) {
  // Normalize values to percentages of the max for radial chart display
  const maxVal = Math.max(totalIncome, totalExpense, totalBudget, Math.abs(netBalance), 1);

  const chartData = [
    {
      name: 'income',
      label: 'Income',
      amount: Math.round((totalIncome / maxVal) * 100),
      rawAmount: totalIncome,
      fill: 'var(--color-income)',
    },
    {
      name: 'expense',
      label: 'Expense',
      amount: Math.round((totalExpense / maxVal) * 100),
      rawAmount: totalExpense,
      fill: 'var(--color-expense)',
    },
    {
      name: 'budget',
      label: 'Budget',
      amount: Math.round((totalBudget / maxVal) * 100),
      rawAmount: totalBudget,
      fill: 'var(--color-budget)',
    },
    {
      name: 'balance',
      label: 'Net Balance',
      amount: Math.round((Math.abs(netBalance) / maxVal) * 100),
      rawAmount: netBalance,
      fill: 'var(--color-balance)',
    },
  ];

  const isTrendingUp = momChange >= 0;

  return (
    <Card className="flex flex-col border-white/10 bg-[#111a25]/95 shadow-xl rounded-[28px] overflow-hidden">
      <CardHeader className="items-center pb-0 pt-6 px-6">
        <CardTitle className="text-[18px] font-bold text-white tracking-tight">
          Balance Snapshot
        </CardTitle>
        <CardDescription className="text-[13px] text-white/50">
          Monthly financial breakdown
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={380}
            innerRadius={35}
            outerRadius={120}
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="label"
                  formatter={((value: unknown, name: unknown, item: any) =>
                    `₹${Number(item?.payload?.rawAmount ?? 0).toLocaleString('en-IN')}`) as any}
                />
              }
            />
            <RadialBar dataKey="amount" background>
              <LabelList
                position="insideStart"
                dataKey="label"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 pb-6 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium text-white">
          {isTrendingUp ? (
            <>
              Expenses up {Math.abs(momChange)}% from last month
              <TrendingUp className="h-4 w-4 text-red-400" />
            </>
          ) : (
            <>
              Expenses down {Math.abs(momChange)}% from last month
              <TrendingDown className="h-4 w-4 text-emerald-400" />
            </>
          )}
        </div>
        <div className="leading-none text-white/50">
          Net Balance: ₹{netBalance.toLocaleString('en-IN')}
        </div>
      </CardFooter>
    </Card>
  );
}
