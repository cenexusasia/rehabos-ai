'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { ProtocolPhaseType, CreateProtocolPhaseData } from '@/types/protocol';

const PHASE_TYPE_OPTIONS: { value: ProtocolPhaseType; label: string; description: string }[] = [
  { value: 'evaluation', label: 'Evaluation', description: 'Initial assessment and baseline' },
  { value: 'intervention', label: 'Intervention', description: 'Active treatment phase' },
  { value: 'reassessment', label: 'Reassessment', description: 'Progress evaluation' },
  { value: 'discharge', label: 'Discharge', description: 'Discharge planning and HEP' },
];

const CATEGORY_OPTIONS = [
  'Orthopedic', 'Sports', 'Spine', 'Neurological', 'Pediatric',
  'Geriatric', 'Cardiopulmonary', 'Vestibular', 'Hand Therapy', 'General',
];

const BODY_REGION_OPTIONS = [
  'Cervical Spine', 'Thoracic Spine', 'Lumbar Spine', 'Shoulder', 'Elbow',
  'Wrist', 'Hand', 'Hip', 'Knee', 'Ankle', 'Foot', 'Upper Extremity',
  'Lower Extremity', 'Spine', 'Pelvis', 'TMJ',
];

export default function NewProtocolPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    bodyRegions: [] as string[],
    conditions: '',
    estimatedDurationWeeks: 8,
  });

  const [phases, setPhases] = useState<CreateProtocolPhaseData[]>([
    {
      name: 'Phase 1: Acute',
      description: 'Acute phase management',
      phase_type: 'intervention' as ProtocolPhaseType,
      duration_weeks: 4,
      goals: ['Pain and edema control', 'Protect healing tissues', 'Maintain ROM within protected range'],
      criteria: {
        progressionCriteria: 'Pain controlled, able to perform basic ADLs',
        regressionCriteria: 'Increased pain or swelling, signs of tissue irritation',
        dischargeCriteria: '',
      },
      exercise_ids: [],
      contraindications: ['Aggressive stretching', 'Heavy resistance training'],
      precautions: ['Avoid painful range', 'Monitor for signs of irritation'],
      instructions: 'Focus on isometric exercises and gentle AROM within pain-free range.',
    },
    {
      name: 'Phase 2: Recovery',
      description: 'Recovery and strengthening',
      phase_type: 'intervention' as ProtocolPhaseType,
      duration_weeks: 4,
      goals: ['Restore full ROM', 'Begin progressive strengthening', 'Improve neuromuscular control'],
      criteria: {
        progressionCriteria: 'Full pain-free ROM, 4/5 strength',
        regressionCriteria: 'Pain with resisted exercises, loss of ROM',
        dischargeCriteria: '',
      },
      exercise_ids: [],
      contraindications: ['Painful resistance training'],
      precautions: ['Progress load gradually', 'Monitor for compensatory patterns'],
      instructions: 'Progress from isometric to isotonic exercises. Add closed-chain activities.',
    },
  ]);

  const addPhase = () => {
    const newPhase: CreateProtocolPhaseData = {
      name: `Phase ${phases.length + 1}`,
      description: '',
      phase_type: 'intervention',
      duration_weeks: 4,
      goals: [],
      exercise_ids: [],
      contraindications: [],
      precautions: [],
      instructions: '',
    };
    setPhases([...phases, newPhase]);
  };

  const removePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index));
  };

  const updatePhase = (index: number, updates: Partial<CreateProtocolPhaseData>) => {
    setPhases(phases.map((p, i) => (i === index ? { ...p, ...updates } : p)));
  };

  const toggleBodyRegion = (region: string) => {
    setForm((prev) => ({
      ...prev,
      bodyRegions: prev.bodyRegions.includes(region)
        ? prev.bodyRegions.filter((r) => r !== region)
        : [...prev.bodyRegions, region],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Protocol name is required');
      return;
    }
    setSaving(true);
    setError(null);

    try {
      // In a real implementation, this would save to Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/protocols');
    } catch {
      setError('Failed to save protocol. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/protocols"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-foreground text-2xl font-bold">Create Protocol</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Define a new evidence-based rehabilitation protocol
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Protocol'}
        </button>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="border-border bg-card rounded-xl border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                Protocol Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Total Knee Arthroplasty Rehabilitation"
                className={cn(
                  'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                  'placeholder:text-muted-foreground/60 transition-colors',
                )}
              />
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe the protocol, its purpose, and target population..."
                className={cn(
                  'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                  'placeholder:text-muted-foreground/60 transition-colors resize-none',
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-foreground mb-1.5 block text-sm font-medium">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    'appearance-none transition-colors',
                  )}
                >
                  <option value="">Select category...</option>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-foreground mb-1.5 block text-sm font-medium">
                  Estimated Duration (weeks)
                </label>
                <input
                  type="number"
                  value={form.estimatedDurationWeeks}
                  onChange={(e) => setForm({ ...form, estimatedDurationWeeks: Number(e.target.value) })}
                  min={1}
                  max={52}
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    'transition-colors',
                  )}
                />
              </div>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">Body Regions</label>
              <div className="flex flex-wrap gap-1.5">
                {BODY_REGION_OPTIONS.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleBodyRegion(region)}
                    className={cn(
                      'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
                      form.bodyRegions.includes(region)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
                    )}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                Related Conditions (comma separated)
              </label>
              <input
                type="text"
                value={form.conditions}
                onChange={(e) => setForm({ ...form, conditions: e.target.value })}
                placeholder="e.g., Total Knee Arthroplasty, Osteoarthritis"
                className={cn(
                  'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                  'placeholder:text-muted-foreground/60 transition-colors',
                )}
              />
            </div>
          </div>
        </div>

        {/* Phases */}
        <div className="border-border bg-card rounded-xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-foreground text-lg font-semibold">Protocol Phases</h2>
              <p className="text-muted-foreground text-sm">Define the phases of this rehabilitation protocol</p>
            </div>
            <button
              type="button"
              onClick={addPhase}
              className="text-muted-foreground hover:text-foreground hover:border-primary/40 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Phase
            </button>
          </div>

          <div className="space-y-4">
            {phases.map((phase, idx) => (
              <PhaseEditor
                key={idx}
                phase={phase}
                index={idx}
                onUpdate={(updates) => updatePhase(idx, updates)}
                onRemove={() => removePhase(idx)}
                canRemove={phases.length > 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Phase Editor ─────────────────────────────────────────────────────────────

function PhaseEditor({
  phase,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  phase: CreateProtocolPhaseData;
  index: number;
  onUpdate: (updates: Partial<CreateProtocolPhaseData>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="border-border rounded-lg border">
      {/* Phase Header */}
      <div className="flex items-center justify-between border-b border-border bg-accent/20 px-4 py-3 rounded-t-lg">
        <div className="flex items-center gap-3">
          <GripVertical className="text-muted-foreground h-4 w-4 cursor-grab" />
          <div className="flex items-center gap-2">
            <span className="border-border bg-card text-foreground flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold">
              {index + 1}
            </span>
            <input
              type="text"
              value={phase.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="text-foreground border-none bg-transparent text-sm font-medium focus:outline-none"
              placeholder="Phase name..."
            />
          </div>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive rounded-md p-1 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Phase Body */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-muted-foreground mb-1 block text-[10px] font-medium uppercase tracking-wider">Type</label>
            <select
              value={phase.phase_type}
              onChange={(e) => onUpdate({ phase_type: e.target.value as ProtocolPhaseType })}
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'appearance-none transition-colors',
              )}
            >
              {PHASE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-[10px] font-medium uppercase tracking-wider">Duration</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={phase.duration_weeks}
                onChange={(e) => onUpdate({ duration_weeks: Number(e.target.value) })}
                min={1}
                className={cn(
                  'border-input bg-background text-foreground w-20 rounded-lg border px-2.5 py-1.5 text-xs',
                  'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                  'transition-colors',
                )}
              />
              <span className="text-muted-foreground text-xs">weeks</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-[10px] font-medium uppercase tracking-wider">Description</label>
          <input
            type="text"
            value={phase.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Phase description..."
            className={cn(
              'border-input bg-background text-foreground w-full rounded-lg border px-3 py-1.5 text-xs',
              'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
              'placeholder:text-muted-foreground/60 transition-colors',
            )}
          />
        </div>

        {/* Goals */}
        <div>
          <label className="text-muted-foreground mb-1 block text-[10px] font-medium uppercase tracking-wider">Goals</label>
          <div className="space-y-1.5">
            {phase.goals.map((goal, gi) => (
              <div key={gi} className="flex items-center gap-1.5">
                <div className="bg-primary/10 h-1.5 w-1.5 shrink-0 rounded-full" />
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => {
                    const newGoals = [...phase.goals];
                    newGoals[gi] = e.target.value;
                    onUpdate({ goals: newGoals });
                  }}
                  className={cn(
                    'border-input bg-background text-foreground flex-1 rounded-lg border px-2.5 py-1.5 text-xs',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    'transition-colors',
                  )}
                  placeholder="Goal..."
                />
                <button
                  type="button"
                  onClick={() => onUpdate({ goals: phase.goals.filter((_, i) => i !== gi) })}
                  className="text-muted-foreground hover:text-destructive p-0.5"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onUpdate({ goals: [...phase.goals, ''] })}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[10px] font-medium transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add Goal
            </button>
          </div>
        </div>

        {/* Criteria */}
        <div>
          <label className="text-muted-foreground mb-1 block text-[10px] font-medium uppercase tracking-wider">Progression Criteria</label>
          <input
            type="text"
            value={phase.criteria?.progressionCriteria ?? ''}
            onChange={(e) => onUpdate({
              criteria: { ...phase.criteria, progressionCriteria: e.target.value },
            })}
            placeholder="Criteria to advance to next phase..."
            className={cn(
              'border-input bg-background text-foreground w-full rounded-lg border px-3 py-1.5 text-xs',
              'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
              'placeholder:text-muted-foreground/60 transition-colors',
            )}
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="text-muted-foreground mb-1 block text-[10px] font-medium uppercase tracking-wider">Instructions</label>
          <textarea
            value={phase.instructions}
            onChange={(e) => onUpdate({ instructions: e.target.value })}
            rows={2}
            className={cn(
              'border-input bg-background text-foreground w-full rounded-lg border px-3 py-1.5 text-xs',
              'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
              'placeholder:text-muted-foreground/60 transition-colors resize-none',
            )}
            placeholder="Phase instructions..."
          />
        </div>
      </div>
    </div>
  );
}
