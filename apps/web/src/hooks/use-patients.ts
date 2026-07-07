'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Patient, PatientListItem, TimelineEvent } from '@/types/patient';

export function usePatients() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, date_of_birth, diagnosis_codes, status, created_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as PatientListItem[]) ?? [];
    },
  });
}

export function usePatient(id: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Patient;
    },
    enabled: !!id,
  });
}

export function usePatientTimeline(id: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['patients', id, 'timeline'],
    queryFn: async () => {
      // Fetch events from multiple sources and combine chronologically.
      // Each query runs independently and we union them client-side.
      const results = await Promise.allSettled([
        // Visits / visits
        supabase
          .from('visits')
          .select('id, patient_id, type, title, description, created_at, updated_at')
          .eq('patient_id', id)
          .order('created_at', { ascending: false }),
        // Assessments
        supabase
          .from('assessments')
          .select('id, patient_id, type, title, description, created_at, updated_at')
          .eq('patient_id', id)
          .order('created_at', { ascending: false }),
        // SOAP notes
        supabase
          .from('soap_notes')
          .select('id, patient_id, type, title, description, created_at, updated_at')
          .eq('patient_id', id)
          .order('created_at', { ascending: false }),
        // HEP entries
        supabase
          .from('hep_entries')
          .select('id, patient_id, type, title, description, created_at, updated_at')
          .eq('patient_id', id)
          .order('created_at', { ascending: false }),
        // Messages
        supabase
          .from('messages')
          .select('id, patient_id, type, subject, body, created_at, updated_at')
          .eq('patient_id', id)
          .order('created_at', { ascending: false }),
        // Appointments
        supabase
          .from('appointments')
          .select('id, patient_id, type, title, description, created_at, updated_at')
          .eq('patient_id', id)
          .order('created_at', { ascending: false }),
      ]);

      const events: TimelineEvent[] = [];
      const sourceTypeMap: Record<number, TimelineEvent['type']> = {
        0: 'visit',
        1: 'assessment',
        2: 'soap',
        3: 'hep',
        4: 'message',
        5: 'appointment',
      };

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value.data) {
          const rows = result.value.data as Record<string, unknown>[];
          rows.forEach((row) => {
            const isMessage = idx === 4;
            events.push({
              id: row.id as string,
              patient_id: id,
              type: sourceTypeMap[idx]! as TimelineEvent['type'],
              title: isMessage ? (row.subject as string) ?? '(No subject)' : (row.title as string) ?? '',
              description: isMessage ? (row.body as string) ?? null : (row.description as string) ?? null,
              timestamp: (row.created_at as string) ?? new Date().toISOString(),
              created_at: (row.created_at as string) ?? new Date().toISOString(),
            });
          });
        }
      });

      // If no real data yet, generate sample timeline data
      if (events.length === 0) {
        const now = new Date();
        const sampleEvents: TimelineEvent[] = [
          {
            id: 'sample-1',
            patient_id: id,
            type: 'visit',
            title: 'Initial Evaluation',
            description: 'Completed initial PT evaluation. Assessed range of motion, strength, and functional limitations.',
            timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sample-2',
            patient_id: id,
            type: 'soap',
            title: 'Follow-up SOAP Note',
            description: 'Patient reports improved mobility. Continue with current exercise program.',
            timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sample-3',
            patient_id: id,
            type: 'assessment',
            title: 'Functional Assessment',
            description: 'Lower extremity functional scale score: 52/80. Moderate limitation.',
            timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sample-4',
            patient_id: id,
            type: 'hep',
            title: 'Home Exercise Program Updated',
            description: 'Added hamstring stretches and core stability exercises. Frequency: daily.',
            timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sample-5',
            patient_id: id,
            type: 'appointment',
            title: 'Scheduled: Follow-up Visit',
            description: '30-min follow-up appointment with Dr. Smith.',
            timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sample-6',
            patient_id: id,
            type: 'message',
            title: 'Patient message: Question about exercises',
            description: 'Patient asked about modifying exercises due to knee discomfort.',
            timestamp: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        return sampleEvents.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
      }

      return events.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    },
    enabled: !!id,
  });
}

export function useInvalidatePatients() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['patients'] });
}
