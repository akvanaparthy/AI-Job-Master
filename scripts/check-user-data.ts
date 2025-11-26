import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserData() {
  console.log('🔍 Checking user data and usage limits...\n');

  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      userType: true,
      isAdmin: true,
      _count: {
        select: {
          coverLetters: true,
          linkedinMessages: true,
          emailMessages: true,
        },
      },
    },
  });

  console.log(`📊 Found ${users.length} users:\n`);
  users.forEach((user) => {
    console.log(`  📧 ${user.email}`);
    console.log(`     ID: ${user.id}`);
    console.log(`     Type: ${user.userType}`);
    console.log(`     Admin: ${user.isAdmin ? '✅ YES' : '❌ NO'}`);
    console.log(`     Cover Letters: ${user._count.coverLetters}`);
    console.log(`     LinkedIn Messages: ${user._count.linkedinMessages}`);
    console.log(`     Emails: ${user._count.emailMessages}`);
    console.log('');
  });

  // Get usage limits
  const limits = await prisma.usageLimitSettings.findMany();
  console.log(`⚙️  Usage Limits:\n`);
  limits.forEach((limit) => {
    console.log(`  ${limit.userType}:`);
    console.log(`     Max Activities: ${limit.maxActivities}`);
    console.log(`     Include Followups: ${limit.includeFollowups}`);
    console.log('');
  });

  // Check for any cover letters
  const totalCoverLetters = await prisma.coverLetter.count();
  const totalLinkedIn = await prisma.linkedInMessage.count();
  const totalEmails = await prisma.emailMessage.count();

  console.log(`📈 Total System Activity:`);
  console.log(`   Cover Letters: ${totalCoverLetters}`);
  console.log(`   LinkedIn Messages: ${totalLinkedIn}`);
  console.log(`   Email Messages: ${totalEmails}`);
}

checkUserData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
