'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface SoapNoteListItem {
  id: string;
  visit_id: string;
  patient_id: string;
  clinician_id: string;
  status: string;
  signed_at: string | null;
  signed_by_clinician_id: string | null;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  clinician?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  visit?: {
    id: string;
    visit_date: string;
    type: string;
  } | null;
}

export interface SoapNoteDetail {
  id: string;
  visit_id: string;
  patient_id: string;
  clinician_id: string;
  subjective: Record<string, unknown>;
  objective: Record<string, unknown>;
  assessment: Record<string, unknown>;
  plan: Record<string, unknown>;
  ai_generated: boolean;
  ai_draft: Record<string, unknown> | null;
  ai_assisted: boolean;
  status: string;
  signed_at: string | null;
  signed_by_clinician_id: string | null;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
  } | null;
  clinician?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  visit?: {
    id: string;
    visit_date: string;
    type: string;
  } | null;
  signed_by?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

export async function getSoapNotes(params?: {
  patientId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: SoapNoteListItem[]; count: number }> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('soap_notes')
    .select(
      'id, visit_id, patient_id, clinician_id, status, signed_at, signed_by_clinician_id, created_at, updated_at, ' +
        'patient:patients(id, first_name, last_name), ' +
        'clinician:clinicians(id, first_name, last_name), ' +
        'visit:visits(id, visit_date, type)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false });

  if (params?.patientId) {
    query = query.eq('patient_id', params.patientId);
  }
  if (params?.status) {
    query = query.eq('status', params.status);
  }
  if (params?.fromDate) {
    query = query.gte('created_at', params.fromDate);
  }
  if (params?.toDate) {
    query = query.lte('created_at', params.toDate);
  }

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    data: (data as unknown as SoapNoteListItem[]) ?? [],
    count: count ?? 0,
  };
}

export async function getSoapNoteById(id: string): Promise<SoapNoteDetail | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('soap_notes')
    .select(
      'id, visit_id, patient_id, clinician_id, subjective, objective, assessment, plan, ' +
        'ai_generated, ai_draft, ai_assisted, status, signed_at, signed_by_clinician_id, created_at, updated_at, ' +
        'patient:patients(id, first_name, last_name, date_of_birth), ' +
        'clinician:clinicians(id, first_name, last_name), ' +
        'visit:visits(id, visit_date, type), ' +
        'signed_by:clinicians!soap_notes_signed_by_clinician_id_fkey(id, first_name, last_name)',
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return data as unknown as SoapNoteDetail;
}

export async function getSoapNotesByPatient(
  patientId: string,
): Promise<SoapNoteListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('soap_notes')
    .select(
      'id, visit_id, patient_id, clinician_id, status, signed_at, signed_by_clinician_id, created_at, updated_at, ' +
        'clinician:clinicians(id, first_name, last_name), ' +
        'visit:visits(id, visit_date, type)',
    )
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data as unknown as SoapNoteListItem[]) ?? [];
}

export async function getSoapNotesByClinician(
  clinicianId: string,
): Promise<SoapNoteListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('soap_notes')
    .select(
      'id, visit_id, patient_id, clinician_id, status, signed_at, signed_by_clinician_id, created_at, updated_at, ' +
        'patient:patients(id, first_name, last_name), ' +
        'visit:visits(id, visit_date, type)',
    )
    .eq('clinician_id', clinicianId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data as unknown as SoapNoteListItem[]) ?? [];
}

export interface CreateSoapNoteInput {
  visit_id: string;
  patient_id: string;
  clinician_id: string;
  subjective?: Record<string, unknown>;
  objective?: Record<string, unknown>;
  assessment?: Record<string, unknown>;
  plan?: Record<string, unknown>;
}

export async function createSoapNote(
  input: CreateSoapNoteInput,
): Promise<SoapNoteDetail> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await (supabase as any)
    .from('soap_notes')
    .insert({
      visit_id: input.visit_id,
      patient_id: input.patient_id,
      clinician_id: input.clinician_id,
      subjective: input.subjective ?? {},
      objective: input.objective ?? {},
      assessment: input.assessment ?? {},
      plan: input.plan ?? {},
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as unknown as SoapNoteDetail;
}

export interface UpdateSoapNoteInput {
  subjective?: Record<string, unknown>;
  objective?: Record<string, unknown>;
  assessment?: Record<string, unknown>;
  plan?: Record<string, unknown>;
  ai_generated?: boolean;
  ai_draft?: Record<string, unknown> | null;
  ai_assisted?: boolean;
}

export async function updateSoapNote(
  id: string,
  input: UpdateSoapNoteInput,
): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const updateData: Record<string, unknown> = {};

  if (input.subjective !== undefined) updateData.subjective = input.subjective;
  if (input.objective !== undefined) updateData.objective = input.objective;
  if (input.assessment !== undefined) updateData.assessment = input.assessment;
  if (input.plan !== undefined) updateData.plan = input.plan;
  if (input.ai_generated !== undefined) updateData.ai_generated = input.ai_generated;
  if (input.ai_draft !== undefined) updateData.ai_draft = input.ai_draft;
  if (input.ai_assisted !== undefined) updateData.ai_assisted = input.ai_assisted;

  const { error } = await (supabase as any)
    .from('soap_notes')
    .update(updateData)
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function getSoapNoteCount(params?: {
  status?: string;
  clinicianId?: string;
  patientId?: string;
}): Promise<Record<string, number>> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('soap_notes')
    .select('status', { count: 'exact', head: false });

  if (params?.clinicianId) {
    query = query.eq('clinician_id', params.clinicianId);
  }
  if (params?.patientId) {
    query = query.eq('patient_id', params.patientId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const counts: Record<string, number> = { draft: 0, completed: 0, signed: 0, amended: 0, corrected: 0 };
  for (const row of (data as { status: string }[]) ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  return counts;
}
