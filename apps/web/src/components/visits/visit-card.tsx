'use client';

import { Calendar, Clock, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { VisitListItem, VisitType, VisitStatus } from '@/types/visit';
import { VISIT_TYPE_LABELS, VISIT_TYPE_COLORS, STATUS_COLORS } from '@/types/visit';

interface VisitCardProps {
  visit: VisitListItem;
  showPatient?: boolean;
  className?: string;
}

export function VisitCard({ visit, showPatient, className }: VisitCardProps) {
  const date = new Date(visit.date);
  const typeColor = VISIT_TYPE_COLORS[visit.visit_type as VisitType] ?? 'bg-muted text-muted-foreground';
  const statusColor = STATUS_COLORS[visit.status as VisitStatus] ?? 'bg-muted text-muted-foreground';

  return (
    <Link
      href={`/visits/${visit.id}`}
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
              {VISIT_TYPE_LABELS[visit.visit_type as VisitType] ?? visit.visit_type}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
                statusColor,
              )}
            >
              {visit.status}
            </span>
          </div>

          {showPatient && visit.patients && (
            <p className="text-foreground mt-2 text-sm font-medium">
              {visit.patients.first_name} {visit.patients.last_name}
            </p>
          )}

          {visit.chief_complaint && (
            <p className="text-muted-foreground mt-1.5 line-clamp-1 text-sm">
              {visit.chief_complaint}
            </p>
          )}
        </div>
        <ChevronRight className="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
      </div>

      <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        {visit.duration_minutes && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {visit.duration_minutes} min
          </span>
        )}
        {visit.soap_note_id && (
          <span className="inline-flex items-center gap-1 text-green-400">
            <FileText className="h-3 w-3" />
            SOAP Note
          </span>
        )}
      </div>
    </Link>
  );
}
