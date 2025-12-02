import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/encryption';
import { generateContent, getProviderFromModel } from '@/lib/ai/providers';
import { getCoverLetterPrompt } from '@/lib/ai/prompts';
import { detectMisuse, getMisuseMessage } from '@/lib/ai/misuse-detection';
import { Length } from '@prisma/client';
import { logger } from '@/lib/logger';
import { checkRateLimit, RATE_LIMITS } from '@/lib/csrf-protection';
import { canCreateActivity, trackActivity, getDaysUntilReset } from '@/lib/activity-tracker';
import { getSharedApiKey, isSharedModel } from '@/lib/shared-keys';
import { checkUsageLimits, trackGeneration, trackGenerationHistory, trackActivity as trackActivityCount } from '@/lib/usage-tracking';

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

    // Rate limiting check
    const rateLimitResult = checkRateLimit(
      `cover-letter-gen:${user.id}`,
      RATE_LIMITS.generation
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          resetAt: rateLimitResult.resetAt,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.generation.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
          },
        }
      );
    }

    // Note: Generation limit check moved below after determining if using shared key
    // Users with their own API keys are NOT subject to generation limits
    // However, activity limits always apply when saving

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

    // Get user's API keys and type
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        openaiApiKey: true,
        anthropicApiKey: true,
        geminiApiKey: true,
        userType: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user selected a shared/sponsored model (prefixed with 'shared:')
    const isSharedModelSelected = llmModel.startsWith('shared:');
    const actualModel = isSharedModelSelected ? llmModel.replace('shared:', '') : llmModel;
    
    // Determine provider from the actual model name
    const provider = getProviderFromModel(actualModel);
    let apiKey: string | null = null;
    let usingSharedKey = false;

    // If user explicitly selected shared model, use shared key
    if (isSharedModelSelected && (dbUser.userType === 'PLUS' || dbUser.userType === 'ADMIN')) {
      const sharedKey = await getSharedApiKey(actualModel);
      if (sharedKey) {
        apiKey = sharedKey;
        usingSharedKey = true;
      } else {
        return NextResponse.json(
          { error: 'Selected shared model is not available' },
          { status: 400 }
        );
      }
    }

    // If not using shared key, use user's own key
    if (!apiKey) {
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
    }

    // Check generation limit ONLY if using shared/sponsored key
    // Users with their own API keys are NOT subject to generation limits
    if (usingSharedKey) {
      const generationCheck = await checkUsageLimits(user.id, false);
      if (!generationCheck.allowed) {
        return NextResponse.json(
          {
            error: generationCheck.reason,
            limitReached: true,
          },
          { status: 429 }
        );
      }
    }

    // Check activity limit when saving (always applies)
    const activityCheck = await canCreateActivity(user.id);
    if (!activityCheck.allowed) {
      const daysLeft = getDaysUntilReset(activityCheck.resetDate);
      return NextResponse.json(
        {
          error: `Monthly activity limit reached (${activityCheck.currentCount}/${activityCheck.limit}). Resets in ${daysLeft} days.`,
          limitReached: true,
          currentCount: activityCheck.currentCount,
          limit: activityCheck.limit,
          daysUntilReset: daysLeft,
        },
        { status: 429 }
      );
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
      model: actualModel, // Use actual model name without prefix
      systemPrompt: system,
      userPrompt,
      maxTokens: 2000,
      temperature: 0.7,
    });

    // Check for misuse
    if (detectMisuse(generatedContent)) {
      const misuseMessage = await getMisuseMessage();
      return NextResponse.json({
        success: true,
        content: misuseMessage,
        id: null,
        saved: false,
      });
    }

    // Track generation (increment counter) - only if using shared key
    await trackGeneration(user.id, false, usingSharedKey);

    // Track in generation history (not saved yet)
    await trackGenerationHistory(
      user.id,
      'COVER_LETTER',
      companyName || 'Unknown Company',
      positionTitle,
      null,
      actualModel,
      false, // Not saved yet
      false  // Not a followup
    );

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
          llmModel: actualModel, // Store actual model name
        },
      });
      coverLetterId = coverLetter.id;

      // Track activity count (new system)
      await trackActivityCount(user.id, false);

      // Track activity in history (old system, keeping for compatibility)
      await trackActivity({
        userId: user.id,
        activityType: 'COVER_LETTER',
        companyName: companyName || 'Unknown Company',
        positionTitle,
        llmModel: actualModel, // Store actual model name
      });
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
      id: coverLetterId,
      saved: saveToHistory,
    });
  } catch (error) {
    logger.error('Cover letter generation error', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    );
  }
}
