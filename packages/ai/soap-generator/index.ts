import { z } from 'zod';
import {
  SYSTEM_PROMPT,
  INITIAL_EVAL_PROMPT,
  FOLLOW_UP_PROMPT,
  DEFAULT_PROMPT,
} from './prompts';

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const soapGenerateParamsSchema = z.object({
  visitType: z.enum([
    'initial_eval',
    'follow_up',
    'reevaluation',
    'discharge',
    'telehealth',
  ]),
  clinicianNotes: z.string().min(1, 'Clinician notes are required'),
  patientContext: z
    .object({
      diagnosis: z.string().optional(),
      age: z.number().optional(),
      gender: z.string().optional(),
      relevantHistory: z.string().optional(),
      medications: z.string().optional(),
      priorTreatments: z.string().optional(),
    })
    .optional()
    .default({}),
  pastSoapNotes: z
    .array(
      z.object({
        date: z.string().optional(),
        subjective: z.string().optional(),
        objective: z.string().optional(),
        assessment: z.string().optional(),
        plan: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  additionalContext: z.string().optional(),
});

export const soapOutputSchema = z.object({
  subjective: z.string(),
  objective: z.string(),
  assessment: z.string(),
  plan: z.string(),
});

export type SoapGenerateParams = z.infer<typeof soapGenerateParamsSchema>;
export type SoapOutput = z.infer<typeof soapOutputSchema>;

// ---------------------------------------------------------------------------
// Prompt Building
// ---------------------------------------------------------------------------

/**
 * Build patient context string from structured patient context object.
 */
function buildPatientContextStr(ctx: SoapGenerateParams['patientContext']): string {
  if (!ctx || Object.keys(ctx).length === 0) {
    return 'No additional patient context provided.';
  }

  const lines: string[] = [];
  if (ctx.diagnosis) lines.push(`- **Diagnosis:** ${ctx.diagnosis}`);
  if (ctx.age !== undefined) lines.push(`- **Age:** ${ctx.age}`);
  if (ctx.gender) lines.push(`- **Gender:** ${ctx.gender}`);
  if (ctx.relevantHistory) lines.push(`- **Relevant History:** ${ctx.relevantHistory}`);
  if (ctx.medications) lines.push(`- **Current Medications:** ${ctx.medications}`);
  if (ctx.priorTreatments) lines.push(`- **Prior Treatments:** ${ctx.priorTreatments}`);

  return lines.length > 0 ? lines.join('\n') : 'No additional patient context provided.';
}

/**
 * Build past SOAP notes summary string.
 */
function buildPastNotesStr(notes: SoapGenerateParams['pastSoapNotes']): string {
  if (!notes || notes.length === 0) {
    return 'No past SOAP notes available.';
  }

  return notes
    .map((note, i) => {
      const parts: string[] = [];
      if (note.date) parts.push(`**Date:** ${note.date}`);
      if (note.subjective) parts.push(`**Subjective:** ${note.subjective}`);
      if (note.objective) parts.push(`**Objective:** ${note.objective}`);
      if (note.assessment) parts.push(`**Assessment:** ${note.assessment}`);
      if (note.plan) parts.push(`**Plan:** ${note.plan}`);
      return parts.length > 0
        ? `### Note ${i + 1}\n${parts.join('\n\n')}`
        : null;
    })
    .filter(Boolean)
    .join('\n\n---\n\n');
}

/**
 * Get the appropriate user prompt template for a given visit type.
 */
function getUserPromptTemplate(visitType: string): string {
  switch (visitType) {
    case 'initial_eval':
      return INITIAL_EVAL_PROMPT;
    case 'follow_up':
      return FOLLOW_UP_PROMPT;
    default:
      return DEFAULT_PROMPT.replace('{visitType}', visitType);
  }
}

/**
 * Build the full system + user prompts from templates and patient data.
 */
export function buildPrompt(params: SoapGenerateParams): {
  systemPrompt: string;
  userPrompt: string;
} {
  const validated = soapGenerateParamsSchema.parse(params);
  const systemPrompt = SYSTEM_PROMPT;

  let userPrompt = getUserPromptTemplate(validated.visitType);

  const patientContextStr = buildPatientContextStr(validated.patientContext);
  const pastNotesStr = buildPastNotesStr(validated.pastSoapNotes);

  userPrompt = userPrompt
    .replace('{additionalContext}', validated.additionalContext || 'None')
    .replace('{clinicianNotes}', validated.clinicianNotes)
    .replace('{patientContext}', patientContextStr)
    .replace('{pastNotes}', pastNotesStr);

  return { systemPrompt, userPrompt };
}

// ---------------------------------------------------------------------------
// Response Parsing
// ---------------------------------------------------------------------------

/**
 * Parse the raw AI response text into structured SOAP output.
 * Handles code-block-wrapped JSON and bare JSON objects.
 */
export function parseResponse(raw: string): SoapOutput {
  let jsonStr = raw;

  // Try extracting from markdown code blocks first
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch?.[1]) {
    jsonStr = codeBlockMatch[1].trim();
  }

  // Try extracting the outermost JSON object
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(
      'Failed to parse AI response as JSON. The model did not return valid JSON output.',
    );
  }

  try {
    return soapOutputSchema.parse(parsed);
  } catch (err) {
    const message = err instanceof z.ZodError ? err.message : String(err);
    throw new Error(
      `AI response did not match expected SOAP format: ${message}. Raw: ${jsonStr.slice(0, 200)}`,
    );
  }
}

// ---------------------------------------------------------------------------
// AI Provider Clients
// ---------------------------------------------------------------------------

type AiProvider = 'openai' | 'anthropic';

interface GenerateOptions {
  /** Override the AI provider (default: process.env.AI_PROVIDER or 'openai') */
  provider?: AiProvider;
  /** Override the API key (default: process.env.OPENAI_API_KEY or ANTHROPIC_API_KEY) */
  apiKey?: string;
  /** Override the model (default: process.env.AI_MODEL or provider default) */
  model?: string;
}

async function generateWithOpenAI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model?: string,
): Promise<string> {
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: model || 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned an empty response.');
  }

  return content;
}

async function generateWithAnthropic(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model?: string,
): Promise<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: model || 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    temperature: 0.3,
  });

  const textBlocks = (response.content ?? []).filter(
    (block: any): block is { type: 'text'; text: string } => block.type === 'text',
  );
  const content = textBlocks.map((block: any) => block.text).join('\n');

  if (!content) {
    throw new Error('Anthropic returned an empty response.');
  }

  return content;
}

/**
 * Resolve the provider-specific API key from options or environment variables.
 */
function resolveApiKey(provider: AiProvider, options?: GenerateOptions): string {
  if (options?.apiKey) return options.apiKey;

  const envKey =
    provider === 'openai'
      ? process.env.OPENAI_API_KEY
      : process.env.ANTHROPIC_API_KEY;

  if (!envKey) {
    const envVar =
      provider === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY';
    throw new Error(
      `No API key configured for ${provider}. Set the ${envVar} environment variable or pass an apiKey in options.`,
    );
  }

  return envKey;
}

// ---------------------------------------------------------------------------
// Main Entry Point
// ---------------------------------------------------------------------------

/**
 * Generate a structured SOAP note from clinician notes and patient context.
 *
 * @param params   - Clinician notes, patient context, visit type, and optional past notes
 * @param options  - Optional override for provider, API key, or model
 * @returns        - Structured SOAP note with subjective, objective, assessment, and plan
 *
 * @example
 * ```ts
 * const result = await generateSoap({
 *   visitType: 'initial_eval',
 *   clinicianNotes: 'Patient reports right shoulder pain...',
 *   patientContext: { diagnosis: 'Rotator cuff tendinitis', age: 45 },
 * });
 * console.log(result.subjective); // HTML string
 * ```
 */
export async function generateSoap(
  params: SoapGenerateParams,
  options?: GenerateOptions,
): Promise<SoapOutput> {
  // Validate input
  const validated = soapGenerateParamsSchema.parse(params);

  // Determine provider
  const provider: AiProvider =
    options?.provider ?? (process.env.AI_PROVIDER as AiProvider) ?? 'openai';

  // Resolve API key
  const apiKey = resolveApiKey(provider, options);

  // Build the full prompt
  const { systemPrompt, userPrompt } = buildPrompt(validated);

  // Call the appropriate AI provider
  let rawResponse: string;
  try {
    rawResponse =
      provider === 'openai'
        ? await generateWithOpenAI(systemPrompt, userPrompt, apiKey, options?.model)
        : await generateWithAnthropic(systemPrompt, userPrompt, apiKey, options?.model);
  } catch (error) {
    if (error instanceof Error) {
      // Preserve the original error stack but wrap with context
      throw new Error(
        `AI generation failed (${provider}): ${error.message}`,
      );
    }
    throw error;
  }

  // Parse and validate the response
  try {
    return parseResponse(rawResponse);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to parse AI response into SOAP format: ${error.message}`,
      );
    }
    throw error;
  }
}

/**
 * Generate a SOAP note synchronously (for testing / preview).
 * Not recommended for production use — only real AI calls produce clinical-quality output.
 */
export function generateSoapStub(params: SoapGenerateParams): SoapOutput {
  const validated = soapGenerateParamsSchema.parse(params);
  const notes = validated.clinicianNotes;

  const sectionHtml = (content: string) =>
    `<p>${content.replace(/\n/g, '</p><p>')}</p>`;

  return {
    subjective: sectionHtml(`[Stub] Subjective from notes:\n${notes}`),
    objective: sectionHtml(`[Stub] Objective section — populate from clinical findings`),
    assessment: sectionHtml(`[Stub] Assessment section — requires clinician review`),
    plan: sectionHtml(`[Stub] Plan section — requires clinician review`),
  };
}
