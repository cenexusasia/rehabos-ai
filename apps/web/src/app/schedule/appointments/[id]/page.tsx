'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  FileText,
  User,
  Phone as PhoneIcon,
  Mail,
  Edit2,
  XCircle,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useAppointment, useCancelAppointment, formatTime, formatDate } from '@/hooks/use-appointments';
import type { AppointmentType, AppointmentStatus } from '@/types/appointment';
import {
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_TYPE_COLORS,
  APPOINTMENT_STATUS_COLORS,
} from '@/types/appointment';

export const dynamic = 'force-dynamic';

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: appointment, isLoading, error } = useAppointment(id);
  const cancelMutation = useCancelAppointment();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({ id, cancellation_reason: cancelReason });
      setShowCancelDialog(false);
      router.refresh();
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-400" />
          <p className="text-red-400 font-medium">Appointment not found</p>
          <p className="text-muted-foreground mt-1 text-sm">
            This appointment may have been deleted or you may not have access.
          </p>
          <Link
            href="/schedule"
            className="mt-4 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schedule
          </Link>
        </div>
      </div>
    );
  }

  const typeColor =
    APPOINTMENT_TYPE_COLORS[appointment.appointment_type as AppointmentType] ??
    'bg-muted text-muted-foreground';
  const statusColor =
    APPOINTMENT_STATUS_COLORS[appointment.status as AppointmentStatus] ??
    'bg-muted text-muted-foreground';

  const isPast = new Date(appointment.end_time) < new Date();
  const isUpcoming = new Date(appointment.start_time) > new Date();
  const isCancellable =
    appointment.status !== 'cancelled' &&
    appointment.status !== 'completed' &&
    isUpcoming;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  typeColor,
                )}
              >
                {APPOINTMENT_TYPE_LABELS[appointment.appointment_type as AppointmentType] ??
                  appointment.appointment_type}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
                  statusColor,
                )}
              >
                {appointment.status.replace('_', ' ')}
              </span>
              {isPast && (
                <span className="text-muted-foreground inline-flex items-center gap-1 rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Past
                </span>
              )}
            </div>
            <h1 className="text-foreground mt-3 text-2xl font-bold">
              {appointment.title ??
                `${APPOINTMENT_TYPE_LABELS[appointment.appointment_type as AppointmentType] ?? 'Appointment'}`}
            </h1>
          </div>

          {isCancellable && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/schedule/appointments/${id}/edit`)}
                className="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => setShowCancelDialog(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Date & Time */}
          <div className="border-border bg-card rounded-xl border p-5">
            <h2 className="text-foreground mb-3 text-sm font-semibold">Date & Time</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="text-primary h-4 w-4" />
                <span className="text-foreground">{formatDate(appointment.start_time)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="text-primary h-4 w-4" />
                <span className="text-foreground">
                  {formatTime(appointment.start_time)} – {formatTime(appointment.end_time)}
                </span>
              </div>
              <p className="text-muted-foreground ml-7 text-xs">
                Duration: {appointment.duration_minutes} minutes
              </p>
            </div>
          </div>

          {/* Location / Telehealth */}
          {appointment.location || appointment.telehealth_url ? (
            <div className="border-border bg-card rounded-xl border p-5">
              <h2 className="text-foreground mb-3 text-sm font-semibold">Location</h2>
              {appointment.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="text-primary h-4 w-4" />
                  <span className="text-foreground">{appointment.location}</span>
                </div>
              )}
              {appointment.telehealth_url && (
                <div className="mt-2 flex items-center gap-3">
                  <Video className="text-cyan-400 h-4 w-4" />
                  <a
                    href={appointment.telehealth_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-400 underline hover:text-cyan-300"
                  >
                    Join Telehealth Session
                  </a>
                </div>
              )}
            </div>
          ) : null}

          {/* Notes */}
          {appointment.notes && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h2 className="text-foreground mb-3 text-sm font-semibold">Notes</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                {appointment.notes}
              </p>
            </div>
          )}

          {/* Description */}
          {appointment.description && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h2 className="text-foreground mb-3 text-sm font-semibold">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                {appointment.description}
              </p>
            </div>
          )}

          {/* Cancellation Reason */}
          {appointment.cancellation_reason && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-400">
                <AlertTriangle className="h-4 w-4" />
                Cancellation Reason
              </h2>
              <p className="text-muted-foreground text-sm">
                {appointment.cancellation_reason}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Info */}
          {appointment.patient && (
            <div className="border-border bg-card rounded-xl border p-5">
              <h2 className="text-foreground mb-3 text-sm font-semibold">Patient</h2>
              <div className="space-y-3">
                <Link
                  href={`/patients/${appointment.patient.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="bg-accent flex h-10 w-10 items-center justify-center rounded-full">
                    <User className="text-muted-foreground h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-foreground group-hover:text-primary text-sm font-medium transition-colors">
                      {appointment.patient.first_name} {appointment.patient.last_name}
                    </p>
                    <p className="text-muted-foreground text-xs">View Profile</p>
                  </div>
                </Link>
                {appointment.patient.phone && (
                  <a
                    href={`tel:${appointment.patient.phone}`}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
                  >
                    <PhoneIcon className="h-3.5 w-3.5" />
                    {appointment.patient.phone}
                  </a>
                )}
                {appointment.patient.email && (
                  <a
                    href={`mailto:${appointment.patient.email}`}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {appointment.patient.email}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="border-border bg-card rounded-xl border p-5">
            <h2 className="text-foreground mb-3 text-sm font-semibold">Actions</h2>
            <div className="space-y-2">
              <Link
                href={appointment.patient ? `/patients/${appointment.patient.id}` : '#'}
                className="hover:bg-accent text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
              >
                <User className="h-4 w-4" />
                View Patient
              </Link>
              {appointment.patient && (
                <Link
                  href={`/messages?patientId=${appointment.patient.id}`}
                  className="hover:bg-accent text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Send Message
                </Link>
              )}
              {appointment.telehealth_url && (
                <a
                  href={appointment.telehealth_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-accent text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <Video className="h-4 w-4" />
                  Join Telehealth
                </a>
              )}
              <Link
                href={`/visits/new?patientId=${appointment.patient_id}&from=appointment`}
                className="hover:bg-accent text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
              >
                <FileText className="h-4 w-4" />
                Create Visit Note
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="border-border bg-card mx-4 w-full max-w-md rounded-xl border p-6 shadow-lg">
            <h3 className="text-foreground text-lg font-semibold">Cancel Appointment</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div className="mt-4">
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                Reason (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Patient requested cancellation, scheduling conflict, etc."
                className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
