'use client';

import { useState } from 'react';
import {
  Search,
  Loader2,
  ClipboardList,
  Clock,
  X,
  ChevronRight,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAssessments } from '@/hooks/use-assessments';
import {
  ASSESSMENT_CATEGORY_OPTIONS,
  BODY_REGION_OPTIONS,
  CATEGORY_COLORS,
} from '@/types/assessment';
import type { AssessmentListItem, AssessmentCategory } from '@/types/assessment';

export default function AssessmentsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AssessmentCategory | ''>('');
  const [bodyRegionFilter, setBodyRegionFilter] = useState('');

  const { data: assessments, isLoading, error } = useAssessments({
    search: search || undefined,
    category: categoryFilter || undefined,
    bodyRegion: bodyRegionFilter || undefined,
  });

  const hasActiveFilters = search || categoryFilter || bodyRegionFilter;

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setBodyRegionFilter('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-foreground text-2xl font-bold">Assessment Library</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Browse standardized outcome measures and functional assessments
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assessments by name..."
            className={cn(
              'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
              'placeholder:text-muted-foreground/60',
              'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
              'transition-colors',
            )}
          />
        </div>

        {/* Category + Body Region */}
        <div className="flex flex-wrap gap-3">
          {/* Category buttons */}
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
            {ASSESSMENT_CATEGORY_OPTIONS.map((cat) => (
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

          {/* Body Region */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground mr-1 text-xs font-medium uppercase tracking-wider">
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
                  {region}
                </option>
              ))}
            </select>
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
          Failed to load assessments. Please try again.
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && assessments && assessments.length === 0 && (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <ClipboardList className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="text-foreground text-lg font-semibold">No assessments found</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {hasActiveFilters
              ? 'Try adjusting your search or filters.'
              : 'No assessments are available yet.'}
          </p>
        </div>
      )}

      {/* Assessment Grid */}
      {!isLoading && !error && assessments && assessments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Assessment Card ─────────────────────────────────────────────────────────

function AssessmentCard({ assessment }: { assessment: AssessmentListItem }) {
  const categoryInfo = ASSESSMENT_CATEGORY_OPTIONS.find(
    (c) => c.value === assessment.category,
  );
  const duration = assessment.estimated_duration_minutes;

  return (
    <Link
      href={`/assessments/${assessment.id}`}
      className={cn(
        'border-border bg-card group relative flex flex-col rounded-xl border p-5 transition-all',
        'hover:border-primary/40 hover:shadow-sm',
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground truncate text-sm font-semibold group-hover:text-primary transition-colors">
            {assessment.name}
          </h3>
          {assessment.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
              {assessment.description}
            </p>
          )}
        </div>
        {categoryInfo && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
              CATEGORY_COLORS[assessment.category],
            )}
          >
            <span>{categoryInfo.icon}</span>
            {categoryInfo.label}
          </span>
        )}
      </div>

      {/* Meta info */}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {duration && (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {duration} min
          </span>
        )}

        {assessment.is_standardized && (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <Activity className="h-3 w-3" />
            Standardized
          </span>
        )}

        {assessment.body_regions && assessment.body_regions.length > 0 && (
          <span className="text-muted-foreground truncate text-xs">
            {assessment.body_regions.slice(0, 2).join(', ')}
            {assessment.body_regions.length > 2 && '...'}
          </span>
        )}
      </div>

      {/* Score range */}
      {assessment.min_score !== null && assessment.max_score !== null && (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
            Score Range
          </span>
          <span className="text-foreground text-xs font-medium">
            {assessment.min_score} – {assessment.max_score}
          </span>
        </div>
      )}

      {/* Hover arrow */}
      <ChevronRight className="text-foreground/0 absolute top-5 right-4 h-4 w-4 transition-colors group-hover:text-foreground/40" />
    </Link>
  );
}
