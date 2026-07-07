/**
 * Shared AI client configured for DeepSeek (OpenAI-compatible API).
 *
 * DeepSeek base URL: https://api.deepseek.com
 * Model: deepseek-chat (Flash = deepseek-chat, no separate Flash model)
 */

export const AI_CONFIG = {
  baseUrl: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
  apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || '',
  model: process.env.AI_MODEL || 'deepseek-chat',
  whisperModel: 'whisper-1',
};

export function getAiClient() {
  const { default: OpenAI } = require('openai') as typeof import('openai');
  return new OpenAI({
    apiKey: AI_CONFIG.apiKey,
    baseURL: AI_CONFIG.baseUrl,
  });
}

export function getFetchHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AI_CONFIG.apiKey}`,
  };
}

export function getChatCompletionBody(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options?: { temperature?: number; maxTokens?: number; responseFormat?: Record<string, unknown> },
) {
  return {
    model: AI_CONFIG.model,
    messages,
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.maxTokens ?? 4096,
    ...(options?.responseFormat ? { response_format: options.responseFormat } : {}),
  };
}
