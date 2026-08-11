'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, RotateCcw, Filter } from 'lucide-react';

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
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface CategoryOption {
  id: string;
  name: string;
}

interface AccountOption {
  id: string;
  name: string;
}

export function FilterDrawer({
  categories = [],
  accounts = [],
}: {
  categories?: CategoryOption[];
  accounts?: AccountOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || 'all');
  const [selectedAcc, setSelectedAcc] = useState(searchParams.get('account') || 'all');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCat && selectedCat !== 'all') params.set('category', selectedCat);
    else params.delete('category');

    if (selectedAcc && selectedAcc !== 'all') params.set('account', selectedAcc);
    else params.delete('account');

    if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus);
    else params.delete('status');

    params.set('page', '1');
    router.push(`/entries?${params.toString()}`);
    setOpen(false);
  };

  const resetFilters = () => {
    setSelectedCat('all');
    setSelectedAcc('all');
    setSelectedStatus('all');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('account');
    params.delete('status');
    params.set('page', '1');
    router.push(`/entries?${params.toString()}`);
    setOpen(false);
  };

  const activeFilterCount =
    (selectedCat !== 'all' ? 1 : 0) +
    (selectedAcc !== 'all' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#16212d] px-4 py-2.5 text-[14px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <SlidersHorizontal size={16} className="text-[#2f56ff]" />
          <span>Filter</span>
          {activeFilterCount > 0 ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2f56ff] text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[88vh] overflow-y-auto p-6 shadow-2xl"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-[20px] font-bold text-white flex items-center gap-2">
            <Filter size={20} className="text-[#2f56ff]" /> Filter Transactions
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-2">
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

          {/* Status Filter */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-white/70">Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full bg-[#16212d] border-white/10 text-white rounded-[16px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="UNREVIEWED">Unreviewed</SelectItem>
                <SelectItem value="FLAGGED">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            <Button
              type="button"
              onClick={applyFilters}
              className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 text-[15px] font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all"
            >
              Apply Filters
            </Button>

            {activeFilterCount > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="w-full gap-2 rounded-[16px] border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <RotateCcw size={15} />
                Reset Filters
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
