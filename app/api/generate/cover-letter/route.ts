import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/encryption';
import { generateContent, getProviderFromModel } from '@/lib/ai/providers';
import { getCoverLetterPrompt } from '@/lib/ai/prompts';
import { Length } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
      jobDescription,
      companyName,
      positionTitle,
      companyDescription,
      length,
      llmModel,
      saveToHistory = true, // Default to true for backward compatibility
    } = body;

    // Validate required fields
    if (!jobDescription || !llmModel) {
      return NextResponse.json(
        { error: 'Job description and LLM model are required' },
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

    // Build prompts
    const { system, user: userPrompt } = getCoverLetterPrompt({
      resumeContent,
      jobDescription,
      companyDescription,
      companyName,
      positionTitle,
      length: length as Length,
    });

    // Generate cover letter
    const generatedContent = await generateContent({
      provider,
      apiKey,
      model: llmModel,
      systemPrompt: system,
      userPrompt,
      maxTokens: 2000,
      temperature: 0.7,
    });

    // Save to database only if requested
    let coverLetterId = null;
    if (saveToHistory) {
      const coverLetter = await prisma.coverLetter.create({
        data: {
          userId: user.id,
          resumeId: resumeId || null,
          companyName,
          positionTitle,
          jobDescription,
          companyDescription,
          content: generatedContent,
          length: length as Length,
          llmModel,
        },
      });
      coverLetterId = coverLetter.id;
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
      id: coverLetterId,
      saved: saveToHistory,
    });
  } catch (error: any) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate cover letter' },
      { status: 500 }
    );
  }
}
