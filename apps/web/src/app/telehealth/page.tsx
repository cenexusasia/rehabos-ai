'use client';

import { useState, useMemo } from 'react';
import { Video, Loader2, Calendar, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { TelehealthSessionListItem, TelehealthSessionStatus } from '@/types/telehealth';
import { TELEHEALTH_STATUS_COLORS } from '@/types/telehealth';

export default function TelehealthPage() {
  const [filter, setFilter] = useState<TelehealthSessionStatus | 'all'>('all');

  const supabase = createClient() as any;
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['telehealth-sessions', filter],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let query = supabase
        .from('telehealth_sessions')
        .select(
          `id, appointment_id, patient_id, status, room_name, scheduled_at, started_at, duration_seconds, platform, meeting_url, created_at,
          patient:patient_id(id, first_name, last_name, phone, email, avatar_url)`,
        )
        .eq('clinician_id', user?.id ?? '')
        .order('scheduled_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as TelehealthSessionListItem[]) ?? [];
    },
  });

  const upcomingSessions = useMemo(
    () =>
      (sessions ?? []).filter(
        (s) => s.status === 'scheduled' || s.status === 'waiting',
      ),
    [sessions],
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">Telehealth</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage and join virtual patient sessions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Video className="text-primary h-5 w-5" />
            <span className="text-foreground text-sm font-medium">
              {upcomingSessions.length} upcoming
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            Upcoming Sessions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingSessions.map((session) => (
              <UpcomingSessionCard key={session.id} session={session} />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="mb-4 flex items-center gap-2">
        {(['all', 'scheduled', 'waiting', 'active', 'completed'] as const).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ),
        )}
      </div>

      {/* Sessions List */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          Failed to load telehealth sessions.
        </div>
      )}

      {!isLoading && !error && sessions && sessions.length === 0 && (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <Video className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
          <h3 className="text-foreground text-lg font-medium">No telehealth sessions</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Telehealth sessions will appear here when scheduled.
          </p>
        </div>
      )}

      {!isLoading && !error && sessions && sessions.length > 0 && (
        <div className="space-y-3">
          {(filter === 'all'
            ? sessions
            : sessions.filter((s) => s.status === filter)
          ).map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Upcoming Session Card ────────────────────────────────────────────────────

function UpcomingSessionCard({ session }: { session: TelehealthSessionListItem }) {
  const scheduledDate = new Date(session.scheduled_at);
  const isWithin15Min =
    scheduledDate.getTime() - Date.now() < 15 * 60 * 1000 &&
    scheduledDate.getTime() > Date.now();

  return (
    <Link
      href={`/telehealth/room/${session.id}`}
      className={cn(
        'border-border bg-card hover:border-primary/30 group relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all',
        isWithin15Min && 'border-emerald-500/30',
      )}
    >
      {isWithin15Min && (
        <div className="bg-emerald-500/10 absolute top-0 right-0 rounded-bl-lg px-2 py-0.5">
          <span className="text-emerald-400 text-[10px] font-medium">Ready to Join</span>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          {session.patient && (
            <p className="text-foreground text-sm font-medium">
              {session.patient.first_name} {session.patient.last_name}
            </p>
          )}
          <p className="text-muted-foreground mt-1 text-xs">
            {scheduledDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {scheduledDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
                TELEHEALTH_STATUS_COLORS[session.status as TelehealthSessionStatus] ??
                  'bg-muted text-muted-foreground',
              )}
            >
              {session.status}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isWithin15Min ? (
            <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium">
              <ExternalLink className="h-3 w-3" />
              Join
            </span>
          ) : (
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Session Row ──────────────────────────────────────────────────────────────

function SessionRow({ session }: { session: TelehealthSessionListItem }) {
  const scheduledDate = new Date(session.scheduled_at);
  const statusColor =
    TELEHEALTH_STATUS_COLORS[session.status as TelehealthSessionStatus] ??
    'bg-muted text-muted-foreground';

  return (
    <Link
      href={
        session.status === 'active' || session.status === 'waiting'
          ? `/telehealth/room/${session.id}`
          : '#'
      }
      className={cn(
        'border-border bg-card hover:border-primary/30 flex items-center gap-4 rounded-lg border p-4 transition-all',
        (session.status === 'active' || session.status === 'waiting') &&
          'border-emerald-500/20',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          session.status === 'active'
            ? 'bg-green-500/20'
            : session.status === 'cancelled' || session.status === 'missed'
              ? 'bg-red-500/10'
              : 'bg-muted',
        )}
      >
        <Video
          className={cn(
            'h-5 w-5',
            session.status === 'active'
              ? 'text-green-400'
              : session.status === 'cancelled' || session.status === 'missed'
                ? 'text-red-400'
                : 'text-muted-foreground',
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {session.patient && (
            <p className="text-foreground text-sm font-medium">
              {session.patient.first_name} {session.patient.last_name}
            </p>
          )}
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
              statusColor,
            )}
          >
            {session.status}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {scheduledDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {scheduledDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
          {session.duration_seconds && (
            <span>
              {Math.round(session.duration_seconds / 60)} min
            </span>
          )}
          <span className="text-muted-foreground/50 text-[10px]">
            {session.platform}
          </span>
        </div>
      </div>

      <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
    </Link>
  );
}
