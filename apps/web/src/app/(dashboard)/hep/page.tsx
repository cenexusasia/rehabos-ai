'use client';

import { useState } from 'react';
import {
  Loader2,
  Dumbbell,
  Search,
  ChevronRight,
  User,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useHEPsByClinician } from '@/hooks/use-hep';
import { useUser } from '@/hooks/use-user';
import { usePatients } from '@/hooks/use-patients';
import { HEP_STATUS_COLORS } from '@/types/exercise';
import type { HomeExerciseProgramListItem } from '@/types/hep';

export default function HEPListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: user } = useUser();
  const clinicianId = user?.id ?? '';
  const { data: programs, isLoading, error } = useHEPsByClinician(clinicianId);

  // Get patients map for quick lookup
  const { data: patients } = usePatients();
  const patientMap = new Map(
    (patients ?? []).map((p) => [p.id, `${p.first_name} ${p.last_name}`]),
  );

  const filteredPrograms = (programs ?? []).filter((p) => {
    if (search) {
      const nameMatch = p.title.toLowerCase().includes(search.toLowerCase());
      const patientName = (patientMap.get(p.patient_id) ?? '').toLowerCase();
      return nameMatch || patientName.includes(search.toLowerCase());
    }
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">
            Home Exercise Programs
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage exercise prescriptions for your patients
          </p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search programs by title or patient name..."
            className={cn(
              'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
              'placeholder:text-muted-foreground/60',
              'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
              'transition-colors',
            )}
          />
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-1.5">
          {['', 'active', 'paused', 'completed', 'archived'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all capitalize',
                statusFilter === status || (!statusFilter && !status)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : status
                    ? cn(HEP_STATUS_COLORS[status as keyof typeof HEP_STATUS_COLORS] ?? '')
                    : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-6 rounded-lg border px-4 py-3 text-sm">
          Failed to load HEP programs.
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && filteredPrograms.length === 0 && (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <Dumbbell className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="text-foreground text-lg font-semibold">
            {search || statusFilter
              ? 'No programs match your filters'
              : 'No HEP programs yet'}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {search || statusFilter
              ? 'Try adjusting your search or filters.'
              : 'Create a home exercise program for a patient to get started.'}
          </p>
        </div>
      )}

      {/* Program list */}
      {!isLoading && !error && filteredPrograms.length > 0 && (
        <div className="space-y-2">
          {filteredPrograms.map((program) => (
            <HEPProgramRow
              key={program.id}
              program={program}
              patientName={patientMap.get(program.patient_id) ?? 'Unknown Patient'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HEPProgramRow({
  program,
  patientName,
}: {
  program: HomeExerciseProgramListItem;
  patientName: string;
}) {
  return (
    <Link
      href={`/patients/${program.patient_id}/hep`}
      className={cn(
        'border-border bg-card group relative flex items-center gap-4 rounded-xl border p-4 transition-all',
        'hover:border-primary/30 hover:shadow-sm',
      )}
    >
      {/* Icon */}
      <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
        <Dumbbell className="h-5 w-5" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground truncate text-sm font-semibold group-hover:text-primary transition-colors">
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
          <span className="inline-flex items-center gap-1">
            <User className="h-3 w-3" />
            {patientName}
          </span>
          {program.frequency && (
            <span className="capitalize">
              {program.frequency.replace(/_/g, ' ')}
            </span>
          )}
          {program.duration_weeks && (
            <span>{program.duration_weeks} weeks</span>
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

      <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
