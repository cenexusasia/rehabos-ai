'use client';

import { Calendar, Clock, ChevronRight, Video } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import type {
  AppointmentListItem,
  AppointmentType,
  AppointmentStatus,
} from '@/types/appointment';
import {
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_TYPE_COLORS,
} from '@/types/appointment';
import { formatTime, formatDate } from '@/hooks/use-appointments';

// ── Props ───────────────────────────────────────────────────────────────────

interface AppointmentCardProps {
  appointment: AppointmentListItem;
  showPatient?: boolean;
  compact?: boolean;
  className?: string;
  showTooltip?: boolean;
  onEdit?: (id: string) => void;
}

// ── Duration Indicator ──────────────────────────────────────────────────────

function DurationIndicator({ minutes }: { minutes: number }) {
  const getWidth = () => {
    if (minutes <= 15) return 'w-8';
    if (minutes <= 30) return 'w-12';
    if (minutes <= 45) return 'w-16';
    return 'w-20';
  };

  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
      <span
        className={cn('bg-muted-foreground/30 inline-block h-1 rounded-full', getWidth())}
      />
      {minutes} min
    </span>
  );
}

// ── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const colorMap: Record<AppointmentStatus, string> = {
    scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    no_show: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    rescheduled: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const labels: Record<AppointmentStatus, string> = {
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
    rescheduled: 'Rescheduled',
  };

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
        colorMap[status] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {labels[status] ?? status.replace('_', ' ')}
    </span>
  );
}

// ── Tooltip ─────────────────────────────────────────────────────────────────

function PatientTooltip({
  appointment,
}: {
  appointment: AppointmentListItem;
}) {
  return (
    <div className="border-border bg-popover text-popover-foreground pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg border p-3 shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
      <div className="space-y-1.5">
        {appointment.patient && (
          <>
            <p className="text-sm font-medium">
              {appointment.patient.first_name} {appointment.patient.last_name}
            </p>
            {appointment.patient.phone && (
              <p className="text-xs text-muted-foreground">
                {appointment.patient.phone}
              </p>
            )}
            {appointment.patient.email && (
              <p className="text-xs text-muted-foreground">
                {appointment.patient.email}
              </p>
            )}
          </>
        )}
        <div className="border-border border-t pt-1.5">
          <p className="text-xs text-muted-foreground">
            {APPOINTMENT_TYPE_LABELS[
              appointment.appointment_type as AppointmentType
            ] ?? appointment.appointment_type}
            {' · '}
            {formatTime(appointment.start_time)} –{' '}
            {formatTime(appointment.end_time)}
          </p>
          {appointment.duration_minutes && (
            <p className="text-xs text-muted-foreground">
              {appointment.duration_minutes} minutes
            </p>
          )}
        </div>
        {appointment.notes && (
          <p className="border-border line-clamp-2 border-t pt-1.5 text-xs italic text-muted-foreground">
            {appointment.notes}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────

export function AppointmentCard({
  appointment,
  showPatient = true,
  compact = false,
  className,
  showTooltip = false,
  onEdit,
}: AppointmentCardProps) {
  const typeColor =
    APPOINTMENT_TYPE_COLORS[appointment.appointment_type as AppointmentType] ??
    'bg-muted text-muted-foreground';

  if (compact) {
    return (
      <div className={cn('group relative', className)}>
        {showTooltip && <PatientTooltip appointment={appointment} />}
        <Link
          href={`/schedule/appointments/${appointment.id}`}
          className={cn(
            'border-border bg-card hover:border-primary/30 flex items-center gap-3 rounded-lg border p-3 shadow-sm transition-all',
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* Date/Time Badge */}
            <div className="text-center">
              <p className="text-foreground text-xs font-bold">
                {new Date(appointment.start_time).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-muted-foreground text-[10px]">
                {formatTime(appointment.start_time)}
              </p>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              {showPatient && appointment.patient && (
                <p className="text-foreground truncate text-sm font-medium">
                  {appointment.patient.first_name}{' '}
                  {appointment.patient.last_name}
                </p>
              )}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                    typeColor,
                  )}
                >
                  {APPOINTMENT_TYPE_LABELS[
                    appointment.appointment_type as AppointmentType
                  ] ?? appointment.appointment_type}
                </span>
                {appointment.duration_minutes && (
                  <DurationIndicator minutes={appointment.duration_minutes} />
                )}
              </div>
            </div>

            <StatusBadge status={appointment.status as AppointmentStatus} />
          </div>
          <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
        </Link>
      </div>
    );
  }

  return (
    <div className={cn('group relative', className)}>
      {showTooltip && <PatientTooltip appointment={appointment} />}
      <div
        className={cn(
          'border-border bg-card hover:border-primary/30 block rounded-xl border p-5 shadow-sm transition-all',
        )}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            {/* Type & Status */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  typeColor,
                )}
              >
                {APPOINTMENT_TYPE_LABELS[
                  appointment.appointment_type as AppointmentType
                ] ?? appointment.appointment_type}
              </span>
              <StatusBadge status={appointment.status as AppointmentStatus} />
              {appointment.duration_minutes && (
                <DurationIndicator minutes={appointment.duration_minutes} />
              )}
            </div>

            {/* Patient */}
            {showPatient && appointment.patient && (
              <p className="text-foreground mt-2 text-sm font-medium">
                {appointment.patient.first_name}{' '}
                {appointment.patient.last_name}
              </p>
            )}

            {/* Title */}
            {appointment.title && (
              <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                {appointment.title}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onEdit(appointment.id);
                }}
                className="hover:bg-accent text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
                aria-label="Edit appointment"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Time & Meta */}
        <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(appointment.start_time)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(appointment.start_time)} –{' '}
            {formatTime(appointment.end_time)}
            {appointment.duration_minutes &&
              ` (${appointment.duration_minutes} min)`}
          </span>
          {appointment.telehealth_url && (
            <span className="inline-flex items-center gap-1 text-cyan-400">
              <Video className="h-3 w-3" />
              Telehealth
            </span>
          )}
        </div>

        {/* Notes */}
        {appointment.notes && (
          <p className="text-muted-foreground mt-2 line-clamp-2 border-t border-border pt-2 text-xs italic">
            {appointment.notes}
          </p>
        )}
      </div>
    </div>
  );
}
