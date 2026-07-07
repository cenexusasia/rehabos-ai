'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  DollarSign,
  Calendar,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CPT_CODE_EXAMPLES } from '@/types/invoice';

const MOCK_PATIENTS = [
  { id: 'p1', first_name: 'John', last_name: 'Smith' },
  { id: 'p2', first_name: 'Sarah', last_name: 'Johnson' },
  { id: 'p3', first_name: 'Michael', last_name: 'Brown' },
  { id: 'p4', first_name: 'Emily', last_name: 'Davis' },
  { id: 'p5', first_name: 'Robert', last_name: 'Wilson' },
  { id: 'p6', first_name: 'Jessica', last_name: 'Taylor' },
];

const MOCK_VISITS = [
  { id: 'v1', date: '2024-04-15', type: 'Initial Evaluation', patient_id: 'p1' },
  { id: 'v2', date: '2024-04-20', type: 'Follow-up', patient_id: 'p1' },
  { id: 'v3', date: '2024-04-22', type: 'Therapeutic Exercise', patient_id: 'p2' },
  { id: 'v4', date: '2024-04-25', type: 'Manual Therapy', patient_id: 'p3' },
  { id: 'v5', date: '2024-04-28', type: 'Re-evaluation', patient_id: 'p4' },
];

interface LineItemInput {
  description: string;
  cptCode: string;
  quantity: number;
  unitPrice: number;
  visitId: string;
  notes: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCptSearch, setShowCptSearch] = useState(false);
  const [cptSearch, setCptSearch] = useState('');

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');

  const [lineItems, setLineItems] = useState<LineItemInput[]>([
    { description: '', cptCode: '', quantity: 1, unitPrice: 0, visitId: '', notes: '' },
  ]);

  const filteredCptCodes = CPT_CODE_EXAMPLES.filter(
    (c) =>
      c.code.includes(cptSearch) ||
      c.description.toLowerCase().includes(cptSearch.toLowerCase()),
  );

  const selectedPatient = MOCK_PATIENTS.find((p) => p.id === selectedPatientId);
  const patientVisits = MOCK_VISITS.filter((v) => v.patient_id === selectedPatientId);
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: '', cptCode: '', quantity: 1, unitPrice: 0, visitId: '', notes: '' },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, updates: Partial<LineItemInput>) => {
    setLineItems(lineItems.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  };

  const applyCptCode = (cptCode: (typeof CPT_CODE_EXAMPLES)[0], index: number) => {
    updateLineItem(index, {
      cptCode: cptCode.code,
      description: cptCode.description,
      unitPrice: cptCode.default_rate,
    });
    setShowCptSearch(false);
    setCptSearch('');
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = Math.round((subtotal - discountAmount) * taxRate * 100) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handleSave = async () => {
    if (!selectedPatientId) {
      setError('Please select a patient');
      return;
    }
    if (lineItems.some((item) => !item.description || item.unitPrice <= 0)) {
      setError('All line items need a description and price');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/billing');
    } catch {
      setError('Failed to create invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/billing"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-foreground text-2xl font-bold">New Invoice</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Create an invoice from visit or add line items manually
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Invoice Info */}
        <div className="border-border bg-card rounded-xl border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                Patient <span className="text-destructive">*</span>
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  setSelectedVisitId('');
                }}
                className={cn(
                  'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                  'appearance-none transition-colors',
                )}
              >
                <option value="">Select patient...</option>
                {MOCK_PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">Due Date</label>
              <div className="relative">
                <Calendar className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    'transition-colors',
                  )}
                />
              </div>
            </div>
            {selectedPatient && (
              <div>
                <label className="text-foreground mb-1.5 block text-sm font-medium">
                  Related Visit (optional)
                </label>
                <select
                  value={selectedVisitId}
                  onChange={(e) => setSelectedVisitId(e.target.value)}
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    'appearance-none transition-colors',
                  )}
                >
                  <option value="">No visit linked</option>
                  {patientVisits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.date} — {v.type}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="border-border bg-card rounded-xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-foreground text-lg font-semibold">Line Items</h2>
              <p className="text-muted-foreground text-sm">
                Add services, procedures, or products
              </p>
            </div>
            <button
              type="button"
              onClick={addLineItem}
              className="text-muted-foreground hover:text-foreground hover:border-primary/40 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>
          </div>

          {/* CPT Search Modal */}
          {showCptSearch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="border-border bg-card w-full max-w-lg rounded-xl border shadow-lg">
                <div className="border-b border-border px-5 py-4">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <input
                      type="text"
                      value={cptSearch}
                      onChange={(e) => setCptSearch(e.target.value)}
                      placeholder="Search CPT codes..."
                      autoFocus
                      className={cn(
                        'border-input bg-background text-foreground w-full rounded-lg border py-2 pr-3 pl-10 text-sm',
                        'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                        'placeholder:text-muted-foreground/60 transition-colors',
                      )}
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  {filteredCptCodes.length === 0 ? (
                    <p className="text-muted-foreground px-3 py-4 text-center text-sm">No codes found</p>
                  ) : (
                    filteredCptCodes.map((cpt) => (
                      <button
                        key={cpt.code}
                        type="button"
                        onClick={() => {
                          const editIndex = Number(
                            document.activeElement?.getAttribute('data-index') ?? '0',
                          );
                          applyCptCode(cpt, editIndex);
                        }}
                        className="hover:bg-accent flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors"
                      >
                        <div>
                          <span className="text-foreground text-sm font-medium">{cpt.code}</span>
                          <p className="text-muted-foreground text-xs">{cpt.description}</p>
                        </div>
                        <span className="text-foreground text-sm font-medium">
                          ${cpt.default_rate.toFixed(2)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
                <div className="border-t border-border px-5 py-3">
                  <button
                    type="button"
                    onClick={() => { setShowCptSearch(false); setCptSearch(''); }}
                    className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1">
              <div className="col-span-4">Description / CPT</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-3 text-right">Total</div>
              <div className="col-span-1" />
            </div>

            {lineItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(idx, { description: e.target.value })}
                      placeholder="Description..."
                      className={cn(
                        'border-input bg-background text-foreground flex-1 rounded-lg border px-2.5 py-2 text-xs min-w-0',
                        'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                        'placeholder:text-muted-foreground/60 transition-colors',
                      )}
                    />
                    <button
                      type="button"
                      data-index={idx}
                      onClick={() => { setCptSearch(''); setShowCptSearch(true); }}
                      className="text-muted-foreground hover:text-foreground hover:border-primary/40 shrink-0 rounded-lg border border-border px-1.5 py-1 text-[10px] transition-colors"
                      title="Search CPT codes"
                    >
                      CPT
                    </button>
                  </div>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(idx, { quantity: Math.max(1, Number(e.target.value)) })}
                    min={1}
                    className={cn(
                      'border-input bg-background text-foreground w-full rounded-lg border px-2.5 py-2 text-xs text-center',
                      'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                      'transition-colors',
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(idx, { unitPrice: Math.max(0, Number(e.target.value)) })}
                    min={0}
                    step={0.01}
                    className={cn(
                      'border-input bg-background text-foreground w-full rounded-lg border px-2.5 py-2 text-xs text-right',
                      'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                      'transition-colors',
                    )}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-3 text-right">
                  <span className="text-foreground text-sm font-medium">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(idx)}
                      className="text-muted-foreground hover:text-destructive rounded-md p-1 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="border-border bg-card rounded-xl border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <div className="flex items-center gap-2">
                <DollarSign className="text-muted-foreground h-3 w-3" />
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                  min={0}
                  step={0.01}
                  className={cn(
                    'border-input bg-background text-foreground w-24 rounded-lg border px-2.5 py-1 text-xs text-right',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    'transition-colors',
                  )}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax Rate</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={taxRate * 100}
                  onChange={(e) => setTaxRate(Math.max(0, Math.min(100, Number(e.target.value))) / 100)}
                  min={0}
                  max={100}
                  step={0.1}
                  className={cn(
                    'border-input bg-background text-foreground w-24 rounded-lg border px-2.5 py-1 text-xs text-right',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    'transition-colors',
                  )}
                />
                <span className="text-muted-foreground text-xs">%</span>
              </div>
            </div>
            {taxAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax Amount</span>
                <span className="text-foreground">${taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-foreground text-base font-semibold">Total</span>
              <span className="text-foreground text-lg font-bold">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="text-foreground mb-1.5 block text-sm font-medium">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Additional notes for the invoice..."
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'placeholder:text-muted-foreground/60 transition-colors resize-none',
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
