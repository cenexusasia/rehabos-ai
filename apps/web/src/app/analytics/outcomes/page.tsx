'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  Activity,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────

interface ClinicianOutcome {
  id: string;
  name: string;
  totalPatients: number;
  averageImprovement: number;
  improvementRate: number;
  assessmentsCompleted: number;
}

interface TrendDataPoint {
  month: string;
  improvement: number;
  count: number;
}

// ── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_DIAGNOSIS_DATA: { diagnosis: string; improvement: number; patients: number }[] = [
  { diagnosis: 'ACL Reconstruction', improvement: 42, patients: 48 },
  { diagnosis: 'Rotator Cuff Repair', improvement: 38, patients: 35 },
  { diagnosis: 'Lumbar Radiculopathy', improvement: 31, patients: 52 },
  { diagnosis: 'Total Knee Arthroplasty', improvement: 45, patients: 62 },
  { diagnosis: 'Ankle Sprain', improvement: 52, patients: 41 },
  { diagnosis: 'Carpal Tunnel Syndrome', improvement: 28, patients: 29 },
  { diagnosis: 'Patellofemoral Pain', improvement: 36, patients: 33 },
  { diagnosis: 'Shoulder Impingement', improvement: 34, patients: 27 },
  { diagnosis: 'Hip Osteoarthritis', improvement: 30, patients: 22 },
  { diagnosis: 'Plantar Fasciitis', improvement: 44, patients: 19 },
];

const MOCK_TREND_DATA: TrendDataPoint[] = [
  { month: 'Jan', improvement: 32, count: 184 },
  { month: 'Feb', improvement: 35, count: 197 },
  { month: 'Mar', improvement: 34, count: 211 },
  { month: 'Apr', improvement: 38, count: 205 },
  { month: 'May', improvement: 36, count: 222 },
  { month: 'Jun', improvement: 41, count: 218 },
  { month: 'Jul', improvement: 39, count: 231 },
  { month: 'Aug', improvement: 43, count: 225 },
  { month: 'Sep', improvement: 40, count: 240 },
  { month: 'Oct', improvement: 42, count: 236 },
  { month: 'Nov', improvement: 44, count: 248 },
  { month: 'Dec', improvement: 45, count: 255 },
];

const MOCK_CLINICIANS: ClinicianOutcome[] = [
  { id: '1', name: 'Dr. Sarah Chen', totalPatients: 42, averageImprovement: 41.2, improvementRate: 78, assessmentsCompleted: 156 },
  { id: '2', name: 'Dr. Marcus Johnson', totalPatients: 38, averageImprovement: 37.8, improvementRate: 72, assessmentsCompleted: 134 },
  { id: '3', name: 'Dr. Emily Rodriguez', totalPatients: 45, averageImprovement: 39.5, improvementRate: 75, assessmentsCompleted: 148 },
  { id: '4', name: 'James Wilson, PT', totalPatients: 31, averageImprovement: 35.2, improvementRate: 68, assessmentsCompleted: 98 },
  { id: '5', name: 'Lisa Thompson, PT', totalPatients: 36, averageImprovement: 43.1, improvementRate: 81, assessmentsCompleted: 127 },
  { id: '6', name: 'David Park, PT', totalPatients: 28, averageImprovement: 33.6, improvementRate: 64, assessmentsCompleted: 89 },
];

const DIAGNOSIS_OPTIONS = ['All', ...MOCK_DIAGNOSIS_DATA.map((d) => d.diagnosis)];
const CLINICIAN_OPTIONS = ['All', ...MOCK_CLINICIANS.map((c) => c.name)];

// ── Stats Card ─────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  trend,
  trendLabel,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sublabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('border-border bg-card rounded-xl border p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {label}
            </p>
            <p className="text-foreground mt-1 text-2xl font-bold">{value}</p>
          </div>
        </div>
        {trend && trendLabel && (
          <div
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
              trend === 'up' && 'bg-emerald-500/10 text-emerald-400',
              trend === 'down' && 'bg-destructive/10 text-destructive',
              trend === 'neutral' && 'bg-muted text-muted-foreground',
            )}
          >
            {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
            {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
            {trend === 'neutral' && <Minus className="h-3 w-3" />}
            {trendLabel}
          </div>
        )}
      </div>
      {sublabel && (
        <p className="text-muted-foreground mt-2 text-xs">{sublabel}</p>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function OutcomesDashboardPage() {
  const [dateRange, setDateRange] = useState('6m');
  const [diagnosisFilter, setDiagnosisFilter] = useState('All');
  const [clinicianFilter, setClinicianFilter] = useState('All');

  const filteredClinicians = useMemo(() => {
    return clinicianFilter === 'All'
      ? MOCK_CLINICIANS
      : MOCK_CLINICIANS.filter((c) => c.name === clinicianFilter);
  }, [clinicianFilter]);

  const filteredDiagnosisData = useMemo(() => {
    return diagnosisFilter === 'All'
      ? MOCK_DIAGNOSIS_DATA
      : MOCK_DIAGNOSIS_DATA.filter((d) => d.diagnosis === diagnosisFilter);
  }, [diagnosisFilter]);

  const handleExportCSV = useCallback(() => {
    const headers = ['Clinician', 'Patients', 'Avg Improvement', 'Improvement Rate', 'Assessments'];
    const rows = MOCK_CLINICIANS.map((c) =>
      [c.name, c.totalPatients, c.averageImprovement.toFixed(1), `${c.improvementRate}%`, c.assessmentsCompleted].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'outcomes-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const overallImprovement = useMemo(() => {
    const total = MOCK_DIAGNOSIS_DATA.reduce((sum, d) => sum + d.improvement * d.patients, 0);
    const count = MOCK_DIAGNOSIS_DATA.reduce((sum, d) => sum + d.patients, 0);
    return (total / count).toFixed(1);
  }, []);

  const completedRate = useMemo(() => {
    const completed = MOCK_TREND_DATA.reduce((sum, d) => sum + d.count, 0);
    return Math.round((completed / (completed + 150)) * 100);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Outcomes Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track patient outcome measures, improvement trends, and clinician performance.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="border-border bg-card flex flex-wrap items-center gap-3 rounded-xl border p-4">
        <Filter className="text-muted-foreground h-4 w-4" />
        <div className="flex items-center gap-1.5">
          <Calendar className="text-muted-foreground h-3.5 w-3.5" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-background text-foreground rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div className="text-muted-foreground hidden text-xs sm:block">|</div>
        <select
          value={diagnosisFilter}
          onChange={(e) => setDiagnosisFilter(e.target.value)}
          className="bg-background text-foreground rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
        >
          {DIAGNOSIS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'All' ? 'All Diagnoses' : opt}
            </option>
          ))}
        </select>
        <div className="text-muted-foreground hidden text-xs sm:block">|</div>
        <select
          value={clinicianFilter}
          onChange={(e) => setClinicianFilter(e.target.value)}
          className="bg-background text-foreground rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
        >
          {CLINICIAN_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'All' ? 'All Clinicians' : opt}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Average Improvement"
          value={`${overallImprovement}%`}
          sublabel="Across all outcome measures"
          trend="up"
          trendLabel="+3.2% vs prev"
        />
        <StatCard
          icon={Activity}
          label="Completion Rate"
          value={`${completedRate}%`}
          sublabel="Outcome measures completed"
          trend="neutral"
          trendLabel="Stable"
        />
        <StatCard
          icon={Users}
          label="Active Patients"
          value="184"
          sublabel="With tracked outcomes"
          trend="up"
          trendLabel="+12 this month"
        />
        <StatCard
          icon={FileText}
          label="Assessments Total"
          value="2,847"
          sublabel="Completed this period"
          trend="up"
          trendLabel="+8.5%"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Average Improvement by Diagnosis */}
        <div className="border-border bg-card rounded-xl border p-5">
          <h3 className="text-foreground mb-1 text-sm font-semibold">
            Average Improvement by Diagnosis
          </h3>
          <p className="text-muted-foreground mb-4 text-xs">
            Mean percentage improvement per diagnosis group
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredDiagnosisData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="diagnosis"
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  width={130}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={(value: number, _name: string) => [`${value}%`, 'Improvement']}
                />
                <Bar
                  dataKey="improvement"
                  fill="var(--primary)"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                  label={{
                    position: 'right',
                    fontSize: 10,
                    fill: 'var(--muted-foreground)',
                    formatter: (v: number) => `${v}%`,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outcome Trends Over Time */}
        <div className="border-border bg-card rounded-xl border p-5">
          <h3 className="text-foreground mb-1 text-sm font-semibold">
            Outcome Trends Over Time
          </h3>
          <p className="text-muted-foreground mb-4 text-xs">
            Monthly average improvement and assessment volume
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={MOCK_TREND_DATA}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="improvement"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--primary)' }}
                  name="Avg Improvement (%)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="count"
                  stroke="var(--chart-2, #22d3ee)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--chart-2, #22d3ee)' }}
                  name="Assessments"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Clinician Performance Table */}
      <div className="border-border bg-card rounded-xl border">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-foreground text-sm font-semibold">
              Outcome Measures by Clinician
            </h3>
            <p className="text-muted-foreground text-xs">
              Average improvement and completion metrics per clinician
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b border-border text-xs font-medium uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Clinician</th>
                <th className="px-5 py-3 text-right">Patients</th>
                <th className="px-5 py-3 text-right">Avg Improvement</th>
                <th className="px-5 py-3 text-right">Improvement Rate</th>
                <th className="px-5 py-3 text-right">Assessments</th>
                <th className="px-5 py-3 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClinicians.map((clinician) => (
                <tr
                  key={clinician.id}
                  className="hover:bg-accent/20 transition-colors"
                >
                  <td className="text-foreground px-5 py-3 font-medium">
                    {clinician.name}
                  </td>
                  <td className="text-foreground px-5 py-3 text-right">
                    {clinician.totalPatients}
                  </td>
                  <td className="text-foreground px-5 py-3 text-right font-medium">
                    {clinician.averageImprovement.toFixed(1)}%
                  </td>
                  <td
                    className={cn(
                      'px-5 py-3 text-right font-medium',
                      clinician.improvementRate >= 75
                        ? 'text-emerald-400'
                        : clinician.improvementRate >= 60
                          ? 'text-amber-400'
                          : 'text-destructive',
                    )}
                  >
                    {clinician.improvementRate}%
                  </td>
                  <td className="text-foreground px-5 py-3 text-right">
                    {clinician.assessmentsCompleted}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-medium',
                        clinician.averageImprovement >= 40
                          ? 'text-emerald-400'
                          : clinician.averageImprovement >= 35
                            ? 'text-amber-400'
                            : 'text-destructive',
                      )}
                    >
                      {clinician.averageImprovement >= 40 ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : clinician.averageImprovement >= 35 ? (
                        <Minus className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      {clinician.averageImprovement >= 40
                        ? 'Above Avg'
                        : clinician.averageImprovement >= 35
                          ? 'Average'
                          : 'Needs Review'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
