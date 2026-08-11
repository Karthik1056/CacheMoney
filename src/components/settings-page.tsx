'use client';

import { useState } from 'react';
import {
  CreditCard,
  FolderOpen,
  Settings,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
  createAccount,
  updateAccount,
  deleteAccount,
  createCategory,
  updateCategory,
  deleteCategory,
  createRule,
  updateRule,
  deleteRule,
} from '@/app/actions/manage';
import { getIcon, AVAILABLE_ICONS } from '@/lib/icon-map';
import { cn } from '@/lib/utils';
import type { AccountType } from '@prisma/client';

export function SettingsWebPage({
  accounts,
  categories,
  rules,
}: {
  accounts: Array<{
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    color: string | null;
  }>;
  categories: Array<{
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    isIncome: boolean;
  }>;
  rules: Array<{
    id: string;
    keyword: string;
    categoryId: string;
    categoryName: string;
    categoryIcon: string | null;
    categoryColor: string | null;
    autoConfirm: boolean;
    priority: number;
  }>;
}) {
  const [activeTab, setActiveTab] = useState('accounts');

  // Modal states
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isRuleOpen, setIsRuleOpen] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-white/10 bg-[#111a25]/95 shadow-xl">
        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#16212d]">
              <TabsTrigger value="accounts" className="data-[state=active]:bg-[#2f56ff] data-[state=active]:text-white">
                Accounts
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-[#2f56ff] data-[state=active]:text-white">
                Categories
              </TabsTrigger>
              <TabsTrigger value="rules" className="data-[state=active]:bg-[#2f56ff] data-[state=active]:text-white">
                Rules
              </TabsTrigger>
            </TabsList>

            {/* ACCOUNTS TAB */}
            <TabsContent value="accounts" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Linked Accounts</h2>
                  <p className="text-[13px] text-white/50">Manage your asset and liability accounts.</p>
                </div>
                <Sheet open={isAccountOpen} onOpenChange={setIsAccountOpen}>
                  <SheetTrigger asChild>
                    <Button className="bg-[#2f56ff] hover:bg-[#315bff] text-white">
                      <Plus size={16} /> Add Account
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                    <SheetHeader>
                      <SheetTitle className="text-[20px] font-bold text-white">Add Account</SheetTitle>
                    </SheetHeader>
                    <AccountForm
                      onSuccess={() => setIsAccountOpen(false)}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {accounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-[#16212d] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f56ff]/20 text-[#2f56ff]">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <div className="text-[15px] font-medium text-white">{acc.name}</div>
                        <div className="text-[12px] text-white/50">{acc.type} • ₹{Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <EditAccountDialog account={acc} />
                      <Button variant="ghost" size="icon" className="text-red-400 hover:bg-white/5 hover:text-red-300 h-8 w-8" onClick={async () => {
                        setIsLoading(true);
                        await deleteAccount(acc.id);
                        setIsLoading(false);
                      }}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* CATEGORIES TAB */}
            <TabsContent value="categories" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Categories</h2>
                  <p className="text-[13px] text-white/50">Manage transaction categories and icons.</p>
                </div>
                <Sheet open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                  <SheetTrigger asChild>
                    <Button className="bg-[#2f56ff] hover:bg-[#315bff] text-white">
                      <Plus size={16} /> Add Category
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                    <SheetHeader>
                      <SheetTitle className="text-[20px] font-bold text-white">Add Category</SheetTitle>
                    </SheetHeader>
                    <CategoryForm
                      onSuccess={() => setIsCategoryOpen(false)}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => {
                  const Icon = getIcon(cat.icon);
                  return (
                    <div key={cat.id} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-[#16212d] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] text-white" style={{ backgroundColor: cat.color || '#64748B' }}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="text-[15px] font-medium text-white">{cat.name}</div>
                          <div className="text-[12px] text-white/50">{cat.isIncome ? 'Income' : 'Expense'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <EditCategoryDialog category={cat} />
                        <Button variant="ghost" size="icon" className="text-red-400 hover:bg-white/5 hover:text-red-300 h-8 w-8" onClick={async () => {
                          setIsLoading(true);
                          await deleteCategory(cat.id);
                          setIsLoading(false);
                        }}>
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* RULES TAB */}
            <TabsContent value="rules" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Automation Rules</h2>
                  <p className="text-[13px] text-white/50">Auto-categorize transactions by keyword.</p>
                </div>
                <Sheet open={isRuleOpen} onOpenChange={setIsRuleOpen}>
                  <SheetTrigger asChild>
                    <Button className="bg-[#2f56ff] hover:bg-[#315bff] text-white">
                      <Plus size={16} /> Add Rule
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                    <SheetHeader>
                      <SheetTitle className="text-[20px] font-bold text-white">Add Automation Rule</SheetTitle>
                    </SheetHeader>
                    <RuleForm
                      categories={categories}
                      onSuccess={() => setIsRuleOpen(false)}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              <div className="space-y-2">
                {rules.map((rule) => {
                  const Icon = getIcon(rule.categoryIcon);
                  return (
                    <div key={rule.id} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-[#16212d] p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[12px] text-white/50">Keyword</span>
                          <span className="text-[15px] font-semibold text-white">"{rule.keyword}"</span>
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-md text-white" style={{ backgroundColor: rule.categoryColor || '#64748B' }}>
                            <Icon size={12} />
                          </div>
                          <span className="text-[14px] text-white/80">{rule.categoryName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {rule.autoConfirm && (
                          <span className="hidden text-[12px] text-[#2f56ff] sm:inline-block bg-[#2f56ff]/10 px-2 py-1 rounded-md">Auto-Confirm</span>
                        )}
                        <Button variant="ghost" size="icon" className="text-red-400 hover:bg-white/5 hover:text-red-300" onClick={async () => {
                          setIsLoading(true);
                          await deleteRule(rule.id);
                          setIsLoading(false);
                        }}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-forms for Dialogs

function AccountForm({ onSuccess, isLoading, setIsLoading }: any) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('ASSET');
  const [balance, setBalance] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await createAccount({ name, type, balance: Number(balance) || 0 });
    setIsLoading(false);
    onSuccess();
  };

  return (
    <Card className="border-white/10 bg-[#141f2c] shadow-xl mt-3 rounded-[24px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[16px] font-semibold text-white">Account Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-white/70">Account Name *</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HDFC Savings, Cash Wallet" className="bg-[#16212d] border-white/10 text-white rounded-[16px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-white/70">Account Type</Label>
            <Select value={type} onValueChange={(val) => setType(val as AccountType)}>
              <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                <SelectItem value="ASSET">Asset (Bank Account, Cash, Savings)</SelectItem>
                <SelectItem value="LIABILITY">Liability (Credit Card, Loan, Debt)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-white/70">Initial Balance (₹)</Label>
            <Input required type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0.00" className="bg-[#16212d] border-white/10 text-white rounded-[16px]" />
          </div>
          <Button disabled={isLoading} type="submit" className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CategoryForm({ onSuccess, isLoading, setIsLoading }: any) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('CircleDollarSign');
  const [color, setColor] = useState('#2f56ff');
  const [isIncome, setIsIncome] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await createCategory({ name, icon, color, isIncome });
    setIsLoading(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label className="text-[13px] font-medium text-white/70">Category Name *</Label>
        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dining Out, Salary" className="bg-[#16212d] border-white/10 text-white rounded-[16px]" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[13px] font-medium text-white/70">Icon</Label>
        <Select value={icon} onValueChange={setIcon}>
          <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] bg-[#111a25] border-white/10 text-white rounded-[16px]">
            {AVAILABLE_ICONS.map((ic) => (
              <SelectItem key={ic} value={ic}>{ic}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-[13px] font-medium text-white/70">Badge Color (Hex)</Label>
        <Input required value={color} onChange={(e) => setColor(e.target.value)} placeholder="#2f56ff" className="bg-[#16212d] border-white/10 text-white rounded-[16px]" />
      </div>
      <div className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-[#16212d] p-3">
        <Switch checked={isIncome} onCheckedChange={setIsIncome} />
        <Label className="text-[13px] font-medium text-white/80">Mark as Income Category</Label>
      </div>
      <Button disabled={isLoading} type="submit" className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all">
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Category'}
      </Button>
    </form>
  );
}

function RuleForm({ categories, onSuccess, isLoading, setIsLoading }: any) {
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [autoConfirm, setAutoConfirm] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;
    setIsLoading(true);
    await createRule({ keyword: keyword.toLowerCase(), categoryId, autoConfirm });
    setIsLoading(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label className="text-[13px] font-medium text-white/70">Keyword to Match *</Label>
        <Input required value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. uber, starbucks, amazon" className="bg-[#16212d] border-white/10 text-white rounded-[16px]" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[13px] font-medium text-white/70">Assign to Category *</Label>
        <Select value={categoryId} onValueChange={setCategoryId} required>
          <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
            {categories.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-[#16212d] p-3">
        <Switch checked={autoConfirm} onCheckedChange={setAutoConfirm} />
        <Label className="text-[13px] font-medium text-white/80">Auto-Confirm Match</Label>
      </div>
      <Button disabled={isLoading || !categoryId} type="submit" className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all">
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Rule'}
      </Button>
    </form>
  );
}

function EditAccountDialog({ account }: { account: any }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(account.name);
  const [type, setType] = useState<AccountType>(account.type);
  const [balance, setBalance] = useState(String(account.balance));
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await updateAccount(account.id, { name, type, balance: Number(balance) || 0 });
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-full">
          <Edit2 size={14} />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <SheetHeader>
          <SheetTitle className="text-[18px] font-bold text-white">Edit Account</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-white/70">Account Name</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} className="bg-[#16212d] border-white/10 text-white rounded-[16px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-white/70">Account Type</Label>
            <Select value={type} onValueChange={(val) => setType(val as AccountType)}>
              <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111a25] border-white/10 text-white rounded-[16px]">
                <SelectItem value="ASSET">Asset (Bank, Cash)</SelectItem>
                <SelectItem value="LIABILITY">Liability (Credit Card, Loan)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-white/70">Current Balance (₹)</Label>
            <Input required type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} className="bg-[#16212d] border-white/10 text-white rounded-[16px]" />
          </div>
          <Button disabled={isLoading} type="submit" className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all">Update Account</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function EditCategoryDialog({ category }: { category: any }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category.name);
  const [icon, setIcon] = useState(category.icon || 'CircleDollarSign');
  const [color, setColor] = useState(category.color || '#2f56ff');
  const [isIncome, setIsIncome] = useState(category.isIncome || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await updateCategory(category.id, { name, icon, color, isIncome });
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-full">
          <Edit2 size={14} />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-[32px] border-t border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <SheetHeader>
          <SheetTitle className="text-[18px] font-bold text-white">Edit Category</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-white/70">Category Name</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} className="bg-[#16212d] border-white/10 text-white rounded-[16px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-white/70">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="bg-[#16212d] border-white/10 text-white rounded-[16px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] bg-[#111a25] border-white/10 text-white rounded-[16px]">
                {AVAILABLE_ICONS.map((ic) => (
                  <SelectItem key={ic} value={ic}>{ic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-white/70">Badge Color (Hex)</Label>
            <Input required value={color} onChange={(e) => setColor(e.target.value)} className="bg-[#16212d] border-white/10 text-white rounded-[16px]" />
          </div>
          <div className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-[#16212d] p-3">
            <Switch checked={isIncome} onCheckedChange={setIsIncome} />
            <Label className="text-[13px] font-medium text-white/80">Mark as Income Category</Label>
          </div>
          <Button disabled={isLoading} type="submit" className="w-full bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] hover:from-[#3862ff] hover:to-[#2546b8] text-white py-5 font-bold rounded-[18px] shadow-[0_10px_25px_rgba(47,86,255,0.4)] transition-all">Update Category</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}


