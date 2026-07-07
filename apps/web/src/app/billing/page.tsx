'use client';

import { useState } from 'react';
import {
  Search,
  DollarSign,
  Plus,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { INVOICE_STATUS_OPTIONS } from '@/types/invoice';
import type { InvoiceListItem, InvoiceStatus } from '@/types/invoice';

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_INVOICES: InvoiceListItem[] = [
  {
    id: '1',
    patient_id: 'p1',
    invoice_number: 'INV-00001',
    status: 'paid',
    subtotal: 750.00,
    total_amount: 750.00,
    amount_paid: 750.00,
    balance_due: 0,
    due_date: '2024-03-15',
    issued_date: '2024-02-15',
    paid_date: '2024-03-10',
    created_at: '2024-02-15T00:00:00Z',
    patient: { id: 'p1', first_name: 'John', last_name: 'Smith' },
  },
  {
    id: '2',
    patient_id: 'p2',
    invoice_number: 'INV-00002',
    status: 'pending',
    subtotal: 1200.00,
    total_amount: 1200.00,
    amount_paid: 400.00,
    balance_due: 800.00,
    due_date: '2024-04-30',
    issued_date: '2024-03-30',
    paid_date: null,
    created_at: '2024-03-30T00:00:00Z',
    patient: { id: 'p2', first_name: 'Sarah', last_name: 'Johnson' },
  },
  {
    id: '3',
    patient_id: 'p3',
    invoice_number: 'INV-00003',
    status: 'overdue',
    subtotal: 950.00,
    total_amount: 950.00,
    amount_paid: 0,
    balance_due: 950.00,
    due_date: '2024-03-01',
    issued_date: '2024-02-01',
    paid_date: null,
    created_at: '2024-02-01T00:00:00Z',
    patient: { id: 'p3', first_name: 'Michael', last_name: 'Brown' },
  },
  {
    id: '4',
    patient_id: 'p4',
    invoice_number: 'INV-00004',
    status: 'draft',
    subtotal: 450.00,
    total_amount: 450.00,
    amount_paid: 0,
    balance_due: 450.00,
    due_date: '2024-05-15',
    issued_date: null,
    paid_date: null,
    created_at: '2024-04-10T00:00:00Z',
    patient: { id: 'p4', first_name: 'Emily', last_name: 'Davis' },
  },
  {
    id: '5',
    patient_id: 'p5',
    invoice_number: 'INV-00005',
    status: 'sent',
    subtotal: 1850.00,
    total_amount: 1850.00,
    amount_paid: 0,
    balance_due: 1850.00,
    due_date: '2024-05-20',
    issued_date: '2024-04-20',
    paid_date: null,
    created_at: '2024-04-20T00:00:00Z',
    patient: { id: 'p5', first_name: 'Robert', last_name: 'Wilson' },
  },
  {
    id: '6',
    patient_id: 'p6',
    invoice_number: 'INV-00006',
    status: 'cancelled',
    subtotal: 300.00,
    total_amount: 300.00,
    amount_paid: 0,
    balance_due: 0,
    due_date: '2024-02-01',
    issued_date: '2024-01-15',
    paid_date: null,
    created_at: '2024-01-15T00:00:00Z',
    patient: { id: 'p6', first_name: 'Jessica', last_name: 'Taylor' },
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function BillingPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');

  const invoices = MOCK_INVOICES.filter((inv) => {
    if (statusFilter && inv.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const patientName = inv.patient
        ? `${inv.patient.first_name} ${inv.patient.last_name}`.toLowerCase()
        : '';
      if (
        !inv.invoice_number.toLowerCase().includes(q) &&
        !patientName.includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const hasActiveFilters = search || statusFilter;
  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
  };

  // Summary stats
  const totalOutstanding = MOCK_INVOICES
    .filter((i) => i.status !== 'paid' && i.status !== 'cancelled' && i.status !== 'refunded')
    .reduce((sum, i) => sum + i.balance_due, 0);
  const totalOverdue = MOCK_INVOICES
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + i.balance_due, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Billing</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage invoices, payments, and billing
          </p>
        </div>
        <Link
          href="/billing/invoices/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="border-border bg-card rounded-xl border p-4">
          <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5" />
            Total Invoices
          </div>
          <p className="text-foreground text-2xl font-bold">{MOCK_INVOICES.length}</p>
        </div>
        <div className="border-border bg-card rounded-xl border p-4">
          <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider">
            <CreditCard className="h-3.5 w-3.5" />
            Outstanding Balance
          </div>
          <p className="text-foreground text-2xl font-bold">
            {formatCurrency(totalOutstanding)}
          </p>
        </div>
        <div className="border-border bg-card rounded-xl border p-4">
          <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider">
            <AlertTriangle className="h-3.5 w-3.5" />
            Overdue
          </div>
          <p className="text-destructive text-2xl font-bold">
            {formatCurrency(totalOverdue)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices by number or patient name..."
            className={cn(
              'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
              'placeholder:text-muted-foreground/60',
              'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
              'transition-colors',
            )}
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['', ...INVOICE_STATUS_OPTIONS.map((o) => o.value)] as const).map((status) => {
            const opt = INVOICE_STATUS_OPTIONS.find((o) => o.value === status);
            return (
              <button
                key={status || 'all'}
                type="button"
                onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
                )}
              >
                {status && <div className={cn('h-2 w-2 rounded-full', opt?.dotColor)} />}
                {status === '' ? 'All' : opt?.label}
              </button>
            );
          })}
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

      {/* Invoice List */}
      <div className="border-border bg-card rounded-xl border overflow-hidden">
        <div className="divide-border divide-y">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <div className="col-span-2">Invoice</div>
            <div className="col-span-2">Patient</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Balance</div>
          </div>

          {invoices.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <DollarSign className="text-muted-foreground mx-auto mb-3 h-8 w-8" />
              <p className="text-muted-foreground text-sm">No invoices found</p>
            </div>
          ) : (
            invoices.map((invoice) => {
              const statusOpt = INVOICE_STATUS_OPTIONS.find((o) => o.value === invoice.status);
              return (
                <Link
                  key={invoice.id}
                  href={`/billing/invoices/${invoice.id}`}
                  className="grid grid-cols-12 gap-4 px-5 py-3.5 text-sm transition-colors hover:bg-accent/30 items-center"
                >
                  <div className="col-span-2">
                    <span className="text-foreground font-medium">
                      {invoice.invoice_number}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-foreground">
                      {invoice.patient?.first_name} {invoice.patient?.last_name}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-medium',
                      statusOpt?.color,
                    )}>
                      <div className={cn('h-1.5 w-1.5 rounded-full', statusOpt?.dotColor)} />
                      {statusOpt?.label}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">
                      {formatDate(invoice.issued_date || invoice.created_at)}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-foreground font-medium">
                      {formatCurrency(invoice.total_amount)}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    {invoice.balance_due > 0 ? (
                      <span className="text-destructive font-medium">
                        {formatCurrency(invoice.balance_due)}
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center justify-end gap-1 text-xs">
                        <CheckCircle2 className="h-3 w-3" />
                        Paid
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
