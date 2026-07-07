'use client';

import { useState, useCallback } from 'react';
import {
  Upload,
  X,
  Image,
  Plus,
  Tags,
  DollarSign,
  CheckCircle2,
  Eye,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type {
  MarketplaceItemType,
  MarketplaceItemCategory,
  MarketplaceLicense,
} from '@/types/marketplace';
import {
  MARKETPLACE_ITEM_TYPE_OPTIONS,
  MARKETPLACE_CATEGORY_OPTIONS,
} from '@/types/marketplace';

// ── Types ───────────────────────────────────────────────────────────────────

interface PublishFormData {
  name: string;
  description: string;
  item_type: MarketplaceItemType;
  category: MarketplaceItemCategory;
  license: MarketplaceLicense;
  version: string;
  price: string;
  tags: string[];
  acceptTerms: boolean;
}

interface PublishFormProps {
  onSubmit?: (data: PublishFormData & { screenshots: File[] }) => Promise<void>;
  className?: string;
}

// ── Tag Input ───────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');

  const addTag = useCallback(() => {
    const tag = input.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput('');
  }, [input, tags, onChange]);

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      const lastTag = tags[tags.length - 1];
      if (lastTag !== undefined) removeTag(lastTag);
    }
  };

  return (
    <div className="border-input bg-background focus-within:border-primary focus-within:ring-primary flex flex-wrap items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors focus-within:ring-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="border-border bg-accent/30 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
        >
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="hover:text-foreground text-muted-foreground">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? 'Type and press Enter to add tags...' : ''}
        className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
      />
    </div>
  );
}

// ── Screenshot Upload Area ──────────────────────────────────────────────────

function ScreenshotUpload({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    onChange([...files, ...dropped].slice(0, 10)); // Max 10 screenshots
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'));
    onChange([...files, ...selected].slice(0, 10));
  };

  const removeFile = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'border-border bg-card flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors',
          dragOver && 'border-primary bg-primary/5',
        )}
        onClick={() => document.getElementById('screenshot-input')?.click()}
      >
        <Upload className={cn('h-6 w-6', dragOver ? 'text-primary' : 'text-muted-foreground')} />
        <div className="text-center">
          <p className="text-foreground text-sm font-medium">
            {dragOver ? 'Drop images here' : 'Upload screenshots'}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            PNG, JPG or WebP · Max 10 images
          </p>
        </div>
      </div>
      <input
        id="screenshot-input"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {files.map((file, idx) => (
            <div key={idx} className="group relative aspect-video overflow-hidden rounded-lg border border-border">
              <img
                src={URL.createObjectURL(file)}
                alt={`Screenshot ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Preview Modal ───────────────────────────────────────────────────────────

function PreviewModal({
  data,
  onClose,
}: {
  data: Partial<PublishFormData>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-background max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border shadow-2xl">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-foreground text-lg font-semibold">Preview</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <span className="border-border bg-accent/30 text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
              {MARKETPLACE_ITEM_TYPE_OPTIONS.find((o) => o.value === data.item_type)?.label ?? data.item_type}
            </span>
            <span className="border-border bg-accent/30 text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
              {data.license === 'free' ? 'Free' : `$${data.price ?? '0.00'}`}
            </span>
          </div>

          <h1 className="text-foreground text-xl font-bold">{data.name || 'Untitled'}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {data.description || 'No description provided.'}
          </p>

          {/* Meta */}
          <div className="border-border rounded-xl border text-sm">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-muted-foreground">Version</span>
              <span className="text-foreground ml-auto font-medium">{data.version || '1.0.0'}</span>
            </div>
            <div className="flex items-center gap-3 border-t border-border px-4 py-3">
              <span className="text-muted-foreground">Category</span>
              <span className="text-foreground ml-auto font-medium capitalize">{data.category || 'general'}</span>
            </div>
          </div>

          {/* Tags */}
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.tags.map((tag) => (
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
    </div>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────

export function PublishForm({ onSubmit, className }: PublishFormProps) {
  const [formData, setFormData] = useState<PublishFormData>({
    name: '',
    description: '',
    item_type: 'protocol',
    category: 'general',
    license: 'free',
    version: '1.0.0',
    price: '',
    tags: [],
    acceptTerms: false,
  });
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const update = <K extends keyof PublishFormData>(field: K, value: PublishFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const isFree = formData.license === 'free';
  const isValid =
    formData.name.trim() &&
    formData.description.trim() &&
    formData.version.trim() &&
    formData.acceptTerms;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);

    try {
      if (onSubmit) {
        await onSubmit({ ...formData, screenshots });
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="border-border bg-card mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-foreground mb-1 text-xl font-bold">Published Successfully!</h2>
        <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
          Your item is now live on the marketplace. It may take a few minutes to appear in search results.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setFormData({
              name: '',
              description: '',
              item_type: 'protocol',
              category: 'general',
              license: 'free',
              version: '1.0.0',
              price: '',
              tags: [],
              acceptTerms: false,
            });
            setScreenshots([]);
          }}
          className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Publish Another
        </button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      <div>
        <h1 className="text-foreground text-2xl font-bold">Publish to Marketplace</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Share your protocol, assessment, or template with the RehabOS community.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Name */}
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g., ACL Reconstruction Protocol"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-4 py-2.5 text-sm',
                'placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'transition-colors',
              )}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => update('description', e.target.value)}
              rows={5}
              placeholder="Describe what this item does, who it's for, and what makes it useful..."
              className={cn(
                'border-input bg-background text-foreground w-full resize-y rounded-lg border px-4 py-2.5 text-sm',
                'placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'transition-colors',
              )}
            />
            <p className="text-muted-foreground mt-1 text-[10px]">
              {formData.description.length} characters · Good descriptions include use cases and target audience.
            </p>
          </div>

          {/* Screenshots */}
          <div>
            <label className="text-foreground mb-1.5 flex items-center gap-2 text-sm font-medium">
              <Image className="h-4 w-4" />
              Screenshots
            </label>
            <ScreenshotUpload files={screenshots} onChange={setScreenshots} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Type */}
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Type</label>
            <select
              value={formData.item_type}
              onChange={(e) => update('item_type', e.target.value as MarketplaceItemType)}
              className={cn(
                'border-input bg-background text-foreground w-full appearance-none rounded-lg border px-3 py-2.5 text-xs font-medium',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'transition-colors',
              )}
            >
              {MARKETPLACE_ITEM_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Category</label>
            <select
              value={formData.category}
              onChange={(e) => update('category', e.target.value as MarketplaceItemCategory)}
              className={cn(
                'border-input bg-background text-foreground w-full appearance-none rounded-lg border px-3 py-2.5 text-xs font-medium',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'transition-colors',
              )}
            >
              {MARKETPLACE_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Version */}
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Version <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.version}
              onChange={(e) => update('version', e.target.value)}
              placeholder="1.0.0"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-4 py-2.5 text-sm font-mono',
                'placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'transition-colors',
              )}
            />
          </div>

          {/* License & Price */}
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Pricing</label>
            <div className="space-y-2">
              {(['free', 'premium', 'organization'] as const).map((lic) => (
                <label
                  key={lic}
                  className={cn(
                    'border-input flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors',
                    formData.license === lic && 'border-primary bg-primary/5',
                  )}
                >
                  <input
                    type="radio"
                    name="license"
                    value={lic}
                    checked={formData.license === lic}
                    onChange={() => update('license', lic)}
                    className="text-primary accent-primary h-4 w-4"
                  />
                  <div className="flex-1">
                    <span className="text-foreground font-medium capitalize">{lic}</span>
                    <p className="text-muted-foreground text-xs">
                      {lic === 'free' ? 'Available to everyone at no cost' : lic === 'premium' ? 'Paid, single-user license' : 'Multi-user organization license'}
                    </p>
                  </div>
                  {lic === 'free' && (
                    <span className="border-green-500/20 bg-green-500/10 text-green-400 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium">
                      Free
                    </span>
                  )}
                </label>
              ))}
            </div>

            {!isFree && (
              <div className="mt-2">
                <div className="relative">
                  <DollarSign className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="0.99"
                    value={formData.price}
                    onChange={(e) => update('price', e.target.value)}
                    placeholder="19.99"
                    className={cn(
                      'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-4 pl-9 text-sm',
                      'placeholder:text-muted-foreground/60',
                      'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                      'transition-colors',
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-foreground mb-1.5 flex items-center gap-2 text-sm font-medium">
              <Tags className="h-4 w-4" />
              Tags
            </label>
            <TagInput tags={formData.tags} onChange={(tags) => update('tags', tags)} />
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="border-border rounded-xl border p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => update('acceptTerms', e.target.checked)}
            className="text-primary accent-primary mt-0.5 h-4 w-4 rounded"
          />
          <div>
            <span className="text-foreground text-sm font-medium">
              I confirm that this content is my original work and I have the right to publish it.
            </span>
            <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
              By publishing, you agree to the{' '}
              <button type="button" className="text-primary underline underline-offset-2">Marketplace Terms of Service</button>
              {' '}and confirm that your content complies with our guidelines. You retain all ownership rights.
            </p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors',
              isValid && !isSubmitting
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Publish to Marketplace
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <PreviewModal data={formData} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}
