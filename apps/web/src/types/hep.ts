// ── HEP (Home Exercise Program) Types ────────────────────────────────────────
// Re-exported from exercise.ts for convenience and any HEP-specific additions.

export type {
  ExerciseParameter,
  ProgramExercise,
  ProgramExerciseInput,
  HomeExerciseProgram,
  HomeExerciseProgramListItem,
  HEPStatus,
  ExerciseDifficulty,
} from './exercise';

export type { Exercise, ExerciseListItem, TargetMuscles } from './exercise';

// ── HEP Form Types ──────────────────────────────────────────────────────────

export interface HEPFormData {
  patient_id: string;
  title: string;
  description: string | null;
  goal: string | null;
  precautions: string | null;
  frequency: string | null;
  duration_weeks: number | null;
  start_date: string | null;
  end_date: string | null;
}

export interface HEPBuilderState {
  program: HEPFormData;
  exercises: {
    exercise_id: string;
    sort_order: number;
    parameters: {
      sets: number;
      reps: string;
      hold_seconds: number;
      rest_seconds: number;
      intensity_percent: number | null;
      rpe: number | null;
      notes: string | null;
      frequency: string | null;
    };
    exercise?: {
      id: string;
      name: string;
      description: string;
      category_slug: string;
      difficulty: string;
      body_regions: string[];
      image_url: string | null;
      target_muscles: { primary: string[]; secondary: string[]; stabilizer: string[] };
    };
  }[];
}

// ── HEP Filter Options ──────────────────────────────────────────────────────

export interface HEPFilterOptions {
  search?: string;
  status?: string;
  patientId?: string;
}
