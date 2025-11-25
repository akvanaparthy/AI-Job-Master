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

    // Get user's available models
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        openaiModels: true,
        anthropicModels: true,
        geminiModels: true,
        openaiApiKey: true,
        anthropicApiKey: true,
        geminiApiKey: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({
        hasAnyKey: false,
        models: [],
        modelsByProvider: {
          openai: [],
          anthropic: [],
          gemini: [],
        },
      });
    }

    // Combine all available models with provider information
    const allModels = [
      ...dbUser.openaiModels.map(model => ({ value: model, label: model, provider: 'openai' })),
      ...dbUser.anthropicModels.map(model => ({ value: model, label: model, provider: 'anthropic' })),
      ...dbUser.geminiModels.map(model => ({ value: model, label: model, provider: 'gemini' })),
    ];

    const hasAnyKey = !!(dbUser.openaiApiKey || dbUser.anthropicApiKey || dbUser.geminiApiKey);

    return NextResponse.json({
      hasAnyKey,
      models: allModels,
      modelsByProvider: {
        openai: dbUser.openaiModels,
        anthropic: dbUser.anthropicModels,
        gemini: dbUser.geminiModels,
      },
    });
  } catch (error: any) {
    console.error('Get available models error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get available models' },
      { status: 500 }
    );
  }
}
