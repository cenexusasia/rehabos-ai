'use client';

import {
  ArrowLeft,
  Loader2,
  Dumbbell,
  Clock,
  Target,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useExercise } from '@/hooks/use-exercises';
import {
  EXERCISE_CATEGORY_OPTIONS,
  CATEGORY_COLORS,
  DIFFICULTY_COLORS,
} from '@/types/exercise';

export default function ExerciseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: exercise, isLoading, error } = useExercise(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          Exercise not found or failed to load.
        </div>
        <Link
          href="/exercises"
          className="text-muted-foreground hover:text-foreground mt-4 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to exercise library
        </Link>
      </div>
    );
  }

  const categoryInfo = EXERCISE_CATEGORY_OPTIONS.find(
    (c) => c.value === exercise.category_slug,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/exercises"
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to exercise library
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div className="border-border bg-card rounded-xl border p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-foreground text-xl font-bold sm:text-2xl">
                  {exercise.name}
                </h1>
                {categoryInfo && (
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                      CATEGORY_COLORS[exercise.category_slug] ?? '',
                    )}
                  >
                    <span>{categoryInfo.icon}</span>
                    {categoryInfo.label}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    DIFFICULTY_COLORS[exercise.difficulty] ?? '',
                  )}
                >
                  {exercise.difficulty}
                </span>

                <span className="text-muted-foreground text-sm">
                  {exercise.default_sets} × {exercise.default_reps}
                </span>

                {exercise.default_hold_seconds > 0 && (
                  <span className="text-muted-foreground text-sm">
                    Hold {exercise.default_hold_seconds}s
                  </span>
                )}

                {exercise.is_weight_bearing && (
                  <span className="bg-amber-500/10 text-amber-400 border-amber-500/20 rounded-full border px-2 py-0.5 text-xs font-medium">
                    Weight Bearing
                  </span>
                )}

                {exercise.is_plyometric && (
                  <span className="bg-red-500/10 text-red-400 border-red-500/20 rounded-full border px-2 py-0.5 text-xs font-medium">
                    Plyometric
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {exercise.description && (
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              {exercise.description}
            </p>
          )}
        </div>

        {/* Video / Image Placeholder */}
        <div className="border-border bg-card flex aspect-video items-center justify-center rounded-xl border">
          {exercise.video_url ? (
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Video: {exercise.video_url}
              </p>
            </div>
          ) : exercise.image_url ? (
            <img
              src={exercise.image_url}
              alt={exercise.name}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Dumbbell className="text-muted-foreground h-12 w-12" />
              <p className="text-muted-foreground text-sm">
                Video / Image Placeholder
              </p>
            </div>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Instructions */}
          <div className="space-y-6 lg:col-span-2">
            {/* Instructions */}
            <div className="border-border bg-card rounded-xl border p-5">
              <h2 className="text-foreground mb-3 text-sm font-semibold uppercase tracking-wider">
                Instructions
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                {exercise.instructions}
              </p>

              {/* Cueing Points */}
              {exercise.cueing_points && exercise.cueing_points.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-foreground mb-2 text-xs font-semibold uppercase tracking-wider">
                    Cueing Points
                  </h3>
                  <ul className="space-y-1.5">
                    {exercise.cueing_points.map((cue, idx) => (
                      <li
                        key={idx}
                        className="text-muted-foreground flex items-start gap-2 text-sm"
                      >
                        <span className="text-primary mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                        {cue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Target Muscles Diagram Area */}
            <div className="border-border bg-card rounded-xl border p-5">
              <h2 className="text-foreground mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                <Target className="h-4 w-4" />
                Targeted Muscles
              </h2>

              {exercise.target_muscles && (
                <div className="space-y-4">
                  {/* Primary */}
                  {exercise.target_muscles.primary.length > 0 && (
                    <div>
                      <span className="text-primary mb-1.5 block text-xs font-medium uppercase tracking-wider">
                        Primary
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {exercise.target_muscles.primary.map((m) => (
                          <span
                            key={m}
                            className="bg-primary/10 text-primary rounded-md px-2.5 py-1 text-xs font-medium capitalize"
                          >
                            {m.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Secondary */}
                  {exercise.target_muscles.secondary.length > 0 && (
                    <div>
                      <span className="text-blue-400 mb-1.5 block text-xs font-medium uppercase tracking-wider">
                        Secondary
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {exercise.target_muscles.secondary.map((m) => (
                          <span
                            key={m}
                            className="bg-blue-500/10 text-blue-400 rounded-md px-2.5 py-1 text-xs font-medium capitalize"
                          >
                            {m.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stabilizer */}
                  {exercise.target_muscles.stabilizer.length > 0 && (
                    <div>
                      <span className="text-amber-400 mb-1.5 block text-xs font-medium uppercase tracking-wider">
                        Stabilizer
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {exercise.target_muscles.stabilizer.map((m) => (
                          <span
                            key={m}
                            className="bg-amber-500/10 text-amber-400 rounded-md px-2.5 py-1 text-xs font-medium capitalize"
                          >
                            {m.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Muscle diagram placeholder */}
                  <div className="bg-muted/50 mt-4 flex h-48 items-center justify-center rounded-lg">
                    <div className="text-center">
                      <Target className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                      <p className="text-muted-foreground text-xs">
                        Muscle diagram visualization
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Parameters */}
            <div className="border-border bg-card rounded-xl border p-5">
              <h3 className="text-foreground mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                <Clock className="h-4 w-4" />
                Parameters
              </h3>
              <dl className="space-y-3">
                <ParamRow label="Default Sets" value={String(exercise.default_sets)} />
                <ParamRow label="Default Reps" value={exercise.default_reps} />
                {exercise.default_hold_seconds > 0 && (
                  <ParamRow
                    label="Hold Duration"
                    value={`${exercise.default_hold_seconds}s`}
                  />
                )}
                <ParamRow
                  label="Passive"
                  value={exercise.is_passive ? 'Yes' : 'No'}
                />
                <ParamRow
                  label="Weight Bearing"
                  value={exercise.is_weight_bearing ? 'Yes' : 'No'}
                />
                <ParamRow
                  label="Open Chain"
                  value={exercise.is_open_chain ? 'Yes' : 'No'}
                />
                <ParamRow
                  label="Plyometric"
                  value={exercise.is_plyometric ? 'Yes' : 'No'}
                />
              </dl>
            </div>

            {/* Body Regions */}
            {exercise.body_regions && exercise.body_regions.length > 0 && (
              <div className="border-border bg-card rounded-xl border p-5">
                <h3 className="text-foreground mb-3 text-sm font-semibold uppercase tracking-wider">
                  Body Regions
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.body_regions.map((region) => (
                    <span
                      key={region}
                      className="bg-secondary/10 text-secondary-foreground rounded-md px-2.5 py-1 text-xs font-medium capitalize"
                    >
                      {region.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment */}
            {exercise.equipment && exercise.equipment.length > 0 && (
              <div className="border-border bg-card rounded-xl border p-5">
                <h3 className="text-foreground mb-3 text-sm font-semibold uppercase tracking-wider">
                  Equipment
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.equipment.map((eq) => (
                    <span
                      key={eq}
                      className="bg-accent text-accent-foreground rounded-md px-2.5 py-1 text-xs font-medium capitalize"
                    >
                      {eq.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contraindications & Precautions */}
            {(exercise.contraindications?.length > 0 ||
              exercise.precautions?.length > 0) && (
              <div className="border-border bg-card rounded-xl border p-5">
                {(exercise.contraindications?.length ?? 0) > 0 && (
                  <>
                    <h3 className="text-destructive mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                      <AlertTriangle className="h-4 w-4" />
                      Contraindications
                    </h3>
                    <ul className="mb-4 space-y-1">
                      {exercise.contraindications?.map((c, idx) => (
                        <li
                          key={idx}
                          className="text-destructive/80 flex items-start gap-2 text-xs"
                        >
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-current" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {(exercise.precautions?.length ?? 0) > 0 && (
                  <>
                    <h3 className="text-amber-400 mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                      <AlertTriangle className="h-4 w-4" />
                      Precautions
                    </h3>
                    <ul className="space-y-1">
                      {exercise.precautions?.map((p, idx) => (
                        <li
                          key={idx}
                          className="text-amber-400/80 flex items-start gap-2 text-xs"
                        >
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-current" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* Tags */}
            {exercise.tags && exercise.tags.length > 0 && (
              <div className="border-border bg-card rounded-xl border p-5">
                <h3 className="text-foreground mb-3 text-sm font-semibold uppercase tracking-wider">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-accent text-accent-foreground rounded-md px-2 py-0.5 text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-foreground text-sm font-medium capitalize">{value}</dd>
    </div>
  );
}
