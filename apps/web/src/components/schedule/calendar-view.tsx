'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useAppointments,
  getWeekDays,
  isToday,
  formatTime,
} from '@/hooks/use-appointments';
import type { AppointmentListItem } from '@/types/appointment';
import {
  APPOINTMENT_TYPE_COLORS,
  APPOINTMENT_TYPE_LABELS,
} from '@/types/appointment';

// ── Constants ──────────────────────────────────────────────────────────────

const START_HOUR = 6; // 6 AM
const END_HOUR = 20; // 8 PM
const TOTAL_HOURS = END_HOUR - START_HOUR;
const SLOT_MINUTES = 30;
const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;
const TOTAL_SLOTS = TOTAL_HOURS * SLOTS_PER_HOUR;

// ── Helpers ────────────────────────────────────────────────────────────────

function getHourLabel(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h} ${ampm}`;
}

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getMinutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

// ── Props ───────────────────────────────────────────────────────────────────

interface CalendarViewProps {
  onSlotClick?: (date: Date, hour: number, minute: number) => void;
  onAppointmentClick?: (appointment: AppointmentListItem) => void;
  onCreateAppointment?: (date: Date, hour: number, minute: number) => void;
  clinicianId?: string;
}

// ── Types for position calculation ─────────────────────────────────────────

interface PositionedAppointment {
  appointment: AppointmentListItem;
  top: number;
  height: number;
  col: number;
  colSpan: number;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
}

// ── Main Component ──────────────────────────────────────────────────────────

export function CalendarView({
  onSlotClick,
  onAppointmentClick,
  onCreateAppointment,
  clinicianId,
}: CalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(today);
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const minutesSinceStart = getMinutesFromMidnight(now) - START_HOUR * 60;
      const scrollTo = Math.max(0, (minutesSinceStart / (TOTAL_HOURS * 60)) * scrollRef.current.scrollHeight - 200);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, []);

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const dateRange = useMemo(() => {
    return {
      startDate: weekDays[0]!.toISOString().split('T')[0],
      endDate: weekDays[6]!.toISOString().split('T')[0],
    };
  }, [weekDays]);

  const { data: appointments } = useAppointments({
    ...dateRange,
    clinicianId,
  });

  // Map appointments by date
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

  // Position appointments in the grid
  const positionedAppointments = useMemo(() => {
    const result = new Map<string, PositionedAppointment[]>();

    for (const [dateKey, dayAppts] of appointmentsByDate) {
      const positioned: PositionedAppointment[] = dayAppts
        .map((apt) => {
          const startDate = new Date(apt.start_time);
          const endDate = new Date(apt.end_time);
          const startMinutes = getMinutesFromMidnight(startDate);
          const endMinutes = getMinutesFromMidnight(endDate);
          const durationMinutes = endMinutes - startMinutes;

          const top =
            ((startMinutes - START_HOUR * 60) / (TOTAL_HOURS * 60)) * 100;
          const height =
            Math.max(durationMinutes, 15) / (TOTAL_HOURS * 60) * 100;

          return {
            appointment: apt,
            top,
            height,
            col: 0,
            colSpan: 1,
            startHour: startDate.getHours(),
            startMin: startDate.getMinutes(),
            endHour: endDate.getHours(),
            endMin: endDate.getMinutes(),
          };
        })
        .filter((p) => p.top >= 0 && p.top <= 100);

      // Simple overlap detection — stack overlapping appointments side by side
      for (let i = 0; i < positioned.length; i++) {
        for (let j = i + 1; j < positioned.length; j++) {
          const a = positioned[i]!;
          const b = positioned[j]!;
          const aEnd = a.top + a.height;
          const bEnd = b.top + b.height;
          if (a.top < bEnd && b.top < aEnd) {
            b.col = a.col + 1;
            a.colSpan = Math.max(a.colSpan, b.col + 1);
          }
        }
      }

      result.set(dateKey, positioned);
    }

    return result;
  }, [appointmentsByDate]);

  // Navigation
  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));
      return d;
    });
  }, []);

  const goToToday = useCallback(() => setCurrentDate(today), [today]);

  // View title
  const viewTitle = useMemo(() => {
    const start = weekDays[0]!;
    const end = weekDays[6]!;
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()} – ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
  }, [weekDays]);

  // Current time indicator position
  const currentTimePosition = useMemo(() => {
    const nowMinutes = getMinutesFromMidnight(currentTime);
    return ((nowMinutes - START_HOUR * 60) / (TOTAL_HOURS * 60)) * 100;
  }, [currentTime]);

  const showTimeIndicator =
    currentDate.getFullYear() === currentTime.getFullYear() &&
    currentDate.getMonth() === currentTime.getMonth() &&
    currentDate.getDate() <= currentTime.getDate() &&
    currentDate.getDate() + 6 >= currentTime.getDate();

  const timeSlots = useMemo(
    () =>
      Array.from({ length: TOTAL_SLOTS }, (_, i) => {
        const totalMinutes = START_HOUR * 60 + i * SLOT_MINUTES;
        return {
          hour: Math.floor(totalMinutes / 60),
          minute: totalMinutes % 60,
        };
      }),
    [],
  );

  // ── Slot Click Handler ──────────────────────────────────────────────────

  const handleSlotClick = useCallback(
    (day: Date, hour: number, minute: number) => {
      onSlotClick?.(day, hour, minute);
      onCreateAppointment?.(day, hour, minute);
    },
    [onSlotClick, onCreateAppointment],
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="hover:bg-accent rounded-md p-1.5 transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-foreground min-w-[200px] text-center text-lg font-semibold">
            {viewTitle}
          </h2>
          <button
            onClick={() => navigateWeek('next')}
            className="hover:bg-accent rounded-md p-1.5 transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="border-border hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
        >
          Today
        </button>
      </div>

      {/* Day Headers */}
      <div className="mb-px grid grid-cols-[4rem_repeat(7,1fr)] gap-px">
        <div className="sticky top-0 z-10" /> {/* Time gutter header */}
        {weekDays.map((day, idx) => {
          const _isToday = isToday(day);
          const dateKey = getDateKey(day);
          const dayAppts = appointmentsByDate.get(dateKey) ?? [];

          return (
            <div
              key={idx}
              className={cn(
                'sticky top-0 z-10 px-2 py-2 text-center',
                _isToday && 'bg-primary/5 rounded-t-lg',
              )}
            >
              <p className="text-muted-foreground text-[10px] font-medium uppercase">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <p
                className={cn(
                  'text-lg font-semibold leading-tight',
                  _isToday ? 'text-primary' : 'text-foreground',
                )}
              >
                {day.getDate()}
              </p>
              <p className="text-muted-foreground text-[10px]">
                {dayAppts.length} appt{dayAppts.length !== 1 ? 's' : ''}
              </p>
            </div>
          );
        })}
      </div>

      {/* Scrollable Time Grid */}
      <div
        ref={scrollRef}
        className="border-border relative max-h-[600px] overflow-y-auto border-t scroll-smooth"
      >
        {/* Time gutter + columns grid */}
        <div className="grid grid-cols-[4rem_repeat(7,1fr)] gap-px">
          {/* Time slots */}
          {timeSlots.map((slot, idx) => {
            const isHourStart = slot.minute === 0;
            const hour = slot.hour;
            const minute = slot.minute;

            return (
              <div key={idx} className="contents">
                {/* Time label */}
                <div
                  className={cn(
                    'text-muted-foreground relative flex items-start justify-end pr-2 text-[10px]',
                    isHourStart ? 'pt-0' : 'pt-0',
                  )}
                  style={{ height: isHourStart ? undefined : '0' }}
                >
                  {isHourStart && (
                    <span className="relative -top-2 shrink-0">
                      {getHourLabel(hour)}
                    </span>
                  )}
                </div>

                {/* Day columns */}
                {weekDays.map((day, dayIdx) => {
                  const dateKey = getDateKey(day);
                  const positioned =
                    positionedAppointments.get(dateKey) ?? [];
                  const matchingAppts = positioned.filter((p) => {
                    const slotStart = hour * 60 + minute;
                    const pStart = p.startHour * 60 + p.startMin;
                    const pEnd = p.endHour * 60 + p.endMin;
                    return slotStart >= pStart && slotStart < pEnd;
                  });

                  return (
                    <div
                      key={dayIdx}
                      onClick={() => handleSlotClick(day, hour, minute)}
                      className={cn(
                        'border-border relative border-l border-b transition-colors',
                        isHourStart
                          ? 'border-border/50'
                          : 'border-border/20',
                        'hover:bg-accent/30 cursor-pointer',
                        isToday(day) && 'bg-primary/[0.01]',
                      )}
                      style={{
                        height: isHourStart
                          ? `calc((${SLOT_MINUTES} / ${TOTAL_HOURS * 60}) * 100%)`
                          : '0',
                        paddingBottom: isHourStart
                          ? `calc((${SLOT_MINUTES} / ${TOTAL_HOURS * 60}) * 560px)`
                          : '0',
                      }}
                    >
                      {/* Appointments positioned in this slot's parent */}
                      {isHourStart &&
                        matchingAppts.map((p) => (
                          <button
                            key={p.appointment.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAppointmentClick?.(p.appointment);
                            }}
                            className={cn(
                              'absolute left-0.5 right-0.5 z-10 overflow-hidden rounded-md px-1.5 py-1 text-left text-[11px] leading-tight shadow-sm transition-all hover:opacity-90 hover:shadow-md',
                              APPOINTMENT_TYPE_COLORS[
                                p.appointment
                                  .appointment_type as keyof typeof APPOINTMENT_TYPE_COLORS
                              ] ?? 'bg-muted text-muted-foreground',
                            )}
                            style={{
                              top: `${p.top}%`,
                              height: `${p.height}%`,
                              left: `${p.col * 5}%`,
                              right: `${(p.colSpan - p.col - 1) * 5}%`,
                            }}
                            title={`${p.appointment.patient ? `${p.appointment.patient.first_name} ${p.appointment.patient.last_name}` : 'Unknown'} - ${APPOINTMENT_TYPE_LABELS[p.appointment.appointment_type as keyof typeof APPOINTMENT_TYPE_LABELS] ?? p.appointment.appointment_type}`}
                          >
                            <span className="block truncate font-medium">
                              {p.appointment.patient
                                ? `${p.appointment.patient.first_name} ${p.appointment.patient.last_name}`
                                : '—'}
                            </span>
                            <span className="text-muted-foreground block truncate">
                              <Clock className="mr-0.5 inline-block h-2.5 w-2.5" />
                              {formatTime(p.appointment.start_time)}
                              {' · '}
                              {p.appointment.duration_minutes}m
                            </span>
                          </button>
                        ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Current Time Indicator */}
        {showTimeIndicator && (
          <div
            className="pointer-events-none absolute z-20 left-0 right-0"
            style={{ top: `${currentTimePosition}%` }}
          >
            <div className="flex items-center">
              <div className="bg-destructive h-px flex-1" />
              <div className="bg-destructive h-2 w-2 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="border-border mt-4 flex flex-wrap items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm border border-purple-500/20 bg-purple-500/5" />
          Initial Eval
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm border border-blue-500/20 bg-blue-500/5" />
          Follow Up
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm border border-amber-500/20 bg-amber-500/5" />
          Re-eval
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm border border-red-500/20 bg-red-500/5" />
          Discharge
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm border border-cyan-500/20 bg-cyan-500/5" />
          Telehealth
        </span>
      </div>
    </div>
  );
}
