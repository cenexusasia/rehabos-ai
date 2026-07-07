'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { VisitFormData } from '@/types/visit';

export const visitFormSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
  visit_type: z.enum([
    'initial_evaluation',
    'follow_up',
    'reevaluation',
    'discharge',
    'telehealth',
    'phone_consult',
  ], { message: 'Visit type is required' }),
  date: z.string().min(1, 'Date is required'),
  duration_minutes: z.number().int().positive().nullable().optional(),
  chief_complaint: z.string().max(2000).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export async function createVisit(formData: VisitFormData) {
  const supabase = await createServerSupabaseClient();

  const parsed = visitFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const insertData: Record<string, unknown> = {
    ...parsed.data,
    status: 'scheduled',
    duration_minutes: parsed.data.duration_minutes ?? null,
    chief_complaint: parsed.data.chief_complaint ?? null,
    notes: parsed.data.notes ?? null,
  };

  const { data, error } = await (supabase as any)
    .from('visits')
    .insert(insertData)
    .select('id')
    .single();

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath(`/patients/${formData.patient_id}`);
  revalidatePath('/visits');
  redirect(`/visits/${data.id}`);
}

export async function updateVisitStatus(id: string, status: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await (supabase as any)
    .from('visits')
    .update({ status })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/visits/${id}`);
  return { success: true };
}

export async function updateVisitBilling(
  id: string,
  billingData: { billing_code?: string; billing_status?: string; billing_amount?: number | null }
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await (supabase as any)
    .from('visits')
    .update(billingData)
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/visits/${id}`);
  return { success: true };
}
