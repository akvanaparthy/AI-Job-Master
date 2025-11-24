import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import { encrypt } from '@/lib/encryption';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's API key status (don't return actual keys)
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

    return NextResponse.json({
      hasOpenaiKey: !!dbUser.openaiApiKey,
      hasAnthropicKey: !!dbUser.anthropicApiKey,
      hasGeminiKey: !!dbUser.geminiApiKey,
    });
  } catch (error: any) {
    console.error('Get API keys error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get API keys' },
      { status: 500 }
    );
  }
}

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
    const { openaiApiKey, anthropicApiKey, geminiApiKey } = body;

    // Prepare update data (only encrypt if key is provided)
    const updateData: any = {};

    if (openaiApiKey) {
      updateData.openaiApiKey = encrypt(openaiApiKey);
    }
    if (anthropicApiKey) {
      updateData.anthropicApiKey = encrypt(anthropicApiKey);
    }
    if (geminiApiKey) {
      updateData.geminiApiKey = encrypt(geminiApiKey);
    }

    // Create or update user
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: updateData,
      create: {
        id: user.id,
        email: user.email!,
        ...updateData,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'API keys saved successfully',
    });
  } catch (error: any) {
    console.error('Save API keys error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save API keys' },
      { status: 500 }
    );
  }
}
