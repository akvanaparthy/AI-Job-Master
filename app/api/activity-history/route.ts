import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch activity history with filters
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = { userId: user.id };

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { positionTitle: { contains: search, mode: 'insensitive' } },
        { recipient: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.activityType = type;
    }

    // Get total count
    const totalCount = await prisma.activityHistory.count({ where });

    // Get paginated activities
    const activities = await prisma.activityHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        activityType: true,
        companyName: true,
        positionTitle: true,
        recipient: true,
        status: true,
        llmModel: true,
        isDeleted: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    logger.error('Activity history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity history' },
      { status: 500 }
    );
  }
}
