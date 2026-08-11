'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Edit2,
  X,
  ImageIcon,
  CheckCircle2,
  Loader2,
  Calendar as CalendarIcon,
  IndianRupee,
  FileText,
  CreditCard,
  Sparkles,
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
import { updateTransaction } from '@/app/actions/transactions';

const formSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: 'Amount must be positive',
  }),
  date: z.string().min(1, 'Date is required'),
  fromAccountId: z.string().min(1, 'Select an account'),
  categoryId: z.string().optional(),
  intent: z.enum(['NEED', 'WANT', 'INVESTMENT']),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export function EditTransactionDialog({
  transaction,
  accounts,
  categories,
  trigger,
}: {
  transaction: {
    id: string;
    description: string;
    amount: number;
    date: string;
    categoryId?: string | null;
    fromAccountId?: string;
    intent?: string;
    notes?: string | null;
    receiptUrl?: string | null;
  };
  accounts: Account[];
  categories: Category[];
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(transaction.receiptUrl || null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(transaction.receiptUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: transaction.description,
      amount: String(transaction.amount),
      date: transaction.date.slice(0, 10),
      fromAccountId: transaction.fromAccountId || (accounts[0]?.id || ''),
      categoryId: transaction.categoryId || '',
      intent: (transaction.intent as any) || 'WANT',
      notes: transaction.notes || '',
    },
  });

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
      const result = await updateTransaction(transaction.id, {
        description: values.description.trim(),
        amount: Number(values.amount),
        date: values.date,
        categoryId: values.categoryId || undefined,
        fromAccountId: values.fromAccountId,
        intent: values.intent,
        notes: values.notes?.trim() || undefined,
        imageUrl: uploadedUrl || undefined,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          router.refresh();
        }, 1000);
      } else {
        setServerError(result.error || 'Update failed');
      }
    } catch {
      setServerError('An error occurred');
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10 rounded-full">
            <Edit2 size={13} />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-7"
      >
        <SheetHeader>
          <SheetTitle className="text-[22px] font-bold text-white flex items-center gap-2">
            <Sparkles size={22} className="text-[#2f56ff]" /> Edit Transaction
          </SheetTitle>
        </SheetHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={40} />
            </div>
            <p className="text-[18px] font-bold text-white">Updated Successfully!</p>
          </div>
        ) : (
          <Card className="border-white/10 bg-[#141f2c] shadow-xl mt-3 rounded-[24px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[16px] font-semibold text-white">Edit Entry Information</CardTitle>
              <CardDescription className="text-[13px] text-white/50">Modify payment method, date, amount or notes</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[13px] font-medium text-white/70">Description *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                          <Input className="bg-[#16212d] border-white/10 pl-10 text-white rounded-[16px]" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-white/70">Amount (₹) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                          <Input type="number" step="0.01" className="bg-[#16212d] border-white/10 pl-10 text-white font-semibold rounded-[16px]" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          placeholder="Select date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-white/70">Payment Account</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                          {accounts.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              <div className="flex items-center gap-2">
                                <CreditCard size={14} className="text-[#2f56ff]" />
                                <span>{a.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-white/70">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectItem value="NEED">🟢 Need — Essential</SelectItem>
                          <SelectItem value="WANT">🟡 Want — Discretionary</SelectItem>
                          <SelectItem value="INVESTMENT">🔵 Investment — Future</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[13px] font-medium text-white/70">Notes</FormLabel>
                      <FormControl>
                        <Input className="bg-[#16212d] border-white/10 text-white rounded-[16px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Receipt Image Upload */}
              <div className="space-y-2">
                <FormLabel className="text-[13px] font-medium text-white/70">Receipt Image</FormLabel>
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
                    <img src={imagePreview} alt="Receipt" className="max-h-[160px] w-full object-cover" />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute left-2 top-2 h-7 w-7 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs"
                      onClick={() => { setImagePreview(null); setUploadedUrl(null); }}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[20px] border border-dashed border-white/20 bg-[#16212d]/70 py-4 text-[13px] text-white/60 hover:text-white transition-colors"
                  >
                    <ImageIcon size={18} /> Attach / Replace Receipt
                  </button>
                )}
              </div>

              {serverError && (
                <p className="rounded-[16px] bg-red-500/10 px-3 py-2 text-[13px] text-red-400 border border-red-500/20">
                  {serverError}
                </p>
              )}

              <Button
                disabled={form.formState.isSubmitting || isUploading}
                type="submit"
                className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 text-[15px] font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all"
              >
                {form.formState.isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Saving Changes...</> : 'Save Changes'}
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
