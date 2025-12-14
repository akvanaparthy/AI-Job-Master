import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import { ApplicationStatus } from '@prisma/client';
import { usageLimitsCache } from '@/lib/cache';
import type { UserType } from '@prisma/client';

export type ActivityType = 'COVER_LETTER' | 'LINKEDIN_MESSAGE' | 'EMAIL_MESSAGE';

interface ActivityData {
  userId: string;
  activityType: ActivityType;
  companyName: string;
  positionTitle?: string;
  recipient?: string;
  status?: ApplicationStatus;
  llmModel?: string;
}

/**
 * Track a new activity in the history
 */
export async function trackActivity(data: ActivityData) {
  try {
    await prisma.activityHistory.create({
      data: {
        userId: data.userId,
        activityType: data.activityType,
        companyName: data.companyName,
        positionTitle: data.positionTitle,
        recipient: data.recipient,
        status: data.status,
        llmModel: data.llmModel,
        isDeleted: false,
      },
    });
  } catch (error) {
    logger.error('Failed to track activity:', error);
  }
}

/**
 * Mark activity as deleted (soft delete in history)
 */
export async function markActivityDeleted(
  userId: string,
  activityType: ActivityType,
  companyName: string,
  createdAt: Date
) {
  try {
    // Find the activity history entry and mark as deleted
    await prisma.activityHistory.updateMany({
      where: {
        userId,
        activityType,
        companyName,
        createdAt: {
          gte: new Date(createdAt.getTime() - 1000), // 1 second before
          lte: new Date(createdAt.getTime() + 1000), // 1 second after
        },
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });
  } catch (error) {
    logger.error('Failed to mark activity as deleted:', error);
  }
}

/**
 * Get cached usage limits for a user type
 */
async function getCachedActivityLimits(userType: UserType): Promise<{ maxActivities: number } | null> {
  const cacheKey = `activity-limits:${userType}`;
  const cached = usageLimitsCache.get<{ maxActivities: number }>(cacheKey);
  if (cached) return cached;

  const limits = await prisma.usageLimitSettings.findUnique({
    where: { userType },
    select: { maxActivities: true },
  });

  if (limits) {
    usageLimitsCache.set(cacheKey, limits);
  }
  return limits;
}

/**
 * Get monthly activity count for a user (excluding follow-ups)
 * Accepts optional pre-fetched resetDate to avoid redundant queries
 */
export async function getMonthlyActivityCount(
  userId: string,
  preloadedResetDate?: Date
): Promise<number> {
  try {
    let resetDate: Date;

    if (preloadedResetDate) {
      resetDate = preloadedResetDate;
    } else {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { monthlyResetDate: true },
      });
      if (!user) return 0;
      resetDate = new Date(user.monthlyResetDate);
    }

    // Check if we need to reset the monthly count
    const now = new Date();
    const daysSinceReset = Math.floor((now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24));

    // Reset if 30+ days have passed
    if (daysSinceReset >= 30) {
      await prisma.user.update({
        where: { id: userId },
        data: { monthlyResetDate: now },
      });
      return 0;
    }

    // Count activities since last reset (only NEW messages, not follow-ups)
    const count = await prisma.activityHistory.count({
      where: {
        userId,
        createdAt: {
          gte: resetDate,
        },
      },
    });

    return count;
  } catch (error) {
    logger.error('Failed to get monthly activity count:', error);
    return 0;
  }
}

/**
 * Check if user can create new activity based on their monthly limit
 * Optimized: single user query + cached limits
 */
export async function canCreateActivity(userId: string): Promise<{
  allowed: boolean;
  currentCount: number;
  limit: number;
  resetDate: Date;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true, monthlyResetDate: true },
    });

    if (!user) {
      return { allowed: false, currentCount: 0, limit: 0, resetDate: new Date() };
    }

    // Admin means unlimited
    if (user.userType === 'ADMIN') {
      return { allowed: true, currentCount: 0, limit: 0, resetDate: user.monthlyResetDate };
    }

    // Get cached usage limit settings
    const limitSettings = await getCachedActivityLimits(user.userType);
    const limit = limitSettings?.maxActivities || 100;

    // 0 limit means unlimited
    if (limit === 0) {
      return { allowed: true, currentCount: 0, limit: 0, resetDate: user.monthlyResetDate };
    }

    // Pass the preloaded resetDate to avoid re-fetching user
    const currentCount = await getMonthlyActivityCount(userId, user.monthlyResetDate);

    return {
      allowed: currentCount < limit,
      currentCount,
      limit,
      resetDate: user.monthlyResetDate,
    };
  } catch (error) {
    logger.error('Failed to check activity limit:', error);
    return { allowed: true, currentCount: 0, limit: 100, resetDate: new Date() };
  }
}

/**
 * Get days until monthly reset
 */
export function getDaysUntilReset(resetDate: Date): number {
  const now = new Date();
  const nextReset = new Date(resetDate);
  nextReset.setDate(nextReset.getDate() + 30);
  
  const daysLeft = Math.ceil((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysLeft);
}
