import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

interface UsageLimits {
  maxActivities: number;
  maxGenerations: number;
  maxFollowupGenerations: number;
  includeFollowups: boolean;
}

/**
 * Check if user has exceeded their usage limits
 */
export async function checkUsageLimits(
  userId: string,
  isFollowup: boolean = false
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        userType: true,
        generationCount: true,
        followupGenerationCount: true,
        activityCount: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return { allowed: false, reason: 'User not found' };
    }

    // Admins have unlimited access
    if (user.isAdmin || user.userType === 'ADMIN') {
      return { allowed: true };
    }

    // Get usage limits for user type
    const limits = await prisma.usageLimitSettings.findUnique({
      where: { userType: user.userType },
      select: {
        maxGenerations: true,
        maxFollowupGenerations: true,
      },
    });

    if (!limits) {
      return { allowed: false, reason: 'Usage limits not configured' };
    }

    // Check followup generation limit
    if (isFollowup) {
      if (limits.maxFollowupGenerations > 0 && user.followupGenerationCount >= limits.maxFollowupGenerations) {
        return {
          allowed: false,
          reason: `You've reached your monthly limit of ${limits.maxFollowupGenerations} follow-up generations. Upgrade to PLUS for more.`,
        };
      }
    } else {
      // Check main generation limit (non-followup)
      if (limits.maxGenerations > 0 && user.generationCount >= limits.maxGenerations) {
        return {
          allowed: false,
          reason: `You've reached your monthly limit of ${limits.maxGenerations} generations. Upgrade to PLUS for more.`,
        };
      }
    }

    return { allowed: true };
  } catch (error) {
    logger.error('Check usage limits error:', error);
    return { allowed: false, reason: 'Failed to check usage limits' };
  }
}

/**
 * Increment generation count for a user
 */
export async function trackGeneration(
  userId: string,
  isFollowup: boolean = false
): Promise<void> {
  try {
    if (isFollowup) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          followupGenerationCount: { increment: 1 },
        },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          generationCount: { increment: 1 },
        },
      });
    }
  } catch (error) {
    logger.error('Track generation error:', error);
  }
}

/**
 * Increment activity count when user saves
 */
export async function trackActivity(
  userId: string,
  isFollowup: boolean = false
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        userType: true,
        activityCount: true,
        isAdmin: true,
      },
    });

    if (!user || user.isAdmin || user.userType === 'ADMIN') {
      return; // Don't track for admins
    }

    // Get usage limits to check if followups should be included
    const limits = await prisma.usageLimitSettings.findUnique({
      where: { userType: user.userType },
      select: { includeFollowups: true },
    });

    // Only increment if not a followup, or if followups are included in count
    if (!isFollowup || limits?.includeFollowups) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          activityCount: { increment: 1 },
        },
      });
    }
  } catch (error) {
    logger.error('Track activity error:', error);
  }
}

/**
 * Check if user can save (activity limit)
 */
export async function checkActivityLimit(
  userId: string,
  isFollowup: boolean = false
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        userType: true,
        activityCount: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return { allowed: false, reason: 'User not found' };
    }

    // Admins have unlimited access
    if (user.isAdmin || user.userType === 'ADMIN') {
      return { allowed: true };
    }

    // Get usage limits for user type
    const limits = await prisma.usageLimitSettings.findUnique({
      where: { userType: user.userType },
      select: {
        maxActivities: true,
        includeFollowups: true,
      },
    });

    if (!limits) {
      return { allowed: false, reason: 'Usage limits not configured' };
    }

    // Check if this followup should count
    if (isFollowup && !limits.includeFollowups) {
      return { allowed: true }; // Followups don't count
    }

    // Check activity limit
    if (limits.maxActivities > 0 && user.activityCount >= limits.maxActivities) {
      return {
        allowed: false,
        reason: `You've reached your monthly limit of ${limits.maxActivities} saved activities. Upgrade to PLUS for more.`,
      };
    }

    return { allowed: true };
  } catch (error) {
    logger.error('Check activity limit error:', error);
    return { allowed: false, reason: 'Failed to check activity limit' };
  }
}

/**
 * Track generation in activity history
 */
export async function trackGenerationHistory(
  userId: string,
  activityType: 'COVER_LETTER' | 'LINKEDIN_MESSAGE' | 'EMAIL_MESSAGE',
  companyName: string,
  positionTitle: string | null,
  recipient: string | null,
  llmModel: string | null,
  isSaved: boolean,
  isFollowup: boolean
): Promise<void> {
  try {
    await prisma.activityHistory.create({
      data: {
        userId,
        activityType,
        companyName,
        positionTitle,
        recipient,
        llmModel,
        isSaved,
        isFollowup,
      },
    });
  } catch (error) {
    logger.error('Track generation history error:', error);
  }
}

/**
 * Reset monthly counters (should be called by cron job)
 */
export async function resetMonthlyCounters(): Promise<void> {
  try {
    const now = new Date();
    
    // Find users whose reset date has passed
    const usersToReset = await prisma.user.findMany({
      where: {
        monthlyResetDate: {
          lte: now,
        },
      },
      select: { id: true },
    });

    // Reset counters for these users
    await prisma.user.updateMany({
      where: {
        id: { in: usersToReset.map(u => u.id) },
      },
      data: {
        generationCount: 0,
        activityCount: 0,
        followupGenerationCount: 0,
        monthlyResetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    logger.info(`Reset monthly counters for ${usersToReset.length} users`);
  } catch (error) {
    logger.error('Reset monthly counters error:', error);
  }
}
