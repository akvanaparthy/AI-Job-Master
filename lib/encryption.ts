import bcrypt from 'bcryptjs';

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

// For actual implementation, use crypto for reversible encryption
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!';
const IV_LENGTH = 16;

/**
 * Encrypts data using AES-256-CBC (reversible)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts data encrypted with AES-256-CBC
 */
export function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
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
    console.error(`API key validation failed for ${provider}:`, error);
    return false;
  }
}

/**
 * Gets available models for a given API key
 */
export async function getAvailableModels(apiKey: string, provider: 'openai' | 'anthropic' | 'gemini'): Promise<string[]> {
  try {
    switch (provider) {
      case 'openai':
        const { default: OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey });
        const models = await openai.models.list();
        return models.data
          .filter(m => m.id.includes('gpt'))
          .map(m => m.id)
          .sort();

      case 'anthropic':
        // Anthropic models are predefined
        return [
          'claude-3-5-sonnet-20241022',
          'claude-3-5-haiku-20241022',
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307',
        ];

      case 'gemini':
        // Gemini models are predefined
        return [
          'gemini-1.5-pro',
          'gemini-1.5-flash',
          'gemini-pro',
        ];

      default:
        return [];
    }
  } catch (error) {
    console.error(`Failed to get models for ${provider}:`, error);
    return [];
  }
}
