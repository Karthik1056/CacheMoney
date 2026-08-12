'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TimePicker({
  value = '09:00',
  onChange,
  className,
}: {
  value?: string;
  onChange?: (time: string) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  // Parse HH:mm into hours (12h format), minutes, and period (AM/PM)
  const parseTime = (timeStr: string) => {
    const [hStr, mStr] = (timeStr || '09:00').split(':');
    let h = parseInt(hStr || '9', 10);
    const m = parseInt(mStr || '0', 10);
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return {
      hour: String(h).padStart(2, '0'),
      minute: String(m).padStart(2, '0'),
      period,
    };
  };

  const { hour, minute, period } = parseTime(value);

  const updateTime = (newHour: string, newMinute: string, newPeriod: string) => {
    let h = parseInt(newHour, 10);
    if (newPeriod === 'PM' && h < 12) h += 12;
    if (newPeriod === 'AM' && h === 12) h = 0;
    const formatted = `${String(h).padStart(2, '0')}:${newMinute}`;
    if (onChange) {
      onChange(formatted);
    }
  };

  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutesList = ['00', '15', '30', '45'];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal bg-[#16212d] border-white/10 text-white rounded-[16px] h-10 px-3 hover:bg-[#1c2937] hover:text-white ${className}`}
        >
          <Clock className="mr-2 h-4 w-4 text-[#2f56ff]" />
          <span>
            {hour}:{minute} {period}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 border-white/10 bg-[#0e1622] text-white rounded-[20px] shadow-2xl" align="start">
        <div className="flex items-center gap-2">
          {/* Hours Select */}
          <div className="space-y-1">
            <span className="text-[11px] text-white/50 uppercase font-semibold">Hour</span>
            <Select
              value={hour}
              onValueChange={(val) => updateTime(val, minute, period)}
            >
              <SelectTrigger className="w-16 bg-[#16212d] border-white/10 text-white rounded-[12px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111a25] border-white/10 text-white max-h-48 rounded-[12px]">
                {hoursList.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="text-white font-bold pt-4">:</span>

          {/* Minutes Select */}
          <div className="space-y-1">
            <span className="text-[11px] text-white/50 uppercase font-semibold">Minute</span>
            <Select
              value={minute}
              onValueChange={(val) => updateTime(hour, val, period)}
            >
              <SelectTrigger className="w-16 bg-[#16212d] border-white/10 text-white rounded-[12px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[12px]">
                {minutesList.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AM/PM Select */}
          <div className="space-y-1">
            <span className="text-[11px] text-white/50 uppercase font-semibold">Period</span>
            <Select
              value={period}
              onValueChange={(val) => updateTime(hour, minute, val)}
            >
              <SelectTrigger className="w-16 bg-[#16212d] border-white/10 text-white rounded-[12px] h-9 font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[12px]">
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
