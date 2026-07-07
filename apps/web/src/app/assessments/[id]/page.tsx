'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  Clock,
  Activity,
  BookOpen,
  Target,
  Users,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  FileQuestion,
  ClipboardCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAssessment } from '@/hooks/use-assessments';
import { usePatients } from '@/hooks/use-patients';
import {
  ASSESSMENT_CATEGORY_OPTIONS,
  SCORING_TYPE_LABELS,
  QUESTION_TYPE_LABELS,
  CATEGORY_COLORS,
} from '@/types/assessment';
import type { AssessmentQuestion } from '@/types/assessment';

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: assessment, isLoading, error } = useAssessment(id);
  const { data: patients } = usePatients();

  const [showInstructions, setShowInstructions] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [showNormative, setShowNormative] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          Assessment not found or failed to load.
        </div>
        <Link
          href="/assessments"
          className="text-muted-foreground hover:text-foreground mt-4 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to assessments
        </Link>
      </div>
    );
  }

  const questions = (assessment.questions ?? []) as AssessmentQuestion[];
  const sortedQuestions = [...questions].sort((a, b) => a.sortOrder - b.sortOrder);
  const categoryInfo = ASSESSMENT_CATEGORY_OPTIONS.find(
    (c) => c.value === assessment.category,
  );

  const handleAdminister = () => {
    if (!selectedPatientId) return;
    router.push(
      `/patients/${selectedPatientId}/assessments/new?assessmentId=${assessment.id}`,
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/assessments"
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to assessment library
      </Link>

      {/* Header */}
      <div className="border-border bg-card mb-6 rounded-xl border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-3">
              {categoryInfo && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    CATEGORY_COLORS[assessment.category],
                  )}
                >
                  <span>{categoryInfo.icon}</span>
                  {categoryInfo.label}
                </span>
              )}
              {assessment.is_standardized && (
                <span className="border-border bg-accent/50 text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium">
                  <Activity className="h-3 w-3" />
                  Standardized
                </span>
              )}
              {assessment.published && (
                <span className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Published
                </span>
              )}
            </div>
            <h1 className="text-foreground text-2xl font-bold">{assessment.name}</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {assessment.description}
            </p>
          </div>

          {/* Administer button */}
          <button
            type="button"
            onClick={() => setAdminModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 shrink-0 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            <ClipboardCheck className="h-4 w-4" />
            Administer
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Key Info Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {assessment.estimated_duration_minutes && (
              <InfoCard
                icon={<Clock className="h-4 w-4" />}
                label="Duration"
                value={`${assessment.estimated_duration_minutes} min`}
              />
            )}
            <InfoCard
              icon={<Target className="h-4 w-4" />}
              label="Scoring"
              value={SCORING_TYPE_LABELS[assessment.scoring_type] ?? assessment.scoring_type}
            />
            {assessment.min_score !== null && assessment.max_score !== null && (
              <InfoCard
                icon={<Activity className="h-4 w-4" />}
                label="Score Range"
                value={`${assessment.min_score} – ${assessment.max_score}`}
              />
            )}
            {assessment.mcid !== null && (
              <InfoCard
                icon={<AlertTriangle className="h-4 w-4" />}
                label="MCID"
                value={String(assessment.mcid)}
              />
            )}
            {assessment.version && (
              <InfoCard icon={<BookOpen className="h-4 w-4" />} label="Version" value={assessment.version} />
            )}
            {assessment.body_regions.length > 0 && (
              <InfoCard icon={<Users className="h-4 w-4" />} label="Body Regions" value={assessment.body_regions.join(', ')} />
            )}
          </div>

          {/* Instructions */}
          {assessment.instructions && (
            <div className="border-border bg-card rounded-xl border">
              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex w-full items-center justify-between rounded-t-xl px-5 py-4 text-left transition-colors hover:bg-accent/50"
              >
                <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="text-primary h-4 w-4" />
                  Instructions & Administration
                </span>
                {showInstructions ? (
                  <ChevronUp className="text-muted-foreground h-4 w-4" />
                ) : (
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                )}
              </button>
              {showInstructions && (
                <div className="border-t border-border px-5 py-4">
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                    {assessment.instructions}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Scoring Instructions */}
          {assessment.scoring_instructions && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h3 className="text-foreground mb-2 flex items-center gap-2 text-sm font-semibold">
                <Target className="text-primary h-4 w-4" />
                Scoring Instructions
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {assessment.scoring_instructions}
              </p>
              {assessment.higher_is_better !== undefined && (
                <p className="text-muted-foreground mt-3 text-xs">
                  <strong>Interpretation:</strong>{' '}
                  {assessment.higher_is_better
                    ? 'Higher scores indicate better outcomes.'
                    : 'Lower scores indicate better outcomes.'}
                </p>
              )}
            </div>
          )}

          {/* Questions Preview */}
          <div className="border-border bg-card rounded-xl border">
            <button
              type="button"
              onClick={() => setShowQuestions(!showQuestions)}
              className="flex w-full items-center justify-between rounded-t-xl px-5 py-4 text-left transition-colors hover:bg-accent/50"
            >
              <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <FileQuestion className="text-primary h-4 w-4" />
                Questions ({sortedQuestions.length})
              </span>
              {showQuestions ? (
                <ChevronUp className="text-muted-foreground h-4 w-4" />
              ) : (
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              )}
            </button>
            {showQuestions && (
              <div className="divide-border border-t border-border divide-y">
                {sortedQuestions.map((q, idx) => (
                  <div key={q.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
                          Q{idx + 1} —{' '}
                          {QUESTION_TYPE_LABELS[q.questionType] ?? q.questionType}
                        </span>
                        <p className="text-foreground mt-0.5 text-sm">{q.questionText}</p>
                        {q.instructions && (
                          <p className="text-muted-foreground mt-0.5 text-xs italic">
                            {q.instructions}
                          </p>
                        )}
                      </div>
                      {q.required && (
                        <span className="text-destructive shrink-0 text-[10px] font-medium">
                          Required
                        </span>
                      )}
                    </div>
                    {q.options && q.options.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {q.options.map((opt, oi) => (
                          <span
                            key={oi}
                            className="border-border bg-accent/30 text-muted-foreground rounded-md border px-2 py-0.5 text-[10px]"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                    {q.subscale && (
                      <span className="text-muted-foreground mt-1 block text-[10px] font-medium">
                        Subscale: {q.subscale}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Requirements */}
          {assessment.required_equipment &&
            assessment.required_equipment.length > 0 && (
              <div className="border-border bg-card rounded-xl border p-5">
                <h3 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Stethoscope className="text-primary h-4 w-4" />
                  Required Equipment
                </h3>
                <ul className="space-y-1.5">
                  {assessment.required_equipment.map((eq, idx) => (
                    <li
                      key={idx}
                      className="text-muted-foreground flex items-center gap-2 text-xs"
                    >
                      <div className="bg-primary/10 h-1.5 w-1.5 shrink-0 rounded-full" />
                      {eq}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Conditions */}
          {assessment.conditions && assessment.conditions.length > 0 && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h3 className="text-foreground mb-3 text-sm font-semibold">
                Related Conditions
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {assessment.conditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="border-border bg-accent/50 text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-medium"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Normative Data */}
          {assessment.normative_data?.entries &&
            assessment.normative_data.entries.length > 0 && (
              <div className="border-border bg-card rounded-xl border">
                <button
                  type="button"
                  onClick={() => setShowNormative(!showNormative)}
                  className="flex w-full items-center justify-between rounded-t-xl px-5 py-4 text-left transition-colors hover:bg-accent/50"
                >
                  <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
                    <Users className="text-primary h-4 w-4" />
                    Normative Data
                  </span>
                  {showNormative ? (
                    <ChevronUp className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <ChevronDown className="text-muted-foreground h-4 w-4" />
                  )}
                </button>
                {showNormative && (
                  <div className="divide-border border-t border-border divide-y">
                    {assessment.normative_data.entries.map((entry, idx) => (
                      <div key={idx} className="px-5 py-3">
                        <p className="text-foreground text-xs font-medium">
                          {entry.population}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Mean: {entry.mean} (SD: {entry.standardDeviation})
                        </p>
                        {entry.minAge !== null &&
                          entry.minAge !== undefined &&
                          entry.maxAge !== null &&
                          entry.maxAge !== undefined && (
                            <p className="text-muted-foreground text-[10px]">
                              Ages {entry.minAge}–{entry.maxAge}
                            </p>
                          )}
                        {entry.percentileCutoffs && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {Object.entries(entry.percentileCutoffs).map(
                              ([pct, val]) => (
                                <span
                                  key={pct}
                                  className="border-border bg-accent/30 text-muted-foreground rounded-md border px-1.5 py-0.5 text-[10px]"
                                >
                                  {pct}th: {val}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Administer Modal */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="border-border bg-card w-full max-w-md rounded-xl border p-6 shadow-lg">
            <h2 className="text-foreground text-lg font-semibold">
              Administer Assessment
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Select a patient to administer{' '}
              <span className="text-foreground font-medium">{assessment.name}</span>
              .
            </p>

            <div className="mt-4 space-y-1.5">
              <label htmlFor="patient-select" className="text-foreground text-sm font-medium">
                Patient
              </label>
              <select
                id="patient-select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className={cn(
                  'border-input bg-background text-foreground w-full rounded-lg border py-2 px-3 text-sm',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                  'appearance-none transition-colors',
                )}
              >
                <option value="">Select a patient...</option>
                {(patients ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAdminModalOpen(false)}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdminister}
                disabled={!selectedPatientId}
                className={cn(
                  'bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors',
                  'hover:bg-primary/90',
                  'disabled:pointer-events-none disabled:opacity-50',
                )}
              >
                <ClipboardCheck className="h-4 w-4" />
                Start Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Info Card ───────────────────────────────────────────────────────────────

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <div className="text-muted-foreground mb-1 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <p className="text-foreground text-sm font-medium leading-tight">{value}</p>
    </div>
  );
}
