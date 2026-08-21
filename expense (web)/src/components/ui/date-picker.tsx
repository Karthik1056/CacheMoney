'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
}: {
  value?: string | Date;
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const selectedDate = value
    ? typeof value === 'string'
      ? new Date(value)
      : value
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal bg-[#16212d] border-white/10 text-white rounded-[16px] h-10 px-3 hover:bg-[#1c2937] hover:text-white',
            !selectedDate && 'text-white/40',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-white/50" />
          {selectedDate ? format(selectedDate, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-white/10 bg-[#0e1622] text-white" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date && onChange) {
              // Format as YYYY-MM-DD
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              onChange(`${year}-${month}-${day}`);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
