import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/encryption';
import { logger } from '@/lib/logger';

export interface SharedModel {
  model: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  isShared: true;
  keyId: string;
}

/**
 * Get shared API key for a specific model
 */
export async function getSharedApiKey(model: string): Promise<string | null> {
  try {
    const sharedKeys = await prisma.sharedApiKey.findMany({
      where: {
        isActive: true,
        models: {
          has: model,
        },
      },
    });

    if (sharedKeys.length === 0) return null;

    // Return decrypted API key from first matching key
    return decrypt(sharedKeys[0].apiKey);
  } catch (error) {
    logger.error('Get shared API key error:', error);
    return null;
  }
}

/**
 * Check if a model is available as shared
 */
export async function isSharedModel(model: string): Promise<boolean> {
  try {
    const count = await prisma.sharedApiKey.count({
      where: {
        isActive: true,
        models: {
          has: model,
        },
      },
    });

    return count > 0;
  } catch (error) {
    logger.error('Check shared model error:', error);
    return false;
  }
}

/**
 * Get all available shared models for PLUS users
 */
export async function getAvailableSharedModels(): Promise<SharedModel[]> {
  try {
    const sharedKeys = await prisma.sharedApiKey.findMany({
      where: { isActive: true },
      select: {
        id: true,
        provider: true,
        models: true,
      },
    });

    return sharedKeys.flatMap(key =>
      key.models.map(model => ({
        model,
        provider: key.provider.toLowerCase() as 'openai' | 'anthropic' | 'gemini',
        isShared: true as const,
        keyId: key.id,
      }))
    );
  } catch (error) {
    logger.error('Get available shared models error:', error);
    return [];
  }
}
