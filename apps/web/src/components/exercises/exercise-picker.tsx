'use client';

import { useState, useMemo } from 'react';
import { Search, X, Plus, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useExercises } from '@/hooks/use-exercises';
import {
  EXERCISE_CATEGORY_OPTIONS,
  DIFFICULTY_COLORS,
  CATEGORY_COLORS,
} from '@/types/exercise';
import type { ExerciseListItem } from '@/types/exercise';

interface ExercisePickerProps {
  onSelect: (exercise: ExerciseListItem) => void;
  selectedIds: string[];
  className?: string;
}

export function ExercisePicker({ onSelect, selectedIds, className }: ExercisePickerProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: exercises, isLoading } = useExercises({
    search: search || undefined,
    category: categoryFilter || undefined,
  });

  const filteredExercises = useMemo(() => {
    if (!exercises) return [];
    return exercises.filter((ex) => !selectedIds.includes(ex.id));
  }, [exercises, selectedIds]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className={cn(
            'border-input bg-background text-foreground w-full rounded-lg border py-2 pr-3 pl-10 text-sm',
            'placeholder:text-muted-foreground/60',
            'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
            'transition-colors',
          )}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCategoryFilter('')}
          className={cn(
            'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
            !categoryFilter
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
          )}
        >
          All
        </button>
        {EXERCISE_CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() =>
              setCategoryFilter(categoryFilter === cat.value ? '' : cat.value)
            }
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
              categoryFilter === cat.value
                ? CATEGORY_COLORS[cat.value]
                : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
            )}
          >
            <span className="text-[10px]">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="max-h-80 space-y-1 overflow-y-auto rounded-lg border border-border bg-card p-1">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-5 w-5 animate-spin" />
          </div>
        )}

        {!isLoading && filteredExercises.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground text-sm">
              {search || categoryFilter
                ? 'No exercises match your filters.'
                : 'All exercises have been added.'}
            </p>
          </div>
        )}

        {!isLoading &&
          filteredExercises.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              onClick={() => onSelect(exercise)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'group',
              )}
            >
              {/* Icon */}
              <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                {exercise.image_url ? (
                  <img
                    src={exercise.image_url}
                    alt=""
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground text-xs font-bold uppercase">
                    {exercise.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-foreground truncate text-sm font-medium">
                    {exercise.name}
                  </span>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                      DIFFICULTY_COLORS[exercise.difficulty] ?? '',
                    )}
                  >
                    {exercise.difficulty}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  {exercise.body_regions?.slice(0, 2).map((r) => (
                    <span key={r}>{r.replace(/_/g, ' ')}</span>
                  ))}
                  {exercise.equipment && exercise.equipment.length > 0 && (
                    <span className="text-muted-foreground/60">
                      · {exercise.equipment.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Add button */}
              <Plus className="text-primary h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
      </div>
    </div>
  );
}
