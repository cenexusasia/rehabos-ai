'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  Clock,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Target,
  AlertTriangle,
  Shield,
  BookOpen,
  Activity,
  Play,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Protocol, ProtocolPhase, ProtocolPhaseType } from '@/types/protocol';

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PROTOCOL: Protocol = {
  id: '1',
  organization_id: null,
  name: 'Total Knee Arthroplasty Rehabilitation',
  description:
    'Post-operative rehabilitation protocol for total knee replacement patients. Includes phased approach from acute to advanced strengthening, with emphasis on regaining ROM, strength, and functional mobility.',
  category: 'Orthopedic',
  body_regions: ['Lower Extremity', 'Knee'],
  conditions: ['Total Knee Arthroplasty', 'Osteoarthritis'],
  status: 'active',
  version: '2.1',
  estimated_duration_weeks: 12,
  created_by: null,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-06-20T00:00:00Z',
  phases: [
    {
      id: 'p1',
      protocol_id: '1',
      name: 'Phase 1: Acute (Weeks 1-4)',
      description: 'Protect surgical repair, manage pain and swelling, initiate early ROM',
      phase_type: 'intervention',
      sort_order: 1,
      duration_weeks: 4,
      goals: [
        'Pain and edema control',
        'Protect surgical repair',
        'Achieve 0-90 degrees knee flexion',
        'Full knee extension',
        'Independent with bed mobility and transfers',
      ],
      criteria: {
        progressionCriteria: 'Pain well-controlled, swelling reduced, 0-90 degrees flexion, able to perform quad sets independently',
        regressionCriteria: 'Increased pain or swelling, loss of ROM, signs of wound complications',
        dischargeCriteria: '',
      },
      exercise_ids: ['ex1', 'ex2', 'ex3'],
      contraindications: ['Open chain resisted knee extension', 'Aggressive passive stretching', 'High-impact activities'],
      precautions: ['Avoid painful range of motion', 'Monitor incision site', 'Watch for signs of DVT'],
      instructions: 'Begin immediate post-op day 1. Focus on quad sets, ankle pumps, and heel slides within pain-free range. Progress AROM as tolerated.',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-06-20T00:00:00Z',
    },
    {
      id: 'p2',
      protocol_id: '1',
      name: 'Phase 2: Recovery (Weeks 4-8)',
      description: 'Restore full ROM, begin strengthening, improve neuromuscular control',
      phase_type: 'intervention',
      sort_order: 2,
      duration_weeks: 4,
      goals: [
        'Full active knee extension',
        'Active knee flexion to 120+ degrees',
        'Quadriceps strength 4/5',
        'Independent with flat surface ambulation',
        'Improved balance and proprioception',
      ],
      criteria: {
        progressionCriteria: 'Full active extension, flexion >110, quad strength 4/5, no joint effusion',
        regressionCriteria: 'Increased pain with exercise, joint effusion, loss of ROM',
        dischargeCriteria: '',
      },
      exercise_ids: ['ex4', 'ex5', 'ex6'],
      contraindications: ['High-impact activities', 'Competitive sport-specific training'],
      precautions: ['Progress resistance gradually', 'Monitor for patellofemoral pain'],
      instructions: 'Progress from isometric to isotonic exercises. Initiate closed-chain activities. Begin stationary bike for ROM.',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-06-20T00:00:00Z',
    },
    {
      id: 'p3',
      protocol_id: '1',
      name: 'Phase 3: Functional (Weeks 8-12)',
      description: 'Advanced strengthening, functional training, return to activity',
      phase_type: 'intervention',
      sort_order: 3,
      duration_weeks: 4,
      goals: [
        'Quadriceps strength 5/5',
        'Independent with stairs',
        'Squat to 90 degrees with good form',
        'Single leg stance >30 seconds',
        'Return to recreational activities',
      ],
      criteria: {
        progressionCriteria: 'Full strength, functional independence, no pain with ADLs',
        regressionCriteria: 'Pain with advanced loading, joint instability, functional limitations',
        dischargeCriteria: 'Patient independent with HEP, meets all goals, cleared for discharge',
      },
      exercise_ids: ['ex7', 'ex8'],
      contraindications: ['Contact sports until cleared'],
      precautions: ['Progress impact gradually', 'Continue HEP compliance'],
      instructions: 'Emphasize advanced strengthening, proprioceptive training, and sport-specific preparation. Develop discharge HEP.',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-06-20T00:00:00Z',
    },
    {
      id: 'p4',
      protocol_id: '1',
      name: 'Discharge',
      description: 'Discharge planning and home exercise program',
      phase_type: 'discharge',
      sort_order: 4,
      duration_weeks: 0,
      goals: [
        'Patient independent with HEP',
        'Understanding of activity progression',
        'Knowledge of warning signs',
        'Follow-up plan established',
      ],
      criteria: {
        progressionCriteria: '',
        regressionCriteria: '',
        dischargeCriteria: 'All goals met, patient demonstrates independence with HEP, cleared by surgeon',
      },
      exercise_ids: [],
      contraindications: [],
      precautions: ['Long-term joint protection education', 'Activity modification as needed'],
      instructions: 'Provide written HEP. Schedule follow-up assessment at 6 months. Educate on lifelong joint protection.',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-06-20T00:00:00Z',
    },
  ],
};

const PHASE_TYPE_COLORS: Record<ProtocolPhaseType, string> = {
  evaluation: 'border-blue-500/30 bg-blue-500/5',
  intervention: 'border-emerald-500/30 bg-emerald-500/5',
  reassessment: 'border-amber-500/30 bg-amber-500/5',
  discharge: 'border-purple-500/30 bg-purple-500/5',
};

const PHASE_TYPE_BADGES: Record<ProtocolPhaseType, { label: string; icon: React.ReactNode }> = {
  evaluation: { label: 'Evaluation', icon: <Activity className="h-3 w-3" /> },
  intervention: { label: 'Intervention', icon: <Play className="h-3 w-3" /> },
  reassessment: { label: 'Reassessment', icon: <RotateCcw className="h-3 w-3" /> },
  discharge: { label: 'Discharge', icon: <CheckCircle2 className="h-3 w-3" /> },
};

export default function ProtocolDetailPage() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>('p1');
  const [isLoading] = useState(false);

  // Use mock data in place of real API
  const protocol = MOCK_PROTOCOL;
  const sortedPhases = [...(protocol?.phases ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!protocol) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          Protocol not found or failed to load.
        </div>
        <Link
          href="/protocols"
          className="text-muted-foreground hover:text-foreground mt-4 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to protocols
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/protocols"
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to protocol library
      </Link>

      {/* Header */}
      <div className="border-border bg-card mb-6 rounded-xl border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-3">
              <span className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </span>
              {protocol.category && (
                <span className="border-border bg-accent/50 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[10px] font-medium">
                  {protocol.category}
                </span>
              )}
              <span className="text-muted-foreground text-[10px] font-medium">v{protocol.version}</span>
            </div>
            <h1 className="text-foreground text-2xl font-bold">{protocol.name}</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {protocol.description}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
          <div className="border-border bg-accent/20 rounded-lg border p-3">
            <div className="text-muted-foreground mb-0.5 text-[10px] font-medium uppercase tracking-wider">Duration</div>
            <div className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
              <Clock className="text-primary h-3.5 w-3.5" />
              {protocol.estimated_duration_weeks} weeks
            </div>
          </div>
          <div className="border-border bg-accent/20 rounded-lg border p-3">
            <div className="text-muted-foreground mb-0.5 text-[10px] font-medium uppercase tracking-wider">Phases</div>
            <div className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
              <Layers className="text-primary h-3.5 w-3.5" />
              {sortedPhases.length}
            </div>
          </div>
          <div className="border-border bg-accent/20 rounded-lg border p-3">
            <div className="text-muted-foreground mb-0.5 text-[10px] font-medium uppercase tracking-wider">Conditions</div>
            <div className="text-foreground text-sm font-semibold">
              {protocol.conditions.length}
            </div>
          </div>
          <div className="border-border bg-accent/20 rounded-lg border p-3">
            <div className="text-muted-foreground mb-0.5 text-[10px] font-medium uppercase tracking-wider">Body Regions</div>
            <div className="text-foreground text-sm font-semibold">
              {protocol.body_regions.length}
            </div>
          </div>
        </div>

        {/* Body regions / conditions tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {protocol.body_regions.map((region) => (
            <span key={region} className="border-border bg-accent/50 text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-medium">
              {region}
            </span>
          ))}
          {protocol.conditions.map((cond) => (
            <span key={cond} className="border-blue-500/20 bg-blue-500/5 text-blue-400 rounded-md border px-2 py-0.5 text-[10px] font-medium">
              {cond}
            </span>
          ))}
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="mb-4">
        <h2 className="text-foreground mb-1 text-lg font-semibold">Protocol Phases</h2>
        <p className="text-muted-foreground text-sm">
          {sortedPhases.reduce((sum, p) => sum + p.duration_weeks, 0)} weeks total across {sortedPhases.length} phases
        </p>
      </div>

      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="bg-border absolute top-0 bottom-0 left-[19px] w-px" />

        {sortedPhases.map((phase, idx) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            phaseNumber={idx + 1}
            isExpanded={expandedPhase === phase.id}
            onToggle={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Phase Card ───────────────────────────────────────────────────────────────

function PhaseCard({
  phase,
  phaseNumber,
  isExpanded,
  onToggle,
}: {
  phase: ProtocolPhase;
  phaseNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const phaseColor = PHASE_TYPE_COLORS[phase.phase_type] ?? 'border-border';
  const phaseBadge = PHASE_TYPE_BADGES[phase.phase_type] ?? { label: phase.phase_type, icon: null };

  return (
    <div className={cn('border rounded-xl overflow-hidden transition-all', phaseColor)}>
      {/* Header (always visible) */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-accent/30"
      >
        {/* Phase number badge */}
        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card">
          <span className="text-foreground text-sm font-bold">{phaseNumber}</span>
        </div>

        <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-sm font-semibold truncate">{phase.name}</h3>
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0',
                phaseColor,
              )}>
                {phaseBadge.icon}
                {phaseBadge.label}
              </span>
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs truncate">{phase.description}</p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {phase.duration_weeks} weeks
            </span>
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <Target className="h-3 w-3" />
              {phase.goals.length} goals
            </span>
            {isExpanded ? (
              <ChevronUp className="text-muted-foreground h-4 w-4" />
            ) : (
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-border px-5 py-4 space-y-5">
          {/* Goals */}
          {phase.goals.length > 0 && (
            <div>
              <h4 className="text-foreground mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <Target className="text-primary h-3.5 w-3.5" />
                Goals
              </h4>
              <ul className="space-y-1.5">
                {phase.goals.map((goal, gi) => (
                  <li key={gi} className="text-muted-foreground flex items-start gap-2 text-sm">
                    <div className="bg-primary/10 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Criteria */}
          {phase.criteria && (
            <div className="grid grid-cols-2 gap-4">
              {phase.criteria.progressionCriteria && (
                <div className="border-emerald-500/20 bg-emerald-500/5 rounded-lg border p-3">
                  <div className="text-emerald-400 mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider">
                    <Play className="h-3 w-3" />
                    Progression Criteria
                  </div>
                  <p className="text-foreground text-xs">{phase.criteria.progressionCriteria}</p>
                </div>
              )}
              {phase.criteria.regressionCriteria && (
                <div className="border-amber-500/20 bg-amber-500/5 rounded-lg border p-3">
                  <div className="text-amber-400 mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider">
                    <AlertTriangle className="h-3 w-3" />
                    Regression Criteria
                  </div>
                  <p className="text-foreground text-xs">{phase.criteria.regressionCriteria}</p>
                </div>
              )}
            </div>
          )}

          {/* Contraindications & Precautions */}
          <div className="grid grid-cols-2 gap-4">
            {phase.contraindications.length > 0 && (
              <div>
                <h4 className="text-destructive mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                  <Shield className="h-3 w-3" />
                  Contraindications
                </h4>
                <ul className="space-y-1">
                  {phase.contraindications.map((item, ci) => (
                    <li key={ci} className="text-muted-foreground flex items-start gap-1.5 text-xs">
                      <span className="text-destructive">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {phase.precautions.length > 0 && (
              <div>
                <h4 className="text-amber-400 mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                  <AlertTriangle className="h-3 w-3" />
                  Precautions
                </h4>
                <ul className="space-y-1">
                  {phase.precautions.map((item, ci) => (
                    <li key={ci} className="text-muted-foreground flex items-start gap-1.5 text-xs">
                      <span className="text-amber-400">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Instructions */}
          {phase.instructions && (
            <div>
              <h4 className="text-foreground mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                <BookOpen className="text-primary h-3 w-3" />
                Instructions
              </h4>
              <p className="text-muted-foreground bg-accent/20 rounded-lg border border-border p-3 text-sm leading-relaxed">
                {phase.instructions}
              </p>
            </div>
          )}

          {/* Exercises */}
          {phase.exercise_ids.length > 0 && (
            <div>
              <h4 className="text-foreground mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                <Activity className="text-primary h-3 w-3" />
                Linked Exercises ({phase.exercise_ids.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {phase.exercise_ids.map((exId) => (
                  <span
                    key={exId}
                    className="border-border bg-accent/50 text-muted-foreground rounded-md border px-2.5 py-1 text-[10px] font-medium"
                  >
                    Exercise #{exId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
