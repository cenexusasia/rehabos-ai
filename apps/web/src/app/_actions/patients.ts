'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { patientFormSchema } from '@/components/forms/patient-form';
import type { PatientFormData } from '@/types/patient';

export async function createPatient(formData: PatientFormData) {
  const supabase = await createServerSupabaseClient();

  const parsed = patientFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const insertData: Record<string, unknown> = {
    ...parsed.data,
    diagnosis_codes: parsed.data.diagnosis_codes ?? [],
    tags: parsed.data.tags ?? [],
    status: parsed.data.status ?? 'active',
  };

  const { data, error } = await (supabase as any)
    .from('patients')
    .insert(insertData)
    .select('id')
    .single();

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath('/patients');
  redirect(`/patients/${data.id}`);
}

export async function updatePatient(id: string, formData: Partial<PatientFormData>) {
  const supabase = await createServerSupabaseClient();

  const parsed = patientFormSchema.partial().safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await (supabase as any)
    .from('patients')
    .update(parsed.data)
    .eq('id', id);

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath('/patients');
  revalidatePath(`/patients/${id}`);
  redirect(`/patients/${id}`);
}

export async function deletePatient(id: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await (supabase as any)
    .from('patients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/patients');
  redirect('/patients');
}
