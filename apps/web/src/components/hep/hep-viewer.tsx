'use client';

import {
  Dumbbell,
  Clock,
  RotateCcw,
  Target,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { DIFFICULTY_COLORS, EXERCISE_CATEGORY_OPTIONS } from '@/types/exercise';
import type { HomeExerciseProgram, ProgramExercise } from '@/types/hep';

interface HEPViewerProps {
  program: HomeExerciseProgram;
  className?: string;
}

export function HEPViewer({ program, className }: HEPViewerProps) {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedExercise((prev) => (prev === id ? null : id));
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Program Header */}
      <div className="border-border bg-card rounded-xl border p-5">
        <h2 className="text-foreground text-lg font-bold">{program.title}</h2>
        {program.description && (
          <p className="text-muted-foreground mt-1 text-sm">
            {program.description}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {program.frequency && (
            <div>
              <span className="text-muted-foreground mb-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider">
                <Clock className="h-3 w-3" />
                Frequency
              </span>
              <p className="text-foreground text-sm font-medium capitalize">
                {program.frequency.replace(/_/g, ' ')}
              </p>
            </div>
          )}

          {program.duration_weeks && (
            <div>
              <span className="text-muted-foreground mb-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider">
                <RotateCcw className="h-3 w-3" />
                Duration
              </span>
              <p className="text-foreground text-sm font-medium">
                {program.duration_weeks} weeks
              </p>
            </div>
          )}

          {program.start_date && (
            <div>
              <span className="text-muted-foreground mb-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider">
                <CheckCircle2 className="h-3 w-3" />
                Started
              </span>
              <p className="text-foreground text-sm font-medium">
                {new Date(program.start_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}

          {program.compliance_percent !== null && (
            <div>
              <span className="text-muted-foreground mb-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider">
                <Target className="h-3 w-3" />
                Compliance
              </span>
              <p className="text-foreground text-sm font-medium">
                {program.compliance_percent}%
              </p>
            </div>
          )}
        </div>

        {/* Goal */}
        {program.goal && (
          <div className="mt-4 rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
            <span className="text-muted-foreground mb-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider">
              <Target className="h-3 w-3 text-blue-400" />
              Goal
            </span>
            <p className="text-foreground text-sm">{program.goal}</p>
          </div>
        )}

        {/* Precautions */}
        {program.precautions && (
          <div className="mt-3 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
            <span className="text-muted-foreground mb-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              Precautions
            </span>
            <p className="text-foreground text-sm">{program.precautions}</p>
          </div>
        )}
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
        <h3 className="text-foreground text-sm font-semibold">
          Exercises ({program.exercises?.length ?? 0})
        </h3>

        {(!program.exercises || program.exercises.length === 0) && (
          <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border p-8 text-center">
            <Dumbbell className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-foreground text-sm font-medium">
              No exercises in this program
            </p>
          </div>
        )}

        {program.exercises?.map((pe: ProgramExercise, index: number) => {
          const ex = pe.exercise;
          const isExpanded = expandedExercise === pe.id;
          const categoryInfo = ex
            ? EXERCISE_CATEGORY_OPTIONS.find((c) => c.value === ex.category_slug)
            : null;

          return (
            <div
              key={pe.id}
              className="border-border bg-card rounded-xl border transition-all hover:border-primary/30"
            >
              {/* Header */}
              <button
                type="button"
                onClick={() => toggleExpand(pe.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                {/* Exercise number */}
                <span className="text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">
                  {index + 1}
                </span>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground truncate text-sm font-medium">
                      {ex?.name ?? 'Unknown Exercise'}
                    </span>
                    {ex && (
                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                          DIFFICULTY_COLORS[ex.difficulty as keyof typeof DIFFICULTY_COLORS] ?? '',
                        )}
                      >
                        {ex.difficulty}
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-3 text-xs">
                    <span>
                      {pe.parameters.sets} × {pe.parameters.reps}
                    </span>
                    {pe.parameters.hold_seconds > 0 && (
                      <span>Hold {pe.parameters.hold_seconds}s</span>
                    )}
                    <span>Rest {pe.parameters.rest_seconds}s</span>
                    {categoryInfo && (
                      <span className="flex items-center gap-1">
                        {categoryInfo.icon} {categoryInfo.label}
                      </span>
                    )}
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="text-muted-foreground h-4 w-4" />
                ) : (
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                )}
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Instructions */}
                    <div>
                      <h4 className="text-foreground mb-1 text-xs font-semibold uppercase tracking-wider">
                        Instructions
                      </h4>
                      <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                        {ex?.instructions ?? 'Follow the prescribed parameters.'}
                      </p>
                    </div>

                    {/* Parameters */}
                    <div>
                      <h4 className="text-foreground mb-2 text-xs font-semibold uppercase tracking-wider">
                        Prescription Details
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <ParamDisplay label="Sets" value={String(pe.parameters.sets)} />
                        <ParamDisplay label="Reps" value={pe.parameters.reps} />
                        <ParamDisplay
                          label="Hold"
                          value={pe.parameters.hold_seconds > 0 ? `${pe.parameters.hold_seconds}s` : 'N/A'}
                        />
                        <ParamDisplay
                          label="Rest"
                          value={`${pe.parameters.rest_seconds}s`}
                        />
                        {pe.parameters.intensity_percent !== null && (
                          <ParamDisplay
                            label="Intensity"
                            value={`${pe.parameters.intensity_percent}%`}
                          />
                        )}
                        {pe.parameters.rpe !== null && (
                          <ParamDisplay
                            label="RPE"
                            value={`${pe.parameters.rpe}/10`}
                          />
                        )}
                        {pe.parameters.frequency && (
                          <ParamDisplay
                            label="Frequency"
                            value={pe.parameters.frequency.replace(/_/g, ' ')}
                          />
                        )}
                      </div>

                      {pe.parameters.notes && (
                        <div className="mt-2">
                          <h4 className="text-foreground mb-1 text-[11px] font-medium uppercase tracking-wider">
                            Notes
                          </h4>
                          <p className="text-muted-foreground text-sm italic">
                            {pe.parameters.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Target Muscles */}
                  {(ex as any)?.target_muscles && (
                    <div className="mt-3 flex flex-wrap gap-4">
                      {(ex as any).target_muscles.primary.length > 0 && (
                        <MuscleTag
                          label="Primary"
                          muscles={(ex as any).target_muscles.primary}
                          color="text-primary"
                        />
                      )}
                      {(ex as any).target_muscles.secondary.length > 0 && (
                        <MuscleTag
                          label="Secondary"
                          muscles={(ex as any).target_muscles.secondary}
                          color="text-blue-400"
                        />
                      )}
                    </div>
                  )}

                  {/* Body Regions */}
                  {ex?.body_regions && ex.body_regions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {ex.body_regions.map((region: string) => (
                        <span
                          key={region}
                          className="bg-secondary/10 text-secondary-foreground rounded-md px-2 py-0.5 text-[10px] font-medium capitalize"
                        >
                          {region.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Helper Components ──────────────────────────────────────────────────────

function ParamDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg px-3 py-2">
      <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
        {label}
      </span>
      <span className="text-foreground text-sm font-medium capitalize">
        {value}
      </span>
    </div>
  );
}

function MuscleTag({
  label,
  muscles,
  color,
}: {
  label: string;
  muscles: string[];
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('text-xs font-medium', color)}>{label}:</span>
      <span className="text-muted-foreground text-xs capitalize">
        {muscles.join(', ')}
      </span>
    </div>
  );
}
