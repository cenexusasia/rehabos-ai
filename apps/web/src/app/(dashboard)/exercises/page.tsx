'use client';

import { useState } from 'react';
import {
  Search,
  Loader2,
  Dumbbell,
  X,
  List,
  LayoutGrid,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useExercises } from '@/hooks/use-exercises';
import { ExerciseCard } from '@/components/exercises/exercise-card';
import {
  EXERCISE_CATEGORY_OPTIONS,
  BODY_REGION_OPTIONS,
  DIFFICULTY_OPTIONS,
  CATEGORY_COLORS,
  DIFFICULTY_COLORS,
} from '@/types/exercise';
import type { ExerciseDifficulty } from '@/types/exercise';

export default function ExerciseLibraryPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [bodyRegionFilter, setBodyRegionFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<ExerciseDifficulty | ''>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: exercises, isLoading, error } = useExercises({
    search: search || undefined,
    category: categoryFilter || undefined,
    bodyRegion: bodyRegionFilter || undefined,
    difficulty: difficultyFilter || undefined,
  });

  const hasActiveFilters = search || categoryFilter || bodyRegionFilter || difficultyFilter;

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setBodyRegionFilter('');
    setDifficultyFilter('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-foreground text-2xl font-bold">Exercise Library</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Browse rehabilitation exercises by category, body region, and difficulty
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search + View toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises by name..."
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
                'placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'transition-colors',
              )}
            />
          </div>
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground mr-1 text-xs font-medium uppercase tracking-wider">
            Category:
          </span>
          <button
            type="button"
            onClick={() => setCategoryFilter('')}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
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
                'inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                categoryFilter === cat.value
                  ? CATEGORY_COLORS[cat.value]
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Body region + Difficulty */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Body Region */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Region:
            </span>
            <select
              value={bodyRegionFilter}
              onChange={(e) => setBodyRegionFilter(e.target.value)}
              className={cn(
                'border-input bg-background text-foreground rounded-lg border py-1.5 pl-3 pr-8 text-xs font-medium',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'appearance-none transition-colors',
              )}
            >
              <option value="">All Regions</option>
              {BODY_REGION_OPTIONS.map((region) => (
                <option key={region} value={region}>
                  {region.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Difficulty:
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setDifficultyFilter('')}
                className={cn(
                  'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
                  !difficultyFilter
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                All
              </button>
              {DIFFICULTY_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() =>
                    setDifficultyFilter(
                      difficultyFilter === d.value ? '' : d.value,
                    )
                  }
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
                    difficultyFilter === d.value
                      ? DIFFICULTY_COLORS[d.value]
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium transition-colors"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-6 rounded-lg border px-4 py-3 text-sm">
          Failed to load exercises. Please try again.
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && exercises && exercises.length === 0 && (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <Dumbbell className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="text-foreground text-lg font-semibold">
            {hasActiveFilters ? 'No exercises found' : 'No exercises available'}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {hasActiveFilters
              ? 'Try adjusting your search or filters.'
              : 'The exercise library is being populated.'}
          </p>
        </div>
      )}

      {/* Exercise Grid / List */}
      {!isLoading && !error && exercises && exercises.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'space-y-2'
          }
        >
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              variant={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
