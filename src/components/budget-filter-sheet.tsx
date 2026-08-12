'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface CategoryOption {
  id: string;
  name: string;
}

export function BudgetFilterSheet({
  categories = [],
}: {
  categories?: CategoryOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || 'all');
  
  const initialMonthDate = searchParams.get('month') 
    ? new Date(`${searchParams.get('month')}-01T00:00:00`) 
    : new Date();
  
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(initialMonthDate);

  const handleApply = () => {
    const params = new URLSearchParams();

    if (selectedCat !== 'all') {
      params.set('category', selectedCat);
    }
    if (selectedMonth) {
      params.set('month', format(selectedMonth, 'yyyy-MM'));
    }

    router.push(`/budget?${params.toString()}`);
    setOpen(false);
  };

  const handleReset = () => {
    setSelectedCat('all');
    setSelectedMonth(new Date());
    router.push('/budget');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 rounded-[16px] border-white/10 bg-[#16212d] text-white hover:bg-white/10 hover:text-white"
        >
          <Filter size={16} />
          <span>Filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md border-l border-white/10 bg-[#0f1722] p-6 text-white"
      >
        <SheetHeader className="pb-4 border-b border-white/10">
          <SheetTitle className="text-xl font-bold text-white flex items-center justify-between">
            <span>Filter Budgets</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-white/60 hover:text-white gap-1 text-xs"
            >
              <RotateCcw size={14} />
              Reset
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Month Selector with Shadcn Calendar */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-white/60">Select Billing Month</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-[#16212d] border-white/10 text-white rounded-[16px] hover:bg-white/10 hover:text-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-[#2f56ff]" />
                  {selectedMonth ? format(selectedMonth, 'MMMM yyyy') : <span>Pick a month</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#111a25] border-white/10 text-white rounded-[20px]" align="start">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(d) => d && setSelectedMonth(d)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-white/60">Category</Label>
            <Select value={selectedCat} onValueChange={setSelectedCat}>
              <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-white/10">
            <Button
              onClick={handleApply}
              className="w-full bg-[#2f56ff] hover:bg-[#2548e6] text-white rounded-[16px] py-6 font-semibold shadow-[0_8px_20px_rgba(47,86,255,0.35)]"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
