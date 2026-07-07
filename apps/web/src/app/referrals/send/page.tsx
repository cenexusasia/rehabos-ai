'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Search,
  MapPin,
  Stethoscope,
  Building2,
  Loader2,
  Send,
  AlertCircle,
  Check,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useClinicianSearch, useSendReferral } from '@/hooks/use-referrals';
import { usePatients } from '@/hooks/use-patients';
import type { ClinicianSearchResult } from '@/types/referral';
import type { ReferralPriority } from '@/types/referral';

const PRIORITY_OPTIONS: { value: ReferralPriority; label: string; description: string }[] = [
  { value: 'routine', label: 'Routine', description: 'Standard referral, respond within 7 days' },
  { value: 'urgent', label: 'Urgent', description: 'Needs attention within 48 hours' },
  { value: 'emergency', label: 'Emergency', description: 'Immediate attention required' },
];

export default function SendReferralPage() {
  const router = useRouter();
  

  const [step, setStep] = useState(1);
  const [clinicianSearch, setClinicianSearch] = useState('');
  const [selectedClinician, setSelectedClinician] = useState<ClinicianSearchResult | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [priority, setPriority] = useState<ReferralPriority>('routine');
  const [reason, setReason] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: clinicians, isLoading: cliniciansLoading } = useClinicianSearch(clinicianSearch);
  const { data: patients, isLoading: patientsLoading } = usePatients();
  const sendReferral = useSendReferral();

  // Filter patients by search
  const filteredPatients = (patients ?? []).filter((p) => {
    if (!patientSearch) return true;
    const q = patientSearch.toLowerCase();
    return (
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
      (p.diagnosis_codes ?? []).some((code: string) => code.toLowerCase().includes(q))
    );
  });

  const handleSend = async () => {
    if (!selectedClinician || !selectedPatientId || !reason.trim()) return;

    try {
      await sendReferral.mutateAsync({
        to_clinician_id: selectedClinician.id,
        patient_id: selectedPatientId,
        priority,
        reason: reason.trim(),
        clinical_notes: clinicalNotes.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push('/referrals'), 2000);
    } catch {
      // Error handled by mutation
    }
  };

  const canProceedStep2 = !!selectedClinician;
  const canProceedStep3 = canProceedStep2 && !!selectedPatientId;
  const canSend = canProceedStep3 && reason.trim().length > 0 && !sendReferral.isPending;

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <div className="bg-green-500/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-foreground text-xl font-bold">Referral Sent!</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Your referral has been sent successfully. The clinician will be notified.
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Redirecting to referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/referrals"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Referrals
        </Link>
        <h1 className="text-foreground text-2xl font-bold">Send Referral</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Refer a patient to another clinician
        </p>
      </div>

      {/* Steps indicator */}
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
                step >= s
                  ? 'bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground border',
              )}
            >
              {s}
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                step >= s ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {s === 1 ? 'Clinician' : s === 2 ? 'Patient' : 'Details'}
            </span>
            {s < 3 && <div className="border-border h-px w-8 border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Clinician */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="border-border bg-card rounded-xl border p-5">
            <h2 className="text-foreground mb-1 text-sm font-medium">Select Clinician</h2>
            <p className="text-muted-foreground text-xs">
              Search for a clinician by name, specialty, or location
            </p>
          </div>

          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={clinicianSearch}
              onChange={(e) => setClinicianSearch(e.target.value)}
              placeholder="Search by name, specialty, clinic, or city..."
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
                'placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'transition-colors',
              )}
            />
          </div>

          {selectedClinician && (
            <div className="border-primary/30 bg-primary/5 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium">
                    {selectedClinician.first_name?.[0]}{selectedClinician.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      Dr. {selectedClinician.first_name} {selectedClinician.last_name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {selectedClinician.specialty}
                      {selectedClinician.clinic_name ? ` · ${selectedClinician.clinic_name}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClinician(null)}
                  className="text-muted-foreground hover:text-foreground text-xs underline transition-colors"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {!selectedClinician && (
            <>
              {cliniciansLoading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="text-primary h-6 w-6 animate-spin" />
                </div>
              )}

              {!cliniciansLoading && clinicianSearch && (!clinicians || clinicians.length === 0) && (
                <div className="border-border bg-card rounded-xl border p-8 text-center">
                  <AlertCircle className="text-muted-foreground mx-auto mb-3 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">No clinicians found matching your search.</p>
                </div>
              )}

              {!cliniciansLoading && clinicians && clinicians.length > 0 && (
                <div className="space-y-2">
                  {clinicians.map((clinician) => (
                    <button
                      key={clinician.id}
                      onClick={() => setSelectedClinician(clinician)}
                      className="border-border bg-card hover:border-primary/30 w-full rounded-xl border p-4 text-left transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-accent text-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium">
                          {clinician.first_name?.[0]}{clinician.last_name?.[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground text-sm font-medium">
                            Dr. {clinician.first_name} {clinician.last_name}
                          </p>
                          <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                            <span className="inline-flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              {clinician.specialty}
                            </span>
                            {clinician.clinic_name && (
                              <span className="inline-flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {clinician.clinic_name}
                              </span>
                            )}
                            {clinician.city && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {clinician.city}, {clinician.state}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {clinician.telehealth_available && (
                            <span className="border-green-500/20 bg-green-500/10 text-green-400 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                              Telehealth
                            </span>
                          )}
                          {clinician.accepting_patients !== undefined && (
                            <span
                              className={cn(
                                'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                                clinician.accepting_patients
                                  ? 'border-green-500/20 bg-green-500/10 text-green-400'
                                  : 'border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground',
                              )}
                            >
                              {clinician.accepting_patients ? 'Accepting' : 'Full'}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep2}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                canProceedStep2
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Patient */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="border-border bg-card rounded-xl border p-5">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-foreground text-sm font-medium">Select Patient</h2>
                <p className="text-muted-foreground text-xs">
                  Referral to: Dr. {selectedClinician?.first_name} {selectedClinician?.last_name}
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search patients by name or diagnosis..."
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm',
                'placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'transition-colors',
              )}
            />
          </div>

          {patientsLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="text-primary h-6 w-6 animate-spin" />
            </div>
          )}

          {!patientsLoading && filteredPatients.length === 0 && (
            <div className="border-border bg-card rounded-xl border p-8 text-center">
              <AlertCircle className="text-muted-foreground mx-auto mb-3 h-8 w-8" />
              <p className="text-muted-foreground text-sm">No patients found.</p>
            </div>
          )}

          {!patientsLoading && filteredPatients.length > 0 && (
            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={cn(
                    'border-border bg-card hover:border-primary/30 w-full rounded-xl border p-4 text-left transition-all',
                    selectedPatientId === patient.id && 'border-primary/30 bg-primary/5',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium',
                        selectedPatientId === patient.id
                          ? 'bg-primary/10 text-primary'
                          : 'bg-accent text-foreground',
                      )}
                    >
                      {patient.first_name?.[0]}{patient.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {patient.date_of_birth
                          ? new Date(patient.date_of_birth).toLocaleDateString()
                          : ''}
                        {patient.diagnosis_codes?.length
                          ? ` · ${patient.diagnosis_codes.slice(0, 2).join(', ')}`
                          : ''}
                      </p>
                    </div>
                    {selectedPatientId === patient.id && (
                      <Check className="text-primary ml-auto h-5 w-5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="border-border text-muted-foreground hover:text-foreground rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceedStep3}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                canProceedStep3
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Referral Details */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="border-border bg-card rounded-xl border p-5">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-foreground text-sm font-medium">Referral Details</h2>
                <p className="text-muted-foreground text-xs">
                  Complete the referral information
                </p>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="border-border bg-card rounded-xl border p-5">
            <label className="text-foreground mb-3 block text-sm font-medium">Priority</label>
            <div className="grid gap-3 sm:grid-cols-3">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-all',
                    priority === opt.value
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full border transition-colors',
                        priority === opt.value
                          ? 'border-primary bg-primary'
                          : 'border-border',
                      )}
                    >
                      {priority === opt.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        priority === opt.value ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1.5 text-xs">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div className="border-border bg-card rounded-xl border p-5">
            <label htmlFor="reason" className="text-foreground mb-1 block text-sm font-medium">
              Reason for Referral <span className="text-red-400">*</span>
            </label>
            <p className="text-muted-foreground mb-3 text-xs">
              Describe why you are referring this patient
            </p>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="e.g., Patient presents with chronic low back pain requiring specialized orthopedic evaluation..."
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border p-3 text-sm',
                'placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'transition-colors resize-none',
              )}
            />
          </div>

          {/* Clinical Notes */}
          <div className="border-border bg-card rounded-xl border p-5">
            <label htmlFor="clinicalNotes" className="text-foreground mb-1 block text-sm font-medium">
              Clinical Notes <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <p className="text-muted-foreground mb-3 text-xs">
              Additional clinical information, test results, or instructions
            </p>
            <textarea
              id="clinicalNotes"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={4}
              placeholder="Any additional notes or instructions for the receiving clinician..."
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border p-3 text-sm',
                'placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                'transition-colors resize-none',
              )}
            />
          </div>

          {/* Summary */}
          <div className="border-border/50 bg-card/50 rounded-xl border p-5">
            <h3 className="text-foreground mb-3 text-sm font-medium">Referral Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="text-foreground">
                  Dr. {selectedClinician?.first_name} {selectedClinician?.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialty:</span>
                <span className="text-foreground">{selectedClinician?.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient:</span>
                <span className="text-foreground">
                  {patients?.find((p) => p.id === selectedPatientId)?.first_name}{' '}
                  {patients?.find((p) => p.id === selectedPatientId)?.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority:</span>
                <span className="text-foreground font-medium capitalize">{priority}</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {sendReferral.isError && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
              Failed to send referral. Please try again.
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setStep(2)}
              className="border-border text-muted-foreground hover:text-foreground rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                canSend
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              {sendReferral.isPending ? (
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
          </div>
        </div>
      )}
    </div>
  );
}
