// ── Enums ──────────────────────────────────────────────────────────────────

export type IntegrationProvider =
  | 'ahi'
  | 'practice_fusion'
  | 'kareo'
  | 'drchrono'
  | 'athenahealth'
  | 'epic'
  | 'cerner'
  | 'meditech'
  | 'google_calendar'
  | 'outlook_calendar'
  | 'zoom'
  | 'docusign'
  | 'twilio'
  | 'stripe';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'expired';

export type WebhookEvent =
  | 'referral.sent'
  | 'referral.received'
  | 'referral.accepted'
  | 'referral.declined'
  | 'referral.completed'
  | 'patient.created'
  | 'patient.updated'
  | 'appointment.created'
  | 'appointment.updated'
  | 'appointment.cancelled'
  | 'visit.created'
  | 'visit.updated'
  | 'soap.created'
  | 'soap.signed'
  | 'assessment.completed';

// ── Integration ─────────────────────────────────────────────────────────────

export interface Integration {
  id: string;
  organization_id: string;
  provider: IntegrationProvider;
  label: string;
  description: string | null;
  status: IntegrationStatus;
  config: Record<string, unknown>;
  credentials: Record<string, unknown> | null;
  last_synced_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export type IntegrationListItem = Pick<
  Integration,
  'id' | 'provider' | 'label' | 'description' | 'status' | 'last_synced_at' | 'created_at'
>;

// ── API Key ─────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  permissions: string[];
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

export type ApiKeyListItem = Pick<
  ApiKey,
  'id' | 'name' | 'key_prefix' | 'permissions' | 'last_used_at' | 'expires_at' | 'is_active' | 'created_at'
>;

export interface CreateApiKeyFormData {
  name: string;
  permissions: string[];
  expires_at?: string;
}

// ── Webhook ─────────────────────────────────────────────────────────────────

export interface Webhook {
  id: string;
  organization_id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  is_active: boolean;
  last_triggered_at: string | null;
  last_status_code: number | null;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export type WebhookListItem = Pick<
  Webhook,
  'id' | 'name' | 'url' | 'events' | 'is_active' | 'last_triggered_at' | 'last_status_code' | 'failure_count' | 'created_at'
>;

export interface CreateWebhookFormData {
  name: string;
  url: string;
  events: WebhookEvent[];
}

// ── Constants ───────────────────────────────────────────────────────────────

export const INTEGRATION_PROVIDER_META: Record<IntegrationProvider, { label: string; description: string; icon: string }> = {
  ahi: { label: 'AHI', description: 'American Health Information', icon: '🏥' },
  practice_fusion: { label: 'Practice Fusion', description: 'Cloud-based EHR', icon: '💻' },
  kareo: { label: 'Kareo', description: 'Medical practice management', icon: '📋' },
  drchrono: { label: 'drchrono', description: 'Cloud-based EHR platform', icon: '📱' },
  athenahealth: { label: 'Athenahealth', description: 'Networked EHR services', icon: '🌐' },
  epic: { label: 'Epic', description: 'Enterprise EHR system', icon: '🏛️' },
  cerner: { label: 'Cerner', description: 'Health IT solutions', icon: '🏗️' },
  meditech: { label: 'Meditech', description: 'Healthcare information system', icon: '🩺' },
  google_calendar: { label: 'Google Calendar', description: 'Calendar sync and scheduling', icon: '📅' },
  outlook_calendar: { label: 'Outlook Calendar', description: 'Microsoft 365 calendar sync', icon: '📆' },
  zoom: { label: 'Zoom', description: 'Video conferencing for telehealth', icon: '🎥' },
  docusign: { label: 'DocuSign', description: 'Electronic signature platform', icon: '✍️' },
  twilio: { label: 'Twilio', description: 'SMS and messaging service', icon: '💬' },
  stripe: { label: 'Stripe', description: 'Payment processing', icon: '💳' },
};

export const INTEGRATION_STATUS_COLORS: Record<IntegrationStatus, string> = {
  connected: 'border-green-500/20 bg-green-500/10 text-green-400',
  disconnected: 'border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground',
  error: 'border-red-500/20 bg-red-500/10 text-red-400',
  expired: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
};

export const WEBHOOK_EVENT_GROUPS: { label: string; events: WebhookEvent[] }[] = [
  {
    label: 'Referrals',
    events: ['referral.sent', 'referral.received', 'referral.accepted', 'referral.declined', 'referral.completed'],
  },
  {
    label: 'Patients',
    events: ['patient.created', 'patient.updated'],
  },
  {
    label: 'Appointments',
    events: ['appointment.created', 'appointment.updated', 'appointment.cancelled'],
  },
  {
    label: 'Visits & SOAP',
    events: ['visit.created', 'visit.updated', 'soap.created', 'soap.signed'],
  },
  {
    label: 'Assessments',
    events: ['assessment.completed'],
  },
];

export const API_KEY_PERMISSION_OPTIONS = [
  { value: 'patients.read', label: 'Read Patients' },
  { value: 'patients.write', label: 'Write Patients' },
  { value: 'referrals.read', label: 'Read Referrals' },
  { value: 'referrals.write', label: 'Write Referrals' },
  { value: 'appointments.read', label: 'Read Appointments' },
  { value: 'appointments.write', label: 'Write Appointments' },
  { value: 'visits.read', label: 'Read Visits' },
  { value: 'visits.write', label: 'Write Visits' },
  { value: 'soap.read', label: 'Read SOAP Notes' },
  { value: 'soap.write', label: 'Write SOAP Notes' },
  { value: 'analytics.read', label: 'Read Analytics' },
  { value: 'admin', label: 'Admin (Full Access)' },
];
