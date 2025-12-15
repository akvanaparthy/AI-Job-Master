import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import { getMisuseMessage, setMisuseMessage } from '@/lib/ai/misuse-detection';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 300; // Cache for 5 minutes (configuration data rarely changes)

// GET current misuse message
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

    // Get current misuse message
    const message = await getMisuseMessage();

    return NextResponse.json({ message });
  } catch (error: any) {
    logger.error('Get misuse message error', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch misuse message' },
      { status: 500 }
    );
  }
}

// PUT update misuse message
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
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required and must be a string' }, { status: 400 });
    }

    if (message.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // Update misuse message
    await setMisuseMessage(message);

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    logger.error('Update misuse message error', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update misuse message' },
      { status: 500 }
    );
  }
}
