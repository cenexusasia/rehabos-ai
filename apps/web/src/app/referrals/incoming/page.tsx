'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  X,
  Loader2,
  Inbox,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useIncomingReferrals, useRespondToReferral } from '@/hooks/use-referrals';
import {
  REFERRAL_PRIORITY_COLORS,
  REFERRAL_PRIORITY_LABELS,
} from '@/types/referral';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return `Today at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function IncomingReferralsPage() {
  const [respondId, setRespondId] = useState<string | null>(null);
  const [responseNotes, setResponseNotes] = useState('');

  const { data: referrals, isLoading, error } = useIncomingReferrals();
  const respondToReferral = useRespondToReferral();

  const handleRespond = async (id: string, status: 'accepted' | 'declined') => {
    try {
      await respondToReferral.mutateAsync({ id, status, responseNotes: responseNotes || undefined });
      setRespondId(null);
      setResponseNotes('');
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/referrals"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Referrals
        </Link>
        <h1 className="text-foreground text-2xl font-bold">Incoming Referrals</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review and respond to referrals sent to you
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-6 rounded-lg border px-4 py-3 text-sm">
          Failed to load incoming referrals. Please try again.
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && (!referrals || referrals.length === 0) && (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <Inbox className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="text-foreground text-lg font-semibold">No incoming referrals</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            You haven&apos;t received any referrals yet.
          </p>
          <Link
            href="/referrals"
            className="text-primary mt-4 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Referral Hub
          </Link>
        </div>
      )}

      {/* Referral list */}
      {!isLoading && referrals && referrals.length > 0 && (
        <div className="space-y-4">
          {referrals.map((ref) => {
            const fromClinician = ref.from_clinician;
            const patient = ref.patient;
            const isActionable = ref.status === 'sent' || ref.status === 'received';

            return (
              <div
                key={ref.id}
                className="border-border bg-card hover:border-primary/30 rounded-xl border p-5 transition-all"
              >
                <div className="flex flex-col gap-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-accent text-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium">
                        {fromClinician
                          ? `${fromClinician.first_name?.[0]}${fromClinician.last_name?.[0]}`
                          : '??'}
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          Dr. {fromClinician?.first_name} {fromClinician?.last_name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {fromClinician?.specialty ?? 'General'}
                          {fromClinician?.clinic_name ? ` · ${fromClinician.clinic_name}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                          REFERRAL_PRIORITY_COLORS[ref.priority],
                        )}
                      >
                        {REFERRAL_PRIORITY_LABELS[ref.priority]}
                      </span>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <p className="text-foreground text-sm font-medium">Reason for Referral</p>
                    <p className="text-muted-foreground mt-0.5 text-sm">{ref.reason}</p>
                  </div>

                  {/* Patient info */}
                  {patient && (
                    <div className="border-border/50 rounded-lg border p-3">
                      <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                        Patient
                      </p>
                      <p className="text-foreground mt-0.5 text-sm font-medium">
                        {(patient as unknown as { first_name: string; last_name: string }).first_name} {(patient as unknown as { first_name: string; last_name: string }).last_name}
                      </p>
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-muted-foreground text-xs">
                      Received {formatDate(ref.created_at)}
                    </span>

                    {/* Action buttons for actionable referrals */}
                    {isActionable ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleRespond(ref.id, 'declined')
                          }
                          disabled={respondToReferral.isPending && respondToReferral.variables?.id === ref.id}
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                          {respondToReferral.isPending && respondToReferral.variables?.id === ref.id && respondToReferral.variables?.status === 'declined' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          Decline
                        </button>
                        <button
                          onClick={() => handleRespond(ref.id, 'accepted')}
                          disabled={respondToReferral.isPending && respondToReferral.variables?.id === ref.id}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                          {respondToReferral.isPending && respondToReferral.variables?.id === ref.id && respondToReferral.variables?.status === 'accepted' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Accept
                        </button>
                      </div>
                    ) : (
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                          ref.status === 'accepted'
                            ? 'border-green-500/20 bg-green-500/10 text-green-400'
                            : ref.status === 'declined'
                              ? 'border-red-500/20 bg-red-500/10 text-red-400'
                              : ref.status === 'completed'
                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                : 'border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground',
                        )}
                      >
                        {ref.status === 'accepted'
                          ? 'Accepted'
                          : ref.status === 'declined'
                            ? 'Declined'
                            : ref.status === 'completed'
                              ? 'Completed'
                              : ref.status ?? 'Unknown'}
                      </span>
                    )}
                  </div>

                  {/* Response notes input */}
                  {respondId === ref.id && (
                    <div className="space-y-2">
                      <textarea
                        value={responseNotes}
                        onChange={(e) => setResponseNotes(e.target.value)}
                        placeholder="Add a note (optional)..."
                        rows={2}
                        className={cn(
                          'border-input bg-background text-foreground w-full rounded-lg border p-2.5 text-sm',
                          'placeholder:text-muted-foreground/60',
                          'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none resize-none',
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setRespondId(null);
                            setResponseNotes('');
                          }}
                          className="border-border text-muted-foreground rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:text-foreground"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRespond(ref.id, 'accepted')}
                          className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary/90"
                        >
                          <Check className="h-3 w-3" />
                          Accept & Respond
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
