'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Visit, VisitListItem } from '@/types/visit';

export function useVisitsByPatient(patientId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['visits', 'patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('id, patient_id, visit_type, status, date, duration_minutes, chief_complaint, created_at')
        .eq('patient_id', patientId)
        .is('deleted_at', null)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data as VisitListItem[]) ?? [];
    },
    enabled: !!patientId,
  });
}

export function useVisit(id: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['visits', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('*, patients(first_name, last_name)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Visit;
    },
    enabled: !!id,
  });
}

export function useVisits() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['visits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('id, patient_id, visit_type, status, date, duration_minutes, chief_complaint, created_at, patients(first_name, last_name)')
        .is('deleted_at', null)
        .order('date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data as VisitListItem[]) ?? [];
    },
  });
}

export function useInvalidateVisits() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['visits'] });
}
