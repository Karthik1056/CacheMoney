'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface AnalyticsChartsProps {
  initialYear: number;
  monthlyOverview: Array<{ month: string; Income: number; Expense: number }>;
  categoryDistribution: Array<{ name: string; value: number; color: string }>;
}

const barChartConfig: ChartConfig = {
  Income: { label: 'Income', color: '#10b981' },
  Expense: { label: 'Expense', color: '#ef4444' },
};

const RADIAN = Math.PI / 180;

function PieLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent, name,
}: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number;
  percent: number; name: string;
}) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function AnalyticsCharts({
  initialYear,
  monthlyOverview,
  categoryDistribution,
}: AnalyticsChartsProps) {
  const [selectedYear, setSelectedYear] = useState(String(initialYear));

  const years = [String(initialYear - 1), String(initialYear), String(initialYear + 1)];

  const total = categoryDistribution.reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-5">
      {/* ── Income vs Expense Bar Chart ── */}
      <Card className="border-white/10 bg-[#111a25]/95 shadow-xl rounded-[24px]">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 px-5 pt-5">
          <div>
            <CardTitle className="text-[17px] font-bold text-white">Income vs Expense</CardTitle>
            <CardDescription className="text-[13px] text-white/50 mt-0.5">
              Monthly breakdown for {selectedYear}
            </CardDescription>
          </div>
          <div className="w-28">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[14px] h-9 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[14px]">
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-5 pt-1">
          <div className="h-[260px] w-full">
            {monthlyOverview.some((m) => m.Income > 0 || m.Expense > 0) ? (
              <ChartContainer config={barChartConfig} className="h-full w-full">
                <BarChart data={monthlyOverview} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        formatter={(value, name) => (
                          <span className="font-mono font-bold text-white">
                            ₹{Number(value).toLocaleString('en-IN')}
                          </span>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="Income" fill="var(--color-Income)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="Expense" fill="var(--color-Expense)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[14px] text-white/40">
                No data for {selectedYear}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-[13px] text-white/70">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Income
            </div>
            <div className="flex items-center gap-2 text-[13px] text-white/70">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Expense
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Category Distribution Pie Chart ── */}
      {categoryDistribution.length > 0 && (
        <Card className="border-white/10 bg-[#111a25]/95 shadow-xl rounded-[24px]">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-[17px] font-bold text-white">Category Breakdown</CardTitle>
            <CardDescription className="text-[13px] text-white/50 mt-0.5">
              Year-to-date expense distribution by category
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 pb-5 pt-1">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Pie */}
              <div className="h-[200px] w-[200px] shrink-0">
                <PieChart width={200} height={200}>
                  <Pie
                    data={categoryDistribution}
                    cx={96}
                    cy={96}
                    innerRadius={54}
                    outerRadius={88}
                    dataKey="value"
                    paddingAngle={2}
                    labelLine={false}
                  >
                    {categoryDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color || '#64748b'} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(14,22,34,0.97)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '14px',
                      color: '#fff',
                      fontSize: 13,
                    }}
                    formatter={((value: unknown, name: unknown) => [
                      `₹${Number(value).toLocaleString('en-IN')}`,
                      name,
                    ]) as any}
                  />
                </PieChart>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-2.5 w-full">
                {categoryDistribution.slice(0, 8).map((cat) => {
                  const pct = total > 0 ? ((cat.value / total) * 100).toFixed(1) : '0';
                  return (
                    <div key={cat.name} className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color || '#64748b' }}
                      />
                      <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                        <span className="truncate text-[13px] text-white/80">{cat.name}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[12px] font-semibold text-white/60">{pct}%</span>
                          <span className="text-[12px] font-bold text-white">
                            ₹{cat.value.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {categoryDistribution.length > 8 && (
                  <p className="text-[12px] text-white/40 pt-1">
                    +{categoryDistribution.length - 8} more categories
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
