'use client';

import { useState, useCallback } from 'react';
import {
  Brain,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  assessmentName: string;
  score: number;
  previousScore: number | null;
  maxScore: number | null;
  minScore: number | null;
  higherIsBetter: boolean;
  mcid: number | null;
  completedAt: string;
  responses: Record<string, unknown>;
}

export interface PatientContext {
  id: string;
  age: number;
  gender: string;
  diagnosis: string;
  relevantHistory: string;
  goals: string[];
  previousAssessments: AssessmentResult[];
}

export interface AIInterpretation {
  interpretation: string;
  confidence: 'low' | 'medium' | 'high';
  significantChanges: {
    description: string;
    type: 'improvement' | 'decline' | 'stable';
    magnitude: number;
  }[];
  followUpActions: string[];
  clinicalAlerts: string[];
}

interface AIInterpretationProps {
  assessmentResult: AssessmentResult;
  patientContext: PatientContext;
  onReinterpret?: () => void;
  className?: string;
}

// ── API call ───────────────────────────────────────────────────────────────

async function fetchInterpretation(
  result: AssessmentResult,
  context: PatientContext,
): Promise<AIInterpretation> {
  const res = await fetch('/api/ai/assess/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assessmentResult: {
        name: result.assessmentName,
        score: result.score,
        previousScore: result.previousScore,
        maxScore: result.maxScore,
        minScore: result.minScore,
        higherIsBetter: result.higherIsBetter,
        mcid: result.mcid,
      },
      patient: {
        age: context.age,
        gender: context.gender,
        diagnosis: context.diagnosis,
        relevantHistory: context.relevantHistory,
        goals: context.goals,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to interpret' }));
    throw new Error(err.message ?? err.error ?? 'Interpretation request failed');
  }

  const json = await res.json();
  return json.data as AIInterpretation;
}

// ── Component ──────────────────────────────────────────────────────────────

export function AIInterpretation({
  assessmentResult,
  patientContext,
  onReinterpret,
  className,
}: AIInterpretationProps) {
  const [interpretation, setInterpretation] = useState<AIInterpretation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInterpretation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchInterpretation(assessmentResult, patientContext);
      setInterpretation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [assessmentResult, patientContext]);

  // ── Confidence indicator ────────────────────────────────────────────

  const ConfidenceBadge = ({ confidence }: { confidence: 'low' | 'medium' | 'high' }) => (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        confidence === 'high' &&
          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        confidence === 'medium' &&
          'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        confidence === 'low' &&
          'bg-destructive/10 text-destructive border border-destructive/20',
      )}
    >
      {confidence === 'high' && <CheckCircle2 className="h-3 w-3" />}
      {confidence === 'medium' && <Minus className="h-3 w-3" />}
      {confidence === 'low' && <AlertTriangle className="h-3 w-3" />}
      {confidence} confidence
    </span>
  );

  // ── Trend icon ──────────────────────────────────────────────────────

  const TrendIcon = ({ type }: { type: 'improvement' | 'decline' | 'stable' }) => {
    if (type === 'improvement')
      return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (type === 'decline')
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  // ── Loading state ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={cn('border-border bg-card rounded-xl border p-6', className)}>
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="relative">
            <Brain className="text-primary h-10 w-10 animate-pulse" />
            <Loader2 className="text-muted-foreground absolute inset-0 h-10 w-10 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-foreground text-sm font-medium">
              Analyzing Assessment Results
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              AI is interpreting scores in clinical context...
            </p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-primary/40 h-2 w-2 animate-bounce rounded-full"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────

  if (error) {
    return (
      <div className={cn('border-border bg-card rounded-xl border p-6', className)}>
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="bg-destructive/10 text-destructive flex h-12 w-12 items-center justify-center rounded-full">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-foreground text-sm font-medium">
              Interpretation Failed
            </p>
            <p className="text-muted-foreground mt-1 text-xs">{error}</p>
          </div>
          <button
            type="button"
            onClick={generateInterpretation}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Empty / Generate state ──────────────────────────────────────────

  if (!interpretation) {
    return (
      <div className={cn('border-border bg-card rounded-xl border p-6', className)}>
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
            <Brain className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-foreground text-sm font-medium">
              AI Clinical Interpretation
            </p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              Generate an AI-powered clinical interpretation of this assessment
              result, including trend analysis, clinically significant changes,
              and suggested follow-up actions.
            </p>
          </div>
          <button
            type="button"
            onClick={generateInterpretation}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-medium transition-colors"
          >
            <Brain className="h-4 w-4" /> Generate Interpretation
          </button>
        </div>
      </div>
    );
  }

  // ── Result view ─────────────────────────────────────────────────────

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="border-border bg-card rounded-xl border p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-foreground text-sm font-semibold">
                AI Clinical Interpretation
              </h3>
              <p className="text-muted-foreground text-xs">
                {assessmentResult.assessmentName} —{' '}
                {new Date(assessmentResult.completedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ConfidenceBadge confidence={interpretation.confidence} />
            {onReinterpret && (
              <button
                type="button"
                onClick={() => {
                  setInterpretation(null);
                  onReinterpret();
                }}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
                title="Reinterpret"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interpretation paragraph */}
      <div className="border-border bg-card rounded-xl border p-5">
        <p className="text-foreground text-sm leading-relaxed">
          {interpretation.interpretation}
        </p>
      </div>

      {/* Clinically significant changes */}
      {interpretation.significantChanges.length > 0 && (
        <div className="border-border bg-card rounded-xl border p-5">
          <h4 className="text-foreground mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <TrendingUp className="h-4 w-4" />
            Clinically Significant Changes
          </h4>
          <div className="space-y-2">
            {interpretation.significantChanges.map((change, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3',
                  change.type === 'improvement' &&
                    'border-emerald-500/20 bg-emerald-500/[0.03]',
                  change.type === 'decline' &&
                    'border-destructive/20 bg-destructive/[0.03]',
                  change.type === 'stable' &&
                    'border-border bg-accent/20',
                )}
              >
                <TrendIcon type={change.type} />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm">{change.description}</p>
                  <span
                    className={cn(
                      'mt-0.5 inline-block text-xs font-medium',
                      change.type === 'improvement' && 'text-emerald-400',
                      change.type === 'decline' && 'text-destructive',
                      change.type === 'stable' && 'text-muted-foreground',
                    )}
                  >
                    {change.magnitude > 0 ? '+' : ''}
                    {change.magnitude.toFixed(1)} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical alerts */}
      {interpretation.clinicalAlerts.length > 0 && (
        <div className="border-amber-500/20 bg-amber-500/[0.03] rounded-xl border p-5">
          <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            Clinical Alerts
          </h4>
          <ul className="space-y-2">
            {interpretation.clinicalAlerts.map((alert, idx) => (
              <li key={idx} className="text-foreground flex items-start gap-2 text-sm">
                <span className="text-amber-400 mt-0.5">•</span>
                {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested follow-up actions */}
      {interpretation.followUpActions.length > 0 && (
        <div className="border-border bg-card rounded-xl border p-5">
          <h4 className="text-foreground mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <Lightbulb className="h-4 w-4" />
            Suggested Follow-Up Actions
          </h4>
          <div className="space-y-2">
            {interpretation.followUpActions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                  {idx + 1}
                </span>
                <p className="text-foreground text-sm">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-muted-foreground px-1 text-[10px] leading-relaxed">
        This AI-generated interpretation is for clinical decision support only
        and does not replace professional clinical judgment. Always verify
        findings and consider the full clinical picture before making treatment
        decisions.
      </p>
    </div>
  );
}
