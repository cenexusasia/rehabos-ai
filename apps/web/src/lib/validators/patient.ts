import { z } from 'zod';

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

export type PatientFormValues = z.infer<typeof patientFormSchema>;
