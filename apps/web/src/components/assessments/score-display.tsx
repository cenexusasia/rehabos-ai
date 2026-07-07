'use client';

import { cn } from '@/lib/utils';
import type { NormativeData, NormativeDataEntry } from '@/types/assessment';

interface ScoreDisplayProps {
  score: number;
  minScore: number | null;
  maxScore: number | null;
  higherIsBetter: boolean;
  mcid: number | null;
  normativeData: NormativeData | null;
  previousScore?: number | null;
  interpretation?: string | null;
  className?: string;
}

export function ScoreDisplay({
  score,
  minScore,
  maxScore,
  higherIsBetter,
  mcid,
  normativeData,
  previousScore,
  interpretation,
  className,
}: ScoreDisplayProps) {
  const scoreRange = maxScore !== null && minScore !== null ? maxScore - minScore : null;
  const percentage =
    scoreRange !== null && scoreRange > 0
      ? Math.round(((score - (minScore ?? 0)) / scoreRange) * 100)
      : null;

  const hasMCIDImprovement =
    previousScore !== null &&
    previousScore !== undefined &&
    mcid !== null &&
    Math.abs(score - previousScore) >= mcid;

  const isBetter = higherIsBetter
    ? score > (previousScore ?? score)
    : score < (previousScore ?? score);

  // Find matching normative data entry
  const normativeEntry = findNormativeEntry(normativeData);
  const percentileRank = normativeEntry?.percentileCutoffs
    ? estimatePercentile(score, normativeEntry)
    : null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Score */}
      <div className="border-border bg-card rounded-xl border p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* Score Circle */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                className="text-border"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                className={cn(
                  'transition-all duration-500',
                  percentage !== null && percentage >= 70
                    ? 'text-emerald-400'
                    : percentage !== null && percentage >= 40
                      ? 'text-amber-400'
                      : 'text-destructive',
                )}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - (percentage ?? 0) / 100)}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-foreground text-2xl font-bold">{score}</span>
              {maxScore !== null && (
                <span className="text-muted-foreground text-xs">
                  / {maxScore}
                </span>
              )}
            </div>
          </div>

          {/* Score Details */}
          <div className="min-w-0 flex-1 space-y-3">
            {/* Score bar */}
            {maxScore !== null && minScore !== null && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Min: {minScore}</span>
                  <span>Max: {maxScore}</span>
                </div>
                <div className="bg-border relative h-3 overflow-hidden rounded-full">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      percentage !== null && percentage >= 70
                        ? 'bg-emerald-400'
                        : percentage !== null && percentage >= 40
                          ? 'bg-amber-400'
                          : 'bg-destructive',
                    )}
                    style={{ width: `${percentage ?? 0}%` }}
                  />
                  {/* MCID marker */}
                  {mcid !== null && previousScore !== null && (
                    <div
                      className="absolute top-0 h-full w-0.5 bg-white/70"
                      style={{
                        left: `${Math.max(0, Math.min(100, (((previousScore ?? 0) + (higherIsBetter ? (mcid ?? 0) : -(mcid ?? 0)) - (minScore ?? 0)) / (scoreRange ?? 1)) * 100))}%`,
                      }}
                      title="MCID threshold"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Interpretation */}
            {interpretation && (
              <p className="text-foreground text-sm">{interpretation}</p>
            )}

            {/* MCID comparison */}
            {previousScore !== null && previousScore !== undefined && mcid !== null && (
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                  hasMCIDImprovement
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {hasMCIDImprovement
                  ? isBetter
                    ? '✓ Clinically significant improvement'
                    : '✓ Clinically significant change'
                  : `MCID: ${mcid} points`}
                {previousScore !== null && (
                  <span className="text-muted-foreground ml-1">
                    (prev: {previousScore})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Normative Data */}
      {normativeEntry && (
        <div className="border-border bg-card rounded-xl border p-5">
          <h4 className="text-foreground mb-3 text-sm font-semibold">
            Normative Comparison
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Population</span>
              <span className="text-foreground font-medium">{normativeEntry.population}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Normative Mean</span>
              <span className="text-foreground font-medium">
                {normativeEntry.mean} (SD: {normativeEntry.standardDeviation})
              </span>
            </div>
            {percentileRank !== null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Percentile</span>
                <span className="text-foreground font-medium">
                  ~{percentileRank}th percentile
                </span>
              </div>
            )}

            {/* Normative bar */}
            <div className="bg-border relative mt-2 h-4 overflow-hidden rounded-full">
              <div
                className="bg-primary/30 h-full rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(100, ((normativeEntry.mean - (minScore ?? 0)) / ((maxScore ?? 100) - (minScore ?? 0))) * 100))}%`,
                }}
              >
                <div
                  className="bg-primary/50 absolute inset-y-0"
                  style={{
                    left: `${Math.max(0, Math.min(100, ((normativeEntry.mean - normativeEntry.standardDeviation - (minScore ?? 0)) / ((maxScore ?? 100) - (minScore ?? 0))) * 100))}%`,
                    right: `${100 - Math.max(0, Math.min(100, ((normativeEntry.mean + normativeEntry.standardDeviation - (minScore ?? 0)) / ((maxScore ?? 100) - (minScore ?? 0))) * 100))}%`,
                  }}
                />
              </div>
              {/* Patient score marker */}
              <div
                className="bg-primary absolute top-0 h-full w-0.5 shadow-sm"
                style={{
                  left: `${Math.max(0, Math.min(100, ((score - (minScore ?? 0)) / ((maxScore ?? 100) - (minScore ?? 0))) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Lower</span>
              <span>Higher</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {maxScore !== null && (
          <div className="border-border bg-card rounded-xl border p-4">
            <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wider">
              Max Score
            </span>
            <span className="text-foreground mt-1 block text-lg font-bold">{maxScore}</span>
          </div>
        )}
        {mcid !== null && (
          <div className="border-border bg-card rounded-xl border p-4">
            <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wider">
              MCID
            </span>
            <span className="text-foreground mt-1 block text-lg font-bold">
              {mcid}
            </span>
            <span className="text-muted-foreground block text-[10px]">
              Minimal Clinically Important Difference
            </span>
          </div>
        )}
        {previousScore !== null && previousScore !== undefined && (
          <div className="border-border bg-card rounded-xl border p-4">
            <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wider">
              Change
            </span>
            <span
              className={cn(
                'mt-1 block text-lg font-bold',
                isBetter ? 'text-emerald-400' : 'text-destructive',
              )}
            >
              {score - previousScore > 0 ? '+' : ''}
              {score - previousScore}
            </span>
          </div>
        )}
        {percentage !== null && (
          <div className="border-border bg-card rounded-xl border p-4">
            <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wider">
              Percentile
            </span>
            <span className="text-foreground mt-1 block text-lg font-bold">
              {percentage}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function findNormativeEntry(data: NormativeData | null): NormativeDataEntry | null {
  if (!data?.entries || data.entries.length === 0) return null;
  // Return the first general entry (prefer one without age restrictions)
  return data.entries[0] ?? null;
}

function estimatePercentile(
  score: number,
  entry: NormativeDataEntry,
): number | null {
  if (!entry.percentileCutoffs) return null;

  const cutoffs = Object.entries(entry.percentileCutoffs)
    .map(([pct, val]) => ({ percentile: parseInt(pct, 10), value: val }))
    .sort((a, b) => a.value - b.value);

  for (let i = cutoffs.length - 1; i >= 0; i--) {
    const cutoff = cutoffs[i]!;
    if (score >= cutoff.value) {
      return cutoff.percentile;
    }
  }

  return cutoffs[0]?.percentile ?? null;
}
