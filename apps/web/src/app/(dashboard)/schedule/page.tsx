'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useAppointments, getCalendarDays, getWeekDays, getMonthLabel, isToday, formatTime } from '@/hooks/use-appointments';
import { AppointmentCard } from '@/components/scheduling/appointment-card';
import type { CalendarViewMode, AppointmentListItem } from '@/types/appointment';
import { APPOINTMENT_TYPE_COLORS } from '@/types/appointment';

export default function SchedulePage() {
  const today = useMemo(() => new Date(), []);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState(today);

  // Compute date range for queries
  const dateRange = useMemo(() => {
    if (viewMode === 'month') {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    }
    if (viewMode === 'week') {
      const days = getWeekDays(currentDate);
      return {
        startDate: days[0]!.toISOString().split('T')[0],
        endDate: days[6]!.toISOString().split('T')[0],
      };
    }
    // Day view
    const dayStr = currentDate.toISOString().split('T')[0]!;
    return {
      startDate: dayStr,
      endDate: dayStr,
    };
  }, [currentDate, viewMode]);

  const { data: appointments, isLoading, error } = useAppointments(dateRange);

  // ── Calendar Navigation ──────────────────────────────────────────────────

  const navigate = (direction: 'prev' | 'next') => {
    const delta = direction === 'prev' ? -1 : 1;
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() + delta);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() + delta * 7);
      } else {
        d.setDate(d.getDate() + delta);
      }
      return d;
    });
  };

  const goToToday = () => setCurrentDate(today);

  // ── Appointment Map ───────────────────────────────────────────────────────

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, AppointmentListItem[]>();
    if (!appointments) return map;
    for (const apt of appointments) {
      const key = apt.start_time.split('T')[0] ?? '';
      const existing = map.get(key) ?? [];
      existing.push(apt);
      map.set(key, existing);
    }
    return map;
  }, [appointments]);

  // ── View Title ────────────────────────────────────────────────────────────

  const viewTitle = useMemo(() => {
    if (viewMode === 'month') {
      return getMonthLabel(currentDate.getFullYear(), currentDate.getMonth());
    }
    if (viewMode === 'week') {
      const days = getWeekDays(currentDate);
      const start = days[0]!;
      const end = days[6]!;
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
      }
      return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()} – ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
    }
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [currentDate, viewMode]);

  // ── Day Detail View ──────────────────────────────────────────────────────

  const selectedDayAppts = useMemo(() => {
    const key = currentDate.toISOString().split('T')[0]!;
    return appointmentsByDate.get(key) ?? [];
  }, [appointmentsByDate, currentDate]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Schedule</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your appointments and calendar
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-muted flex items-center rounded-lg p-0.5">
            {(['day', 'week', 'month'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  viewMode === mode
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="border-border bg-card mb-6 rounded-xl border p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('prev')}
              className="hover:bg-accent rounded-md p-1.5 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-foreground min-w-[200px] text-center text-lg font-semibold">
              {viewTitle}
            </h2>
            <button
              onClick={() => navigate('next')}
              className="hover:bg-accent rounded-md p-1.5 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Today
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            Failed to load appointments. Please try again.
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Month View */}
            {viewMode === 'month' && (
              <CalendarMonthView
                year={currentDate.getFullYear()}
                month={currentDate.getMonth()}
                appointmentsByDate={appointmentsByDate}
                onSelectDate={(d) => {
                  setCurrentDate(d);
                  setViewMode('day');
                }}
              />
            )}

            {/* Week View */}
            {viewMode === 'week' && (
              <CalendarWeekView
                baseDate={currentDate}
                appointmentsByDate={appointmentsByDate}
                onSelectDate={(d) => {
                  setCurrentDate(d);
                  setViewMode('day');
                }}
              />
            )}

            {/* Day View */}
            {viewMode === 'day' && (
              <CalendarDayView
                date={currentDate}
                appointments={selectedDayAppts}
              />
            )}
          </>
        )}
      </div>

      {/* Day's Appointments List */}
      {viewMode !== 'day' && selectedDayAppts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-foreground mb-3 text-sm font-medium">
            Appointments for{' '}
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </h3>
          <div className="space-y-3">
            {selectedDayAppts.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Month View Sub-Component ─────────────────────────────────────────────────

function CalendarMonthView({
  year,
  month,
  appointmentsByDate,
  onSelectDate,
}: {
  year: number;
  month: number;
  appointmentsByDate: Map<string, AppointmentListItem[]>;
  onSelectDate: (date: Date) => void;
}) {
  const days = getCalendarDays(year, month);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 gap-px">
        {dayNames.map((name) => (
          <div
            key={name}
            className="text-muted-foreground px-2 py-2 text-center text-xs font-medium"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px">
        {days.map((day, idx) => {
          const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
          const dayAppts = appointmentsByDate.get(key) ?? [];
          const isCurrentMonth = day.getMonth() === month;
          const _isToday = isToday(day);

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(day)}
              className={cn(
                'hover:bg-accent/50 flex min-h-[80px] flex-col border border-transparent p-1.5 text-left transition-colors',
                !isCurrentMonth && 'opacity-30',
              )}
            >
              <span
                className={cn(
                  'mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  _isToday && 'bg-primary text-primary-foreground font-bold',
                  !_isToday && 'text-muted-foreground',
                )}
              >
                {day.getDate()}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayAppts.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      'truncate rounded px-1 py-0.5 text-[10px] leading-tight',
                      APPOINTMENT_TYPE_COLORS[apt.appointment_type as keyof typeof APPOINTMENT_TYPE_COLORS] ??
                        'bg-muted text-muted-foreground',
                    )}
                  >
                    {apt.patient
                      ? `${apt.patient.first_name[0]}. ${apt.patient.last_name}`
                      : formatTime(apt.start_time)}
                  </div>
                ))}
                {dayAppts.length > 3 && (
                  <span className="text-muted-foreground px-1 text-[10px]">
                    +{dayAppts.length - 3} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Week View Sub-Component ──────────────────────────────────────────────────

function CalendarWeekView({
  baseDate,
  appointmentsByDate,
  onSelectDate,
}: {
  baseDate: Date;
  appointmentsByDate: Map<string, AppointmentListItem[]>;
  onSelectDate: (date: Date) => void;
}) {
  const days = getWeekDays(baseDate);
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM – 8 PM

  return (
    <div>
      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
          const dayAppts = appointmentsByDate.get(key) ?? [];
          const _isToday = isToday(day);

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(day)}
              className={cn(
                'rounded-lg p-2 text-center transition-colors',
                _isToday ? 'bg-primary/10' : 'hover:bg-accent/50',
              )}
            >
              <p className="text-muted-foreground text-[10px] font-medium uppercase">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <p
                className={cn(
                  'text-lg font-semibold',
                  _isToday ? 'text-primary' : 'text-foreground',
                )}
              >
                {day.getDate()}
              </p>
              <p className="text-muted-foreground text-[10px]">
                {dayAppts.length} appt{dayAppts.length !== 1 ? 's' : ''}
              </p>
            </button>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="border-border relative border-t">
        {hours.map((hour) => {
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour > 12 ? hour - 12 : hour;
          return (
            <div key={hour} className="border-border flex border-b">
              <div className="text-muted-foreground w-16 shrink-0 py-2 pr-2 text-right text-[10px]">
                {displayHour}:00 {ampm}
              </div>
              <div className="flex min-h-[40px] flex-1">
                {days.map((day, dayIdx) => {
                  const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                  const dayAppts = appointmentsByDate.get(key) ?? [];
                  const hourAppts = dayAppts.filter((apt) => {
                    const aptHour = new Date(apt.start_time).getHours();
                    return aptHour === hour;
                  });

                  return (
                    <div
                      key={dayIdx}
                      className="border-border flex-1 border-l p-0.5"
                    >
                      {hourAppts.map((apt) => (
                        <Link
                          key={apt.id}
                          href={`/schedule/appointments/${apt.id}`}
                          className={cn(
                            'mb-0.5 block truncate rounded px-1 py-0.5 text-[10px] leading-tight transition-colors',
                            APPOINTMENT_TYPE_COLORS[apt.appointment_type as keyof typeof APPOINTMENT_TYPE_COLORS] ??
                              'bg-muted text-muted-foreground',
                            'hover:opacity-80',
                          )}
                        >
                          {apt.patient
                            ? `${apt.patient.first_name[0]}. ${apt.patient.last_name}`
                            : '—'}
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Day View Sub-Component ───────────────────────────────────────────────────

function CalendarDayView({
  date,
  appointments,
}: {
  date: Date;
  appointments: AppointmentListItem[];
}) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 7);

  // Group appointments by hour
  const appointmentsByHour = useMemo(() => {
    const map = new Map<number, AppointmentListItem[]>();
    for (const apt of appointments) {
      const hour = new Date(apt.start_time).getHours();
      const existing = map.get(hour) ?? [];
      existing.push(apt);
      map.set(hour, existing);
    }
    return map;
  }, [appointments]);

  return (
    <div>
      <div className="border-border border-t">
        {hours.map((hour) => {
          const hourAppts = appointmentsByHour.get(hour) ?? [];
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour > 12 ? hour - 12 : hour;
          const now = new Date();
          const isCurrentHour =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear() &&
            hour === now.getHours();

          return (
            <div
              key={hour}
              className={cn(
                'border-border flex border-b',
                isCurrentHour && 'bg-primary/[0.02]',
              )}
            >
              <div className="text-muted-foreground w-16 shrink-0 py-3 pr-2 text-right text-xs">
                {displayHour}:00 {ampm}
              </div>
              <div className="border-border min-h-[60px] flex-1 border-l px-2 py-1">
                {hourAppts.length === 0 && (
                  <div className="text-muted-foreground/40 mt-3 text-center text-[10px]">
                    No appointments
                  </div>
                )}
                {hourAppts.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    compact
                    className="mb-1"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
