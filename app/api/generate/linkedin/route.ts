import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/encryption';
import { generateContent, getProviderFromModel } from '@/lib/ai/providers';
import { getLinkedInPrompt } from '@/lib/ai/prompts';
import { Length, LinkedInMessageType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    let {
      resumeId,
      messageType,
      linkedinUrl,
      recipientName,
      positionTitle,
      areasOfInterest,
      companyName,
      jobDescription,
      companyDescription,
      parentMessageId,
      length,
      llmModel,
      status,
      saveToHistory = true, // Default to true for backward compatibility
    } = body;

    // Validate required fields
    if (!companyName || !llmModel || !messageType) {
      return NextResponse.json(
        { error: 'Company name, message type, and LLM model are required' },
        { status: 400 }
      );
    }

    // Check 2-message limit per recipient
    if (linkedinUrl && messageType === 'FOLLOW_UP') {
      // For follow-ups, verify an initial message exists and we haven't exceeded limit
      const existingMessages = await prisma.linkedInMessage.findMany({
        where: {
          userId: user.id,
          linkedinUrl,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (existingMessages.length === 0) {
        return NextResponse.json(
          { error: 'No initial message found. Send a NEW message first.' },
          { status: 400 }
        );
      }

      if (existingMessages.length >= 2) {
        return NextResponse.json(
          { error: 'Already sent 2 messages to this recipient (1 initial + 1 follow-up)' },
          { status: 400 }
        );
      }

      // For follow-ups without explicit parentMessageId, use the most recent message
      if (!parentMessageId) {
        parentMessageId = existingMessages[existingMessages.length - 1].id;
      }
    }

    // Get user's API keys
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        openaiApiKey: true,
        anthropicApiKey: true,
        geminiApiKey: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine provider and decrypt API key
    const provider = getProviderFromModel(llmModel);
    let apiKey: string;

    switch (provider) {
      case 'openai':
        if (!dbUser.openaiApiKey) {
          return NextResponse.json(
            { error: 'OpenAI API key not configured' },
            { status: 400 }
          );
        }
        apiKey = decrypt(dbUser.openaiApiKey);
        break;
      case 'anthropic':
        if (!dbUser.anthropicApiKey) {
          return NextResponse.json(
            { error: 'Anthropic API key not configured' },
            { status: 400 }
          );
        }
        apiKey = decrypt(dbUser.anthropicApiKey);
        break;
      case 'gemini':
        if (!dbUser.geminiApiKey) {
          return NextResponse.json(
            { error: 'Gemini API key not configured' },
            { status: 400 }
          );
        }
        apiKey = decrypt(dbUser.geminiApiKey);
        break;
      default:
        return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    // Get resume content if provided
    let resumeContent = '';
    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: {
          id: resumeId,
          userId: user.id,
        },
      });
      if (resume) {
        resumeContent = resume.content;
      }
    }

    // Get previous message content if follow-up
    let previousMessage = '';
    if (messageType === 'FOLLOW_UP' && parentMessageId) {
      const parent = await prisma.linkedInMessage.findFirst({
        where: {
          id: parentMessageId,
          userId: user.id,
        },
      });
      if (parent) {
        previousMessage = parent.content;
      }
    }

    // Build prompts
    const { system, user: userPrompt } = getLinkedInPrompt({
      messageType: messageType as LinkedInMessageType,
      resumeContent,
      recipientName,
      positionTitle,
      areasOfInterest,
      companyName,
      jobDescription,
      companyDescription,
      previousMessage,
      length: length as Length,
    });

    // Generate message
    const generatedContent = await generateContent({
      provider,
      apiKey,
      model: llmModel,
      systemPrompt: system,
      userPrompt,
      maxTokens: 500,
      temperature: 0.7,
    });

    // Save to database only if requested
    let linkedInMessageId = null;
    if (saveToHistory) {
      const linkedInMessage = await prisma.linkedInMessage.create({
        data: {
          userId: user.id,
          resumeId: resumeId || null,
          messageType: messageType as LinkedInMessageType,
          linkedinUrl: linkedinUrl || null,
          recipientName,
          positionTitle: positionTitle || null,
          areasOfInterest: areasOfInterest || null,
          companyName,
          jobDescription,
          companyDescription,
          content: generatedContent,
          length: length as Length,
          llmModel,
          status: status || 'SENT',
          parentMessageId: parentMessageId || null,
        },
      });
      linkedInMessageId = linkedInMessage.id;
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
      id: linkedInMessageId,
      saved: saveToHistory,
    });
  } catch (error: any) {
    console.error('LinkedIn message generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate LinkedIn message' },
      { status: 500 }
    );
  }
}
