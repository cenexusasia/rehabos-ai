'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { SoapNoteListItem, SoapNoteDetail } from '@/lib/supabase/queries/soap';

export interface SoapListParams {
  patientId?: string;
  clinicianId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useSoapNotes(params?: SoapListParams) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['soap-notes', params],
    queryFn: async () => {
      let query = (supabase as any)
        .from('soap_notes')
        .select(
          'id, visit_id, patient_id, clinician_id, status, signed_at, signed_by_clinician_id, created_at, updated_at, ' +
            'patient:patient_id(first_name, last_name), visit:visit_id(visit_type, visit_number)',
          { count: 'exact' },
        )
        .order('created_at', { ascending: false });

      if (params?.patientId) query = query.eq('patient_id', params.patientId);
      if (params?.clinicianId) query = query.eq('clinician_id', params.clinicianId);
      if (params?.status) query = query.eq('status', params.status);
      if (params?.page && params?.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: (data ?? []) as SoapNoteListItem[], count: count ?? 0 };
    },
  });
}

export function useSoapNote(id: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['soap-notes', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('soap_notes')
        .select(
          'id, visit_id, patient_id, clinician_id, subjective, objective, assessment, plan, ' +
            'status, ai_generated, ai_assisted, signed_at, signed_by_clinician_id, created_at, updated_at',
        )
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as SoapNoteDetail;
    },
  });
}

export function useSoapNotesByPatient(patientId: string) {
  return useSoapNotes({ patientId });
}

export function useCreateSoapNote() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: {
      visit_id: string;
      patient_id: string;
      clinician_id: string;
      subjective?: Record<string, unknown>;
      objective?: Record<string, unknown>;
      assessment?: Record<string, unknown>;
      plan?: Record<string, unknown>;
    }) => {
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
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soap-notes'] });
    },
  });
}

export function useUpdateSoapNote() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      subjective?: Record<string, unknown>;
      objective?: Record<string, unknown>;
      assessment?: Record<string, unknown>;
      plan?: Record<string, unknown>;
      ai_draft?: Record<string, unknown>;
      ai_assisted?: boolean;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (input.subjective !== undefined) updateData.subjective = input.subjective;
      if (input.objective !== undefined) updateData.objective = input.objective;
      if (input.assessment !== undefined) updateData.assessment = input.assessment;
      if (input.plan !== undefined) updateData.plan = input.plan;
      if (input.ai_draft !== undefined) updateData.ai_draft = input.ai_draft;
      if (input.ai_assisted !== undefined) updateData.ai_assisted = input.ai_assisted;

      const { error } = await (supabase as any)
        .from('soap_notes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soap-notes'] });
    },
  });
}

export function useSoapNoteCounts(params?: { clinicianId?: string; patientId?: string }) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['soap-notes', 'counts', params],
    queryFn: async () => {
      let query = (supabase as any).from('soap_notes').select('status');

      if (params?.clinicianId) query = query.eq('clinician_id', params.clinicianId);
      if (params?.patientId) query = query.eq('patient_id', params.patientId);

      const { data, error } = await query;
      if (error) throw error;

      const notes = data as Array<{ status: string }>;
      return {
        draft: notes.filter((n) => n.status === 'draft').length,
        completed: notes.filter((n) => n.status === 'completed').length,
        signed: notes.filter((n) => n.status === 'signed').length,
        amended: notes.filter((n) => n.status === 'amended').length,
        total: notes.length,
      };
    },
  });
}
