'use client';

import { cn } from '@/lib/utils';
import {
  FileText,
  User,
  Calendar,
  Stethoscope,
  PenLine,
  CheckCircle,
} from 'lucide-react';

interface SoapViewerProps {
  data: {
    subjective: Record<string, unknown>;
    objective: Record<string, unknown>;
    assessment: Record<string, unknown>;
    plan: Record<string, unknown>;
  };
  patientName?: string;
  clinicianName?: string;
  visitDate?: string;
  signedAt?: string | null;
  signedBy?: string | null;
  status?: string;
  className?: string;
}

function getSectionHtml(section: Record<string, unknown>): string {
  if (typeof section.html === 'string') return section.html;
  if (typeof section === 'string') return section;
  return '';
}

const sectionConfig: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    barClass: string;
    textClass: string;
  }
> = {
  subjective: {
    label: 'S — Subjective',
    icon: <User className="h-4 w-4" />,
    barClass: 'border-l-blue-500 bg-blue-500/5',
    textClass: 'text-blue-400',
  },
  objective: {
    label: 'O — Objective',
    icon: <Stethoscope className="h-4 w-4" />,
    barClass: 'border-l-green-500 bg-green-500/5',
    textClass: 'text-green-400',
  },
  assessment: {
    label: 'A — Assessment',
    icon: <FileText className="h-4 w-4" />,
    barClass: 'border-l-amber-500 bg-amber-500/5',
    textClass: 'text-amber-400',
  },
  plan: {
    label: 'P — Plan',
    icon: <CheckCircle className="h-4 w-4" />,
    barClass: 'border-l-purple-500 bg-purple-500/5',
    textClass: 'text-purple-400',
  },
};

export function SoapViewer({
  data,
  patientName,
  clinicianName,
  visitDate,
  signedAt,
  signedBy,
  status,
  className,
}: SoapViewerProps) {
  const sections = [
    { key: 'subjective', data: data.subjective },
    { key: 'objective', data: data.objective },
    { key: 'assessment', data: data.assessment },
    { key: 'plan', data: data.plan },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Meta info header */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {patientName && (
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{patientName}</span>
          </div>
        )}
        {visitDate && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(visitDate).toLocaleDateString()}</span>
          </div>
        )}
        {clinicianName && (
          <div className="flex items-center gap-1.5">
            <Stethoscope className="h-3.5 w-3.5" />
            <span>{clinicianName}</span>
          </div>
        )}
      </div>

      {/* Section content */}
      {sections.map(({ key, data: sectionData }) => {
        const config = sectionConfig[key]!;
        const html = getSectionHtml(sectionData);

        return (
          <div
            key={key}
            className={cn(
              'rounded-xl border border-border bg-card overflow-hidden shadow-sm',
            )}
          >
            {/* Section header bar */}
            <div
              className={cn(
                'flex items-center gap-2 border-l-4 px-4 py-2.5 border-b border-border',
                // border-l overrides
                key === 'subjective' && 'border-l-4 border-l-blue-500',
                key === 'objective' && 'border-l-4 border-l-green-500',
                key === 'assessment' && 'border-l-4 border-l-amber-500',
                key === 'plan' && 'border-l-4 border-l-purple-500',
              )}
            >
              <span className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', config.textClass)}>
                {config.icon}
                {config.label}
              </span>
            </div>

            {/* Section body */}
            <div className="p-4">
              {html ? (
                <div
                  className="prose prose-sm prose-invert max-w-none
                    prose-p:text-foreground prose-p:leading-relaxed
                    prose-li:text-foreground
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-em:text-foreground/80
                    prose-ul:my-1 prose-ol:my-1
                    [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : (
                <p className="text-muted-foreground/60 text-sm italic">
                  No content recorded
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Signature block */}
      {(signedAt || signedBy || status) && (
        <div className="mt-8 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            {status && (
              <div>
                <span className="text-muted-foreground">Status: </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    status === 'signed' && 'border-green-500/30 bg-green-500/10 text-green-400',
                    status === 'completed' && 'border-blue-500/30 bg-blue-500/10 text-blue-400',
                    status === 'draft' && 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
                    status === 'amended' && 'border-orange-500/30 bg-orange-500/10 text-orange-400',
                    status === 'corrected' && 'border-purple-500/30 bg-purple-500/10 text-purple-400',
                  )}
                >
                  <PenLine className="h-3 w-3" />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            )}
            {signedBy && (
              <div>
                <span className="text-muted-foreground">Signed by: </span>
                <span className="text-foreground font-medium">{signedBy}</span>
              </div>
            )}
            {signedAt && (
              <div>
                <span className="text-muted-foreground">Signed on: </span>
                <span className="text-foreground">
                  {new Date(signedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
