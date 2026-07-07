'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Clock,
  Calendar,
  User,
  ExternalLink,
  Video,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { VideoRoom } from '@/components/telehealth/video-room';
import type { TelehealthSession, TelehealthSessionStatus } from '@/types/telehealth';
import { TELEHEALTH_STATUS_COLORS } from '@/types/telehealth';

export default function TelehealthRoomPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [hasJoined, setHasJoined] = useState(false);

  const supabase = createClient() as any;
  const { data: session, isLoading, error } = useQuery({
    queryKey: ['telehealth-session', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telehealth_sessions')
        .select(
          `*,
          patient:patient_id(id, first_name, last_name, phone, email, avatar_url),
          appointment:appointment_id(id, appointment_type, start_time, end_time)`,
        )
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as TelehealthSession;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-400" />
          <p className="text-red-400 font-medium">Session not found</p>
          <p className="text-muted-foreground mt-1 text-sm">
            This telehealth session may have been deleted or you may not have access.
          </p>
          <Link
            href="/telehealth"
            className="mt-4 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Telehealth
          </Link>
        </div>
      </div>
    );
  }

  const scheduledDate = new Date(session.scheduled_at);
  const patientName = session.patient
    ? `${session.patient.first_name} ${session.patient.last_name}`
    : 'Patient';

  const preJoinInfo = {
    patientName,
    appointmentType: session.appointment?.appointment_type ?? 'telehealth',
    scheduledTime: scheduledDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    duration: session.appointment
      ? Math.round(
          (new Date(session.appointment.end_time).getTime() -
            new Date(session.appointment.start_time).getTime()) /
            60000,
        )
      : 30,
  };

  // If joined, show the video room
  if (hasJoined) {
    return (
      <div className="flex h-full flex-col">
        {/* Video Room Header */}
        <div className="border-border bg-card flex items-center justify-between border-b px-4 py-2">
          <button
            onClick={() => {
              setHasJoined(false);
              router.refresh();
            }}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Leave Room
          </button>
          <span className="text-foreground text-sm font-medium">
            Telehealth Session
          </span>
          <span className="text-muted-foreground text-xs">{session.room_name}</span>
        </div>
        <VideoRoom
          roomName={session.room_name}
          patientName={patientName}
          userName="Clinician"
          onEndCall={() => {
            setHasJoined(false);
            router.push('/telehealth');
          }}
          className="flex-1"
        />
      </div>
    );
  }

  // Pre-join screen
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center px-6 py-8">
      <div className="w-full">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Pre-Join Card */}
        <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Video className="text-primary h-8 w-8" />
            </div>
            <h1 className="text-foreground text-xl font-bold">Join Telehealth Session</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              You are about to start a video call with your patient.
            </p>
          </div>

          {/* Session Info */}
          <div className="border-border mb-6 space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-accent flex h-10 w-10 items-center justify-center rounded-full">
                <User className="text-muted-foreground h-5 w-5" />
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">{patientName}</p>
                <p className="text-muted-foreground text-xs">Patient</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="text-primary h-4 w-4" />
              <span className="text-foreground">
                {scheduledDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="text-primary h-4 w-4" />
              <span className="text-foreground">
                {preJoinInfo.scheduledTime} · {preJoinInfo.duration} minutes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
                  TELEHEALTH_STATUS_COLORS[session.status as TelehealthSessionStatus] ??
                    'bg-muted text-muted-foreground',
                )}
              >
                {session.status}
              </span>
              <span className="text-muted-foreground text-xs">{session.platform}</span>
            </div>
          </div>

          {/* Room Info */}
          <div className="border-border mb-6 rounded-lg border p-4">
            <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">
              Room Name
            </p>
            <p className="text-foreground font-mono text-sm">{session.room_name}</p>
            {session.meeting_url && (
              <a
                href={session.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1 text-xs transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Open meeting URL directly
              </a>
            )}
          </div>

          {/* Join Button */}
          <button
            onClick={() => setHasJoined(true)}
            className={cn(
              'bg-primary text-primary-foreground inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold',
              'hover:bg-primary/90 transition-colors',
              'focus:ring-primary focus:ring-offset-background focus:ring-2 focus:ring-offset-2 focus:outline-none',
            )}
          >
            <Video className="h-5 w-5" />
            Join Session
          </button>

          <p className="text-muted-foreground mt-4 text-center text-xs">
            By joining, you agree to the telehealth terms of service.
            Ensure you have a stable internet connection and a quiet environment.
          </p>
        </div>

        {/* Tips */}
        <div className="border-border bg-card/50 mt-4 rounded-lg border p-4">
          <h3 className="text-foreground mb-2 text-sm font-medium">Tips for a successful session</h3>
          <ul className="text-muted-foreground list-inside list-disc space-y-1 text-xs">
            <li>Ensure you are in a well-lit room for better video quality</li>
            <li>Use a headset or earphones to reduce echo and background noise</li>
            <li>Close unnecessary browser tabs to conserve bandwidth</li>
            <li>Test your camera and microphone before the session</li>
            <li>Have the patient&apos;s records ready for reference</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
