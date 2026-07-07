'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Loader2,
  Calendar,
  Stethoscope,
  ChevronRight,
  AlertCircle,
  PenLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSoapNotes, useSoapNoteCounts } from '@/hooks/use-soap';
import type { SoapNoteListItem } from '@/lib/supabase/queries/soap';

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  },
  completed: {
    label: 'Completed',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  signed: {
    label: 'Signed',
    className: 'border-green-500/30 bg-green-500/10 text-green-400',
  },
  amended: {
    label: 'Amended',
    className: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  },
  corrected: {
    label: 'Corrected',
    className: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.draft;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config!.className,
      )}
    >
      <PenLine className="h-3 w-3" />
      {config!.label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">No SOAP notes yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Clinical documentation will appear here. Create your first SOAP note
        from a patient visit.
      </p>
    </div>
  );
}

function SoapNoteCard({ note }: { note: SoapNoteListItem }) {
  const patientName = note.patient
    ? `${note.patient.first_name} ${note.patient.last_name}`
    : 'Unknown Patient';

  const clinicianName = note.clinician
    ? `${note.clinician.first_name} ${note.clinician.last_name}`
    : 'Unknown Clinician';

  return (
    <Link
      href={`/soap/${note.id}`}
      className={cn(
        'block rounded-xl border border-border bg-card p-5 shadow-sm',
        'hover:border-primary/30 hover:shadow-md transition-all',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={note.status} />
            {note.visit?.type && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {note.visit.type}
              </span>
            )}
          </div>

          <p className="truncate text-sm font-medium text-foreground">
            {patientName}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {note.visit?.visit_date
                ? new Date(note.visit.visit_date).toLocaleDateString()
                : new Date(note.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Stethoscope className="h-3 w-3" />
              {clinicianName}
            </span>
          </div>
        </div>

        <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
      </div>
    </Link>
  );
}

export default function SoapListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useSoapNotes({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit: 20,
  });

  const { data: counts } = useSoapNoteCounts();

  const notes = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 20);

  const filteredNotes = searchQuery
    ? notes.filter((n) => {
        const patientName = n.patient
          ? `${n.patient.first_name} ${n.patient.last_name}`
          : '';
        const clinicianName = n.clinician
          ? `${n.clinician.first_name} ${n.clinician.last_name}`
          : '';
        const query = searchQuery.toLowerCase();
        return (
          patientName.toLowerCase().includes(query) ||
          clinicianName.toLowerCase().includes(query) ||
          n.status.toLowerCase().includes(query)
        );
      })
    : notes;

  const statusTabs = [
    { key: 'all', label: 'All', count: totalCount },
    { key: 'draft', label: 'Drafts', count: counts?.draft ?? 0 },
    { key: 'completed', label: 'Completed', count: counts?.completed ?? 0 },
    { key: 'signed', label: 'Signed', count: counts?.signed ?? 0 },
    { key: 'amended', label: 'Amended', count: counts?.amended ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            SOAP Notes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Clinical documentation and progress notes
          </p>
        </div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New from Patient
        </Link>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient or clinician..."
            className={cn(
              'w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm',
              'placeholder:text-muted-foreground/60',
              'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
              'transition-colors',
            )}
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key);
              setPage(1);
            }}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === tab.key
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-60">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Failed to load SOAP notes. Please try again.
          </div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredNotes.map((note) => (
              <SoapNoteCard key={note.id} note={note} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
