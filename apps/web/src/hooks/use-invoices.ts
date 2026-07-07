'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  Invoice,
  InvoiceListItem,
  InvoiceFilterOptions,
  CreateInvoiceFormData,
  RecordPaymentFormData,
} from '@/types/invoice';

// ── Invoice List Hooks ───────────────────────────────────────────────────────

export function useInvoices(options?: InvoiceFilterOptions) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['invoices', options],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(
          'id, patient_id, invoice_number, status, subtotal, total_amount, amount_paid, balance_due, due_date, issued_date, paid_date, created_at, patient:patient_id(id, first_name, last_name)',
        )
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.search) {
        query = query.or(
          `invoice_number.ilike.%${options.search}%,patient:patient_id.first_name.ilike.%${options.search}%,patient:patient_id.last_name.ilike.%${options.search}%`,
        );
      }
      if (options?.dateFrom) {
        query = query.gte('created_at', options.dateFrom);
      }
      if (options?.dateTo) {
        query = query.lte('created_at', options.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as InvoiceListItem[]) ?? [];
    },
  });
}

export function useInvoicesByPatient(patientId: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['invoices', 'patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(
          'id, patient_id, invoice_number, status, subtotal, total_amount, amount_paid, balance_due, due_date, issued_date, paid_date, created_at',
        )
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as InvoiceListItem[]) ?? [];
    },
    enabled: !!patientId,
  });
}

// ── Single Invoice Hook ──────────────────────────────────────────────────────

export function useInvoice(id: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(
          '*, patient:patient_id(id, first_name, last_name), line_items:invoice_line_items(*), payments:payments(*)',
        )
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as Invoice;
    },
    enabled: !!id,
  });
}

// ── Create Invoice Mutation ──────────────────────────────────────────────────

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async (formData: CreateInvoiceFormData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Get count for invoice number
      const { count } = await supabase
        .from('invoices')
        .select('id', { count: 'exact', head: true });

      const invoiceNumber = `INV-${String((count ?? 0) + 1).padStart(5, '0')}`;

      const subtotal = formData.line_items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0,
      );
      const discountAmount = formData.discount_amount ?? 0;
      const taxRate = formData.tax_rate ?? 0;
      const taxAmount = Math.round((subtotal - discountAmount) * taxRate * 100) / 100;
      const totalAmount = subtotal - discountAmount + taxAmount;
      const balanceDue = totalAmount;

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          patient_id: formData.patient_id,
          invoice_number: invoiceNumber,
          status: 'draft',
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          amount_paid: 0,
          balance_due: balanceDue,
          due_date: formData.due_date || null,
          notes: formData.notes || null,
          created_by: user?.id ?? null,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;
      const invoiceId = invoice.id;

      // Insert line items
      if (formData.line_items.length > 0) {
        const lineItems = formData.line_items.map((item, idx) => ({
          invoice_id: invoiceId,
          description: item.description,
          cpt_code: item.cpt_code ?? null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          visit_id: item.visit_id ?? null,
          notes: item.notes ?? null,
          sort_order: idx,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_line_items')
          .insert(lineItems);

        if (itemsError) throw itemsError;
      }

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// ── Update Invoice Status Mutation ───────────────────────────────────────────

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: Record<string, unknown> = { status };

      if (status === 'sent') {
        updateData.issued_date = new Date().toISOString();
      }
      if (status === 'paid') {
        updateData.paid_date = new Date().toISOString();
        updateData.amount_paid = 0;
      }
      if (status === 'cancelled' || status === 'refunded') {
        updateData.balance_due = 0;
      }

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// ── Record Payment Mutation ──────────────────────────────────────────────────

export function useRecordPayment() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async (formData: RecordPaymentFormData) => {
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: formData.invoice_id,
          amount: formData.amount,
          payment_method: formData.payment_method,
          reference_number: formData.reference_number ?? null,
          notes: formData.notes ?? null,
          status: 'completed',
          paid_at: formData.paid_at ?? new Date().toISOString(),
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update invoice balance
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount, amount_paid')
        .eq('id', formData.invoice_id)
        .single();

      if (invoice) {
        const newAmountPaid = (invoice.amount_paid ?? 0) + formData.amount;
        const newBalance = invoice.total_amount - newAmountPaid;
        const newStatus = newBalance <= 0 ? 'paid' : 'pending';

        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            amount_paid: newAmountPaid,
            balance_due: Math.max(0, newBalance),
            status: newStatus,
            paid_date: newBalance <= 0 ? new Date().toISOString() : null,
          })
          .eq('id', formData.invoice_id);

        if (updateError) throw updateError;
      }

      return payment;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// ── Invalidation Hook ────────────────────────────────────────────────────────

export function useInvalidateInvoices() {
  const queryClient = useQueryClient();
  return {
    invalidateList: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
    invalidateInvoice: (id: string) =>
      queryClient.invalidateQueries({ queryKey: ['invoices', id] }),
  };
}
