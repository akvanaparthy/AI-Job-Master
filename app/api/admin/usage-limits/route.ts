import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET all usage limits
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isAdmin: true },
    });

    if (!dbUser?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get all usage limits
    const limits = await prisma.usageLimitSettings.findMany({
      orderBy: { userType: 'asc' },
    });

    return NextResponse.json({ limits });
  } catch (error: any) {
    console.error('Get usage limits error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch usage limits' },
      { status: 500 }
    );
  }
}

// PUT update usage limit
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isAdmin: true },
    });

    if (!dbUser?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { userType, maxActivities, includeFollowups } = body;

    if (!userType || maxActivities === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update usage limit
    const updated = await prisma.usageLimitSettings.upsert({
      where: { userType },
      update: {
        maxActivities,
        includeFollowups: includeFollowups ?? false,
      },
      create: {
        userType,
        maxActivities,
        includeFollowups: includeFollowups ?? false,
      },
    });

    return NextResponse.json({ limit: updated });
  } catch (error: any) {
    console.error('Update usage limit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update usage limit' },
      { status: 500 }
    );
  }
}
