import { createServerSupabaseClient } from '../server';
import type { Patient, PatientListItem } from '@/types/patient';

export async function getPatients(): Promise<PatientListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, first_name, last_name, date_of_birth, diagnosis_codes, status, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as PatientListItem[]) ?? [];
}

export async function getPatientById(id: string): Promise<Patient> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Patient;
}
