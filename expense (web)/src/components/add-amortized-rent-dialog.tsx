'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Calendar as CalendarIcon, IndianRupee, Loader2, CheckCircle2, Info } from 'lucide-react';
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
import { DatePicker } from '@/components/ui/date-picker';
import { createAmortizedExpenseSchedule } from '@/app/actions/amortized-expenses';

interface AccountOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

export function AddAmortizedRentDialog({
  accounts = [],
  categories = [],
}: {
  accounts?: AccountOption[];
  categories?: CategoryOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('Room Rent / PG Fee');
  const [totalAmount, setTotalAmount] = useState('6800');
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories.find(c => c.name.toLowerCase().includes('rent'))?.id || categories[0]?.id || '');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  // Live calculation of daily rate
  const numTotal = Number(totalAmount) || 0;
  let daysCount = 0;
  let calculatedDaily = '0.00';
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime >= 0) {
      daysCount = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (daysCount > 0 && numTotal > 0) {
        calculatedDaily = (numTotal / daysCount).toFixed(2);
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !totalAmount || !fromAccountId || !startDate || !endDate) {
      setServerError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setServerError('');

    const res = await createAmortizedExpenseSchedule({
      title: title.trim(),
      totalAmount: Number(totalAmount),
      startDate,
      endDate,
      fromAccountId,
      categoryId: categoryId || undefined,
    });

    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        router.refresh();
      }, 1200);
    } else {
      setServerError(res.error || 'Failed to create rent amortization schedule.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white font-semibold rounded-[16px] shadow-[0_8px_25px_rgba(47,86,255,0.35)] transition-all">
          <Building2 size={16} /> Add Room Rent / PG Lump Sum
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[92vh] overflow-y-auto p-6 shadow-2xl">
        <SheetHeader>
          <SheetTitle className="text-[20px] font-bold text-white flex items-center gap-2">
            <Building2 size={22} className="text-[#2f56ff]" /> Room Rent & PG Prepayment Setup
          </SheetTitle>
          <p className="text-[13px] text-white/50">
            Deducts total rent from your bank balance immediately, then automatically posts a smooth daily expense entry every day!
          </p>
        </SheetHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={40} />
            </div>
            <p className="text-[18px] font-bold text-white">Rent Amortization Scheduled!</p>
            <p className="text-[13px] text-white/60">
              ₹{totalAmount} deducted from Bank Account. Daily ₹{calculatedDaily}/day expense auto-posting active!
            </p>
          </div>
        ) : (
          <Card className="border-white/10 bg-[#141f2c] shadow-xl mt-3 rounded-[24px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[16px] font-semibold text-white">Prepayment Configuration</CardTitle>
              <CardDescription className="text-[13px] text-white/50">Specify lump-sum paid and coverage period</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-white/70">Payment Title *</Label>
                    <Input
                      placeholder="e.g. Room Rent / PG Fee"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-[#16212d] border-white/10 text-white rounded-[16px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-white/70">Total Lump Sum Paid (₹) *</Label>
                    <div className="relative">
                      <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <Input
                        type="number"
                        placeholder="6800"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        className="bg-[#16212d] border-white/10 pl-10 text-white font-semibold rounded-[16px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-white/70">Paying Bank Account *</Label>
                    <Select value={fromAccountId} onValueChange={setFromAccountId}>
                      <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                        <SelectValue placeholder="Select Account" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-white/70">Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-white/70">Coverage Start Date *</Label>
                    <DatePicker value={startDate} onChange={setStartDate} />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-white/70">Coverage End Date *</Label>
                    <DatePicker value={endDate} onChange={setEndDate} />
                  </div>
                </div>

                {/* Calculation Live Summary Box */}
                <div className="rounded-[18px] border border-[#2f56ff]/30 bg-[#2f56ff]/10 p-3.5 text-[13px] text-blue-200">
                  <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                    <Info size={15} className="text-[#2f56ff]" /> Amortization Summary:
                  </div>
                  <div className="space-y-1 text-white/80">
                    <div>• <strong>Bank Account Outflow</strong>: ₹{numTotal.toLocaleString('en-IN')} (Deducted immediately to keep bank balance accurate).</div>
                    <div>• <strong>Coverage Duration</strong>: {daysCount} Days ({startDate} to {endDate}).</div>
                    <div>• <strong>Daily Auto-Posted Expense</strong>: <strong className="text-emerald-400">₹{calculatedDaily} / day</strong>.</div>
                  </div>
                </div>

                {serverError && (
                  <p className="rounded-[16px] bg-red-500/10 px-3 py-2 text-[13px] text-red-400 border border-red-500/20">
                    {serverError}
                  </p>
                )}

                <Button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 text-[15px] font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Scheduling...</> : <><Building2 size={16} /> Confirm & Schedule Amortization</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </SheetContent>
    </Sheet>
  );
}
