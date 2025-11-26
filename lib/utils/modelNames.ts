// Mapping of technical model names to user-friendly display names
export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // OpenAI Models
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'gpt-4': 'GPT-4',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',

  // Anthropic Claude Models
  'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
  'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
  'claude-3-opus-20240229': 'Claude 3 Opus',
  'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
  'claude-3-haiku-20240307': 'Claude 3 Haiku',

  // Google Gemini Models
  'gemini-2.0-flash-exp': 'Gemini 2.0 Flash',
  'gemini-exp-1206': 'Gemini Exp',
  'gemini-1.5-pro': 'Gemini 1.5 Pro',
  'gemini-1.5-flash': 'Gemini 1.5 Flash',
};

/**
 * Converts a technical model name to a user-friendly display name
 * @param modelName - The technical model name (e.g., "claude-3-5-sonnet-20241022")
 * @returns User-friendly display name (e.g., "Claude 3.5 Sonnet") or the original name if not mapped
 */
export function getModelDisplayName(modelName: string): string {
  return MODEL_DISPLAY_NAMES[modelName] || modelName;
}

/**
 * Gets the provider name from a model name
 * @param modelName - The technical model name
 * @returns Provider name (OpenAI, Anthropic, Google) or "Unknown"
 */
export function getModelProvider(modelName: string): string {
  if (modelName.startsWith('gpt-')) return 'OpenAI';
  if (modelName.startsWith('claude-')) return 'Anthropic';
  if (modelName.startsWith('gemini-')) return 'Google';
  return 'Unknown';
}

/**
 * Formats model name with provider in parentheses
 * @param modelName - The technical model name
 * @returns Formatted string like "Claude 3.5 Sonnet (Anthropic)"
 */
export function getModelDisplayNameWithProvider(modelName: string): string {
  const displayName = getModelDisplayName(modelName);
  const provider = getModelProvider(modelName);

  if (provider === 'Unknown' || displayName === modelName) {
    return displayName;
  }

  return `${displayName} (${provider})`;
}
