'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AdministerAssessmentFormData } from '@/types/assessment';

export async function createPatientAssessment(formData: AdministerAssessmentFormData) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: { _form: ['You must be logged in'] } };
  }

  // Get the assessment template for scoring logic
  const { data: assessment } = await (supabase as any)
    .from('assessments')
    .select('scoring_type, questions, min_score, max_score, higher_is_better')
    .eq('id', formData.assessment_id)
    .single();

  // Calculate score
  let score: number | null = null;
  let interpretation: string | null = null;

  if (assessment && formData.responses) {
    const scoreResult = calculateScoreSimple(
      formData.responses,
      (assessment as any).questions as Array<{ questionType: string; weight?: number }>,
      (assessment as any).scoring_type as string,
      (assessment as any).min_score as number | null,
      (assessment as any).max_score as number | null,
    );
    score = scoreResult.score;
    interpretation = scoreResult.interpretation;
  }

  const { data, error } = await (supabase as any)
    .from('patient_assessments')
    .insert({
      patient_id: formData.patient_id,
      clinician_id: user.id,
      assessment_id: formData.assessment_id,
      visit_id: formData.visit_id ?? null,
      status: 'completed',
      responses: formData.responses ?? {},
      score,
      interpretation,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath(`/patients/${formData.patient_id}/assessments`);
  revalidatePath(`/patients/${formData.patient_id}`);
  redirect(`/patients/${formData.patient_id}/assessments/${data.id}`);
}

export async function saveAssessmentProgress(formData: {
  patient_id: string;
  assessment_id: string;
  responses: Record<string, unknown>;
  existing_id?: string | null;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: { _form: ['You must be logged in'] } };
  }

  if (formData.existing_id) {
    const { error } = await (supabase as any)
      .from('patient_assessments')
      .update({
        responses: formData.responses,
        status: 'in_progress',
      })
      .eq('id', formData.existing_id);

    if (error) return { error: { _form: [error.message] } };
    return { id: formData.existing_id };
  }

  const { data, error } = await (supabase as any)
    .from('patient_assessments')
    .insert({
      patient_id: formData.patient_id,
      clinician_id: user.id,
      assessment_id: formData.assessment_id,
      status: 'in_progress',
      responses: formData.responses,
    })
    .select('id')
    .single();

  if (error) return { error: { _form: [error.message] } };
  return { id: data.id };
}

// ── Simple scoring (server-safe, no client deps) ─────────────────────────

function calculateScoreSimple(
  responses: Record<string, unknown>,
  questions: Array<{ questionType: string; weight?: number }>,
  _scoringType: string,
  _minScore: number | null,
  _maxScore: number | null,
): { score: number; interpretation: string | null } {
  let total = 0;
  let maxPossible = 0;

  for (const q of questions) {
    const v = responses[q.questionType];
    if (v === null || v === undefined || v === '') continue;
    const weight = q.weight ?? 1;

    switch (q.questionType) {
      case 'scale_1_10':
      case 'scale_0_10': {
        const num = Number(v);
        if (!isNaN(num)) {
          total += num * weight;
          maxPossible += 10 * weight;
        }
        break;
      }
      case 'yes_no': {
        const bool = v === true || v === 'true' || v === 'yes';
        if (bool) total += 1 * weight;
        maxPossible += 1 * weight;
        break;
      }
      case 'multiple_choice': {
        const num = Number(v);
        if (!isNaN(num)) total += num * weight;
        break;
      }
      case 'numeric': {
        const num = Number(v);
        if (!isNaN(num)) total += num * weight;
        break;
      }
      case 'visual_analog': {
        const num = Number(v);
        if (!isNaN(num)) {
          total += num * weight;
          maxPossible += 100 * weight;
        }
        break;
      }
      default:
        break;
    }
  }

  if (maxPossible > 0) {
    const pct = Math.round((total / maxPossible) * 100);
    let interpretation: string;
    if (pct >= 80) interpretation = 'High function / low impairment.';
    else if (pct >= 50) interpretation = 'Moderate function / impairment.';
    else interpretation = 'Low function / significant impairment.';
    return { score: total, interpretation };
  }

  return { score: total, interpretation: null };
}
