import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.promoCodeUsage.deleteMany();
  await prisma.inboxNotification.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleaned existing data');

  // Create Promo Codes
  const welcomePromo = await prisma.promoCode.create({
    data: {
      code: 'WELCOME50',
      description: 'Welcome bonus - 50% off on first purchase',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      minPurchase: 100000,
      maxDiscount: 200000,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxUsesPerUser: 1,
      maxUses: 1000
    }
  });

  const freeShipPromo = await prisma.promoCode.create({
    data: {
      code: 'FREESHIP',
      description: 'Free shipping for all orders',
      discountType: 'FREE_SHIPPING',
      discountValue: 0,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxUsesPerUser: 3,
      maxUses: null
    }
  });

  console.log('✅ Created promo codes:', welcomePromo.code, freeShipPromo.code);

  // Create Users (for testing)
  const alice = await prisma.user.create({
    data: {
      id: 'user-alice-001',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      emailVerified: true,
      isActive: true
    }
  });

  const bob = await prisma.user.create({
    data: {
      id: 'user-bob-002',
      name: 'Bob Smith',
      email: 'bob@example.com',
      emailVerified: false,
      isActive: true
    }
  });

  console.log('✅ Created users:', alice.email, bob.email);

  // Create Notifications
  await prisma.inboxNotification.create({
    data: {
      userId: alice.id,
      type: 'WELCOME',
      title: '🎉 Welcome Alice!',
      message: 'Welcome to our platform! Get 50% off your first purchase with code WELCOME50',
      priority: 'HIGH',
      isRead: false,
      sentViaSSE: true,
      metadata: {
        promoCode: 'WELCOME50',
        discount: 50,
        discountType: 'PERCENTAGE',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    }
  });

  await prisma.inboxNotification.create({
    data: {
      userId: bob.id,
      type: 'WELCOME',
      title: '👋 Hi Bob!',
      message: 'Thanks for joining! Here\'s 50% off with code WELCOME50',
      priority: 'HIGH',
      isRead: false,
      sentViaSSE: true,
      metadata: {
        promoCode: 'WELCOME50',
        discount: 50
      }
    }
  });

  console.log('✅ Created notifications');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${await prisma.user.count()}`);
  console.log(`- Promo Codes: ${await prisma.promoCode.count()}`);
  console.log(`- Notifications: ${await prisma.inboxNotification.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });