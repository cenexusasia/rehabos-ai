'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  Assessment,
  AssessmentListItem,
  PatientAssessment,
  PatientAssessmentListItem,
  AssessmentFilterOptions,
  AdministerAssessmentFormData,
  QuestionResponseValue,
} from '@/types/assessment';

// ── Assessment Catalog Hooks ────────────────────────────────────────────────

export function useAssessments(options?: AssessmentFilterOptions) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['assessments', options],
    queryFn: async () => {
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
    },
  });
}

export function useAssessment(id: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['assessments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Assessment;
    },
    enabled: !!id,
  });
}

export function useAssessmentsByCategory(category: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['assessments', 'category', category],
    queryFn: async () => {
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
    },
    enabled: !!category,
  });
}

// ── Patient Assessment Hooks ────────────────────────────────────────────────

export function usePatientAssessments(patientId: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['patient-assessments', patientId],
    queryFn: async () => {
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
    },
    enabled: !!patientId,
  });
}

export function usePatientAssessment(id: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['patient-assessment', id],
    queryFn: async () => {
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
    },
    enabled: !!id,
  });
}

export function usePatientAssessmentScores(patientId: string, assessmentId: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['patient-assessment-scores', patientId, assessmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_assessments')
        .select('id, score, completed_at, created_at')
        .eq('patient_id', patientId)
        .eq('assessment_id', assessmentId)
        .eq('status', 'completed')
        .not('score', 'is', null)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (
        data as {
          id: string;
          score: number | null;
          completed_at: string | null;
          created_at: string;
        }[]
      ) ?? [];
    },
    enabled: !!patientId && !!assessmentId,
  });
}

// ── Mutation Hooks ──────────────────────────────────────────────────────────

export function useCreatePatientAssessment() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async (formData: AdministerAssessmentFormData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const insertData: Record<string, unknown> = {
        patient_id: formData.patient_id,
        clinician_id: user?.id ?? '',
        assessment_id: formData.assessment_id,
        visit_id: formData.visit_id ?? null,
        status: 'completed',
        responses: formData.responses,
        completed_at: new Date().toISOString(),
      };

      // Get the assessment to calculate score
      const { data: assessment } = await (supabase as any)
        .from('assessments')
        .select('scoring_type, questions, min_score, max_score')
        .eq('id', formData.assessment_id)
        .single();

      if (assessment) {
        const scoreResult = calculateScore(
          formData.responses,
          (assessment as any).questions as { questionType: string; weight?: number }[],
          (assessment as any).scoring_type as string,
          (assessment as any).min_score as number | null,
          (assessment as any).max_score as number | null,
        );
        insertData.score = scoreResult.totalScore;
        insertData.percentile = null; // Would need normative data lookup
        insertData.interpretation = scoreResult.interpretation ?? null;
      }

      const { data, error } = await supabase
        .from('patient_assessments')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patient-assessments', variables.patient_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', variables.patient_id, 'timeline'],
      });
    },
  });
}

export function useSaveAssessmentProgress() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async ({
      patientId,
      assessmentId,
      responses,
      existingId,
    }: {
      patientId: string;
      assessmentId: string;
      responses: Record<string, QuestionResponseValue>;
      existingId?: string | null;
    }) => {
      if (existingId) {
        const { error } = await supabase
          .from('patient_assessments')
          .update({
            responses,
            status: 'in_progress',
          })
          .eq('id', existingId);
        if (error) throw error;
        return existingId;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('patient_assessments')
        .insert({
          patient_id: patientId,
          clinician_id: user?.id ?? '',
          assessment_id: assessmentId,
          status: 'in_progress',
          responses,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patient-assessments', variables.patientId],
      });
    },
  });
}

// ── Scoring Engine ──────────────────────────────────────────────────────────

function calculateScore(
  responses: Record<string, QuestionResponseValue>,
  questions: { questionType: string; weight?: number }[],
  scoringType: string,
  minScore: number | null,
  maxScore: number | null,
): { totalScore: number; interpretation?: string } {
  let total = 0;
  let maxPossible = 0;

  for (const q of questions) {
    const val = responses[q.questionType];
    if (val === null || val === undefined || val === '') continue;

    const weight = q.weight ?? 1;

    switch (q.questionType) {
      case 'scale_1_10': {
        const num = Number(val);
        if (!isNaN(num)) {
          total += num * weight;
          maxPossible += 10 * weight;
        }
        break;
      }
      case 'scale_0_10': {
        const num = Number(val);
        if (!isNaN(num)) {
          total += num * weight;
          maxPossible += 10 * weight;
        }
        break;
      }
      case 'yes_no': {
        const bool = val === true || val === 'true' || val === 'yes';
        if (bool) {
          total += 1 * weight;
        }
        maxPossible += 1 * weight;
        break;
      }
      case 'multiple_choice': {
        const num = Number(val);
        if (!isNaN(num)) {
          total += num * weight;
        }
        // maxPossible for MC depends on number of options
        break;
      }
      case 'numeric': {
        const num = Number(val);
        if (!isNaN(num)) {
          total += num * weight;
        }
        break;
      }
      case 'visual_analog': {
        const num = Number(val);
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

  // Apply min/max bounds if defined
  if (maxScore !== null && minScore !== null) {
    // Range-based scoring - normalize if needed
    if (scoringType === 'percentage') {
      const pct = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;
      return {
        totalScore: Math.min(Math.max(pct, minScore), maxScore ?? 100),
        interpretation: generateInterpretation(total, maxPossible, scoringType),
      };
    }
  }

  if (scoringType === 'percentage') {
    const pct = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;
    return {
      totalScore: pct,
      interpretation: generateInterpretation(total, maxPossible, scoringType),
    };
  }

  return {
    totalScore: total,
    interpretation: generateInterpretation(total, maxPossible, scoringType),
  };
}

function generateInterpretation(
  score: number,
  maxPossible: number,
  scoringType: string,
): string {
  if (maxPossible === 0) return 'Score recorded. No interpretation available.';

  const pct = Math.round((score / maxPossible) * 100);

  switch (scoringType) {
    case 'percentage':
      if (pct >= 80) return 'High function / low impairment.';
      if (pct >= 50) return 'Moderate function / impairment.';
      return 'Low function / significant impairment.';
    case 'pass_fail':
      return pct >= 70 ? 'Pass' : 'Fail';
    case 'visual_analog_scale':
      if (pct >= 70) return 'High pain / symptom severity reported.';
      if (pct >= 30) return 'Moderate pain / symptom severity reported.';
      return 'Low pain / symptom severity reported.';
    default:
      return `Score: ${score}${maxPossible > 0 ? ` out of ${maxPossible}` : ''}`;
  }
}

// ── Invalidation Hook ───────────────────────────────────────────────────────

export function useInvalidateAssessments() {
  const queryClient = useQueryClient();
  return {
    invalidateList: () =>
      queryClient.invalidateQueries({ queryKey: ['assessments'] }),
    invalidatePatient: (patientId: string) =>
      queryClient.invalidateQueries({
        queryKey: ['patient-assessments', patientId],
      }),
  };
}
