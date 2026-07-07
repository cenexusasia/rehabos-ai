'use client';

import { useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BuilderQuestion } from './assessment-builder';
import type { QuestionType } from '@/types/assessment';

// ── Types ─────────────────────────────────────────────────────────────────

interface QuestionEditorProps {
  question: BuilderQuestion;
  onChange: (updates: Partial<BuilderQuestion>) => void;
  className?: string;
}

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'scale_1_10', label: 'Scale 1–10' },
  { value: 'scale_0_10', label: 'Scale 0–10' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'numeric', label: 'Numeric Value' },
  { value: 'text', label: 'Free Text' },
  { value: 'visual_analog', label: 'Visual Analog Scale' },
];

// ── Component ──────────────────────────────────────────────────────────────

export function QuestionEditor({
  question,
  onChange,
  className,
}: QuestionEditorProps) {
  const handleTypeChange = useCallback(
    (newType: QuestionType) => {
      const updates: Partial<BuilderQuestion> = { questionType: newType };

      // Set sensible defaults when switching types
      if (newType === 'multiple_choice') {
        updates.options = question.options?.length
          ? question.options
          : ['Option 1', 'Option 2'];
      } else if (newType === 'scale_1_10' || newType === 'scale_0_10') {
        updates.options = undefined;
      } else if (newType === 'yes_no') {
        updates.options = undefined;
      } else if (newType === 'numeric') {
        updates.options = undefined;
      } else if (newType === 'text') {
        updates.options = undefined;
      } else if (newType === 'visual_analog') {
        updates.options = undefined;
      }

      onChange(updates);
    },
    [onChange, question.options],
  );

  // ── Options management ───────────────────────────────────────────────

  const addOption = useCallback(() => {
    const newOptions = [...(question.options ?? []), `Option ${(question.options?.length ?? 0) + 1}`];
    onChange({ options: newOptions });
  }, [onChange, question.options]);

  const updateOption = useCallback(
    (index: number, value: string) => {
      const newOptions = [...(question.options ?? [])];
      newOptions[index] = value;
      onChange({ options: newOptions });
    },
    [onChange, question.options],
  );

  const removeOption = useCallback(
    (index: number) => {
      const newOptions = (question.options ?? []).filter((_, i) => i !== index);
      onChange({ options: newOptions.length > 0 ? newOptions : undefined });
    },
    [onChange, question.options],
  );

  const inputClass =
    'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors';

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className={cn('space-y-3', className)}>
      {/* Row 1: Type selector + Weight + Required */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px] flex-1">
          <label className="text-muted-foreground mb-1 block text-[10px] font-medium uppercase tracking-wider">
            Question Type
          </label>
          <select
            value={question.questionType}
            onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            className={inputClass}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-20">
          <label className="text-muted-foreground mb-1 block text-[10px] font-medium uppercase tracking-wider">
            Weight
          </label>
          <input
            type="number"
            min={1}
            step={0.5}
            value={question.weight ?? 1}
            onChange={(e) => onChange({ weight: parseFloat(e.target.value) || 1 })}
            className={inputClass}
            title="Scoring weight multiplier"
          />
        </div>
        <div className="flex items-center gap-2 pb-1">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={question.required ?? false}
              onChange={(e) => onChange({ required: e.target.checked })}
              className="peer sr-only"
            />
            <div className="bg-border peer-checked:bg-destructive h-4 w-7 rounded-full after:absolute after:start-[2px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
          </label>
          <span className="text-muted-foreground text-xs">Required</span>
        </div>
      </div>

      {/* Question text */}
      <div>
        <label className="text-muted-foreground mb-1 block text-[10px] font-medium uppercase tracking-wider">
          Question Text
        </label>
        <input
          type="text"
          value={question.questionText}
          onChange={(e) => onChange({ questionText: e.target.value })}
          placeholder="Enter your question..."
          className={inputClass}
          autoComplete="off"
        />
      </div>

      {/* Options editor for multiple_choice */}
      {(question.questionType === 'multiple_choice' ||
        question.questionType === 'scale_1_10' ||
        question.questionType === 'scale_0_10') && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
              Options
            </label>
            <button
              type="button"
              onClick={addOption}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 text-[10px] font-medium transition-colors"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
          <div className="space-y-1.5">
            {(question.options ?? []).map((opt, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-medium">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className={cn(inputClass, 'py-1.5')}
                />
                {(question.options?.length ?? 0) > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="text-muted-foreground hover:text-destructive shrink-0 rounded p-1 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scale ranges info */}
      {(question.questionType === 'scale_1_10' || question.questionType === 'scale_0_10') && (
        <p className="text-muted-foreground text-[10px]">
          Scale from{' '}
          {question.questionType === 'scale_1_10' ? '1 (lowest)' : '0 (none)'} to{' '}
          {question.questionType === 'scale_1_10' ? '10 (highest)' : '10 (worst)'}.
        </p>
      )}

      {/* Visual analog hint */}
      {question.questionType === 'visual_analog' && (
        <p className="text-muted-foreground text-[10px]">
          Visual Analog Scale from 0 (none) to 100 (worst). Patient positions a
          slider on the continuum.
        </p>
      )}
    </div>
  );
}
