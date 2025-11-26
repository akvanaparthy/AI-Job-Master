import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';

// GET - Fetch user preferences
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        defaultLlmModel: true,
        defaultLength: true,
        autoSave: true,
        defaultStatus: true,
        followupReminderDays: true,
      },
    });

    if (!dbUser) {
      // Return defaults if user not found
      return NextResponse.json({
        preferences: {
          defaultLlmModel: 'gpt-4o',
          defaultLength: 'MEDIUM',
          autoSave: true,
          defaultStatus: 'SENT',
          followupReminderDays: 7,
        },
      });
    }

    return NextResponse.json({
      preferences: {
        defaultLlmModel: dbUser.defaultLlmModel || 'gpt-4o',
        defaultLength: dbUser.defaultLength || 'MEDIUM',
        autoSave: dbUser.autoSave !== null ? dbUser.autoSave : true,
        defaultStatus: dbUser.defaultStatus || 'SENT',
        followupReminderDays: dbUser.followupReminderDays || 7,
      },
    });
  } catch (error: any) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

// POST - Save user preferences
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
    const { defaultLlmModel, defaultLength, autoSave, defaultStatus, followupReminderDays } = body;

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        defaultLlmModel,
        defaultLength,
        autoSave,
        defaultStatus,
        followupReminderDays,
      },
      create: {
        id: user.id,
        email: user.email!,
        defaultLlmModel,
        defaultLength,
        autoSave,
        defaultStatus,
        followupReminderDays,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
