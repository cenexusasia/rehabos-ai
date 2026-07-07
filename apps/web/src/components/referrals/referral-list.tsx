'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Clock,
  AlertTriangle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type {
  ReferralListItem,
  ReferralStatus,
  ReferralDirection,
  ReferralPriority,
} from '@/types/referral';
import {
  REFERRAL_STATUS_COLORS,
  REFERRAL_STATUS_LABELS,
  REFERRAL_PRIORITY_COLORS,
  REFERRAL_PRIORITY_LABELS,
} from '@/types/referral';

// ── Types ───────────────────────────────────────────────────────────────────

type SortField = 'created_at' | 'priority' | 'status' | 'reason';
type SortDirection = 'asc' | 'desc';

interface ReferralListProps {
  referrals: ReferralListItem[];
  loading?: boolean;
  direction?: ReferralDirection;
  onView?: (referral: ReferralListItem) => void;
  onAccept?: (referral: ReferralListItem) => void;
  onDecline?: (referral: ReferralListItem) => void;
  pageSize?: number;
  className?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getPriorityIcon(priority: ReferralPriority): React.ReactNode {
  switch (priority) {
    case 'emergency':
      return <AlertTriangle className="h-3 w-3" />;
    case 'urgent':
      return <Clock className="h-3 w-3" />;
    default:
      return <Calendar className="h-3 w-3" />;
  }
}

// ── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({
  hasActiveFilters,
  onClearFilters,
  direction,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  direction: ReferralDirection;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="border-border bg-card mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border">
        {direction === 'incoming' ? (
          <Inbox className="text-muted-foreground h-6 w-6" />
        ) : (
          <Send className="text-muted-foreground h-6 w-6" />
        )}
      </div>
      <h3 className="text-foreground mb-1 text-base font-semibold">
        {hasActiveFilters ? 'No referrals match your filters' : `No ${direction} referrals`}
      </h3>
      <p className="text-muted-foreground mb-4 max-w-xs text-center text-sm">
        {hasActiveFilters
          ? 'Try adjusting your search or filters to see more results.'
          : direction === 'incoming'
            ? 'You haven\'t received any referrals yet. They will appear here when another provider sends one.'
            : 'You haven\'t sent any referrals yet. Create one to refer a patient to another provider.'}
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <RefreshCw className="h-4 w-4" />
          Clear all filters
        </button>
      )}
    </div>
  );
}

// ── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReferralStatus }) {
  const colors = REFERRAL_STATUS_COLORS[status] ?? 'border-muted bg-muted text-muted-foreground';
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium', colors)}>
      {REFERRAL_STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ── Priority Badge ──────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: ReferralPriority }) {
  const colors = REFERRAL_PRIORITY_COLORS[priority] ?? 'border-muted bg-muted text-muted-foreground';
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', colors)}>
      {getPriorityIcon(priority)}
      {REFERRAL_PRIORITY_LABELS[priority]}
    </span>
  );
}

// ── Referral Row ─────────────────────────────────────────────────────────────

function ReferralRow({
  referral,
  onView,
  onAccept,
  onDecline,
}: {
  referral: ReferralListItem;
  onView?: (referral: ReferralListItem) => void;
  onAccept?: (referral: ReferralListItem) => void;
  onDecline?: (referral: ReferralListItem) => void;
}) {
  const patientName = referral.patient
    ? `${referral.patient.first_name} ${referral.patient.last_name}`
    : 'Unknown Patient';

  const fromName = referral.from_clinician
    ? `Dr. ${referral.from_clinician.first_name} ${referral.from_clinician.last_name}`
    : 'Unknown';

  const toName = referral.to_clinician
    ? `Dr. ${referral.to_clinician.first_name} ${referral.to_clinician.last_name}`
    : 'Unknown';

  const canRespond = referral.status === 'received' || referral.status === 'sent';

  return (
    <div className="grid grid-cols-12 gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-accent/20 items-center">
      {/* Patient */}
      <div className="col-span-2 flex items-center gap-2.5">
        <div className="bg-accent text-accent-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
          {referral.patient
            ? `${referral.patient.first_name.charAt(0)}${referral.patient.last_name.charAt(0)}`
            : '??'}
        </div>
        <div className="min-w-0">
          <p className="text-foreground truncate font-medium">{patientName}</p>
          <p className="text-muted-foreground truncate text-[10px]">
            {referral.reason}
          </p>
        </div>
      </div>

      {/* From / To */}
      <div className="col-span-2">
        <p className="text-foreground truncate text-xs font-medium">{fromName}</p>
        {referral.from_clinician?.specialty && (
          <p className="text-muted-foreground truncate text-[10px]">{referral.from_clinician.specialty}</p>
        )}
      </div>
      <div className="col-span-2">
        <p className="text-foreground truncate text-xs font-medium">{toName}</p>
        {referral.to_clinician?.specialty && (
          <p className="text-muted-foreground truncate text-[10px]">{referral.to_clinician.specialty}</p>
        )}
      </div>

      {/* Priority */}
      <div className="col-span-1">
        <PriorityBadge priority={referral.priority} />
      </div>

      {/* Status */}
      <div className="col-span-1">
        <StatusBadge status={referral.status} />
      </div>

      {/* Date */}
      <div className="col-span-1">
        <span className="text-muted-foreground text-[10px]">{formatDate(referral.created_at)}</span>
      </div>

      {/* Actions */}
      <div className="col-span-1 flex items-center justify-end gap-1">
        {onView && (
          <button
            type="button"
            onClick={() => onView(referral)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-1.5 transition-colors"
            title="View details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}
        {canRespond && onAccept && (
          <button
            type="button"
            onClick={() => onAccept(referral)}
            className="text-green-400 hover:bg-green-500/10 rounded-md p-1.5 transition-colors"
            title="Accept referral"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
        )}
        {canRespond && onDecline && (
          <button
            type="button"
            onClick={() => onDecline(referral)}
            className="text-red-400 hover:bg-red-500/10 rounded-md p-1.5 transition-colors"
            title="Decline referral"
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────

export function ReferralList({
  referrals,
  loading = false,
  direction: initialDirection = 'outgoing',
  onView,
  onAccept,
  onDecline,
  pageSize = 10,
  className,
}: ReferralListProps) {
  // ── State ───────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<ReferralDirection | 'all'>(initialDirection);
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | ''>('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Filtered + Sorted ───────────────────────────────────────────────────
  const filteredReferrals = useMemo(() => {
    let result = [...referrals];

    // Tab filter
    if (tab !== 'all') {
      result = result.filter((r) => {
        if (tab === 'outgoing') return r.from_clinician_id;
        return r.to_clinician_id;
      });
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => {
        const patientName = r.patient
          ? `${r.patient.first_name} ${r.patient.last_name}`.toLowerCase()
          : '';
        const fromName = r.from_clinician
          ? `${r.from_clinician.first_name} ${r.from_clinician.last_name}`.toLowerCase()
          : '';
        const toName = r.to_clinician
          ? `${r.to_clinician.first_name} ${r.to_clinician.last_name}`.toLowerCase()
          : '';
        return (
          patientName.includes(q) ||
          fromName.includes(q) ||
          toName.includes(q) ||
          r.reason.toLowerCase().includes(q)
        );
      });
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Date range
    if (dateFrom) {
      result = result.filter((r) => r.created_at >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((r) => r.created_at <= dateTo + 'T23:59:59');
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'created_at':
          cmp = (a.created_at ?? '').localeCompare(b.created_at ?? '');
          break;
        case 'priority': {
          const order = { emergency: 3, urgent: 2, routine: 1 };
          cmp = (order[a.priority] ?? 0) - (order[b.priority] ?? 0);
          break;
        }
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'reason':
          cmp = a.reason.localeCompare(b.reason);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [referrals, tab, search, statusFilter, dateFrom, dateTo, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredReferrals.length / pageSize));
  const paginatedReferrals = filteredReferrals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const hasActiveFilters = !!(search || statusFilter || dateFrom || dateTo);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  useMemo(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // ── Loading State ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted h-9 w-24 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="border-border bg-card animate-pulse rounded-xl border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-muted h-3 w-1/3 animate-pulse rounded" />
                <div className="bg-muted h-2 w-1/4 animate-pulse rounded" />
              </div>
              <div className="bg-muted h-2 w-16 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tabs: Incoming / Outgoing / All */}
      <div className="flex items-center gap-1">
        {(['incoming', 'outgoing', 'all'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setCurrentPage(1); }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors',
              tab === t
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent',
            )}
          >
            {t === 'incoming' && <Inbox className="h-3.5 w-3.5" />}
            {t === 'outgoing' && <Send className="h-3.5 w-3.5" />}
            {t === 'all' && <RefreshCw className="h-3.5 w-3.5" />}
            {t === 'incoming' ? 'Incoming' : t === 'outgoing' ? 'Outgoing' : 'All'}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by patient or provider name..."
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
                'placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
              )}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors',
              showFilters
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Collapsible filters */}
        {showFilters && (
          <div className="border-border bg-card rounded-xl border p-4">
            <div className="flex flex-wrap items-end gap-4">
              {/* Status */}
              <div className="min-w-[140px]">
                <label className="text-foreground mb-1 block text-xs font-medium">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as ReferralStatus | ''); setCurrentPage(1); }}
                  className="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-xs appearance-none focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(REFERRAL_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Date from */}
              <div>
                <label className="text-foreground mb-1 block text-xs font-medium">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  className="border-input bg-background text-foreground rounded-lg border px-3 py-2 text-xs focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors"
                />
              </div>

              {/* Date to */}
              <div>
                <label className="text-foreground mb-1 block text-xs font-medium">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  className="border-input bg-background text-foreground rounded-lg border px-3 py-2 text-xs focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors"
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* Status quick filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['', 'received', 'sent', 'accepted', 'declined', 'completed'] as const).map((status) => (
            <button
              key={status || 'all'}
              type="button"
              onClick={() => { setStatusFilter(statusFilter === status ? '' : status); setCurrentPage(1); }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                statusFilter === status
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
              )}
            >
              {status ? REFERRAL_STATUS_LABELS[status] : 'All'}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border-border bg-card rounded-xl border overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <div className="col-span-2">Patient / Reason</div>
          <div className="col-span-2">From</div>
          <div className="col-span-2">To</div>
          <button
            type="button"
            onClick={() => toggleSort('priority')}
            className="col-span-1 inline-flex items-center text-left hover:text-foreground transition-colors"
          >
            Priority
            {sortField === 'priority' ? (
              sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
            ) : <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />}
          </button>
          <button
            type="button"
            onClick={() => toggleSort('status')}
            className="col-span-1 inline-flex items-center text-left hover:text-foreground transition-colors"
          >
            Status
            {sortField === 'status' ? (
              sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
            ) : <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />}
          </button>
          <button
            type="button"
            onClick={() => toggleSort('created_at')}
            className="col-span-1 inline-flex items-center text-left hover:text-foreground transition-colors"
          >
            Date
            {sortField === 'created_at' ? (
              sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
            ) : <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />}
          </button>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {paginatedReferrals.length === 0 ? (
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            direction={tab === 'all' ? 'incoming' : tab}
          />
        ) : (
          <div className="divide-border divide-y">
            {paginatedReferrals.map((referral) => (
              <ReferralRow
                key={referral.id}
                referral={referral}
                onView={onView}
                onAccept={onAccept}
                onDecline={onDecline}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            Page {currentPage} of {totalPages} ({filteredReferrals.length} total)
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
              <ChevronLeft className="h-3.5 w-3.5" />
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
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
