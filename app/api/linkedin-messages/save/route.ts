import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import { LinkedInMessageType } from '@prisma/client';
import { generateMessageId } from '@/lib/utils/message-id';
import { logger } from '@/lib/logger';
import { trackActivity as trackActivityCount } from '@/lib/usage-tracking';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      content,
      messageType,
      resumeId,
      linkedinUrl,
      recipientName,
      recipientPosition,
      positionTitle,
      areasOfInterest,
      companyName,
      jobDescription,
      companyDescription,
      parentMessageId,
      length,
      llmModel,
      status = 'SENT',
      requestReferral = false,
    } = body;

    if (!content || !companyName || !messageType) {
      return NextResponse.json(
        { error: 'Content, company name, and message type are required' },
        { status: 400 }
      );
    }

    let messageId = null;
    try {
      messageId = generateMessageId('linkedin');
    } catch (e) {
      messageId = null;
    }

    const linkedInMessage = await prisma.linkedInMessage.create({
      data: {
        userId: user.id,
        resumeId: resumeId || null,
        messageType: messageType as LinkedInMessageType,
        linkedinUrl: linkedinUrl || null,
        recipientName,
        recipientPosition: recipientPosition || null,
        positionTitle: positionTitle || null,
        areasOfInterest: areasOfInterest || null,
        companyName,
        jobDescription,
        companyDescription,
        content,
        length,
        llmModel,
        status,
        requestReferral,
        parentMessageId: parentMessageId || null,
        messageId: messageId || null,
      },
    });

    // Track activity count
    await trackActivityCount(user.id, messageType === 'FOLLOW_UP');

    return NextResponse.json({
      success: true,
      id: linkedInMessage.id,
      messageId: messageId,
    });
  } catch (error) {
    logger.error('LinkedIn message save error', error);
    return NextResponse.json(
      { error: 'Failed to save LinkedIn message' },
      { status: 500 }
    );
  }
}
