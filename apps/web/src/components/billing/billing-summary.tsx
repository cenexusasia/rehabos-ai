'use client';

import { useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  FileText,
  CreditCard,
  Percent,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Invoice } from '@/types/invoice';

// ── Types ───────────────────────────────────────────────────────────────────

export interface BillingSummaryData {
  /** Total outstanding balance (current period) */
  totalOutstanding: number;
  /** Total payments received this month */
  paymentsReceivedThisMonth: number;
  /** Number of overdue invoices */
  overdueCount: number;
  /** Total amount of overdue invoices */
  overdueTotal: number;
  /** Average payment time in days */
  averagePaymentTimeDays: number;
  /** Number of insurance claims pending */
  pendingClaimsCount: number;
  /** Trend indicators (optional — % change vs previous period) */
  trends?: {
    outstanding?: number; // positive = increased
    paymentsReceived?: number;
    overdue?: number;
    paymentTime?: number;
  };
}

export interface BillingSummaryProps {
  data: BillingSummaryData;
  loading?: boolean;
  invoices?: Invoice[]; // fallback: compute summary from invoice list
  onCardClick?: (card: string) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function computeFromInvoices(invoices: Invoice[]): BillingSummaryData {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const totalOutstanding = invoices
    .filter((i) => i.status !== 'paid' && i.status !== 'cancelled' && i.status !== 'refunded')
    .reduce((sum, i) => sum + i.balance_due, 0);

  const paymentsThisMonth = invoices
    .flatMap((i) => i.payments)
    .filter((p) => {
      if (!p.paid_at) return false;
      const d = new Date(p.paid_at);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const overdue = invoices.filter((i) => i.status === 'overdue');
  const overdueCount = overdue.length;
  const overdueTotal = overdue.reduce((sum, i) => sum + i.balance_due, 0);

  // Average payment time: days from issued_date to paid_date
  const paidInvoices = invoices.filter(
    (i) => i.status === 'paid' && i.issued_date && i.paid_date,
  );
  const totalDays = paidInvoices.reduce((sum, i) => {
    const issued = new Date(i.issued_date!);
    const paid = new Date(i.paid_date!);
    return sum + Math.round((paid.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24));
  }, 0);
  const averagePaymentTimeDays =
    paidInvoices.length > 0 ? Math.round(totalDays / paidInvoices.length) : 0;

  const pendingClaimsCount = invoices.filter(
    (i) => i.status === 'pending' || i.status === 'sent',
  ).length;

  return {
    totalOutstanding,
    paymentsReceivedThisMonth: paymentsThisMonth,
    overdueCount,
    overdueTotal,
    averagePaymentTimeDays,
    pendingClaimsCount,
  };
}

// ── Card Component ──────────────────────────────────────────────────────────

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  variant?: 'default' | 'warning' | 'success';
  onClick?: () => void;
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  loading = false,
  variant = 'default',
  onClick,
}: SummaryCardProps) {
  const borderColor = {
    default: 'border-border',
    warning: 'border-amber-500/20',
    success: 'border-emerald-500/20',
  }[variant];

  const bgColor = {
    default: 'bg-card',
    warning: 'bg-card',
    success: 'bg-card',
  }[variant];

  const iconColor = {
    default: 'text-primary',
    warning: 'text-amber-400',
    success: 'text-emerald-400',
  }[variant];

  if (loading) {
    return (
      <div
        className={cn(
          'border-border bg-card rounded-xl border p-5 animate-pulse',
        )}
      >
        <div className="bg-accent/50 mb-3 h-3 w-24 rounded" />
        <div className="bg-accent/50 mb-1 h-7 w-32 rounded" />
        <div className="bg-accent/50 h-3 w-20 rounded" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border rounded-xl p-5 text-left w-full transition-all hover:shadow-md',
        borderColor,
        bgColor,
        onClick && 'cursor-pointer',
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
          {title}
        </span>
        <span className={cn('rounded-lg p-1.5', iconColor)}>
          {icon}
        </span>
      </div>

      <p className="text-foreground mt-1 text-2xl font-bold tracking-tight">
        {value}
      </p>

      <div className="mt-1.5 flex items-center gap-2">
        {trend !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[11px] font-medium rounded-sm px-1 py-0.5',
              trend > 0
                ? 'text-red-400 bg-red-500/10'
                : trend < 0
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-muted-foreground bg-accent/30',
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : trend < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : null}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {subtitle && (
          <span className="text-muted-foreground text-[11px]">{subtitle}</span>
        )}
        {trendLabel && !subtitle && (
          <span className="text-muted-foreground text-[11px]">{trendLabel}</span>
        )}
      </div>
    </button>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function BillingSummary({
  data: providedData,
  loading = false,
  invoices,
  onCardClick,
}: BillingSummaryProps) {
  const data = useMemo(
    () => (invoices ? computeFromInvoices(invoices) : providedData),
    [invoices, providedData],
  );

  const totalOutstandingPct =
    data.totalOutstanding > 0 && data.paymentsReceivedThisMonth > 0
      ? ((data.totalOutstanding - data.paymentsReceivedThisMonth) / data.paymentsReceivedThisMonth) *
        100
      : data.totalOutstanding > 0
        ? 100
        : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* Total Outstanding */}
      <SummaryCard
        title="Total Outstanding"
        value={formatCurrency(data.totalOutstanding)}
        subtitle="Current period"
        icon={<DollarSign className="h-4 w-4" />}
        trend={data.trends?.outstanding ?? totalOutstandingPct}
        loading={loading}
        variant={data.totalOutstanding > 0 ? 'warning' : 'default'}
        onClick={() => onCardClick?.('outstanding')}
      />

      {/* Payments Received */}
      <SummaryCard
        title="Payments Received"
        value={formatCurrency(data.paymentsReceivedThisMonth)}
        subtitle="This month"
        icon={<CreditCard className="h-4 w-4" />}
        trend={data.trends?.paymentsReceived}
        loading={loading}
        variant="success"
        onClick={() => onCardClick?.('payments')}
      />

      {/* Overdue */}
      <SummaryCard
        title="Overdue"
        value={data.overdueTotal > 0 ? formatCurrency(data.overdueTotal) : '$0'}
        subtitle={
          data.overdueCount > 0
            ? `${data.overdueCount} invoice${data.overdueCount !== 1 ? 's' : ''} overdue`
            : 'No overdue invoices'
        }
        icon={<AlertTriangle className="h-4 w-4" />}
        trend={data.trends?.overdue}
        loading={loading}
        variant={data.overdueCount > 0 ? 'warning' : 'default'}
        onClick={() => onCardClick?.('overdue')}
      />

      {/* Average Payment Time */}
      <SummaryCard
        title="Avg. Payment Time"
        value={`${data.averagePaymentTimeDays} days`}
        subtitle={
          data.averagePaymentTimeDays > 0
            ? 'From invoice to payment'
            : 'No payment data yet'
        }
        icon={<Clock className="h-4 w-4" />}
        trend={data.trends?.paymentTime}
        loading={loading}
        onClick={() => onCardClick?.('paymentTime')}
      />

      {/* Insurance Claims Pending */}
      <SummaryCard
        title="Claims Pending"
        value={String(data.pendingClaimsCount)}
        subtitle={
          data.pendingClaimsCount > 0
            ? 'Awaiting processing'
            : 'No pending claims'
        }
        icon={<FileText className="h-4 w-4" />}
        loading={loading}
        variant={data.pendingClaimsCount > 0 ? 'warning' : 'default'}
        onClick={() => onCardClick?.('claims')}
      />

      {/* Collection Rate */}
      <SummaryCard
        title="Collection Rate"
        value={
          data.totalOutstanding > 0 || data.paymentsReceivedThisMonth > 0
            ? `${(
                (data.paymentsReceivedThisMonth /
                  (data.totalOutstanding + data.paymentsReceivedThisMonth || 1)) *
                100
              ).toFixed(0)}%`
            : '—'
        }
        subtitle="Current period"
        icon={<Percent className="h-4 w-4" />}
        loading={loading}
        variant="success"
        onClick={() => onCardClick?.('collectionRate')}
      />
    </div>
  );
}
