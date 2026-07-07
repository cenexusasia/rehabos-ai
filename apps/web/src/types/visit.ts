export type VisitType =
  | 'initial_evaluation'
  | 'follow_up'
  | 'reevaluation'
  | 'discharge'
  | 'telehealth'
  | 'phone_consult';

export type VisitStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type BillingStatus =
  | 'pending'
  | 'billed'
  | 'paid'
  | 'denied'
  | 'write_off';

export interface Visit {
  id: string;
  organization_id: string;
  clinic_id: string | null;
  patient_id: string;
  clinician_id: string;
  visit_type: VisitType;
  status: VisitStatus;
  date: string;
  duration_minutes: number | null;
  chief_complaint: string | null;
  soap_note_id: string | null;
  billing_code: string | null;
  billing_status: BillingStatus | null;
  billing_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type VisitListItem = Pick<
  Visit,
  | 'id'
  | 'patient_id'
  | 'visit_type'
  | 'status'
  | 'date'
  | 'duration_minutes'
  | 'chief_complaint'
  | 'soap_note_id'
  | 'created_at'
> & {
  patients?: {
    first_name: string;
    last_name: string;
  } | null;
};

export interface VisitFormData {
  patient_id: string;
  visit_type: VisitType;
  date: string;
  duration_minutes?: number | null;
  chief_complaint?: string | null;
  notes?: string | null;
}

export const VISIT_TYPE_OPTIONS: { value: VisitType; label: string }[] = [
  { value: 'initial_evaluation', label: 'Initial Evaluation' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'reevaluation', label: 'Re-evaluation' },
  { value: 'discharge', label: 'Discharge' },
  { value: 'telehealth', label: 'Telehealth' },
  { value: 'phone_consult', label: 'Phone Consultation' },
];

export const VISIT_STATUS_OPTIONS: { value: VisitStatus; label: string; color: string }[] = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { value: 'no_show', label: 'No Show', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

export const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  initial_evaluation: 'Initial Evaluation',
  follow_up: 'Follow Up',
  reevaluation: 'Re-evaluation',
  discharge: 'Discharge',
  telehealth: 'Telehealth',
  phone_consult: 'Phone Consultation',
};

export const VISIT_TYPE_COLORS: Record<VisitType, string> = {
  initial_evaluation: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  follow_up: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  reevaluation: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  discharge: 'bg-red-500/10 text-red-400 border-red-500/20',
  telehealth: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  phone_consult: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

export const STATUS_COLORS: Record<VisitStatus, string> = {
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  no_show: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export const BILLING_STATUS_OPTIONS: { value: BillingStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { value: 'billed', label: 'Billed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'paid', label: 'Paid', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'denied', label: 'Denied', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { value: 'write_off', label: 'Write Off', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];
