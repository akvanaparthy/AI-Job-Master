import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import { ensureUserExists } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    await ensureUserExists(user);

    // Get user data including userType
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { userType: true, isAdmin: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get usage limit settings for user's type
    const usageLimitSettings = await prisma.usageLimitSettings.findUnique({
      where: { userType: dbUser.userType },
    });

    const maxActivities = usageLimitSettings?.maxActivities || 100;
    const includeFollowups = usageLimitSettings?.includeFollowups || false;

    // Get counts for each type (excluding followups if configured)
    const [coverLetterCount, linkedInCount, emailCount, recentActivity] = await Promise.all([
      prisma.coverLetter.count({
        where: { userId: user.id },
      }),
      prisma.linkedInMessage.count({
        where: {
          userId: user.id,
          ...(includeFollowups ? {} : { messageType: 'NEW' })
        },
      }),
      prisma.emailMessage.count({
        where: {
          userId: user.id,
          ...(includeFollowups ? {} : { messageType: 'NEW' })
        },
      }),
      // Get recent 5 items for activity feed
      Promise.all([
        prisma.coverLetter.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            companyName: true,
            positionTitle: true,
            createdAt: true,
            content: true,
          },
        }),
        prisma.linkedInMessage.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            companyName: true,
            positionTitle: true,
            createdAt: true,
            content: true,
            status: true,
            messageType: true,
            linkedinUrl: true,
            recipientName: true,
            jobDescription: true,
            companyDescription: true,
            resumeId: true,
            length: true,
            llmModel: true,
          },
        }),
        prisma.emailMessage.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            companyName: true,
            positionTitle: true,
            createdAt: true,
            body: true,
            status: true,
            messageType: true,
            recipientEmail: true,
            recipientName: true,
            subject: true,
            jobDescription: true,
            companyDescription: true,
            resumeId: true,
            length: true,
            llmModel: true,
          },
        }),
      ]),
    ]);

    // Combine and sort recent activity
    const allActivity = [
      ...recentActivity[0].map(item => ({
        id: item.id,
        type: 'Cover Letter' as const,
        company: item.companyName || 'N/A',
        position: item.positionTitle || 'N/A',
        createdAt: item.createdAt.toISOString(),
        wordCount: item.content.split(/\s+/).length,
        status: null,
        messageType: null,
        data: null,
      })),
      ...recentActivity[1].map(item => ({
        id: item.id,
        type: 'LinkedIn' as const,
        company: item.companyName,
        position: item.positionTitle,
        createdAt: item.createdAt.toISOString(),
        wordCount: item.content.split(/\s+/).length,
        status: item.status,
        messageType: item.messageType,
        data: {
          linkedinUrl: item.linkedinUrl,
          recipientName: item.recipientName,
          jobDescription: item.jobDescription,
          companyDescription: item.companyDescription,
          resumeId: item.resumeId,
          length: item.length,
          llmModel: item.llmModel,
        },
      })),
      ...recentActivity[2].map(item => ({
        id: item.id,
        type: 'Email' as const,
        company: item.companyName,
        position: item.positionTitle,
        createdAt: item.createdAt.toISOString(),
        wordCount: item.body.split(/\s+/).length,
        status: item.status,
        messageType: item.messageType,
        data: {
          recipientEmail: item.recipientEmail,
          recipientName: item.recipientName,
          subject: item.subject,
          jobDescription: item.jobDescription,
          companyDescription: item.companyDescription,
          resumeId: item.resumeId,
          length: item.length,
          llmModel: item.llmModel,
        },
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Calculate total generated
    const totalGenerated = coverLetterCount + linkedInCount + emailCount;

    // Calculate hours saved (estimate: 30 min per cover letter, 15 min per LinkedIn, 20 min per email)
    const hoursSaved = Math.round(
      (coverLetterCount * 0.5 + linkedInCount * 0.25 + emailCount * 0.33) * 10
    ) / 10;

    // Usage percentage based on user's limit
    const usagePercentage = Math.min(Math.round((totalGenerated / maxActivities) * 100), 100);

    return NextResponse.json({
      totalCoverLetters: coverLetterCount,
      totalLinkedInMessages: linkedInCount,
      totalEmails: emailCount,
      totalGenerated,
      hoursSaved,
      usagePercentage,
      maxActivities,
      userType: dbUser.userType,
      recentActivity: allActivity,
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
