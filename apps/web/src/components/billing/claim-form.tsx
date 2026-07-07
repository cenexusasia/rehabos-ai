'use client';

import { useState } from 'react';
import {
  Plus,
  X,
  Search,
  AlertCircle,
  Upload,
  File,
  Trash2,
  Building2,
  Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

// ── Zod Schemas ─────────────────────────────────────────────────────────────

export const diagnosisPointerSchema = z.object({
  code: z.string().min(1, 'ICD-10 code is required'),
  description: z.string().optional(),
  pointer: z.string().optional(), // e.g., "1" for primary
});

export const cptProcedureSchema = z.object({
  code: z.string().min(1, 'CPT code is required'),
  description: z.string().optional(),
  modifiers: z.array(z.string()).optional(),
  units: z.number().min(1).default(1),
  charge: z.number().min(0).default(0),
  diagnosisPointers: z.array(z.string()).optional(), // references to diagnosis codes
});

export const claimAttachmentSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  type: z.enum(['eob', 'referral', 'authorization', 'other']),
  file: z.any().optional(),
});

export const claimFormSchema = z.object({
  // Patient insurance info
  patientId: z.string().min(1, 'Patient is required'),
  carrier: z.string().min(1, 'Insurance carrier is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  groupNumber: z.string().optional(),
  patientRelationToInsured: z.enum(['self', 'spouse', 'child', 'other']).default('self'),

  // Service info
  serviceStartDate: z.string().min(1, 'Service start date is required'),
  serviceEndDate: z.string().optional(),
  placeOfService: z.string().min(1, 'Place of service is required'),
  isEmergency: z.boolean().default(false),

  // Diagnosis codes (ICD-10) with pointers
  diagnosisCodes: z.array(diagnosisPointerSchema).min(1, 'At least one diagnosis code is required'),

  // CPT procedure codes with modifiers
  procedures: z.array(cptProcedureSchema).min(1, 'At least one procedure is required'),

  // Provider info
  referringProviderNpi: z.string().optional(),
  referringProviderName: z.string().optional(),
  renderingProviderNpi: z.string().min(1, 'Rendering provider NPI is required'),
  renderingProviderName: z.string().min(1, 'Rendering provider name is required'),
  providerTaxonomy: z.string().optional(),

  // Facility info
  facilityName: z.string().optional(),
  facilityNpi: z.string().optional(),
  facilityAddress: z.string().optional(),

  // Attachments
  attachments: z.array(claimAttachmentSchema).optional(),

  // Notes
  notes: z.string().max(2000).optional(),
});

export type ClaimFormValues = z.infer<typeof claimFormSchema>;

// ── Constants ───────────────────────────────────────────────────────────────

export const ICD10_EXAMPLES = [
  { code: 'M54.5', description: 'Low back pain' },
  { code: 'M25.561', description: 'Pain in right knee' },
  { code: 'M25.562', description: 'Pain in left knee' },
  { code: 'M79.1', description: 'Myalgia' },
  { code: 'S93.4', description: 'Sprain of ankle' },
  { code: 'M75.1', description: 'Rotator cuff tear' },
  { code: 'M54.2', description: 'Cervicalgia' },
  { code: 'M17.9', description: 'Osteoarthritis of knee' },
  { code: 'G89.29', description: 'Chronic pain' },
  { code: 'Z96.641', description: 'Presence of artificial knee joint' },
];

export const CPT_EXAMPLES = [
  { code: '97110', description: 'Therapeutic Exercise', defaultRate: 75 },
  { code: '97112', description: 'Neuromuscular Reeducation', defaultRate: 80 },
  { code: '97140', description: 'Manual Therapy', defaultRate: 85 },
  { code: '97530', description: 'Therapeutic Activities', defaultRate: 78 },
  { code: '99213', description: 'Office Visit Est. Low', defaultRate: 95 },
  { code: '99214', description: 'Office Visit Est. Mod', defaultRate: 140 },
  { code: '97035', description: 'Ultrasound', defaultRate: 35 },
  { code: '97014', description: 'Electrical Stimulation', defaultRate: 40 },
];

export const PLACE_OF_SERVICE_OPTIONS = [
  { value: '11', label: 'Office' },
  { value: '12', label: 'Home' },
  { value: '21', label: 'Inpatient Hospital' },
  { value: '22', label: 'Outpatient Hospital' },
  { value: '23', label: 'Emergency Room' },
  { value: '24', label: 'Ambulatory Surgical Center' },
  { value: '31', label: 'Skilled Nursing Facility' },
  { value: '32', label: 'Nursing Facility' },
  { value: '34', label: 'Hospice' },
  { value: '50', label: 'Federally Qualified Health Center' },
  { value: '71', label: 'Public Health Clinic' },
  { value: '99', label: 'Other' },
] as const;

export const ATTACHMENT_TYPES = [
  { value: 'eob', label: 'EOB (Explanation of Benefits)' },
  { value: 'referral', label: 'Referral' },
  { value: 'authorization', label: 'Prior Authorization' },
  { value: 'other', label: 'Other Document' },
] as const;

interface ClaimFormProps {
  onSubmit?: (data: ClaimFormValues) => Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
  initialValues?: Partial<ClaimFormValues>;
}

// ── Component ───────────────────────────────────────────────────────────────

export function ClaimForm({
  onSubmit,
  onCancel,
  isSaving = false,
  initialValues,
}: ClaimFormProps) {
  // ── State ─────────────────────────────────────────────────────────────
  const [patientId, setPatientId] = useState(initialValues?.patientId ?? '');
  const [carrier, setCarrier] = useState(initialValues?.carrier ?? '');
  const [policyNumber, setPolicyNumber] = useState(initialValues?.policyNumber ?? '');
  const [groupNumber, setGroupNumber] = useState(initialValues?.groupNumber ?? '');
  const [relationToInsured, setRelationToInsured] = useState<string>(
    initialValues?.patientRelationToInsured ?? 'self',
  );

  const [serviceStartDate, setServiceStartDate] = useState(
    initialValues?.serviceStartDate ?? '',
  );
  const [serviceEndDate, setServiceEndDate] = useState(
    initialValues?.serviceEndDate ?? '',
  );
  const [placeOfService, setPlaceOfService] = useState(
    initialValues?.placeOfService ?? '11',
  );
  const [isEmergency, setIsEmergency] = useState(initialValues?.isEmergency ?? false);

  // Diagnosis codes
  const [diagnosisCodes, setDiagnosisCodes] = useState<
    { code: string; description: string; pointer: string }[]
  >(initialValues?.diagnosisCodes?.map(d => ({
    code: d.code,
    description: d.description ?? '',
    pointer: d.pointer ?? '',
  })) ?? []);
  const [showIcdSearch, setShowIcdSearch] = useState(false);
  const [icdSearch, setIcdSearch] = useState('');

  // Procedures
  const [procedures, setProcedures] = useState<
    { code: string; description: string; modifiers: string[]; units: number; charge: number; diagnosisPointers: string[] }[]
  >(
    initialValues?.procedures?.map(p => ({
      code: p.code,
      description: p.description ?? '',
      modifiers: p.modifiers ?? [],
      units: p.units ?? 1,
      charge: p.charge ?? 0,
      diagnosisPointers: p.diagnosisPointers ?? [],
    })) ?? [],
  );
  const [showCptSearch, setShowCptSearch] = useState(false);
  const [cptSearch, setCptSearch] = useState('');

  // Provider info
  const [referringNpi, setReferringNpi] = useState(
    initialValues?.referringProviderNpi ?? '',
  );
  const [referringName, setReferringName] = useState(
    initialValues?.referringProviderName ?? '',
  );
  const [renderingNpi, setRenderingNpi] = useState(
    initialValues?.renderingProviderNpi ?? '',
  );
  const [renderingName, setRenderingName] = useState(
    initialValues?.renderingProviderName ?? '',
  );
  const [providerTaxonomy, setProviderTaxonomy] = useState(
    initialValues?.providerTaxonomy ?? '',
  );

  // Facility info
  const [facilityName, setFacilityName] = useState(initialValues?.facilityName ?? '');
  const [facilityNpi, setFacilityNpi] = useState(initialValues?.facilityNpi ?? '');
  const [facilityAddress, setFacilityAddress] = useState(
    initialValues?.facilityAddress ?? '',
  );

  // Attachments
  const [attachments, setAttachments] = useState<
    { name: string; type: string; file: File | null }[]
  >(initialValues?.attachments?.map((a) => ({ ...a, file: null })) ?? []);

  // Notes
  const [notes, setNotes] = useState(initialValues?.notes ?? '');

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Computed ──────────────────────────────────────────────────────────

  const filteredIcdCodes = ICD10_EXAMPLES.filter(
    (d) =>
      d.code.includes(icdSearch) ||
      d.description.toLowerCase().includes(icdSearch.toLowerCase()),
  );

  const filteredCptCodes = CPT_EXAMPLES.filter(
    (c) =>
      c.code.includes(cptSearch) ||
      c.description.toLowerCase().includes(cptSearch.toLowerCase()),
  );

  // ── Handlers ──────────────────────────────────────────────────────────

  const addDiagnosisCode = (code: string, description: string) => {
    const pointer = String(diagnosisCodes.length + 1);
    setDiagnosisCodes([...diagnosisCodes, { code, description, pointer }]);
    setShowIcdSearch(false);
    setIcdSearch('');
  };

  const removeDiagnosisCode = (index: number) => {
    const updated = diagnosisCodes.filter((_, i) => i !== index);
    // Re-number pointers
    setDiagnosisCodes(updated.map((d, i) => ({ ...d, pointer: String(i + 1) })));
  };

  const addProcedure = (code: string, description: string, defaultRate: number) => {
    setProcedures([
      ...procedures,
      {
        code,
        description,
        modifiers: [],
        units: 1,
        charge: defaultRate,
        diagnosisPointers: diagnosisCodes.map((d) => d.pointer),
      },
    ]);
    setShowCptSearch(false);
    setCptSearch('');
  };

  const removeProcedure = (index: number) => {
    setProcedures(procedures.filter((_, i) => i !== index));
  };

  const updateProcedure = (
    index: number,
    updates: Partial<(typeof procedures)[0]>,
  ) => {
    setProcedures(
      procedures.map((p, i) => (i === index ? { ...p, ...updates } : p)),
    );
  };

  const addAttachment = () => {
    setAttachments([...attachments, { name: '', type: 'other', file: null }]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const updateAttachment = (
    index: number,
    updates: Partial<(typeof attachments)[0]>,
  ) => {
    setAttachments(
      attachments.map((a, i) => (i === index ? { ...a, ...updates } : a)),
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!patientId) newErrors.patientId = 'Patient is required';
    if (!carrier.trim()) newErrors.carrier = 'Insurance carrier is required';
    if (!policyNumber.trim()) newErrors.policyNumber = 'Policy number is required';
    if (!serviceStartDate) newErrors.serviceStartDate = 'Service start date is required';
    if (!renderingNpi.trim()) newErrors.renderingNpi = 'Rendering provider NPI is required';
    if (!renderingName.trim()) newErrors.renderingName = 'Rendering provider name is required';
    if (diagnosisCodes.length === 0) newErrors.diagnosisCodes = 'At least one diagnosis code is required';
    if (procedures.length === 0) newErrors.procedures = 'At least one procedure is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const data: ClaimFormValues = {
      patientId,
      carrier,
      policyNumber,
      groupNumber: groupNumber || undefined,
      patientRelationToInsured: relationToInsured as ClaimFormValues['patientRelationToInsured'],
      serviceStartDate,
      serviceEndDate: serviceEndDate || undefined,
      placeOfService,
      isEmergency,
      diagnosisCodes: diagnosisCodes.map((d) => ({
        code: d.code,
        description: d.description,
        pointer: d.pointer,
      })),
      procedures: procedures.map((p) => ({
        code: p.code,
        description: p.description,
        modifiers: p.modifiers.length > 0 ? p.modifiers : undefined,
        units: p.units,
        charge: p.charge,
        diagnosisPointers: p.diagnosisPointers.length > 0 ? p.diagnosisPointers : undefined,
      })),
      referringProviderNpi: referringNpi || undefined,
      referringProviderName: referringName || undefined,
      renderingProviderNpi: renderingNpi,
      renderingProviderName: renderingName,
      providerTaxonomy: providerTaxonomy || undefined,
      facilityName: facilityName || undefined,
      facilityNpi: facilityNpi || undefined,
      facilityAddress: facilityAddress || undefined,
      attachments:
        attachments.length > 0
          ? attachments.map((a) => ({
              name: a.name,
              type: a.type as 'eob' | 'referral' | 'authorization' | 'other',
            }))
          : undefined,
      notes: notes || undefined,
    };

    await onSubmit?.(data);
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Section: Patient Insurance Info */}
      <div className="border-border bg-card rounded-xl border p-6">
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          Patient &amp; Insurance Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Patient <span className="text-destructive">*</span>
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm appearance-none',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                errors.patientId && 'border-destructive',
              )}
            >
              <option value="">Select patient...</option>
              <option value="p1">John Smith</option>
              <option value="p2">Sarah Johnson</option>
              <option value="p3">Michael Brown</option>
              <option value="p4">Emily Davis</option>
            </select>
            {errors.patientId && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" /> {errors.patientId}
              </p>
            )}
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Insurance Carrier <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="e.g., Blue Cross Blue Shield"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                'placeholder:text-muted-foreground/60',
                errors.carrier && 'border-destructive',
              )}
            />
            {errors.carrier && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" /> {errors.carrier}
              </p>
            )}
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Policy Number <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              placeholder="Policy #"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                'placeholder:text-muted-foreground/60',
                errors.policyNumber && 'border-destructive',
              )}
            />
            {errors.policyNumber && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" /> {errors.policyNumber}
              </p>
            )}
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Group Number</label>
            <input
              type="text"
              value={groupNumber}
              onChange={(e) => setGroupNumber(e.target.value)}
              placeholder="Group #"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                'placeholder:text-muted-foreground/60',
              )}
            />
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Patient Relation to Insured
            </label>
            <select
              value={relationToInsured}
              onChange={(e) => setRelationToInsured(e.target.value)}
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm appearance-none',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
              )}
            >
              <option value="self">Self</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section: Service Dates */}
      <div className="border-border bg-card rounded-xl border p-6">
        <h2 className="text-foreground mb-4 text-lg font-semibold">Service Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Service Start Date <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={serviceStartDate}
              onChange={(e) => setServiceStartDate(e.target.value)}
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                errors.serviceStartDate && 'border-destructive',
              )}
            />
            {errors.serviceStartDate && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" /> {errors.serviceStartDate}
              </p>
            )}
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Service End Date
            </label>
            <input
              type="date"
              value={serviceEndDate}
              onChange={(e) => setServiceEndDate(e.target.value)}
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
              )}
            />
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Place of Service <span className="text-destructive">*</span>
            </label>
            <select
              value={placeOfService}
              onChange={(e) => setPlaceOfService(e.target.value)}
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm appearance-none',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
              )}
            >
              {PLACE_OF_SERVICE_OPTIONS.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.value} — {pos.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="border-input bg-background text-primary focus:ring-primary h-4 w-4 rounded border"
              />
              <span className="text-foreground text-sm font-medium">Emergency Service</span>
            </label>
          </div>
        </div>
      </div>

      {/* Section: Diagnosis Codes (ICD-10) with Pointers */}
      <div className="border-border bg-card rounded-xl border p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-lg font-semibold">Diagnosis Codes (ICD-10)</h2>
            <p className="text-muted-foreground text-sm">
              Add diagnosis codes with diagnosis pointers
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIcdSearch('');
              setShowIcdSearch(true);
            }}
            className="text-muted-foreground hover:text-foreground hover:border-primary/40 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            Add Diagnosis
          </button>
        </div>

        {errors.diagnosisCodes && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
            <AlertCircle className="h-3 w-3" />
            {errors.diagnosisCodes}
          </div>
        )}

        {/* ICD-10 Search Modal */}
        {showIcdSearch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="border-border bg-card w-full max-w-lg rounded-xl border shadow-lg">
              <div className="border-b border-border px-5 py-4">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    value={icdSearch}
                    onChange={(e) => setIcdSearch(e.target.value)}
                    placeholder="Search ICD-10 codes..."
                    autoFocus
                    className={cn(
                      'border-input bg-background text-foreground w-full rounded-lg border py-2 pr-3 pl-10 text-sm',
                      'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                      'placeholder:text-muted-foreground/60 transition-colors',
                    )}
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {filteredIcdCodes.length === 0 ? (
                  <p className="text-muted-foreground px-3 py-4 text-center text-sm">No codes found</p>
                ) : (
                  filteredIcdCodes.map((icd) => (
                    <button
                      key={icd.code}
                      type="button"
                      onClick={() => addDiagnosisCode(icd.code, icd.description)}
                      className="hover:bg-accent flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors"
                    >
                      <div>
                        <span className="text-foreground text-sm font-medium">{icd.code}</span>
                        <p className="text-muted-foreground text-xs">{icd.description}</p>
                      </div>
                      <Plus className="text-muted-foreground h-4 w-4" />
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-border px-5 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowIcdSearch(false);
                    setIcdSearch('');
                  }}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Diagnosis code chips */}
        {diagnosisCodes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {diagnosisCodes.map((dx, idx) => (
              <div
                key={idx}
                className="border-border bg-accent/30 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5"
              >
                <span className="bg-primary text-primary-foreground inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
                  {dx.pointer}
                </span>
                <span className="text-foreground text-xs font-medium">{dx.code}</span>
                {dx.description && (
                  <span className="text-muted-foreground text-xs">— {dx.description}</span>
                )}
                <button
                  type="button"
                  onClick={() => removeDiagnosisCode(idx)}
                  className="text-muted-foreground hover:text-destructive ml-1 rounded-sm p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground/60 text-xs italic">
            No diagnosis codes added yet. Search and add ICD-10 codes above.
          </p>
        )}
      </div>

      {/* Section: CPT Procedure Codes with Modifiers */}
      <div className="border-border bg-card rounded-xl border p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-lg font-semibold">Procedure Codes (CPT/HCPCS)</h2>
            <p className="text-muted-foreground text-sm">
              Add CPT codes with modifiers and diagnosis pointers
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCptSearch('');
              setShowCptSearch(true);
            }}
            className="text-muted-foreground hover:text-foreground hover:border-primary/40 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            Add Procedure
          </button>
        </div>

        {errors.procedures && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
            <AlertCircle className="h-3 w-3" />
            {errors.procedures}
          </div>
        )}

        {/* CPT Search Modal */}
        {showCptSearch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="border-border bg-card w-full max-w-lg rounded-xl border shadow-lg">
              <div className="border-b border-border px-5 py-4">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cptSearch}
                    onChange={(e) => setCptSearch(e.target.value)}
                    placeholder="Search CPT codes..."
                    autoFocus
                    className={cn(
                      'border-input bg-background text-foreground w-full rounded-lg border py-2 pr-3 pl-10 text-sm',
                      'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                      'placeholder:text-muted-foreground/60 transition-colors',
                    )}
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {filteredCptCodes.length === 0 ? (
                  <p className="text-muted-foreground px-3 py-4 text-center text-sm">No codes found</p>
                ) : (
                  filteredCptCodes.map((cpt) => (
                    <button
                      key={cpt.code}
                      type="button"
                      onClick={() => addProcedure(cpt.code, cpt.description, cpt.defaultRate)}
                      className="hover:bg-accent flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors"
                    >
                      <div>
                        <span className="text-foreground text-sm font-medium">{cpt.code}</span>
                        <p className="text-muted-foreground text-xs">{cpt.description}</p>
                      </div>
                      <Plus className="text-muted-foreground h-4 w-4" />
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-border px-5 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCptSearch(false);
                    setCptSearch('');
                  }}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Procedure items */}
        {procedures.length > 0 ? (
          <div className="space-y-3">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <div className="col-span-3">CPT Code</div>
              <div className="col-span-1 text-center">Units</div>
              <div className="col-span-2 text-right">Charge</div>
              <div className="col-span-2 text-center">Modifiers</div>
              <div className="col-span-3 text-center">DX Pointers</div>
              <div className="col-span-1" />
            </div>

            {procedures.map((proc, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <span className="text-foreground text-sm font-medium">{proc.code}</span>
                  <p className="text-muted-foreground truncate text-xs">{proc.description}</p>
                </div>
                <div className="col-span-1">
                  <input
                    type="number"
                    value={proc.units}
                    onChange={(e) => updateProcedure(idx, { units: Math.max(1, Number(e.target.value)) })}
                    min={1}
                    className={cn(
                      'border-input bg-background text-foreground w-full rounded-lg border px-1 py-1.5 text-xs text-center',
                      'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={proc.charge}
                    onChange={(e) => updateProcedure(idx, { charge: Math.max(0, Number(e.target.value)) })}
                    min={0}
                    step={0.01}
                    className={cn(
                      'border-input bg-background text-foreground w-full rounded-lg border px-2 py-1.5 text-xs text-right',
                      'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={proc.modifiers.join(', ')}
                    onChange={(e) =>
                      updateProcedure(idx, {
                        modifiers: e.target.value
                          ? e.target.value.split(',').map((m) => m.trim())
                          : [],
                      })
                    }
                    placeholder="e.g., 25, 59"
                    className={cn(
                      'border-input bg-background text-foreground w-full rounded-lg border px-2 py-1.5 text-xs',
                      'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                      'placeholder:text-muted-foreground/60',
                    )}
                  />
                </div>
                <div className="col-span-3">
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {diagnosisCodes.length > 0 ? (
                      diagnosisCodes.map((dx) => (
                        <button
                          key={dx.pointer}
                          type="button"
                          onClick={() => {
                            const current = proc.diagnosisPointers || [];
                            const updated = current.includes(dx.pointer)
                              ? current.filter((p) => p !== dx.pointer)
                              : [...current, dx.pointer];
                            updateProcedure(idx, { diagnosisPointers: updated });
                          }}
                          className={cn(
                            'inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold transition-colors',
                            (proc.diagnosisPointers || []).includes(dx.pointer)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-accent text-muted-foreground',
                          )}
                          title={dx.code}
                        >
                          {dx.pointer}
                        </button>
                      ))
                    ) : (
                      <span className="text-muted-foreground/60 text-[10px]">No DX codes</span>
                    )}
                  </div>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeProcedure(idx)}
                    className="text-muted-foreground hover:text-destructive rounded-md p-1 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground/60 text-xs italic">
            No procedures added yet. Search and add CPT codes above.
          </p>
        )}
      </div>

      {/* Section: Provider NPI and Taxonomy */}
      <div className="border-border bg-card rounded-xl border p-6">
        <h2 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
          <Stethoscope className="text-primary h-4 w-4" />
          Provider Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Rendering Provider NPI <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={renderingNpi}
              onChange={(e) => setRenderingNpi(e.target.value)}
              placeholder="10-digit NPI"
              maxLength={10}
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                'placeholder:text-muted-foreground/60',
                errors.renderingNpi && 'border-destructive',
              )}
            />
            {errors.renderingNpi && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" /> {errors.renderingNpi}
              </p>
            )}
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Rendering Provider Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={renderingName}
              onChange={(e) => setRenderingName(e.target.value)}
              placeholder="Dr. John Doe"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                'placeholder:text-muted-foreground/60',
                errors.renderingName && 'border-destructive',
              )}
            />
            {errors.renderingName && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" /> {errors.renderingName}
              </p>
            )}
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Provider Taxonomy Code</label>
            <input
              type="text"
              value={providerTaxonomy}
              onChange={(e) => setProviderTaxonomy(e.target.value)}
              placeholder="e.g., 225100000X"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                'placeholder:text-muted-foreground/60',
              )}
            />
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Referring Provider NPI
            </label>
            <input
              type="text"
              value={referringNpi}
              onChange={(e) => setReferringNpi(e.target.value)}
              placeholder="10-digit NPI"
              maxLength={10}
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                'placeholder:text-muted-foreground/60',
              )}
            />
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              Referring Provider Name
            </label>
            <input
              type="text"
              value={referringName}
              onChange={(e) => setReferringName(e.target.value)}
              placeholder="Referring physician"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                'placeholder:text-muted-foreground/60',
              )}
            />
          </div>
        </div>
      </div>

      {/* Section: Facility Info */}
      <div className="border-border bg-card rounded-xl border p-6">
        <h2 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
          <Building2 className="text-primary h-4 w-4" />
          Facility Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Facility Name</label>
            <input
              type="text"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              placeholder="Facility or clinic name"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                'placeholder:text-muted-foreground/60',
              )}
            />
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Facility NPI</label>
            <input
              type="text"
              value={facilityNpi}
              onChange={(e) => setFacilityNpi(e.target.value)}
              placeholder="Facility NPI"
              maxLength={10}
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                'placeholder:text-muted-foreground/60',
              )}
            />
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">Facility Address</label>
            <input
              type="text"
              value={facilityAddress}
              onChange={(e) => setFacilityAddress(e.target.value)}
              placeholder="Street, City, State, ZIP"
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
                'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                'placeholder:text-muted-foreground/60',
              )}
            />
          </div>
        </div>
      </div>

      {/* Section: Attachments */}
      <div className="border-border bg-card rounded-xl border p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-lg font-semibold">Attachments</h2>
            <p className="text-muted-foreground text-sm">
              Upload EOB, referrals, prior authorizations
            </p>
          </div>
          <button
            type="button"
            onClick={addAttachment}
            className="text-muted-foreground hover:text-foreground hover:border-primary/40 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Add File
          </button>
        </div>

        {attachments.length > 0 ? (
          <div className="space-y-3">
            {attachments.map((att, idx) => (
              <div key={idx} className="border-border bg-accent/20 flex items-center gap-3 rounded-lg border p-3">
                <File className="text-primary h-5 w-5 shrink-0" />
                <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <input
                    type="text"
                    value={att.name}
                    onChange={(e) => updateAttachment(idx, { name: e.target.value })}
                    placeholder="File name..."
                    className={cn(
                      'border-input bg-background text-foreground w-full rounded-lg border px-3 py-1.5 text-xs',
                      'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                      'placeholder:text-muted-foreground/60',
                    )}
                  />
                  <select
                    value={att.type}
                    onChange={(e) => updateAttachment(idx, { type: e.target.value })}
                    className={cn(
                      'border-input bg-background text-foreground w-full rounded-lg border px-3 py-1.5 text-xs appearance-none',
                      'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                    )}
                  >
                    {ATTACHMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        updateAttachment(idx, { file });
                        if (file && !att.name) {
                          updateAttachment(idx, { name: file.name, file });
                        }
                      }}
                      className="text-muted-foreground file:text-foreground file:border-border file:bg-accent text-xs file:mr-2 file:rounded file:border file:px-2 file:py-1 file:text-xs file:font-medium"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="text-muted-foreground hover:text-destructive shrink-0 rounded-md p-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground/60 text-xs italic">
            No attachments yet. Add EOBs, referrals, or authorization documents.
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="border-border bg-card rounded-xl border p-6">
        <label className="text-foreground mb-1.5 block text-sm font-medium">Claim Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Additional notes for this claim..."
          className={cn(
            'border-input bg-background text-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm',
            'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
            'placeholder:text-muted-foreground/60 transition-colors resize-none',
          )}
        />
        <p className="text-muted-foreground mt-1 text-right text-xs">
          {notes.length}/2000
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="text-muted-foreground hover:text-foreground border-border hover:border-primary/40 inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className={cn(
            'bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          {isSaving ? 'Submitting...' : 'Submit Claim'}
        </button>
      </div>
    </div>
  );
}
