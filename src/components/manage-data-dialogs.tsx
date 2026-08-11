'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Plus,
  Target,
  Bell,
  Trash2,
  Loader2,
  CheckCircle2,
  Wallet,
  TrendingUp,
  Sparkles,
  Calendar as CalendarIcon,
  IndianRupee,
  Clock,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  createGoal,
  deleteGoal,
  createSubscription,
  deleteSubscription,
  upsertBudget,
  upsertMonthlySalaryAndOverallBudget,
  deleteBudget,
} from '@/app/actions/budget-goals';
import { deleteTransaction } from '@/app/actions/transactions';

// ─── ADD GOAL SCHEMA & DIALOG ────────────────────────────────────
const goalSchema = z.object({
  title: z.string().min(1, 'Goal title is required'),
  targetAmount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: 'Target amount must be a positive number',
  }),
  coolingDays: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
    message: 'Must be 0 or more days',
  }),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export function AddGoalDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      targetAmount: '',
      coolingDays: '30',
    },
  });

  const onSubmit = async (values: GoalFormValues) => {
    setServerError('');
    try {
      const result = await createGoal({
        title: values.title.trim(),
        targetAmount: Number(values.targetAmount),
        coolingDays: Number(values.coolingDays),
      });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          form.reset();
          setSuccess(false);
          router.refresh();
        }, 1000);
      } else {
        setServerError(result.error || 'Failed to add goal');
      }
    } catch {
      setServerError('An error occurred');
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) { form.reset(); setSuccess(false); } }}>
      <SheetTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white shadow-[0_8px_25px_rgba(47,86,255,0.4)] rounded-[16px] transition-all">
          <Plus size={16} /> Add Savings Goal
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
      >
        <SheetHeader>
          <SheetTitle className="text-[20px] font-bold text-white flex items-center gap-2">
            <Target size={20} className="text-[#2f56ff]" /> New Savings Goal
          </SheetTitle>
        </SheetHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={40} />
            </div>
            <p className="text-[18px] font-bold text-white">Goal Created!</p>
          </div>
        ) : (
          <Card className="border-white/10 bg-[#141f2c] shadow-xl mt-3 rounded-[24px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[16px] font-semibold text-white">Savings Target Details</CardTitle>
              <CardDescription className="text-[13px] text-white/50">Specify title, target amount, and optional cooling period</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-medium text-white/70">Goal Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Emergency Fund, New Laptop"
                        className="bg-[#16212d] border-white/10 text-white rounded-[16px] placeholder:text-white/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-medium text-white/70">Target Amount (₹) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input
                          type="number"
                          placeholder="50000"
                          className="bg-[#16212d] border-white/10 pl-10 text-white font-semibold rounded-[16px] placeholder:text-white/30"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coolingDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-medium text-white/70">Cooling-Off Period (Days)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input
                          type="number"
                          className="bg-[#16212d] border-white/10 pl-10 text-white rounded-[16px]"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <p className="text-[12px] text-white/40 pt-1">Prevents impulse spending by locking purchases during cooling-off.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <p className="rounded-[16px] bg-red-500/10 px-3 py-2 text-[13px] text-red-400 border border-red-500/20">
                  {serverError}
                </p>
              )}

              <Button
                disabled={form.formState.isSubmitting}
                type="submit"
                className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 text-[15px] font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all"
              >
                {form.formState.isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving Goal...</>
                ) : (
                  <><Target size={16} /> Save Goal</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    )}
      </SheetContent>
    </Sheet>
  );
}

export function DeleteGoalButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-red-400 hover:bg-white/5 hover:text-red-300 h-8 w-8 rounded-full"
      disabled={loading}
      onClick={async () => { setLoading(true); await deleteGoal(id); router.refresh(); }}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </Button>
  );
}

// ─── ADD SUBSCRIPTION / REMINDER DIALOG ──────────────────────────
const subscriptionSchema = z.object({
  name: z.string().min(1, 'Reminder name is required'),
  category: z.string().optional(),
  amount: z.string().optional(),
  cycle: z.enum(['ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  nextBilling: z.string().min(1, 'Reminder date is required'),
  notes: z.string().optional(),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

export function AddSubscriptionDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      category: 'General',
      amount: '',
      cycle: 'ONE_TIME',
      nextBilling: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  const onSubmit = async (values: SubscriptionFormValues) => {
    setServerError('');
    try {
      const result = await createSubscription({
        name: values.name.trim(),
        category: values.category || 'General',
        amount: values.amount ? Number(values.amount) : 0,
        cycle: values.cycle as any,
        nextBilling: values.nextBilling,
        notes: values.notes?.trim() || undefined,
      });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          form.reset();
          setSuccess(false);
          router.refresh();
        }, 1000);
      } else {
        setServerError(result.error || 'Failed to add reminder');
      }
    } catch {
      setServerError('An error occurred');
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) { form.reset(); setSuccess(false); } }}>
      <SheetTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white shadow-[0_8px_25px_rgba(47,86,255,0.4)] rounded-[16px] transition-all">
          <Plus size={16} /> Add Reminder
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[92vh] overflow-y-auto p-6 shadow-2xl"
      >
        <SheetHeader>
          <SheetTitle className="text-[20px] font-bold text-white flex items-center gap-2">
            <Bell size={20} className="text-[#2f56ff]" /> Create Reminder
          </SheetTitle>
        </SheetHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={40} />
            </div>
            <p className="text-[18px] font-bold text-white">Reminder Added!</p>
          </div>
        ) : (
          <Card className="border-white/10 bg-[#141f2c] shadow-xl mt-3 rounded-[24px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[16px] font-semibold text-white">Reminder Details</CardTitle>
              <CardDescription className="text-[13px] text-white/50">Configure general tasks, bill reminders, or subscription renewals</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium text-white/70">Reminder Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Doctor Appointment, Credit Card Bill, Car Service"
                              className="bg-[#16212d] border-white/10 text-white rounded-[16px] placeholder:text-white/30"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium text-white/70">Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                              <SelectItem value="General">General</SelectItem>
                              <SelectItem value="Bills">Bills & Utilities</SelectItem>
                              <SelectItem value="Health">Health & Medical</SelectItem>
                              <SelectItem value="Personal">Personal</SelectItem>
                              <SelectItem value="Work">Work & Projects</SelectItem>
                              <SelectItem value="Subscription">Subscription</SelectItem>
                              <SelectItem value="Finance">Finance & Taxes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium text-white/70">Amount (₹) (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0 (Optional)"
                                className="bg-[#16212d] border-white/10 pl-10 text-white font-semibold rounded-[16px] placeholder:text-white/30"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cycle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium text-white/70">Repeat Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                              <SelectItem value="ONE_TIME">One-Time Event</SelectItem>
                              <SelectItem value="DAILY">Daily</SelectItem>
                              <SelectItem value="WEEKLY">Weekly</SelectItem>
                              <SelectItem value="MONTHLY">Monthly</SelectItem>
                              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                              <SelectItem value="YEARLY">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nextBilling"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium text-white/70">When to Remember *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CalendarIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                              <Input
                                type="date"
                                className="bg-[#16212d] border-white/10 pl-10 text-white [color-scheme:dark] rounded-[16px]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-medium text-white/70">Notes / Details (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Add additional details, links, or notes to remember..."
                            className="bg-[#16212d] border-white/10 text-white rounded-[16px] placeholder:text-white/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {serverError && (
                    <p className="rounded-[16px] bg-red-500/10 px-3 py-2 text-[13px] text-red-400 border border-red-500/20">
                      {serverError}
                    </p>
                  )}

                  <Button
                    disabled={form.formState.isSubmitting}
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 text-[15px] font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all"
                  >
                    {form.formState.isSubmitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Saving Reminder...</>
                    ) : (
                      <><Bell size={16} /> Save Reminder</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function DeleteSubscriptionButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-red-400 hover:bg-white/5 hover:text-red-300 h-8 w-8 rounded-full"
      disabled={loading}
      onClick={async () => { setLoading(true); await deleteSubscription(id); router.refresh(); }}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </Button>
  );
}

export function DeleteTransactionButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-red-400 hover:bg-white/5 hover:text-red-300 h-7 w-7 rounded-full"
      disabled={loading}
      onClick={async () => { setLoading(true); await deleteTransaction(id); router.refresh(); }}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
    </Button>
  );
}

// ─── MONTHLY BUDGET & SALARY DIALOG ─────────────────────────────
export function BudgetSalaryDialog({
  categories = [],
  currentBudgets = [],
}: {
  categories?: Array<{ id: string; name: string; isIncome: boolean }>;
  currentBudgets?: Array<{ id: string; categoryId: string; categoryName: string; amount: number; isIncome: boolean }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const now = new Date();
  const defaultMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonthStr);

  const existingSalary = currentBudgets.find((b) => b.isIncome || b.categoryName.includes('Salary'))?.amount || 0;
  const existingOverall = currentBudgets.find((b) => !b.isIncome && b.categoryName.includes('Overall'))?.amount || 0;

  const [salaryTarget, setSalaryTarget] = useState(existingSalary ? String(existingSalary) : '');
  const [overallLimit, setOverallLimit] = useState(existingOverall ? String(existingOverall) : '');

  const [amounts, setAmounts] = useState<Record<string, string>>(
    () => Object.fromEntries(currentBudgets.map((b) => [b.categoryId, String(b.amount)]))
  );

  const expenseCategories = categories.filter((c) => !c.isIncome && !c.name.includes('Overall'));

  const handleSaveOverall = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving('overall');
    await upsertMonthlySalaryAndOverallBudget({
      month: selectedMonth,
      salaryTarget: salaryTarget ? Number(salaryTarget) : 0,
      overallExpenseLimit: overallLimit ? Number(overallLimit) : 0,
    });
    setSaving(null);
    router.refresh();
  };

  const handleSaveCategory = async (categoryId: string) => {
    const val = Number(amounts[categoryId]);
    if (!val || val <= 0) return;
    setSaving(categoryId);
    await upsertBudget({ month: selectedMonth, categoryId, amount: val });
    setSaving(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    setSaving(id);
    await deleteBudget(id);
    setSaving(null);
    router.refresh();
  };

  const CategoryBudgetRow = ({ cat }: { cat: { id: string; name: string } }) => {
    const existing = currentBudgets.find((b) => b.categoryId === cat.id);
    return (
      <div className="flex items-center justify-between gap-3 p-3 rounded-[16px] bg-[#0b1119]/60 border border-white/5">
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-white truncate">{cat.name}</div>
          {existing && (
            <div className="text-[12px] text-white/50">Limit: ₹{existing.amount.toLocaleString('en-IN')}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            step="100"
            placeholder="Amount"
            value={amounts[cat.id] || ''}
            onChange={(e) => setAmounts((prev) => ({ ...prev, [cat.id]: e.target.value }))}
            className="w-28 bg-[#16212d] border-white/10 text-white text-right placeholder:text-white/20 rounded-[12px]"
          />
          <Button
            size="sm"
            disabled={saving === cat.id}
            onClick={() => handleSaveCategory(cat.id)}
            className="bg-[#2f56ff] hover:bg-[#315bff] text-white px-3 rounded-[12px]"
          >
            {saving === cat.id ? <Loader2 size={13} className="animate-spin" /> : 'Set'}
          </Button>
          {existing && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-400 hover:bg-white/5 rounded-full"
              disabled={saving === existing.id}
              onClick={() => handleDelete(existing.id)}
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white shadow-[0_8px_25px_rgba(47,86,255,0.4)] rounded-[16px] transition-all">
          <Wallet size={15} /> Set Budget & Salary
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-7"
      >
        <SheetHeader>
          <SheetTitle className="text-[20px] font-bold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-[#2f56ff]" /> Monthly Budget & Salary Settings
          </SheetTitle>
          <p className="text-[13px] text-white/50 mt-1">Select month and configure income target & budget limits.</p>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* Target Month & Year Control */}
          <div className="flex items-center justify-between rounded-[20px] border border-white/10 bg-[#16212d] p-3.5">
            <div className="flex items-center gap-2">
              <CalendarIcon size={16} className="text-[#2f56ff]" />
              <Label className="text-[14px] font-semibold text-white">Target Month & Year</Label>
            </div>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-44 bg-[#0b1119] border-white/10 text-white font-medium text-center [color-scheme:dark] rounded-[14px]"
            />
          </div>

          {/* Main Monthly Totals Form */}
          <Card className="border-white/10 bg-[#141f2c] shadow-xl rounded-[24px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[16px] font-semibold text-white">Monthly Allocation</CardTitle>
              <CardDescription className="text-[13px] text-white/50">Configure income target and overall spending limit</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleSaveOverall} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-semibold text-emerald-400 flex items-center gap-2">
                <TrendingUp size={15} /> Total Monthly Salary / Income Target (₹)
              </Label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <Input
                  type="number"
                  min="0"
                  step="500"
                  placeholder="e.g. 20000"
                  value={salaryTarget}
                  onChange={(e) => setSalaryTarget(e.target.value)}
                  className="bg-[#0b1119] border-white/10 pl-10 text-white font-semibold text-[16px] placeholder:text-white/30 rounded-[16px]"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-[13px] font-semibold text-[#2f56ff] flex items-center gap-2">
                <Wallet size={15} /> Total Monthly Expense Budget Limit (₹)
              </Label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <Input
                  type="number"
                  min="0"
                  step="500"
                  placeholder="e.g. 15000"
                  value={overallLimit}
                  onChange={(e) => setOverallLimit(e.target.value)}
                  className="bg-[#0b1119] border-white/10 pl-10 text-white font-semibold text-[16px] placeholder:text-white/30 rounded-[16px]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving === 'overall'}
              className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 text-[15px] font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all"
            >
              {saving === 'overall' ? <><Loader2 size={15} className="animate-spin" /> Saving for {selectedMonth}...</> : `Save for ${selectedMonth}`}
            </Button>
          </form>
        </CardContent>
      </Card>

          {/* Optional Category Budgets */}
          {expenseCategories.length > 0 && (
            <div>
              <div className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-white/50">
                Optional Category Spending Limits
              </div>
              <div className="space-y-2 rounded-[22px] border border-white/10 bg-[#16212d] p-3">
                {expenseCategories.map((cat) => <CategoryBudgetRow key={cat.id} cat={cat} />)}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
