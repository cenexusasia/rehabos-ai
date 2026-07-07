'use client';

import { Calendar, Clock, ChevronRight, Video } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { AppointmentListItem, AppointmentType, AppointmentStatus } from '@/types/appointment';
import {
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_TYPE_COLORS,
  APPOINTMENT_STATUS_COLORS,
} from '@/types/appointment';
import { formatTime, formatDate } from '@/hooks/use-appointments';

interface AppointmentCardProps {
  appointment: AppointmentListItem;
  showPatient?: boolean;
  compact?: boolean;
  className?: string;
}

export function AppointmentCard({
  appointment,
  showPatient = true,
  compact = false,
  className,
}: AppointmentCardProps) {
  const typeColor =
    APPOINTMENT_TYPE_COLORS[appointment.appointment_type as AppointmentType] ??
    'bg-muted text-muted-foreground';
  const statusColor =
    APPOINTMENT_STATUS_COLORS[appointment.status as AppointmentStatus] ??
    'bg-muted text-muted-foreground';

  if (compact) {
    return (
      <Link
        href={`/schedule/appointments/${appointment.id}`}
        className={cn(
          'border-border bg-card hover:border-primary/30 flex items-center gap-3 rounded-lg border p-3 shadow-sm transition-all',
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="text-center">
            <p className="text-foreground text-xs font-bold">
              {new Date(appointment.start_time).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p className="text-muted-foreground text-[10px]">{formatTime(appointment.start_time)}</p>
          </div>
          <div className="min-w-0 flex-1">
            {showPatient && appointment.patient && (
              <p className="text-foreground truncate text-sm font-medium">
                {appointment.patient.first_name} {appointment.patient.last_name}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                  typeColor,
                )}
              >
                {APPOINTMENT_TYPE_LABELS[appointment.appointment_type as AppointmentType] ??
                  appointment.appointment_type}
              </span>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
              statusColor,
            )}
          >
            {appointment.status}
          </span>
        </div>
        <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
      </Link>
    );
  }

  return (
    <Link
      href={`/schedule/appointments/${appointment.id}`}
      className={cn(
        'border-border bg-card hover:border-primary/30 block rounded-xl border p-5 shadow-sm transition-all',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                typeColor,
              )}
            >
              {APPOINTMENT_TYPE_LABELS[appointment.appointment_type as AppointmentType] ??
                appointment.appointment_type}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
                statusColor,
              )}
            >
              {appointment.status}
            </span>
          </div>

          {showPatient && appointment.patient && (
            <p className="text-foreground mt-2 text-sm font-medium">
              {appointment.patient.first_name} {appointment.patient.last_name}
            </p>
          )}

          {appointment.title && (
            <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
              {appointment.title}
            </p>
          )}
        </div>
        <ChevronRight className="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
      </div>

      <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(appointment.start_time)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTime(appointment.start_time)} – {formatTime(appointment.end_time)}
          {appointment.duration_minutes && ` (${appointment.duration_minutes} min)`}
        </span>
        {appointment.telehealth_url && (
          <span className="inline-flex items-center gap-1 text-cyan-400">
            <Video className="h-3 w-3" />
            Telehealth
          </span>
        )}
      </div>

      {appointment.notes && (
        <p className="text-muted-foreground mt-2 line-clamp-2 border-t border-border pt-2 text-xs italic">
          {appointment.notes}
        </p>
      )}
    </Link>
  );
}
