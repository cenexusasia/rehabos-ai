'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSoapNote, useUpdateSoapNote } from '@/hooks/use-soap';
import { SoapEditor } from '@/components/soap/soap-editor';
import { SoapViewer } from '@/components/soap/soap-viewer';
import { SoapSignature } from '@/components/soap/soap-signature';
import type { SoapEditorData } from '@/components/soap/soap-editor';
import type { SoapNoteDetail } from '@/lib/supabase/queries/soap';

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{children}</span>
    </div>
  );
}

function sectionToEditorData(section: Record<string, unknown>): { html: string } {
  if (typeof section.html === 'string') return { html: section.html };
  if (typeof section === 'string') return { html: section };
  return { html: '' };
}

function buildEditorData(note: SoapNoteDetail): SoapEditorData {
  return {
    subjective: sectionToEditorData(note.subjective),
    objective: sectionToEditorData(note.objective),
    assessment: sectionToEditorData(note.assessment),
    plan: sectionToEditorData(note.plan),
  };
}

export default function SoapNoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: note, isLoading, error } = useSoapNote(id);
  const updateNote = useUpdateSoapNote();
  const [, setDirty] = useState(false);

  const isSigned = note?.status === 'signed';

  const handleSave = useCallback(
    async (data: SoapEditorData) => {
      if (!id) return;
      await updateNote.mutateAsync({
        id,
        subjective: data.subjective as unknown as Record<string, unknown>,
        objective: data.objective as unknown as Record<string, unknown>,
        assessment: data.assessment as unknown as Record<string, unknown>,
        plan: data.plan as unknown as Record<string, unknown>,
      });
    },
    [id, updateNote],
  );

  const handleDirtyChange = useCallback((d: boolean) => {
    setDirty(d);
  }, []);

  const handleSigned = useCallback(() => {
    router.refresh();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mb-4 mx-auto rounded-full bg-muted p-4 w-fit">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Note not found
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The SOAP note you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link
          href="/soap"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to SOAP notes
        </Link>
      </div>
    );
  }

  const patientName = note.patient
    ? `${note.patient.first_name} ${note.patient.last_name}`
    : 'Unknown Patient';

  const clinicianName = note.clinician
    ? `${note.clinician.first_name} ${note.clinician.last_name}`
    : 'Unknown Clinician';

  const signedByName = note.signed_by
    ? `${note.signed_by.first_name} ${note.signed_by.last_name}`
    : undefined;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/soap"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to SOAP notes
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">
            SOAP Note
          </h1>
        </div>

        {!isSigned && (
          <SoapSignature
            soapNoteId={id}
            clinicianName={clinicianName}
            onSigned={handleSigned}
          />
        )}
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-5 py-3 shadow-sm">
        <InfoRow label="Patient:">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            {patientName}
          </span>
        </InfoRow>
        <span className="h-4 w-px bg-border" />
        <InfoRow label="Visit:">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {note.visit?.visit_date
              ? new Date(note.visit.visit_date).toLocaleDateString()
              : new Date(note.created_at).toLocaleDateString()}
          </span>
        </InfoRow>
        <span className="h-4 w-px bg-border" />
        <InfoRow label="Clinician:">
          <span className="flex items-center gap-1">
            <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
            {clinicianName}
          </span>
        </InfoRow>
        <span className="h-4 w-px bg-border" />
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
            note.status === 'signed' &&
              'border-green-500/30 bg-green-500/10 text-green-400',
            note.status === 'completed' &&
              'border-blue-500/30 bg-blue-500/10 text-blue-400',
            note.status === 'draft' &&
              'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
            note.status === 'amended' &&
              'border-orange-500/30 bg-orange-500/10 text-orange-400',
            note.status === 'corrected' &&
              'border-purple-500/30 bg-purple-500/10 text-purple-400',
          )}
        >
          <FileText className="h-3 w-3" />
          {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
        </span>
      </div>

      {/* Editor or Viewer */}
      {isSigned ? (
        <SoapViewer
          data={{
            subjective: note.subjective,
            objective: note.objective,
            assessment: note.assessment,
            plan: note.plan,
          }}
          patientName={patientName}
          clinicianName={clinicianName}
          visitDate={note.visit?.visit_date}
          signedAt={note.signed_at}
          signedBy={signedByName}
          status={note.status}
        />
      ) : (
        <SoapEditor
          initialData={buildEditorData(note)}
          onSave={handleSave}
          onDirtyChange={handleDirtyChange}
          readOnly={false}
        />
      )}
    </div>
  );
}
