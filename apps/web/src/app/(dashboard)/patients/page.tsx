'use client';

import { Search, UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { usePatients } from '@/hooks/use-patients';
import { PatientList } from '@/components/patients/patient-list';

export default function PatientsPage() {
  const { data: patients, isLoading, error } = usePatients();
  const [search, setSearch] = useState('');

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Patients</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your patient records
          </p>
        </div>
        <Link
          href="/patients/new"
          className={cn(
            'bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
            'hover:bg-primary/90 transition-colors',
            'focus:ring-primary focus:ring-offset-background focus:ring-2 focus:ring-offset-2 focus:outline-none',
          )}
        >
          <UserPlus className="h-4 w-4" />
          New Patient
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or diagnosis code..."
          className={cn(
            'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
            'placeholder:text-muted-foreground/60',
            'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
            'transition-colors',
          )}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-6 rounded-lg border px-4 py-3 text-sm">
          Failed to load patients. Please try again.
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && patients && patients.length === 0 && (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <UserPlus className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="text-foreground text-lg font-semibold">No patients yet</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Create your first patient record to get started.
          </p>
          <Link
            href="/patients/new"
            className={cn(
              'bg-primary text-primary-foreground mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
              'hover:bg-primary/90 transition-colors',
            )}
          >
            <UserPlus className="h-4 w-4" />
            New Patient
          </Link>
        </div>
      )}

      {/* Patient list */}
      {!isLoading && !error && patients && patients.length > 0 && (
        <PatientList data={patients} isLoading={false} />
      )}
    </div>
  );
}
