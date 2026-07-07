export type AppointmentType =
  | 'initial_evaluation'
  | 'follow_up'
  | 'reevaluation'
  | 'discharge'
  | 'telehealth'
  | 'phone_consult';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export interface Appointment {
  id: string;
  organization_id: string;
  clinic_id: string | null;
  patient_id: string;
  clinician_id: string;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  title: string | null;
  description: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location: string | null;
  telehealth_url: string | null;
  notes: string | null;
  is_recurring: boolean;
  recurring_rule: string | null;
  cancellation_reason: string | null;
  rescheduled_from: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  clinician?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

export type AppointmentListItem = Pick<
  Appointment,
  | 'id'
  | 'patient_id'
  | 'clinician_id'
  | 'appointment_type'
  | 'status'
  | 'title'
  | 'start_time'
  | 'end_time'
  | 'duration_minutes'
  | 'location'
  | 'telehealth_url'
  | 'notes'
  | 'created_at'
> & {
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
};

export interface AppointmentFormData {
  patient_id: string;
  appointment_type: AppointmentType;
  title?: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  location?: string;
  telehealth_url?: string;
  notes?: string;
  is_recurring?: boolean;
  recurring_rule?: string;
}

export interface CalendarViewDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  appointments: AppointmentListItem[];
}

export type CalendarViewMode = 'day' | 'week' | 'month';

// ── Constants ────────────────────────────────────────────────────────────────

export const APPOINTMENT_TYPE_OPTIONS: { value: AppointmentType; label: string }[] = [
  { value: 'initial_evaluation', label: 'Initial Evaluation' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'reevaluation', label: 'Re-evaluation' },
  { value: 'discharge', label: 'Discharge' },
  { value: 'telehealth', label: 'Telehealth' },
  { value: 'phone_consult', label: 'Phone Consultation' },
];

export const APPOINTMENT_STATUS_OPTIONS: { value: AppointmentStatus; label: string; color: string }[] = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { value: 'no_show', label: 'No Show', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  { value: 'rescheduled', label: 'Rescheduled', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
];

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  initial_evaluation: 'Initial Evaluation',
  follow_up: 'Follow Up',
  reevaluation: 'Re-evaluation',
  discharge: 'Discharge',
  telehealth: 'Telehealth',
  phone_consult: 'Phone Consultation',
};

export const APPOINTMENT_TYPE_COLORS: Record<AppointmentType, string> = {
  initial_evaluation: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
  follow_up: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
  reevaluation: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
  discharge: 'border-red-500/20 bg-red-500/5 text-red-400',
  telehealth: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
  phone_consult: 'border-teal-500/20 bg-teal-500/5 text-teal-400',
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  no_show: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  rescheduled: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};
