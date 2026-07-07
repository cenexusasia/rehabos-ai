'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Search,
  X,
  DollarSign,
  AlertCircle,
  Calendar,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { CPT_CODE_EXAMPLES } from '@/types/invoice';
import type { CptCode } from '@/types/invoice';

// ── Zod Schema ──────────────────────────────────────────────────────────────

export const invoiceLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  cptCode: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Price must be 0 or greater'),
  visitId: z.string().optional(),
  notes: z.string().optional(),
});

export const diagnosisCodeSchema = z.object({
  code: z.string().min(1, 'ICD-10 code is required'),
  description: z.string().optional(),
});

export const insuranceClaimInfoSchema = z.object({
  carrier: z.string().optional(),
  policyNumber: z.string().optional(),
  groupNumber: z.string().optional(),
  claimNumber: z.string().optional(),
});

export const invoiceBuilderSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  patientName: z.string().optional(),
  patientDob: z.string().optional(),
  insuranceProvider: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  lineItems: z.array(invoiceLineItemSchema).min(1, 'At least one line item is required'),
  discountAmount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  diagnosisCodes: z.array(diagnosisCodeSchema).optional(),
  insuranceClaim: insuranceClaimInfoSchema.optional(),
  paymentTerms: z.enum(['due_on_receipt', 'net_15', 'net_30', 'net_45', 'net_60']).default('net_30'),
  notes: z.string().max(5000).optional(),
});

export type InvoiceBuilderValues = z.infer<typeof invoiceBuilderSchema>;

export const PAYMENT_TERMS_OPTIONS = [
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
] as const;

export const ICD10_EXAMPLES = [
  { code: 'M54.5', description: 'Low back pain' },
  { code: 'M25.561', description: 'Pain in right knee' },
  { code: 'M25.562', description: 'Pain in left knee' },
  { code: 'M79.1', description: 'Myalgia' },
  { code: 'S93.4', description: 'Sprain of ankle' },
  { code: 'M75.1', description: 'Rotator cuff tear' },
  { code: 'M54.2', description: 'Cervicalgia' },
  { code: 'M17.9', description: 'Osteoarthritis of knee' },
  { code: 'G89.29', description: 'Chronic pain' },
  { code: 'Z96.641', description: 'Presence of artificial knee joint' },
];

// ── Props ───────────────────────────────────────────────────────────────────

interface PatientInfo {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  insurance_provider?: string;
  insurance_id?: string;
}

interface InvoiceBuilderProps {
  patients?: PatientInfo[];
  onSubmit?: (data: InvoiceBuilderValues) => Promise<void>;
  onCancel?: () => void;
  initialValues?: Partial<InvoiceBuilderValues>;
  isSaving?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// ── Line Item Type ──────────────────────────────────────────────────────────

interface LineItem {
  description: string;
  cptCode: string;
  quantity: number;
  unitPrice: number;
  visitId: string;
  notes: string;
}

const emptyLineItem: LineItem = {
  description: '',
  cptCode: '',
  quantity: 1,
  unitPrice: 0,
  visitId: '',
  notes: '',
};

// ── Component ───────────────────────────────────────────────────────────────

export function InvoiceBuilder({
  patients = [],
  onSubmit,
  onCancel,
  initialValues,
  isSaving = false,
}: InvoiceBuilderProps) {
  // ── State ─────────────────────────────────────────────────────────────
  const [patientId, setPatientId] = useState(initialValues?.patientId ?? '');
  const [patientName, setPatientName] = useState(initialValues?.patientName ?? '');
  const [patientDob, setPatientDob] = useState(initialValues?.patientDob ?? '');
  const [insuranceProvider, setInsuranceProvider] = useState(initialValues?.insuranceProvider ?? '');
  const [dueDate, setDueDate] = useState(
    initialValues?.dueDate ?? (() => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d.toISOString().split('T')[0];
    })(),
  );
  const [discountAmount, setDiscountAmount] = useState(initialValues?.discountAmount ?? 0);
  const [taxRate, setTaxRate] = useState(initialValues?.taxRate ?? 0);
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [paymentTerms, setPaymentTerms] = useState<string>(initialValues?.paymentTerms ?? 'net_30');

  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialValues?.lineItems?.length
      ? initialValues.lineItems.map((li) => ({
          description: li.description ?? '',
          cptCode: li.cptCode ?? '',
          quantity: li.quantity ?? 1,
          unitPrice: li.unitPrice ?? 0,
          visitId: li.visitId ?? '',
          notes: li.notes ?? '',
        }))
      : [{ ...emptyLineItem }],
  );

  // Diagnosis codes
  const [diagnosisCodes, setDiagnosisCodes] = useState<{ code: string; description: string }[]>(
    (initialValues?.diagnosisCodes as { code: string; description?: string }[] | undefined)?.map(d => ({
      code: d.code,
      description: d.description ?? '',
    })) ?? [],
  );
  const [newDiagnosis, setNewDiagnosis] = useState({ code: '', description: '' });

  // Insurance claim info
  const [claimCarrier, setClaimCarrier] = useState(initialValues?.insuranceClaim?.carrier ?? '');
  const [claimPolicyNumber, setClaimPolicyNumber] = useState(initialValues?.insuranceClaim?.policyNumber ?? '');
  const [claimGroupNumber, setClaimGroupNumber] = useState(initialValues?.insuranceClaim?.groupNumber ?? '');
  const [claimNumber, setClaimNumber] = useState(initialValues?.insuranceClaim?.claimNumber ?? '');

  // UI state
  const [showCptSearch, setShowCptSearch] = useState(false);
  const [cptSearch, setCptSearch] = useState('');
  const [cptTargetIndex, setCptTargetIndex] = useState<number>(0);
  const [showIcdSearch, setShowIcdSearch] = useState(false);
  const [icdSearch, setIcdSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Computed ──────────────────────────────────────────────────────────

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = Math.round((subtotal - discountAmount) * (taxRate / 100) * 100) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const filteredCptCodes = CPT_CODE_EXAMPLES.filter(
    (c) =>
      c.code.includes(cptSearch) ||
      c.description.toLowerCase().includes(cptSearch.toLowerCase()),
  );

  const filteredIcdCodes = ICD10_EXAMPLES.filter(
    (d) =>
      d.code.includes(icdSearch) ||
      d.description.toLowerCase().includes(icdSearch.toLowerCase()),
  );

  // ── Handlers ──────────────────────────────────────────────────────────

  const addLineItem = () => {
    setLineItems([...lineItems, { ...emptyLineItem }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, updates: Partial<LineItem>) => {
    setLineItems(lineItems.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  };

  const applyCptCode = (cpt: CptCode, index: number) => {
    updateLineItem(index, {
      cptCode: cpt.code,
      description: cpt.description,
      unitPrice: cpt.default_rate,
    });
    setShowCptSearch(false);
    setCptSearch('');
  };

  const addDiagnosisCode = () => {
    if (!newDiagnosis.code.trim()) return;
    setDiagnosisCodes([...diagnosisCodes, { ...newDiagnosis }]);
    setNewDiagnosis({ code: '', description: '' });
    setShowIcdSearch(false);
  };

  const removeDiagnosisCode = (index: number) => {
    setDiagnosisCodes(diagnosisCodes.filter((_, i) => i !== index));
  };

  const applyIcd10 = (icd: (typeof ICD10_EXAMPLES)[0]) => {
    setNewDiagnosis({ code: icd.code, description: icd.description });
    setShowIcdSearch(false);
    setIcdSearch('');
  };

  const handlePatientSelect = (id: string) => {
    setPatientId(id);
    const patient = patients.find((p) => p.id === id);
    if (patient) {
      setPatientName(`${patient.first_name} ${patient.last_name}`);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!patientId) newErrors.patientId = 'Please select a patient';
    if (!dueDate) newErrors.dueDate = 'Due date is required';

    const emptyLineItems = lineItems.filter((li) => !li.description || li.unitPrice <= 0);
    if (emptyLineItems.length > 0) {
      newErrors.lineItems = 'All line items need a description and price';
    }

    if (notes && notes.length > 5000) {
      newErrors.notes = 'Notes must be under 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const data: InvoiceBuilderValues = {
      patientId,
      patientName,
      patientDob,
      insuranceProvider,
      dueDate: dueDate ?? '',
      lineItems: lineItems.map((li) => ({
        description: li.description,
        cptCode: li.cptCode || undefined,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        visitId: li.visitId || undefined,
        notes: li.notes || undefined,
      })),
      discountAmount,
      taxRate,
      diagnosisCodes: diagnosisCodes.length > 0 ? diagnosisCodes : undefined,
      insuranceClaim:
        claimCarrier || claimPolicyNumber
          ? {
              carrier: claimCarrier || undefined,
              policyNumber: claimPolicyNumber || undefined,
              groupNumber: claimGroupNumber || undefined,
              claimNumber: claimNumber || undefined,
            }
          : undefined,
      paymentTerms: paymentTerms as InvoiceBuilderValues['paymentTerms'],
      notes: notes || undefined,
    };

    await onSubmit?.(data);
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      <div className="border-border bg-card rounded-xl border p-6">
        <h2 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
          <Info className="text-primary h-4 w-4" />
          Patient Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Patient <span className="text-destructive">*</span>
            </label>
            <select
              value={patientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'appearance-none transition-colors',
                errors.patientId && 'border-destructive',
              )}
            >
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" /> {errors.patientId}
              </p>
            )}
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Date of Birth</label>
            <input
              type="date"
              value={patientDob}
              onChange={(e) => setPatientDob(e.target.value)}
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
              )}
            />
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Insurance Provider</label>
            <input
              type="text"
              value={insuranceProvider}
              onChange={(e) => setInsuranceProvider(e.target.value)}
              placeholder="e.g., Blue Cross"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                'placeholder:text-muted-foreground/60',
              )}
            />
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Due Date <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Calendar className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={cn(
                  'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                  errors.dueDate && 'border-destructive',
                )}
              />
            </div>
            {errors.dueDate && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" /> {errors.dueDate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="border-border bg-card rounded-xl border p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-lg font-semibold">Line Items</h2>
            <p className="text-muted-foreground text-sm">
              Add CPT codes, services, or procedures
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

        {errors.lineItems && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
            <AlertCircle className="h-3 w-3" />
            {errors.lineItems}
          </div>
        )}

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
                    placeholder="Search CPT codes by code or description..."
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
                      onClick={() => applyCptCode(cpt, cptTargetIndex)}
                      className="hover:bg-accent flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors"
                    >
                      <div>
                        <span className="text-foreground text-sm font-medium">{cpt.code}</span>
                        <p className="text-muted-foreground text-xs">{cpt.description}</p>
                        <span className="text-muted-foreground/60 text-[10px]">{cpt.category}</span>
                      </div>
                      <span className="text-foreground text-sm font-medium">
                        {formatCurrency(cpt.default_rate)}
                      </span>
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-border px-5 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCptSearch(false);
                    setCptSearch('');
                  }}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <div className="col-span-4">Description / CPT</div>
          <div className="col-span-1 text-center">Qty</div>
          <div className="col-span-2 text-right">Unit Price</div>
          <div className="col-span-2 text-right">Total</div>
          <div className="col-span-2 text-right">Notes</div>
          <div className="col-span-1" />
        </div>

        <div className="mt-2 space-y-2">
          {lineItems.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-start">
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
                    onClick={() => {
                      setCptTargetIndex(idx);
                      setCptSearch('');
                      setShowCptSearch(true);
                    }}
                    className="text-muted-foreground hover:text-foreground hover:border-primary/40 shrink-0 rounded-lg border border-border px-1.5 py-1 text-[10px] transition-colors"
                    title="Search CPT codes"
                  >
                    CPT
                  </button>
                </div>
                {item.cptCode && (
                  <span className="text-muted-foreground mt-0.5 inline-block text-[10px]">
                    Code: {item.cptCode}
                  </span>
                )}
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateLineItem(idx, { quantity: Math.max(1, Number(e.target.value)) })
                  }
                  min={1}
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-1 py-2 text-xs text-center',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                  )}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateLineItem(idx, { unitPrice: Math.max(0, Number(e.target.value)) })
                  }
                  min={0}
                  step={0.01}
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-2 py-2 text-xs text-right',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                  )}
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-2 flex items-center justify-end pr-1">
                <span className="text-foreground text-sm font-medium">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </span>
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  value={item.notes}
                  onChange={(e) => updateLineItem(idx, { notes: e.target.value })}
                  placeholder="Notes..."
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-2 py-2 text-xs',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    'placeholder:text-muted-foreground/60 transition-colors',
                  )}
                />
              </div>
              <div className="col-span-1 flex justify-end pt-1">
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

      {/* ICD-10 Diagnosis Codes */}
      <div className="border-border bg-card rounded-xl border p-6">
        <h2 className="text-foreground mb-4 text-lg font-semibold">Diagnosis Codes (ICD-10)</h2>

        {/* ICD-10 Search Modal */}
        {showIcdSearch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="border-border bg-card w-full max-w-lg rounded-xl border shadow-lg">
              <div className="border-b border-border px-5 py-4">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    value={icdSearch}
                    onChange={(e) => setIcdSearch(e.target.value)}
                    placeholder="Search ICD-10 codes..."
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
                {filteredIcdCodes.length === 0 ? (
                  <p className="text-muted-foreground px-3 py-4 text-center text-sm">No codes found</p>
                ) : (
                  filteredIcdCodes.map((icd) => (
                    <button
                      key={icd.code}
                      type="button"
                      onClick={() => applyIcd10(icd)}
                      className="hover:bg-accent flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors"
                    >
                      <div>
                        <span className="text-foreground text-sm font-medium">{icd.code}</span>
                        <p className="text-muted-foreground text-xs">{icd.description}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-border px-5 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowIcdSearch(false);
                    setIcdSearch('');
                  }}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add diagnosis */}
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <div className="flex-1">
            <label className="text-foreground mb-1 block text-xs font-medium">ICD-10 Code</label>
            <div className="flex gap-1">
              <input
                type="text"
                value={newDiagnosis.code}
                onChange={(e) => setNewDiagnosis({ ...newDiagnosis, code: e.target.value })}
                placeholder="e.g., M54.5"
                className={cn(
                  'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                  'placeholder:text-muted-foreground/60 transition-colors',
                )}
              />
              <button
                type="button"
                onClick={() => {
                  setIcdSearch('');
                  setShowIcdSearch(true);
                }}
                className="text-muted-foreground hover:text-foreground hover:border-primary/40 shrink-0 rounded-lg border border-border px-2 py-1 text-[10px] transition-colors"
              >
                Search
              </button>
            </div>
          </div>
          <div className="flex-[2]">
            <label className="text-foreground mb-1 block text-xs font-medium">Description</label>
            <input
              type="text"
              value={newDiagnosis.description}
              onChange={(e) => setNewDiagnosis({ ...newDiagnosis, description: e.target.value })}
              placeholder="Description..."
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'placeholder:text-muted-foreground/60 transition-colors',
              )}
            />
          </div>
          <button
            type="button"
            onClick={addDiagnosisCode}
            disabled={!newDiagnosis.code.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        {/* Diagnosis list */}
        {diagnosisCodes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {diagnosisCodes.map((dx, idx) => (
              <div
                key={idx}
                className="border-border bg-accent/30 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5"
              >
                <span className="text-foreground text-xs font-medium">{dx.code}</span>
                {dx.description && (
                  <span className="text-muted-foreground text-xs">— {dx.description}</span>
                )}
                <button
                  type="button"
                  onClick={() => removeDiagnosisCode(idx)}
                  className="text-muted-foreground hover:text-destructive ml-1 rounded-sm p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground/60 text-xs italic">
            No diagnosis codes added yet. Optional, but recommended for insurance claims.
          </p>
        )}
      </div>

      {/* Insurance Claim Info */}
      <div className="border-border bg-card rounded-xl border p-6">
        <h2 className="text-foreground mb-4 text-lg font-semibold">Insurance Claim Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Insurance Carrier</label>
            <input
              type="text"
              value={claimCarrier}
              onChange={(e) => setClaimCarrier(e.target.value)}
              placeholder="e.g., Blue Cross Blue Shield"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'placeholder:text-muted-foreground/60 transition-colors',
              )}
            />
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Policy Number</label>
            <input
              type="text"
              value={claimPolicyNumber}
              onChange={(e) => setClaimPolicyNumber(e.target.value)}
              placeholder="Policy #"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'placeholder:text-muted-foreground/60 transition-colors',
              )}
            />
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Group Number</label>
            <input
              type="text"
              value={claimGroupNumber}
              onChange={(e) => setClaimGroupNumber(e.target.value)}
              placeholder="Group #"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'placeholder:text-muted-foreground/60 transition-colors',
              )}
            />
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Claim Number</label>
            <input
              type="text"
              value={claimNumber}
              onChange={(e) => setClaimNumber(e.target.value)}
              placeholder="Claim #"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'placeholder:text-muted-foreground/60 transition-colors',
              )}
            />
          </div>
        </div>
      </div>

      {/* Payment Terms & Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Terms */}
        <div className="border-border bg-card rounded-xl border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">Payment Terms</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PAYMENT_TERMS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPaymentTerms(option.value)}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-xs font-medium transition-all text-left',
                  paymentTerms === option.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="text-foreground mb-1.5 block text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes for the invoice..."
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
        </div>

        {/* Summary */}
        <div className="border-border bg-card rounded-xl border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">Invoice Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground font-medium">{formatCurrency(subtotal)}</span>
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
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                  )}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax Rate</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                  min={0}
                  max={100}
                  step={0.1}
                  className={cn(
                    'border-input bg-background text-foreground w-24 rounded-lg border px-2.5 py-1 text-xs text-right',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                  )}
                />
                <span className="text-muted-foreground text-xs">%</span>
              </div>
            </div>
            {taxAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax Amount</span>
                <span className="text-foreground">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-foreground text-base font-semibold">Total</span>
              <span className="text-foreground text-lg font-bold">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="text-muted-foreground hover:text-foreground border-border hover:border-primary/40 inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className={cn(
            'bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          {isSaving ? 'Saving...' : 'Create Invoice'}
        </button>
      </div>
    </div>
  );
}
