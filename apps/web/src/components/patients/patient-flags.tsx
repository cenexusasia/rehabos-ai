'use client';

import { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FlagSeverity = 'critical' | 'warning' | 'info';
export type FlagCategory =
  | 'allergy'
  | 'fall_risk'
  | 'language_barrier'
  | 'billing_issue'
  | 'no_show_risk'
  | 'cognition'
  | 'abuse_concern'
  | 'other';

interface Flag {
  id: string;
  category: FlagCategory;
  severity: FlagSeverity;
  message: string;
  created_at: string;
  dismissed: boolean;
}

const severityConfig = {
  critical: { icon: AlertTriangle, className: 'border-red-500/30 bg-red-500/10 text-red-400' },
  warning: { icon: AlertTriangle, className: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
  info: { icon: Info, className: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
};

const categoryLabels: Record<FlagCategory, string> = {
  allergy: 'Allergy',
  fall_risk: 'Fall Risk',
  language_barrier: 'Language Barrier',
  billing_issue: 'Billing Issue',
  no_show_risk: 'No-Show Risk',
  cognition: 'Cognition Concern',
  abuse_concern: 'Abuse Concern',
  other: 'Other',
};

export function PatientFlags({ flags: initialFlags }: { flags: Flag[] }) {
  const [flags, setFlags] = useState(initialFlags.filter((f) => !f.dismissed));

  const dismissFlag = (id: string) => {
    setFlags((prev) => prev.filter((f) => f.id !== id));
  };

  if (flags.length === 0) return null;

  return (
    <div className="space-y-2">
      {flags.map((flag) => {
        const config = severityConfig[flag.severity];
        const Icon = config.icon;
        return (
          <div
            key={flag.id}
            className={cn('flex items-start gap-3 rounded-lg border p-3 text-sm', config.className)}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <span className="font-medium">{categoryLabels[flag.category]}</span>
              <p className="mt-0.5 opacity-90">{flag.message}</p>
            </div>
            <button
              onClick={() => dismissFlag(flag.id)}
              className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
