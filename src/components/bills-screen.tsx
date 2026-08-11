'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Receipt,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Loader2,
  Calendar as CalendarIcon,
  IndianRupee,
  Sparkles,
  FileText,
  CreditCard,
  ImageIcon,
  Upload,
  X,
  Download,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

import { createBill, payBill, deleteBill } from '@/app/actions/bills';

const billSchema = z.object({
  title: z.string().min(1, 'Bill title is required'),
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: 'Amount must be positive',
  }),
  dueDate: z.string().min(1, 'Due date is required'),
  categoryId: z.string().optional(),
  notes: z.string().optional(),
});

type BillFormValues = z.infer<typeof billSchema>;

interface BillItem {
  id: string;
  title: string;
  billerName?: string;
  amount: number;
  dueDate: string;
  status: 'DUE' | 'PAID' | 'OVERDUE';
  categoryId?: string | null;
  categoryName: string;
  categoryColor: string;
  notes: string;
  receiptUrl: string;
  paidAt: string | null;
}

export function BillsScreen({
  data,
}: {
  data: {
    bills: BillItem[];
    totalDue: number;
    totalPaid: number;
    overdueCount: number;
    categories: Array<{ id: string; name: string; color: string }>;
    accounts: Array<{ id: string; name: string; balance: number }>;
  };
}) {
  const router = useRouter();

  const [openAdd, setOpenAdd] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillItem | null>(null);
  const [payingBill, setPayingBill] = useState<BillItem | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>(data.accounts[0]?.id || '');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // File upload state for Add Bill
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      title: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      categoryId: '',
      notes: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadReceipt = async (): Promise<string> => {
    if (!receiptFile) return '';
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', receiptFile);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setIsUploading(false);
      return data.url || '';
    } catch {
      setIsUploading(false);
      return '';
    }
  };

  const onSubmitAdd = async (values: BillFormValues) => {
    let receiptUrl = '';
    if (receiptFile) {
      receiptUrl = await uploadReceipt();
    }

    const result = await createBill({
      title: values.title.trim(),
      amount: Number(values.amount),
      dueDate: values.dueDate,
      categoryId: values.categoryId || undefined,
      notes: values.notes?.trim(),
      receiptUrl: receiptUrl || undefined,
    });

    if (result.success) {
      setOpenAdd(false);
      form.reset();
      removeFile();
      router.refresh();
    }
  };

  const handlePayConfirm = async () => {
    if (!payingBill || !selectedAccount) return;
    setIsSubmittingPay(true);
    await payBill({ billId: payingBill.id, accountId: selectedAccount });
    setIsSubmittingPay(false);
    setPayingBill(null);
    setSelectedBill(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteBill(id);
    setDeletingId(null);
    if (selectedBill?.id === id) setSelectedBill(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[22px] border border-white/10 bg-[#16212d] p-5 shadow-lg">
          <div className="flex items-center justify-between text-white/60">
            <span className="text-[13px] font-semibold uppercase tracking-wider">Pending Bills</span>
            <Clock size={18} className="text-amber-400" />
          </div>
          <div className="mt-2 text-[26px] font-bold text-white">₹{data.totalDue.toLocaleString('en-IN')}</div>
          <div className="mt-1 text-[12px] text-white/40">{data.bills.filter((b) => b.status !== 'PAID').length} unpaid bills</div>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-[#16212d] p-5 shadow-lg">
          <div className="flex items-center justify-between text-white/60">
            <span className="text-[13px] font-semibold uppercase tracking-wider">Paid This Month</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-[26px] font-bold text-emerald-400">₹{data.totalPaid.toLocaleString('en-IN')}</div>
          <div className="mt-1 text-[12px] text-white/40">Logged directly into expenses</div>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-[#16212d] p-5 shadow-lg">
          <div className="flex items-center justify-between text-white/60">
            <span className="text-[13px] font-semibold uppercase tracking-wider">Overdue Alerts</span>
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div className="mt-2 text-[26px] font-bold text-red-400">{data.overdueCount}</div>
          <div className="mt-1 text-[12px] text-white/40">Bills past due date</div>
        </div>
      </div>

      {/* Action Header & Add Bill Dialog */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-white flex items-center gap-2">
            <Receipt size={22} className="text-[#2f56ff]" /> Bills & Utility Reminders
          </h2>
          <p className="text-[13px] text-white/50">Manage utility bills, track due dates, attach invoices, and automatically log paid bills into expenses.</p>
        </div>

        <Sheet open={openAdd} onOpenChange={setOpenAdd}>
          <SheetTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white shadow-[0_8px_25px_rgba(47,86,255,0.4)] rounded-[16px] transition-all">
              <Plus size={16} /> Add Bill
            </Button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-7"
          >
            <SheetHeader>
              <SheetTitle className="text-[22px] font-bold text-white flex items-center gap-2">
                <Sparkles size={22} className="text-[#2f56ff]" /> Add Utility Bill
              </SheetTitle>
            </SheetHeader>

            <Card className="border-white/10 bg-[#141f2c] shadow-xl mt-3 rounded-[24px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[16px] font-semibold text-white">Bill Details</CardTitle>
                <CardDescription className="text-[13px] text-white/50">Enter bill title, amount, due date and upload optional receipt</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitAdd)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-[13px] font-medium text-white/70">Bill Title *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Electricity Bill, Rent, Broadband"
                                className="bg-[#16212d] border-white/10 text-white placeholder:text-white/30 rounded-[16px]"
                                {...field}
                              />
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
                            <FormLabel className="text-[13px] font-medium text-white/70">Bill Amount (₹) *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="2500"
                                  className="bg-[#16212d] border-white/10 pl-10 text-white font-semibold text-[16px] rounded-[16px]"
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
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-medium text-white/70">Due Date *</FormLabel>
                            <FormControl>
                              <DatePicker
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select due date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-[13px] font-medium text-white/70">Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                                {data.categories.map((c) => (
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
                        name="notes"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-[13px] font-medium text-white/70">Notes (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Account No: 104829103"
                                className="bg-[#16212d] border-white/10 text-white placeholder:text-white/30 rounded-[16px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* File / Receipt Upload */}
                      <div className="md:col-span-2 space-y-1.5">
                        <Label className="text-[13px] font-medium text-white/70 flex items-center gap-2">
                          <ImageIcon size={15} /> Attach Bill Receipt / Invoice (Optional)
                        </Label>

                        {!receiptPreview ? (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex cursor-pointer flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-white/15 bg-[#16212d]/60 p-5 text-center hover:border-[#2f56ff]/60 hover:bg-[#16212d] transition-all"
                          >
                            <Upload size={22} className="text-white/40 mb-1" />
                            <p className="text-[13px] font-medium text-white">Click to upload bill image or PDF receipt</p>
                            <p className="text-[11px] text-white/40 mt-0.5">JPG, PNG, PDF up to 10MB</p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </div>
                        ) : (
                          <div className="relative flex items-center justify-between rounded-[18px] border border-white/10 bg-[#16212d] p-3">
                            <div className="flex items-center gap-3">
                              {receiptFile?.type.startsWith('image/') ? (
                                <img
                                  src={receiptPreview}
                                  alt="Receipt Preview"
                                  className="h-12 w-12 rounded-[12px] object-cover border border-white/10"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#2f56ff]/20 text-[#2f56ff]">
                                  <FileText size={20} />
                                </div>
                              )}
                              <div>
                                <p className="text-[13px] font-semibold text-white truncate max-w-[200px]">
                                  {receiptFile?.name}
                                </p>
                                <p className="text-[11px] text-white/40">
                                  {((receiptFile?.size || 0) / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={removeFile}
                              className="h-8 w-8 rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                            >
                              <X size={15} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      disabled={form.formState.isSubmitting || isUploading}
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 text-[15px] font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all"
                    >
                      {form.formState.isSubmitting || isUploading ? (
                        <><Loader2 size={16} className="animate-spin" /> Saving Bill...</>
                      ) : (
                        <><Receipt size={16} /> Save Bill</>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </SheetContent>
        </Sheet>
      </div>

      {/* Bill List */}
      <div className="space-y-3">
        {data.bills.length > 0 ? (
          data.bills.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBill(b)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-[#16212d] p-4 sm:p-5 hover:border-[#2f56ff]/40 hover:bg-[#192634] transition-all shadow-md cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#2f56ff]/15 text-[#2f56ff] group-hover:bg-[#2f56ff] group-hover:text-white transition-all shrink-0">
                  <Receipt size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-bold text-white group-hover:text-[#2f56ff] transition-colors">{b.title}</span>
                    {b.status === 'PAID' && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Paid</Badge>
                    )}
                    {b.status === 'OVERDUE' && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Overdue</Badge>
                    )}
                    {b.status === 'DUE' && (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Due</Badge>
                    )}
                  </div>
                  <div className="mt-0.5 text-[13px] text-white/50 flex items-center gap-3">
                    <span>Due: {b.dueDate}</span>
                    <span>• {b.categoryName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <div className="text-right">
                  <div className="text-[18px] font-bold text-white">₹{b.amount.toLocaleString('en-IN')}</div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {/* Pay Now Button */}
                  {b.status !== 'PAID' ? (
                    <Button
                      size="sm"
                      onClick={() => setPayingBill(b)}
                      className="gap-1.5 bg-[#2f56ff] hover:bg-[#3862ff] text-white font-semibold rounded-[14px] px-4"
                    >
                      Pay Bill
                    </Button>
                  ) : (
                    <span className="text-[12px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> Settled
                    </span>
                  )}

                  {/* Delete Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={deletingId === b.id}
                    onClick={() => handleDelete(b.id)}
                    className="h-8 w-8 text-red-400 hover:bg-white/10 rounded-full"
                  >
                    {deletingId === b.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-white/10 bg-[#16212d] p-12 text-center">
            <Receipt size={40} className="mx-auto text-white/20" />
            <p className="mt-3 text-[15px] font-semibold text-white">No Utility Bills Logged</p>
            <p className="mt-1 text-[13px] text-white/40">Add your electricity, Wi-Fi, or rent bills to get reminder alerts.</p>
          </div>
        )}
      </div>

      {/* Bill Detail Inspector Bottom Sheet Drawer */}
      <Sheet open={!!selectedBill} onOpenChange={(v: boolean) => { if (!v) setSelectedBill(null); }}>
        <SheetContent
          side="bottom"
          className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[92vh] overflow-y-auto p-6 shadow-2xl"
        >
          {selectedBill && (
            <div className="space-y-5">
              <SheetHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#2f56ff]/20 text-[#2f56ff]">
                      <Receipt size={24} />
                    </div>
                    <div>
                      <SheetTitle className="text-[22px] font-bold text-white leading-tight">
                        {selectedBill.title}
                      </SheetTitle>
                      <p className="text-[13px] text-white/50 mt-0.5">
                        {selectedBill.categoryName} • Created Utility Record
                      </p>
                    </div>
                  </div>
                  {selectedBill.status === 'PAID' && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[13px] px-3 py-1">
                      Paid
                    </Badge>
                  )}
                  {selectedBill.status === 'OVERDUE' && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[13px] px-3 py-1">
                      Overdue
                    </Badge>
                  )}
                  {selectedBill.status === 'DUE' && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[13px] px-3 py-1">
                      Due
                    </Badge>
                  )}
                </div>
              </SheetHeader>

              <div className="rounded-[22px] border border-white/10 bg-[#141f2c] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-[14px] text-white/60">Bill Amount</span>
                  <span className="text-[26px] font-bold text-white">₹{selectedBill.amount.toLocaleString('en-IN')}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[14px]">
                  <div>
                    <span className="text-white/50 text-[12px] block">Due Date</span>
                    <span className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-[#2f56ff]" />
                      {selectedBill.dueDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-white/50 text-[12px] block">Category</span>
                    <span className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
                      {selectedBill.categoryName}
                    </span>
                  </div>
                </div>

                {selectedBill.notes ? (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-white/50 text-[12px] block">Notes</span>
                    <p className="text-[13px] text-white/80 mt-1 leading-relaxed">{selectedBill.notes}</p>
                  </div>
                ) : null}

                {/* Receipt Attachment Preview / Download */}
                {selectedBill.receiptUrl ? (
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-white/50 text-[12px] block mb-2">Attached Receipt / Invoice</span>
                    <div className="rounded-[16px] border border-white/10 bg-[#0e1622] p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ImageIcon size={20} className="text-[#2f56ff]" />
                        <span className="text-[13px] font-medium text-white truncate max-w-[200px]">Bill Receipt Attachment</span>
                      </div>
                      <a
                        href={selectedBill.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-[12px] bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-white/20 transition-all"
                      >
                        <Download size={13} /> View
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-3 pt-2">
                {selectedBill.status !== 'PAID' ? (
                  <Button
                    onClick={() => {
                      const b = selectedBill;
                      setSelectedBill(null);
                      setPayingBill(b);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 text-[15px] font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all"
                  >
                    Pay Bill Now
                  </Button>
                ) : null}

                <Button
                  variant="outline"
                  disabled={deletingId === selectedBill.id}
                  onClick={() => handleDelete(selectedBill.id)}
                  className="border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 py-5 rounded-[18px] px-5"
                >
                  <Trash2 size={16} /> Delete
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Pay Bill Confirmation Sheet */}
      <Sheet open={!!payingBill} onOpenChange={(v: boolean) => { if (!v) setPayingBill(null); }}>
        <SheetContent
          side="bottom"
          className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
        >
          <SheetHeader>
            <SheetTitle className="text-[20px] font-bold text-white flex items-center gap-2">
              <CreditCard size={20} className="text-[#2f56ff]" /> Confirm Bill Payment
            </SheetTitle>
          </SheetHeader>

          {payingBill && (
            <div className="mt-2 space-y-4">
              <div className="rounded-[18px] border border-white/10 bg-[#16212d] p-4">
                <div className="text-[13px] text-white/50">Bill Title</div>
                <div className="text-[18px] font-bold text-white">{payingBill.title}</div>
                <div className="mt-2 text-[20px] font-bold text-emerald-400">
                  ₹{payingBill.amount.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-white/70">Deduct From Payment Account *</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                    {data.accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} (Balance: ₹{a.balance.toLocaleString('en-IN')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[12px] text-white/40">Paying this bill will automatically log an Expense entry under this account.</p>
              </div>

              <Button
                disabled={isSubmittingPay || !selectedAccount}
                onClick={handlePayConfirm}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white py-5 text-[15px] font-bold rounded-[18px] shadow-[0_10px_25px_rgba(16,185,129,0.3)] transition-all"
              >
                {isSubmittingPay ? <><Loader2 size={16} className="animate-spin" /> Processing Payment...</> : 'Confirm Payment & Log Expense'}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
