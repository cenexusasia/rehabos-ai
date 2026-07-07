'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  DollarSign,
  Download,
  Printer,
  Send,
  CheckCircle2,
  CreditCard,
  FileText,
  Calendar,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  INVOICE_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from '@/types/invoice';
import type { Invoice, PaymentMethod } from '@/types/invoice';

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_INVOICE: Invoice = {
  id: '1',
  organization_id: null,
  patient_id: 'p1',
  invoice_number: 'INV-00001',
  status: 'paid',
  subtotal: 750.00,
  tax_rate: 0,
  tax_amount: 0,
  discount_amount: 0,
  total_amount: 750.00,
  amount_paid: 750.00,
  balance_due: 0,
  due_date: '2024-03-15',
  issued_date: '2024-02-15',
  paid_date: '2024-03-10',
  notes: 'Follow-up visit for knee rehabilitation. Patient responded well to treatment.',
  created_by: null,
  created_at: '2024-02-15T00:00:00Z',
  updated_at: '2024-03-10T00:00:00Z',
  patient: { id: 'p1', first_name: 'John', last_name: 'Smith' },
  line_items: [
    {
      id: 'li1',
      invoice_id: '1',
      description: 'Therapeutic Exercise - 45 min',
      cpt_code: '97110',
      quantity: 2,
      unit_price: 75.00,
      total_price: 150.00,
      visit_id: 'v1',
      notes: null,
      sort_order: 0,
      created_at: '2024-02-15T00:00:00Z',
    },
    {
      id: 'li2',
      invoice_id: '1',
      description: 'Manual Therapy - 30 min',
      cpt_code: '97140',
      quantity: 3,
      unit_price: 85.00,
      total_price: 255.00,
      visit_id: 'v1',
      notes: null,
      sort_order: 1,
      created_at: '2024-02-15T00:00:00Z',
    },
    {
      id: 'li3',
      invoice_id: '1',
      description: 'Neuromuscular Reeducation',
      cpt_code: '97112',
      quantity: 1,
      unit_price: 80.00,
      total_price: 80.00,
      visit_id: 'v1',
      notes: null,
      sort_order: 2,
      created_at: '2024-02-15T00:00:00Z',
    },
    {
      id: 'li4',
      invoice_id: '1',
      description: 'Gait Training',
      cpt_code: '97116',
      quantity: 1,
      unit_price: 80.00,
      total_price: 80.00,
      visit_id: 'v1',
      notes: null,
      sort_order: 3,
      created_at: '2024-02-15T00:00:00Z',
    },
    {
      id: 'li5',
      invoice_id: '1',
      description: 'Therapeutic Activities',
      cpt_code: '97530',
      quantity: 2,
      unit_price: 78.00,
      total_price: 156.00,
      visit_id: 'v1',
      notes: null,
      sort_order: 4,
      created_at: '2024-02-15T00:00:00Z',
    },
    {
      id: 'li6',
      invoice_id: '1',
      description: 'Heat Therapy',
      cpt_code: '97010',
      quantity: 2,
      unit_price: 15.00,
      total_price: 29.00,
      visit_id: 'v1',
      notes: null,
      sort_order: 5,
      created_at: '2024-02-15T00:00:00Z',
    },
  ],
  payments: [
    {
      id: 'pmt1',
      invoice_id: '1',
      amount: 750.00,
      payment_method: 'card',
      status: 'completed',
      reference_number: 'CHK-12345',
      notes: null,
      paid_at: '2024-03-10T00:00:00Z',
      created_at: '2024-03-10T00:00:00Z',
    },
  ],
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function InvoiceDetailPage() {
  const [isLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'card' as PaymentMethod,
    reference: '',
    notes: '',
  });

  // Use mock for now
  const invoice = MOCK_INVOICE;

  const statusOpt = INVOICE_STATUS_OPTIONS.find((o) => o.value === invoice?.status);

  const handleSendInvoice = async () => {
    // TODO: Implement send
  };

  const handleDownload = async () => {
    // TODO: Implement PDF generation
  };

  const handleRecordPayment = async () => {
    // TODO: Implement
    setShowPaymentModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          Invoice not found.
        </div>
        <Link
          href="/billing"
          className="text-muted-foreground hover:text-foreground mt-4 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to billing
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/billing"
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to billing
      </Link>

      {/* Header */}
      <div className="border-border bg-card mb-6 rounded-xl border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-foreground text-2xl font-bold">
                {invoice.invoice_number}
              </h1>
              {statusOpt && (
                <span className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
                  invoice.status === 'paid' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' :
                  invoice.status === 'overdue' ? 'border-red-500/20 bg-red-500/5 text-red-400' :
                  invoice.status === 'draft' ? 'border-muted-foreground/20 bg-accent/30 text-muted-foreground' :
                  invoice.status === 'cancelled' ? 'border-muted-foreground/10 bg-accent/20 text-muted-foreground/60' :
                  'border-blue-500/20 bg-blue-500/5 text-blue-400',
                )}>
                  <div className={cn('h-1.5 w-1.5 rounded-full', statusOpt.dotColor)} />
                  {statusOpt.label}
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Patient: <span className="text-foreground font-medium">
                {invoice.patient?.first_name} {invoice.patient?.last_name}
              </span>
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
              <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                Issued: {formatDate(invoice.issued_date)}
              </span>
              <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                Due: {formatDate(invoice.due_date)}
              </span>
              {invoice.paid_date && (
                <span className="text-emerald-400 inline-flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Paid: {formatDate(invoice.paid_date)}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {invoice.status === 'draft' && (
              <button
                type="button"
                onClick={handleSendInvoice}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                <Send className="h-4 w-4" />
                Send Invoice
              </button>
            )}
            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && invoice.status !== 'refunded' && (
              <button
                type="button"
                onClick={() => {
                  setPaymentForm({ ...paymentForm, amount: invoice.balance_due });
                  setShowPaymentModal(true);
                }}
                className="bg-emerald-500 text-white hover:bg-emerald-600 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                Record Payment
              </button>
            )}
            <button
              type="button"
              onClick={handleDownload}
              className="text-muted-foreground hover:text-foreground hover:border-primary/40 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground hover:border-primary/40 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>

        {/* Balance summary */}
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="border-border bg-accent/20 rounded-lg border p-3">
            <div className="text-muted-foreground mb-0.5 text-[10px] font-medium uppercase tracking-wider">Total Amount</div>
            <p className="text-foreground text-xl font-bold">{formatCurrency(invoice.total_amount)}</p>
          </div>
          <div className="border-border bg-accent/20 rounded-lg border p-3">
            <div className="text-muted-foreground mb-0.5 text-[10px] font-medium uppercase tracking-wider">Amount Paid</div>
            <p className="text-emerald-400 text-xl font-bold">{formatCurrency(invoice.amount_paid)}</p>
          </div>
          <div className="border-border bg-accent/20 rounded-lg border p-3">
            <div className="text-muted-foreground mb-0.5 text-[10px] font-medium uppercase tracking-wider">Balance Due</div>
            <p className={cn(
              'text-xl font-bold',
              invoice.balance_due > 0 ? 'text-destructive' : 'text-emerald-400',
            )}>
              {formatCurrency(invoice.balance_due)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Line Items */}
          <div className="border-border bg-card rounded-xl border overflow-hidden">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-foreground text-sm font-semibold">Line Items</h2>
            </div>
            <div className="divide-border divide-y">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-accent/20">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">CPT Code</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {invoice.line_items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 px-5 py-3 text-sm">
                  <div className="col-span-5">
                    <span className="text-foreground">{item.description}</span>
                  </div>
                  <div className="col-span-2">
                    {item.cpt_code ? (
                      <span className="border-border bg-accent/50 text-muted-foreground rounded border px-1.5 py-0.5 text-[10px] font-medium">
                        {item.cpt_code}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="text-foreground">{item.quantity}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-muted-foreground">{formatCurrency(item.unit_price)}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-foreground font-medium">{formatCurrency(item.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-border px-5 py-3 space-y-1.5 bg-accent/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-destructive">-{formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}
              {invoice.tax_amount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({(invoice.tax_rate * 100).toFixed(1)}%)</span>
                  <span className="text-foreground">{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-1.5">
                <span className="text-foreground font-semibold">Total</span>
                <span className="text-foreground font-bold text-lg">{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h3 className="text-foreground mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <FileText className="text-primary h-3.5 w-3.5" />
                Notes
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payments */}
          <div className="border-border bg-card rounded-xl border overflow-hidden">
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="text-foreground text-sm font-semibold">Payments</h3>
            </div>
            {invoice.payments.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <CreditCard className="text-muted-foreground mx-auto mb-2 h-6 w-6" />
                <p className="text-muted-foreground text-xs">No payments recorded</p>
              </div>
            ) : (
              <div className="divide-border divide-y">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-foreground text-sm font-medium">
                        {formatCurrency(payment.amount)}
                      </span>
                      <span className={cn(
                        'text-xs font-medium',
                        payment.status === 'completed' ? 'text-emerald-400' :
                        payment.status === 'failed' ? 'text-destructive' : 'text-muted-foreground',
                      )}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{PAYMENT_METHOD_OPTIONS.find(m => m.value === payment.payment_method)?.label ?? payment.payment_method}</span>
                      {payment.reference_number && <span>Ref: {payment.reference_number}</span>}
                      <span>{formatDate(payment.paid_at)}</span>
                    </div>
                    {payment.notes && (
                      <p className="text-muted-foreground mt-1 text-xs">{payment.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="border-border bg-card rounded-xl border p-5">
            <h3 className="text-foreground mb-3 text-xs font-semibold uppercase tracking-wider">Activity</h3>
            <div className="space-y-3">
              {invoice.created_at && (
                <div className="flex gap-3">
                  <div className="bg-accent mt-1 h-2 w-2 shrink-0 rounded-full" />
                  <div>
                    <p className="text-foreground text-xs font-medium">Invoice Created</p>
                    <p className="text-muted-foreground text-[10px]">{formatDate(invoice.created_at)}</p>
                  </div>
                </div>
              )}
              {invoice.issued_date && (
                <div className="flex gap-3">
                  <div className="bg-blue-500 mt-1 h-2 w-2 shrink-0 rounded-full" />
                  <div>
                    <p className="text-foreground text-xs font-medium">Invoice Sent</p>
                    <p className="text-muted-foreground text-[10px]">{formatDate(invoice.issued_date)}</p>
                  </div>
                </div>
              )}
              {invoice.payments.map((p) => (
                <div key={p.id} className="flex gap-3">
                  <div className="bg-emerald-500 mt-1 h-2 w-2 shrink-0 rounded-full" />
                  <div>
                    <p className="text-foreground text-xs font-medium">
                      Payment Received ({formatCurrency(p.amount)})
                    </p>
                    <p className="text-muted-foreground text-[10px]">{formatDate(p.paid_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="border-border bg-card w-full max-w-md rounded-xl border p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-foreground text-lg font-semibold">Record Payment</h2>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-foreground mb-1.5 block text-sm font-medium">
                  Amount <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Math.max(0, Number(e.target.value)) })}
                    min={0}
                    step={0.01}
                    className={cn(
                      'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
                      'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                      'transition-colors',
                    )}
                  />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Balance due: {formatCurrency(invoice.balance_due)}
                </p>
              </div>

              <div>
                <label className="text-foreground mb-1.5 block text-sm font-medium">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHOD_OPTIONS.slice(0, 3).map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, method: method.value })}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                        paymentForm.method === method.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
                      )}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-foreground mb-1.5 block text-sm font-medium">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  placeholder="Check number, transaction ID..."
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    'placeholder:text-muted-foreground/60 transition-colors',
                  )}
                />
              </div>

              <div>
                <label className="text-foreground mb-1.5 block text-sm font-medium">Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  rows={2}
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    'placeholder:text-muted-foreground/60 transition-colors resize-none',
                  )}
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordPayment}
                disabled={paymentForm.amount <= 0}
                className={cn(
                  'bg-emerald-500 text-white hover:bg-emerald-600 inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors',
                  'disabled:pointer-events-none disabled:opacity-50',
                )}
              >
                <CreditCard className="h-4 w-4" />
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
