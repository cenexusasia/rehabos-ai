'use client';

import { useState, useCallback } from 'react';
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Loader2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ExercisePicker } from '@/components/exercises/exercise-picker';
import { DIFFICULTY_COLORS } from '@/types/exercise';
import type { ExerciseListItem, ExerciseParameter } from '@/types/exercise';

// ── Exercise Item with Prescription Parameters ─────────────────────────────

interface BuilderExercise {
  exercise_id: string;
  sort_order: number;
  parameters: ExerciseParameter;
  exercise: {
    id: string;
    name: string;
    description: string;
    category_slug: string;
    difficulty: string;
    body_regions: string[];
    image_url: string | null;
    default_sets: number;
    default_reps: string;
  };
}

interface HEPBuilderProps {
  onSave: (exercises: BuilderExercise[]) => Promise<void>;
  initialExercises?: BuilderExercise[];
  isSaving?: boolean;
  className?: string;
}

export function HEPBuilder({
  onSave,
  initialExercises,
  isSaving = false,
  className,
}: HEPBuilderProps) {
  const [exercises, setExercises] = useState<BuilderExercise[]>(
    initialExercises ?? [],
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // Add exercise from picker
  const handleSelectExercise = useCallback(
    (ex: ExerciseListItem) => {
      const newExercise: BuilderExercise = {
        exercise_id: ex.id,
        sort_order: exercises.length,
        parameters: {
          sets: ex.default_sets ?? 3,
          reps: ex.default_reps ?? '10',
          hold_seconds: 0,
          rest_seconds: 30,
          intensity_percent: null,
          rpe: null,
          notes: null,
          frequency: null,
        },
        exercise: {
          id: ex.id,
          name: ex.name,
          description: ex.description ?? '',
          category_slug: ex.category_slug,
          difficulty: ex.difficulty,
          body_regions: ex.body_regions,
          image_url: ex.image_url,
          default_sets: ex.default_sets ?? 3,
          default_reps: ex.default_reps ?? '10',
        },
      };

      setExercises((prev) => [...prev, newExercise]);
      setPickerOpen(false);
    },
    [exercises.length],
  );

  // Remove exercise
  const handleRemoveExercise = useCallback((index: number) => {
    setExercises((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((ex, i) => ({ ...ex, sort_order: i })),
    );
  }, []);

  // Update parameter for an exercise
  const handleParamChange = useCallback(
    (index: number, field: keyof ExerciseParameter, value: number | string | null) => {
      setExercises((prev) =>
        prev.map((ex, i) =>
          i === index
            ? {
                ...ex,
                parameters: { ...ex.parameters, [field]: value },
              }
            : ex,
        ),
      );
    },
    [],
  );

  // Move exercise up
  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setExercises((prev) => {
      const next = [...prev];
      const temp = next[index]!;
      next[index] = { ...next[index - 1]!, sort_order: index };
      next[index - 1] = { ...temp, sort_order: index - 1 };
      return next;
    });
  }, []);

  // Move exercise down
  const handleMoveDown = useCallback((index: number) => {
    setExercises((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index]!;
      next[index] = { ...next[index + 1]!, sort_order: index };
      next[index + 1] = { ...temp, sort_order: index + 1 };
      return next;
    });
  }, []);

  // Toggle expanded exercise
  const toggleExpand = useCallback((id: string) => {
    setExpandedExercise((prev) => (prev === id ? null : id));
  }, []);

  const handleSave = useCallback(async () => {
    await onSave(exercises);
  }, [exercises, onSave]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-sm font-semibold">
            Exercise Prescription
          </h3>
          <p className="text-muted-foreground text-xs">
            {exercises.length > 0
              ? `${exercises.length} exercise${exercises.length > 1 ? 's' : ''} in this program`
              : 'No exercises added yet'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPickerOpen(!pickerOpen)}
            className={cn(
              'border-input bg-background text-foreground hover:bg-accent inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Exercise
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={exercises.length === 0 || isSaving}
            className={cn(
              'bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              'hover:bg-primary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Program
          </button>
        </div>
      </div>

      {/* Exercise Picker */}
      {pickerOpen && (
        <div className="border-border bg-card rounded-xl border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-foreground text-sm font-medium">
              Select Exercise
            </h4>
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ExercisePicker
            onSelect={handleSelectExercise}
            selectedIds={exercises.map((e) => e.exercise_id)}
          />
        </div>
      )}

      {/* Exercise List */}
      {exercises.length === 0 && !pickerOpen && (
        <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border p-8 text-center">
          <Plus className="text-muted-foreground mb-2 h-8 w-8" />
          <p className="text-foreground text-sm font-medium">
            No exercises yet
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Click &quot;Add Exercise&quot; to start building your program.
          </p>
        </div>
      )}

      {/* Exercise items */}
      {exercises.length > 0 && (
        <div className="space-y-2">
          {exercises.map((ex, index) => {
            const isExpanded = expandedExercise === ex.exercise_id;
            return (
              <div
                key={ex.exercise_id}
                className="border-border bg-card group rounded-xl border transition-all hover:border-primary/30"
              >
                {/* Compact header */}
                <div className="flex items-center gap-3 px-3 py-2.5">
                  {/* Drag handle */}
                  <GripVertical className="text-muted-foreground h-4 w-4 shrink-0 cursor-grab opacity-40" />

                  {/* Order number */}
                  <span className="text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">
                    {index + 1}
                  </span>

                  {/* Exercise info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground truncate text-sm font-medium">
                        {ex.exercise.name}
                      </span>
                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                          DIFFICULTY_COLORS[ex.exercise.difficulty as keyof typeof DIFFICULTY_COLORS] ?? '',
                        )}
                      >
                        {ex.exercise.difficulty}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-xs">
                      <span>
                        {ex.parameters.sets} × {ex.parameters.reps}
                      </span>
                      {ex.parameters.hold_seconds > 0 && (
                        <span>Hold {ex.parameters.hold_seconds}s</span>
                      )}
                      <span>Rest {ex.parameters.rest_seconds}s</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors disabled:opacity-30"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index >= exercises.length - 1}
                      className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpand(ex.exercise_id)}
                      className={cn(
                        'text-muted-foreground hover:text-foreground rounded p-1 transition-colors',
                        isExpanded && 'text-primary',
                      )}
                    >
                      <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-180')} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(index)}
                      className="text-muted-foreground hover:text-destructive rounded p-1 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded parameters */}
                {isExpanded && (
                  <div className="border-t border-border px-3 py-3">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {/* Sets */}
                      <ParamField
                        label="Sets"
                        type="number"
                        value={ex.parameters.sets}
                        onChange={(v) => handleParamChange(index, 'sets', Number(v))}
                        min={1}
                        max={20}
                      />

                      {/* Reps */}
                      <ParamField
                        label="Reps"
                        type="text"
                        value={ex.parameters.reps}
                        onChange={(v) => handleParamChange(index, 'reps', v)}
                      />

                      {/* Hold */}
                      <ParamField
                        label="Hold (seconds)"
                        type="number"
                        value={ex.parameters.hold_seconds}
                        onChange={(v) => handleParamChange(index, 'hold_seconds', Number(v))}
                        min={0}
                        max={300}
                      />

                      {/* Rest */}
                      <ParamField
                        label="Rest (seconds)"
                        type="number"
                        value={ex.parameters.rest_seconds}
                        onChange={(v) => handleParamChange(index, 'rest_seconds', Number(v))}
                        min={0}
                        max={600}
                      />

                      {/* Intensity % */}
                      <ParamField
                        label="Intensity %"
                        type="number"
                        value={ex.parameters.intensity_percent ?? ''}
                        onChange={(v) =>
                          handleParamChange(
                            index,
                            'intensity_percent',
                            v === '' ? null : Number(v),
                          )
                        }
                        min={0}
                        max={100}
                        placeholder="Optional"
                      />

                      {/* RPE */}
                      <ParamField
                        label="RPE (0-10)"
                        type="number"
                        value={ex.parameters.rpe ?? ''}
                        onChange={(v) =>
                          handleParamChange(
                            index,
                            'rpe',
                            v === '' ? null : Number(v),
                          )
                        }
                        min={0}
                        max={10}
                        step={0.5}
                        placeholder="Optional"
                      />

                      {/* Frequency */}
                      <div className="col-span-2">
                        <label className="text-muted-foreground mb-1 block text-[11px] font-medium uppercase tracking-wider">
                          Frequency
                        </label>
                        <select
                          value={ex.parameters.frequency ?? ''}
                          onChange={(e) =>
                            handleParamChange(
                              index,
                              'frequency',
                              e.target.value || null,
                            )
                          }
                          className={cn(
                            'border-input bg-background text-foreground w-full rounded-lg border px-3 py-1.5 text-xs',
                            'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                          )}
                        >
                          <option value="">Not specified</option>
                          <option value="daily">Daily</option>
                          <option value="2x/day">2× / day</option>
                          <option value="3x/day">3× / day</option>
                          <option value="every_other_day">Every other day</option>
                          <option value="3x/week">3× / week</option>
                          <option value="2x/week">2× / week</option>
                          <option value="1x/week">1× / week</option>
                          <option value="as_tolerated">As tolerated</option>
                        </select>
                      </div>

                      {/* Notes */}
                      <div className="col-span-2">
                        <label className="text-muted-foreground mb-1 block text-[11px] font-medium uppercase tracking-wider">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={ex.parameters.notes ?? ''}
                          onChange={(e) =>
                            handleParamChange(
                              index,
                              'notes',
                              e.target.value || null,
                            )
                          }
                          placeholder="e.g., Use slow controlled motion"
                          className={cn(
                            'border-input bg-background text-foreground w-full rounded-lg border px-3 py-1.5 text-xs',
                            'placeholder:text-muted-foreground/60',
                            'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Parameter Field Helper ─────────────────────────────────────────────────

function ParamField({
  label,
  type,
  value,
  onChange,
  min,
  max,
  step,
  placeholder,
}: {
  label: string;
  type: 'number' | 'text';
  value: string | number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-muted-foreground mb-1 block text-[11px] font-medium uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className={cn(
          'border-input bg-background text-foreground w-full rounded-lg border px-3 py-1.5 text-xs',
          'placeholder:text-muted-foreground/60',
          'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
          'transition-colors',
        )}
      />
    </div>
  );
}
