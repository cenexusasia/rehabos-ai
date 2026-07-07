'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  Appointment,
  AppointmentListItem,
  AppointmentFormData,
} from '@/types/appointment';
// ── Query Hooks ──────────────────────────────────────────────────────────────

export function useAppointments(options?: {
  startDate?: string;
  endDate?: string;
  clinicianId?: string;
  status?: string;
}) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['appointments', options],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(
          `id, patient_id, clinician_id, appointment_type, status, title, start_time, end_time, duration_minutes, location, telehealth_url, notes, created_at,
          patient:patient_id(id, first_name, last_name, phone, email, avatar_url)`,
        )
        .order('start_time', { ascending: true });

      if (options?.startDate) {
        query = query.gte('start_time', options.startDate);
      }
      if (options?.endDate) {
        query = query.lte('start_time', options.endDate);
      }
      if (options?.clinicianId) {
        query = query.eq('clinician_id', options.clinicianId);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as AppointmentListItem[]) ?? [];
    },
  });
}

export function useAppointment(id: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `*,
          patient:patient_id(id, first_name, last_name, phone, email, avatar_url),
          clinician:clinician_id(id, first_name, last_name)`,
        )
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Appointment;
    },
    enabled: !!id,
  });
}

export function useAppointmentsByPatient(patientId: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['appointments', 'patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `id, patient_id, clinician_id, appointment_type, status, title, start_time, end_time, duration_minutes, location, telehealth_url, notes, created_at`,
        )
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false });
      if (error) throw error;
      return (data as AppointmentListItem[]) ?? [];
    },
    enabled: !!patientId,
  });
}

// ── Mutation Hooks ───────────────────────────────────────────────────────────

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async (formData: AppointmentFormData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: formData.patient_id,
          clinician_id: user?.id ?? '',
          appointment_type: formData.appointment_type,
          title: formData.title ?? null,
          description: formData.description ?? null,
          start_time: formData.start_time,
          end_time: formData.end_time,
          duration_minutes: formData.duration_minutes ?? 30,
          location: formData.location ?? null,
          telehealth_url: formData.telehealth_url ?? null,
          notes: formData.notes ?? null,
          is_recurring: formData.is_recurring ?? false,
          recurring_rule: formData.recurring_rule ?? null,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['patients', undefined, 'timeline'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<AppointmentFormData> & { id: string; status?: string; cancellation_reason?: string }) => {
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.id] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async ({
      id,
      cancellation_reason,
    }: {
      id: string;
      cancellation_reason?: string;
    }) => {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancellation_reason: cancellation_reason ?? null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.id] });
    },
  });
}

// ── Calendar Helpers ─────────────────────────────────────────────────────────

export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Pad with previous month's days
  const startPad = firstDay.getDay();
  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push(d);
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Pad to complete the grid (always 6 rows = 42 cells)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push(new Date(year, month + 1, d));
  }

  return days;
}

export function getWeekDays(date: Date): Date[] {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getMonthLabel(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

// ── Invalidation Hook ────────────────────────────────────────────────────────

export function useInvalidateAppointments() {
  const queryClient = useQueryClient();
  return {
    invalidateList: () =>
      queryClient.invalidateQueries({ queryKey: ['appointments'] }),
    invalidateOne: (id: string) =>
      queryClient.invalidateQueries({ queryKey: ['appointments', id] }),
  };
}
