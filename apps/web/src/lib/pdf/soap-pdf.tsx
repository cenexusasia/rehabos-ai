import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ── Types ───────────────────────────────────────────────────────────────────

export interface SoapPdfData {
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicFax?: string;
  patientName: string;
  patientDob?: string;
  patientMrn?: string;
  visitDate?: string;
  clinicianName?: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  signedBy?: string;
  signedAt?: string;
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 60,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  // ── Clinic header ──
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 12,
  },
  clinicName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    marginBottom: 2,
  },
  clinicDetails: {
    fontSize: 8,
    color: '#6b7280',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  // ── Title ──
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  visitDate: {
    fontSize: 9,
    color: '#6b7280',
  },
  // ── Patient info block ──
  patientInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  patientField: {
    fontSize: 9,
    color: '#374151',
  },
  patientLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  patientValue: {
    fontSize: 9,
  },
  // ── Sections ──
  section: {
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionBody: {
    paddingHorizontal: 8,
    fontSize: 9,
    color: '#374151',
  },
  // ── Colors per section ──
  sHeader: { borderLeftColor: '#3b82f6', backgroundColor: '#eff6ff' },
  sLabel: { color: '#2563eb' },
  oHeader: { borderLeftColor: '#22c55e', backgroundColor: '#f0fdf4' },
  oLabel: { color: '#16a34a' },
  aHeader: { borderLeftColor: '#f59e0b', backgroundColor: '#fffbeb' },
  aLabel: { color: '#d97706' },
  pHeader: { borderLeftColor: '#a855f7', backgroundColor: '#faf5ff' },
  pLabel: { color: '#9333ea' },
  // ── Signature block ──
  signatureBlock: {
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  signatureLine: {
    width: 200,
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
    paddingBottom: 2,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
  },
  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
  },
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ── SOAP PDF Document ───────────────────────────────────────────────────────

export function SoapPdfDocument({ data }: { data: SoapPdfData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Clinic header */}
        <View style={styles.header}>
          <Text style={styles.clinicName}>{data.clinicName ?? 'RehabOS Clinic'}</Text>
          <View style={styles.clinicDetails}>
            {data.clinicAddress && <Text>{data.clinicAddress}</Text>}
            {data.clinicPhone && <Text>{data.clinicPhone}</Text>}
            {data.clinicFax && <Text>Fax: {data.clinicFax}</Text>}
          </View>
        </View>

        {/* Title + visit date */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>SOAP Progress Note</Text>
          {data.visitDate && <Text style={styles.visitDate}>Visit: {formatDate(data.visitDate)}</Text>}
        </View>

        {/* Patient info */}
        <View style={styles.patientInfo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.patientLabel}>Patient</Text>
            <Text style={styles.patientValue}>{data.patientName}</Text>
          </View>
          {data.patientDob && (
            <View style={{ flex: 1 }}>
              <Text style={styles.patientLabel}>DOB</Text>
              <Text style={styles.patientValue}>{formatDate(data.patientDob)}</Text>
            </View>
          )}
          {data.patientMrn && (
            <View style={{ flex: 1 }}>
              <Text style={styles.patientLabel}>MRN</Text>
              <Text style={styles.patientValue}>{data.patientMrn}</Text>
            </View>
          )}
          {data.clinicianName && (
            <View style={{ flex: 1 }}>
              <Text style={styles.patientLabel}>Clinician</Text>
              <Text style={styles.patientValue}>{data.clinicianName}</Text>
            </View>
          )}
        </View>

        {/* S — Subjective */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, styles.sHeader]}>
            <Text style={[styles.sectionLabel, styles.sLabel]}>S — Subjective</Text>
          </View>
          <Text style={styles.sectionBody}>
            {stripHtml(data.subjective) || 'No content recorded.'}
          </Text>
        </View>

        {/* O — Objective */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, styles.oHeader]}>
            <Text style={[styles.sectionLabel, styles.oLabel]}>O — Objective</Text>
          </View>
          <Text style={styles.sectionBody}>
            {stripHtml(data.objective) || 'No content recorded.'}
          </Text>
        </View>

        {/* A — Assessment */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, styles.aHeader]}>
            <Text style={[styles.sectionLabel, styles.aLabel]}>A — Assessment</Text>
          </View>
          <Text style={styles.sectionBody}>
            {stripHtml(data.assessment) || 'No content recorded.'}
          </Text>
        </View>

        {/* P — Plan */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, styles.pHeader]}>
            <Text style={[styles.sectionLabel, styles.pLabel]}>P — Plan</Text>
          </View>
          <Text style={styles.sectionBody}>
            {stripHtml(data.plan) || 'No content recorded.'}
          </Text>
        </View>

        {/* Signature block */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureRow}>
            <View>
              <Text style={styles.signatureLabel}>Clinician Signature</Text>
              <Text style={styles.signatureLine}>
                {data.signedBy ? data.signedBy : '_________________________'}
              </Text>
            </View>
            {data.signedAt && (
              <View>
                <Text style={styles.signatureLabel}>Date</Text>
                <Text style={styles.signatureLine}>{formatDate(data.signedAt)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated by RehabOS</Text>
          <Text>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
          <Text>Page {1}</Text>
        </View>
      </Page>
    </Document>
  );
}
