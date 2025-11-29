import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { logger } from './logger';

const SALT_ROUNDS = 10;

/**
 * Encrypts an API key using bcrypt
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  return await bcrypt.hash(apiKey, SALT_ROUNDS);
}

/**
 * Note: bcrypt is one-way encryption, so we can't decrypt.
 * For production, consider using AES encryption with a secret key.
 * For now, we'll store the encrypted version for validation.
 *
 * IMPORTANT: In a real implementation, use reversible encryption (AES)
 * so you can decrypt the API key when making AI API calls.
 */

const ALGORITHM = 'aes-256-cbc';
// AES-256 requires exactly 32 bytes (256 bits). If hex string is provided, convert it.
const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!';
// If the key is a hex string (64 chars = 32 bytes in hex), convert it to buffer
const ENCRYPTION_KEY = ENCRYPTION_KEY_RAW.length === 64 
  ? Buffer.from(ENCRYPTION_KEY_RAW, 'hex')
  : Buffer.from(ENCRYPTION_KEY_RAW.padEnd(32, '0').slice(0, 32));
const IV_LENGTH = 16;

/**
 * Encrypts data using AES-256-CBC (reversible)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts data encrypted with AES-256-CBC
 */
export function decrypt(text: string): string {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid encrypted text');
    }

    const textParts = text.split(':');
    if (textParts.length < 2) {
      throw new Error('Malformed encrypted text');
    }

    const ivHex = textParts.shift()!;
    if (ivHex.length !== IV_LENGTH * 2) {
      throw new Error('Invalid IV length');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    logger.error('Decryption failed', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Validates an API key by making a test call (implement per provider)
 */
export async function validateApiKey(apiKey: string, provider: 'openai' | 'anthropic' | 'gemini'): Promise<boolean> {
  try {
    switch (provider) {
      case 'openai':
        // Test OpenAI API key
        const { default: OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey });
        await openai.models.list();
        return true;

      case 'anthropic':
        // Test Anthropic API key
        const { default: Anthropic } = await import('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey });
        // Anthropic doesn't have a simple test endpoint, so we'll just check format
        return apiKey.startsWith('sk-ant-');

      case 'gemini':
        // Test Gemini API key
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        await genAI.getGenerativeModel({ model: 'gemini-pro' });
        return true;

      default:
        return false;
    }
  } catch (error) {
    logger.error(`API key validation failed for ${provider}`, error);
    return false;
  }
}

/**
 * Gets available models for a given API key with their display names
 */
export async function getAvailableModelsWithNames(
  apiKey: string,
  provider: 'openai' | 'anthropic' | 'gemini'
): Promise<Array<{ id: string; displayName: string }>> {
  // Import formatter utility once at the top for fallback
  const { getModelDisplayName } = await import('./utils/modelNames');
  
  try {
    switch (provider) {
      case 'openai':
        const { default: OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey });
        const models = await openai.models.list();
        // OpenAI doesn't provide display names, use our formatter as fallback
        // Filter for main GPT models only (exclude specialized variants)
        const mainModels = models.data.filter(m => {
          const id = m.id;
          // Include main model versions
          if (id === 'gpt-3.5-turbo') return true;
          if (id === 'gpt-4.1') return true;
          if (id === 'gpt-4o') return true;
          if (id === 'gpt-4o-mini') return true;
          if (id === 'gpt-5') return true;
          if (id === 'gpt-5-mini') return true;
          if (id === 'gpt-5-nano') return true;
          if (id === 'gpt-5-pro') return true;
          if (id === 'gpt-5.1') return true;
          return false;
        });
        
        return mainModels
          .map(m => ({
            id: m.id,
            displayName: getModelDisplayName(m.id),
          }))
          .sort((a, b) => a.id.localeCompare(b.id));

      case 'anthropic':
        // Fetch available models from Anthropic API with native display names
        try {
          const response = await fetch('https://api.anthropic.com/v1/models', {
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return data.data.map((model: any) => ({
              id: model.id,
              displayName: model.display_name,
            }));
          }
        } catch (error) {
          logger.error('Failed to fetch Anthropic models from API', error);
        }
        
        // Fallback with display names
        return [
          { id: 'claude-opus-4-5-20251101', displayName: 'Claude Opus 4.5' },
          { id: 'claude-haiku-4-5-20251001', displayName: 'Claude Haiku 4.5' },
          { id: 'claude-sonnet-4-5-20250929', displayName: 'Claude Sonnet 4.5' },
          { id: 'claude-opus-4-1-20250805', displayName: 'Claude Opus 4.1' },
          { id: 'claude-opus-4-20250514', displayName: 'Claude Opus 4' },
          { id: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4' },
          { id: 'claude-3-7-sonnet-20250219', displayName: 'Claude Sonnet 3.7' },
          { id: 'claude-3-5-haiku-20241022', displayName: 'Claude Haiku 3.5' },
          { id: 'claude-3-haiku-20240307', displayName: 'Claude Haiku 3' },
        ];

      case 'gemini':
        // Fetch Gemini models with native display names
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.models) {
              // Filter for main Gemini chat models only
              const mainGeminiModels = [
                'models/gemini-2.0-flash',
                'models/gemini-2.0-flash-lite',
                'models/gemini-2.5-flash',
                'models/gemini-2.5-pro',
                'models/gemini-3-pro-preview',
              ];
              
              return data.models
                .filter((m: any) => mainGeminiModels.includes(m.name))
                .map((m: any) => ({
                  id: m.name.replace('models/', ''),
                  displayName: m.displayName,
                }))
                .sort((a: any, b: any) => a.id.localeCompare(b.id));
            }
          }
        } catch (error) {
          logger.error('Failed to fetch Gemini models from API', error);
        }
        
        // Fallback with formatter
        return [
          'gemini-2.0-flash',
          'gemini-2.0-flash-lite',
          'gemini-2.5-flash',
          'gemini-2.5-pro',
          'gemini-3-pro-preview',
        ].map(id => ({
          id,
          displayName: getModelDisplayName(id),
        }));

      default:
        return [];
    }
  } catch (error) {
    logger.error(`Failed to get models for ${provider}`, error);
    return [];
  }
}

/**
 * Gets available models for a given API key (returns IDs only for backwards compatibility)
 */
export async function getAvailableModels(apiKey: string, provider: 'openai' | 'anthropic' | 'gemini'): Promise<string[]> {
  const modelsWithNames = await getAvailableModelsWithNames(apiKey, provider);
  return modelsWithNames.map(m => m.id);
}
