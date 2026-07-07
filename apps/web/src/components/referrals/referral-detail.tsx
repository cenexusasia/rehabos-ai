'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Send,
  Repeat,
  FileText,
  Paperclip,
  Phone,
  Mail,
  MapPin,
  Shield,
  Stethoscope,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type {
  Referral,
  ReferralPriority,
  ReferralStatus,
  ClinicianProfile,
} from '@/types/referral';
import {
  REFERRAL_STATUS_COLORS,
  REFERRAL_STATUS_LABELS,
  REFERRAL_PRIORITY_LABELS,
} from '@/types/referral';

// ── Props ───────────────────────────────────────────────────────────────────

interface ReferralDetailProps {
  referral: Referral;
  onBack?: () => void;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onReassign?: (id: string) => void;
  onSendMessage?: (id: string, message: string) => void;
  className?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatAge(dob: string): string {
  const diff = Date.now() - new Date(dob).getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return `${age} years`;
}

// ── Priority Banner ─────────────────────────────────────────────────────────

function PriorityBanner({ priority }: { priority: ReferralPriority }) {
  const config: Record<ReferralPriority, { bg: string; label: string; icon: React.ReactNode }> = {
    emergency: {
      bg: 'border-red-500/20 bg-red-500/5',
      label: 'This referral requires immediate attention.',
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
    },
    urgent: {
      bg: 'border-amber-500/20 bg-amber-500/5',
      label: 'This referral should be addressed within 24-48 hours.',
      icon: <Clock className="h-5 w-5 text-amber-400" />,
    },
    routine: {
      bg: 'border-blue-500/20 bg-blue-500/5',
      label: 'Standard referral with no urgent time constraints.',
      icon: <Calendar className="h-5 w-5 text-blue-400" />,
    },
  };

  const c = config[priority];
  return (
    <div className={cn('flex items-center gap-3 rounded-xl border p-4', c.bg)}>
      {c.icon}
      <div>
        <p className={cn('text-sm font-semibold', priority === 'emergency' ? 'text-red-400' : priority === 'urgent' ? 'text-amber-400' : 'text-blue-400')}>
          {REFERRAL_PRIORITY_LABELS[priority]} Referral
        </p>
        <p className="text-muted-foreground text-xs">{c.label}</p>
      </div>
    </div>
  );
}

// ── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReferralStatus }) {
  const colors = REFERRAL_STATUS_COLORS[status] ?? 'border-muted bg-muted text-muted-foreground';
  return (
    <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium', colors)}>
      {REFERRAL_STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ── Provider Card ───────────────────────────────────────────────────────────

function ProviderCard({
  clinician,
  role,
}: {
  clinician?: ClinicianProfile | null;
  role: 'Referring' | 'Receiving';
}) {
  if (!clinician) {
    return (
      <div className="border-border bg-card rounded-xl border p-4">
        <p className="text-muted-foreground mb-1 text-xs font-medium">{role} Provider</p>
        <p className="text-muted-foreground text-sm">Not available</p>
      </div>
    );
  }

  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">{role} Provider</span>
        {clinician.accepting_patients && (
          <span className="border-green-500/20 bg-green-500/10 text-green-400 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium">
            Accepting
          </span>
        )}
      </div>
      <div className="flex items-start gap-3">
        <div className="bg-accent text-accent-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
          {clinician.first_name.charAt(0)}{clinician.last_name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground font-semibold">
            Dr. {clinician.first_name} {clinician.last_name}
          </p>
          <div className="mt-1.5 space-y-1">
            {clinician.specialty && (
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Stethoscope className="h-3 w-3" />
                {clinician.specialty}
              </p>
            )}
            {clinician.clinic_name && (
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Shield className="h-3 w-3" />
                {clinician.clinic_name}
              </p>
            )}
            {clinician.city && clinician.state && (
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <MapPin className="h-3 w-3" />
                {clinician.city}, {clinician.state}
              </p>
            )}
            {clinician.email && (
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Mail className="h-3 w-3" />
                {clinician.email}
              </p>
            )}
            {clinician.phone && (
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Phone className="h-3 w-3" />
                {clinician.phone}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Timeline Entry ──────────────────────────────────────────────────────────

interface TimelineEntry {
  event: string;
  date: string;
  description?: string;
  status?: ReferralStatus;
}

function TimelineItem({ entry, isLast }: { entry: TimelineEntry; isLast: boolean }) {
  const getIcon = () => {
    switch (entry.status) {
      case 'sent': return <Send className="h-3.5 w-3.5" />;
      case 'received': return <Send className="h-3.5 w-3.5" />;
      case 'accepted': return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'declined': return <XCircle className="h-3.5 w-3.5" />;
      case 'completed': return <CheckCircle2 className="h-3.5 w-3.5" />;
      default: return <Clock className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* Vertical line */}
      {!isLast && <div className="bg-border absolute left-[13px] top-6 h-full w-px" />}

      {/* Icon */}
      <div className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
        'bg-background',
        entry.status === 'accepted' || entry.status === 'completed'
          ? 'border-green-500/30 text-green-400'
          : entry.status === 'declined'
            ? 'border-red-500/30 text-red-400'
            : 'border-border text-muted-foreground',
      )}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-foreground text-sm font-medium">{entry.event}</p>
        <p className="text-muted-foreground text-xs">{formatDateTime(entry.date)}</p>
        {entry.description && (
          <p className="text-muted-foreground mt-1 text-xs italic">{entry.description}</p>
        )}
      </div>
    </div>
  );
}

// ── Communication Message ───────────────────────────────────────────────────

interface CommMessage {
  id: string;
  author: string;
  author_role: 'sender' | 'receiver';
  text: string;
  timestamp: string;
}

function CommBubble({ message }: { message: CommMessage }) {
  const isSender = message.author_role === 'sender';
  return (
    <div className={cn('flex', isSender ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
          isSender
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-accent text-accent-foreground rounded-bl-md',
        )}
      >
        <p className="text-xs font-medium opacity-80">{message.author}</p>
        <p className="mt-0.5 whitespace-pre-wrap break-words">{message.text}</p>
        <p className="mt-0.5 text-right text-[10px] opacity-60">
          {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────

export function ReferralDetail({
  referral,
  onBack,
  onAccept,
  onDecline,
  onReassign,
  onSendMessage,
  className,
}: ReferralDetailProps) {
  const [newMessage, setNewMessage] = useState('');
  const canRespond = referral.status === 'received' || referral.status === 'sent';

  // Mock communication thread (would come from API)
  const messages: CommMessage[] = [];

  // Build timeline
  const timeline: TimelineEntry[] = [
    { event: 'Referral Created', date: referral.created_at, status: 'draft' as ReferralStatus },
  ];
  if (referral.sent_at) {
    timeline.push({ event: 'Referral Sent', date: referral.sent_at, status: 'sent' as ReferralStatus });
  }
  if (referral.responded_at) {
    const statusLabel = referral.status === 'accepted' ? 'Accepted' : 'Declined';
    timeline.push({
      event: `Referral ${statusLabel}`,
      date: referral.responded_at,
      description: referral.response_notes ?? undefined,
      status: referral.status === 'accepted' ? 'accepted' : 'declined',
    });
  }
  if (referral.completed_at) {
    timeline.push({ event: 'Referral Completed', date: referral.completed_at, status: 'completed' as ReferralStatus });
  }

  const patient = referral.patient;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Back + Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-foreground text-xl font-bold">Referral Details</h1>
        </div>
        <StatusBadge status={referral.status} />
      </div>

      {/* Priority banner */}
      <PriorityBanner priority={referral.priority} />

      {/* Patient Info Summary */}
      <div className="border-border bg-card rounded-xl border p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4" />
            Patient Information
          </h2>
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-accent text-accent-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold">
            {patient
              ? `${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`
              : '??'}
          </div>
          <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Name</p>
              <p className="text-foreground font-medium">
                {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Date of Birth</p>
              <p className="text-foreground">
                {patient?.date_of_birth ? formatDate(patient.date_of_birth) : '—'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Age</p>
              <p className="text-foreground">
                {patient?.date_of_birth ? formatAge(patient.date_of_birth) : '—'}
              </p>
            </div>
            <div className="col-span-full">
              <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Diagnosis Codes</p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {referral.diagnosis_codes.length > 0 ? (
                  referral.diagnosis_codes.map((code) => (
                    <span
                      key={code}
                      className="border-border bg-accent/30 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                    >
                      {code}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-xs">None specified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="border-border bg-card rounded-xl border p-5">
        <h2 className="text-foreground mb-2 flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4" />
          Reason for Referral
        </h2>
        <p className="text-foreground text-sm leading-relaxed">{referral.reason}</p>
        {referral.clinical_notes && (
          <div className="mt-4">
            <h3 className="text-muted-foreground mb-1 text-[10px] font-medium uppercase tracking-wider">Clinical Notes</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{referral.clinical_notes}</p>
          </div>
        )}
      </div>

      {/* Providers grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ProviderCard clinician={referral.from_clinician} role="Referring" />
        <ProviderCard clinician={referral.to_clinician} role="Receiving" />
      </div>

      {/* Attachments */}
      {referral.attachments && referral.attachments.length > 0 && (
        <div className="border-border bg-card rounded-xl border p-5">
          <h2 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
            <Paperclip className="h-4 w-4" />
            Attachments
          </h2>
          <div className="space-y-2">
            {referral.attachments.map((att, idx) => (
              <div key={idx} className="border-border bg-accent/20 flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-accent/40">
                <FileText className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground flex-1 truncate text-sm">{att}</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground rounded-md p-1 text-xs font-medium transition-colors"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left column: Communication + Timeline */}
        <div className="space-y-6 lg:col-span-3">
          {/* Communication Thread */}
          <div className="border-border bg-card rounded-xl border">
            <div className="border-border flex items-center gap-2 border-b px-5 py-3">
              <MessageCircle className="text-foreground h-4 w-4" />
              <h2 className="text-foreground text-sm font-semibold">Communication</h2>
              <span className="text-muted-foreground ml-auto text-xs">{messages.length} messages</span>
            </div>

            <div className="space-y-3 p-4">
              {messages.length > 0 ? (
                messages.map((msg) => <CommBubble key={msg.id} message={msg} />)
              ) : (
                <div className="py-6 text-center">
                  <MessageCircle className="text-muted-foreground/30 mx-auto mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">No messages yet</p>
                  <p className="text-muted-foreground/60 text-xs">Use the input below to send a message to the other provider.</p>
                </div>
              )}
            </div>

            {/* Message input */}
            {canRespond && onSendMessage && (
              <div className="border-border flex items-center gap-2 border-t p-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={cn(
                    'border-input bg-background text-foreground placeholder:text-muted-foreground flex-1 rounded-lg border px-3 py-2 text-sm',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none transition-colors',
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      onSendMessage(referral.id, newMessage.trim());
                      setNewMessage('');
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!newMessage.trim()}
                  onClick={() => {
                    if (newMessage.trim()) {
                      onSendMessage(referral.id, newMessage.trim());
                      setNewMessage('');
                    }
                  }}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                    newMessage.trim()
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed',
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Timeline + Actions */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status Timeline */}
          <div className="border-border bg-card rounded-xl border p-5">
            <h2 className="text-foreground mb-4 flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4" />
              Status Timeline
            </h2>
            <div>
              {timeline.map((entry, idx) => (
                <TimelineItem key={idx} entry={entry} isLast={idx === timeline.length - 1} />
              ))}
            </div>
          </div>

          {/* Related Appointments */}
          <div className="border-border bg-card rounded-xl border p-5">
            <h2 className="text-foreground mb-2 flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4" />
              Related Appointments
            </h2>
            {referral.status === 'accepted' || referral.status === 'completed' ? (
              <div className="border-border bg-accent/20 rounded-lg border p-3 text-center">
                <Calendar className="text-muted-foreground mx-auto mb-1 h-5 w-5" />
                <p className="text-muted-foreground text-xs">
                  No appointments linked to this referral yet.
                </p>
                <button
                  type="button"
                  className="text-primary mt-2 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                >
                  <Calendar className="h-3 w-3" />
                  Schedule Appointment
                </button>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                Appointments will appear here once the referral is accepted.
              </p>
            )}
          </div>

          {/* Action buttons */}
          {(canRespond || referral.status === 'accepted') && (
            <div className="space-y-2">
              {canRespond && onAccept && (
                <button
                  type="button"
                  onClick={() => onAccept(referral.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-600"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Accept Referral
                </button>
              )}
              {canRespond && onDecline && (
                <button
                  type="button"
                  onClick={() => onDecline(referral.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 py-3 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <XCircle className="h-4 w-4" />
                  Decline Referral
                </button>
              )}
              {onReassign && (
                <button
                  type="button"
                  onClick={() => onReassign(referral.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
                >
                  <Repeat className="h-4 w-4" />
                  Reassign
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
