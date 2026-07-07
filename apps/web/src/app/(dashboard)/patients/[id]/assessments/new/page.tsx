'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePatient } from '@/hooks/use-patients';
import {
  useAssessment,
  useCreatePatientAssessment,
  useSaveAssessmentProgress,
  useAssessments,
} from '@/hooks/use-assessments';
import { AssessmentRunner } from '@/components/assessments/assessment-runner';
import type {
  Assessment,
  AssessmentQuestion,
  QuestionResponseValue,
} from '@/types/assessment';

export default function NewPatientAssessmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const patientId = params.id as string;
  const preSelectedAssessmentId = searchParams.get('assessmentId');
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: assessments } = useAssessments();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(
    preSelectedAssessmentId ?? '',
  );
  const createAssessment = useCreatePatientAssessment();
  const saveProgress = useSaveAssessmentProgress();

  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: selectedAssessment, isLoading: assessmentLoading } =
    useAssessment(selectedAssessmentId ?? '');

  // Auto-start if pre-selected from assessment detail page
  useEffect(() => {
    if (preSelectedAssessmentId && selectedAssessment && !started) {
      setStarted(true);
    }
  }, [preSelectedAssessmentId, selectedAssessment, started]);

  const handleStart = () => {
    if (!selectedAssessmentId) return;
    setStarted(true);
  };

  const handleComplete = useCallback(
    async (responses: Record<string, QuestionResponseValue>) => {
      setSaving(true);
      setError(null);
      try {
        await createAssessment.mutateAsync({
          patient_id: patientId,
          assessment_id: selectedAssessmentId,
          responses,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to save assessment';
        setError(message);
        setSaving(false);
      }
    },
    [patientId, selectedAssessmentId, createAssessment],
  );

  const handleSaveProgress = useCallback(
    async (responses: Record<string, QuestionResponseValue>) => {
      try {
        await saveProgress.mutateAsync({
          patientId,
          assessmentId: selectedAssessmentId,
          responses,
        });
      } catch {
        // Silently fail on progress save
      }
    },
    [patientId, selectedAssessmentId, saveProgress],
  );

  // ── Loading States ───────────────────────────────────────────────

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          Patient not found.
        </div>
        <Link
          href="/patients"
          className="text-muted-foreground hover:text-foreground mt-4 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to patients
        </Link>
      </div>
    );
  }

  // ── Assessment Selection Screen ─────────────────────────────────

  if (!started) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link
          href={`/patients/${patientId}`}
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to patient
        </Link>

        <div className="mb-8">
          <h1 className="text-foreground text-2xl font-bold">New Assessment</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Select an assessment to administer to{' '}
            <span className="text-foreground font-medium">
              {patient.first_name} {patient.last_name}
            </span>
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border p-6">
          <div className="space-y-1.5">
            <label
              htmlFor="assessment-select"
              className="text-foreground text-sm font-medium"
            >
              Assessment *
            </label>
            <select
              id="assessment-select"
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border py-2.5 px-3 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'appearance-none transition-colors',
              )}
            >
              <option value="">Select an assessment...</option>
              {(assessments ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.category.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Preview */}
          {selectedAssessment && (
            <div className="mt-6 border-t border-border pt-6">
              <AssessmentPreview assessment={selectedAssessment} />
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-6">
            <Link
              href={`/patients/${patientId}`}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleStart}
              disabled={!selectedAssessmentId}
              className={cn(
                'bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium',
                'hover:bg-primary/90 transition-colors',
                'disabled:pointer-events-none disabled:opacity-50',
              )}
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Question Runner Screen ─────────────────────────────────────

  if (assessmentLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!selectedAssessment) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          Assessment not found.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/patients/${patientId}`}
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to patient
        </Link>
        <h1 className="text-foreground mt-2 text-xl font-bold">
          {selectedAssessment.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          Administering to{' '}
          <span className="text-foreground font-medium">
            {patient.first_name} {patient.last_name}
          </span>
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Saving overlay */}
      {saving && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-background/80">
          <div className="flex items-center gap-3">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
            <span className="text-foreground text-sm font-medium">
              Saving assessment results...
            </span>
          </div>
        </div>
      )}

      <AssessmentRunner
        assessment={selectedAssessment}
        onComplete={handleComplete}
        onCancel={() => setStarted(false)}
        onSaveProgress={handleSaveProgress}
      />
    </div>
  );
}

// ── Assessment Preview ─────────────────────────────────────────

function AssessmentPreview({ assessment }: { assessment: Assessment }) {
  const questions = (assessment.questions ?? []) as AssessmentQuestion[];
  return (
    <div className="space-y-3">
      <h3 className="text-foreground text-sm font-semibold">
        Assessment Details
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {assessment.description}
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wider">
            Questions
          </span>
          <p className="text-foreground font-medium">{questions.length}</p>
        </div>
        {assessment.estimated_duration_minutes && (
          <div>
            <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wider">
              Duration
            </span>
            <p className="text-foreground font-medium">
              ~{assessment.estimated_duration_minutes} min
            </p>
          </div>
        )}
        {assessment.min_score !== null && assessment.max_score !== null && (
          <div>
            <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wider">
              Score Range
            </span>
            <p className="text-foreground font-medium">
              {assessment.min_score} – {assessment.max_score}
            </p>
          </div>
        )}
        {assessment.mcid !== null && (
          <div>
            <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wider">
              MCID
            </span>
            <p className="text-foreground font-medium">{assessment.mcid}</p>
          </div>
        )}
      </div>
    </div>
  );
}
