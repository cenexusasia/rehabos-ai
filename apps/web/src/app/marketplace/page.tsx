'use client';

import { useState } from 'react';
import {
  Search,
  Download,
  Star,
  TrendingUp,
  Loader2,
  Filter,
  Award,
  ShoppingBag,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useMarketplaceItems, useFeaturedItems, useTrendingItems } from '@/hooks/use-marketplace';
import {
  MARKETPLACE_ITEM_TYPE_OPTIONS,
  MARKETPLACE_CATEGORY_OPTIONS,
  MARKETPLACE_ITEM_TYPE_COLORS,
  LICENSE_BADGE_COLORS,
} from '@/types/marketplace';
import type { MarketplaceItemType, MarketplaceItemCategory } from '@/types/marketplace';

function formatCompactNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<MarketplaceItemType | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceItemCategory | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: items, isLoading, error } = useMarketplaceItems({
    search: search || undefined,
    itemType: selectedType || undefined,
    category: selectedCategory || undefined,
  });

  const { data: featured } = useFeaturedItems();
  const { data: trending } = useTrendingItems();

  const displayItems = items ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Template Marketplace</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse protocols, assessments, exercise templates, and more
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
            showFilters && 'border-primary/30 text-primary',
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search protocols, assessments, exercises..."
          className={cn(
            'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
            'placeholder:text-muted-foreground/60',
            'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
            'transition-colors',
          )}
        />
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 space-y-4 rounded-xl border border-border bg-card p-5">
          {/* Type filter */}
          <div>
            <p className="text-foreground mb-2 text-xs font-medium uppercase tracking-wider">Type</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType('')}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                  selectedType === ''
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                )}
              >
                All Types
              </button>
              {MARKETPLACE_ITEM_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedType(opt.value === selectedType ? '' : opt.value)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                    selectedType === opt.value
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                  )}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div>
            <p className="text-foreground mb-2 text-xs font-medium uppercase tracking-wider">Category</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                  selectedCategory === ''
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                )}
              >
                All Categories
              </button>
              {MARKETPLACE_CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedCategory(opt.value === selectedCategory ? '' : opt.value)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                    selectedCategory === opt.value
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                  )}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured items section */}
      {!search && !selectedType && !selectedCategory && featured && featured.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Award className="text-amber-400 h-5 w-5" />
            <h2 className="text-foreground text-lg font-semibold">Featured</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <MarketplaceCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Trending items section */}
      {!search && !selectedType && !selectedCategory && trending && trending.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-400 h-5 w-5" />
            <h2 className="text-foreground text-lg font-semibold">Trending This Month</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.slice(0, 6).map((item) => (
              <MarketplaceCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* All items */}
      <section>
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          {search || selectedType || selectedCategory
            ? 'Search Results'
            : 'All Templates'}
        </h2>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        )}

        {error && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive mb-6 rounded-lg border px-4 py-3 text-sm">
            Failed to load marketplace items. Please try again.
          </div>
        )}

        {!isLoading && !error && displayItems.length === 0 && (
          <div className="border-border bg-card rounded-xl border p-12 text-center">
            <ShoppingBag className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h2 className="text-foreground text-lg font-semibold">No templates found</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {search
                ? 'Try adjusting your search or filters.'
                : 'The marketplace is being populated. Check back soon!'}
            </p>
          </div>
        )}

        {!isLoading && !error && displayItems.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayItems.map((item) => (
              <MarketplaceCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Marketplace Card Component ─────────────────────────────────────────────

function MarketplaceCard({
  item,
}: {
  item: NonNullable<ReturnType<typeof useMarketplaceItems>['data']>[number];
}) {
  const typeMeta = MARKETPLACE_ITEM_TYPE_OPTIONS.find((o) => o.value === item.item_type);

  return (
    <div className="border-border bg-card hover:border-primary/30 group relative flex cursor-pointer flex-col rounded-xl border p-5 transition-all">
      {/* Badges */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
            MARKETPLACE_ITEM_TYPE_COLORS[item.item_type],
          )}
        >
          {typeMeta?.icon} {typeMeta?.label ?? item.item_type}
        </span>
        <div className="flex gap-1.5">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
              LICENSE_BADGE_COLORS[item.license],
            )}
          >
            {item.license === 'free' ? 'Free' : item.license === 'premium' ? 'Premium' : 'Org'}
          </span>
          {item.is_official && (
            <span className="border-blue-500/20 bg-blue-500/10 text-blue-400 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium">
              Official
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-sm font-medium transition-colors">
        {item.name}
      </h3>
      <p className="text-muted-foreground mt-1 line-clamp-2 flex-1 text-xs leading-relaxed">
        {item.description}
      </p>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-accent/50 text-muted-foreground rounded-md px-1.5 py-0.5 text-[10px]"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-muted-foreground text-[10px]">+{item.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Download className="h-3 w-3" />
            {formatCompactNumber(item.download_count)}
          </span>
          {item.rating !== null && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400" />
              {item.rating.toFixed(1)}
            </span>
          )}
        </div>
        <span className="text-muted-foreground text-[10px]">
          {formatDate(item.created_at)}
        </span>
      </div>
    </div>
  );
}
