'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface SaveSoapDraftInput {
  soapNoteId: string;
  subjective?: Record<string, unknown>;
  objective?: Record<string, unknown>;
  assessment?: Record<string, unknown>;
  plan?: Record<string, unknown>;
}

export async function saveSoapDraft(input: SaveSoapDraftInput) {
  const supabase = await createServerSupabaseClient();

  const updateData: Record<string, unknown> = {};
  if (input.subjective !== undefined) updateData.subjective = input.subjective;
  if (input.objective !== undefined) updateData.objective = input.objective;
  if (input.assessment !== undefined) updateData.assessment = input.assessment;
  if (input.plan !== undefined) updateData.plan = input.plan;

  const { error } = await (supabase as any)
    .from('soap_notes')
    .update(updateData)
    .eq('id', input.soapNoteId);

  if (error) throw new Error(error.message);
  revalidatePath('/soap');
}

export async function createSoapNote(input: {
  visit_id: string;
  patient_id: string;
  clinician_id: string;
}) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await (supabase as any)
    .from('soap_notes')
    .insert({
      visit_id: input.visit_id,
      patient_id: input.patient_id,
      clinician_id: input.clinician_id,
      subjective: {},
      objective: {},
      assessment: {},
      plan: {},
      status: 'draft',
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/soap');
  return data as { id: string };
}
