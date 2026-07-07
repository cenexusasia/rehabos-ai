import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface AuditEvent {
  organizationId: string;
  clinicianId?: string;
  patientId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown>;
}

export async function logAuditEvent(params: AuditEvent) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await (supabase as any).from('audit_logs').insert({
      organization_id: params.organizationId,
      clinician_id: params.clinicianId,
      patient_id: params.patientId,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      changes: params.changes,
    });
    if (error) console.error('Audit log error:', error);
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
