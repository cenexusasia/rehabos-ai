'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { usePatient } from '@/hooks/use-patients';
import { createVisit } from '@/app/_actions/visits';
import { VISIT_TYPE_OPTIONS } from '@/types/visit';
import type { VisitFormData } from '@/types/visit';

export default function NewVisitPage() {
  const params = useParams();
  const patientId = params.id as string;
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [visitType, setVisitType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0] as string);
  const [duration, setDuration] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          Patient not found.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    const formData = {
      patient_id: patientId as string,
      visit_type: visitType as VisitFormData['visit_type'],
      date: date as string,
      duration_minutes: duration ? parseInt(duration, 10) : null,
      chief_complaint: chiefComplaint || null,
    } as VisitFormData;

    try {
      const result = await createVisit(formData);
      if (result && 'error' in result) {
        const errs = result.error as Record<string, string[] | { _form?: string[] }>;
        if (errs._form) {
          setError((errs._form as string[]).join(', '));
          setIsSubmitting(false);
        } else {
          setFieldErrors(errs as Record<string, string[]>);
        }
        setIsSubmitting(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setIsSubmitting(false);
    }
  };

  const inputClass = cn(
    'border-input bg-background text-foreground w-full rounded-lg border py-2 px-3 text-sm',
    'placeholder:text-muted-foreground/60',
    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
    'transition-colors',
  );

  const labelClass = 'text-foreground text-sm font-medium';
  const errorClass = 'text-destructive text-xs mt-1';

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href={`/patients/${patientId}`}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to patient
      </Link>

      <div className="mb-8">
        <h1 className="text-foreground text-2xl font-bold">New Visit</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create a new visit for{' '}
          <span className="text-foreground font-medium">
            {patient.first_name} {patient.last_name}
          </span>
        </p>
      </div>

      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error display */}
          {error && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Visit Type */}
          <section>
            <h3 className="text-foreground mb-4 text-base font-semibold">Visit Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Visit Type */}
              <div className="space-y-1.5">
                <label htmlFor="visit_type" className={labelClass}>
                  Visit Type *
                </label>
                <select
                  id="visit_type"
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value)}
                  required
                  className={cn(inputClass, 'appearance-none')}
                >
                  <option value="">Select visit type...</option>
                  {VISIT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.visit_type && (
                  <p className={errorClass}>{fieldErrors.visit_type[0]}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label htmlFor="date" className={labelClass}>
                  Date *
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className={inputClass}
                />
                {fieldErrors.date && (
                  <p className={errorClass}>{fieldErrors.date[0]}</p>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label htmlFor="duration" className={labelClass}>
                  Duration (minutes)
                </label>
                <input
                  id="duration"
                  type="number"
                  min={1}
                  max={480}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 45"
                  className={inputClass}
                />
                {fieldErrors.duration_minutes && (
                  <p className={errorClass}>{fieldErrors.duration_minutes[0]}</p>
                )}
              </div>
            </div>
          </section>

          {/* Chief Complaint */}
          <section>
            <h3 className="text-foreground mb-4 text-base font-semibold">
              Clinical Information
            </h3>
            <div className="space-y-1.5">
              <label htmlFor="chief_complaint" className={labelClass}>
                Chief Complaint
              </label>
              <textarea
                id="chief_complaint"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Describe the patient's primary reason for this visit..."
                rows={4}
                className={cn(inputClass, 'resize-y')}
              />
              {fieldErrors.chief_complaint && (
                <p className={errorClass}>{fieldErrors.chief_complaint[0]}</p>
              )}
            </div>
          </section>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
            <Link
              href={`/patients/${patientId}`}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium',
                'hover:bg-primary/90 transition-colors',
                'disabled:pointer-events-none disabled:opacity-50',
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Visit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
