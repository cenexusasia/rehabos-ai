'use client';

import {
  Phone,
  Mail,
  Shield,
  Calendar,
  ChevronRight,
  Activity,
  FileText,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { Patient, PatientStatus } from '@/types/patient';

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export const statusColors: Record<PatientStatus, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  inactive: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  discharged: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  archived: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  transferred: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

interface PatientCardProps {
  patient: Patient;
  className?: string;
}

export function PatientCard({ patient, className }: PatientCardProps) {
  const age = calculateAge(patient.date_of_birth);

  return (
    <Link
      href={`/patients/${patient.id}`}
      className={cn(
        'border-border bg-card hover:border-primary/30 block rounded-xl border p-5 shadow-sm transition-all',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground truncate text-base font-semibold">
              {patient.first_name} {patient.last_name}
            </h3>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
                statusColors[patient.status],
              )}
            >
              {patient.status}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {age} years &middot; {patient.gender}
          </p>
        </div>
        <ChevronRight className="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
      </div>

      <div className="mt-4 space-y-2">
        {patient.diagnosis_codes && patient.diagnosis_codes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {patient.diagnosis_codes.slice(0, 4).map((code) => (
              <span
                key={code}
                className="bg-secondary/10 text-secondary-foreground rounded-md px-2 py-0.5 text-xs font-medium"
              >
                {code}
              </span>
            ))}
            {patient.diagnosis_codes.length > 4 && (
              <span className="text-muted-foreground text-xs">
                +{patient.diagnosis_codes.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-3 text-xs">
        {patient.phone && (
          <span className="inline-flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {patient.phone}
          </span>
        )}
        {patient.email && (
          <span className="inline-flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {patient.email}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(patient.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
    </Link>
  );
}

interface PatientDetailCardProps {
  patient: Patient;
}

export function PatientDetailCard({ patient }: PatientDetailCardProps) {
  const age = calculateAge(patient.date_of_birth);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">
            {patient.first_name} {patient.last_name}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
                statusColors[patient.status],
              )}
            >
              {patient.status}
            </span>
            <span className="text-muted-foreground text-sm">
              {age} years &middot; {patient.gender}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/patients/${patient.id}/edit`}
            className={cn(
              'border-input bg-background text-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium',
              'hover:bg-accent transition-colors',
            )}
          >
            <FileText className="h-4 w-4" />
            Edit
          </Link>
          <Link
            href={`/patients/${patient.id}/delete`}
            className={cn(
              'border-destructive/30 text-destructive inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium',
              'hover:bg-destructive/10 transition-colors',
            )}
          >
            Delete
          </Link>
        </div>
      </div>

      {/* Key Info Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Personal Info */}
          <div className="border-border bg-card rounded-xl border p-5">
            <h3 className="text-foreground mb-4 text-sm font-semibold uppercase tracking-wider">
              Personal Information
            </h3>
            <dl className="space-y-3">
              <InfoRow label="Date of Birth" value={new Date(patient.date_of_birth).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })} />
              <InfoRow label="Gender" value={patient.gender} />
              {patient.phone && <InfoRow label="Phone" value={patient.phone} />}
              {patient.email && <InfoRow label="Email" value={patient.email} />}
            </dl>
          </div>

          {/* Address */}
          {patient.address && (patient.address.street || patient.address.city) && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h3 className="text-foreground mb-4 text-sm font-semibold uppercase tracking-wider">
                Address
              </h3>
              <p className="text-foreground text-sm">
                {[patient.address.street, patient.address.city, patient.address.state, patient.address.zip]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          )}

          {/* Emergency Contact */}
          {patient.emergency_contact?.name && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h3 className="text-foreground mb-4 text-sm font-semibold uppercase tracking-wider">
                Emergency Contact
              </h3>
              <dl className="space-y-3">
                <InfoRow label="Name" value={patient.emergency_contact.name} />
                {patient.emergency_contact.relationship && (
                  <InfoRow label="Relationship" value={patient.emergency_contact.relationship} />
                )}
                {patient.emergency_contact.phone && (
                  <InfoRow label="Phone" value={patient.emergency_contact.phone} />
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Insurance */}
          {(patient.insurance_provider || patient.insurance_id) && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h3 className="text-foreground mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                <Shield className="h-4 w-4" />
                Insurance
              </h3>
              <dl className="space-y-3">
                {patient.insurance_provider && <InfoRow label="Provider" value={patient.insurance_provider} />}
                {patient.insurance_id && <InfoRow label="Member ID" value={patient.insurance_id} />}
                {patient.insurance_group_number && <InfoRow label="Group Number" value={patient.insurance_group_number} />}
              </dl>
            </div>
          )}

          {/* Diagnosis Codes */}
          <div className="border-border bg-card rounded-xl border p-5">
            <h3 className="text-foreground mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <Activity className="h-4 w-4" />
              Diagnosis Codes
            </h3>
            {patient.diagnosis_codes && patient.diagnosis_codes.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {patient.diagnosis_codes.map((code) => (
                  <span
                    key={code}
                    className="bg-secondary/10 text-secondary-foreground rounded-md px-2.5 py-1 text-xs font-medium"
                  >
                    {code}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm italic">No diagnosis codes</p>
            )}
          </div>

          {/* Tags */}
          {patient.tags && patient.tags.length > 0 && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h3 className="text-foreground mb-4 text-sm font-semibold uppercase tracking-wider">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {patient.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-accent text-accent-foreground rounded-md px-2.5 py-1 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {patient.notes && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h3 className="text-foreground mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                <ClipboardList className="h-4 w-4" />
                Notes
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                {patient.notes}
              </p>
            </div>
          )}
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
      <dd className="text-foreground text-sm font-medium text-right">{value}</dd>
    </div>
  );
}
