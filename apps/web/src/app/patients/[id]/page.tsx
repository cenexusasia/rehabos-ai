'use client';

import { useState, useCallback } from 'react';
import {
  ArrowLeft,
  Loader2,
  Calendar,
  ClipboardList,
  Stethoscope,
  MessageSquare,
  Edit,
  Activity,
  Dumbbell,
  DollarSign,
  TrendingUp,
  Brain,
  ChevronDown,
  ChevronRight,
  User,
  Phone,
  Mail,
  Shield,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { usePatient, usePatientTimeline } from '@/hooks/use-patients';
import { PatientTimeline } from '@/components/patients/patient-timeline';
import { calculateAge, statusColors } from '@/components/patients/patient-card';
import type { Patient } from '@/types/patient';
import type { TimelineEvent } from '@/types/patient';

// ── Tab definitions ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'timeline', label: 'Timeline', icon: Activity },
  { id: 'visits', label: 'Visits', icon: ClipboardList },
  { id: 'assessments', label: 'Assessments', icon: Stethoscope },
  { id: 'hep', label: 'HEP', icon: Dumbbell },
  { id: 'billing', label: 'Billing', icon: DollarSign },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ── Main Page Component ────────────────────────────────────────────────────

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: patient, isLoading, error } = usePatient(id);
  const {
    data: timelineEvents,
    isLoading: timelineLoading,
  } = usePatientTimeline(id);

  const [activeTab, setActiveTab] = useState<TabId>('timeline');
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false);

  const handleEventClick = useCallback(
    (event: TimelineEvent) => {
      // Navigate based on event type
      switch (event.type) {
        case 'visit':
          router.push(`/patients/${id}/visits/${event.id}`);
          break;
        case 'soap':
          router.push(`/patients/${id}/soap/${event.id}`);
          break;
        case 'assessment':
          router.push(`/patients/${id}/assessments/${event.id}`);
          break;
        case 'hep':
          router.push(`/patients/${id}/hep/${event.id}`);
          break;
        case 'message':
          router.push(`/patients/${id}/messages/${event.id}`);
          break;
        case 'appointment':
          router.push(`/patients/${id}/appointments/${event.id}`);
          break;
      }
    },
    [id, router],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          Patient not found or failed to load.
        </div>
        <Link
          href="/patients"
          className="text-muted-foreground hover:text-foreground mt-4 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to patients
        </Link>
      </div>
    );
  }

  const age = calculateAge(patient.date_of_birth);
  const primaryDiagnosis: string | null =
    patient.diagnosis_codes && patient.diagnosis_codes.length > 0
      ? (patient.diagnosis_codes[0] ?? null)
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Back link ─────────────────────────────────────────────── */}
      <Link
        href="/patients"
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to patients
      </Link>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ── Main Content ────────────────────────────────────────── */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Patient Header */}
          <PatientHeader patient={patient} age={age} primaryDiagnosis={primaryDiagnosis} />

          {/* Key Info Strip */}
          <PatientKeyInfo patient={patient} />

          {/* Quick Action Buttons */}
          <QuickActions id={id} />

          {/* Tabs */}
          <PatientTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'timeline' && (
              <PatientTimeline
                events={timelineEvents}
                isLoading={timelineLoading}
                onEventClick={handleEventClick}
              />
            )}
            {activeTab === 'visits' && (
              <EmptyTabState
                icon={<ClipboardList className="h-8 w-8" />}
                title="Visits"
                description="Patient visit records will appear here."
              />
            )}
            {activeTab === 'assessments' && (
              <EmptyTabState
                icon={<Stethoscope className="h-8 w-8" />}
                title="Assessments"
                description="Functional assessments and outcome measures will appear here."
              />
            )}
            {activeTab === 'hep' && (
              <EmptyTabState
                icon={<Dumbbell className="h-8 w-8" />}
                title="Home Exercise Program"
                description="HEP assignments and compliance data will appear here."
              />
            )}
            {activeTab === 'billing' && (
              <EmptyTabState
                icon={<DollarSign className="h-8 w-8" />}
                title="Billing"
                description="Insurance claims and payment records will appear here."
              />
            )}
            {activeTab === 'progress' && (
              <EmptyTabState
                icon={<TrendingUp className="h-8 w-8" />}
                title="Progress Notes"
                description="Progress reports and outcome tracking will appear here."
              />
            )}
          </div>
        </div>

        {/* ── AI Insights Sidebar ─────────────────────────────────── */}
        <div className="w-full shrink-0 lg:w-72">
          <AiInsightsPanel
            open={aiInsightsOpen}
            onToggle={() => setAiInsightsOpen(!open)}
            patient={patient}
          />
        </div>
      </div>
    </div>
  );
}

// ── Patient Header ──────────────────────────────────────────────────────────

function PatientHeader({
  patient,
  age,
  primaryDiagnosis,
}: {
  patient: Patient;
  age: number;
  primaryDiagnosis: string | null;
}) {
  const initials = `${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`.toUpperCase();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:gap-5">
      {/* Avatar */}
      <div className="bg-primary/10 text-primary flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-xl font-bold">
        {patient.avatar_url ? (
          <img
            src={patient.avatar_url}
            alt={`${patient.first_name} ${patient.last_name}`}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          initials
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <h1 className="text-foreground truncate text-xl font-bold sm:text-2xl">
            {patient.first_name} {patient.last_name}
          </h1>
          <span
            className={cn(
              'inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
              statusColors[patient.status],
            )}
          >
            {patient.status}
          </span>
        </div>

        <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span>
            {age} years &middot; {patient.gender}
          </span>
          {primaryDiagnosis && (
            <>
              <span className="text-border hidden sm:inline">|</span>
              <span className="inline-flex items-center gap-1">
                <HeartPulse className="h-3.5 w-3.5" />
                {primaryDiagnosis}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Edit button */}
      <Link
        href={`/patients/${patient.id}/edit`}
        className={cn(
          'border-input bg-background text-foreground hover:bg-accent inline-flex items-center gap-1.5 self-start rounded-lg border px-3 py-2 text-sm font-medium transition-colors sm:self-center',
        )}
      >
        <Edit className="h-4 w-4" />
        Edit
      </Link>
    </div>
  );
}

// ── Key Info Strip ──────────────────────────────────────────────────────────

function PatientKeyInfo({ patient }: { patient: Patient }) {
  const infoItems = [
    {
      label: 'Date of Birth',
      value: patient.date_of_birth
        ? new Date(patient.date_of_birth).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : null,
      icon: <Calendar className="h-3.5 w-3.5" />,
    },
    {
      label: 'Phone',
      value: patient.phone,
      icon: <Phone className="h-3.5 w-3.5" />,
    },
    {
      label: 'Email',
      value: patient.email,
      icon: <Mail className="h-3.5 w-3.5" />,
    },
    {
      label: 'Insurance',
      value: patient.insurance_provider ?? null,
      icon: <Shield className="h-3.5 w-3.5" />,
    },
    {
      label: 'Emergency Contact',
      value: patient.emergency_contact?.name
        ? `${patient.emergency_contact.name}${patient.emergency_contact.phone ? ` · ${patient.emergency_contact.phone}` : ''}`
        : null,
      icon: <User className="h-3.5 w-3.5" />,
    },
  ];

  const visibleItems = infoItems.filter((item) => item.value);

  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {visibleItems.map((item) => (
          <div key={item.label} className="min-w-0">
            <span className="text-muted-foreground mb-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider">
              {item.icon}
              {item.label}
            </span>
            <p className="text-foreground truncate text-sm font-medium">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Quick Actions ──────────────────────────────────────────────────────────

interface QuickActionItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    href: '#',
    icon: <ClipboardList className="h-4 w-4" />,
    label: 'New Visit',
    color:
      'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10',
  },
  {
    href: '#',
    icon: <Stethoscope className="h-4 w-4" />,
    label: 'New SOAP',
    color:
      'border-purple-500/20 bg-purple-500/5 text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/10',
  },
  {
    href: '#',
    icon: <Calendar className="h-4 w-4" />,
    label: 'Schedule',
    color:
      'border-blue-500/20 bg-blue-500/5 text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10',
  },
  {
    href: '#',
    icon: <MessageSquare className="h-4 w-4" />,
    label: 'Message',
    color:
      'border-rose-500/20 bg-rose-500/5 text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10',
  },
  {
    href: '#',
    icon: <Edit className="h-4 w-4" />,
    label: 'Edit',
    color:
      'border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/10',
  },
];

function QuickActions({ id }: { id: string }) {
  const actions: QuickActionItem[] = QUICK_ACTIONS.map((action) => {
    if (action.label === 'New Visit') {
      return { ...action, href: `/patients/${id}/visits/new` };
    }
    return action;
  });

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors',
            action.color,
          )}
        >
          {action.icon}
          {action.label}
        </Link>
      ))}
    </div>
  );
}

// ── Tabs ────────────────────────────────────────────────────────────────────

function PatientTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <div className="border-border flex gap-0.5 rounded-xl border bg-card p-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all sm:text-sm',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
            )}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── AI Insights Panel ───────────────────────────────────────────────────────

function AiInsightsPanel({
  open,
  onToggle,
  patient: _patient,
}: {
  open: boolean;
  onToggle: () => void;
  patient: Patient;
}) {
  return (
    <div
      className={cn(
        'border-border bg-card rounded-xl border transition-all',
        open ? 'sticky top-6' : '',
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-t-xl px-4 py-3 text-left transition-colors hover:bg-accent/50"
      >
        <div className="flex items-center gap-2">
          <Brain className="text-primary h-4 w-4" />
          <span className="text-foreground text-sm font-semibold">
            AI Insights
          </span>
        </div>
        {open ? (
          <ChevronDown className="text-muted-foreground h-4 w-4" />
        ) : (
          <ChevronRight className="text-muted-foreground h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="space-y-4 px-4 pb-4">
          <div className="bg-border/30 h-px" />

          {/* Risk Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
                <AlertTriangle className="h-3.5 w-3.5" />
                Risk Score
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                Low
              </span>
            </div>
            {/* Progress bar */}
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: '18%' }}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Low readmission risk based on current metrics and adherence.
            </p>
          </div>

          {/* Adherence Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Adherence
              </span>
              <span className="text-foreground text-xs font-semibold">82%</span>
            </div>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: '82%' }}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Good adherence to prescribed exercise program.
            </p>
          </div>

          {/* Suggested Next Action */}
          <div className="border-border/50 bg-accent/30 rounded-lg border p-3">
            <span className="text-muted-foreground mb-1.5 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider">
              <Lightbulb className="h-3 w-3" />
              Suggested Action
            </span>
            <p className="text-foreground text-sm font-medium leading-relaxed">
              Schedule a 2-week follow-up assessment to evaluate progress on the
              current treatment plan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Empty Tab State ─────────────────────────────────────────────────────────

function EmptyTabState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-muted-foreground mb-3">{icon}</div>
      <p className="text-muted-foreground text-sm font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 max-w-xs text-xs">{description}</p>
    </div>
  );
}
