import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOverviewData } from '@/app/actions/overview';
import { getExpensesData, getAnalyticsData } from '@/app/actions/expenses';
import { getBillsData } from '@/app/actions/bills';
import { getSavingsData } from '@/app/actions/savings';
import { getNotifications } from '@/app/actions/notifications';
import { getEntries } from '@/app/actions/entries';

// Import write actions
import { createTransaction, deleteTransaction } from '@/app/actions/transactions';
import { createCategory } from '@/app/actions/manage';
import { createGoal, deleteGoal, updateGoal, createSubscription, deleteSubscription, upsertBudget, upsertMonthlySalaryAndOverallBudget, deleteBudget } from '@/app/actions/budget-goals';
import { createBill, payBill, deleteBill } from '@/app/actions/bills';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || undefined;

    const [overview, expenses, bills, savings, notifications, categories, accounts, entries, analytics] = await Promise.all([
      getOverviewData(month),
      getExpensesData(month),
      getBillsData(),
      getSavingsData(),
      getNotifications(),
      prisma.category.findMany({ where: { deletedAt: null } }),
      prisma.account.findMany({ where: { deletedAt: null } }),
      getEntries(),
      getAnalyticsData(),
    ]);

    // Format Decimal objects for clean JSON response
    const formattedAccounts = accounts.map(a => ({
      ...a,
      balance: Number(a.balance)
    }));

    return NextResponse.json({
      overview,
      expenses,
      bills,
      savings,
      notifications,
      categories,
      accounts: formattedAccounts,
      entries,
      analytics
    });
  } catch (error: any) {
    console.error('GET error in mobile sync:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch DB data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'create_transaction':
        result = await createTransaction({
          description: data.description,
          amount: Number(data.amount),
          date: data.date,
          categoryId: data.categoryId,
          fromAccountId: data.fromAccountId,
          intent: data.intent,
          notes: data.notes,
          isIncome: data.isIncome,
        });
        break;

      case 'delete_transaction':
        result = await deleteTransaction(data.id);
        break;

      case 'create_category':
        result = await createCategory({
          name: data.name,
          icon: data.icon,
          color: data.color,
          isIncome: data.isIncome,
        });
        break;

      case 'create_goal':
        result = await createGoal({
          title: data.title,
          targetAmount: Number(data.targetAmount),
          coolingDays: data.coolingDays,
        });
        break;

      case 'delete_goal':
        result = await deleteGoal(data.id);
        break;

      case 'update_goal':
        result = await updateGoal({
          id: data.id,
          title: data.title,
          targetAmount: Number(data.targetAmount),
          status: data.status,
        });
        break;

      case 'create_subscription':
        result = await createSubscription({
          name: data.name,
          category: data.category,
          amount: data.amount !== undefined ? Number(data.amount) : undefined,
          cycle: data.cycle,
          nextBilling: data.nextBilling,
          notes: data.notes,
        });
        break;

      case 'delete_subscription':
        result = await deleteSubscription(data.id);
        break;

      case 'upsert_budget':
        result = await upsertBudget({
          categoryId: data.categoryId,
          amount: Number(data.amount),
          month: data.month,
        });
        break;

      case 'upsert_targets':
        result = await upsertMonthlySalaryAndOverallBudget({
          salaryTarget: data.salaryTarget !== undefined ? Number(data.salaryTarget) : undefined,
          overallExpenseLimit: data.overallExpenseLimit !== undefined ? Number(data.overallExpenseLimit) : undefined,
          month: data.month,
        });
        break;

      case 'delete_budget':
        result = await deleteBudget(data.id);
        break;

      case 'create_bill':
        result = await createBill({
          title: data.title,
          amount: Number(data.amount),
          dueDate: data.dueDate,
          categoryId: data.categoryId,
          notes: data.notes,
        });
        break;

      case 'pay_bill':
        result = await payBill({
          billId: data.billId,
          accountId: data.accountId,
        });
        break;

      case 'delete_bill':
        result = await deleteBill(data.id);
        break;

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed executing action in mobile sync API:', error);
    return NextResponse.json({ error: error.message || 'Failed executing action' }, { status: 500 });
  }
}
