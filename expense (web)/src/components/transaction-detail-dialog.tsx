'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Calendar as CalendarIcon,
  IndianRupee,
  CreditCard,
  Tag,
  FileText,
  Trash2,
  Edit2,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Receipt,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { deleteTransaction } from '@/app/actions/transactions';
import { EditTransactionDialog } from '@/components/edit-transaction-dialog';

export interface TransactionItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  status?: string;
  intent?: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  accountName: string;
  fromAccountId?: string;
  categoryId?: string | null;
  isIncome?: boolean;
  notes?: string | null;
  receiptUrl?: string | null;
}

export function TransactionDetailDialog({
  transaction,
  isOpen,
  onClose,
  accounts = [],
  categories = [],
}: {
  transaction: TransactionItem | null;
  isOpen: boolean;
  onClose: () => void;
  accounts?: Array<{ id: string; name: string }>;
  categories?: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!transaction) return null;

  const isIncome = transaction.isIncome ?? false;

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    await deleteTransaction(transaction.id);
    setIsDeleting(false);
    setShowConfirmDelete(false);
    onClose();
    router.refresh();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[88vh] overflow-y-auto p-6 sm:p-7 shadow-2xl"
      >
        <SheetHeader className="text-left pb-2 border-b border-white/10 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={20} className="text-[#2f56ff]" />
            <SheetTitle className="text-[19px] font-bold text-white">Transaction Inspector</SheetTitle>
          </div>
          <Badge
            variant="outline"
            className={
              isIncome
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold px-3 py-1'
                : 'border-blue-500/40 bg-blue-500/10 text-blue-400 font-semibold px-3 py-1'
            }
          >
            {isIncome ? 'Income' : 'Expense'}
          </Badge>
        </SheetHeader>

        {/* Hero Amount & Title */}
        <div className="py-5 text-center bg-gradient-to-b from-white/5 to-transparent rounded-[24px] border border-white/5 my-4">
          <div className="text-[13px] font-medium uppercase tracking-wider text-white/50 mb-1">
            {transaction.categoryName || 'Transaction'}
          </div>
          <div
            className={`text-[36px] sm:text-[42px] font-extrabold tracking-tight ${
              isIncome ? 'text-emerald-400' : 'text-white'
            }`}
          >
            {isIncome ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[16px] font-semibold text-white/90 mt-1">
            {transaction.description || transaction.categoryName}
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-4 text-[14px]">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-white/50 flex items-center gap-2">
              <CalendarIcon size={16} className="text-[#2f56ff]" /> Date & Time
            </span>
            <span className="font-medium text-white">{new Date(transaction.date).toLocaleDateString('en-IN', { dateStyle: 'full' })}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-white/50 flex items-center gap-2">
              <CreditCard size={16} className="text-[#2f56ff]" /> Payment Account
            </span>
            <span className="font-medium text-white">{transaction.accountName}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-white/50 flex items-center gap-2">
              <Tag size={16} className="text-[#2f56ff]" /> Category
            </span>
            <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
              {transaction.categoryName}
            </Badge>
          </div>

          {transaction.intent && (
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-white/50 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" /> Spending Intent
              </span>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                {transaction.intent}
              </Badge>
            </div>
          )}

          {transaction.notes && (
            <div className="py-2 border-b border-white/5">
              <span className="text-white/50 flex items-center gap-2 mb-1">
                <FileText size={16} className="text-[#2f56ff]" /> Notes
              </span>
              <p className="text-white/80 bg-white/5 p-3 rounded-[14px] text-[13px]">{transaction.notes}</p>
            </div>
          )}

          {transaction.receiptUrl && (
            <div className="py-2">
              <span className="text-white/50 flex items-center gap-2 mb-2">
                <ImageIcon size={16} className="text-emerald-400" /> Attached Receipt Photo
              </span>
              <a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer" className="block group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={transaction.receiptUrl}
                  alt="Receipt"
                  className="max-h-56 w-full rounded-[18px] object-cover ring-1 ring-white/15 group-hover:ring-white/40 transition-all"
                />
              </a>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-col gap-3 pt-3 border-t border-white/10">
          {showConfirmDelete ? (
            <div className="p-4 rounded-[20px] bg-red-500/10 border border-red-500/30 text-center space-y-3">
              <div className="text-[13px] text-red-300 flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                Deleting will automatically revert ₹{transaction.amount} back to your account balance. Continue?
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded-[14px]"
                >
                  {isDeleting ? <Loader2 size={14} className="animate-spin mr-1" /> : null} Yes, Delete Entry
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 border-white/10 bg-white/5 text-white rounded-[14px]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                <EditTransactionDialog
                  transaction={transaction}
                  accounts={accounts}
                  categories={categories}
                  trigger={
                    <Button variant="outline" className="w-full gap-2 rounded-[16px] border-white/10 bg-white/5 text-white hover:bg-white/10 py-5">
                      <Edit2 size={16} className="text-[#2f56ff]" /> Edit Entry
                    </Button>
                  }
                />
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowConfirmDelete(true)}
                className="flex-1 gap-2 rounded-[16px] bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 py-5 font-semibold"
              >
                <Trash2 size={16} /> Delete Entry
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
