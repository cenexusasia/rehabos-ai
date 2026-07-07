'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Activity,
  Pill,
  Home,
  Brain,
  Bone,
} from 'lucide-react';

type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

// ── Types ──────────────────────────────────────────────────────────────────

interface RiskFactor {
  factor: string;
  severity: 'high' | 'medium' | 'low';
  detail: string;
}

interface RiskIndicatorProps {
  /** Overall risk level */
  riskLevel: RiskLevel;
  /** Numeric risk score 0-100 */
  riskScore: number;
  /** List of contributing risk factors */
  riskFactors?: RiskFactor[];
  /** Recommended interventions */
  recommendations?: string[];
  /** Optional compact mode (no expandable details) */
  compact?: boolean;
  /** Optional class name override */
  className?: string;
}

// ── Visual config ──────────────────────────────────────────────────────────

interface RiskConfig {
  label: string;
  icon: React.ReactNode;
  badgeClass: string;
  bgClass: string;
  borderClass: string;
  progressClass: string;
}

const RISK_CONFIG: Record<RiskLevel, RiskConfig> = {
  critical: {
    label: 'Critical Risk',
    icon: <AlertTriangle className="h-5 w-5" />,
    badgeClass: 'bg-red-600 text-white',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    borderClass: 'border-red-300 dark:border-red-800',
    progressClass: 'bg-red-600',
  },
  high: {
    label: 'High Risk',
    icon: <AlertCircle className="h-5 w-5" />,
    badgeClass: 'bg-orange-500 text-white',
    bgClass: 'bg-orange-50 dark:bg-orange-950/30',
    borderClass: 'border-orange-300 dark:border-orange-800',
    progressClass: 'bg-orange-500',
  },
  moderate: {
    label: 'Moderate Risk',
    icon: <Info className="h-5 w-5" />,
    badgeClass: 'bg-yellow-500 text-white',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderClass: 'border-yellow-300 dark:border-yellow-800',
    progressClass: 'bg-yellow-500',
  },
  low: {
    label: 'Low Risk',
    icon: <ShieldCheck className="h-5 w-5" />,
    badgeClass: 'bg-green-500 text-white',
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    borderClass: 'border-green-300 dark:border-green-800',
    progressClass: 'bg-green-500',
  },
};

// ── Factor icon mapping ────────────────────────────────────────────────────

function getFactorIcon(factorName: string): React.ReactNode {
  const lower = factorName.toLowerCase();
  if (lower.includes('medication') || lower.includes('polypharmacy')) {
    return <Pill className="h-4 w-4 shrink-0" />;
  }
  if (lower.includes('fall')) {
    return <Activity className="h-4 w-4 shrink-0" />;
  }
  if (lower.includes('hospitalization') || lower.includes('comorbid')) {
    return <Bone className="h-4 w-4 shrink-0" />;
  }
  if (lower.includes('cognitive') || lower.includes('depression')) {
    return <Brain className="h-4 w-4 shrink-0" />;
  }
  if (lower.includes('lives alone') || lower.includes('home')) {
    return <Home className="h-4 w-4 shrink-0" />;
  }
  return <AlertCircle className="h-4 w-4 shrink-0" />;
}

function getSeverityColor(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20';
    case 'medium':
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20';
    case 'low':
      return 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20';
  }
}

function getSeverityDot(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-amber-500';
    case 'low':
      return 'bg-slate-400';
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function RiskIndicator({
  riskLevel,
  riskScore,
  riskFactors = [],
  recommendations = [],
  compact = false,
  className,
}: RiskIndicatorProps) {
  const [expanded, setExpanded] = useState(false);
  const config = RISK_CONFIG[riskLevel];

  return (
    <div
      className={cn(
        'rounded-xl border p-4 shadow-sm transition-all',
        config.bgClass,
        config.borderClass,
        className,
      )}
    >
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Badge */}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
              config.badgeClass,
            )}
          >
            {config.icon}
            {config.label}
          </span>

          {/* Score */}
          <span className="text-foreground/70 text-sm tabular-nums">
            Score: <span className="text-foreground font-mono font-medium">{riskScore}</span>/100
          </span>
        </div>

        {/* Expand/collapse button (only when there are details) */}
        {!compact && (riskFactors.length > 0 || recommendations.length > 0) && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={cn(
              'text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
              'hover:bg-black/5 dark:hover:bg-white/10',
            )}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                Less <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Details <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Risk score bar ─────────────────────────────────────────────── */}
      <div className="mt-3">
        <div className="bg-background/50 h-2 w-full overflow-hidden rounded-full">
          <div
            className={cn('h-full rounded-full transition-[width] duration-500 ease-out', config.progressClass)}
            style={{ width: `${riskScore}%` }}
            role="progressbar"
            aria-valuenow={riskScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Risk score: ${riskScore} out of 100`}
          />
        </div>
        {/* Mini axis labels */}
        <div className="text-muted-foreground/50 mt-0.5 flex justify-between text-[10px]">
          <span>0</span>
          <span>30 moderate</span>
          <span>60 high</span>
          <span>80 critical</span>
        </div>
      </div>

      {/* ── Expandable details ─────────────────────────────────────────── */}
      {expanded && !compact && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Risk Factors */}
          {riskFactors.length > 0 && (
            <div>
              <h4 className="text-foreground/80 mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <AlertCircle className="h-3.5 w-3.5" />
                Contributing Risk Factors
              </h4>
              <ul className="space-y-1.5">
                {riskFactors.map((factor, idx) => (
                  <li
                    key={idx}
                    className={cn(
                      'flex items-start gap-2 rounded-lg px-3 py-2 text-sm',
                      getSeverityColor(factor.severity),
                    )}
                  >
                    {getFactorIcon(factor.factor)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
                            getSeverityDot(factor.severity),
                          )}
                        />
                        <span className="font-medium">{factor.factor}</span>
                        <span className="text-muted-foreground/60 text-[10px] uppercase">
                          ({factor.severity})
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        {factor.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h4 className="text-foreground/80 mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <Lightbulb className="h-3.5 w-3.5" />
                Recommended Interventions
              </h4>
              <ul className="space-y-1">
                {recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="border-border/50 text-foreground/80 flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="bg-primary/10 text-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Empty state */}
          {riskFactors.length === 0 && recommendations.length === 0 && (
            <p className="text-muted-foreground py-3 text-center text-sm italic">
              No risk factors or recommendations available. Provide clinical data to generate insights.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default RiskIndicator;
