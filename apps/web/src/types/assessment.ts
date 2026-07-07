// ── Enums (mirrors Prisma) ──────────────────────────────────────────────────

export type ScoringType =
  | 'numeric'
  | 'ordinal'
  | 'likert'
  | 'timed'
  | 'pass_fail'
  | 'percentage'
  | 'visual_analog_scale';

export type AssessmentCategory =
  | 'outcome_measure'
  | 'functional_test'
  | 'special_test'
  | 'subjective'
  | 'objective'
  | 'patient_reported';

export type QuestionType =
  | 'scale_1_10'
  | 'scale_0_10'
  | 'multiple_choice'
  | 'yes_no'
  | 'numeric'
  | 'text'
  | 'visual_analog';

export type PatientAssessmentStatus = 'in_progress' | 'completed' | 'partially_completed';

// ── Question Definition ─────────────────────────────────────────────────────

export interface AssessmentQuestion {
  id: string;
  questionType: QuestionType;
  questionText: string;
  instructions?: string;
  options?: string[]; // for multiple_choice
  required?: boolean;
  weight?: number;
  subscale?: string;
  sortOrder: number;
}

// ── Normative Data ──────────────────────────────────────────────────────────

export interface NormativeDataEntry {
  population: string;
  mean: number;
  standardDeviation: number;
  minAge?: number;
  maxAge?: number;
  percentileCutoffs?: Record<string, number>; // e.g. { "25": 45, "50": 60, "75": 72 }
}

export interface NormativeData {
  entries: NormativeDataEntry[];
}

// ── Assessment (Template) ───────────────────────────────────────────────────

export interface Assessment {
  id: string;
  organization_id: string | null;
  name: string;
  category: AssessmentCategory;
  subcategory: string | null;
  description: string;
  instructions: string | null;
  scoring_type: ScoringType;
  scoring_instructions: string | null;
  min_score: number | null;
  max_score: number | null;
  higher_is_better: boolean;
  mcid: number | null; // minimal clinically important difference
  normative_data: NormativeData | null;
  body_regions: string[];
  conditions: string[];
  estimated_duration_minutes: number | null;
  required_equipment: string[];
  is_standardized: boolean;
  version: string;
  questions: AssessmentQuestion[];
  is_active: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type AssessmentListItem = Pick<
  Assessment,
  | 'id'
  | 'name'
  | 'category'
  | 'description'
  | 'body_regions'
  | 'estimated_duration_minutes'
  | 'min_score'
  | 'max_score'
  | 'higher_is_better'
  | 'is_standardized'
  | 'published'
  | 'created_at'
>;

// ── Patient Assessment (Administered) ───────────────────────────────────────

export interface PatientAssessment {
  id: string;
  patient_id: string;
  clinician_id: string;
  assessment_id: string;
  visit_id: string | null;
  status: PatientAssessmentStatus;
  responses: Record<string, unknown>;
  score: number | null;
  percentile: number | null;
  interpretation: string | null;
  flagged: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  assessment?: Assessment | AssessmentListItem;
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
}

export type PatientAssessmentListItem = Pick<
  PatientAssessment,
  | 'id'
  | 'patient_id'
  | 'assessment_id'
  | 'status'
  | 'score'
  | 'percentile'
  | 'interpretation'
  | 'flagged'
  | 'completed_at'
  | 'created_at'
> & {
  assessment?: Pick<Assessment, 'id' | 'name' | 'category' | 'scoring_type' | 'min_score' | 'max_score' | 'mcid' | 'higher_is_better' | 'normative_data'> | null;
};

// ── Question Response Map ───────────────────────────────────────────────────

export type QuestionResponseValue = number | string | boolean | null;

export interface QuestionResponse {
  questionId: string;
  value: QuestionResponseValue;
}

// ── Scoring Result ──────────────────────────────────────────────────────────

export interface ScoringResult {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  subscaleScores?: Record<string, number>;
  interpretation?: string;
}

// ── Form Types ──────────────────────────────────────────────────────────────

export interface AdministerAssessmentFormData {
  patient_id: string;
  assessment_id: string;
  visit_id?: string | null;
  responses: Record<string, QuestionResponseValue>;
}

export interface AssessmentFilterOptions {
  search?: string;
  category?: AssessmentCategory | '';
  bodyRegion?: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

export const ASSESSMENT_CATEGORY_OPTIONS: {
  value: AssessmentCategory;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: 'outcome_measure',
    label: 'Outcome Measures',
    icon: '📊',
    description: 'Standardized patient-reported outcome measures',
  },
  {
    value: 'functional_test',
    label: 'Functional Tests',
    icon: '🏃',
    description: 'Performance-based functional assessments',
  },
  {
    value: 'special_test',
    label: 'Special Tests',
    icon: '🔬',
    description: 'Orthopedic special tests and provocation tests',
  },
  {
    value: 'subjective',
    label: 'Subjective',
    icon: '💬',
    description: 'Patient-reported symptoms and experience',
  },
  {
    value: 'objective',
    label: 'Objective',
    icon: '📏',
    description: 'Clinician-measured objective assessments',
  },
  {
    value: 'patient_reported',
    label: 'Patient-Reported',
    icon: '📋',
    description: 'Patient-completed questionnaires and surveys',
  },
];

export const SCORING_TYPE_LABELS: Record<ScoringType, string> = {
  numeric: 'Numeric Score',
  ordinal: 'Ordinal Scale',
  likert: 'Likert Scale',
  timed: 'Timed Test',
  pass_fail: 'Pass / Fail',
  percentage: 'Percentage',
  visual_analog_scale: 'Visual Analog Scale',
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  scale_1_10: 'Scale 1–10',
  scale_0_10: 'Scale 0–10',
  multiple_choice: 'Multiple Choice',
  yes_no: 'Yes / No',
  numeric: 'Numeric Value',
  text: 'Free Text',
  visual_analog: 'Visual Analog Scale',
};

export const BODY_REGION_OPTIONS = [
  'Cervical Spine',
  'Thoracic Spine',
  'Lumbar Spine',
  'Shoulder',
  'Elbow',
  'Wrist & Hand',
  'Hip',
  'Knee',
  'Ankle & Foot',
  'Full Body',
  'Upper Extremity',
  'Lower Extremity',
  'Pelvis',
  'Temporomandibular Joint',
  'General',
] as const;

export const CATEGORY_COLORS: Record<AssessmentCategory, string> = {
  outcome_measure: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
  functional_test: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
  special_test: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
  subjective: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
  objective: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
  patient_reported: 'border-rose-500/20 bg-rose-500/5 text-rose-400',
};

export const PATIENT_ASSESSMENT_STATUS_COLORS: Record<PatientAssessmentStatus, string> = {
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  partially_completed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};
