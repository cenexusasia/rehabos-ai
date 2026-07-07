'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit';

export async function signSoapNote(soapNoteId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: note, error: fetchError } = await (supabase as any)
    .from('soap_notes')
    .select('id, patient_id, clinician_id, organization_id')
    .eq('id', soapNoteId)
    .single();

  if (fetchError || !note) throw new Error('SOAP note not found');

  const { error } = await (supabase as any)
    .from('soap_notes')
    .update({
      status: 'signed',
      signed_at: new Date().toISOString(),
      signed_by_clinician_id: user.id,
    })
    .eq('id', soapNoteId);

  if (error) throw new Error(error.message);

  await logAuditEvent({
    organizationId: (note as any).organization_id,
    clinicianId: user.id,
    patientId: (note as any).patient_id,
    action: 'soap.signed',
    resourceType: 'soap_notes',
    resourceId: soapNoteId,
    changes: { status: 'signed' },
  });

  revalidatePath(`/visits/${(note as any).visit_id}`);
  revalidatePath('/soap');
}

export async function amendSoapNote(soapNoteId: string, newContent: Record<string, unknown>) {
  const supabase = await createServerSupabaseClient();

  const { error } = await (supabase as any)
    .from('soap_notes')
    .update({
      ...newContent,
      status: 'amended',
      updated_at: new Date().toISOString(),
    })
    .eq('id', soapNoteId);

  if (error) throw new Error(error.message);

  revalidatePath('/soap');
}
