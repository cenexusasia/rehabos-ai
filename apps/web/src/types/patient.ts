export type PatientStatus = 'active' | 'inactive' | 'discharged' | 'archived' | 'transferred';

export interface PatientAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

export interface PatientSettings {
  preferredLanguage?: string;
  communicationPreferences?: string[];
  customFields?: Record<string, unknown>;
}

export interface Patient {
  id: string;
  organization_id: string;
  clinic_id: string | null;
  clinician_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string | null;
  email: string | null;
  address: PatientAddress | null;
  emergency_contact: EmergencyContact | null;
  insurance_provider: string | null;
  insurance_id: string | null;
  insurance_group_number: string | null;
  diagnosis_codes: string[];
  referring_provider: string | null;
  referred_by_clinician_id: string | null;
  avatar_url: string | null;
  status: PatientStatus;
  tags: string[];
  notes: string | null;
  settings: PatientSettings;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type PatientListItem = Pick<
  Patient,
  'id' | 'first_name' | 'last_name' | 'date_of_birth' | 'diagnosis_codes' | 'status' | 'created_at'
>;

export type PatientFormData = Pick<
  Patient,
  | 'first_name'
  | 'last_name'
  | 'date_of_birth'
  | 'gender'
  | 'phone'
  | 'email'
  | 'address'
  | 'emergency_contact'
  | 'insurance_provider'
  | 'insurance_id'
  | 'insurance_group_number'
  | 'diagnosis_codes'
  | 'referring_provider'
  | 'tags'
  | 'status'
  | 'notes'
>;

// ── Timeline Types ──────────────────────────────────────────────────────────

export type TimelineEventType =
  | 'visit'
  | 'assessment'
  | 'soap'
  | 'hep'
  | 'message'
  | 'appointment';

export interface TimelineEvent {
  id: string;
  patient_id: string;
  type: TimelineEventType;
  title: string;
  description: string | null;
  timestamp: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface TimelineGroup {
  date: string; // YYYY-MM-DD
  label: string; // human-readable: "Today", "Yesterday", "Monday, June 15"
  events: TimelineEvent[];
}
