import { PrismaClient, AccountType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding (Phase DB-4)...');

  // 1. Seed Accounts (Assets & Liabilities)
  await prisma.account.upsert({
    where: { name: 'Checking Account' },
    update: {},
    create: {
      name: 'Checking Account',
      type: AccountType.ASSET,
      currency: 'USD',
      balance: 2500.00,
      color: '#3B82F6', // Blue
    },
  });

  await prisma.account.upsert({
    where: { name: 'Cash Wallet' },
    update: {},
    create: {
      name: 'Cash Wallet',
      type: AccountType.ASSET,
      currency: 'USD',
      balance: 300.00,
      color: '#10B981', // Green
    },
  });

  await prisma.account.upsert({
    where: { name: 'Credit Card' },
    update: {},
    create: {
      name: 'Credit Card',
      type: AccountType.LIABILITY,
      currency: 'USD',
      balance: 450.00,
      color: '#EF4444', // Red
    },
  });

  console.log('  ✅ Seeded Accounts: Checking Account, Cash Wallet, Credit Card');

  // 2. Seed Categories
  const categories = [
    // Income Categories
    { name: 'Salary', isIncome: true, icon: 'Wallet', color: '#22C55E' },
    { name: 'Freelance', isIncome: true, icon: 'Briefcase', color: '#10B981' },
    { name: 'Investments', isIncome: true, icon: 'TrendingUp', color: '#6366F1' },

    // Expense Categories
    { name: 'Overall', isIncome: false, icon: 'PieChart', color: '#64748B' }, // Default for global budget limits
    { name: 'Groceries', isIncome: false, icon: 'ShoppingCart', color: '#F59E0B' },
    { name: 'Dining & Coffee', isIncome: false, icon: 'Coffee', color: '#D97706' },
    { name: 'Utilities & Bills', isIncome: false, icon: 'Zap', color: '#3B82F6' },
    { name: 'Subscriptions', isIncome: false, icon: 'Repeat', color: '#8B5CF6' },
    { name: 'Entertainment', isIncome: false, icon: 'Film', color: '#EC4899' },
    { name: 'Transportation', isIncome: false, icon: 'Car', color: '#06B6D4' },
    { name: 'Health & Fitness', isIncome: false, icon: 'Activity', color: '#14B8A6' },
    { name: 'Shopping', isIncome: false, icon: 'ShoppingBag', color: '#F43F5E' },
  ];

  const categoryRecords: Record<string, string> = {};

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        icon: cat.icon,
        color: cat.color,
        isIncome: cat.isIncome,
      },
      create: cat,
    });
    categoryRecords[cat.name] = created.id;
  }

  console.log(`  ✅ Seeded ${categories.length} Master Categories`);

  // 3. Seed Default Auto-Categorization Rules
  const defaultRules = [
    { keyword: 'starbucks', categoryName: 'Dining & Coffee' },
    { keyword: 'uber', categoryName: 'Transportation' },
    { keyword: 'netflix', categoryName: 'Subscriptions' },
    { keyword: 'spotify', categoryName: 'Subscriptions' },
    { keyword: 'gym', categoryName: 'Health & Fitness' },
    { keyword: 'amazon', categoryName: 'Shopping' },
    { keyword: 'walmart', categoryName: 'Groceries' },
  ];

  for (const rule of defaultRules) {
    const catId = categoryRecords[rule.categoryName];
    if (catId) {
      const existingRule = await prisma.rule.findFirst({
        where: { keyword: rule.keyword },
      });

      if (!existingRule) {
        await prisma.rule.create({
          data: {
            keyword: rule.keyword,
            categoryId: catId,
            autoConfirm: true,
            priority: 10,
          },
        });
      }
    }
  }

  console.log(`  ✅ Seeded ${defaultRules.length} Auto-Categorization Rules`);

  // 4. Seed Default Subscriptions
  const existingSub = await prisma.subscription.findFirst({
    where: { name: 'Netflix Premium' },
  });

  if (!existingSub) {
    await prisma.subscription.create({
      data: {
        name: 'Netflix Premium',
        amount: 19.99,
        cycle: 'MONTHLY',
        nextBilling: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        active: true,
      },
    });
  }

  console.log('  ✅ Seeded Sample Subscription (Netflix Premium)');

  // 5. Seed Default API Key for n8n Local Automation
  await prisma.apiKey.upsert({
    where: { key: 'exp_mgr_n8n_local_key_2026' },
    update: {},
    create: {
      key: 'exp_mgr_n8n_local_key_2026',
      name: 'n8n Local Docker Workflow',
    },
  });

  console.log('  ✅ Seeded Default n8n API Key');

  // 6. Seed Test Data (Budget, Transactions, Wishlist, Notification)
  const checkingAccount = await prisma.account.findUnique({ where: { name: 'Checking Account' } });
  
  if (checkingAccount) {
    // Seed Overall Budget for August 2026
    const overallCatId = categoryRecords['Overall'];
    if (overallCatId) {
      await prisma.budget.upsert({
        where: { month_categoryId: { month: '2026-08', categoryId: overallCatId } },
        update: {},
        create: {
          month: '2026-08',
          amount: 2000.00,
          categoryId: overallCatId,
        },
      });
      console.log('  ✅ Seeded Budget');
    }

    // Seed some transactions for August 2026
    const groceriesCatId = categoryRecords['Groceries'];
    if (groceriesCatId) {
      await prisma.transaction.create({
        data: {
          amount: 150.75,
          description: 'Whole Foods Market',
          date: new Date('2026-08-05T12:00:00Z'),
          categoryId: groceriesCatId,
          fromAccountId: checkingAccount.id,
          status: 'CONFIRMED',
          intent: 'NEED',
        }
      });
      await prisma.transaction.create({
        data: {
          amount: 45.00,
          description: 'Trader Joe\'s Groceries',
          date: new Date('2026-08-01T09:30:00Z'),
          categoryId: groceriesCatId,
          fromAccountId: checkingAccount.id,
          status: 'CONFIRMED',
          intent: 'NEED',
        }
      });
      // A transaction for previous month
      await prisma.transaction.create({
        data: {
          amount: 120.00,
          description: 'July Groceries',
          date: new Date('2026-07-28T10:00:00Z'),
          categoryId: groceriesCatId,
          fromAccountId: checkingAccount.id,
          status: 'CONFIRMED',
          intent: 'NEED',
        }
      });
      console.log('  ✅ Seeded Transactions');
    }
  }

  // Seed Wishlist Goal
  await prisma.wishlistItem.create({
    data: {
      title: 'New Laptop',
      amount: 1500.00,
      coolingUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'WAITING',
    }
  });
  console.log('  ✅ Seeded WishlistItem');

  // Seed Notifications
  await prisma.notification.create({
    data: {
      type: 'transaction',
      title: 'Large Expense',
      subtitle: 'You spent $150.75 at Whole Foods',
      icon: 'AlertCircle',
      read: false,
    }
  });
  await prisma.notification.create({
    data: {
      type: 'budget_alert',
      title: 'Budget Alert',
      subtitle: 'You have reached 50% of your Groceries budget',
      icon: 'Bell',
      read: true,
    }
  });
  console.log('  ✅ Seeded Notifications');

  console.log('🎉 Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
