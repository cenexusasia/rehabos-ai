'use client';

import { useState } from 'react';
import {
  Link,
  Webhook,
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  INTEGRATION_PROVIDER_META,
  INTEGRATION_STATUS_COLORS,
  WEBHOOK_EVENT_GROUPS,
  API_KEY_PERMISSION_OPTIONS,
} from '@/types/integration';
import type { IntegrationProvider, IntegrationStatus, WebhookEvent } from '@/types/integration';

// ── Mock Data (will be replaced with real hooks) ────────────────────────────

const MOCK_INTEGRATIONS: { provider: IntegrationProvider; status: IntegrationStatus; label: string }[] = [
  { provider: 'zoom', status: 'connected', label: 'Zoom Telehealth' },
  { provider: 'google_calendar', status: 'connected', label: 'Google Calendar' },
  { provider: 'docusign', status: 'disconnected', label: 'DocuSign' },
  { provider: 'twilio', status: 'disconnected', label: 'Twilio SMS' },
  { provider: 'stripe', status: 'disconnected', label: 'Stripe Payments' },
  { provider: 'epic', status: 'error', label: 'Epic EHR' },
];

const MOCK_API_KEYS = [
  { id: '1', name: 'Production API Key', key_prefix: 'rbs_pk_live_...a1b2', permissions: ['patients.read', 'referrals.read'], last_used_at: '2025-07-06T10:30:00Z', is_active: true, created_at: '2025-01-15T00:00:00Z' },
  { id: '2', name: 'Development API Key', key_prefix: 'rbs_pk_test_...c3d4', permissions: ['patients.read', 'patients.write', 'referrals.read', 'referrals.write'], last_used_at: '2025-07-05T14:00:00Z', is_active: true, created_at: '2025-03-20T00:00:00Z' },
  { id: '3', name: 'Analytics Integration', key_prefix: 'rbs_pk_live_...e5f6', permissions: ['analytics.read'], last_used_at: null, is_active: false, created_at: '2025-04-01T00:00:00Z' },
];

const MOCK_WEBHOOKS = [
  { id: '1', name: 'EHR Sync', url: 'https://ehr.example.com/webhooks/rehabos', events: ['patient.created', 'patient.updated', 'appointment.created'] as WebhookEvent[], is_active: true, last_triggered_at: '2025-07-06T12:00:00Z', last_status_code: 200, failure_count: 0, created_at: '2025-02-01T00:00:00Z' },
  { id: '2', name: 'Slack Notifications', url: 'https://hooks.slack.com/services/T.../B.../xxx', events: ['referral.received', 'referral.accepted', 'soap.signed'] as WebhookEvent[], is_active: true, last_triggered_at: '2025-07-05T16:30:00Z', last_status_code: 200, failure_count: 1, created_at: '2025-04-10T00:00:00Z' },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// ── Tabs ────────────────────────────────────────────────────────────────────

type Tab = 'integrations' | 'api-keys' | 'webhooks';

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: 'integrations', label: 'Integrations', icon: <Link className="h-4 w-4" /> },
  { value: 'api-keys', label: 'API Keys', icon: <Key className="h-4 w-4" /> },
  { value: 'webhooks', label: 'Webhooks', icon: <Webhook className="h-4 w-4" /> },
];

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('integrations');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [showNewWebhookForm, setShowNewWebhookForm] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect third-party services, manage API keys, and configure webhooks
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
              activeTab === tab.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-3">
          <div className="border-border bg-card rounded-xl border p-5">
            <h2 className="text-foreground text-sm font-medium">Connected Services</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Manage third-party service connections
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {MOCK_INTEGRATIONS.map((integration) => {
              const meta = INTEGRATION_PROVIDER_META[integration.provider];
              return (
                <div
                  key={integration.provider}
                  className="border-border bg-card hover:border-primary/30 rounded-xl border p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-accent text-foreground flex h-10 w-10 items-center justify-center rounded-full text-lg">
                        {meta.icon}
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">{meta.label}</p>
                        <p className="text-muted-foreground text-xs">{meta.description}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap',
                        INTEGRATION_STATUS_COLORS[integration.status],
                      )}
                    >
                      {integration.status === 'connected'
                        ? 'Connected'
                        : integration.status === 'disconnected'
                          ? 'Disconnected'
                          : integration.status === 'error'
                            ? 'Error'
                            : 'Expired'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    {integration.status === 'connected' ? (
                      <button className="text-muted-foreground hover:text-destructive text-xs transition-colors">
                        Disconnect
                      </button>
                    ) : (
                      <button className="text-primary text-xs font-medium hover:underline">
                        {integration.status === 'error' ? 'Reconnect' : 'Connect'}
                      </button>
                    )}
                    {integration.status === 'connected' && (
                      <button className="text-muted-foreground hover:text-foreground text-xs transition-colors">
                        Configure
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="border-border bg-card rounded-xl border p-5 flex-1">
              <h2 className="text-foreground text-sm font-medium">API Keys</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Keys for programmatic access to the RehabOS API
              </p>
            </div>
            <button
              onClick={() => setShowNewKeyForm(true)}
              className={cn(
                'bg-primary text-primary-foreground ml-3 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
                'hover:bg-primary/90 transition-colors',
              )}
            >
              <Plus className="h-4 w-4" />
              New Key
            </button>
          </div>

          {/* New Key Form */}
          {showNewKeyForm && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h3 className="text-foreground mb-4 text-sm font-medium">Create New API Key</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="key-name" className="text-foreground mb-1.5 block text-xs font-medium">
                    Key Name
                  </label>
                  <input
                    id="key-name"
                    type="text"
                    placeholder="e.g., Production API Key"
                    className={cn(
                      'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm',
                      'placeholder:text-muted-foreground/60',
                      'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    )}
                  />
                </div>
                <div>
                  <label className="text-foreground mb-1.5 block text-xs font-medium">Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {API_KEY_PERMISSION_OPTIONS.map((perm) => (
                      <label
                        key={perm.value}
                        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs cursor-pointer hover:bg-accent/50 transition-colors"
                      >
                        <input type="checkbox" className="rounded border-border accent-primary" />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowNewKeyForm(false)}
                    className="border-border text-muted-foreground hover:text-foreground rounded-lg border px-4 py-2 text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors hover:bg-primary/90">
                    <Key className="h-3.5 w-3.5" />
                    Generate Key
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Key List */}
          <div className="space-y-3">
            {MOCK_API_KEYS.map((key) => (
              <div
                key={key.id}
                className="border-border bg-card rounded-xl border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-foreground text-sm font-medium">{key.name}</h3>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                          key.is_active
                            ? 'border-green-500/20 bg-green-500/10 text-green-400'
                            : 'border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground',
                        )}
                      >
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <code className="bg-accent/50 text-foreground rounded px-2 py-0.5 text-[11px] font-mono">
                        {key.key_prefix}
                      </code>
                      <button
                        onClick={() => handleCopy(key.key_prefix, `copy-${key.id}`)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedId === `copy-${key.id}` ? (
                          <Check className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {key.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="bg-primary/5 text-primary rounded-md px-1.5 py-0.5 text-[10px]"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="text-muted-foreground text-[10px]">
                      Last used: {formatDate(key.last_used_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="border-border bg-card rounded-xl border p-5 flex-1">
              <h2 className="text-foreground text-sm font-medium">Webhooks</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Send real-time events to your endpoints
              </p>
            </div>
            <button
              onClick={() => setShowNewWebhookForm(true)}
              className={cn(
                'bg-primary text-primary-foreground ml-3 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
                'hover:bg-primary/90 transition-colors',
              )}
            >
              <Plus className="h-4 w-4" />
              New Webhook
            </button>
          </div>

          {/* New Webhook Form */}
          {showNewWebhookForm && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h3 className="text-foreground mb-4 text-sm font-medium">Create New Webhook</h3>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="webhook-name" className="text-foreground mb-1.5 block text-xs font-medium">
                      Name
                    </label>
                    <input
                      id="webhook-name"
                      type="text"
                      placeholder="e.g., Slack Notifications"
                      className={cn(
                        'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm',
                        'placeholder:text-muted-foreground/60',
                        'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                      )}
                    />
                  </div>
                  <div>
                    <label htmlFor="webhook-url" className="text-foreground mb-1.5 block text-xs font-medium">
                      Endpoint URL
                    </label>
                    <input
                      id="webhook-url"
                      type="url"
                      placeholder="https://example.com/webhooks/rehabos"
                      className={cn(
                        'border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm',
                        'placeholder:text-muted-foreground/60',
                        'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                      )}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-foreground mb-2 block text-xs font-medium">Events</label>
                  <div className="space-y-3">
                    {WEBHOOK_EVENT_GROUPS.map((group) => (
                      <fieldset key={group.label}>
                        <legend className="text-muted-foreground mb-1.5 text-[11px] font-medium uppercase tracking-wider">
                          {group.label}
                        </legend>
                        <div className="flex flex-wrap gap-2">
                          {group.events.map((event) => (
                            <label
                              key={event}
                              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs cursor-pointer hover:bg-accent/50 transition-colors"
                            >
                              <input type="checkbox" className="rounded border-border accent-primary" />
                              {event}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowNewWebhookForm(false)}
                    className="border-border text-muted-foreground hover:text-foreground rounded-lg border px-4 py-2 text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors hover:bg-primary/90">
                    <Webhook className="h-3.5 w-3.5" />
                    Create Webhook
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Webhook List */}
          <div className="space-y-3">
            {MOCK_WEBHOOKS.map((wh) => (
              <div
                key={wh.id}
                className="border-border bg-card rounded-xl border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-foreground text-sm font-medium">{wh.name}</h3>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                          wh.is_active
                            ? 'border-green-500/20 bg-green-500/10 text-green-400'
                            : 'border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground',
                        )}
                      >
                        {wh.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <code className="text-muted-foreground mt-1 block truncate text-[11px] font-mono">
                      {wh.url}
                    </code>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {wh.events.map((event) => (
                        <span
                          key={event}
                          className="bg-accent/50 text-muted-foreground rounded-md px-1.5 py-0.5 text-[10px]"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="text-muted-foreground text-[10px]">
                      {wh.failure_count > 0 && (
                        <span className="text-destructive mr-2">{wh.failure_count} failures</span>
                      )}
                      Last: {formatDate(wh.last_triggered_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
