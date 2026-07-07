'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  Dumbbell,
  Plus,
  Eye,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { usePatient } from '@/hooks/use-patients';
import { useHEPsByPatient } from '@/hooks/use-hep';
import { HEP_STATUS_COLORS } from '@/types/exercise';
import type { HomeExerciseProgramListItem } from '@/types/hep';

export default function PatientHEPListPage() {
  const params = useParams();
  const patientId = params.id as string;

  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: programs, isLoading, error } = useHEPsByPatient(patientId);

  const patientName = patient
    ? `${patient.first_name} ${patient.last_name}`
    : 'Loading...';

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href={`/patients/${patientId}`}
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {patientName}
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">
            Home Exercise Programs
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {patientName}
          </p>
        </div>
        <Link
          href={`/patients/${patientId}/hep/new`}
          className={cn(
            'bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
            'hover:bg-primary/90 transition-colors',
          )}
        >
          <Plus className="h-4 w-4" />
          New Program
        </Link>
      </div>

      {/* Loading */}
      {(isLoading || patientLoading) && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-6 rounded-lg border px-4 py-3 text-sm">
          Failed to load HEP programs.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && programs && programs.length === 0 && (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <Dumbbell className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="text-foreground text-lg font-semibold">
            No HEP programs yet
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Create a home exercise program for {patientName}.
          </p>
          <Link
            href={`/patients/${patientId}/hep/new`}
            className={cn(
              'bg-primary text-primary-foreground mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
              'hover:bg-primary/90 transition-colors',
            )}
          >
            <Plus className="h-4 w-4" />
            Create Program
          </Link>
        </div>
      )}

      {/* Program list */}
      {!isLoading && !error && programs && programs.length > 0 && (
        <div className="space-y-2">
          {programs.map((program) => (
            <HEPProgramCard
              key={program.id}
              program={program}
              patientId={patientId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HEPProgramCard({
  program,
  patientId,
}: {
  program: HomeExerciseProgramListItem;
  patientId: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="border-border bg-card group rounded-xl border transition-all hover:border-primary/30">
      <div className="flex items-center gap-4 p-4">
        {/* Icon */}
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Dumbbell className="h-5 w-5" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground truncate text-sm font-semibold">
              {program.title}
            </h3>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
                HEP_STATUS_COLORS[program.status],
              )}
            >
              {program.status}
            </span>
          </div>
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {program.frequency && (
              <span className="capitalize">
                {program.frequency.replace(/_/g, ' ')}
              </span>
            )}
            {program.duration_weeks && (
              <span>{program.duration_weeks} weeks</span>
            )}
            {program.compliance_percent !== null && (
              <span>Compliance: {program.compliance_percent}%</span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(program.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="relative flex items-center gap-1">
          <Link
            href={`/patients/${patientId}/hep/${program.id}`}
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
