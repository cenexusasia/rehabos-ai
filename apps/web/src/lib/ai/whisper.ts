/**
 * Whisper API client for OpenAI audio transcription.
 * Sends audio blobs to OpenAI Whisper API and returns transcribed text.
 */

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export interface WhisperConfig {
  apiKey?: string;
  model?: string;
  language?: string;
}

export class WhisperError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'WhisperError';
  }
}

/**
 * Sends an audio blob to OpenAI Whisper API for transcription.
 *
 * @param audioBlob - The recorded audio blob (webm or other supported format)
 * @param config - Optional configuration overrides
 * @returns The transcribed text string
 *
 * @throws {WhisperError} If the API request fails or returns an error
 */
export async function sendAudioForTranscription(
  audioBlob: Blob,
  config?: WhisperConfig,
): Promise<string> {
  const apiKey = config?.apiKey ?? process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    throw new WhisperError(
      'OpenAI API key is not configured. Set NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.',
      undefined,
      'MISSING_API_KEY',
    );
  }

  const formData = new FormData();
  formData.append('model', config?.model ?? 'whisper-1');
  formData.append('file', audioBlob, 'recording.webm');
  if (config?.language) {
    formData.append('language', config.language);
  }

  let response: Response;
  try {
    response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });
  } catch (err) {
    throw new WhisperError(
      `Network error while calling Whisper API: ${err instanceof Error ? err.message : 'Unknown error'}`,
      undefined,
      'NETWORK_ERROR',
    );
  }

  if (!response.ok) {
    let errorBody = '';
    try {
      const errorJson = await response.json();
      errorBody = errorJson.error?.message ?? JSON.stringify(errorJson);
    } catch {
      errorBody = await response.text().catch(() => 'Unknown error');
    }
    throw new WhisperError(
      `Whisper API error (${response.status}): ${errorBody}`,
      response.status,
      'API_ERROR',
    );
  }

  const result = await response.json();
  return (result.text as string) ?? '';
}
