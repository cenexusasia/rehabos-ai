'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  DollarSign,
  Check,
  AlertCircle,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PAYMENT_METHOD_OPTIONS } from '@/types/invoice';
import type { PaymentMethod, InvoiceListItem } from '@/types/invoice';
import { z } from 'zod';

// ── Zod Schema ──────────────────────────────────────────────────────────────

export const paymentFormSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  paymentMethod: z.enum(['cash', 'card', 'check', 'bank_transfer', 'insurance', 'other'], {
    message: 'Payment method is required',
  }),
  dateReceived: z.string().min(1, 'Date is required'),
  checkNumber: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().max(1000).optional(),
  generateReceipt: z.boolean().default(true),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

// ── Types ───────────────────────────────────────────────────────────────────

export interface PaymentModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Called when the form is submitted */
  onSubmit?: (data: PaymentFormValues) => Promise<void>;
  /** Available invoices to apply payment to (for multi-apply) */
  invoices?: InvoiceListItem[];
  /** Pre-select a specific invoice */
  preselectedInvoiceId?: string;
  /** Pre-fill amount (e.g., the balance due) */
  preselectedAmount?: number;
  /** Whether a submit is in flight */
  isSubmitting?: boolean;
}

const PAYMENT_METHODS_WITH_CHECK = ['check'];

// ── Component ───────────────────────────────────────────────────────────────

export function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  invoices = [],
  preselectedInvoiceId,
  preselectedAmount,
  isSubmitting = false,
}: PaymentModalProps) {
  // ── State ─────────────────────────────────────────────────────────────
  const [invoiceId, setInvoiceId] = useState(preselectedInvoiceId ?? '');
  const [amount, setAmount] = useState(preselectedAmount ?? 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [dateReceived, setDateReceived] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [checkNumber, setCheckNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [generateReceipt, setGenerateReceipt] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // ── Reset state on open ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setInvoiceId(preselectedInvoiceId ?? '');
      setAmount(preselectedAmount ?? 0);
      setPaymentMethod('card');
      setDateReceived(new Date().toISOString().split('T')[0]);
      setCheckNumber('');
      setReferenceNumber('');
      setNotes('');
      setGenerateReceipt(true);
      setErrors({});
      setSuccess(false);
    }
  }, [isOpen, preselectedInvoiceId, preselectedAmount]);

  // ── Computed ──────────────────────────────────────────────────────────
  const selectedInvoice = invoices.find((inv) => inv.id === invoiceId);

  const showCheckNumber = PAYMENT_METHODS_WITH_CHECK.includes(paymentMethod);

  // ── Validation ────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!invoiceId) newErrors.invoiceId = 'Please select an invoice';
    if (amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    else if (selectedInvoice && amount > selectedInvoice.balance_due) {
      newErrors.amount = `Amount cannot exceed balance due of $${selectedInvoice.balance_due.toFixed(2)}`;
    }
    if (!dateReceived) newErrors.dateReceived = 'Date is required';
    if (showCheckNumber && !checkNumber.trim()) {
      newErrors.checkNumber = 'Check number is required';
    }
    if (notes && notes.length > 1000) {
      newErrors.notes = 'Notes must be under 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    const data: PaymentFormValues = {
      invoiceId,
      amount: Math.round(amount * 100) / 100,
      paymentMethod,
      dateReceived: dateReceived ?? '',
      checkNumber: showCheckNumber ? checkNumber : undefined,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
      generateReceipt,
    };

    try {
      await onSubmit?.(data);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      setErrors({ submit: 'Failed to record payment. Please try again.' });
    }
  };

  const handleAmountChange = (value: string) => {
    const num = parseFloat(value);
    setAmount(isNaN(num) ? 0 : num);
  };

  // ── Render ────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="border-border bg-card w-full max-w-lg rounded-xl border shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              {success ? 'Payment Recorded' : 'Record Payment'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {success
                ? 'The payment has been successfully recorded'
                : 'Enter payment details below'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center justify-center px-6 py-12">
            <div className="bg-emerald-500/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-foreground mb-1 text-lg font-semibold">Payment Recorded</p>
            <p className="text-muted-foreground mb-6 text-center text-sm">
              ${amount.toFixed(2)} via{' '}
              {PAYMENT_METHOD_OPTIONS.find((m) => m.value === paymentMethod)?.label ??
                paymentMethod}{' '}
              has been recorded.
            </p>
            {generateReceipt && (
              <button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="space-y-5 px-6 py-5 max-h-[60vh] overflow-y-auto">
              {/* Submit error */}
              {errors.submit && (
                <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.submit}
                </div>
              )}

              {/* Invoice selector */}
              <div>
                <label className="text-foreground mb-1.5 block text-sm font-medium">
                  Apply To Invoice <span className="text-destructive">*</span>
                </label>
                <select
                  value={invoiceId}
                  onChange={(e) => {
                    setInvoiceId(e.target.value);
                    const inv = invoices.find((i) => i.id === e.target.value);
                    if (inv) {
                      setAmount(inv.balance_due);
                    }
                  }}
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm appearance-none',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                    errors.invoiceId && 'border-destructive',
                  )}
                >
                  <option value="">Select invoice...</option>
                  {invoices
                    .filter(
                      (inv) =>
                        inv.status !== 'paid' &&
                        inv.status !== 'cancelled' &&
                        inv.status !== 'refunded',
                    )
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoice_number} —{' '}
                        {inv.patient
                          ? `${inv.patient.first_name} ${inv.patient.last_name}`
                          : 'Unknown'}{' '}
                        (Balance: ${inv.balance_due.toFixed(2)})
                      </option>
                    ))}
                </select>
                {errors.invoiceId && (
                  <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" /> {errors.invoiceId}
                  </p>
                )}
              </div>

              {/* Amount & Method row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="text-foreground mb-1.5 block text-sm font-medium">
                    Amount Received <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <input
                      type="number"
                      value={amount || ''}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      className={cn(
                        'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
                        'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                        'placeholder:text-muted-foreground/60',
                        errors.amount && 'border-destructive',
                      )}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                      <AlertCircle className="h-3 w-3" /> {errors.amount}
                    </p>
                  )}
                  {selectedInvoice && amount > 0 && amount < selectedInvoice.balance_due && (
                    <p className="text-amber-400 mt-1 flex items-center gap-1 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      Partial payment — remaining balance will be $
                      {(selectedInvoice.balance_due - amount).toFixed(2)}
                    </p>
                  )}
                  {selectedInvoice && (
                    <p className="text-muted-foreground mt-1 text-[10px]">
                      Balance due: ${selectedInvoice.balance_due.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Payment method */}
                <div>
                  <label className="text-foreground mb-1.5 block text-sm font-medium">
                    Payment Method <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PAYMENT_METHOD_OPTIONS.map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value)}
                        className={cn(
                          'rounded-lg border px-2.5 py-2 text-xs font-medium transition-all text-center',
                          paymentMethod === method.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
                        )}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date received */}
              <div>
                <label className="text-foreground mb-1.5 block text-sm font-medium">
                  Date Received <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={dateReceived}
                  onChange={(e) => setDateReceived(e.target.value)}
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                    errors.dateReceived && 'border-destructive',
                  )}
                />
                {errors.dateReceived && (
                  <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" /> {errors.dateReceived}
                  </p>
                )}
              </div>

              {/* Check number (conditional) */}
              {showCheckNumber && (
                <div>
                  <label className="text-foreground mb-1.5 block text-sm font-medium">
                    Check Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                    placeholder="e.g., CHK-12345"
                    className={cn(
                      'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                      'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                      'placeholder:text-muted-foreground/60',
                      errors.checkNumber && 'border-destructive',
                    )}
                  />
                  {errors.checkNumber && (
                    <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                      <AlertCircle className="h-3 w-3" /> {errors.checkNumber}
                    </p>
                  )}
                </div>
              )}

              {/* Reference/Transaction ID */}
              <div>
                <label className="text-foreground mb-1.5 block text-sm font-medium">
                  Reference / Transaction ID
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Transaction ID or confirmation number"
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                    'placeholder:text-muted-foreground/60',
                  )}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-foreground mb-1.5 block text-sm font-medium">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional notes about this payment..."
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    'placeholder:text-muted-foreground/60 transition-colors resize-none',
                    errors.notes && 'border-destructive',
                  )}
                />
                {errors.notes && (
                  <p className="text-destructive mt-1 text-xs">{errors.notes}</p>
                )}
              </div>

              {/* Receipt toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-accent/20 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Printer className="text-muted-foreground h-4 w-4" />
                  <div>
                    <span className="text-foreground text-sm font-medium">Generate Receipt</span>
                    <p className="text-muted-foreground text-xs">
                      Create a printable receipt for this payment
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={generateReceipt}
                  onClick={() => setGenerateReceipt(!generateReceipt)}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                    generateReceipt ? 'bg-primary' : 'bg-accent',
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
                      generateReceipt ? 'translate-x-4' : 'translate-x-0',
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-muted-foreground hover:text-foreground border-border hover:border-primary/40 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  'bg-emerald-500 text-white hover:bg-emerald-600 inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors',
                  'disabled:pointer-events-none disabled:opacity-50',
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Record Payment
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
