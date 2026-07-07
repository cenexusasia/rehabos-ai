'use client';

import { useState } from 'react';
import { Download, Star, Eye, Crown } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { MarketplaceItem, MarketplaceLicense } from '@/types/marketplace';
import {
  MARKETPLACE_ITEM_TYPE_OPTIONS,
  MARKETPLACE_ITEM_TYPE_COLORS,
  LICENSE_BADGE_COLORS,
} from '@/types/marketplace';

// ── Extended type for optional API fields ───────────────────────────────────

interface MarketplaceItemExtended extends MarketplaceItem {
  thumbnail_url?: string;
}

// ── Props ───────────────────────────────────────────────────────────────────

interface MarketplaceCardProps {
  item: MarketplaceItem;
  onInstall?: (item: MarketplaceItem) => void;
  onPreview?: (item: MarketplaceItem) => void;
  className?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return count.toString();
}

function getLicenseLabel(license: MarketplaceLicense): string {
  switch (license) {
    case 'free':
      return 'Free';
    case 'premium':
      return 'Premium';
    case 'organization':
      return 'Org';
  }
}

// ── Rating Stars ────────────────────────────────────────────────────────────

function RatingStars({ rating, size = 'sm' }: { rating: number | null; size?: 'sm' | 'md' }) {
  const starSize = size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3';
  if (rating === null) {
    return (
      <span className="text-muted-foreground/50 inline-flex items-center gap-0.5 text-[10px]">
        {'—'}
      </span>
    );
  }

  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5" title={`${rating.toFixed(1)} / 5`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`full-${i}`} className={cn('fill-amber-400 text-amber-400', starSize)} />
      ))}
      {hasHalf && (
        <span className={cn('relative', starSize)}>
          <Star className={cn('absolute inset-0 text-amber-400', starSize)} />
          <Star className={cn('fill-amber-400 text-amber-400', starSize)} style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`empty-${i}`} className={cn('text-muted-foreground/20', starSize)} />
      ))}
      <span className="text-muted-foreground ml-0.5 text-[10px]">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

// ── Thumbnail ───────────────────────────────────────────────────────────────

function MarketplaceThumbnail({ item }: { item: MarketplaceItemExtended }) {
  // Use URL from item if available, otherwise show icon fallback
  if (item.thumbnail_url) {
    return (
      <div className="relative h-36 w-full overflow-hidden">
        <img
          src={item.thumbnail_url}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  const typeInfo = MARKETPLACE_ITEM_TYPE_OPTIONS.find((o) => o.value === item.item_type);
  const typeColors = MARKETPLACE_ITEM_TYPE_COLORS[item.item_type] ?? 'border-muted bg-muted text-muted-foreground';

  return (
    <div
      className={cn(
        'flex h-36 w-full items-center justify-center transition-colors duration-300',
        typeColors.split(' ').filter((c) => c.startsWith('bg-') || c.startsWith('border-')).join(' '),
      )}
    >
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-3xl">{typeInfo?.icon ?? '📋'}</span>
        <span className="text-muted-foreground text-[10px] font-medium">
          {typeInfo?.label ?? item.item_type.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────

export function MarketplaceCard({
  item,
  onInstall,
  onPreview,
  className,
}: MarketplaceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const typeColors = MARKETPLACE_ITEM_TYPE_COLORS[item.item_type] ?? 'border-muted bg-muted text-muted-foreground';
  const licenseColors = LICENSE_BADGE_COLORS[item.license] ?? 'border-muted bg-muted text-muted-foreground';
  const isFree = item.license === 'free';

  // Shared inner content to avoid duplication between link and standalone variants
  const cardContent = (
    <>
      {/* Thumbnail */}
      <div className="relative">
        <MarketplaceThumbnail item={item} />

        {/* Category badge */}
        <span
          className={cn(
            'absolute top-2 left-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
            typeColors,
          )}
        >
          {item.category}
        </span>

        {/* License badge */}
        <span
          className={cn(
            'absolute top-2 right-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
            licenseColors,
          )}
        >
          {getLicenseLabel(item.license)}
        </span>

        {/* Official badge */}
        {item.is_official && (
          <span className="absolute right-2 bottom-2 inline-flex items-center gap-0.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
            <Crown className="h-2.5 w-2.5" />
            Official
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Title */}
        <div className="min-w-0">
          <h3 className="text-foreground truncate text-sm font-semibold">{item.name}</h3>
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Author + Rating */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground truncate text-[10px] font-medium">
            by {item.author_name}
          </span>
          <RatingStars rating={item.rating} size="sm" />
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between border-t border-border pt-2">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Download className="h-3 w-3" />
              {formatCount(item.download_count)}
            </span>
            <span>v{item.version}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {onPreview && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPreview(item);
                }}
                className="hover:bg-accent text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
                title="Preview"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onInstall?.(item);
              }}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                isFree
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border-border text-muted-foreground hover:text-foreground border hover:bg-accent',
              )}
            >
              <Download className="h-3 w-3" />
              {isFree ? 'Install' : 'Preview'}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        'border-border bg-card group relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all',
        'hover:border-primary/30 hover:shadow-md',
        isHovered && 'border-primary/30',
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {onInstall || onPreview ? (
        <div>{cardContent}</div>
      ) : (
        <Link href={`/dashboard/marketplace/${item.id}`}>{cardContent}</Link>
      )}
    </div>
  );
}
