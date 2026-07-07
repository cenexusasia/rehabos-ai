'use client';

import { useMemo } from 'react';
import {
  Activity,
  Calendar,
  ClipboardList,
  Dumbbell,
  MessageSquare,
  Stethoscope,
  Clock,
  ChevronRight,
  Loader2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { TimelineEvent, TimelineEventType } from '@/types/patient';

// ── Type configuration ─────────────────────────────────────────────────────

interface TimelineTypeConfig {
  icon: React.ReactNode;
  dotColor: string;
  bgColor: string;
  label: string;
}

const TIMELINE_CONFIG: Record<TimelineEventType, TimelineTypeConfig> = {
  visit: {
    icon: <Activity className="h-3.5 w-3.5" />,
    dotColor: 'bg-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    label: 'Visit',
  },
  assessment: {
    icon: <ClipboardList className="h-3.5 w-3.5" />,
    dotColor: 'bg-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    label: 'Assessment',
  },
  soap: {
    icon: <Stethoscope className="h-3.5 w-3.5" />,
    dotColor: 'bg-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    label: 'SOAP Note',
  },
  hep: {
    icon: <Dumbbell className="h-3.5 w-3.5" />,
    dotColor: 'bg-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    label: 'HEP',
  },
  message: {
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    dotColor: 'bg-rose-500',
    bgColor: 'bg-rose-500/10 border-rose-500/20',
    label: 'Message',
  },
  appointment: {
    icon: <Calendar className="h-3.5 w-3.5" />,
    dotColor: 'bg-cyan-500',
    bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    label: 'Appointment',
  },
};

// ── Date grouping helpers ────────────────────────────────────────────────────

function formatDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function groupEventsByDate(
  events: TimelineEvent[],
): { date: string; label: string; events: TimelineEvent[] }[] {
  const groups = new Map<string, TimelineEvent[]>();
  events.forEach((event) => {
    const d = new Date(event.timestamp);
    const key = getDateKey(d);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  });

  return Array.from(groups.entries())
    .map(([date, evts]) => ({
      date,
      label: formatDateLabel(new Date(date)),
      events: evts,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function formatEventTime(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ── Props ──────────────────────────────────────────────────────────────────

interface PatientTimelineProps {
  events: TimelineEvent[] | undefined;
  isLoading?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
  className?: string;
}

// ── Component ───────────────────────────────────────────────────────────────

export function PatientTimeline({
  events,
  isLoading,
  onEventClick,
  className,
}: PatientTimelineProps) {
  const grouped = useMemo(
    () => (events ? groupEventsByDate(events) : []),
    [events],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="text-primary h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Clock className="text-muted-foreground mb-3 h-10 w-10" />
        <p className="text-muted-foreground text-sm font-medium">
          No activity recorded yet
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Patient activity will appear here as visits, assessments, and other
          events are created.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {grouped.map((group) => (
        <div key={group.date}>
          {/* Date header */}
          <div className="mb-4 flex items-center gap-3">
            <span className="text-foreground text-sm font-semibold">
              {group.label}
            </span>
            <div className="bg-border/50 h-px flex-1" />
            <span className="text-muted-foreground text-xs">
              {group.events.length} event{group.events.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Timeline items */}
          <div className="relative ml-2 space-y-3">
            {/* Vertical line */}
            <div className="border-border/50 absolute left-[11px] top-2 bottom-2 w-px border-l border-dashed" />

            {group.events.map((event) => {
              const config = TIMELINE_CONFIG[event.type];
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onEventClick?.(event)}
                  className={cn(
                    'border-border hover:bg-accent/50 group relative flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all',
                    'cursor-pointer',
                  )}
                >
                  {/* Color dot */}
                  <div
                    className={cn(
                      'relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                      config.dotColor,
                      'text-white',
                    )}
                  >
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-medium">
                          {event.title}
                        </p>
                        <span
                          className={cn(
                            'mt-1 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider',
                            config.bgColor,
                          )}
                        >
                          {config.label}
                        </span>
                      </div>
                      <span className="text-muted-foreground mt-0.5 shrink-0 text-xs tabular-nums">
                        {formatEventTime(event.timestamp)}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="text-muted-foreground/40 group-hover:text-muted-foreground mt-1 h-4 w-4 shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
