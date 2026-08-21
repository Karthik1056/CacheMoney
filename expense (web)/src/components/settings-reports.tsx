'use client';

import { useState, useEffect } from 'react';
import { getReportsData } from '@/app/actions/reports';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Calendar as CalendarIcon,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Bell,
  FileText,
  Wallet,
  SlidersHorizontal,
  RotateCcw,
  LineChart,
  AreaChart as AreaIcon,
  Donut
} from 'lucide-react';
import { format } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  Legend
} from 'recharts';

export function SettingsReportsSection({
  accounts = [],
  categories = [],
}: {
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}) {
  // Filter States
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [selectedAcc, setSelectedAcc] = useState<string>('all');
  const [periodPreset, setPeriodPreset] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Active Report Tab & Selected Chart Type State
  const [activeReportTab, setActiveReportTab] = useState<'spending' | 'expense' | 'reminders' | 'bills'>('spending');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'area'>('bar');

  // Report Data
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReports = async () => {
    setLoading(true);
    const data = await getReportsData({
      categoryId: selectedCat,
      accountId: selectedAcc,
      period: periodPreset === 'custom' ? undefined : periodPreset,
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    });
    setReportData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [selectedCat, selectedAcc, periodPreset, startDate, endDate]);

  const resetFilters = () => {
    setSelectedCat('all');
    setSelectedAcc('all');
    setPeriodPreset('month');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const activeFilterCount =
    (selectedCat !== 'all' ? 1 : 0) +
    (selectedAcc !== 'all' ? 1 : 0) +
    (periodPreset !== 'month' ? 1 : 0);

  const COLORS = ['#2f56ff', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6'];

  // Helper to render dynamic selected chart type (Bar / Pie / Line / Area)
  const renderDynamicChart = (data: Array<{ name: string; value: number; color?: string }>, defaultColor: string) => {
    if (!data || data.length === 0) {
      return <div className="flex h-full items-center justify-center text-white/40 text-[14px]">No report data available for selected filters.</div>;
    }

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip contentStyle={{ backgroundColor: '#111a25', borderRadius: '16px', borderColor: '#ffffff20', color: '#fff' }} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend wrapperStyle={{ color: '#fff', fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="name" stroke="#ffffff50" tick={{ fontSize: 12 }} />
            <YAxis stroke="#ffffff50" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#111a25', borderRadius: '16px', borderColor: '#ffffff20', color: '#fff' }} />
            <Line type="monotone" dataKey="value" stroke={defaultColor} strokeWidth={3} dot={{ r: 5 }} />
          </RechartsLineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={data}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={defaultColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={defaultColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="name" stroke="#ffffff50" tick={{ fontSize: 12 }} />
            <YAxis stroke="#ffffff50" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#111a25', borderRadius: '16px', borderColor: '#ffffff20', color: '#fff' }} />
            <Area type="monotone" dataKey="value" stroke={defaultColor} fillOpacity={1} fill="url(#areaGrad)" />
          </RechartsAreaChart>
        </ResponsiveContainer>
      );
    }

    // Default: Bar Chart
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="name" stroke="#ffffff50" tick={{ fontSize: 12 }} />
          <YAxis stroke="#ffffff50" tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: '#111a25', borderRadius: '16px', borderColor: '#ffffff20', color: '#fff' }} />
          <Bar dataKey="value" fill={defaultColor} radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card with Filter Sheet Trigger & Chart Type Switcher */}
      <div className="rounded-[24px] border border-white/10 bg-[#16212d] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-white flex items-center gap-2">
            <PieIcon size={22} className="text-[#2f56ff]" /> Financial Reports & Analytics
          </h2>
          <p className="text-[13px] text-white/50">Comprehensive charts for Spending, Expenses, Reminders, and Bills.</p>
        </div>

        {/* Action Controls: Shadcn Sheet Filter & Chart Type Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart Type Selector */}
          <div className="flex items-center bg-[#111a25] border border-white/10 rounded-[16px] p-1 gap-1">
            {[
              { type: 'bar', label: 'Bar', icon: BarChart3 },
              { type: 'pie', label: 'Pie', icon: PieIcon },
              { type: 'line', label: 'Line', icon: LineChart },
              { type: 'area', label: 'Area', icon: AreaIcon },
            ].map((ct) => (
              <button
                key={ct.type}
                type="button"
                onClick={() => setChartType(ct.type as any)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-[12px] text-[12px] font-semibold transition-all ${
                  chartType === ct.type
                    ? 'bg-[#2f56ff] text-white shadow-[0_4px_12px_rgba(47,86,255,0.3)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <ct.icon size={14} />
                <span className="hidden sm:inline">{ct.label}</span>
              </button>
            ))}
          </div>

          {/* Shadcn Sheet Filter Drawer Trigger */}
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 rounded-[16px] border-white/10 bg-[#111a25] text-white hover:bg-white/10 px-4 py-2.5"
              >
                <SlidersHorizontal size={16} className="text-[#2f56ff]" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2f56ff] text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent
              side="bottom"
              className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
            >
              <SheetHeader className="text-left">
                <SheetTitle className="text-[20px] font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal size={20} className="text-[#2f56ff]" /> Filter Reports & Analytics
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4 mt-4">
                {/* Period Presets */}
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-white/70">Period Filter</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'day', label: 'Day' },
                      { id: 'week', label: 'Week' },
                      { id: 'month', label: 'Month' },
                      { id: 'year', label: 'Year' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPeriodPreset(p.id as any);
                          setStartDate(undefined);
                          setEndDate(undefined);
                        }}
                        className={`py-2 px-2 text-[12px] font-semibold rounded-[14px] border transition-all ${
                          periodPreset === p.id
                            ? 'bg-[#2f56ff] text-white border-[#2f56ff] shadow-[0_4px_12px_rgba(47,86,255,0.3)]'
                            : 'bg-[#16212d] text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range Popovers */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-[13px] font-medium text-white/70">Custom Calendar Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-[#16212d] border-white/10 text-white rounded-[16px] hover:bg-white/10 hover:text-white"
                          onClick={() => setPeriodPreset('custom')}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-[#2f56ff]" />
                          {startDate ? format(startDate, 'dd MMM yyyy') : <span className="text-white/40">From Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#111a25] border-white/10 text-white rounded-[20px]" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(d) => {
                            setStartDate(d);
                            setPeriodPreset('custom');
                          }}
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-[#16212d] border-white/10 text-white rounded-[16px] hover:bg-white/10 hover:text-white"
                          onClick={() => setPeriodPreset('custom')}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-[#2f56ff]" />
                          {endDate ? format(endDate, 'dd MMM yyyy') : <span className="text-white/40">To Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#111a25] border-white/10 text-white rounded-[20px]" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(d) => {
                            setEndDate(d);
                            setPeriodPreset('custom');
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-white/70">Category</Label>
                  <Select value={selectedCat} onValueChange={setSelectedCat}>
                    <SelectTrigger className="w-full bg-[#16212d] border-white/10 text-white rounded-[16px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Account Filter */}
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-white/70">Payment Account</Label>
                  <Select value={selectedAcc} onValueChange={setSelectedAcc}>
                    <SelectTrigger className="w-full bg-[#16212d] border-white/10 text-white rounded-[16px]">
                      <SelectValue placeholder="All Accounts" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                      <SelectItem value="all">All Accounts</SelectItem>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <Button
                    type="button"
                    onClick={() => {
                      fetchReports();
                      setFilterSheetOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 text-[15px] font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all"
                  >
                    Apply Filters
                  </Button>

                  {activeFilterCount > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetFilters();
                        setFilterSheetOpen(false);
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
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[20px] border border-white/10 bg-[#16212d] p-4 shadow-sm">
          <div className="text-[11px] text-white/50 uppercase font-medium">Total Spending</div>
          <div className="mt-1 text-[22px] font-bold text-white">
            ₹{reportData?.summary?.totalSpending?.toLocaleString('en-IN') || 0}
          </div>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-[#16212d] p-4 shadow-sm">
          <div className="text-[11px] text-white/50 uppercase font-medium">Expenses Logged</div>
          <div className="mt-1 text-[22px] font-bold text-rose-400">
            ₹{reportData?.summary?.totalExpense?.toLocaleString('en-IN') || 0}
          </div>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-[#16212d] p-4 shadow-sm">
          <div className="text-[11px] text-white/50 uppercase font-medium">Bills Volume</div>
          <div className="mt-1 text-[22px] font-bold text-amber-400">
            ₹{reportData?.summary?.totalBills?.toLocaleString('en-IN') || 0}
          </div>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-[#16212d] p-4 shadow-sm">
          <div className="text-[11px] text-white/50 uppercase font-medium">Active Reminders</div>
          <div className="mt-1 text-[22px] font-bold text-indigo-400">
            ₹{reportData?.summary?.totalReminders?.toLocaleString('en-IN') || 0}
          </div>
        </div>
      </div>

      {/* Report Type Tabs & Chart Render Area */}
      <Tabs value={activeReportTab} onValueChange={(v: any) => setActiveReportTab(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#16212d] rounded-[22px] p-1.5">
          <TabsTrigger value="spending" className="data-[state=active]:bg-[#2f56ff] data-[state=active]:text-white text-[13px] rounded-[16px] py-2">
            <TrendingUp size={15} className="mr-1.5" /> Spending
          </TabsTrigger>
          <TabsTrigger value="expense" className="data-[state=active]:bg-[#2f56ff] data-[state=active]:text-white text-[13px] rounded-[16px] py-2">
            <Wallet size={15} className="mr-1.5" /> Expense
          </TabsTrigger>
          <TabsTrigger value="reminders" className="data-[state=active]:bg-[#2f56ff] data-[state=active]:text-white text-[13px] rounded-[16px] py-2">
            <Bell size={15} className="mr-1.5" /> Reminders
          </TabsTrigger>
          <TabsTrigger value="bills" className="data-[state=active]:bg-[#2f56ff] data-[state=active]:text-white text-[13px] rounded-[16px] py-2">
            <FileText size={15} className="mr-1.5" /> Bills
          </TabsTrigger>
        </TabsList>

        {/* 1. SPENDING REPORT */}
        <TabsContent value="spending" className="mt-4">
          <Card className="border-white/10 bg-[#16212d] rounded-[24px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-[17px] font-bold text-white">Category Spending Distribution</CardTitle>
                <CardDescription className="text-[13px] text-white/50">Spend breakdown across categories</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              {renderDynamicChart(reportData?.categoryCharts, '#2f56ff')}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. EXPENSE REPORT */}
        <TabsContent value="expense" className="mt-4">
          <Card className="border-white/10 bg-[#16212d] rounded-[24px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-[17px] font-bold text-white">Account Expense Share</CardTitle>
                <CardDescription className="text-[13px] text-white/50">Expense volume per payment account</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              {renderDynamicChart(reportData?.accountCharts, '#10b981')}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. REMINDERS REPORT */}
        <TabsContent value="reminders" className="mt-4">
          <Card className="border-white/10 bg-[#16212d] rounded-[24px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-[17px] font-bold text-white">Subscription & Reminder Cycles</CardTitle>
                <CardDescription className="text-[13px] text-white/50">Subscription volume grouped by cycle</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              {renderDynamicChart(reportData?.reminderCharts, '#8b5cf6')}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. BILLS REPORT */}
        <TabsContent value="bills" className="mt-4">
          <Card className="border-white/10 bg-[#16212d] rounded-[24px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-[17px] font-bold text-white">Bills Status & Amounts</CardTitle>
                <CardDescription className="text-[13px] text-white/50">Paid vs Due/Overdue utility bills volume</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              {renderDynamicChart(reportData?.billsCharts, '#f59e0b')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
