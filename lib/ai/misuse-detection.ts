import { prisma } from '@/lib/db/prisma';
import { MISUSE_MARKER } from './prompts';

/**
 * Default misuse message shown to users
 */
const DEFAULT_MISUSE_MESSAGE = `I built the platform you are using 😊, now go back to prompt and change it accordingly, I am smarter than you bro 👍`;

/**
 * Key for storing the misuse message in SystemSettings
 */
export const MISUSE_MESSAGE_KEY = 'misuse_detection_message';

/**
 * Check if AI-generated content contains the misuse marker
 */
export function detectMisuse(content: string): boolean {
  return content.includes(MISUSE_MARKER);
}

/**
 * Get the current misuse message from database or use default
 */
export async function getMisuseMessage(): Promise<string> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: MISUSE_MESSAGE_KEY },
    });

    if (setting && setting.value) {
      return setting.value;
    }

    return DEFAULT_MISUSE_MESSAGE;
  } catch (error) {
    console.error('Error fetching misuse message:', error);
    return DEFAULT_MISUSE_MESSAGE;
  }
}

/**
 * Set the misuse message in database (admin only)
 */
export async function setMisuseMessage(message: string): Promise<void> {
  await prisma.systemSettings.upsert({
    where: { key: MISUSE_MESSAGE_KEY },
    update: { value: message },
    create: {
      key: MISUSE_MESSAGE_KEY,
      value: message,
      description: 'Message shown to users when prompt misuse is detected',
    },
  });
}
