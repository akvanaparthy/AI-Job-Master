import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    // Get total user count
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      totalUsers,
      displayCount: totalUsers > 0 ? `${totalUsers.toLocaleString()}+` : '10,000+',
    });
  } catch (error) {
    logger.error('Public stats error:', error);
    // Return default on error
    return NextResponse.json({
      totalUsers: 0,
      displayCount: '10,000+',
    });
  }
}
