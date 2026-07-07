'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Stethoscope,
  Calendar,
  Brain,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePatient } from '@/hooks/use-patients';
import { usePatientAssessments, usePatientAssessmentScores } from '@/hooks/use-assessments';
import { ScoreDisplay } from '@/components/assessments/score-display';
import { AssessmentChart } from '@/components/assessments/assessment-chart';
import {
  PATIENT_ASSESSMENT_STATUS_COLORS,
} from '@/types/assessment';
import type { PatientAssessmentListItem } from '@/types/assessment';

export default function PatientAssessmentsPage() {
  const params = useParams();
  const patientId = params.id as string;

  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: assessments, isLoading, error } = usePatientAssessments(patientId);

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [aiInsightsOpen, setAiInsightsOpen] = useState(true);

  // Group assessments by assessment template
  const groupedAssessments = useMemo(() => {
    if (!assessments) return [];
    const groups = new Map<string, PatientAssessmentListItem[]>();
    for (const a of assessments) {
      const key = a.assessment?.name ?? a.assessment_id;
      const existing = groups.get(key) ?? [];
      existing.push(a);
      groups.set(key, existing);
    }
    return Array.from(groups.entries()).map(([name, items]) => ({
      name,
      assessmentId: items[0]?.assessment_id ?? '',
      assessments: items.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
      latest: items[0]!,
    }));
  }, [assessments]);

  const selectedGroup = useMemo(
    () =>
      selectedAssessmentId
        ? groupedAssessments.find((g) => g.assessmentId === selectedAssessmentId) ?? null
        : groupedAssessments[0] ?? null,
    [groupedAssessments, selectedAssessmentId],
  );

  const { data: scoreHistory } = usePatientAssessmentScores(
    patientId,
    selectedGroup?.assessmentId ?? '',
  );

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href={`/patients/${patientId}`}
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to patient
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Assessments</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Outcome measures and assessments for{' '}
            <span className="text-foreground font-medium">
              {patient.first_name} {patient.last_name}
            </span>
          </p>
        </div>
        <Link
          href={`/patients/${patientId}/assessments/new`}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Stethoscope className="h-4 w-4" />
          New Assessment
        </Link>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-6 rounded-lg border px-4 py-3 text-sm">
          Failed to load assessments.
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}

      {!isLoading && !error && assessments && assessments.length === 0 && (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <Stethoscope className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="text-foreground text-lg font-semibold">No assessments yet</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Administer your first outcome measure to this patient.
          </p>
          <Link
            href={`/patients/${patientId}/assessments/new`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <Stethoscope className="h-4 w-4" />
            New Assessment
          </Link>
        </div>
      )}

      {!isLoading && !error && assessments && assessments.length > 0 && (
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main Content */}
          <div className="min-w-0 flex-1 space-y-6">
            {/* Assessment Type Selector */}
            {groupedAssessments.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {groupedAssessments.map((group) => (
                  <button
                    key={group.assessmentId}
                    type="button"
                    onClick={() => setSelectedAssessmentId(group.assessmentId)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                      selectedAssessmentId === group.assessmentId
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
                    )}
                  >
                    {group.name} ({group.assessments.length})
                  </button>
                ))}
              </div>
            )}

            {selectedGroup && (
              <>
                {/* Score Trend Chart */}
                <AssessmentChart
                  data={scoreHistory ?? []}
                  assessmentName={selectedGroup.name}
                  minScore={
                    selectedGroup.latest.assessment?.min_score ?? null
                  }
                  maxScore={
                    selectedGroup.latest.assessment?.max_score ?? null
                  }
                  mcid={selectedGroup.latest.assessment?.mcid ?? null}
                  higherIsBetter={
                    selectedGroup.latest.assessment?.higher_is_better ?? true
                  }
                />

                {/* Latest Score Display */}
                {selectedGroup.latest.score !== null && (
                  <ScoreDisplay
                    score={selectedGroup.latest.score}
                    minScore={selectedGroup.latest.assessment?.min_score ?? null}
                    maxScore={selectedGroup.latest.assessment?.max_score ?? null}
                    higherIsBetter={
                      selectedGroup.latest.assessment?.higher_is_better ?? true
                    }
                    mcid={selectedGroup.latest.assessment?.mcid ?? null}
                    normativeData={
                      selectedGroup.latest.assessment?.normative_data ?? null
                    }
                    previousScore={
                      selectedGroup.assessments.length > 1
                        ? selectedGroup.assessments[1]?.score ?? null
                        : null
                    }
                    interpretation={selectedGroup.latest.interpretation}
                  />
                )}

                {/* AI Interpretation */}
                {selectedGroup.latest.score !== null && (
                  <div className="border-border bg-card rounded-xl border">
                    <button
                      type="button"
                      onClick={() => setAiInsightsOpen(!aiInsightsOpen)}
                      className="flex w-full items-center justify-between rounded-t-xl px-5 py-4 text-left transition-colors hover:bg-accent/50"
                    >
                      <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
                        <Brain className="text-primary h-4 w-4" />
                        AI Interpretation
                      </span>
                      {aiInsightsOpen ? (
                        <ChevronDown className="text-muted-foreground h-4 w-4" />
                      ) : (
                        <ChevronRight className="text-muted-foreground h-4 w-4" />
                      )}
                    </button>
                    {aiInsightsOpen && (
                      <div className="border-t border-border px-5 py-4">
                        <div className="space-y-3">
                          {selectedGroup.latest.interpretation && (
                            <div>
                              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                Score Interpretation
                              </span>
                              <p className="text-foreground mt-1 text-sm">
                                {selectedGroup.latest.interpretation}
                              </p>
                            </div>
                          )}

                          {selectedGroup.latest.assessment?.mcid !== null &&
                            selectedGroup.assessments.length > 1 && (
                              <div>
                                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                  Clinical Significance
                                </span>
                                <p className="text-foreground mt-1 text-sm">
                                  {Math.abs(
                                    (selectedGroup.assessments[0]?.score ?? 0) -
                                      (selectedGroup.assessments[1]?.score ?? 0),
                                  ) >= (selectedGroup.latest.assessment?.mcid ?? 0)
                                    ? 'The change in score exceeds the minimal clinically important difference (MCID), indicating a clinically meaningful change.'
                                    : 'The change in score does not exceed the minimal clinically important difference (MCID).'}
                                </p>
                              </div>
                            )}

                          {selectedGroup.latest.flagged && (
                            <div className="border-destructive/30 bg-destructive/5 flex items-start gap-2 rounded-lg border p-3">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                              <div>
                                <span className="text-destructive text-xs font-medium">
                                  Flagged for Review
                                </span>
                                <p className="text-muted-foreground mt-0.5 text-xs">
                                  This assessment result has been flagged and may
                                  require clinical attention.
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="border-border/50 bg-accent/30 rounded-lg border p-3">
                            <span className="text-muted-foreground block text-xs font-medium">
                              Clinical Note
                            </span>
                            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                              This AI-generated interpretation is for reference only
                              and should be reviewed in the context of the full
                              clinical picture. Always verify against your clinical
                              judgment.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Assessment History */}
                <div className="border-border bg-card rounded-xl border">
                  <div className="border-border flex items-center justify-between border-b px-5 py-3.5">
                    <h3 className="text-foreground text-sm font-semibold">
                      Assessment History
                    </h3>
                    <span className="text-muted-foreground text-xs">
                      {selectedGroup.assessments.length} total
                    </span>
                  </div>
                  <div className="divide-border divide-y">
                    {selectedGroup.assessments.map((pa) => (
                      <div
                        key={pa.id}
                        className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-accent/30"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
                                PATIENT_ASSESSMENT_STATUS_COLORS[pa.status],
                              )}
                            >
                              {pa.status.replace('_', ' ')}
                            </span>
                            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3" />
                              {pa.completed_at
                                ? new Date(pa.completed_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : new Date(pa.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3">
                            {pa.score !== null && (
                              <span className="text-foreground font-semibold">
                                Score: {pa.score}
                              </span>
                            )}
                            {pa.percentile !== null && (
                              <span className="text-muted-foreground text-xs">
                                {pa.percentile}th percentile
                              </span>
                            )}
                          </div>
                        </div>
                        {pa.flagged && (
                          <AlertTriangle className="text-destructive ml-2 h-3.5 w-3.5 shrink-0" />
                        )}
                        {pa.interpretation && (
                          <span
                            className={cn(
                              'ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium',
                              pa.score !== null &&
                                pa.score >= ((pa.assessment?.max_score ?? 100) * 0.7)
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-muted text-muted-foreground',
                            )}
                          >
                            {pa.score !== null &&
                            pa.score >= ((pa.assessment?.max_score ?? 100) * 0.7)
                              ? 'Good'
                              : 'Review'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full shrink-0 lg:w-72">
            <div className="border-border bg-card sticky top-6 rounded-xl border">
              <div className="border-border border-b px-4 py-3">
                <h3 className="text-foreground text-sm font-semibold">
                  Assessment Summary
                </h3>
              </div>
              <div className="space-y-4 p-4">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    Total Assessments
                  </span>
                  <span className="text-foreground mt-0.5 block text-lg font-bold">
                    {assessments.length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    Unique Types
                  </span>
                  <span className="text-foreground mt-0.5 block text-lg font-bold">
                    {groupedAssessments.length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    Completed
                  </span>
                  <span className="text-foreground mt-0.5 block text-lg font-bold">
                    {assessments.filter((a) => a.status === 'completed').length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    In Progress
                  </span>
                  <span className="text-foreground mt-0.5 block text-lg font-bold">
                    {assessments.filter((a) => a.status === 'in_progress').length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    Flagged
                  </span>
                  <span className="text-foreground mt-0.5 block text-lg font-bold">
                    {assessments.filter((a) => a.flagged).length}
                  </span>
                </div>

                <div className="border-t border-border pt-4">
                  <Link
                    href={`/patients/${patientId}/assessments/new`}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Stethoscope className="h-4 w-4" />
                    New Assessment
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
