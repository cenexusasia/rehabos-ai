'use client';

import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  FileText,
  ClipboardList,
  DollarSign,
  User,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useVisit } from '@/hooks/use-visits';
import {
  VISIT_TYPE_LABELS,
  VISIT_TYPE_COLORS,
  STATUS_COLORS,
  type VisitType,
  type VisitStatus,
} from '@/types/visit';

export default function VisitDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: visit, isLoading, error } = useVisit(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          Visit not found or failed to load.
        </div>
        <Link
          href="/patients"
          className="text-muted-foreground hover:text-foreground mt-4 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to patients
        </Link>
      </div>
    );
  }

  const visitDate = new Date(visit.date);
  const typeColor = VISIT_TYPE_COLORS[visit.visit_type as VisitType] ?? 'bg-muted text-muted-foreground';
  const statusColor = STATUS_COLORS[visit.status as VisitStatus] ?? 'bg-muted text-muted-foreground border-border';
  const patientName =
    (visit as any).patients
      ? `${(visit as any).patients.first_name} ${(visit as any).patients.last_name}`
      : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Back link */}
      <Link
        href={`/patients/${visit.patient_id}`}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to patient
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-foreground text-2xl font-bold">
              {VISIT_TYPE_LABELS[visit.visit_type as VisitType] ?? visit.visit_type}
            </h1>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                typeColor,
              )}
            >
              {VISIT_TYPE_LABELS[visit.visit_type as VisitType] ?? visit.visit_type}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
                statusColor,
              )}
            >
              {visit.status}
            </span>
          </div>

          {patientName && (
            <Link
              href={`/patients/${visit.patient_id}`}
              className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-2 text-sm transition-colors"
            >
              <User className="h-4 w-4" />
              {patientName}
            </Link>
          )}

          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {visitDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {visit.duration_minutes && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {visit.duration_minutes} minutes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Chief Complaint */}
          <div className="border-border bg-card rounded-xl border p-5">
            <h3 className="text-foreground mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <AlertCircle className="h-4 w-4" />
              Chief Complaint
            </h3>
            {visit.chief_complaint ? (
              <p className="text-foreground whitespace-pre-wrap text-sm">{visit.chief_complaint}</p>
            ) : (
              <p className="text-muted-foreground text-sm italic">No chief complaint recorded</p>
            )}
          </div>

          {/* SOAP Note */}
          <div className="border-border bg-card rounded-xl border p-5">
            <h3 className="text-foreground mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <FileText className="h-4 w-4" />
              SOAP Note
            </h3>
            {visit.soap_note_id ? (
              <Link
                href={`/soap/${visit.soap_note_id}`}
                className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              >
                <FileText className="h-4 w-4" />
                View SOAP Note
              </Link>
            ) : (
              <p className="text-muted-foreground text-sm italic">No SOAP note yet</p>
            )}
          </div>

          {/* Notes */}
          {visit.notes && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h3 className="text-foreground mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                <ClipboardList className="h-4 w-4" />
                Notes
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm">{visit.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Billing Info */}
          <div className="border-border bg-card rounded-xl border p-5">
            <h3 className="text-foreground mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <DollarSign className="h-4 w-4" />
              Billing
            </h3>
            <dl className="space-y-3">
              <InfoRow label="Billing Code" value={visit.billing_code} />
              <InfoRow
                label="Billing Status"
                value={
                  visit.billing_status
                    ? visit.billing_status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                    : null
                }
              />
              <InfoRow
                label="Amount"
                value={
                  visit.billing_amount != null
                    ? `$${visit.billing_amount.toFixed(2)}`
                    : null
                }
              />
            </dl>
            {!visit.billing_code && !visit.billing_status && (
              <p className="text-muted-foreground mt-2 text-sm italic">
                No billing information recorded
              </p>
            )}
          </div>

          {/* Visit Details */}
          <div className="border-border bg-card rounded-xl border p-5">
            <h3 className="text-foreground mb-4 text-sm font-semibold uppercase tracking-wider">
              Visit Details
            </h3>
            <dl className="space-y-3">
              <InfoRow label="Visit ID" value={visit.id} />
              <InfoRow label="Status" value={visit.status} />
              <InfoRow label="Duration" value={visit.duration_minutes ? `${visit.duration_minutes} min` : null} />
              <InfoRow
                label="Date"
                value={visitDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
            </dl>
          </div>

          {/* Assessments & Actions Placeholder */}
          <div className="border-border bg-card rounded-xl border p-5">
            <h3 className="text-foreground mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <ClipboardList className="h-4 w-4" />
              Assessments
            </h3>
            <p className="text-muted-foreground text-sm italic">
              No assessments recorded for this visit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-foreground text-right text-sm font-medium">{value}</dd>
    </div>
  );
}
