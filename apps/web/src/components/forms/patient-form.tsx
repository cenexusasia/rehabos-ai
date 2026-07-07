'use client';

import { z } from 'zod';
import { Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { cn } from '@/lib/utils';
import type { PatientFormData, Patient } from '@/types/patient';

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export const PATIENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'discharged', label: 'Discharged' },
  { value: 'archived', label: 'Archived' },
  { value: 'transferred', label: 'Transferred' },
] as const;

export const patientFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
    message: 'Gender is required',
  }),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email('Invalid email').nullable().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
    })
    .nullable()
    .optional(),
  emergency_contact: z
    .object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phone: z.string().optional(),
    })
    .nullable()
    .optional(),
  insurance_provider: z.string().max(200).nullable().optional(),
  insurance_id: z.string().max(100).nullable().optional(),
  insurance_group_number: z.string().max(100).nullable().optional(),
  diagnosis_codes: z.array(z.string()).optional(),
  referring_provider: z.string().max(200).nullable().optional(),
  tags: z.array(z.string()).optional(),
  status: z
    .enum(['active', 'inactive', 'discharged', 'archived', 'transferred'])
    .optional(),
  notes: z.string().max(5000).nullable().optional(),
});

interface PatientFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<PatientFormData>;
  patient?: Patient | null;
  onSubmit: (data: PatientFormData) => Promise<{ error?: Record<string, unknown> }>;
  isSubmitting: boolean;
  error?: string | null;
}

export function PatientForm({
  mode,
  defaultValues,
  patient,
  onSubmit,
  isSubmitting,
  error: submitError,
}: PatientFormProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [firstName, setFirstName] = useState(defaultValues?.first_name ?? '');
  const [lastName, setLastName] = useState(defaultValues?.last_name ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(defaultValues?.date_of_birth ?? '');
  const [gender, setGender] = useState(defaultValues?.gender ?? '');
  const [phone, setPhone] = useState(defaultValues?.phone ?? '');
  const [email, setEmail] = useState(defaultValues?.email ?? '');
  const [insuranceProvider, setInsuranceProvider] = useState(defaultValues?.insurance_provider ?? '');
  const [insuranceId, setInsuranceId] = useState(defaultValues?.insurance_id ?? '');
  const [insuranceGroupNumber, setInsuranceGroupNumber] = useState(
    defaultValues?.insurance_group_number ?? '',
  );
  const [referringProvider, setReferringProvider] = useState(defaultValues?.referring_provider ?? '');
  const [notes, setNotes] = useState(defaultValues?.notes ?? '');
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [diagnosisCodes, setDiagnosisCodes] = useState<string[]>(
    defaultValues?.diagnosis_codes ?? [],
  );
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [status, setStatus] = useState(defaultValues?.status ?? patient?.status ?? 'active');

  // Address fields
  const [addressStreet, setAddressStreet] = useState(
    defaultValues?.address?.street ?? patient?.address?.street ?? '',
  );
  const [addressCity, setAddressCity] = useState(
    defaultValues?.address?.city ?? patient?.address?.city ?? '',
  );
  const [addressState, setAddressState] = useState(
    defaultValues?.address?.state ?? patient?.address?.state ?? '',
  );
  const [addressZip, setAddressZip] = useState(
    defaultValues?.address?.zip ?? patient?.address?.zip ?? '',
  );

  // Emergency contact fields
  const [ecName, setEcName] = useState(
    defaultValues?.emergency_contact?.name ?? patient?.emergency_contact?.name ?? '',
  );
  const [ecRelationship, setEcRelationship] = useState(
    defaultValues?.emergency_contact?.relationship ??
      patient?.emergency_contact?.relationship ??
      '',
  );
  const [ecPhone, setEcPhone] = useState(
    defaultValues?.emergency_contact?.phone ?? patient?.emergency_contact?.phone ?? '',
  );

  const addDiagnosisCode = useCallback(() => {
    const code = diagnosisInput.trim().toUpperCase();
    if (code && !diagnosisCodes.includes(code)) {
      setDiagnosisCodes((prev) => [...prev, code]);
      setDiagnosisInput('');
    }
  }, [diagnosisInput, diagnosisCodes]);

  const removeDiagnosisCode = useCallback((code: string) => {
    setDiagnosisCodes((prev) => prev.filter((c) => c !== code));
  }, []);

  const handleDiagnosisKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addDiagnosisCode();
      }
    },
    [addDiagnosisCode],
  );

  const addTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      }
    },
    [addTag],
  );

  useEffect(() => {
    if (patient) {
      setFirstName(patient.first_name);
      setLastName(patient.last_name);
      setDateOfBirth(patient.date_of_birth);
      setGender(patient.gender);
      setPhone(patient.phone ?? '');
      setEmail(patient.email ?? '');
      setInsuranceProvider(patient.insurance_provider ?? '');
      setInsuranceId(patient.insurance_id ?? '');
      setInsuranceGroupNumber(patient.insurance_group_number ?? '');
      setReferringProvider(patient.referring_provider ?? '');
      setNotes(patient.notes ?? '');
      setDiagnosisCodes(patient.diagnosis_codes ?? []);
      setTags(patient.tags ?? []);
      setStatus(patient.status);
      setAddressStreet(patient.address?.street ?? '');
      setAddressCity(patient.address?.city ?? '');
      setAddressState(patient.address?.state ?? '');
      setAddressZip(patient.address?.zip ?? '');
      setEcName(patient.emergency_contact?.name ?? '');
      setEcRelationship(patient.emergency_contact?.relationship ?? '');
      setEcPhone(patient.emergency_contact?.phone ?? '');
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const formData: PatientFormData = {
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      gender,
      phone: phone || null,
      email: email || null,
      address: {
        street: addressStreet || undefined,
        city: addressCity || undefined,
        state: addressState || undefined,
        zip: addressZip || undefined,
      },
      emergency_contact: {
        name: ecName || undefined,
        relationship: ecRelationship || undefined,
        phone: ecPhone || undefined,
      },
      insurance_provider: insuranceProvider || null,
      insurance_id: insuranceId || null,
      insurance_group_number: insuranceGroupNumber || null,
      diagnosis_codes: diagnosisCodes,
      referring_provider: referringProvider || null,
      tags,
      status,
      notes: notes || null,
    };

    const result = await onSubmit(formData);
    if (result?.error) {
      const errs = result.error as Record<string, string[] | { _form?: string[] }>;
      if (errs._form) {
        setFieldErrors({ _form: errs._form as string[] });
      } else {
        setFieldErrors(errs as Record<string, string[]>);
      }
    }
  };

  const inputClass = cn(
    'border-input bg-background text-foreground w-full rounded-lg border py-2 px-3 text-sm',
    'placeholder:text-muted-foreground/60',
    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
    'transition-colors',
  );

  const labelClass = 'text-foreground text-sm font-medium';
  const errorClass = 'text-destructive text-xs mt-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Form-level error */}
      {submitError && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {submitError}
        </div>
      )}
      {fieldErrors._form && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {fieldErrors._form.join(', ')}
        </div>
      )}

      {/* Basic Info */}
      <section>
        <h3 className="text-foreground mb-4 text-base font-semibold">Basic Information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="first_name" className={labelClass}>First Name *</label>
            <input
              id="first_name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              required
              className={inputClass}
            />
            {fieldErrors.first_name && (
              <p className={errorClass}>{fieldErrors.first_name[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="last_name" className={labelClass}>Last Name *</label>
            <input
              id="last_name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              required
              className={inputClass}
            />
            {fieldErrors.last_name && (
              <p className={errorClass}>{fieldErrors.last_name[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="date_of_birth" className={labelClass}>Date of Birth *</label>
            <input
              id="date_of_birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              className={inputClass}
            />
            {fieldErrors.date_of_birth && (
              <p className={errorClass}>{fieldErrors.date_of_birth[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="gender" className={labelClass}>Gender *</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className={cn(inputClass, 'appearance-none')}
            >
              <option value="">Select gender...</option>
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {fieldErrors.gender && (
              <p className={errorClass}>{fieldErrors.gender[0]}</p>
            )}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section>
        <h3 className="text-foreground mb-4 text-base font-semibold">Contact Information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="phone" className={labelClass}>Phone</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className={labelClass}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className={inputClass}
            />
            {fieldErrors.email && (
              <p className={errorClass}>{fieldErrors.email[0]}</p>
            )}
          </div>
        </div>
      </section>

      {/* Address */}
      <section>
        <h3 className="text-foreground mb-4 text-base font-semibold">Address</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="address_street" className={labelClass}>Street</label>
            <input
              id="address_street"
              type="text"
              value={addressStreet}
              onChange={(e) => setAddressStreet(e.target.value)}
              placeholder="123 Main St"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="address_city" className={labelClass}>City</label>
            <input
              id="address_city"
              type="text"
              value={addressCity}
              onChange={(e) => setAddressCity(e.target.value)}
              placeholder="New York"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="address_state" className={labelClass}>State</label>
            <input
              id="address_state"
              type="text"
              value={addressState}
              onChange={(e) => setAddressState(e.target.value)}
              placeholder="NY"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="address_zip" className={labelClass}>ZIP Code</label>
            <input
              id="address_zip"
              type="text"
              value={addressZip}
              onChange={(e) => setAddressZip(e.target.value)}
              placeholder="10001"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section>
        <h3 className="text-foreground mb-4 text-base font-semibold">Emergency Contact</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="ec_name" className={labelClass}>Name</label>
            <input
              id="ec_name"
              type="text"
              value={ecName}
              onChange={(e) => setEcName(e.target.value)}
              placeholder="Jane Doe"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="ec_relationship" className={labelClass}>Relationship</label>
            <input
              id="ec_relationship"
              type="text"
              value={ecRelationship}
              onChange={(e) => setEcRelationship(e.target.value)}
              placeholder="Spouse"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="ec_phone" className={labelClass}>Phone</label>
            <input
              id="ec_phone"
              type="tel"
              value={ecPhone}
              onChange={(e) => setEcPhone(e.target.value)}
              placeholder="+1 (555) 111-0000"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Insurance */}
      <section>
        <h3 className="text-foreground mb-4 text-base font-semibold">Insurance</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="insurance_provider" className={labelClass}>Provider</label>
            <input
              id="insurance_provider"
              type="text"
              value={insuranceProvider}
              onChange={(e) => setInsuranceProvider(e.target.value)}
              placeholder="Blue Cross"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="insurance_id" className={labelClass}>Member ID</label>
            <input
              id="insurance_id"
              type="text"
              value={insuranceId}
              onChange={(e) => setInsuranceId(e.target.value)}
              placeholder="XYZ123"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="insurance_group" className={labelClass}>Group Number</label>
            <input
              id="insurance_group"
              type="text"
              value={insuranceGroupNumber}
              onChange={(e) => setInsuranceGroupNumber(e.target.value)}
              placeholder="GRP-001"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Clinical Info */}
      <section>
        <h3 className="text-foreground mb-4 text-base font-semibold">Clinical Information</h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="referring_provider" className={labelClass}>Referring Provider</label>
            <input
              id="referring_provider"
              type="text"
              value={referringProvider}
              onChange={(e) => setReferringProvider(e.target.value)}
              placeholder="Dr. Smith"
              className={inputClass}
            />
          </div>

          {/* Diagnosis Codes */}
          <div className="space-y-1.5">
            <label className={labelClass}>Diagnosis Codes (ICD-10)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={diagnosisInput}
                onChange={(e) => setDiagnosisInput(e.target.value)}
                onKeyDown={handleDiagnosisKeyDown}
                placeholder="M54.5"
                className={cn(inputClass, 'flex-1')}
              />
              <button
                type="button"
                onClick={addDiagnosisCode}
                className="border-input bg-background hover:bg-accent rounded-lg border px-3 py-2 text-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {diagnosisCodes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {diagnosisCodes.map((code) => (
                  <span
                    key={code}
                    className="bg-secondary/20 text-secondary-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
                  >
                    {code}
                    <button
                      type="button"
                      onClick={() => removeDiagnosisCode(code)}
                      className="hover:text-destructive ml-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className={labelClass}>Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag..."
                className={cn(inputClass, 'flex-1')}
              />
              <button
                type="button"
                onClick={addTag}
                className="border-input bg-background hover:bg-accent rounded-lg border px-3 py-2 text-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-accent text-accent-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive ml-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label htmlFor="status" className={labelClass}>Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className={cn(inputClass, 'appearance-none')}
            >
              {PATIENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className={labelClass}>Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clinical notes..."
              rows={3}
              className={cn(inputClass, 'resize-none')}
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <Link
          href="/patients"
          className={cn(
            'border-input bg-background text-foreground rounded-lg border px-4 py-2.5 text-sm font-medium',
            'hover:bg-accent transition-colors',
          )}
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium',
            'hover:bg-primary/90 transition-colors',
            'focus:ring-primary focus:ring-offset-background focus:ring-2 focus:ring-offset-2 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'inline-flex items-center gap-2',
          )}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Saving...'
            : mode === 'create'
              ? 'Create Patient'
              : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
