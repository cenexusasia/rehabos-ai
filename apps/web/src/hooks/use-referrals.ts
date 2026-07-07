'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  Referral,
  ReferralListItem,
  ReferralFilterOptions,
  SendReferralFormData,
  NetworkConnection,
  ClinicianSearchResult,
} from '@/types/referral';

// ── Referral List Hooks ─────────────────────────────────────────────────────

export function useReferrals(options?: ReferralFilterOptions) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['referrals', options],
    queryFn: async () => {
      let query = supabase
        .from('referrals')
        .select(
          `id, from_clinician_id, to_clinician_id, patient_id, priority, reason, status, sent_at, created_at,
           from_clinician:from_clinician_id(id, first_name, last_name, specialty, clinic_name),
           to_clinician:to_clinician_id(id, first_name, last_name, specialty, clinic_name),
           patient:patient_id(id, first_name, last_name)`,
        )
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.direction === 'outgoing') {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) query = query.eq('from_clinician_id', user.id);
      }

      if (options?.direction === 'incoming') {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) query = query.eq('to_clinician_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as ReferralListItem[]) ?? [];
    },
  });
}

export function useReferral(id: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['referrals', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select(
          `*,
           from_clinician:from_clinician_id(*),
           to_clinician:to_clinician_id(*),
           patient:patient_id(id, first_name, last_name, date_of_birth)`,
        )
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Referral;
    },
    enabled: !!id,
  });
}

export function useOutgoingReferrals() {
  return useReferrals({ direction: 'outgoing' });
}

export function useIncomingReferrals() {
  return useReferrals({ direction: 'incoming' });
}

// ── Clinician Search ────────────────────────────────────────────────────────

export function useClinicianSearch(search: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['clinician-search', search],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let query = supabase
        .from('clinician_profiles')
        .select(
          'id, first_name, last_name, specialty, clinic_name, city, state, accepting_patients, telehealth_available, treatment_modalities, avatar_url',
        )
        .neq('user_id', user?.id ?? '')
        .limit(20);

      if (search) {
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,specialty.ilike.%${search}%,clinic_name.ilike.%${search}%,city.ilike.%${search}%`,
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as ClinicianSearchResult[]) ?? [];
    },
    enabled: search.length > 0,
  });
}

// ── Network Connections ─────────────────────────────────────────────────────

export function useNetworkConnections() {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['network-connections'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('network_connections')
        .select(
          `id, clinician_id, connected_clinician_id, status, created_at, updated_at,
           connected_clinician:connected_clinician_id(*)`,
        )
        .eq('clinician_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as NetworkConnection[]) ?? [];
    },
  });
}

// ── Mutation Hooks ──────────────────────────────────────────────────────────

export function useSendReferral() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async (formData: SendReferralFormData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('referrals')
        .insert({
          from_clinician_id: user?.id ?? '',
          to_clinician_id: formData.to_clinician_id,
          patient_id: formData.patient_id,
          priority: formData.priority,
          reason: formData.reason,
          clinical_notes: formData.clinical_notes ?? null,
          diagnosis_codes: formData.diagnosis_codes ?? [],
          attachments: formData.attachments ?? [],
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });
}

export function useRespondToReferral() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async ({
      id,
      status,
      responseNotes,
    }: {
      id: string;
      status: 'accepted' | 'declined';
      responseNotes?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        status,
        responded_at: new Date().toISOString(),
        response_notes: responseNotes ?? null,
      };

      if (status === 'accepted') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('referrals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });
}

// ── Invalidation ────────────────────────────────────────────────────────────

export function useInvalidateReferrals() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['referrals'] });
}
