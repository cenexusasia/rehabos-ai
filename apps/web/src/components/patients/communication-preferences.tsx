'use client';

import { usePatient } from '@/hooks/use-patients';

export function CommunicationPreferences({ patientId }: { patientId: string }) {
  const { data: patient } = usePatient(patientId);

  if (!patient) return null;

  const settings = (patient as any).settings ?? {};
  const prefs: Record<string, string[]> = settings.communication ?? {
    appointments: ['email'],
    billing: ['email'],
    exercises: ['push'],
    marketing: [],
  };

  const channelLabels: Record<string, string> = {
    email: 'Email',
    sms: 'SMS',
    push: 'Push Notification',
    phone: 'Phone Call',
    mail: 'Postal Mail',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Communication Preferences</h3>
      {Object.entries(prefs).map(([topic, channels]) => (
        <div key={topic} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <span className="text-sm capitalize text-foreground">{topic}</span>
          <div className="flex gap-2">
            {(channels as string[]).length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              (channels as string[]).map((ch) => (
                <span
                  key={ch}
                  className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {channelLabels[ch] || ch}
                </span>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
