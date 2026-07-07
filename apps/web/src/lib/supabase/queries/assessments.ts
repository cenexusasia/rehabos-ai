import { createServerSupabaseClient } from '../server';
import type {
  Assessment,
  AssessmentListItem,
  PatientAssessment,
  PatientAssessmentListItem,
  AssessmentFilterOptions,
} from '@/types/assessment';

// ── Assessment (Template) Queries ───────────────────────────────────────────

export async function getAssessments(
  options?: AssessmentFilterOptions,
): Promise<AssessmentListItem[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('assessments')
    .select(
      'id, name, category, description, body_regions, estimated_duration_minutes, min_score, max_score, higher_is_better, is_standardized, published, created_at',
    )
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.bodyRegion) {
    query = query.contains('body_regions', [options.bodyRegion]);
  }

  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as AssessmentListItem[]) ?? [];
}

export async function getAssessmentById(id: string): Promise<Assessment> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Assessment;
}

export async function getAssessmentsByCategory(
  category: string,
): Promise<AssessmentListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('assessments')
    .select(
      'id, name, category, description, body_regions, estimated_duration_minutes, min_score, max_score, higher_is_better, is_standardized, published, created_at',
    )
    .eq('category', category)
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data as AssessmentListItem[]) ?? [];
}

// ── Patient Assessment Queries ──────────────────────────────────────────────

export async function getPatientAssessments(
  patientId: string,
): Promise<PatientAssessmentListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('patient_assessments')
    .select(
      `id, patient_id, assessment_id, status, score, percentile, interpretation, flagged, completed_at, created_at,
      assessment:assessment_id(id, name, category, scoring_type, min_score, max_score, mcid, higher_is_better, normative_data)`,
    )
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as PatientAssessmentListItem[]) ?? [];
}

export async function getPatientAssessmentById(
  id: string,
): Promise<PatientAssessment> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('patient_assessments')
    .select(
      `*,
      assessment:assessment_id(*)`,
    )
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as PatientAssessment;
}

export async function getPatientAssessmentScores(
  patientId: string,
  assessmentId: string,
): Promise<
  { id: string; score: number | null; completed_at: string | null; created_at: string }[]
> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('patient_assessments')
    .select('id, score, completed_at, created_at')
    .eq('patient_id', patientId)
    .eq('assessment_id', assessmentId)
    .eq('status', 'completed')
    .not('score', 'is', null)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as { id: string; score: number | null; completed_at: string | null; created_at: string }[]) ?? [];
}
