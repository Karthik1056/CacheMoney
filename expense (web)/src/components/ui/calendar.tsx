'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, getDefaultClassNames, type DayPickerProps } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CalendarProps = DayPickerProps;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        ...defaultClassNames,
        root: cn('w-full', defaultClassNames.root),
        months: cn('flex flex-col sm:flex-row gap-4', defaultClassNames.months),
        month: cn('space-y-4', defaultClassNames.month),
        month_caption: cn('flex items-center justify-center pt-1 relative', defaultClassNames.month_caption),
        caption_label: cn('text-sm font-medium text-white', defaultClassNames.caption_label),
        nav: cn('flex items-center gap-2', defaultClassNames.nav),
        button_previous: cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'h-8 w-8 border-white/10 bg-white/5 text-white hover:bg-white/10', defaultClassNames.button_previous),
        button_next: cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'h-8 w-8 border-white/10 bg-white/5 text-white hover:bg-white/10', defaultClassNames.button_next),
        month_grid: cn('w-full border-collapse space-y-1', defaultClassNames.month_grid),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn('w-9 rounded-md text-[0.8rem] font-normal text-white/55', defaultClassNames.weekday),
        week: cn('mt-1 flex w-full', defaultClassNames.week),
        day: cn('relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20', defaultClassNames.day),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 rounded-[12px] p-0 font-normal text-white/80 hover:bg-white/10 hover:text-white aria-selected:opacity-100',
          defaultClassNames.day_button,
        ),
        today: cn('bg-white/5 text-white', defaultClassNames.today),
        outside: cn('text-white/25', defaultClassNames.outside),
        selected: cn('bg-[#2f56ff] text-white hover:bg-[#2f56ff] hover:text-white focus:bg-[#2f56ff] focus:text-white', defaultClassNames.selected),
        disabled: cn('text-white/20 opacity-50', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          if (orientation === 'left') {
            return <ChevronLeft className={cn('h-4 w-4', chevronClassName)} {...chevronProps} />;
          }

          if (orientation === 'right') {
            return <ChevronRight className={cn('h-4 w-4', chevronClassName)} {...chevronProps} />;
          }

          return <ChevronRight className={cn('h-4 w-4 rotate-90', chevronClassName)} {...chevronProps} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
