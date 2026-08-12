'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Plus,
  X,
  ImageIcon,
  CheckCircle2,
  Loader2,
  Calendar as CalendarIcon,
  IndianRupee,
  FileText,
  CreditCard,
  Tag,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { createTransaction } from '@/app/actions/transactions';

const formSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: 'Amount must be a positive number',
  }),
  date: z.string().min(1, 'Date is required'),
  fromAccountId: z.string().min(1, 'Please select an account'),
  categoryId: z.string().optional(),
  intent: z.enum(['NEED', 'WANT', 'INVESTMENT']),
  notes: z.string().optional(),
  isIncome: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface Account {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isIncome: boolean;
}

interface AddTransactionDialogProps {
  accounts?: Account[];
  categories?: Category[];
  trigger?: React.ReactNode;
}

export function AddTransactionDialog({
  accounts = [],
  categories = [],
  trigger,
}: AddTransactionDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      fromAccountId: accounts[0]?.id || '',
      categoryId: '',
      intent: 'WANT',
      notes: '',
      isIncome: false,
    },
  });

  const watchIsIncome = form.watch('isIncome');
  const watchAmount = form.watch('amount');

  const resetAll = () => {
    form.reset({
      description: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      fromAccountId: accounts[0]?.id || '',
      categoryId: '',
      intent: 'WANT',
      notes: '',
      isIncome: false,
    });
    setImagePreview(null);
    setUploadedUrl(null);
    setSuccess(false);
    setServerError('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setUploadedUrl(data.url);
      } else {
        setServerError(data.error || 'Upload failed');
      }
    } catch {
      setServerError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setServerError('');

    try {
      const result = await createTransaction({
        description: values.description.trim(),
        amount: Number(values.amount),
        date: values.date,
        categoryId: values.categoryId || undefined,
        fromAccountId: values.fromAccountId,
        intent: values.intent,
        notes: values.notes?.trim() || undefined,
        imageUrl: uploadedUrl || undefined,
        isIncome: values.isIncome,
      });

      if (result.success) {
        setSuccess(true);
        setOpen(false);
        resetAll();
        router.refresh();
      } else {
        setServerError(result.error || 'Failed to save transaction');
      }
    } catch {
      setServerError('An error occurred');
    }
  };

  const filteredCategories = categories.filter((c) => c.isIncome === watchIsIncome);

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetAll(); }}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button className="gap-2 bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white shadow-[0_8px_25px_rgba(47,86,255,0.4)] transition-all">
            <Plus size={16} /> Add Entry
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-7"
      >
        <SheetHeader>
          <SheetTitle className="text-[22px] font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles size={22} className="text-[#2f56ff]" /> Add New Transaction
          </SheetTitle>
        </SheetHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={40} />
            </div>
            <p className="text-[18px] font-bold text-white">Transaction Saved!</p>
            <p className="text-[13px] text-white/50">Updating your balance & dashboard...</p>
          </div>
        ) : (
          <Card className="border-white/10 bg-[#141f2c] shadow-xl mt-3 rounded-[24px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[16px] font-semibold text-white">Transaction Details</CardTitle>
              <CardDescription className="text-[13px] text-white/50">Fill in transaction amount, date, and account</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Segmented Income vs Expense Selector */}
              <FormField
                control={form.control}
                name="isIncome"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2 rounded-[20px] bg-[#16212d] p-1.5 border border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange(false);
                            form.setValue('categoryId', '');
                          }}
                          className={cn(
                            'flex items-center justify-center gap-2 rounded-[16px] py-3 text-[15px] font-semibold transition-all',
                            !field.value
                              ? 'bg-gradient-to-r from-red-500/20 to-red-600/30 text-red-400 border border-red-500/40 shadow-sm'
                              : 'text-white/50 hover:text-white',
                          )}
                        >
                          <ArrowDownRight size={18} /> Expense
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange(true);
                            form.setValue('categoryId', '');
                          }}
                          className={cn(
                            'flex items-center justify-center gap-2 rounded-[16px] py-3 text-[15px] font-semibold transition-all',
                            field.value
                              ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/30 text-emerald-400 border border-emerald-500/40 shadow-sm'
                              : 'text-white/50 hover:text-white',
                          )}
                        >
                          <ArrowUpRight size={18} /> Income / Salary
                        </button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* 2-Column Grid on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[13px] font-medium text-white/70">Description *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                          <Input
                            placeholder="e.g. Swiggy food delivery, Monthly Salary"
                            className="bg-[#16212d] border-white/10 pl-10 text-white placeholder:text-white/30 focus:border-[#2f56ff] rounded-[16px]"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-white/70">Amount (₹) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="bg-[#16212d] border-white/10 pl-10 text-white font-semibold text-[16px] placeholder:text-white/30 focus:border-[#2f56ff] rounded-[16px]"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-white/70">Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select transaction date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Account Dropdown */}
                <FormField
                  control={form.control}
                  name="fromAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-white/70">Payment Account *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                            <SelectValue placeholder="Select account..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                          {accounts.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              <div className="flex items-center gap-2">
                                <CreditCard size={14} className="text-[#2f56ff]" />
                                <span>{a.name} ({a.type})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category Dropdown */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-white/70">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                          {filteredCategories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color || '#2f56ff' }} />
                                <span>{c.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Intent Selector (Expense Only) */}
                {!watchIsIncome && (
                  <FormField
                    control={form.control}
                    name="intent"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-[13px] font-medium text-white/70">Spending Intent</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                            <SelectItem value="NEED">🟢 Need — Essential living expense</SelectItem>
                            <SelectItem value="WANT">🟡 Want — Discretionary spend</SelectItem>
                            <SelectItem value="INVESTMENT">🔵 Investment — Future returns</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[13px] font-medium text-white/70">Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Additional details..."
                          className="bg-[#16212d] border-white/10 text-white placeholder:text-white/30 rounded-[16px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Modern Drag-and-Drop Image Uploader */}
              <div className="space-y-2">
                <FormLabel className="text-[13px] font-medium text-white/70">Receipt Photo / PDF</FormLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-[20px] border border-white/15 bg-[#16212d]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Receipt preview" className="max-h-[160px] w-full object-cover" />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-xs">
                        <Loader2 size={24} className="animate-spin text-[#2f56ff]" />
                      </div>
                    )}
                    {uploadedUrl && !isUploading && (
                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
                        <CheckCircle2 size={12} /> Uploaded
                      </div>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute left-3 top-3 h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs"
                      onClick={() => { setImagePreview(null); setUploadedUrl(null); }}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-[20px] border border-dashed border-white/20 bg-[#16212d]/70 py-6 text-white/50 hover:border-[#2f56ff]/60 hover:bg-[#16212d] hover:text-white transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f56ff]/15 text-[#2f56ff]">
                      <ImageIcon size={20} />
                    </div>
                    <span className="text-[13px] font-medium">Click or tap to upload receipt</span>
                    <span className="text-[11px] text-white/35">JPG, PNG, WEBP, PDF • Max 10MB</span>
                  </button>
                )}
              </div>

              {serverError && (
                <p className="rounded-[16px] bg-red-500/10 px-4 py-3 text-[13px] text-red-400 border border-red-500/20 font-medium">
                  {serverError}
                </p>
              )}

              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isUploading}
                className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 text-[15px] font-bold shadow-[0_10px_25px_rgba(47,86,255,0.4)] rounded-[18px] transition-all"
              >
                {form.formState.isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving Transaction...</>
                ) : (
                  <><Plus size={16} /> Save {watchIsIncome ? 'Income' : 'Expense'}</>
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
