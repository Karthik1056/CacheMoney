import { ResponsiveRouteShell } from '@/components/responsive-route-shell';
import { getBudgetsForMonth } from '@/app/actions/budget-goals';
import { getCategories } from '@/app/actions/manage';
import { BudgetSalaryDialog, UpsertCategoryBudgetDialog, DeleteBudgetButton } from '@/components/manage-data-dialogs';
import { BudgetFilterSheet } from '@/components/budget-filter-sheet';
import { Panel, SectionLabel } from '@/components/web-screens';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, Edit2, Sparkles, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    month?: string;
    category?: string;
  };
}) {
  const now = new Date();
  const selectedMonth = searchParams?.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [year, mon] = selectedMonth.split('-').map(Number);
  const displayDate = new Date(year, mon - 1, 1);

  const [budgets, categories] = await Promise.all([
    getBudgetsForMonth(selectedMonth),
    getCategories(),
  ]);

  let filteredBudgets = budgets;
  if (searchParams?.category && searchParams.category !== 'all') {
    filteredBudgets = budgets.filter((b) => b.categoryId === searchParams.category);
  }

  const overallSalaryBudget = budgets.find((b) => b.categoryName === 'Overall Salary');
  const overallExpenseBudget = budgets.find((b) => b.categoryName === 'Overall Expense Budget');
  const categoryBudgets = filteredBudgets.filter(
    (b) => b.categoryName !== 'Overall Salary' && b.categoryName !== 'Overall Expense Budget'
  );

  return (
    <ResponsiveRouteShell
      active="budget"
      title="Monthly Budget"
      subtitle="Configure overall monthly salary target, expense limits, and category budgets."
      headerAction={
        <div className="flex items-center gap-2">
          <BudgetSalaryDialog />
          <UpsertCategoryBudgetDialog categories={categories} />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Month Header Banner */}
        <Panel>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <SectionLabel
                title={`Budget Overview — ${format(displayDate, 'MMMM yyyy')}`}
                subtitle="All values and allocations configured for this month."
              />
            </div>
            <div className="flex items-center gap-3">
              <BudgetFilterSheet categories={categories} />
              <BudgetSalaryDialog
                trigger={
                  <Button className="gap-2 rounded-[16px] bg-[#2f56ff] hover:bg-[#2649de] text-white font-semibold">
                    <Plus size={16} /> Configure Targets
                  </Button>
                }
              />
            </div>
          </div>

          {/* Top 2 Summary Cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Overall Salary Target */}
            <div className="flex flex-col justify-between rounded-[24px] border border-emerald-500/30 bg-[linear-gradient(145deg,#065f46_0%,#047857_100%)] p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
                    <Wallet size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-white/90">Overall Salary Target</span>
                    <p className="text-[11px] text-white/70">Expected monthly income</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-[26px] font-bold tracking-tight text-white sm:text-[30px]">
                ₹{(overallSalaryBudget?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Overall Expense Limit */}
            <div className="flex flex-col justify-between rounded-[24px] border border-blue-500/30 bg-[linear-gradient(145deg,#2c54ff_0%,#183cd4_100%)] p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
                    <CreditCard size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-white/90">Overall Expense Limit</span>
                    <p className="text-[11px] text-white/70">Total monthly spending budget</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-[26px] font-bold tracking-tight text-white sm:text-[30px]">
                ₹{(overallExpenseBudget?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </Panel>

        {/* Category Specific Budgets Table / Cards */}
        <Panel>
          <div className="flex items-center justify-between gap-4">
            <SectionLabel
              title="Category Allocation Limits"
              subtitle="Specific budget limits assigned per category for this month."
            />
            <UpsertCategoryBudgetDialog
              categories={categories}
              trigger={
                <Button variant="outline" className="gap-2 rounded-[16px] border-white/10 bg-[#16212d] text-white hover:bg-white/10">
                  <Plus size={16} /> Add Category Limit
                </Button>
              }
            />
          </div>

          <div className="mt-6 space-y-3">
            {categoryBudgets.length > 0 ? (
              categoryBudgets.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-[20px] border border-white/10 bg-[#141f2c] p-4 transition-all hover:border-white/20"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white">
                      <Sparkles size={18} className="text-[#2f56ff]" />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-white">{b.categoryName}</div>
                      <div className="text-[12px] text-white/55">Monthly Cap Allocation</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[16px] font-bold text-white">
                        ₹{b.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-[#10B981]">Active Limit</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <UpsertCategoryBudgetDialog
                        categories={categories}
                        initialData={{ categoryId: b.categoryId, amount: b.amount }}
                        trigger={
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">
                            <Edit2 size={15} />
                          </Button>
                        }
                      />
                      <DeleteBudgetButton id={b.id} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-[14px] text-white/45">
                No category-specific budget caps configured for {format(displayDate, 'MMMM yyyy')}.
              </div>
            )}
          </div>
        </Panel>
      </div>
    </ResponsiveRouteShell>
  );
}
