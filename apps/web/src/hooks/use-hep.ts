'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  HomeExerciseProgram,
  HomeExerciseProgramListItem,
  HomeExerciseProgram as HEP,
  ProgramExerciseInput,
} from '@/types/hep';

// ── HEP (Home Exercise Program) Hooks ───────────────────────────────────────

export function useHEPsByClinician(clinicianId: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['hep-programs', 'clinician', clinicianId],
    queryFn: async () => {
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
    },
    enabled: !!clinicianId,
  });
}

export function useHEPsByPatient(patientId: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['hep-programs', 'patient', patientId],
    queryFn: async () => {
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
    },
    enabled: !!patientId,
  });
}

export function useHEP(id: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['hep-programs', id],
    queryFn: async () => {
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
    },
    enabled: !!id,
  });
}

// ── Mutation Hooks ──────────────────────────────────────────────────────────

export function useCreateHEP() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async ({
      formData,
      exercises,
    }: {
      formData: {
        patient_id: string;
        title: string;
        description: string | null;
        goal: string | null;
        precautions: string | null;
        frequency: string | null;
        duration_weeks: number | null;
        start_date: string | null;
        end_date: string | null;
      };
      exercises: ProgramExerciseInput[];
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Insert the program
      const { data: program, error: programError } = await supabase
        .from('hep_programs')
        .insert({
          patient_id: formData.patient_id,
          clinician_id: user?.id ?? '',
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
        exercises: (programExercises ?? []) as HEP['exercises'],
      } as HEP;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['hep-programs', 'patient', variables.formData.patient_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['hep-programs', 'clinician'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', variables.formData.patient_id, 'timeline'],
      });
    },
  });
}

export function useUpdateHEP() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: {
        title?: string;
        description?: string | null;
        goal?: string | null;
        precautions?: string | null;
        frequency?: string | null;
        duration_weeks?: number | null;
        start_date?: string | null;
        end_date?: string | null;
        status?: string;
      };
    }) => {
      const { error } = await supabase
        .from('hep_programs')
        .update(formData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['hep-programs', variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['hep-programs', 'clinician'],
      });
    },
  });
}

export function useUpdateHEPExercises() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async ({
      programId,
      exercises,
    }: {
      programId: string;
      exercises: ProgramExerciseInput[];
    }) => {
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
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['hep-programs', variables.programId],
      });
    },
  });
}

export function useArchiveHEP() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hep_programs')
        .update({
          status: 'archived',
          deleted_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['hep-programs'],
      });
    },
  });
}

// ── Invalidation Hooks ──────────────────────────────────────────────────────

export function useInvalidateHEP() {
  const queryClient = useQueryClient();
  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: ['hep-programs'] }),
    invalidatePatient: (patientId: string) =>
      queryClient.invalidateQueries({
        queryKey: ['hep-programs', 'patient', patientId],
      }),
  };
}
