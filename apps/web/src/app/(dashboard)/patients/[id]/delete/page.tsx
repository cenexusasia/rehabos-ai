'use client';

import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { usePatient } from '@/hooks/use-patients';
import { deletePatient } from '@/app/_actions/patients';

export default function DeletePatientPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: patient, isLoading, error } = usePatient(id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deletePatient(id);
      if (result && typeof result.error === 'string') {
        setDeleteError(result.error);
        setIsDeleting(false);
        return;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete patient';
      setDeleteError(message);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="mx-auto max-w-lg px-6 py-8">
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          Patient not found or failed to load.
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

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <Link
        href={`/patients/${id}`}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to patient
      </Link>

      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <div className="text-center">
          <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-6 w-6" />
          </div>
          <h1 className="text-foreground text-xl font-bold">Delete Patient</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Are you sure you want to delete{' '}
            <span className="text-foreground font-medium">
              {patient.first_name} {patient.last_name}
            </span>
            ? This will soft-delete the record and can be recovered if needed.
          </p>

          {deleteError && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive mt-4 rounded-lg border px-3 py-2 text-sm">
              {deleteError}
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href={`/patients/${id}`}
              className={cn(
                'border-input bg-background text-foreground rounded-lg border px-4 py-2.5 text-sm font-medium',
                'hover:bg-accent transition-colors',
              )}
            >
              Cancel
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={cn(
                'bg-destructive text-destructive-foreground rounded-lg px-4 py-2.5 text-sm font-medium',
                'hover:bg-destructive/90 transition-colors',
                'focus:ring-destructive focus:ring-offset-background focus:ring-2 focus:ring-offset-2 focus:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'inline-flex items-center gap-2',
              )}
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDeleting ? 'Deleting...' : 'Delete Patient'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
