import { prisma } from '../src/lib/prisma';

const PREDEFINED_CATEGORIES = [
  { name: 'Food & Dining', icon: 'Utensils', color: '#EF4444', isIncome: false },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#F59E0B', isIncome: false },
  { name: 'Housing & Rent', icon: 'Home', color: '#10B981', isIncome: false },
  { name: 'Transportation', icon: 'Car', color: '#3B82F6', isIncome: false },
  { name: 'Utilities', icon: 'Zap', color: '#6366F1', isIncome: false },
  { name: 'Entertainment', icon: 'Film', color: '#EC4899', isIncome: false },
  { name: 'Healthcare', icon: 'HeartPulse', color: '#14B8A6', isIncome: false },
  { name: 'Salary', icon: 'Briefcase', color: '#22C55E', isIncome: true },
  { name: 'Freelance & Business', icon: 'Laptop', color: '#06B6D4', isIncome: true },
  { name: 'Investments', icon: 'TrendingUp', color: '#8B5CF6', isIncome: true },
];

async function seedCategories() {
  console.log('🌱 Seeding categories into Prisma database...');
  for (const cat of PREDEFINED_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        icon: cat.icon,
        color: cat.color,
        isIncome: cat.isIncome,
      },
      create: cat,
    });
  }
  console.log('✅ Successfully seeded all categories!');
}

seedCategories()
  .catch((e) => {
    console.error('❌ Error seeding categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
