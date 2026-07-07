// ── Exercise Types ───────────────────────────────────────────────────────────

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseCategory =
  | 'strength'
  | 'flexibility'
  | 'balance'
  | 'coordination'
  | 'endurance'
  | 'neuromuscular_re_education'
  | 'gait_training'
  | 'manual_therapy';

export interface TargetMuscles {
  primary: string[];
  secondary: string[];
  stabilizer: string[];
}

export interface Exercise {
  id: string;
  organization_id: string | null;
  name: string;
  alternative_names: string[];
  description: string;
  instructions: string;
  cueing_points: string[];
  category_slug: string;
  body_regions: string[];
  movement_patterns: string[];
  difficulty: ExerciseDifficulty;
  equipment: string[];
  contraindications: string[];
  precautions: string[];
  target_muscles: TargetMuscles;
  is_passive: boolean;
  is_weight_bearing: boolean;
  is_open_chain: boolean;
  is_plyometric: boolean;
  tags: string[];
  image_url: string | null;
  video_url: string | null;
  default_sets: number;
  default_reps: string;
  default_hold_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ExerciseListItem = Pick<
  Exercise,
  | 'id'
  | 'name'
  | 'description'
  | 'category_slug'
  | 'body_regions'
  | 'difficulty'
  | 'equipment'
  | 'image_url'
  | 'default_sets'
  | 'default_reps'
  | 'tags'
  | 'instructions'
  | 'target_muscles'
>;

// ── Exercise Parameter (for HEP prescription) ───────────────────────────────

export interface ExerciseParameter {
  sets: number;
  reps: string;
  hold_seconds: number;
  rest_seconds: number;
  intensity_percent: number | null;
  rpe: number | null; // Rate of Perceived Exertion 0-10
  notes: string | null;
  frequency: string | null; // e.g. "daily", "3x/week"
}

// ── Program Exercise (exercise within a HEP) ────────────────────────────────

export interface ProgramExercise {
  id: string;
  program_id: string;
  exercise_id: string;
  sort_order: number;
  parameters: ExerciseParameter;
  exercise?: Exercise | ExerciseListItem;
  created_at: string;
  updated_at: string;
}

export type ProgramExerciseInput = {
  exercise_id: string;
  sort_order: number;
  parameters: ExerciseParameter;
};

// ── Home Exercise Program ───────────────────────────────────────────────────

export type HEPStatus = 'active' | 'completed' | 'paused' | 'archived';

export interface HomeExerciseProgram {
  id: string;
  organization_id: string | null;
  patient_id: string;
  clinician_id: string;
  title: string;
  description: string | null;
  status: HEPStatus;
  goal: string | null;
  precautions: string | null;
  frequency: string | null; // e.g. "Daily", "3x/week"
  duration_weeks: number | null;
  start_date: string | null;
  end_date: string | null;
  patient_notes: string | null;
  compliance_percent: number | null;
  exercises: ProgramExercise[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type HomeExerciseProgramListItem = Pick<
  HomeExerciseProgram,
  | 'id'
  | 'patient_id'
  | 'clinician_id'
  | 'title'
  | 'description'
  | 'status'
  | 'frequency'
  | 'duration_weeks'
  | 'start_date'
  | 'end_date'
  | 'compliance_percent'
  | 'created_at'
  | 'updated_at'
> & {
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
  exercise_count?: number;
};

// ── Filter Options ──────────────────────────────────────────────────────────

export interface ExerciseFilterOptions {
  search?: string;
  category?: string;
  bodyRegion?: string;
  difficulty?: ExerciseDifficulty;
  equipment?: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

export const EXERCISE_CATEGORY_OPTIONS: {
  value: string;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: 'strength',
    label: 'Strength',
    icon: '💪',
    description: 'Resistance training exercises',
  },
  {
    value: 'flexibility',
    label: 'Flexibility',
    icon: '🧘',
    description: 'Stretching and range of motion exercises',
  },
  {
    value: 'balance',
    label: 'Balance',
    icon: '⚖️',
    description: 'Balance and proprioception training',
  },
  {
    value: 'coordination',
    label: 'Coordination',
    icon: '🎯',
    description: 'Coordination and motor control exercises',
  },
  {
    value: 'endurance',
    label: 'Endurance',
    icon: '🏃',
    description: 'Cardiovascular and muscular endurance',
  },
  {
    value: 'neuromuscular_re_education',
    label: 'Neuro Re-ed',
    icon: '🧠',
    description: 'Neuromuscular re-education exercises',
  },
  {
    value: 'gait_training',
    label: 'Gait',
    icon: '🚶',
    description: 'Gait training and ambulation exercises',
  },
  {
    value: 'manual_therapy',
    label: 'Manual',
    icon: '✋',
    description: 'Manual therapy techniques',
  },
];

export const BODY_REGION_OPTIONS = [
  'cervical_spine',
  'thoracic_spine',
  'lumbar_spine',
  'shoulder',
  'elbow',
  'wrist_hand',
  'hip',
  'knee',
  'ankle_foot',
  'lower_extremity',
  'upper_extremity',
  'full_body',
  'pelvis',
  'core',
] as const;

export const DIFFICULTY_OPTIONS: { value: ExerciseDifficulty; label: string; color: string }[] = [
  { value: 'beginner', label: 'Beginner', color: 'border-green-500/20 bg-green-500/10 text-green-400' },
  { value: 'intermediate', label: 'Intermediate', color: 'border-amber-500/20 bg-amber-500/10 text-amber-400' },
  { value: 'advanced', label: 'Advanced', color: 'border-red-500/20 bg-red-500/10 text-red-400' },
];

export const DIFFICULTY_COLORS: Record<ExerciseDifficulty, string> = {
  beginner: 'border-green-500/20 bg-green-500/10 text-green-400',
  intermediate: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  advanced: 'border-red-500/20 bg-red-500/10 text-red-400',
};

export const HEP_STATUS_COLORS: Record<HEPStatus, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  archived: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export const CATEGORY_COLORS: Record<string, string> = {
  strength: 'border-red-500/20 bg-red-500/5 text-red-400',
  flexibility: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
  balance: 'border-green-500/20 bg-green-500/5 text-green-400',
  coordination: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
  endurance: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
  neuromuscular_re_education: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
  gait_training: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400',
  manual_therapy: 'border-rose-500/20 bg-rose-500/5 text-rose-400',
};
