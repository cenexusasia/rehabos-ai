'use client';

import { useState, useMemo } from 'react';
import { Search, X, ArrowUpDown, Package, Sparkles, Clock, Star, TrendingUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { MarketplaceItem } from '@/types/marketplace';
import { MARKETPLACE_CATEGORY_OPTIONS } from '@/types/marketplace';
import { MarketplaceCard } from './marketplace-card';

// ── Types ───────────────────────────────────────────────────────────────────

type SortOption = 'popular' | 'newest' | 'rating' | 'name';

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'popular', label: 'Most Popular', icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { value: 'newest', label: 'Newest', icon: <Clock className="h-3.5 w-3.5" /> },
  { value: 'rating', label: 'Highest Rated', icon: <Star className="h-3.5 w-3.5" /> },
  { value: 'name', label: 'Name (A-Z)', icon: <ArrowUpDown className="h-3.5 w-3.5" /> },
];

interface MarketplaceGridProps {
  items: MarketplaceItem[];
  loading?: boolean;
  onInstall?: (item: MarketplaceItem) => void;
  onPreview?: (item: MarketplaceItem) => void;
  pageSize?: number;
  className?: string;
}

// ── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16">
      <div className="border-border bg-card mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border">
        <Package className="text-muted-foreground h-7 w-7" />
      </div>
      <h3 className="text-foreground mb-1 text-base font-semibold">
        {hasActiveFilters ? 'No matching items found' : 'Marketplace is empty'}
      </h3>
      <p className="text-muted-foreground mb-4 max-w-xs text-center text-sm">
        {hasActiveFilters
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : 'No marketplace items are available yet. Check back later or publish your own content.'}
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <X className="h-4 w-4" />
          Clear all filters
        </button>
      )}
    </div>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────

export function MarketplaceGrid({
  items,
  loading = false,
  onInstall,
  onPreview,
  pageSize = 12,
  className,
}: MarketplaceGridProps) {
  // ── State ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Filtered + Sorted ───────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.author_name.toLowerCase().includes(q) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'rating':
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [items, search, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const hasActiveFilters = !!(search || selectedCategory);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  // Reset page when filters change
  useMemo(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // ── Loading State ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Skeleton filter bar */}
        <div className="flex items-center gap-2">
          <div className="bg-muted h-10 flex-1 animate-pulse rounded-lg" />
          <div className="bg-muted h-10 w-10 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-border bg-card animate-pulse rounded-xl border">
              <div className="bg-muted h-36 w-full rounded-t-xl" />
              <div className="space-y-3 p-4">
                <div className="bg-muted h-4 w-3/4 rounded" />
                <div className="bg-muted h-3 w-full rounded" />
                <div className="bg-muted h-3 w-2/3 rounded" />
                <div className="flex items-center justify-between pt-2">
                  <div className="bg-muted h-3 w-20 rounded" />
                  <div className="bg-muted h-8 w-20 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search + Sort Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search marketplace..."
            className={cn(
              'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
              'placeholder:text-muted-foreground/60',
              'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
              'transition-colors',
            )}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortOption);
              setCurrentPage(1);
            }}
            className={cn(
              'border-input bg-background text-foreground w-[140px] appearance-none rounded-lg border py-2.5 pr-8 pl-3 text-xs font-medium',
              'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
              'transition-colors',
            )}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ArrowUpDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2" />
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('');
            setCurrentPage(1);
          }}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
            !selectedCategory
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
          )}
        >
          <Sparkles className="h-3 w-3" />
          All
        </button>
        {MARKETPLACE_CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => {
              setSelectedCategory(selectedCategory === cat.value ? '' : cat.value);
              setCurrentPage(1);
            }}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
              selectedCategory === cat.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
            )}
          >
            <span className="text-xs">{cat.icon}</span>
            {cat.label}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground ml-1 inline-flex items-center gap-1 text-xs font-medium transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-muted-foreground text-xs">
        Showing {paginatedItems.length} of {filteredItems.length} items
      </p>

      {/* Grid */}
      {paginatedItems.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedItems.map((item) => (
            <MarketplaceCard
              key={item.id}
              item={item}
              onInstall={onInstall}
              onPreview={onPreview}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-muted-foreground text-xs">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={cn(
                'inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                currentPage === 1
                  ? 'border-border text-muted-foreground/40 cursor-not-allowed'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
              const pageOffset = Math.max(0, Math.min(currentPage - 3, totalPages - 5));
              const pageNum = idx + 1 + pageOffset;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors',
                    pageNum === currentPage
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                'inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                currentPage === totalPages
                  ? 'border-border text-muted-foreground/40 cursor-not-allowed'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
