'use client';

import { useState } from 'react';
import {
  Download,
  Star,
  ChevronLeft,
  Package,
  Clock,
  User,
  Layers,
  Tags,
  FileText,
  CheckCircle2,
  Shield,
  AlertCircle,
  ExternalLink,
  Image,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { MarketplaceItem } from '@/types/marketplace';
import {
  MARKETPLACE_ITEM_TYPE_OPTIONS,
  MARKETPLACE_ITEM_TYPE_COLORS,
  LICENSE_BADGE_COLORS,
} from '@/types/marketplace';

// ── Extended type for optional API fields ───────────────────────────────────

interface MarketplaceItemExtended extends MarketplaceItem {
  thumbnail_url?: string;
  long_description?: string;
  install_instructions?: string;
}

// ── Props ───────────────────────────────────────────────────────────────────

interface MarketplaceDetailProps {
  item: MarketplaceItem;
  relatedItems?: MarketplaceItem[];
  onInstall?: (item: MarketplaceItem) => void;
  onBack?: () => void;
  className?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return count.toString();
}

// ── Rating Stars (large) ────────────────────────────────────────────────────

function RatingDisplay({ rating, count }: { rating: number | null; count?: number }) {
  if (rating === null) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground/50 text-sm">No ratings yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : i < rating
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-muted-foreground/20',
            )}
          />
        ))}
      </span>
      <span className="text-foreground text-sm font-medium">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-muted-foreground text-sm">({count} reviews)</span>
      )}
    </div>
  );
}

// ── Dependency Badge ────────────────────────────────────────────────────────

function DependencyBadge({ name, version }: { name: string; version?: string }) {
  return (
    <div className="border-border bg-accent/30 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs">
      <Package className="text-muted-foreground h-3 w-3" />
      <span className="text-foreground font-medium">{name}</span>
      {version && <span className="text-muted-foreground">v{version}</span>}
    </div>
  );
}

// ── Screenshot Thumbnail ────────────────────────────────────────────────────

function ScreenshotThumbnail({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="border-border bg-card group relative aspect-video overflow-hidden rounded-lg border">
      {!loaded && !error && (
        <div className="flex h-full items-center justify-center">
          <Image className="text-muted-foreground/30 h-8 w-8 animate-pulse" />
        </div>
      )}
      {error ? (
        <div className="flex h-full flex-col items-center justify-center gap-1">
          <Image className="text-muted-foreground/30 h-6 w-6" />
          <span className="text-muted-foreground/40 text-[10px]">Failed to load</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

// ── Version History Row ─────────────────────────────────────────────────────

interface VersionEntry {
  version: string;
  date: string;
  notes: string;
}

function VersionRow({ entry }: { entry: VersionEntry }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="border-border bg-card mt-0.5 flex h-7 w-16 shrink-0 items-center justify-center rounded-md border text-[10px] font-medium text-muted-foreground">
        v{entry.version}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[10px]">{formatDate(entry.date)}</span>
        </div>
        {entry.notes && (
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{entry.notes}</p>
        )}
      </div>
    </div>
  );
}

// ── Review Card ─────────────────────────────────────────────────────────────

interface ReviewEntry {
  id: string;
  author_name: string;
  rating: number;
  comment: string;
  date: string;
}

function ReviewCard({ review }: { review: ReviewEntry }) {
  return (
    <div className="border-border border-b py-4 last:border-b-0">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-accent text-accent-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium">
            {review.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">{review.author_name}</p>
            <p className="text-muted-foreground text-[10px]">{formatDate(review.date)}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs">
          <Star className="fill-amber-400 h-3 w-3 text-amber-400" />
          {review.rating.toFixed(1)}
        </span>
      </div>
      {review.comment && (
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────

export function MarketplaceDetail({
  item: _item,
  relatedItems = [],
  onInstall,
  onBack,
  className,
}: MarketplaceDetailProps) {
  const item = _item as MarketplaceItemExtended;
  const typeInfo = MARKETPLACE_ITEM_TYPE_OPTIONS.find((o) => o.value === item.item_type);
  const typeColors = MARKETPLACE_ITEM_TYPE_COLORS[item.item_type] ?? 'border-muted bg-muted text-muted-foreground';
  const licenseColors = LICENSE_BADGE_COLORS[item.license] ?? 'border-muted bg-muted text-muted-foreground';
  const isFree = item.license === 'free';

  // Mock data for sections that would come from API
  const screenshots: string[] = [];
  const versionHistory: VersionEntry[] = [
    { version: item.version, date: item.updated_at, notes: 'Current version' },
  ];
  const dependencies: { name: string; version?: string }[] = [];
  const reviews: ReviewEntry[] = [];

  return (
    <div className={cn('space-y-8', className)}>
      {/* Back button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Marketplace
        </button>
      )}

      {/* Hero section */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Thumbnail / Screenshots */}
        <div className="space-y-3 lg:col-span-3">
          <div className="border-border bg-card relative flex h-64 items-center justify-center overflow-hidden rounded-xl border">
            {screenshots.length > 0 ? (
              <img
                src={screenshots[0]}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">{typeInfo?.icon ?? '📋'}</span>
                <span className="text-muted-foreground text-sm font-medium">No preview available</span>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {screenshots.length > 1 && (
            <div className="flex gap-2">
              {screenshots.map((src, idx) => (
                <ScreenshotThumbnail key={idx} src={src} alt={`Screenshot ${idx + 1}`} />
              ))}
            </div>
          )}
        </div>

        {/* Info sidebar */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title + badges */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', typeColors)}>
                {typeInfo?.label ?? item.item_type}
              </span>
              <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', licenseColors)}>
                {item.license === 'free' ? 'Free' : item.license === 'premium' ? 'Premium' : 'Organization'}
              </span>
              {item.is_official && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                  <Shield className="h-3 w-3" />
                  Official
                </span>
              )}
            </div>
            <h1 className="text-foreground text-2xl font-bold">{item.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm">by {item.author_name}</p>
          </div>

          {/* Rating */}
          <RatingDisplay rating={item.rating} count={reviews.length} />

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border-border bg-card rounded-lg border p-3">
              <Download className="text-muted-foreground mb-1 h-4 w-4" />
              <p className="text-foreground text-lg font-bold">{formatCount(item.download_count)}</p>
              <p className="text-muted-foreground text-[10px]">Downloads</p>
            </div>
            <div className="border-border bg-card rounded-lg border p-3">
              <Clock className="text-muted-foreground mb-1 h-4 w-4" />
              <p className="text-foreground text-lg font-bold">v{item.version}</p>
              <p className="text-muted-foreground text-[10px]">Latest version</p>
            </div>
          </div>

          {/* Install button */}
          <button
            type="button"
            onClick={() => onInstall?.(item)}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors',
              isFree
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border-border text-foreground border hover:bg-accent',
            )}
          >
            <Download className="h-4 w-4" />
            {isFree ? 'Install Free' : `Get Premium — ${item.license === 'organization' ? 'Contact Sales' : 'View Pricing'}`}
          </button>

          {/* Meta info */}
          <div className="border-border rounded-xl border">
            <div className="divide-border divide-y text-sm">
              <div className="flex items-center gap-3 px-4 py-3">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">Author</span>
                <span className="text-foreground ml-auto font-medium">{item.author_name}</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <Layers className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">Category</span>
                <span className="text-foreground ml-auto font-medium capitalize">{item.category}</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <Tags className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">Type</span>
                <span className="text-foreground ml-auto font-medium">{typeInfo?.label ?? item.item_type}</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">Updated</span>
                <span className="text-foreground ml-auto font-medium">{formatDate(item.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-border bg-accent/30 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content sections */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Description */}
          <section>
            <h2 className="text-foreground mb-3 flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5" />
              Description
            </h2>
            <div className="text-muted-foreground text-sm leading-relaxed">
              <p>{item.description}</p>
              {item.long_description && (
                <div className="mt-4 space-y-2">
                  {item.long_description.split('\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Installation instructions */}
          <section>
            <h2 className="text-foreground mb-3 flex items-center gap-2 text-lg font-semibold">
              <Download className="h-5 w-5" />
              Installation
            </h2>
            <div className="border-border bg-card rounded-xl border p-4">
              {item.install_instructions ? (
                <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {item.install_instructions}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-400 h-5 w-5 shrink-0" />
                  <p className="text-muted-foreground text-sm">
                    This item can be installed with one click. Click the <strong>Install</strong> button above to add it to your account.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Version history */}
          <section>
            <h2 className="text-foreground mb-3 flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              Version History
            </h2>
            <div className="border-border bg-card rounded-xl border">
              <div className="divide-border divide-y px-4">
                {versionHistory.length > 0 ? (
                  versionHistory.map((entry, idx) => (
                    <VersionRow key={idx} entry={entry} />
                  ))
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-muted-foreground text-sm">No version history available.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Reviews / Ratings */}
          <section>
            <h2 className="text-foreground mb-3 flex items-center gap-2 text-lg font-semibold">
              <Star className="h-5 w-5" />
              Reviews & Ratings
            </h2>
            <div className="border-border bg-card rounded-xl border">
              {reviews.length > 0 ? (
                <div className="divide-border divide-y px-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <Star className="text-muted-foreground/30 mx-auto mb-2 h-8 w-8" />
                  <p className="text-foreground mb-1 text-sm font-medium">No reviews yet</p>
                  <p className="text-muted-foreground mx-auto max-w-xs text-xs">
                    Be the first to review this item and help other clinicians discover it.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dependencies */}
          <section>
            <h3 className="text-foreground mb-2 text-sm font-semibold">Dependencies</h3>
            <div className="space-y-1.5">
              {dependencies.length > 0 ? (
                dependencies.map((dep, idx) => (
                  <DependencyBadge key={idx} name={dep.name} version={dep.version} />
                ))
              ) : (
                <p className="text-muted-foreground text-xs">No dependencies required.</p>
              )}
            </div>
          </section>

          {/* Related items */}
          {relatedItems.length > 0 && (
            <section>
              <h3 className="text-foreground mb-2 text-sm font-semibold">Related Items</h3>
              <div className="space-y-2">
                {relatedItems.slice(0, 4).map((related) => (
                  <Link
                    key={related.id}
                    href={`/dashboard/marketplace/${related.id}`}
                    className="border-border bg-card hover:border-primary/30 group flex items-center gap-3 rounded-lg border p-3 transition-all"
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg',
                        MARKETPLACE_ITEM_TYPE_COLORS[related.item_type]?.split(' ').filter((c) => c.startsWith('bg-')).join(' ') ?? 'bg-muted',
                      )}
                    >
                      {MARKETPLACE_ITEM_TYPE_OPTIONS.find((o) => o.value === related.item_type)?.icon ?? '📋'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-xs font-medium group-hover:text-primary transition-colors">
                        {related.name}
                      </p>
                      <p className="text-muted-foreground truncate text-[10px]">
                        by {related.author_name}
                      </p>
                    </div>
                    <ExternalLink className="text-muted-foreground h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Report */}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
          >
            <AlertCircle className="h-3 w-3" />
            Report this item
          </button>
        </div>
      </div>
    </div>
  );
}
