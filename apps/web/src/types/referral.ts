// ── Enums ──────────────────────────────────────────────────────────────────

export type ReferralStatus =
  | 'draft'
  | 'sent'
  | 'received'
  | 'accepted'
  | 'declined'
  | 'completed'
  | 'cancelled';

export type ReferralPriority = 'routine' | 'urgent' | 'emergency';

export type ReferralDirection = 'outgoing' | 'incoming';

export type NetworkConnectionStatus = 'pending' | 'connected' | 'disconnected' | 'blocked';

// ── Clinician Profile ───────────────────────────────────────────────────────

export interface ClinicianProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  license_number: string | null;
  npi_number: string | null;
  phone: string | null;
  email: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  bio: string | null;
  accepting_patients: boolean;
  telehealth_available: boolean;
  treatment_modalities: string[];
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ClinicianSearchResult = Pick<
  ClinicianProfile,
  | 'id'
  | 'first_name'
  | 'last_name'
  | 'specialty'
  | 'clinic_name'
  | 'city'
  | 'state'
  | 'accepting_patients'
  | 'telehealth_available'
  | 'treatment_modalities'
  | 'avatar_url'
>;

// ── Referral ────────────────────────────────────────────────────────────────

export interface Referral {
  id: string;
  organization_id: string;
  from_clinician_id: string;
  to_clinician_id: string;
  patient_id: string;
  priority: ReferralPriority;
  reason: string;
  clinical_notes: string | null;
  diagnosis_codes: string[];
  attachments: string[];
  status: ReferralStatus;
  sent_at: string | null;
  responded_at: string | null;
  response_notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined
  from_clinician?: ClinicianProfile;
  to_clinician?: ClinicianProfile;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
  };
}

export type ReferralListItem = Pick<
  Referral,
  | 'id'
  | 'from_clinician_id'
  | 'to_clinician_id'
  | 'patient_id'
  | 'priority'
  | 'reason'
  | 'status'
  | 'sent_at'
  | 'created_at'
> & {
  from_clinician?: Pick<ClinicianProfile, 'id' | 'first_name' | 'last_name' | 'specialty' | 'clinic_name'>;
  to_clinician?: Pick<ClinicianProfile, 'id' | 'first_name' | 'last_name' | 'specialty' | 'clinic_name'>;
  patient?: { id: string; first_name: string; last_name: string };
};

// ── Network Connection ──────────────────────────────────────────────────────

export interface NetworkConnection {
  id: string;
  organization_id: string;
  clinician_id: string;
  connected_clinician_id: string;
  status: NetworkConnectionStatus;
  created_at: string;
  updated_at: string;

  // Joined
  connected_clinician?: ClinicianProfile;
}

// ── Form Types ──────────────────────────────────────────────────────────────

export interface SendReferralFormData {
  to_clinician_id: string;
  patient_id: string;
  priority: ReferralPriority;
  reason: string;
  clinical_notes?: string;
  diagnosis_codes?: string[];
  attachments?: string[];
}

export interface ReferralFilterOptions {
  direction?: ReferralDirection;
  status?: ReferralStatus;
  search?: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

export const REFERRAL_STATUS_COLORS: Record<ReferralStatus, string> = {
  draft: 'border-gray-500/20 bg-gray-500/5 text-gray-400',
  sent: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
  received: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
  accepted: 'border-green-500/20 bg-green-500/5 text-green-400',
  declined: 'border-red-500/20 bg-red-500/5 text-red-400',
  completed: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
  cancelled: 'border-muted-foreground/20 bg-muted-foreground/5 text-muted-foreground',
};

export const REFERRAL_PRIORITY_COLORS: Record<ReferralPriority, string> = {
  routine: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
  urgent: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
  emergency: 'border-red-500/20 bg-red-500/5 text-red-400',
};

export const REFERRAL_PRIORITY_LABELS: Record<ReferralPriority, string> = {
  routine: 'Routine',
  urgent: 'Urgent',
  emergency: 'Emergency',
};

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  received: 'Received',
  accepted: 'Accepted',
  declined: 'Declined',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
