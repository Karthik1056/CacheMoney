import { ResponsiveRouteShell } from '@/components/responsive-route-shell';
import { getAccounts, getCategories, getRules } from "@/app/actions/manage";
import { getBudgetsForMonth } from "@/app/actions/budget-goals";
import { SettingsWebPage } from "@/components/settings-page";
import { BudgetSalaryDialog } from "@/components/manage-data-dialogs";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsRoute() {
  const [accounts, categories, rules, budgets] = await Promise.all([
    getAccounts(),
    getCategories(),
    getRules(),
    getBudgetsForMonth(),
  ]);

  return (
    <ResponsiveRouteShell
      active="settings"
      title="Settings"
      subtitle="Manage your accounts, categories, and automation rules."
      headerAction={
        <BudgetSalaryDialog
          categories={categories.map((c) => ({ id: c.id, name: c.name, isIncome: c.isIncome }))}
          currentBudgets={budgets}
        />
      }
    >
      <SettingsWebPage 
        accounts={accounts} 
        categories={categories} 
        rules={rules} 
      />
    </ResponsiveRouteShell>
  );
}
