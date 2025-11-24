import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';

// GET - Fetch custom prompts
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all custom prompts for the user
    const prompts = await prisma.customPrompt.findMany({
      where: { userId: user.id },
    });

    // Convert array to object keyed by tab
    const promptsMap = prompts.reduce((acc, prompt) => {
      acc[prompt.tab] = prompt.systemPrompt;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      coverLetter: promptsMap['COVER_LETTER'] || '',
      linkedIn: promptsMap['LINKEDIN'] || '',
      email: promptsMap['EMAIL'] || '',
    });
  } catch (error: any) {
    console.error('Get prompts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get prompts' },
      { status: 500 }
    );
  }
}

// POST - Save custom prompts
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
    const { coverLetter, linkedIn, email } = body;

    // Update or create prompts
    const operations = [];

    if (coverLetter !== undefined) {
      if (coverLetter.trim() === '') {
        // Delete if empty
        operations.push(
          prisma.customPrompt.deleteMany({
            where: {
              userId: user.id,
              tab: 'COVER_LETTER',
            },
          })
        );
      } else {
        // Upsert
        operations.push(
          prisma.customPrompt.upsert({
            where: {
              userId_tab: {
                userId: user.id,
                tab: 'COVER_LETTER',
              },
            },
            update: {
              systemPrompt: coverLetter.trim(),
            },
            create: {
              userId: user.id,
              tab: 'COVER_LETTER',
              systemPrompt: coverLetter.trim(),
            },
          })
        );
      }
    }

    if (linkedIn !== undefined) {
      if (linkedIn.trim() === '') {
        operations.push(
          prisma.customPrompt.deleteMany({
            where: {
              userId: user.id,
              tab: 'LINKEDIN',
            },
          })
        );
      } else {
        operations.push(
          prisma.customPrompt.upsert({
            where: {
              userId_tab: {
                userId: user.id,
                tab: 'LINKEDIN',
              },
            },
            update: {
              systemPrompt: linkedIn.trim(),
            },
            create: {
              userId: user.id,
              tab: 'LINKEDIN',
              systemPrompt: linkedIn.trim(),
            },
          })
        );
      }
    }

    if (email !== undefined) {
      if (email.trim() === '') {
        operations.push(
          prisma.customPrompt.deleteMany({
            where: {
              userId: user.id,
              tab: 'EMAIL',
            },
          })
        );
      } else {
        operations.push(
          prisma.customPrompt.upsert({
            where: {
              userId_tab: {
                userId: user.id,
                tab: 'EMAIL',
              },
            },
            update: {
              systemPrompt: email.trim(),
            },
            create: {
              userId: user.id,
              tab: 'EMAIL',
              systemPrompt: email.trim(),
            },
          })
        );
      }
    }

    await prisma.$transaction(operations);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save prompts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save prompts' },
      { status: 500 }
    );
  }
}
