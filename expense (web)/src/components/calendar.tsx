'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, parse } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ExpensesCalendar({
  initialMonth,
  transactionDates = [],
}: {
  initialMonth?: string; // YYYY-MM format
  transactionDates?: string[]; // YYYY-MM-DD strings
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const parsedMonth = initialMonth
    ? parse(initialMonth, 'yyyy-MM', new Date())
    : new Date();

  const initialDateStr = searchParams.get('date');
  const initialSelected = initialDateStr ? parse(initialDateStr, 'yyyy-MM-dd', new Date()) : undefined;

  const [currentMonth, setCurrentMonth] = useState<Date>(parsedMonth);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialSelected);

  const txDates = transactionDates.map((d) => parse(d, 'yyyy-MM-dd', new Date()));

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    const params = new URLSearchParams(searchParams.toString());
    if (date) {
      params.set('date', format(date, 'yyyy-MM-dd'));
    } else {
      params.delete('date');
    }
    router.push(`/expenses?${params.toString()}`);
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    const monthStr = format(month, 'yyyy-MM');
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', monthStr);
    params.delete('date');
    router.push(`/expenses?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-md rounded-[20px] border border-white/10 bg-[#16212d] p-3.5 sm:p-4 shadow-md">
      <div className="flex items-center justify-between pb-1.5">
        <button
          type="button"
          onClick={() => {
            const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
            handleMonthChange(prev);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-[14px] font-semibold text-white/90 sm:text-[15px]">
          {format(currentMonth, 'MMMM - yyyy')}
        </div>
        <button
          type="button"
          onClick={() => {
            const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
            handleMonthChange(next);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        showOutsideDays
        modifiers={{
          hasTx: txDates,
        }}
        modifiersClassNames={{
          hasTx: 'after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-[#2f56ff]',
        }}
        className="p-0.5"
        classNames={{
          root: 'w-full',
          months: 'flex flex-col space-y-2',
          month: 'space-y-2',
          month_caption: 'hidden', // Custom caption header used above
          nav: 'hidden', // Custom nav buttons used above
          month_grid: 'w-full border-collapse',
          weekdays: 'grid grid-cols-7 text-center text-[11px] text-white/70 mb-1',
          weekday: 'font-normal',
          week: 'grid grid-cols-7 gap-1 mt-0.5',
          day: 'relative flex h-8 items-center justify-center rounded-[10px] text-[12px] sm:h-8 sm:text-[13px]',
          day_button: cn(
            buttonVariants({ variant: 'ghost' }),
            'h-full w-full rounded-[10px] p-0 font-normal text-white/80 hover:bg-white/10 hover:text-white',
          ),
          selected: '!bg-[#2f56ff] font-semibold !text-white shadow-[0_6px_14px_rgba(47,86,255,0.34)]',
          today: 'border border-[#2f56ff]/60 font-semibold text-white',
          outside: 'text-white/25',
          disabled: 'text-white/20 opacity-50',
          hidden: 'invisible',
        }}
      />
    </div>
  );
}
