import { createServerSupabaseClient } from '../server';
import type { Visit, VisitListItem } from '@/types/visit';

export async function getVisitsByPatient(patientId: string): Promise<VisitListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('visits')
    .select('id, patient_id, visit_type, status, date, duration_minutes, chief_complaint, created_at')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data as VisitListItem[]) ?? [];
}

export async function getVisitById(id: string): Promise<Visit> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('visits')
    .select('*, patients(first_name, last_name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Visit;
}

export async function getRecentVisits(limit = 10): Promise<VisitListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('visits')
    .select('id, patient_id, visit_type, status, date, duration_minutes, chief_complaint, created_at, patients(first_name, last_name)')
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as VisitListItem[]) ?? [];
}
