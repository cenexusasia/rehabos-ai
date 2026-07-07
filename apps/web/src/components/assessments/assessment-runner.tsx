'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Assessment, AssessmentQuestion, QuestionResponseValue, QuestionType } from '@/types/assessment';
import { QUESTION_TYPE_LABELS } from '@/types/assessment';

interface AssessmentRunnerProps {
  assessment: Assessment;
  onComplete: (responses: Record<string, QuestionResponseValue>) => void;
  onCancel?: () => void;
  onSaveProgress?: (responses: Record<string, QuestionResponseValue>) => void;
  initialResponses?: Record<string, QuestionResponseValue>;
  className?: string;
}

export function AssessmentRunner({
  assessment,
  onComplete,
  onCancel,
  onSaveProgress,
  initialResponses,
  className,
}: AssessmentRunnerProps) {
  const questions = (assessment.questions ?? []) as AssessmentQuestion[];
  const sortedQuestions = [...questions].sort((a, b) => a.sortOrder - b.sortOrder);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponseValue>>(
    initialResponses ?? {},
  );
  const [showSummary, setShowSummary] = useState(false);

  const currentQuestion = sortedQuestions[currentIndex];
  const totalQuestions = sortedQuestions.length;
  const answeredCount = sortedQuestions.filter((q) => {
    const val = responses[q.id];
    return val !== undefined && val !== null && val !== '';
  }).length;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const setResponse = useCallback(
    (questionId: string, value: QuestionResponseValue) => {
      setResponses((prev) => ({ ...prev, [questionId]: value }));
    },
    [],
  );

  const goNext = useCallback(() => {
    if (isLastQuestion) {
      setShowSummary(true);
    } else {
      setCurrentIndex((i) => Math.min(i + 1, totalQuestions - 1));
    }
  }, [isLastQuestion, totalQuestions]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleSaveProgress = useCallback(() => {
    onSaveProgress?.(responses);
  }, [onSaveProgress, responses]);

  const handleComplete = useCallback(() => {
    onComplete(responses);
  }, [onComplete, responses]);

  const goToQuestion = useCallback((index: number) => {
    setCurrentIndex(index);
    setShowSummary(false);
  }, []);

  // ── Summary View ────────────────────────────────────────────────────

  if (showSummary) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="border-border bg-card rounded-xl border p-6">
          <h3 className="text-foreground text-lg font-semibold">Assessment Summary</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Review your answers before submitting.
          </p>
        </div>

        <div className="space-y-3">
          {sortedQuestions.map((q, idx) => {
            const value = responses[q.id];
            const isAnswered = value !== undefined && value !== null && value !== '';
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => goToQuestion(idx)}
                className={cn(
                  'border-border bg-card flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all hover:border-primary/40',
                  !isAnswered && 'border-destructive/30 bg-destructive/5',
                )}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    isAnswered
                      ? 'bg-primary/10 text-primary'
                      : 'bg-destructive/10 text-destructive',
                  )}
                >
                  {isAnswered ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium">
                    {q.questionText}
                  </p>
                  {isAnswered ? (
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Answer: {formatAnswer(value, q.questionType)}
                    </p>
                  ) : (
                    <p className="text-destructive mt-0.5 text-xs">Not answered</p>
                  )}
                </div>
                <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowSummary(false)}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveProgress}
              className="border-input text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            >
              Save Progress
            </button>
            <button
              type="button"
              onClick={handleComplete}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-6 py-2 text-sm font-medium transition-colors"
            >
              <Check className="h-4 w-4" />
              Complete Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Question View ───────────────────────────────────────────────────

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-muted-foreground">{progress}% complete</span>
        </div>
        <div className="bg-border h-2 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Question dots */}
        <div className="flex gap-1">
          {sortedQuestions.map((q, idx) => {
            const isAnswered = responses[q.id] !== undefined && responses[q.id] !== null && responses[q.id] !== '';
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all',
                  idx === currentIndex
                    ? 'bg-primary'
                    : isAnswered
                      ? 'bg-primary/40'
                      : 'bg-border',
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className="border-border bg-card rounded-xl border p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-muted-foreground mb-1 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider">
                {QUESTION_TYPE_LABELS[currentQuestion.questionType] ?? currentQuestion.questionType}
              </span>
              <h3 className="text-foreground text-lg font-semibold">
                {currentQuestion.questionText}
              </h3>
              {currentQuestion.instructions && (
                <p className="text-muted-foreground mt-1 flex items-start gap-1.5 text-sm">
                  <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {currentQuestion.instructions}
                </p>
              )}
            </div>
            {currentQuestion.required && (
              <span className="text-destructive shrink-0 text-sm font-medium">Required</span>
            )}
          </div>

          <div className="mt-6">
            <QuestionInput
              question={currentQuestion}
              value={responses[currentQuestion.id] ?? null}
              onChange={(val) => setResponse(currentQuestion.id, val)}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <div>
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={goPrev}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onSaveProgress && (
            <button
              type="button"
              onClick={handleSaveProgress}
              className="border-input text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            >
              Save Progress
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-6 py-2 text-sm font-medium transition-colors"
          >
            {isLastQuestion ? 'Review Summary' : 'Next'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Question Input ──────────────────────────────────────────────────────────

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestion;
  value: QuestionResponseValue;
  onChange: (value: QuestionResponseValue) => void;
}) {
  const inputClass =
    'border-input bg-background text-foreground w-full rounded-lg border py-2 px-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors';

  switch (question.questionType) {
    case 'scale_1_10': {
      const current = typeof value === 'number' ? value : typeof value === 'string' ? parseInt(value, 10) : null;
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all',
                  current === num
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-accent/50 text-muted-foreground hover:border-primary/40 hover:text-foreground border',
                )}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Least</span>
            <span>Most</span>
          </div>
        </div>
      );
    }

    case 'scale_0_10': {
      const current = typeof value === 'number' ? value : typeof value === 'string' ? parseInt(value, 10) : null;
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-1">
            {Array.from({ length: 11 }, (_, i) => i).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-all',
                  current === num
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-accent/50 text-muted-foreground hover:border-primary/40 hover:text-foreground border',
                )}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>None</span>
            <span>Worst possible</span>
          </div>
        </div>
      );
    }

    case 'yes_no': {
      const current = value;
      return (
        <div className="flex gap-3">
          {[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all',
                current === opt.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-accent/50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    case 'multiple_choice': {
      const options = question.options ?? [];
      const current = value;
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all',
                current === opt
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-accent/50',
              )}
            >
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs',
                  current === opt
                    ? 'border-primary-foreground bg-primary-foreground/20'
                    : 'border-border',
                )}
              >
                {current === opt && <Check className="h-3 w-3" />}
              </div>
              {opt}
            </button>
          ))}
        </div>
      );
    }

    case 'numeric': {
      const current = typeof value === 'number' ? value : typeof value === 'string' ? value : '';
      return (
        <input
          type="number"
          value={current}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === '' ? null : parseFloat(v));
          }}
          placeholder="Enter numeric value..."
          className={inputClass}
        />
      );
    }

    case 'text': {
      const current = typeof value === 'string' ? value : '';
      return (
        <textarea
          value={current}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your response..."
          rows={4}
          className={cn(inputClass, 'resize-y')}
        />
      );
    }

    case 'visual_analog': {
      const current = typeof value === 'number' ? value : 0;
      return (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="range"
              min={0}
              max={100}
              value={current}
              onChange={(e) => onChange(parseInt(e.target.value, 10))}
              className="w-full accent-primary"
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground rounded-md px-2 py-0.5 text-sm font-bold">
                {current}
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>No pain (0)</span>
            <span>Worst pain (100)</span>
          </div>
        </div>
      );
    }

    default:
      return (
        <p className="text-muted-foreground text-sm">
          Unsupported question type: {question.questionType}
        </p>
      );
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatAnswer(value: QuestionResponseValue, questionType: QuestionType): string {
  if (value === null || value === undefined) return 'Not answered';
  if (questionType === 'yes_no') {
    return value === true || value === 'true' || value === 'yes' ? 'Yes' : 'No';
  }
  return String(value);
}
