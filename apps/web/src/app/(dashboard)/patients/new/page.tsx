'use client';

import { useState } from 'react';

import { createPatient } from '@/app/_actions/patients';
import { PatientForm } from '@/components/forms/patient-form';
import type { PatientFormData } from '@/types/patient';

export default function NewPatientPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: PatientFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createPatient(formData);
      if (result && 'error' in result) {
        return result as { error: Record<string, unknown> };
      }
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setIsSubmitting(false);
      return { error: { _form: [message] } };
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-foreground text-2xl font-bold">New Patient</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create a new patient record
        </p>
      </div>

      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <PatientForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    </div>
  );
}
