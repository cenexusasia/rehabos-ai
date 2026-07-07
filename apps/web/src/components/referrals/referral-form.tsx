'use client';

import { useState, useCallback } from 'react';
import {
  Search,
  X,
  User,
  AlertCircle,
  Loader2,
  Send,
  Paperclip,
  ChevronDown,
  FileText,
  CheckCircle2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type {
  ReferralPriority,
  ReferralDirection,
  SendReferralFormData,
  ClinicianSearchResult,
} from '@/types/referral';
import {
  REFERRAL_PRIORITY_COLORS,
  REFERRAL_PRIORITY_LABELS,
} from '@/types/referral';
import type { PatientListItem } from '@/types/patient';

// ── Types ───────────────────────────────────────────────────────────────────

interface ReferralFormProps {
  patients?: PatientListItem[];
  onSearchClinician?: (query: string) => Promise<ClinicianSearchResult[]>;
  onSearchPatient?: (query: string) => Promise<PatientListItem[]>;
  defaultDirection?: ReferralDirection;
  onSubmit?: (data: SendReferralFormData) => Promise<void>;
  className?: string;
}

type ReferralStep = 'type' | 'providers' | 'details' | 'review';

// ── Provider Search ─────────────────────────────────────────────────────────

function ProviderSearchSelect({
  label,
  value,
  onChange,
  onSearch,
  placeholder,
}: {
  label: string;
  value: ClinicianSearchResult | null;
  onChange: (provider: ClinicianSearchResult | null) => void;
  onSearch: (query: string) => Promise<ClinicianSearchResult[]>;
  placeholder: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ClinicianSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    async (q: string) => {
      setQuery(q);
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await onSearch(q);
        setResults(res);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [onSearch],
  );

  return (
    <div className="relative">
      <label className="text-foreground mb-1.5 block text-sm font-medium">{label}</label>
      {value ? (
        <div className="border-input bg-background flex items-center gap-3 rounded-lg border p-3">
          <div className="bg-accent text-accent-foreground flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold">
            {value.first_name.charAt(0)}{value.last_name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">
              Dr. {value.first_name} {value.last_name}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {value.specialty} · {value.clinic_name ?? value.city}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery('');
              setResults([]);
            }}
            className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className={cn(
              'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
              'placeholder:text-muted-foreground/60',
              'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
              'transition-colors',
            )}
          />
          {isSearching && (
            <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
          )}

          {/* Dropdown */}
          {isOpen && results.length > 0 && (
            <div className="border-border bg-popover text-popover-foreground absolute z-20 mt-1 w-full rounded-lg border shadow-lg">
              {results.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => {
                    onChange(provider);
                    setQuery('');
                    setResults([]);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  <div className="bg-accent text-accent-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                    {provider.first_name.charAt(0)}{provider.last_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate font-medium">
                      Dr. {provider.first_name} {provider.last_name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {provider.specialty}
                      {provider.clinic_name && ` · ${provider.clinic_name}`}
                      {(provider.city || provider.state) && ` · ${provider.city ?? ''} ${provider.state ?? ''}`}
                    </p>
                  </div>
                  {provider.accepting_patients && (
                    <span className="border-green-500/20 bg-green-500/10 text-green-400 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                      Accepting
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Patient Select ──────────────────────────────────────────────────────────

function PatientSelect({
  value,
  onChange,
  patients,
}: {
  value: PatientListItem | null;
  onChange: (patient: PatientListItem | null) => void;
  patients?: PatientListItem[];
  onSearch?: (query: string) => Promise<PatientListItem[]>;
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = (patients ?? []).filter((p) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative">
      <label className="text-foreground mb-1.5 block text-sm font-medium">Patient</label>
      {value ? (
        <div className="border-input bg-background flex items-center gap-3 rounded-lg border p-3">
          <div className="bg-accent text-accent-foreground flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold">
            {value.first_name.charAt(0)}{value.last_name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground text-sm font-medium">
              {value.first_name} {value.last_name}
            </p>
            {value.date_of_birth && (
              <p className="text-muted-foreground text-xs">
                DOB: {new Date(value.date_of_birth).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search patients..."
            className={cn(
              'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
              'placeholder:text-muted-foreground/60',
              'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
              'transition-colors',
            )}
          />
          {isOpen && filtered.length > 0 && (
            <div className="border-border bg-popover text-popover-foreground absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border shadow-lg">
              {filtered.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => {
                    onChange(patient);
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  <div className="bg-accent text-accent-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                    {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground font-medium">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <p className="text-muted-foreground text-xs capitalize">{patient.status}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {isOpen && query && filtered.length === 0 && (
            <div className="border-border bg-popover text-popover-foreground absolute z-20 mt-1 w-full rounded-lg border p-3 text-center shadow-lg">
              <p className="text-muted-foreground text-xs">No patients found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Urgency Selector ────────────────────────────────────────────────────────

function UrgencySelector({
  value,
  onChange,
}: {
  value: ReferralPriority;
  onChange: (v: ReferralPriority) => void;
}) {
  const options: { value: ReferralPriority; label: string; description: string }[] = [
    { value: 'routine', label: 'Routine', description: 'Standard referral, no time pressure' },
    { value: 'urgent', label: 'Urgent', description: 'Needs attention within 24-48 hours' },
    { value: 'emergency', label: 'Emergency', description: 'Immediate attention required' },
  ];

  return (
    <div>
      <label className="text-foreground mb-1.5 block text-sm font-medium">Urgency Level</label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg border p-3 text-center text-xs transition-all',
              value === opt.value
                ? cn('border-2', REFERRAL_PRIORITY_COLORS[opt.value], 'bg-accent')
                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            <span className="text-sm font-semibold">{opt.label}</span>
            <span className="text-muted-foreground text-[10px] leading-tight">{opt.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current, steps }: { current: ReferralStep; steps: { key: ReferralStep; label: string }[] }) {
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
              i < idx ? 'bg-primary text-primary-foreground' : i === idx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {i < idx ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span className={cn(
            'text-xs font-medium',
            i <= idx ? 'text-foreground' : 'text-muted-foreground',
          )}>
            {step.label}
          </span>
          {i < steps.length - 1 && <div className="bg-border h-px w-6" />}
        </div>
      ))}
    </div>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────

export function ReferralForm({
  patients = [],
  onSearchClinician,
  onSearchPatient,
  defaultDirection = 'outgoing',
  onSubmit,
  className,
}: ReferralFormProps) {
  const [step, setStep] = useState<ReferralStep>('type');
  const [direction, setDirection] = useState<ReferralDirection>(defaultDirection);
  const [referringProvider, setReferringProvider] = useState<ClinicianSearchResult | null>(null);
  const [receivingProvider, setReceivingProvider] = useState<ClinicianSearchResult | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientListItem | null>(null);
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState<ReferralPriority>('routine');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const steps = [
    { key: 'type' as const, label: 'Type' },
    { key: 'providers' as const, label: 'Providers' },
    { key: 'details' as const, label: 'Details' },
    { key: 'review' as const, label: 'Review' },
  ];

  // Default search handler that returns empty
  const searchClinician = onSearchClinician ?? (async () => []);
  const searchPatient = onSearchPatient ?? (async () => []);
  const canProceedFromProviders = direction === 'outgoing'
    ? receivingProvider !== null && selectedPatient !== null
    : referringProvider !== null && selectedPatient !== null;
  const canProceedFromDetails = reason.trim().length > 0;

  const handleSubmit = async () => {
    if (!selectedPatient) return;
    const toClinicianId = direction === 'outgoing' ? receivingProvider?.id : referringProvider?.id;
    if (!toClinicianId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit?.({
        to_clinician_id: toClinicianId,
        patient_id: selectedPatient.id,
        priority: urgency,
        reason,
        clinical_notes: notes || undefined,
        diagnosis_codes: diagnosis ? diagnosis.split(',').map((d) => d.trim()) : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send referral. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="border-border bg-card mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border">
          <Send className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-foreground mb-1 text-xl font-bold">Referral Sent!</h2>
        <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
          Your referral has been sent successfully. The receiving provider will be notified.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setStep('type');
            setDirection(defaultDirection);
            setReferringProvider(null);
            setReceivingProvider(null);
            setSelectedPatient(null);
            setReason('');
            setUrgency('routine');
            setDiagnosis('');
            setNotes('');
            setAttachments([]);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Send className="h-4 w-4" />
          Create Another Referral
        </button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h1 className="text-foreground text-2xl font-bold">New Referral</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Refer a patient to another provider or manage an incoming referral.
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} steps={steps} />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* ── Step 1: Type ───────────────────────────────────────────── */}
      {step === 'type' && (
        <div className="space-y-6">
          <p className="text-foreground text-sm font-medium">What type of referral are you creating?</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => { setDirection('outgoing'); setStep('providers'); }}
              className={cn(
                'border-border bg-card hover:border-primary/40 group flex flex-col items-center gap-3 rounded-xl border p-8 text-center transition-all',
              )}
            >
              <div className="border-border bg-background flex h-14 w-14 items-center justify-center rounded-full border">
                <Send className="text-foreground h-6 w-6" />
              </div>
              <div>
                <h3 className="text-foreground text-base font-semibold">Outgoing Referral</h3>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  Refer a patient to another provider or specialist outside your clinic.
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { setDirection('incoming'); setStep('providers'); }}
              className={cn(
                'border-border bg-card hover:border-primary/40 group flex flex-col items-center gap-3 rounded-xl border p-8 text-center transition-all',
              )}
            >
              <div className="border-border bg-background flex h-14 w-14 items-center justify-center rounded-full border">
                <User className="text-foreground h-6 w-6" />
              </div>
              <div>
                <h3 className="text-foreground text-base font-semibold">Incoming Referral</h3>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  Record a referral that was sent to you from another provider.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Providers ──────────────────────────────────────── */}
      {step === 'providers' && (
        <div className="space-y-5">
          {direction === 'outgoing' ? (
            <>
              <ProviderSearchSelect
                label="Referring Provider (You)"
                value={null}
                onChange={() => {}}
                onSearch={async () => []}
                placeholder="You are the referring provider"
              />
              <div className="border-border bg-card rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <div className="bg-accent text-accent-foreground flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold">
                    Y
                  </div>
                  <p className="text-foreground text-sm font-medium">You (Current Provider)</p>
                </div>
              </div>
              <ProviderSearchSelect
                label="Receiving Provider"
                value={receivingProvider}
                onChange={setReceivingProvider}
                onSearch={searchClinician}
                placeholder="Search for a provider or specialist..."
              />
            </>
          ) : (
            <>
              <ProviderSearchSelect
                label="Referring Provider"
                value={referringProvider}
                onChange={setReferringProvider}
                onSearch={searchClinician}
                placeholder="Search for the referring provider..."
              />
              <p className="text-muted-foreground text-xs">
                You will receive this referral as the receiving provider.
              </p>
            </>
          )}

          <PatientSelect
            value={selectedPatient}
            onChange={setSelectedPatient}
            patients={patients}
            onSearch={searchPatient}
          />
        </div>
      )}

      {/* ── Step 3: Details ────────────────────────────────────────── */}
      {step === 'details' && (
        <div className="space-y-5">
          <UrgencySelector value={urgency} onChange={setUrgency} />

          {/* Reason */}
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Reason for Referral <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Describe why this referral is needed..."
              className={cn(
                'border-input bg-background text-foreground w-full resize-y rounded-lg border px-4 py-2.5 text-sm',
                'placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'transition-colors',
              )}
            />
          </div>

          {/* Diagnosis */}
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Diagnosis / Specialty
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g., M17.0, S83.5 (comma-separated ICD codes)"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-4 py-2.5 text-sm',
                'placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'transition-colors',
              )}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Clinical Notes / Message
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Additional clinical context, instructions, or questions for the receiving provider..."
              className={cn(
                'border-input bg-background text-foreground w-full resize-y rounded-lg border px-4 py-2.5 text-sm',
                'placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'transition-colors',
              )}
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="text-foreground mb-1.5 flex items-center gap-2 text-sm font-medium">
              <Paperclip className="h-4 w-4" />
              Attachments
            </label>
            <div className="border-border bg-card flex min-h-[80px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-4 transition-colors hover:border-primary/40">
              <Paperclip className="text-muted-foreground h-5 w-5" />
              <p className="text-muted-foreground text-xs">Click to upload reports, imaging, or documents</p>
              <p className="text-muted-foreground/60 text-[10px]">PDF, JPEG, PNG · Max 10MB each</p>
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((att, idx) => (
                  <div key={idx} className="border-border bg-card flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
                    <FileText className="text-muted-foreground h-3.5 w-3.5" />
                    <span className="text-foreground flex-1 truncate">{att}</span>
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 4: Review ─────────────────────────────────────────── */}
      {step === 'review' && (
        <div className="space-y-5">
          <h3 className="text-foreground text-base font-semibold">Review Referral</h3>
          <div className="border-border bg-card rounded-xl border divide-border divide-y text-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-muted-foreground">Direction</span>
              <span className="text-foreground font-medium capitalize">{direction}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-muted-foreground">Urgency</span>
              <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', REFERRAL_PRIORITY_COLORS[urgency])}>
                {REFERRAL_PRIORITY_LABELS[urgency]}
              </span>
            </div>
            {receivingProvider && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">To</span>
                <span className="text-foreground font-medium">
                  Dr. {receivingProvider.first_name} {receivingProvider.last_name}
                </span>
              </div>
            )}
            {selectedPatient && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Patient</span>
                <span className="text-foreground font-medium">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </span>
              </div>
            )}
            <div className="flex items-start justify-between px-4 py-3">
              <span className="text-muted-foreground">Reason</span>
              <span className="text-foreground max-w-[60%] text-right">{reason}</span>
            </div>
            {notes && (
              <div className="flex items-start justify-between px-4 py-3">
                <span className="text-muted-foreground">Notes</span>
                <span className="text-muted-foreground max-w-[60%] text-right text-xs">{notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <button
          type="button"
          onClick={() => {
            const idx = steps.findIndex((s) => s.key === step);
            if (idx > 0) setStep(steps[idx - 1]!.key);
          }}
          className={cn(
            'border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
            step === 'type' && 'invisible',
          )}
        >
          <ChevronDown className="h-4 w-4 rotate-90" />
          Back
        </button>

        {step === 'review' ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Referral
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              const idx = steps.findIndex((s) => s.key === step);
              setStep(steps[idx + 1]!.key);
            }}
            disabled={
              (step === 'providers' && !canProceedFromProviders) ||
              (step === 'details' && !canProceedFromDetails)
            }
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors',
              (step === 'providers' && canProceedFromProviders) || (step === 'details' && canProceedFromDetails) || step === 'type'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
          >
            Continue
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </button>
        )}
      </div>
    </div>
  );
}
