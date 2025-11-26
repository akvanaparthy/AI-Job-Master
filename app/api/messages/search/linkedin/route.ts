import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';

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

    // If searching by messageId
    if (messageId) {
      const message = await prisma.linkedInMessage.findFirst({
        where: {
          userId: user.id,
          messageId: messageId,
        },
        select: {
          id: true,
          messageId: true,
          companyName: true,
          positionTitle: true,
          recipientName: true,
          linkedinUrl: true,
          content: true,
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

    // Search by company name, position, or recipient name
    const messages = await prisma.linkedInMessage.findMany({
      where: {
        userId: user.id,
        OR: [
          { companyName: { contains: query, mode: 'insensitive' } },
          { positionTitle: { contains: query, mode: 'insensitive' } },
          { recipientName: { contains: query, mode: 'insensitive' } },
          { messageId: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        messageId: true,
        companyName: true,
        positionTitle: true,
        recipientName: true,
        linkedinUrl: true,
        content: true,
        createdAt: true,
        status: true,
        messageType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('LinkedIn message search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search messages' },
      { status: 500 }
    );
  }
}
