export type TelehealthSessionStatus =
  | 'scheduled'
  | 'waiting'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'missed';

export interface TelehealthSession {
  id: string;
  organization_id: string;
  appointment_id: string | null;
  patient_id: string;
  clinician_id: string;
  status: TelehealthSessionStatus;
  room_name: string;
  room_sid: string | null;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  platform: string; // 'jitsi' | 'zoom' | 'twilio' | 'custom'
  meeting_url: string;
  join_token: string | null;
  recording_url: string | null;
  notes: string | null;
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
  appointment?: {
    id: string;
    appointment_type: string;
    start_time: string;
    end_time: string;
  } | null;
}

export type TelehealthSessionListItem = Pick<
  TelehealthSession,
  | 'id'
  | 'appointment_id'
  | 'patient_id'
  | 'status'
  | 'room_name'
  | 'scheduled_at'
  | 'started_at'
  | 'duration_seconds'
  | 'platform'
  | 'meeting_url'
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

export interface TelehealthPreJoinInfo {
  patientName: string;
  appointmentType: string;
  scheduledTime: string;
  duration: number;
  isCameraOn: boolean;
  isMicOn: boolean;
}

// ── Constants ────────────────────────────────────────────────────────────────

export const TELEHEALTH_STATUS_OPTIONS: {
  value: TelehealthSessionStatus;
  label: string;
  color: string;
}[] = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'waiting', label: 'Waiting', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'active', label: 'Active', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'completed', label: 'Completed', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { value: 'missed', label: 'Missed', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
];

export const TELEHEALTH_STATUS_COLORS: Record<TelehealthSessionStatus, string> = {
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  waiting: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  completed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  missed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};
