'use client';

import { useState } from 'react';
import {
  Search,
  FileText,
  Plus,
  Clock,
  Layers,
  CheckCircle2,
  DraftingCompass,
  Archive,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ProtocolListItem, ProtocolStatus } from '@/types/protocol';

// ── Mock Data (until Supabase tables exist) ──────────────────────────────────

const MOCK_PROTOCOLS: ProtocolListItem[] = [
  {
    id: '1',
    name: 'Total Knee Arthroplasty Rehabilitation',
    description: 'Post-operative rehabilitation protocol for total knee replacement patients. Includes phased approach from acute to advanced strengthening.',
    category: 'Orthopedic',
    body_regions: ['Lower Extremity', 'Knee'],
    conditions: ['Total Knee Arthroplasty', 'Osteoarthritis'],
    status: 'active',
    estimated_duration_weeks: 12,
    version: '2.1',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Rotator Cuff Repair (Post-Surgical)',
    description: 'Evidence-based rehabilitation protocol following arthroscopic rotator cuff repair with phased progression.',
    category: 'Orthopedic',
    body_regions: ['Upper Extremity', 'Shoulder'],
    conditions: ['Rotator Cuff Tear'],
    status: 'active',
    estimated_duration_weeks: 16,
    version: '1.3',
    created_at: '2024-02-20T00:00:00Z',
  },
  {
    id: '3',
    name: 'ACL Reconstruction Rehabilitation',
    description: 'Comprehensive protocol for ACL reconstruction rehab from prehab through return to sport.',
    category: 'Sports',
    body_regions: ['Lower Extremity', 'Knee'],
    conditions: ['ACL Tear'],
    status: 'active',
    estimated_duration_weeks: 24,
    version: '3.0',
    created_at: '2024-03-10T00:00:00Z',
  },
  {
    id: '4',
    name: 'Lumbar Spinal Stenosis - Conservative',
    description: 'Conservative management protocol for lumbar spinal stenosis focusing on flexion-based exercises and pain management.',
    category: 'Spine',
    body_regions: ['Spine', 'Lumbar'],
    conditions: ['Lumbar Spinal Stenosis'],
    status: 'draft',
    estimated_duration_weeks: 8,
    version: '0.1',
    created_at: '2024-04-05T00:00:00Z',
  },
  {
    id: '5',
    name: 'Stroke Rehabilitation - Upper Extremity',
    description: 'Neurorehabilitation protocol for upper extremity recovery post-stroke.',
    category: 'Neurological',
    body_regions: ['Upper Extremity'],
    conditions: ['Stroke', 'Hemiparesis'],
    status: 'archived',
    estimated_duration_weeks: 20,
    version: '1.0',
    created_at: '2023-11-01T00:00:00Z',
  },
];

const STATUS_CONFIG: Record<ProtocolStatus, { label: string; icon: React.ReactNode; color: string }> = {
  draft: {
    label: 'Draft',
    icon: <DraftingCompass className="h-3 w-3" />,
    color: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5',
  },
  active: {
    label: 'Active',
    icon: <CheckCircle2 className="h-3 w-3" />,
    color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
  },
  archived: {
    label: 'Archived',
    icon: <Archive className="h-3 w-3" />,
    color: 'text-muted-foreground border-border bg-accent/30',
  },
};

export default function ProtocolsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProtocolStatus | ''>('active');

  // Simulated loading
  const protocols = MOCK_PROTOCOLS.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const hasActiveFilters = search || statusFilter;
  const clearFilters = () => {
    setSearch('');
    setStatusFilter('active');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Protocol Library</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Evidence-based rehabilitation protocols and care pathways
          </p>
        </div>
        <Link
          href="/protocols/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Protocol
        </Link>
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
            placeholder="Search protocols by name..."
            className={cn(
              'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
              'placeholder:text-muted-foreground/60',
              'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
              'transition-colors',
            )}
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5">
          {(['active', 'draft', 'archived', ''] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status === '' ? '' : status)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                statusFilter === status
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
              )}
            >
              {status === '' ? 'All' : STATUS_CONFIG[status].label}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground ml-2 inline-flex items-center gap-1 text-xs font-medium transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {protocols.length === 0 && (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="text-foreground text-lg font-semibold">No protocols found</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {hasActiveFilters
              ? 'Try adjusting your search or filters.'
              : 'Create your first rehabilitation protocol to get started.'}
          </p>
          {!hasActiveFilters && (
            <Link
              href="/protocols/new"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Protocol
            </Link>
          )}
        </div>
      )}

      {/* Protocol Grid */}
      {protocols.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {protocols.map((protocol) => (
            <ProtocolCard key={protocol.id} protocol={protocol} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Protocol Card ────────────────────────────────────────────────────────────

function ProtocolCard({ protocol }: { protocol: ProtocolListItem }) {
  const statusConfig = STATUS_CONFIG[protocol.status];
  const phaseCount = 4; // Placeholder

  return (
    <Link
      href={`/protocols/${protocol.id}`}
      className={cn(
        'border-border bg-card group relative flex flex-col rounded-xl border p-5 transition-all',
        'hover:border-primary/40 hover:shadow-sm',
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground truncate text-sm font-semibold group-hover:text-primary transition-colors">
            {protocol.name}
          </h3>
          {protocol.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
              {protocol.description}
            </p>
          )}
        </div>
        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0', statusConfig.color)}>
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>

      {/* Meta */}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {protocol.category && (
          <span className="border-border bg-accent/50 text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-medium">
            {protocol.category}
          </span>
        )}
        {protocol.estimated_duration_weeks && (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {protocol.estimated_duration_weeks} weeks
          </span>
        )}
        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
          <Layers className="h-3 w-3" />
          {phaseCount} phases
        </span>
      </div>

      {/* Body regions */}
      {protocol.body_regions.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
          {protocol.body_regions.slice(0, 2).map((region) => (
            <span
              key={region}
              className="border-border bg-accent/30 text-muted-foreground rounded-md border px-1.5 py-0.5 text-[10px]"
            >
              {region}
            </span>
          ))}
          {protocol.body_regions.length > 2 && (
            <span className="text-muted-foreground text-[10px]">+{protocol.body_regions.length - 2}</span>
          )}
        </div>
      )}

      {/* Version */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-muted-foreground text-[10px]">v{protocol.version}</span>
      </div>
    </Link>
  );
}
