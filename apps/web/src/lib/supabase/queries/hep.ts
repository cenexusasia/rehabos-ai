import { createClient } from '../client';
import type {
  HomeExerciseProgram,
  HomeExerciseProgramListItem,
  HEPFormData,
  ProgramExerciseInput,
} from '@/types/hep';

// ── HEP Queries ─────────────────────────────────────────────────────────────

export async function getHEPsByClinician(
  clinicianId: string,
): Promise<HomeExerciseProgramListItem[]> {
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from('hep_programs')
    .select(
      `id, patient_id, clinician_id, title, description, status, frequency, duration_weeks, start_date, end_date, compliance_percent, created_at, updated_at,
      patient:patient_id(id, first_name, last_name),
      clinician:clinician_id(id, first_name, last_name)`,
    )
    .eq('clinician_id', clinicianId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as HomeExerciseProgramListItem[]) ?? [];
}

export async function getHEPsByPatient(
  patientId: string,
): Promise<HomeExerciseProgramListItem[]> {
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from('hep_programs')
    .select(
      `id, patient_id, clinician_id, title, description, status, frequency, duration_weeks, start_date, end_date, compliance_percent, created_at, updated_at,
      patient:patient_id(id, first_name, last_name),
      clinician:clinician_id(id, first_name, last_name)`,
    )
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as HomeExerciseProgramListItem[]) ?? [];
}

export async function getHEPById(id: string): Promise<HomeExerciseProgram> {
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from('hep_programs')
    .select(
      `*,
      exercises:hep_program_exercises(
        id, program_id, exercise_id, sort_order, parameters,
        exercise:exercise_id(*)
      )`,
    )
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as HomeExerciseProgram;
}

export async function createHEP(
  clinicianId: string,
  formData: HEPFormData,
  exercises: ProgramExerciseInput[],
): Promise<HomeExerciseProgram> {
  const supabase = createClient() as any;

  // Insert the program
  const { data: program, error: programError } = await supabase
    .from('hep_programs')
    .insert({
      patient_id: formData.patient_id,
      clinician_id: clinicianId,
      title: formData.title,
      description: formData.description,
      goal: formData.goal,
      precautions: formData.precautions,
      frequency: formData.frequency,
      duration_weeks: formData.duration_weeks,
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: 'active',
    })
    .select()
    .single();

  if (programError) throw programError;
  if (!program) throw new Error('Failed to create HEP program');

  // Insert exercises with the program ID
  const exerciseRows = exercises.map((ex) => ({
    program_id: program.id,
    exercise_id: ex.exercise_id,
    sort_order: ex.sort_order,
    parameters: ex.parameters,
  }));

  const { data: programExercises, error: exError } = await supabase
    .from('hep_program_exercises')
    .insert(exerciseRows)
    .select();

  if (exError) throw exError;

  return {
    ...program,
    exercises: (programExercises ?? []) as HomeExerciseProgram['exercises'],
  } as HomeExerciseProgram;
}

export async function updateHEP(
  id: string,
  formData: Partial<HEPFormData>,
): Promise<void> {
  const supabase = createClient() as any;
  const { error } = await supabase
    .from('hep_programs')
    .update(formData)
    .eq('id', id);
  if (error) throw error;
}

export async function updateHEPExercises(
  programId: string,
  exercises: ProgramExerciseInput[],
): Promise<void> {
  const supabase = createClient() as any;

  // Delete existing exercises for this program
  const { error: deleteError } = await supabase
    .from('hep_program_exercises')
    .delete()
    .eq('program_id', programId);
  if (deleteError) throw deleteError;

  // Insert new exercises
  if (exercises.length > 0) {
    const exerciseRows = exercises.map((ex) => ({
      program_id: programId,
      exercise_id: ex.exercise_id,
      sort_order: ex.sort_order,
      parameters: ex.parameters,
    }));

    const { error: insertError } = await supabase
      .from('hep_program_exercises')
      .insert(exerciseRows);
    if (insertError) throw insertError;
  }
}

export async function archiveHEP(id: string): Promise<void> {
  const supabase = createClient() as any;
  const { error } = await supabase
    .from('hep_programs')
    .update({ status: 'archived', deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
