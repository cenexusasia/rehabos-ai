'use client';

import { useState, useCallback } from 'react';
import {
  ArrowLeft,
  Loader2,
  Info,
  AlertTriangle,
  Calendar,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { usePatient } from '@/hooks/use-patients';
import { useCreateHEP } from '@/hooks/use-hep';
import { HEPBuilder } from '@/components/hep/hep-builder';
import type { ProgramExerciseInput } from '@/types/hep';

export default function NewHEPPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const createHEP = useCreateHEP();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [precautions, setPrecautions] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0] ?? '',
  );

  const patientName = patient
    ? `${patient.first_name} ${patient.last_name}`
    : 'Loading...';

  const handleSave = useCallback(
    async (builderExercises: {
      exercise_id: string;
      sort_order: number;
      parameters: {
        sets: number;
        reps: string;
        hold_seconds: number;
        rest_seconds: number;
        intensity_percent: number | null;
        rpe: number | null;
        notes: string | null;
        frequency: string | null;
      };
    }[]) => {
      const exercises: ProgramExerciseInput[] = builderExercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        sort_order: ex.sort_order,
        parameters: ex.parameters,
      }));

      await createHEP.mutateAsync({
        formData: {
          patient_id: patientId,
          title: title || `HEP — ${patientName}`,
          description: description || null,
          goal: goal || null,
          precautions: precautions || null,
          frequency: frequency || null,
          duration_weeks: durationWeeks || null,
          start_date: startDate || null,
          end_date: null,
        },
        exercises,
      });

      router.push(`/patients/${patientId}/hep`);
    },
    [
      patientId,
      patientName,
      title,
      description,
      goal,
      precautions,
      frequency,
      durationWeeks,
      startDate,
      createHEP,
      router,
    ],
  );

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href={`/patients/${patientId}/hep`}
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to HEP programs
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-foreground text-2xl font-bold">
          New Home Exercise Program
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create a new exercise prescription for {patientName}
        </p>
      </div>

      <div className="space-y-6">
        {/* Program Details */}
        <div className="border-border bg-card rounded-xl border p-5">
          <h2 className="text-foreground mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
            <Info className="h-4 w-4" />
            Program Details
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="text-muted-foreground mb-1.5 block text-xs font-medium uppercase tracking-wider">
                Program Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`HEP — ${patientName}`}
                className={cn(
                  'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm',
                  'placeholder:text-muted-foreground/60',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                  'transition-colors',
                )}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="text-muted-foreground mb-1.5 block text-xs font-medium uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the program..."
                rows={2}
                className={cn(
                  'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm',
                  'placeholder:text-muted-foreground/60',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                  'transition-colors resize-none',
                )}
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="text-muted-foreground mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                <Clock className="h-3 w-3" />
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className={cn(
                  'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                  'appearance-none transition-colors',
                )}
              >
                <option value="daily">Daily</option>
                <option value="2x/day">2× / day</option>
                <option value="3x/day">3× / day</option>
                <option value="every_other_day">Every other day</option>
                <option value="3x/week">3× / week</option>
                <option value="2x/week">2× / week</option>
                <option value="1x/week">1× / week</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="text-muted-foreground mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                <Calendar className="h-3 w-3" />
                Duration (weeks)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  min={1}
                  max={52}
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    'transition-colors',
                  )}
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-muted-foreground mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                <Calendar className="h-3 w-3" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={cn(
                  'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                  'transition-colors',
                )}
              />
            </div>

            {/* Goal */}
            <div className="md:col-span-2">
              <label className="text-muted-foreground mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                <Info className="h-3 w-3" />
                Goal
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What should the patient achieve with this program?"
                rows={2}
                className={cn(
                  'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm',
                  'placeholder:text-muted-foreground/60',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                  'transition-colors resize-none',
                )}
              />
            </div>

            {/* Precautions */}
            <div className="md:col-span-2">
              <label className="text-muted-foreground mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                <AlertTriangle className="h-3 w-3" />
                Precautions
              </label>
              <textarea
                value={precautions}
                onChange={(e) => setPrecautions(e.target.value)}
                placeholder="Any precautions the patient should be aware of..."
                rows={2}
                className={cn(
                  'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm',
                  'placeholder:text-muted-foreground/60',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                  'transition-colors resize-none',
                )}
              />
            </div>
          </div>
        </div>

        {/* HEP Builder */}
        <HEPBuilder onSave={handleSave} isSaving={createHEP.isPending} />
      </div>
    </div>
  );
}
