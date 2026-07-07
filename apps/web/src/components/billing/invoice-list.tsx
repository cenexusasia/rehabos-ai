'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  DollarSign,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { INVOICE_STATUS_OPTIONS } from '@/types/invoice';
import type { InvoiceListItem, InvoiceStatus } from '@/types/invoice';

// ── Types ────────────────────────────────────────────────────────────────────

export type SortField = 'invoice_number' | 'issued_date' | 'total_amount' | 'status';
export type SortDir = 'asc' | 'desc';

export interface InvoiceListProps {
  /** Array of invoices to display */
  invoices: InvoiceListItem[];
  /** Whether data is still loading */
  loading?: boolean;
  /** Callback when user clicks "Send Reminder" */
  onSendReminder?: (invoice: InvoiceListItem) => void;
  /** Callback when user clicks "Record Payment" */
  onRecordPayment?: (invoice: InvoiceListItem) => void;
  /** Callback when user clicks "Mark Paid" */
  onMarkPaid?: (invoice: InvoiceListItem) => void;
  /** Callback when user clicks refresh */
  onRefresh?: () => void;
  /** Items per page */
  pageSize?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function getPatientName(invoice: InvoiceListItem): string {
  if (!invoice.patient) return 'Unknown Patient';
  return `${invoice.patient.first_name} ${invoice.patient.last_name}`;
}

// ── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_BADGE_COLORS: Record<string, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  draft: {
    bg: 'bg-slate-500/10 dark:bg-slate-400/10',
    text: 'text-slate-600 dark:text-slate-300',
    dot: 'bg-slate-400 dark:bg-slate-500',
    icon: <Clock className="h-3 w-3" />,
  },
  pending: {
    bg: 'bg-yellow-500/10 dark:bg-yellow-400/10',
    text: 'text-yellow-600 dark:text-yellow-300',
    dot: 'bg-yellow-500 dark:bg-yellow-400',
    icon: <Clock className="h-3 w-3" />,
  },
  sent: {
    bg: 'bg-blue-500/10 dark:bg-blue-400/10',
    text: 'text-blue-600 dark:text-blue-300',
    dot: 'bg-blue-500 dark:bg-blue-400',
    icon: <Send className="h-3 w-3" />,
  },
  paid: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    text: 'text-emerald-600 dark:text-emerald-300',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  overdue: {
    bg: 'bg-red-500/10 dark:bg-red-400/10',
    text: 'text-red-600 dark:text-red-300',
    dot: 'bg-red-500 dark:bg-red-400',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  cancelled: {
    bg: 'bg-gray-500/10 dark:bg-gray-400/10',
    text: 'text-gray-500 dark:text-gray-400',
    dot: 'bg-gray-400 dark:bg-gray-500',
    icon: <X className="h-3 w-3" />,
  },
  refunded: {
    bg: 'bg-purple-500/10 dark:bg-purple-400/10',
    text: 'text-purple-600 dark:text-purple-300',
    dot: 'bg-purple-500 dark:bg-purple-400',
    icon: <TrendingUp className="h-3 w-3" />,
  },
};

function getBadgeColors(status: string) {
  return STATUS_BADGE_COLORS[status] ?? {
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-300',
    dot: 'bg-slate-400',
    icon: <Clock className="h-3 w-3" />,
  };
}

function StatusBadge({ status }: { status: string }) {
  const colors = getBadgeColors(status);
  const option = INVOICE_STATUS_OPTIONS.find((o) => o.value === status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
        colors.bg,
        colors.text,
      )}
    >
      <div className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
      {option?.label ?? status}
    </span>
  );
}

// ── Sortable Column Header ──────────────────────────────────────────────────

interface SortHeaderProps {
  label: string;
  field: SortField;
  currentField: SortField;
  currentDir: SortDir;
  onSort: (field: SortField) => void;
  className?: string;
}

function SortHeader({ label, field, currentField, currentDir, onSort, className }: SortHeaderProps) {
  const isActive = currentField === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider transition-colors',
        'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {label}
      {isActive ? (
        currentDir === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-border divide-y animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center">
          <div className="col-span-2">
            <div className="bg-accent/50 h-4 w-24 rounded" />
          </div>
          <div className="col-span-3">
            <div className="bg-accent/50 h-4 w-32 rounded" />
          </div>
          <div className="col-span-2">
            <div className="bg-accent/50 h-5 w-20 rounded-full" />
          </div>
          <div className="col-span-2">
            <div className="bg-accent/50 h-4 w-28 rounded" />
          </div>
          <div className="col-span-1">
            <div className="bg-accent/50 ml-auto h-4 w-16 rounded" />
          </div>
          <div className="col-span-2">
            <div className="flex justify-end gap-1.5">
              <div className="bg-accent/50 h-7 w-7 rounded-md" />
              <div className="bg-accent/50 h-7 w-7 rounded-md" />
              <div className="bg-accent/50 h-7 w-7 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12">
      <div className="bg-accent/30 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        <DollarSign className="text-muted-foreground h-6 w-6" />
      </div>
      <p className="text-foreground mb-1 text-sm font-medium">
        {hasFilters ? 'No invoices match your search' : 'No invoices yet'}
      </p>
      <p className="text-muted-foreground mb-4 text-xs">
        {hasFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first invoice to get started'}
      </p>
      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-medium transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Clear filters
        </button>
      ) : (
        <Link
          href="/billing/invoices/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors"
        >
          <DollarSign className="h-3.5 w-3.5" />
          Create Invoice
        </Link>
      )}
    </div>
  );
}

// ── Quick Action Buttons ─────────────────────────────────────────────────────

interface QuickActionsProps {
  invoice: InvoiceListItem;
  onSendReminder?: (invoice: InvoiceListItem) => void;
  onRecordPayment?: (invoice: InvoiceListItem) => void;
  onMarkPaid?: (invoice: InvoiceListItem) => void;
}

function QuickActions({ invoice, onSendReminder, onRecordPayment, onMarkPaid }: QuickActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {/* View */}
      <Link
        href={`/billing/invoices/${invoice.id}`}
        className="text-muted-foreground hover:text-foreground hover:bg-accent/50 inline-flex items-center justify-center rounded-md p-1.5 transition-colors"
        title="View invoice"
      >
        <Eye className="h-3.5 w-3.5" />
      </Link>

      {/* Send Reminder — only for sent/overdue */}
      {(invoice.status === 'sent' || invoice.status === 'overdue' || invoice.status === 'pending') &&
        onSendReminder && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onSendReminder(invoice);
            }}
            className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 inline-flex items-center justify-center rounded-md p-1.5 transition-colors"
            title="Send reminder"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        )}

      {/* Record Payment — for unpaid invoices */}
      {(invoice.status === 'sent' || invoice.status === 'overdue' || invoice.status === 'pending' || invoice.status === 'draft') &&
        invoice.balance_due > 0 &&
        onRecordPayment && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onRecordPayment(invoice);
            }}
            className="text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 inline-flex items-center justify-center rounded-md p-1.5 transition-colors"
            title="Record payment"
          >
            <DollarSign className="h-3.5 w-3.5" />
          </button>
        )}

      {/* Mark Paid — quick status change for non-paid */}
      {invoice.status !== 'paid' &&
        invoice.status !== 'cancelled' &&
        invoice.status !== 'refunded' &&
        onMarkPaid && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onMarkPaid(invoice);
            }}
            className="text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 inline-flex items-center justify-center rounded-md p-1.5 transition-colors"
            title="Mark as paid"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
        )}
    </div>
  );
}

// ── Invoice Row ──────────────────────────────────────────────────────────────

function InvoiceRow({
  invoice,
  onSendReminder,
  onRecordPayment,
  onMarkPaid,
}: {
  invoice: InvoiceListItem;
  onSendReminder?: (invoice: InvoiceListItem) => void;
  onRecordPayment?: (invoice: InvoiceListItem) => void;
  onMarkPaid?: (invoice: InvoiceListItem) => void;
}) {
  return (
    <Link
      href={`/billing/invoices/${invoice.id}`}
      className="grid grid-cols-12 gap-4 px-5 py-3.5 text-sm transition-colors hover:bg-accent/30 items-center"
    >
      {/* Invoice Number */}
      <div className="col-span-2">
        <span className="text-foreground font-medium">{invoice.invoice_number}</span>
      </div>

      {/* Patient Name */}
      <div className="col-span-3">
        <span className="text-foreground">{getPatientName(invoice)}</span>
      </div>

      {/* Status */}
      <div className="col-span-2">
        <StatusBadge status={invoice.status} />
      </div>

      {/* Date */}
      <div className="col-span-2">
        <span className="text-muted-foreground text-xs">
          {formatDate(invoice.issued_date || invoice.created_at)}
        </span>
        {invoice.due_date && (
          <span
            className={cn(
              'ml-2 text-[10px]',
              invoice.status === 'overdue'
                ? 'text-red-400'
                : 'text-muted-foreground/60',
            )}
          >
            Due {formatDate(invoice.due_date)}
          </span>
        )}
      </div>

      {/* Amount */}
      <div className="col-span-1 text-right">
        <span className="text-foreground font-medium text-xs">
          {formatCurrency(invoice.total_amount)}
        </span>
        {invoice.balance_due > 0 && (
          <div className="text-muted-foreground/60 text-[10px]">
            {formatCurrency(invoice.balance_due)} due
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-2">
        <QuickActions
          invoice={invoice}
          onSendReminder={onSendReminder}
          onRecordPayment={onRecordPayment}
          onMarkPaid={onMarkPaid}
        />
      </div>
    </Link>
  );
}

// ── Main InvoiceList Component ──────────────────────────────────────────────

export function InvoiceList({
  invoices,
  loading = false,
  onSendReminder,
  onRecordPayment,
  onMarkPaid,
  onRefresh,
  pageSize = 10,
}: InvoiceListProps) {
  // ── Filter State ───────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  // ── Sort State ─────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>('issued_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ── Pagination State ───────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  // ── Filtered & Sorted Data ─────────────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    // Filter
    let result = invoices.filter((inv) => {
      // Search by invoice number or patient name
      if (search) {
        const q = search.toLowerCase();
        const matchesNumber = inv.invoice_number.toLowerCase().includes(q);
        const patientName = getPatientName(inv).toLowerCase();
        const matchesPatient = patientName.includes(q);
        if (!matchesNumber && !matchesPatient) return false;
      }

      // Status filter
      if (statusFilter && inv.status !== statusFilter) return false;

      // Date range filter
      if (dateFrom) {
        const refDate = inv.issued_date || inv.created_at;
        if (refDate && refDate < dateFrom) return false;
      }
      if (dateTo) {
        const refDate = inv.issued_date || inv.created_at;
        if (refDate && refDate > dateTo + 'T23:59:59') return false;
      }

      return true;
    });

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;

      switch (sortField) {
        case 'invoice_number':
          cmp = a.invoice_number.localeCompare(b.invoice_number);
          break;
        case 'issued_date': {
          const aDate = a.issued_date || a.created_at || '';
          const bDate = b.issued_date || b.created_at || '';
          cmp = aDate.localeCompare(bDate);
          break;
        }
        case 'total_amount':
          cmp = a.total_amount - b.total_amount;
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
      }

      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [invoices, search, statusFilter, dateFrom, dateTo, sortField, sortDir]);

  // ── Pagination ─────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedInvoices = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, safePage, pageSize]);

  // Reset page when filters change
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setShowDateFilter(false);
    setCurrentPage(1);
  };

  const hasActiveFilters = search || statusFilter || dateFrom || dateTo;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Search & Filters ──────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Search row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by invoice # or patient name..."
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
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Date filter toggle */}
          <button
            type="button"
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all',
              showDateFilter || dateFrom || dateTo
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
            )}
            title="Filter by date range"
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Date</span>
          </button>

          {/* Refresh */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="text-muted-foreground hover:text-foreground border-border hover:border-primary/40 inline-flex items-center justify-center rounded-lg border p-2.5 transition-colors"
              title="Refresh invoices"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Date range filters */}
        {showDateFilter && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-accent/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <label className="text-muted-foreground text-xs font-medium">From:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className={cn(
                  'border-input bg-background text-foreground rounded-lg border px-2.5 py-1.5 text-xs',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-muted-foreground text-xs font-medium">To:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className={cn(
                  'border-input bg-background text-foreground rounded-lg border px-2.5 py-1.5 text-xs',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                )}
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        )}

        {/* Status filter chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['', ...INVOICE_STATUS_OPTIONS.map((o) => o.value)] as const).map((status) => {
            const opt = INVOICE_STATUS_OPTIONS.find((o) => o.value === status);
            const colors = status ? getBadgeColors(status) : null;
            return (
              <button
                key={status || 'all'}
                type="button"
                onClick={() => {
                  setStatusFilter(statusFilter === status ? '' : status);
                  setCurrentPage(1);
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
                )}
              >
                {status && colors && <div className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />}
                {status === '' ? 'All' : opt?.label}
              </button>
            );
          })}

          {/* Clear all filters */}
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

      {/* ── Results count ──────────────────────────────────────────────── */}
      {!loading && (
        <div className="text-muted-foreground flex items-center justify-between px-1">
          <span className="text-xs">
            {filteredAndSorted.length === 0
              ? 'No invoices found'
              : `${filteredAndSorted.length} invoice${filteredAndSorted.length !== 1 ? 's' : ''} found`}
          </span>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="border-border bg-card rounded-xl border overflow-hidden">
        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-4 border-b border-border px-5 py-3">
          <div className="col-span-2">
            <SortHeader
              label="Invoice #"
              field="invoice_number"
              currentField={sortField}
              currentDir={sortDir}
              onSort={handleSort}
            />
          </div>
          <div className="col-span-3">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
              Patient
            </span>
          </div>
          <div className="col-span-2">
            <SortHeader
              label="Status"
              field="status"
              currentField={sortField}
              currentDir={sortDir}
              onSort={handleSort}
            />
          </div>
          <div className="col-span-2">
            <SortHeader
              label="Date"
              field="issued_date"
              currentField={sortField}
              currentDir={sortDir}
              onSort={handleSort}
            />
          </div>
          <div className="col-span-1 text-right">
            <SortHeader
              label="Amount"
              field="total_amount"
              currentField={sortField}
              currentDir={sortDir}
              onSort={handleSort}
              className="justify-end w-full"
            />
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground block text-right text-[10px] font-medium uppercase tracking-wider">
              Actions
            </span>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <LoadingSkeleton rows={pageSize > 5 ? 5 : pageSize} />
        ) : paginatedInvoices.length === 0 ? (
          <EmptyState hasFilters={!!hasActiveFilters} onClear={clearFilters} />
        ) : (
          <div className="divide-border divide-y">
            {paginatedInvoices.map((invoice) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                onSendReminder={onSendReminder}
                onRecordPayment={onRecordPayment}
                onMarkPaid={onMarkPaid}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            Page {safePage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className={cn(
                'text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-md p-1.5 transition-colors',
                'disabled:pointer-events-none disabled:opacity-30',
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              // Show pages around current page
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (safePage <= 4) {
                pageNum = i + 1;
              } else if (safePage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = safePage - 3 + i;
              }

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors',
                    safePage === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                  )}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className={cn(
                'text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-md p-1.5 transition-colors',
                'disabled:pointer-events-none disabled:opacity-30',
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
