import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'vanaparthyakshay@gmail.com'; // Change if needed

async function setFullAdmin() {
  console.log(`🔧 Setting ${ADMIN_EMAIL} as full admin...\n`);

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
  console.log('\n📍 Access admin dashboard at: /dashboard/admin');
}

setFullAdmin()
  .catch((e) => {
    console.error('❌ Error:', e.message);
  })
  .finally(() => prisma.$disconnect());
