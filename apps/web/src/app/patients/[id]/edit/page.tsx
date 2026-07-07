'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { usePatient } from '@/hooks/use-patients';
import { updatePatient } from '@/app/_actions/patients';
import { PatientForm } from '@/components/forms/patient-form';
import type { PatientFormData } from '@/types/patient';

export default function EditPatientPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: patient, isLoading, error } = usePatient(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (formData: PatientFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await updatePatient(id, formData);
      if (result && 'error' in result) {
        return result as { error: Record<string, unknown> };
      }
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setSubmitError(message);
      setIsSubmitting(false);
      return { error: { _form: [message] } };
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
      <div className="mx-auto max-w-3xl px-6 py-8">
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
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href={`/patients/${id}`}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to patient
      </Link>

      <div className="mb-8">
        <h1 className="text-foreground text-2xl font-bold">
          Edit: {patient.first_name} {patient.last_name}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Update patient information
        </p>
      </div>

      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <PatientForm
          mode="edit"
          patient={patient}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={submitError}
        />
      </div>
    </div>
  );
}
