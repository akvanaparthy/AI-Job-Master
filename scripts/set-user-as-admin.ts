import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get email from command line argument or use default
const ADMIN_EMAIL = process.argv[2] || 'vanaparthyakshay@gmail.com';

async function setAdmin() {
  console.log(`🔧 Setting ${ADMIN_EMAIL} as admin...\n`);

  try {
    const user = await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: {
        userType: 'ADMIN',
        isAdmin: true,
      },
      select: {
        email: true,
        userType: true,
        isAdmin: true,
      },
    });

    console.log('✅ User updated successfully!');
    console.log(`   Email: ${user.email}`);
    console.log(`   User Type: ${user.userType}`);
    console.log(`   Is Admin: ${user.isAdmin}`);
    console.log('\n🎉 You now have full admin access with unlimited activities!');
    console.log('\n📍 Access admin dashboard at: /admin');
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error:', error.message);
      console.log('\n💡 Make sure:');
      console.log('   1. The user exists in the database');
      console.log('   2. The email is correct');
      console.log('   3. DATABASE_URL is set in .env');
    } else {
      console.error('❌ An unknown error occurred');
    }
  }
}

setAdmin()
  .finally(() => prisma.$disconnect());
