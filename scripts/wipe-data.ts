/**
 * wipe-data.ts
 * Deletes ALL application data for a clean slate.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/wipe-data.ts
 * Or via: npx tsx scripts/wipe-data.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Wiping all database data...\n');

  // Order matters: delete dependent rows first to respect FK constraints
  const attachments = await prisma.attachment.deleteMany();
  console.log(`  ✓ Attachments deleted:   ${attachments.count}`);

  const notifications = await prisma.notification.deleteMany();
  console.log(`  ✓ Notifications deleted:  ${notifications.count}`);

  const transactions = await prisma.transaction.deleteMany();
  console.log(`  ✓ Transactions deleted:   ${transactions.count}`);

  const budgets = await prisma.budget.deleteMany();
  console.log(`  ✓ Budgets deleted:        ${budgets.count}`);

  const wishlist = await prisma.wishlistItem.deleteMany();
  console.log(`  ✓ Wishlist items deleted: ${wishlist.count}`);

  const subscriptions = await prisma.subscription.deleteMany();
  console.log(`  ✓ Subscriptions deleted:  ${subscriptions.count}`);

  const rules = await prisma.rule.deleteMany();
  console.log(`  ✓ Rules deleted:          ${rules.count}`);

  const tags = await prisma.tag.deleteMany();
  console.log(`  ✓ Tags deleted:           ${tags.count}`);

  const categories = await prisma.category.deleteMany();
  console.log(`  ✓ Categories deleted:     ${categories.count}`);

  const accounts = await prisma.account.deleteMany();
  console.log(`  ✓ Accounts deleted:       ${accounts.count}`);

  const apiKeys = await prisma.apiKey.deleteMany();
  console.log(`  ✓ API Keys deleted:       ${apiKeys.count}`);

  console.log('\n✅ Database wiped. Completely clean slate!');
}

main()
  .catch((e) => {
    console.error('❌ Error wiping database:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
