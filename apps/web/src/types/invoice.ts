// ── Enums ────────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'check' | 'bank_transfer' | 'insurance' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// ── CPT Code ─────────────────────────────────────────────────────────────────

export interface CptCode {
  code: string;
  description: string;
  default_rate: number;
  category: string;
  units?: string;
}

// ── Invoice Line Item ────────────────────────────────────────────────────────

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  cpt_code: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  visit_id: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

// ── Payment ──────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  reference_number: string | null;
  notes: string | null;
  paid_at: string | null;
  created_at: string;
}

// ── Invoice ──────────────────────────────────────────────────────────────────

export interface Invoice {
  id: string;
  organization_id: string | null;
  patient_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  due_date: string | null;
  issued_date: string | null;
  paid_date: string | null;
  notes: string | null;
  line_items: InvoiceLineItem[];
  payments: Payment[];
  created_by: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export type InvoiceListItem = Pick<
  Invoice,
  | 'id'
  | 'patient_id'
  | 'invoice_number'
  | 'status'
  | 'subtotal'
  | 'total_amount'
  | 'amount_paid'
  | 'balance_due'
  | 'due_date'
  | 'issued_date'
  | 'paid_date'
  | 'created_at'
> & {
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
};

// ── Invoice Filter Options ───────────────────────────────────────────────────

export interface InvoiceFilterOptions {
  search?: string;
  status?: InvoiceStatus | '';
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ── Form Types ───────────────────────────────────────────────────────────────

export interface CreateInvoiceFormData {
  patient_id: string;
  visit_id?: string | null;
  due_date: string;
  line_items: {
    description: string;
    cpt_code: string | null;
    quantity: number;
    unit_price: number;
    visit_id?: string | null;
    notes?: string | null;
  }[];
  notes?: string | null;
  discount_amount?: number;
  tax_rate?: number;
}

export interface RecordPaymentFormData {
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string | null;
  notes?: string | null;
  paid_at?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

export const INVOICE_STATUS_OPTIONS: {
  value: InvoiceStatus;
  label: string;
  color: string;
  dotColor: string;
}[] = [
  { value: 'draft', label: 'Draft', color: 'text-muted-foreground', dotColor: 'bg-muted-foreground' },
  { value: 'pending', label: 'Pending', color: 'text-yellow-500', dotColor: 'bg-yellow-500' },
  { value: 'sent', label: 'Sent', color: 'text-blue-500', dotColor: 'bg-blue-500' },
  { value: 'paid', label: 'Paid', color: 'text-emerald-500', dotColor: 'bg-emerald-500' },
  { value: 'overdue', label: 'Overdue', color: 'text-red-500', dotColor: 'bg-red-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-muted-foreground/50', dotColor: 'bg-muted-foreground/50' },
  { value: 'refunded', label: 'Refunded', color: 'text-purple-500', dotColor: 'bg-purple-500' },
];

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'check', label: 'Check' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

export const CPT_CODE_EXAMPLES: CptCode[] = [
  { code: '97110', description: 'Therapeutic Exercise', default_rate: 75.00, category: 'Therapeutic Procedure' },
  { code: '97112', description: 'Neuromuscular Reeducation', default_rate: 80.00, category: 'Therapeutic Procedure' },
  { code: '97116', description: 'Gait Training', default_rate: 80.00, category: 'Therapeutic Procedure' },
  { code: '97140', description: 'Manual Therapy', default_rate: 85.00, category: 'Manual Therapy' },
  { code: '97530', description: 'Therapeutic Activities', default_rate: 78.00, category: 'Therapeutic Procedure' },
  { code: '97035', description: 'Ultrasound', default_rate: 35.00, category: 'Modality' },
  { code: '97014', description: 'Electrical Stimulation', default_rate: 40.00, category: 'Modality' },
  { code: '98941', description: 'Chiropractic Manipulation (3-4 regions)', default_rate: 100.00, category: 'Chiropractic' },
  { code: '99203', description: 'Office Visit (new, low complexity)', default_rate: 125.00, category: 'Evaluation' },
  { code: '99213', description: 'Office Visit (established, low complexity)', default_rate: 95.00, category: 'Evaluation' },
  { code: '99214', description: 'Office Visit (established, moderate complexity)', default_rate: 140.00, category: 'Evaluation' },
  { code: '97010', description: 'Hot/Cold Packs', default_rate: 15.00, category: 'Modality' },
];
