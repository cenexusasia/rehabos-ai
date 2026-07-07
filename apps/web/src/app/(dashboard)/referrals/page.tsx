'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Share2,
  Users,
  Send,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useReferrals, useNetworkConnections } from '@/hooks/use-referrals';
import {
  REFERRAL_STATUS_COLORS,
  REFERRAL_STATUS_LABELS,
  REFERRAL_PRIORITY_LABELS,
  REFERRAL_PRIORITY_COLORS,
} from '@/types/referral';
import type { ReferralStatus } from '@/types/referral';

const TAB_OPTIONS: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: 'outgoing', label: 'Outgoing', icon: <ArrowUpRight className="h-4 w-4" /> },
  { value: 'incoming', label: 'Incoming', icon: <ArrowDownLeft className="h-4 w-4" /> },
  { value: 'network', label: 'Network', icon: <Users className="h-4 w-4" /> },
];

const STATUS_FILTERS: { value: ReferralStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'sent', label: 'Sent' },
  { value: 'received', label: 'Received' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'completed', label: 'Completed' },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ReferralsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('outgoing');
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | ''>('');

  const { data: outgoing, isLoading: outgoingLoading } = useReferrals({ direction: 'outgoing', status: statusFilter || undefined });
  const { data: incoming, isLoading: incomingLoading } = useReferrals({ direction: 'incoming', status: statusFilter || undefined });
  const { data: connections, isLoading: networkLoading } = useNetworkConnections();

  const isLoading = activeTab === 'network' ? networkLoading : activeTab === 'outgoing' ? outgoingLoading : incomingLoading;
  const referrals = activeTab === 'outgoing' ? outgoing : incoming;

  const renderReferralCard = (ref: NonNullable<typeof outgoing>[number]) => {
    const clinician = activeTab === 'outgoing' ? ref.to_clinician : ref.from_clinician;
    return (
      <div
        key={ref.id}
        className="border-border bg-card hover:border-primary/30 cursor-pointer rounded-xl border p-5 transition-all"
        onClick={() => router.push(`/referrals/${ref.id}`)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-foreground truncate text-sm font-medium">
                {clinician ? `${clinician.first_name} ${clinician.last_name}` : 'Unknown Clinician'}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                  REFERRAL_PRIORITY_COLORS[ref.priority],
                )}
              >
                {REFERRAL_PRIORITY_LABELS[ref.priority]}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {clinician?.specialty ?? 'General'} {clinician?.clinic_name ? `· ${clinician.clinic_name}` : ''}
            </p>
            {ref.patient && (
              <p className="text-muted-foreground mt-0.5 text-xs">
                Patient: {(ref.patient as unknown as { first_name: string; last_name: string }).first_name} {(ref.patient as unknown as { first_name: string; last_name: string }).last_name}
              </p>
            )}
            <p className="text-muted-foreground mt-1.5 line-clamp-1 text-xs">{ref.reason}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                REFERRAL_STATUS_COLORS[ref.status],
              )}
            >
              {REFERRAL_STATUS_LABELS[ref.status]}
            </span>
            <span className="text-muted-foreground whitespace-nowrap text-[10px]">{formatDate(ref.created_at)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderNetworkTab = () => {
    if (networkLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="border-border bg-card rounded-xl border p-5">
          <h3 className="text-foreground mb-1 text-sm font-medium">Your Network</h3>
          <p className="text-muted-foreground text-xs">
            Connected clinicians you can send referrals to directly.
          </p>
        </div>

        {(!connections || connections.length === 0) ? (
          <div className="border-border bg-card rounded-xl border p-12 text-center">
            <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h2 className="text-foreground text-lg font-semibold">No connections yet</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Build your referral network by connecting with other clinicians.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((conn) => {
              const clinician = conn.connected_clinician;
              return (
                <div
                  key={conn.id}
                  className="border-border bg-card hover:border-primary/30 rounded-xl border p-4 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium">
                        {clinician ? `${clinician.first_name?.[0]}${clinician.last_name?.[0]}` : '??'}
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {clinician ? `Dr. ${clinician.last_name}` : 'Unknown'}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {clinician?.specialty ?? 'General'}
                          {clinician?.clinic_name ? ` · ${clinician.clinic_name}` : ''}
                          {clinician?.city ? ` · ${clinician.city}` : ''}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/referrals/send?clinician=${conn.connected_clinician_id}`}
                      className={cn(
                        'bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
                        'hover:bg-primary/90 transition-colors',
                      )}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Refer
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Referral Network</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Send and manage patient referrals between clinicians
          </p>
        </div>
        <Link
          href="/referrals/send"
          className={cn(
            'bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
            'hover:bg-primary/90 transition-colors',
            'focus:ring-primary focus:ring-offset-background focus:ring-2 focus:ring-offset-2 focus:outline-none',
          )}
        >
          <Send className="h-4 w-4" />
          Send Referral
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        {TAB_OPTIONS.map((tab) => (
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

      {/* Status filter (not for network tab) */}
      {activeTab !== 'network' && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === f.value
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground bg-card',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {activeTab === 'network' ? (
        renderNetworkTab()
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : !referrals || referrals.length === 0 ? (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <Share2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="text-foreground text-lg font-semibold">No referrals</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {activeTab === 'outgoing'
              ? "You haven't sent any referrals yet."
              : 'No incoming referrals to display.'}
          </p>
          {activeTab === 'outgoing' && (
            <Link
              href="/referrals/send"
              className={cn(
                'bg-primary text-primary-foreground mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
                'hover:bg-primary/90 transition-colors',
              )}
            >
              <Send className="h-4 w-4" />
              Send Your First Referral
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">{referrals.map(renderReferralCard)}</div>
      )}
    </div>
  );
}
