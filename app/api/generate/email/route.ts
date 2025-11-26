import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/encryption';
import { generateContent, getProviderFromModel } from '@/lib/ai/providers';
import { getEmailPrompt } from '@/lib/ai/prompts';
import { Length, EmailMessageType } from '@prisma/client';

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
    const {
      resumeId,
      messageType,
      recipientEmail,
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
    if (!recipientEmail || !companyName || !llmModel || !messageType) {
      return NextResponse.json(
        { error: 'Recipient email, company name, message type, and LLM model are required' },
        { status: 400 }
      );
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
      const parent = await prisma.emailMessage.findFirst({
        where: {
          id: parentMessageId,
          userId: user.id,
        },
      });
      if (parent) {
        previousMessage = `Subject: ${parent.subject}\n\n${parent.body}`;
      }
    }

    // Build prompts
    const { system, user: userPrompt } = getEmailPrompt({
      messageType: messageType as EmailMessageType,
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

    // Generate email
    const generatedContent = await generateContent({
      provider,
      apiKey,
      model: llmModel,
      systemPrompt: system,
      userPrompt,
      maxTokens: 1000,
      temperature: 0.7,
    });

    // Parse subject and body from generated content
    // Expected format: "Subject: ...\n\nBody: ..." or just "Subject: ...\n\n<email content>"
    const lines = generatedContent.split('\n');
    let subject = '';
    let emailBody = '';

    const subjectLineIndex = lines.findIndex(line => line.toLowerCase().startsWith('subject:'));
    
    if (subjectLineIndex !== -1) {
      // Extract subject
      subject = lines[subjectLineIndex].replace(/^subject:\s*/i, '').trim();

      // Extract body - everything after subject line, skipping "Body:" label if present
      emailBody = lines.slice(subjectLineIndex + 1)
        .filter((line, index) => {
          // Skip the first line if it says "Body:" or is empty
          if (index === 0 && (line.toLowerCase().startsWith('body:') || line.trim() === '')) {
            return false;
          }
          return true;
        })
        .join('\n')
        .trim();
    }

    // Fallback: if no subject found or body is empty, use entire content as body
    if (!subject || !emailBody) {
      emailBody = generatedContent.replace(/^subject:\s*.+\n*/i, '').trim() || generatedContent;
      if (!subject) {
        subject = positionTitle
          ? `Application for ${positionTitle} at ${companyName}`
          : `Inquiry about opportunities at ${companyName}`;
      }
    }

    // Save to database only if requested
    let emailMessageId = null;
    if (saveToHistory) {
      const emailMessage = await prisma.emailMessage.create({
        data: {
          userId: user.id,
          resumeId: resumeId || null,
          messageType: messageType as EmailMessageType,
          recipientEmail,
          recipientName,
          positionTitle: positionTitle || null,
          areasOfInterest: areasOfInterest || null,
          companyName,
          jobDescription,
          companyDescription,
          subject,
          body: emailBody,
          length: length as Length,
          llmModel,
          status: status || 'SENT',
          parentMessageId: parentMessageId || null,
        },
      });
      emailMessageId = emailMessage.id;
    }

    return NextResponse.json({
      success: true,
      subject,
      body: emailBody,
      id: emailMessageId,
      saved: saveToHistory,
    });
  } catch (error: any) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate email' },
      { status: 500 }
    );
  }
}
