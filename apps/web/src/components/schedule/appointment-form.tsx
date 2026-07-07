'use client';

import { useState, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  User,
  ChevronDown,
  X,
  Search,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { AppointmentType } from '@/types/appointment';
import { APPOINTMENT_TYPE_OPTIONS } from '@/types/appointment';
import { useCreateAppointment, useUpdateAppointment } from '@/hooks/use-appointments';

// ── Zod-like validation (inline since zod is available) ─────────────────────
// Using Zod v4 from the project dependencies
import { z } from 'zod';

const appointmentFormSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
  appointment_type: z.enum([
    'initial_evaluation',
    'follow_up',
    'reevaluation',
    'discharge',
    'telehealth',
    'phone_consult',
  ] as const),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  duration_minutes: z.coerce.number().min(15, 'Minimum 15 minutes').max(120, 'Maximum 2 hours'),
  notes: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurring_frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
  recurring_end_date: z.string().optional(),
  provider_id: z.string().optional(),
  room: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

// ── Duration Options ────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
] as const;

// ── The dependency data shapes ──────────────────────────────────────────────

interface PatientOption {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
}

interface ProviderOption {
  id: string;
  first_name: string;
  last_name: string;
  specialty?: string | null;
}

// ── Props ───────────────────────────────────────────────────────────────────

interface AppointmentFormProps {
  /** Pre-populated values for editing an existing appointment */
  initialValues?: Partial<AppointmentFormValues> & { id?: string };
  /** Default date to pre-select */
  defaultDate?: string;
  /** Default time to pre-select (HH:mm) */
  defaultTime?: string;
  /** Callback after successful save */
  onSuccess?: () => void;
  /** Callback to cancel/close */
  onCancel?: () => void;
  /** Async patient search */
  searchPatients?: (query: string) => Promise<PatientOption[]>;
  /** Async provider list/ search */
  searchProviders?: (query: string) => Promise<ProviderOption[]>;
}

// ── Field Error Component ───────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

// ── Label Component ─────────────────────────────────────────────────────────

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-foreground mb-1.5 block text-sm font-medium">
      {children}
      {required && <span className="ml-0.5 text-red-400">*</span>}
    </label>
  );
}

// ── Main Form Component ─────────────────────────────────────────────────────

export function AppointmentForm({
  initialValues,
  defaultDate,
  defaultTime,
  onSuccess,
  onCancel,
  searchPatients,
  searchProviders,
}: AppointmentFormProps) {
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const isEdit = !!initialValues?.id;

  // ── Form State ──────────────────────────────────────────────────────────
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);

  const [providerQuery, setProviderQuery] = useState('');
  const [providerResults, setProviderResults] = useState<ProviderOption[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderOption | null>(null);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [isSearchingProviders, setIsSearchingProviders] = useState(false);

  const [appointmentType, setAppointmentType] = useState<AppointmentType>(
    initialValues?.appointment_type ?? 'initial_evaluation',
  );
  const [date, setDate] = useState(initialValues?.date ?? defaultDate ?? '');
  const [startTime, setStartTime] = useState(initialValues?.start_time ?? defaultTime ?? '09:00');
  const [endTime, setEndTime] = useState(initialValues?.end_time ?? '');
  const [duration, setDuration] = useState(initialValues?.duration_minutes ?? 30);
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [isRecurring, setIsRecurring] = useState(initialValues?.is_recurring ?? false);
  const [recurringFrequency, setRecurringFrequency] = useState('weekly');
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [room, setRoom] = useState(initialValues?.room ?? '');

  const [errors, setErrors] = useState<Partial<Record<keyof AppointmentFormValues, string>>>({});
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // ── Auto-calculate end time from start + duration ──────────────────────
  const updateEndTimeFromDuration = useCallback(
    (start: string, dur: number) => {
      if (!start) return;
      const [h, m] = start.split(':').map(Number);
      if (h === undefined || m === undefined) return;
      const totalMinutes = h * 60 + m + dur;
      const endH = Math.floor(totalMinutes / 60);
      const endM = totalMinutes % 60;
      setEndTime(
        `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
      );
    },
    [],
  );

  // ── Patient Search ─────────────────────────────────────────────────────
  const handlePatientSearch = useCallback(
    async (query: string) => {
      setPatientQuery(query);
      if (!query.trim()) {
        setPatientResults([]);
        setShowPatientDropdown(false);
        return;
      }
      if (searchPatients) {
        setIsSearchingPatients(true);
        try {
          const results = await searchPatients(query);
          setPatientResults(results);
          setShowPatientDropdown(true);
        } finally {
          setIsSearchingPatients(false);
        }
      }
    },
    [searchPatients],
  );

  // ── Provider Search ────────────────────────────────────────────────────
  const handleProviderSearch = useCallback(
    async (query: string) => {
      setProviderQuery(query);
      if (!query.trim()) {
        setProviderResults([]);
        setShowProviderDropdown(false);
        return;
      }
      if (searchProviders) {
        setIsSearchingProviders(true);
        try {
          const results = await searchProviders(query);
          setProviderResults(results);
          setShowProviderDropdown(true);
        } finally {
          setIsSearchingProviders(false);
        }
      }
    },
    [searchProviders],
  );

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const formData: AppointmentFormValues = {
        patient_id: selectedPatient?.id ?? initialValues?.patient_id ?? '',
        appointment_type: appointmentType,
        date,
        start_time: startTime,
        end_time: endTime || undefined as unknown as string,
        duration_minutes: duration,
        notes,
        is_recurring: isRecurring,
        provider_id: selectedProvider?.id ?? initialValues?.provider_id,
        room: room || undefined,
      };

      const result = appointmentFormSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Partial<Record<keyof AppointmentFormValues, string>> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as keyof AppointmentFormValues;
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }
        setErrors(fieldErrors);
        return;
      }

      setErrors({});

      // Build ISO datetime strings
      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = endTime ? `${date}T${endTime}:00` : undefined;

      try {
        if (isEdit && initialValues?.id) {
          await updateMutation.mutateAsync({
            id: initialValues.id,
            patient_id: selectedPatient?.id ?? initialValues.patient_id ?? '',
            appointment_type: appointmentType,
            start_time: startDateTime,
            end_time: endDateTime ?? startDateTime,
            duration_minutes: duration,
            notes: notes || undefined,
            is_recurring: isRecurring,
            location: room || undefined,
          });
        } else {
          await createMutation.mutateAsync({
            patient_id: selectedPatient?.id ?? '',
            appointment_type: appointmentType,
            start_time: startDateTime,
            end_time: endDateTime ?? startDateTime,
            duration_minutes: duration,
            notes: notes || undefined,
            is_recurring: isRecurring,
            location: room || undefined,
          });
        }
        onSuccess?.();
      } catch {
        // Error handled by react-query
      }
    },
    [
      selectedPatient,
      appointmentType,
      date,
      startTime,
      endTime,
      duration,
      notes,
      isRecurring,
      selectedProvider,
      room,
      initialValues,
      isEdit,
      createMutation,
      updateMutation,
      onSuccess,
    ],
  );

  // ── Render ─────────────────────────────────────────────────────────────
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Selection */}
      <div>
        <FieldLabel required>Patient</FieldLabel>
        <div className="relative">
          {selectedPatient ? (
            <div className="border-border bg-card flex items-center gap-2 rounded-lg border px-3 py-2">
              <User className="text-muted-foreground h-4 w-4" />
              <span className="text-foreground flex-1 text-sm">
                {selectedPatient.first_name} {selectedPatient.last_name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedPatient(null);
                  setPatientQuery('');
                }}
                className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                value={patientQuery}
                onChange={(e) => handlePatientSearch(e.target.value)}
                onFocus={() => patientResults.length > 0 && setShowPatientDropdown(true)}
                placeholder="Search patients by name..."
                className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
              />
              {isSearchingPatients && (
                <Loader2 className="text-muted-foreground absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
              )}
            </div>
          )}
          {showPatientDropdown && patientResults.length > 0 && (
            <div className="border-border bg-popover text-popover-foreground absolute z-50 mt-1 w-full rounded-lg border p-1 shadow-lg">
              {patientResults.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPatient(p);
                    setShowPatientDropdown(false);
                    setPatientQuery('');
                  }}
                  className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors"
                >
                  <User className="text-muted-foreground h-3.5 w-3.5" />
                  <span className="flex-1">
                    {p.first_name} {p.last_name}
                  </span>
                  {p.phone && (
                    <span className="text-muted-foreground text-[10px]">
                      {p.phone}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <FieldError message={errors.patient_id} />
      </div>

      {/* Appointment Type */}
      <div>
        <FieldLabel required>Appointment Type</FieldLabel>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="border-border bg-background text-foreground flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
          >
            <span>
              {APPOINTMENT_TYPE_OPTIONS.find(
                (o) => o.value === appointmentType,
              )?.label ?? appointmentType}
            </span>
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          </button>
          {showTypeDropdown && (
            <div className="border-border bg-popover text-popover-foreground absolute z-50 mt-1 w-full rounded-lg border p-1 shadow-lg">
              {APPOINTMENT_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setAppointmentType(opt.value);
                    setShowTypeDropdown(false);
                  }}
                  className={cn(
                    'hover:bg-accent flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors',
                    opt.value === appointmentType && 'bg-accent font-medium',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <FieldError message={errors.appointment_type} />
      </div>

      {/* Date & Time Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <FieldLabel required>Date</FieldLabel>
          <div className="relative">
            <Calendar className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-border bg-background text-foreground w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
            />
          </div>
          <FieldError message={errors.date} />
        </div>

        {/* Duration */}
        <div>
          <FieldLabel required>Duration</FieldLabel>
          <div className="grid grid-cols-4 gap-1.5">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setDuration(opt.value);
                  updateEndTimeFromDuration(startTime, opt.value);
                }}
                className={cn(
                  'rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                  duration === opt.value
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <FieldError message={errors.duration_minutes} />
        </div>
      </div>

      {/* Start & End Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Start Time</FieldLabel>
          <div className="relative">
            <Clock className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                updateEndTimeFromDuration(e.target.value, duration);
              }}
              className="border-border bg-background text-foreground w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
            />
          </div>
          <FieldError message={errors.start_time} />
        </div>
        <div>
          <FieldLabel>End Time</FieldLabel>
          <div className="relative">
            <Clock className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border-border bg-background text-foreground w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
            />
          </div>
          <FieldError message={errors.end_time} />
        </div>
      </div>

      {/* Provider / Room */}
      <div className="grid grid-cols-2 gap-4">
        {/* Provider */}
        <div>
          <FieldLabel>Provider</FieldLabel>
          <div className="relative">
            {selectedProvider ? (
              <div className="border-border bg-card flex items-center gap-2 rounded-lg border px-3 py-2">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground flex-1 text-sm">
                  {selectedProvider.first_name} {selectedProvider.last_name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProvider(null);
                    setProviderQuery('');
                  }}
                  className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  value={providerQuery}
                  onChange={(e) => handleProviderSearch(e.target.value)}
                  onFocus={() =>
                    providerResults.length > 0 && setShowProviderDropdown(true)
                  }
                  placeholder="Search providers..."
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                />
                {isSearchingProviders && (
                  <Loader2 className="text-muted-foreground absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
                )}
              </div>
            )}
            {showProviderDropdown && providerResults.length > 0 && (
              <div className="border-border bg-popover text-popover-foreground absolute z-50 mt-1 w-full rounded-lg border p-1 shadow-lg">
                {providerResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProvider(p);
                      setShowProviderDropdown(false);
                      setProviderQuery('');
                    }}
                    className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors"
                  >
                    <User className="text-muted-foreground h-3.5 w-3.5" />
                    <span className="flex-1">
                      {p.first_name} {p.last_name}
                    </span>
                    {p.specialty && (
                      <span className="text-muted-foreground text-[10px]">
                        {p.specialty}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Room */}
        <div>
          <FieldLabel>Room</FieldLabel>
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="e.g. Room 101, Gym A"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <FieldLabel>Notes</FieldLabel>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this appointment..."
          rows={3}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
        />
      </div>

      {/* Recurring Toggle */}
      <div>
        <label className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsRecurring(!isRecurring)}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none',
              isRecurring ? 'bg-blue-500' : 'bg-muted',
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                isRecurring ? 'translate-x-4' : 'translate-x-0',
              )}
            />
          </button>
          <span className="text-foreground text-sm font-medium">
            <RefreshCw className="mr-1.5 inline-block h-3.5 w-3.5" />
            Recurring appointment
          </span>
        </label>

        {isRecurring && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Frequency
              </label>
              <select
                value={recurringFrequency}
                onChange={(e) => setRecurringFrequency(e.target.value)}
                className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                End Date
              </label>
              <input
                type="date"
                value={recurringEndDate}
                onChange={(e) => setRecurringEndDate(e.target.value)}
                className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-xs font-medium text-red-400">
            Please fix the errors above before saving.
          </p>
        </div>
      )}

      {/* Submit Error */}
      {(createMutation.error || updateMutation.error) && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-xs font-medium text-red-400">
            Failed to save appointment. Please try again.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Appointment' : 'Create Appointment'}
        </button>
      </div>
    </form>
  );
}
