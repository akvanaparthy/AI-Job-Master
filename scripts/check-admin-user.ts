import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EMAIL = process.argv[2] || 'vanaparthyakshay@gmail.com';

async function checkUser() {
  console.log(`🔍 Checking user: ${EMAIL}\n`);

  try {
    const user = await prisma.user.findUnique({
      where: { email: EMAIL },
      select: {
        id: true,
        email: true,
        userType: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log('❌ User not found in database');
      return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   UserType: ${user.userType}`);
    console.log(`   IsAdmin: ${user.isAdmin}`);
    console.log(`   Created: ${user.createdAt}`);

    console.log('\n🔐 Admin Access Check:');
    console.log(`   Can access /admin? ${user.userType === 'ADMIN' ? '✅ YES' : '❌ NO'}`);
    console.log(`   Reason: userType must be 'ADMIN', currently is '${user.userType}'`);

  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error:', error.message);
    }
  }
}

checkUser().finally(() => prisma.$disconnect());
