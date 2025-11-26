import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const messageId = searchParams.get('messageId');

    // If searching by messageId or ID
    if (messageId) {
      const message = await prisma.emailMessage.findFirst({
        where: {
          userId: user.id,
          id: messageId,
        },
        select: {
          id: true,
          companyName: true,
          positionTitle: true,
          recipientName: true,
          recipientEmail: true,
          subject: true,
          body: true,
          jobDescription: true,
          companyDescription: true,
          areasOfInterest: true,
          resumeId: true,
          length: true,
          llmModel: true,
          status: true,
          createdAt: true,
          messageType: true,
        },
      });

      return NextResponse.json({ message });
    }

    // Search by company name, position, recipient name, or email
    // Exclude messages that already have followups
    const messages = await prisma.emailMessage.findMany({
      where: {
        userId: user.id,
        OR: [
          { companyName: { contains: query, mode: 'insensitive' } },
          { positionTitle: { contains: query, mode: 'insensitive' } },
          { recipientName: { contains: query, mode: 'insensitive' } },
          { recipientEmail: { contains: query, mode: 'insensitive' } },
          { subject: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        companyName: true,
        positionTitle: true,
        recipientName: true,
        recipientEmail: true,
        subject: true,
        body: true,
        createdAt: true,
        status: true,
        messageType: true,
        followUpMessages: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    // Filter out messages that already have followups
    const filteredMessages = messages.filter(msg => msg.followUpMessages.length === 0);

    // Remove the followUpMessages field from the response
    const cleanedMessages = filteredMessages.map(({ followUpMessages, ...rest }) => rest);

    return NextResponse.json({ messages: cleanedMessages });
  } catch (error: any) {
    console.error('Email message search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search messages' },
      { status: 500 }
    );
  }
}
