'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SoapGenerateResult {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface GenerateSoapInput {
  soapNoteId?: string;
  visitType: 'initial_eval' | 'follow_up' | 'reevaluation' | 'discharge' | 'telehealth';
  clinicianNotes: string;
  patientContext?: {
    diagnosis?: string;
    age?: number;
    gender?: string;
    relevantHistory?: string;
    medications?: string;
    priorTreatments?: string;
  };
  pastSoapNotes?: Array<{
    date?: string;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  }>;
  additionalContext?: string;
  /** Which AI provider to use */
  provider?: 'openai' | 'anthropic';
  /** Which AI model to use */
  model?: string;
}

export interface GenerateSoapResponse {
  success: boolean;
  data?: SoapGenerateResult;
  error?: string;
}

// ---------------------------------------------------------------------------
// Server action: call the API route from the server
// ---------------------------------------------------------------------------

/**
 * Generate a SOAP note using AI. This server action calls the internal
 * API route so that the AI generation request stays server-side.
 *
 * If a soapNoteId is provided, the generated content will be saved as an
 * ai_draft on that SOAP note for clinician review.
 */
export async function generateSoapAction(
  input: GenerateSoapInput,
): Promise<GenerateSoapResponse> {
  const supabase = await createServerSupabaseClient();

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Build the request URL — use the internal API route
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiUrl = new URL('/api/ai/soap/generate', baseUrl);

    const response = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the current auth context if needed
        ...(requestHeaders() ?? {}),
      },
      body: JSON.stringify({
        visitType: input.visitType,
        clinicianNotes: input.clinicianNotes,
        patientContext: input.patientContext,
        pastSoapNotes: input.pastSoapNotes,
        additionalContext: input.additionalContext,
        provider: input.provider,
        model: input.model,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.message || result.error || 'SOAP generation failed',
      };
    }

    const data = result.data as SoapGenerateResult;

    // If a SOAP note ID was provided, save the AI draft to the database
    if (input.soapNoteId && data) {
      const { error: saveError } = await (supabase as any)
        .from('soap_notes')
        .update({
          ai_draft: {
            subjective: { html: data.subjective },
            objective: { html: data.objective },
            assessment: { html: data.assessment },
            plan: { html: data.plan },
            generatedAt: new Date().toISOString(),
            visitType: input.visitType,
          },
          ai_generated: true,
          ai_assisted: true,
        })
        .eq('id', input.soapNoteId);

      if (saveError) {
        console.error('Failed to save AI draft:', saveError);
        // Non-fatal — still return the generated content
      }

      revalidatePath(`/soap/${input.soapNoteId}`);
      revalidatePath('/soap');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[ai-soap] Generation failed:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during SOAP generation.',
    };
  }
}

/**
 * Save AI-generated content directly to a SOAP note's main fields
 * (bypassing the ai_draft). Used when the clinician accepts the AI suggestion.
 */
export async function acceptAiSoapContent(
  soapNoteId: string,
  content: SoapGenerateResult,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await (supabase as any)
    .from('soap_notes')
    .update({
      subjective: { html: content.subjective },
      objective: { html: content.objective },
      assessment: { html: content.assessment },
      plan: { html: content.plan },
      ai_assisted: true,
      ai_draft: null,
    })
    .eq('id', soapNoteId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/soap/${soapNoteId}`);
  revalidatePath('/soap');

  return { success: true };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Safely access incoming request headers in a server action.
 * Returns undefined if called outside of a request context.
 */
function requestHeaders(): Record<string, string> | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { headers } = require('next/headers');
    const h = headers();
    return {
      cookie: h.get('cookie') ?? '',
    };
  } catch {
    return undefined;
  }
}
