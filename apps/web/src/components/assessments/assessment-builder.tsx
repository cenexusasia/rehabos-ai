'use client';

import { useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuestionEditor } from './question-editor';
import type { AssessmentQuestion, ScoringType } from '@/types/assessment';
import { QUESTION_TYPE_LABELS, SCORING_TYPE_LABELS } from '@/types/assessment';

// ── Types ─────────────────────────────────────────────────────────────────

export interface BuilderQuestion extends AssessmentQuestion {
  id: string;
  sortOrder: number;
}

export interface AssessmentBuilderConfig {
  name: string;
  description: string;
  instructions: string;
  category: string;
  bodyRegions: string[];
  scoringType: ScoringType;
  higherIsBetter: boolean;
  mcid: number | null;
  estimatedDurationMinutes: number | null;
  requiredEquipment: string[];
}

interface AssessmentBuilderProps {
  initialConfig?: Partial<AssessmentBuilderConfig>;
  initialQuestions?: BuilderQuestion[];
  onSave: (config: AssessmentBuilderConfig, questions: BuilderQuestion[]) => void;
  onCancel?: () => void;
  className?: string;
}

const DEFAULT_CONFIG: AssessmentBuilderConfig = {
  name: '',
  description: '',
  instructions: '',
  category: 'outcome_measure',
  bodyRegions: [],
  scoringType: 'numeric',
  higherIsBetter: true,
  mcid: null,
  estimatedDurationMinutes: null,
  requiredEquipment: [],
};

const CATEGORY_OPTIONS = [
  { value: 'outcome_measure', label: 'Outcome Measure' },
  { value: 'functional_test', label: 'Functional Test' },
  { value: 'special_test', label: 'Special Test' },
  { value: 'subjective', label: 'Subjective' },
  { value: 'objective', label: 'Objective' },
  { value: 'patient_reported', label: 'Patient-Reported' },
];

const SCORING_OPTIONS: { value: ScoringType; label: string }[] = [
  { value: 'numeric', label: 'Numeric Score' },
  { value: 'ordinal', label: 'Ordinal Scale' },
  { value: 'likert', label: 'Likert Scale' },
  { value: 'timed', label: 'Timed Test' },
  { value: 'pass_fail', label: 'Pass / Fail' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'visual_analog_scale', label: 'Visual Analog Scale' },
];

const BODY_REGION_OPTIONS = [
  'Cervical Spine', 'Thoracic Spine', 'Lumbar Spine', 'Shoulder',
  'Elbow', 'Wrist & Hand', 'Hip', 'Knee', 'Ankle & Foot',
  'Full Body', 'Upper Extremity', 'Lower Extremity', 'Pelvis',
  'Temporomandibular Joint', 'General',
];

// ── Component ──────────────────────────────────────────────────────────────

export function AssessmentBuilder({
  initialConfig,
  initialQuestions,
  onSave,
  onCancel,
  className,
}: AssessmentBuilderProps) {
  const [config, setConfig] = useState<AssessmentBuilderConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });
  const [questions, setQuestions] = useState<BuilderQuestion[]>(
    initialQuestions ?? [],
  );
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Config updaters ──────────────────────────────────────────────────

  const updateConfig = useCallback(
    <K extends keyof AssessmentBuilderConfig>(
      key: K,
      value: AssessmentBuilderConfig[K],
    ) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const toggleBodyRegion = useCallback((region: string) => {
    setConfig((prev) => ({
      ...prev,
      bodyRegions: prev.bodyRegions.includes(region)
        ? prev.bodyRegions.filter((r) => r !== region)
        : [...prev.bodyRegions, region],
    }));
  }, []);

  // ── Question management ──────────────────────────────────────────────

  const addQuestion = useCallback(() => {
    const newQ: BuilderQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      questionType: 'multiple_choice',
      questionText: '',
      options: ['Option 1', 'Option 2'],
      required: false,
      weight: 1,
      sortOrder: questions.length,
    };
    setQuestions((prev) => [...prev, newQ]);
  }, [questions.length]);

  const updateQuestion = useCallback(
    (id: string, updates: Partial<BuilderQuestion>) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...updates } : q)),
      );
    },
    [],
  );

  const removeQuestion = useCallback((id: string) => {
    setQuestions((prev) =>
      prev
        .filter((q) => q.id !== id)
        .map((q, idx) => ({ ...q, sortOrder: idx })),
    );
  }, []);

  const moveQuestion = useCallback((id: string, direction: 'up' | 'down') => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx]!, next[idx]!];
      return next.map((q, i) => ({ ...q, sortOrder: i }));
    });
  }, []);

  // ── Validation ───────────────────────────────────────────────────────

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!config.name.trim()) newErrors.name = 'Assessment name is required';
    if (!config.description.trim())
      newErrors.description = 'Description is required';
    if (questions.length === 0)
      newErrors.questions = 'At least one question is required';
    questions.forEach((q) => {
      if (!q.questionText.trim())
        newErrors[`q_${q.id}`] = 'Question text is required';
      if (
        (q.questionType === 'multiple_choice' || q.questionType === 'scale_1_10' || q.questionType === 'scale_0_10') &&
        (!q.options || q.options.length < 1)
      ) {
        newErrors[`q_opts_${q.id}`] = 'At least one option is required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [config, questions]);

  const handleSave = useCallback(() => {
    if (!validate()) return;
    onSave(config, questions);
  }, [config, questions, validate, onSave]);

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="border-border bg-card flex items-center justify-between rounded-xl border p-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Assessment Builder
            </h2>
            <p className="text-muted-foreground text-sm">
              Create or modify a custom assessment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
              preview
                ? 'bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:text-foreground border',
            )}
          >
            {preview ? (
              <>
                <EyeOff className="h-3.5 w-3.5" /> Edit
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" /> Preview
              </>
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors"
          >
            <Save className="h-3.5 w-3.5" /> Save Assessment
          </button>
        </div>
      </div>

      {preview ? (
        /* ── Preview Mode ───────────────────────────────────────────── */
        <div className="border-border bg-card space-y-4 rounded-xl border p-6">
          <div>
            <h3 className="text-foreground text-xl font-bold">{config.name || 'Untitled Assessment'}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{config.description}</p>
          </div>
          {config.instructions && (
            <div className="bg-accent/50 text-muted-foreground rounded-lg p-3 text-sm">
              {config.instructions}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <span className="border-border text-muted-foreground rounded-md border px-2 py-0.5 text-xs">
              {CATEGORY_OPTIONS.find((c) => c.value === config.category)?.label ?? config.category}
            </span>
            <span className="border-border text-muted-foreground rounded-md border px-2 py-0.5 text-xs">
              {SCORING_TYPE_LABELS[config.scoringType] ?? config.scoringType}
            </span>
            {config.estimatedDurationMinutes && (
              <span className="border-border text-muted-foreground rounded-md border px-2 py-0.5 text-xs">
                ~{config.estimatedDurationMinutes} min
              </span>
            )}
            {config.higherIsBetter && (
              <span className="border-border text-emerald-500/70 rounded-md border px-2 py-0.5 text-xs">
                Higher is better
              </span>
            )}
          </div>
          <div className="divide-border divide-y">
            {questions.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No questions added yet.
              </p>
            ) : (
              [...questions]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((q, idx) => (
                  <div key={q.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <span className="text-muted-foreground mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                          {QUESTION_TYPE_LABELS[q.questionType] ?? q.questionType}
                          {q.weight && q.weight !== 1 && (
                            <span className="ml-2 text-[10px]">(weight: {q.weight}x)</span>
                          )}
                        </span>
                        <p className="text-foreground mt-0.5 text-sm font-medium">
                          {q.questionText || '(No question text)'}
                        </p>
                        {q.questionType === 'multiple_choice' && q.options && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {q.options.map((opt, oi) => (
                              <span
                                key={oi}
                                className="border-border bg-accent/30 text-muted-foreground rounded-md border px-2 py-0.5 text-xs"
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                        {(q.questionType === 'scale_1_10' || q.questionType === 'scale_0_10') && (
                          <div className="mt-2 flex items-center gap-1">
                            {Array.from(
                              { length: q.questionType === 'scale_1_10' ? 10 : 11 },
                              (_, i) => (q.questionType === 'scale_1_10' ? i + 1 : i),
                            ).map((n) => (
                              <span
                                key={n}
                                className="border-border bg-accent/30 text-muted-foreground flex h-7 w-7 items-center justify-center rounded-md border text-xs"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        )}
                        {q.required && (
                          <span className="text-destructive mt-1 inline-block text-xs">Required</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ── Assessment Config ──────────────────────────────────────── */}
          <div className="border-border bg-card rounded-xl border p-5">
            <h3 className="text-foreground mb-4 text-sm font-semibold">Assessment Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-foreground mb-1.5 block text-xs font-medium">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => updateConfig('name', e.target.value)}
                  placeholder="e.g., Lower Extremity Functional Scale"
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    errors.name && 'border-destructive',
                  )}
                />
                {errors.name && (
                  <p className="text-destructive mt-1 text-xs">{errors.name}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-foreground mb-1.5 block text-xs font-medium">
                  Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={config.description}
                  onChange={(e) => updateConfig('description', e.target.value)}
                  placeholder="Describe what this assessment measures..."
                  rows={2}
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none resize-y',
                    errors.description && 'border-destructive',
                  )}
                />
                {errors.description && (
                  <p className="text-destructive mt-1 text-xs">{errors.description}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-foreground mb-1.5 block text-xs font-medium">Instructions</label>
                <textarea
                  value={config.instructions}
                  onChange={(e) => updateConfig('instructions', e.target.value)}
                  placeholder="Instructions for the clinician administering this assessment..."
                  rows={2}
                  className="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none resize-y"
                />
              </div>
              <div>
                <label className="text-foreground mb-1.5 block text-xs font-medium">Category</label>
                <select
                  value={config.category}
                  onChange={(e) => updateConfig('category', e.target.value)}
                  className="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-foreground mb-1.5 block text-xs font-medium">Scoring Type</label>
                <select
                  value={config.scoringType}
                  onChange={(e) => updateConfig('scoringType', e.target.value as ScoringType)}
                  className="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none"
                >
                  {SCORING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-foreground mb-1.5 block text-xs font-medium">Est. Duration (min)</label>
                <input
                  type="number"
                  min={1}
                  value={config.estimatedDurationMinutes ?? ''}
                  onChange={(e) =>
                    updateConfig(
                      'estimatedDurationMinutes',
                      e.target.value ? parseInt(e.target.value, 10) : null,
                    )
                  }
                  placeholder="e.g., 15"
                  className="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-foreground mb-1.5 block text-xs font-medium">MCID</label>
                <input
                  type="number"
                  step={0.1}
                  value={config.mcid ?? ''}
                  onChange={(e) =>
                    updateConfig('mcid', e.target.value ? parseFloat(e.target.value) : null)
                  }
                  placeholder="Minimal Clinically Important Difference"
                  className="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={config.higherIsBetter}
                    onChange={(e) => updateConfig('higherIsBetter', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="bg-border peer-checked:bg-primary h-5 w-9 rounded-full after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                </label>
                <span className="text-foreground text-sm">Higher score is better</span>
              </div>
            </div>

            {/* Body Regions */}
            <div className="mt-4">
              <label className="text-foreground mb-2 block text-xs font-medium">Body Regions</label>
              <div className="flex flex-wrap gap-1.5">
                {BODY_REGION_OPTIONS.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleBodyRegion(region)}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                      config.bodyRegions.includes(region)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:text-foreground bg-accent/30',
                    )}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Questions ─────────────────────────────────────────────── */}
          <div className="border-border bg-card rounded-xl border p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-foreground text-sm font-semibold">Questions</h3>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {questions.length} question{questions.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add Question
              </button>
            </div>

            {errors.questions && (
              <p className="text-destructive mb-3 text-xs">{errors.questions}</p>
            )}

            {questions.length === 0 ? (
              <div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed py-12">
                <FileText className="h-8 w-8 opacity-40" />
                <p className="text-sm">No questions yet. Click &quot;Add Question&quot; to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...questions]
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((q, idx) => (
                    <div
                      key={q.id}
                      className={cn(
                        'border-border group relative rounded-lg border p-4 transition-all hover:border-primary/30',
                        errors[`q_${q.id}`] || errors[`q_opts_${q.id}`]
                          ? 'border-destructive/40 bg-destructive/[0.02]'
                          : 'bg-accent/20',
                      )}
                    >
                      {/* Question header */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-muted-foreground text-xs font-medium">
                            {QUESTION_TYPE_LABELS[q.questionType] ?? q.questionType}
                          </span>
                          {q.weight && q.weight !== 1 && (
                            <span className="border-border text-muted-foreground rounded border px-1.5 text-[10px]">
                              w: {q.weight}x
                            </span>
                          )}
                          {q.required && (
                            <span className="text-destructive text-[10px]">*Required</span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => moveQuestion(q.id, 'up')}
                            disabled={idx === 0}
                            className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors disabled:opacity-30"
                            title="Move up"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveQuestion(q.id, 'down')}
                            disabled={idx === questions.length - 1}
                            className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors disabled:opacity-30"
                            title="Move down"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeQuestion(q.id)}
                            className="text-destructive/60 hover:text-destructive rounded p-1 transition-colors"
                            title="Remove question"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Question editor */}
                      <QuestionEditor
                        question={q}
                        onChange={(updates) => updateQuestion(q.id, updates)}
                      />
                      {errors[`q_${q.id}`] && (
                        <p className="text-destructive mt-1 text-xs">{errors[`q_${q.id}`]}</p>
                      )}
                      {errors[`q_opts_${q.id}`] && (
                        <p className="text-destructive mt-1 text-xs">{errors[`q_opts_${q.id}`]}</p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
