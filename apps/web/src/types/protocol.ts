// ── Enums ────────────────────────────────────────────────────────────────────

export type ProtocolStatus = 'draft' | 'active' | 'archived';
export type ProtocolPhaseType = 'evaluation' | 'intervention' | 'reassessment' | 'discharge';
export type PatientProtocolStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'discontinued'
  | 'on_hold';

// ── Protocol (Template) ──────────────────────────────────────────────────────

export interface Protocol {
  id: string;
  organization_id: string | null;
  name: string;
  description: string;
  category: string | null;
  body_regions: string[];
  conditions: string[];
  status: ProtocolStatus;
  version: string;
  phases: ProtocolPhase[];
  estimated_duration_weeks: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ProtocolListItem = Pick<
  Protocol,
  | 'id'
  | 'name'
  | 'description'
  | 'category'
  | 'body_regions'
  | 'conditions'
  | 'status'
  | 'estimated_duration_weeks'
  | 'version'
  | 'created_at'
>;

// ── Protocol Phase ───────────────────────────────────────────────────────────

export interface ProtocolPhase {
  id: string;
  protocol_id: string;
  name: string;
  description: string | null;
  phase_type: ProtocolPhaseType;
  sort_order: number;
  duration_weeks: number;
  goals: string[];
  criteria: {
    progressionCriteria?: string;
    regressionCriteria?: string;
    dischargeCriteria?: string;
  } | null;
  exercise_ids: string[];
  contraindications: string[];
  precautions: string[];
  instructions: string | null;
  created_at: string;
  updated_at: string;
}

// ── Patient Protocol ─────────────────────────────────────────────────────────

export interface PatientProtocol {
  id: string;
  patient_id: string;
  protocol_id: string;
  clinician_id: string;
  status: PatientProtocolStatus;
  started_at: string | null;
  completed_at: string | null;
  current_phase_id: string | null;
  progress_notes: string | null;
  adherence_percentage: number | null;
  modifications: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  protocol?: Protocol | ProtocolListItem;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  clinician?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  current_phase?: ProtocolPhase;
}

export type PatientProtocolListItem = Pick<
  PatientProtocol,
  | 'id'
  | 'patient_id'
  | 'protocol_id'
  | 'clinician_id'
  | 'status'
  | 'started_at'
  | 'completed_at'
  | 'current_phase_id'
  | 'adherence_percentage'
  | 'created_at'
> & {
  protocol?: Pick<Protocol, 'id' | 'name' | 'category' | 'body_regions'> | null;
  patient?: { id: string; first_name: string; last_name: string } | null;
  current_phase?: Pick<ProtocolPhase, 'id' | 'name'> | null;
};

// ── Form Types ───────────────────────────────────────────────────────────────

export interface CreateProtocolFormData {
  name: string;
  description: string;
  category: string;
  body_regions: string[];
  conditions: string[];
  estimated_duration_weeks: number;
  phases: CreateProtocolPhaseData[];
}

export interface CreateProtocolPhaseData {
  name: string;
  description: string;
  phase_type: ProtocolPhaseType;
  duration_weeks: number;
  goals: string[];
  criteria?: {
    progressionCriteria?: string;
    regressionCriteria?: string;
    dischargeCriteria?: string;
  };
  exercise_ids: string[];
  contraindications: string[];
  precautions: string[];
  instructions: string;
}

// ── Filter Options ───────────────────────────────────────────────────────────

export interface ProtocolFilterOptions {
  search?: string;
  category?: string;
  status?: ProtocolStatus | '';
  bodyRegion?: string;
}
