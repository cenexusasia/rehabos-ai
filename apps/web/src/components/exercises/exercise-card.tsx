'use client';

import { Dumbbell, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { DIFFICULTY_COLORS, CATEGORY_COLORS, EXERCISE_CATEGORY_OPTIONS } from '@/types/exercise';
import type { ExerciseListItem } from '@/types/exercise';

interface ExerciseCardProps {
  exercise: ExerciseListItem;
  className?: string;
  variant?: 'grid' | 'list';
}

export function ExerciseCard({ exercise, className, variant = 'grid' }: ExerciseCardProps) {
  const categoryInfo = EXERCISE_CATEGORY_OPTIONS.find(
    (c) => c.value === exercise.category_slug,
  );

  const isGrid = variant === 'grid';

  return (
    <Link
      href={`/exercises/${exercise.id}`}
      className={cn(
        'border-border bg-card group relative flex transition-all',
        isGrid
          ? 'flex-col rounded-xl border p-4 hover:border-primary/40 hover:shadow-sm'
          : 'items-center gap-4 rounded-lg border p-3 hover:border-primary/30',
        className,
      )}
    >
      {/* Image / Icon Placeholder */}
      <div
        className={cn(
          'bg-muted flex shrink-0 items-center justify-center overflow-hidden',
          isGrid ? 'mb-3 h-32 w-full rounded-lg' : 'h-14 w-14 rounded-lg',
        )}
      >
        {exercise.image_url ? (
          <img
            src={exercise.image_url}
            alt={exercise.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Dumbbell className="text-muted-foreground h-6 w-6" />
        )}
      </div>

      {/* Content */}
      <div className={cn('flex min-w-0 flex-1 flex-col', !isGrid && 'flex-1')}>
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              'text-foreground font-semibold group-hover:text-primary transition-colors truncate',
              isGrid ? 'text-sm' : 'text-sm',
            )}
          >
            {exercise.name}
          </h3>
          {isGrid && categoryInfo && (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                CATEGORY_COLORS[exercise.category_slug] ?? '',
              )}
            >
              {categoryInfo.icon}
            </span>
          )}
        </div>

        {/* Difficulty badge */}
        <div className={cn('flex items-center gap-2', isGrid ? 'mt-1.5' : 'mt-0.5')}>
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
              DIFFICULTY_COLORS[exercise.difficulty] ?? '',
            )}
          >
            {exercise.difficulty}
          </span>

          {!isGrid && categoryInfo && (
            <span className="text-muted-foreground text-[10px] font-medium">
              {categoryInfo.label}
            </span>
          )}
        </div>

        {/* Body region tags */}
        {isGrid && exercise.body_regions && exercise.body_regions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {exercise.body_regions.slice(0, 2).map((region) => (
              <span
                key={region}
                className="bg-secondary/10 text-secondary-foreground rounded-md px-1.5 py-0.5 text-[10px] font-medium"
              >
                {region.replace(/_/g, ' ')}
              </span>
            ))}
            {exercise.body_regions.length > 2 && (
              <span className="text-muted-foreground text-[10px]">
                +{exercise.body_regions.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Equipment tags */}
        {exercise.equipment && exercise.equipment.length > 0 && (
          <div
            className={cn(
              'text-muted-foreground flex flex-wrap gap-1',
              isGrid ? 'mt-2' : 'mt-1',
            )}
          >
            {exercise.equipment.slice(0, 2).map((eq) => (
              <span key={eq} className="text-[10px] capitalize">
                {eq}
                {exercise.equipment.length > 1 ? ',' : ''}
              </span>
            ))}
          </div>
        )}

        {!isGrid && (
          <div className="mt-1 flex flex-wrap gap-1">
            {exercise.body_regions?.slice(0, 2).map((region) => (
              <span
                key={region}
                className="bg-secondary/10 text-secondary-foreground rounded-md px-1.5 py-0.5 text-[10px] font-medium"
              >
                {region.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Arrow */}
      {isGrid && (
        <ChevronRight className="text-foreground/0 absolute top-4 right-4 h-3.5 w-3.5 transition-colors group-hover:text-foreground/40" />
      )}
    </Link>
  );
}
