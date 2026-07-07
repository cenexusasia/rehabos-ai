'use client';

import type { Patient } from '@/types/patient';

interface PatientQuickStatsProps {
  patient: Patient;
  visitCount: number;
  activeHepCount: number;
  pendingAssessmentCount: number;
  outstandingBalance: number;
}

export function PatientQuickStats({
  visitCount,
  activeHepCount,
  pendingAssessmentCount,
  outstandingBalance,
}: PatientQuickStatsProps) {
  const stats = [
    { label: 'Total Visits', value: visitCount },
    { label: 'Active HEPs', value: activeHepCount },
    { label: 'Pending Assessments', value: pendingAssessmentCount },
    { label: 'Outstanding Balance', value: `$${outstandingBalance.toFixed(0)}` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-card p-3 text-center"
        >
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
