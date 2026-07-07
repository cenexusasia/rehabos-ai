'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';

interface ScoreDataPoint {
  id: string;
  score: number | null;
  completed_at: string | null;
  created_at: string;
}

interface AssessmentChartProps {
  data: ScoreDataPoint[];
  assessmentName: string;
  minScore?: number | null;
  maxScore?: number | null;
  mcid?: number | null;
  higherIsBetter?: boolean;
  className?: string;
}

export function AssessmentChart({
  data,
  assessmentName,
  minScore,
  maxScore,
  mcid,
  higherIsBetter = true,
  className,
}: AssessmentChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'border-border bg-card flex items-center justify-center rounded-xl border p-8',
          className,
        )}
      >
        <p className="text-muted-foreground text-sm">
          No score history available yet.
        </p>
      </div>
    );
  }

  const chartData = data
    .filter((d) => d.score !== null)
    .map((d, idx) => ({
      name: d.completed_at
        ? new Date(d.completed_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : `Session ${idx + 1}`,
      score: d.score ?? 0,
      fullDate: d.completed_at,
    }));

  const scores = chartData.map((d) => d.score);
  const minVal = minScore ?? Math.min(...scores, 0);
  const maxVal = maxScore ?? Math.max(...scores, 10);
  const domainPadding = (maxVal - minVal) * 0.1 || 1;

  const firstScore = chartData[0]?.score ?? 0;
  const latestScore = chartData[chartData.length - 1]?.score ?? 0;
  const improvement = higherIsBetter
    ? latestScore - firstScore
    : firstScore - latestScore;
  const isImproving = improvement > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with trend */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-foreground text-sm font-semibold">
            Score Trend: {assessmentName}
          </h4>
          {chartData.length > 1 && (
            <p
              className={cn(
                'mt-0.5 text-xs font-medium',
                isImproving ? 'text-emerald-400' : 'text-destructive',
              )}
            >
              {isImproving ? '↑ Improving' : '↓ Declining'} ({improvement > 0 ? '+' : ''}
              {improvement.toFixed(1)} pts)
            </p>
          )}
        </div>
        <div className="text-right">
          <span className="text-foreground text-lg font-bold">{latestScore}</span>
          {maxScore !== null && (
            <span className="text-muted-foreground text-xs"> / {maxScore}</span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="border-border bg-card rounded-xl border p-4">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[minVal - domainPadding, maxVal + domainPadding]}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '13px',
              }}
              labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
              formatter={(value: number) => [
                `${value.toFixed(1)}`,
                'Score',
              ]}
            />
            {/* MCID reference line */}
            {mcid !== null && chartData.length > 0 && (
              <ReferenceLine
                y={firstScore + (higherIsBetter ? (mcid ?? 0) : -(mcid ?? 0))}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: 'MCID',
                  position: 'right',
                  fontSize: 10,
                  fill: 'var(--muted-foreground)',
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: 'var(--primary)',
                stroke: 'var(--card)',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: 'var(--primary)',
                stroke: 'var(--card)',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mini table */}
      <div className="border-border bg-card rounded-xl border overflow-hidden">
        <div className="divide-border divide-y">
          <div className="text-muted-foreground grid grid-cols-3 gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider">
            <span>Date</span>
            <span>Score</span>
            <span>Change</span>
          </div>
          {chartData
            .slice(-5)
            .reverse()
            .map((d, idx, arr) => {
              const prevScore = idx < arr.length - 1 ? arr[idx + 1]?.score : null;
              const change =
                prevScore !== null && prevScore !== undefined
                  ? d.score - prevScore
                  : null;
              return (
                <div
                  key={d.fullDate ?? idx}
                  className="grid grid-cols-3 gap-2 px-4 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="text-foreground font-medium">{d.score}</span>
                  <span
                    className={cn(
                      change !== null && change > 0
                        ? 'text-emerald-400'
                        : change !== null && change < 0
                          ? 'text-destructive'
                          : 'text-muted-foreground',
                    )}
                  >
                    {change !== null
                      ? `${change > 0 ? '+' : ''}${change.toFixed(1)}`
                      : '—'}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
