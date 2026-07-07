// ── Types ──────────────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface RiskStratificationInput {
  /** Patient age in years */
  age: number;
  /** List of active comorbidities (ICD-10 codes or condition names) */
  comorbidities: string[];
  /** Number of falls in the past 6 months */
  fallHistoryCount: number;
  /** Number of distinct medications currently prescribed */
  medicationCount: number;
  /** Number of hospitalizations in the past 12 months */
  previousHospitalizations: number;
  /** Functional assessment scores (e.g., Berg Balance, FMA, DASH) */
  functionalScores?: Record<string, number>;
  /** Whether the patient lives alone */
  livesAlone?: boolean;
  /** Cognitive status */
  cognitiveStatus?: 'intact' | 'mild-impairment' | 'moderate-impairment' | 'severe-impairment';
  /** SARC-F score (sarcopenia screening 0-10) */
  sarcFRisk?: number;
}

export interface RiskFactor {
  factor: string;
  severity: 'high' | 'medium' | 'low';
  detail: string;
}

export interface RiskStratificationResult {
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors: RiskFactor[];
  recommendations: string[];
}

// ── Configuration (adjustable thresholds) ──────────────────────────────────

export interface RiskThresholds {
  /** Score above which patient is 'critical' (default: 80) */
  critical: number;
  /** Score above which patient is 'high' (default: 60) */
  high: number;
  /** Score above which patient is 'moderate' (default: 30) */
  moderate: number;
  /** Maximum age considered to add age risk (default: 65) */
  ageRiskThreshold: number;
  /** Age above which maximum age-risk points are assigned (default: 85) */
  ageMaxThreshold: number;
  /** Fall count considered high risk (default: 2) */
  fallHighThreshold: number;
  /** Medication count considered polypharmacy risk (default: 5) */
  polypharmacyThreshold: number;
  /** Hospitalization count considered high risk (default: 2) */
  hospitalizationHighThreshold: number;
}

export const DEFAULT_THRESHOLDS: RiskThresholds = {
  critical: 80,
  high: 60,
  moderate: 30,
  ageRiskThreshold: 65,
  ageMaxThreshold: 85,
  fallHighThreshold: 2,
  polypharmacyThreshold: 5,
  hospitalizationHighThreshold: 2,
};

// ── Comorbidity risk weights ────────────────────────────────────────────────

const COMORBIDITY_RISK: Record<string, number> = {
  // Cardiovascular
  'heart failure': 15,
  'myocardial infarction': 12,
  'coronary artery disease': 8,
  'peripheral vascular disease': 6,
  'atrial fibrillation': 8,
  'hypertension': 3,
  'stroke': 15,
  'cerebrovascular accident': 15,
  'chronic venous insufficiency': 4,

  // Neurological
  'parkinson disease': 15,
  'parkinsons disease': 15,
  'dementia': 15,
  'alzheimer disease': 12,
  'multiple sclerosis': 12,
  'spinal cord injury': 18,
  'peripheral neuropathy': 8,
  'cerebral palsy': 10,

  // Musculoskeletal
  'osteoporosis': 6,
  'osteoarthritis': 4,
  'rheumatoid arthritis': 8,
  'hip fracture': 12,
  'joint replacement': 4,
  'fracture': 8,
  'sarcopenia': 10,

  // Metabolic / Endocrine
  'diabetes mellitus type 2': 6,
  'diabetes': 6,
  'obesity': 5,
  'chronic kidney disease': 8,
  'renal failure': 10,

  // Respiratory
  'copd': 8,
  'chronic obstructive pulmonary disease': 8,
  'asthma': 3,
  'pneumonia': 5,

  // Other
  'depression': 6,
  'anxiety': 3,
  'cancer': 10,
  'anemia': 4,
  'visual impairment': 5,
  'hearing loss': 3,
  'history of falls': 10,
  'frailty': 15,
  'urinary incontinence': 5,
  'chronic pain': 6,
  'insomnia': 3,
};

// ── Scoring helpers ─────────────────────────────────────────────────────────

function scoreAge(age: number, thresholds: RiskThresholds): number {
  if (age < thresholds.ageRiskThreshold) return 0;
  if (age >= thresholds.ageMaxThreshold) return 15;
  // Linear interpolation 65→85: 0→15 points
  const ratio = (age - thresholds.ageRiskThreshold) / (thresholds.ageMaxThreshold - thresholds.ageRiskThreshold);
  return Math.round(ratio * 15);
}

function scoreComorbidities(comorbidities: string[]): number {
  let score = 0;
  const matched: string[] = [];

  for (const condition of comorbidities) {
    const lower = condition.toLowerCase().trim();
    let matchedWeight = 0;

    // Try exact match first, then substring matching
    if (COMORBIDITY_RISK[lower]) {
      matchedWeight = COMORBIDITY_RISK[lower];
    } else {
      for (const [key, weight] of Object.entries(COMORBIDITY_RISK)) {
        if (lower.includes(key) || key.includes(lower)) {
          matchedWeight = Math.max(matchedWeight, weight);
        }
      }
    }

    if (matchedWeight > 0 && !matched.includes(lower)) {
      score += matchedWeight;
      matched.push(lower);
    } else if (matchedWeight === 0) {
      // Unmatched comorbidity — assign a default risk
      score += 3;
    }
  }

  return Math.min(score, 50); // cap comorbidity score at 50
}

function scoreFalls(fallCount: number, thresholds: RiskThresholds): number {
  if (fallCount <= 0) return 0;
  if (fallCount === 1) return 10;
  if (fallCount >= thresholds.fallHighThreshold) return 20;
  return fallCount * 10;
}

function scoreMedications(count: number, thresholds: RiskThresholds): number {
  if (count <= 2) return 0;
  if (count < thresholds.polypharmacyThreshold) return 5;
  // 5+ meds = polypharmacy
  return Math.min(10 + (count - thresholds.polypharmacyThreshold) * 2, 20);
}

function scoreHospitalizations(count: number, thresholds: RiskThresholds): number {
  if (count === 0) return 0;
  if (count === 1) return 10;
  if (count >= thresholds.hospitalizationHighThreshold) return 25;
  return count * 10;
}

function scoreFunctionalScores(scores?: Record<string, number>): number {
  if (!scores || Object.keys(scores).length === 0) return 0;

  let risk = 0;
  let count = 0;

  // Generic logic: lower functional scores = higher risk
  for (const [name, value] of Object.entries(scores)) {
    const lower = name.toLowerCase();

    // Berg Balance Test: 0-56, lower = higher fall risk
    if (lower.includes('berg') || lower.includes('balance')) {
      if (value <= 20) risk += 20; // high fall risk
      else if (value <= 40) risk += 10; // medium fall risk
      else if (value <= 50) risk += 5;
    }
    // FMA-UE / FMA-LE: 0-66/0-34, lower = more impairment
    else if (lower.includes('fma') || lower.includes('fugl')) {
      if (value <= 20) risk += 15;
      else if (value <= 40) risk += 8;
      else if (value <= 55) risk += 3;
    }
    // DASH: 0-100, higher = more disability
    else if (lower.includes('dash') || lower.includes('quickdash')) {
      if (value >= 70) risk += 15;
      else if (value >= 40) risk += 8;
      else if (value >= 20) risk += 3;
    }
    // General: assume lower is worse (0-100 scale)
    else {
      if (value <= 20) risk += 15;
      else if (value <= 40) risk += 8;
      else if (value <= 60) risk += 3;
    }
    count++;
  }

  return count > 0 ? Math.round(risk / count) : 0;
}

function scoreLivesAlone(livesAlone?: boolean): number {
  return livesAlone ? 8 : 0;
}

function scoreCognitiveStatus(status?: string): number {
  switch (status) {
    case 'severe-impairment':
      return 20;
    case 'moderate-impairment':
      return 12;
    case 'mild-impairment':
      return 5;
    default:
      return 0;
  }
}

function scoreSarcFRisk(sarcFRisk?: number): number {
  if (sarcFRisk === undefined) return 0;
  // SARC-F >= 4 indicates sarcopenia risk
  if (sarcFRisk >= 8) return 15;
  if (sarcFRisk >= 4) return 10;
  return sarcFRisk * 2;
}

// ── Risk factor builder ─────────────────────────────────────────────────────

function buildRiskFactors(
  input: RiskStratificationInput,
  thresholds: RiskThresholds,
  componentScores: Record<string, number>,
): RiskFactor[] {
  const factors: RiskFactor[] = [];

  if (input.age >= thresholds.ageRiskThreshold) {
    factors.push({
      factor: 'Advanced Age',
      severity: input.age >= thresholds.ageMaxThreshold ? 'high' : 'medium',
      detail: `Patient is ${input.age} years old (${input.age >= thresholds.ageMaxThreshold ? '≥85 = maximum risk' : `${thresholds.ageRiskThreshold}–${thresholds.ageMaxThreshold - 1} = moderate risk`})`,
    });
  }

  const comorbidityScore = componentScores.comorbidities ?? 0;
  if (comorbidityScore > 0) {
    const matched = input.comorbidities.filter((c) => {
      const lower = c.toLowerCase();
      return Object.keys(COMORBIDITY_RISK).some((key) => lower.includes(key) || key.includes(lower));
    });
    factors.push({
      factor: 'Comorbidities',
      severity: comorbidityScore >= 25 ? 'high' : comorbidityScore >= 10 ? 'medium' : 'low',
      detail: `${input.comorbidities.length} comorbidit${input.comorbidities.length === 1 ? 'y' : 'ies'} identified${matched.length > 0 ? ` (e.g., ${matched.slice(0, 3).join(', ')})` : ''}`,
    });
  }

  if (input.fallHistoryCount > 0) {
    factors.push({
      factor: 'Fall History',
      severity: input.fallHistoryCount >= thresholds.fallHighThreshold ? 'high' : 'medium',
      detail: `${input.fallHistoryCount} fall(s) in the past 6 months`,
    });
  }

  if (input.medicationCount >= thresholds.polypharmacyThreshold) {
    factors.push({
      factor: 'Polypharmacy',
      severity: input.medicationCount >= 8 ? 'high' : 'medium',
      detail: `${input.medicationCount} medications prescribed (≥${thresholds.polypharmacyThreshold} = polypharmacy risk)`,
    });
  }

  if (input.previousHospitalizations > 0) {
    factors.push({
      factor: 'Recent Hospitalizations',
      severity: input.previousHospitalizations >= thresholds.hospitalizationHighThreshold ? 'high' : 'medium',
      detail: `${input.previousHospitalizations} hospitalization(s) in the past 12 months`,
    });
  }

  if (input.livesAlone) {
    factors.push({
      factor: 'Lives Alone',
      severity: 'medium',
      detail: 'No in-home caregiver support — higher risk of delayed assistance seeking',
    });
  }

  if (input.cognitiveStatus && input.cognitiveStatus !== 'intact') {
    factors.push({
      factor: 'Cognitive Impairment',
      severity: input.cognitiveStatus === 'severe-impairment' ? 'high' : input.cognitiveStatus === 'moderate-impairment' ? 'high' : 'medium',
      detail: `Cognitive status: ${input.cognitiveStatus.replace('-', ' ')}`,
    });
  }

  if (input.sarcFRisk !== undefined && input.sarcFRisk >= 4) {
    factors.push({
      factor: 'Sarcopenia Risk',
      severity: input.sarcFRisk >= 8 ? 'high' : 'medium',
      detail: `SARC-F score: ${input.sarcFRisk}/10 — indicates ${input.sarcFRisk >= 4 ? 'probable sarcopenia' : 'low risk'}`,
    });
  }

  return factors;
}

function buildRecommendations(
  riskLevel: RiskLevel,
  input: RiskStratificationInput,
  factors: RiskFactor[],
): string[] {
  const recommendations: string[] = [];

  // Risk-level-based recommendations
  switch (riskLevel) {
    case 'critical':
      recommendations.push('IMMEDIATE interdisciplinary case conference required within 24 hours');
      recommendations.push('Consider home safety evaluation and 24/7 monitoring or supervision');
      recommendations.push('Initiate falls prevention protocol with bed/chair alarms');
      recommendations.push('Pharmacy review for deprescribing of high-risk medications');
      break;
    case 'high':
      recommendations.push('Schedule interdisciplinary care conference within 1 week');
      recommendations.push('Comprehensive falls risk assessment (BERG, TUG, 30s chair stand)');
      recommendations.push('Referral to physical therapy for strength and balance training');
      recommendations.push('Home safety assessment by occupational therapy');
      break;
    case 'moderate':
      recommendations.push('Develop targeted risk reduction care plan');
      recommendations.push('Initiate or progress therapeutic exercise program focusing on identified deficits');
      recommendations.push('Patient and caregiver education on fall prevention strategies');
      recommendations.push('Schedule follow-up risk reassessment in 4 weeks');
      break;
    case 'low':
      recommendations.push('Continue current plan of care with routine monitoring');
      recommendations.push('Maintain general conditioning and wellness activities');
      recommendations.push('Provide patient education on maintaining functional independence');
      recommendations.push('Reassess risk profile at standard intervals or with status change');
      break;
  }

  // Condition-specific recommendations
  const highFactors = factors.filter((f) => f.severity === 'high');
  if (highFactors.some((f) => f.factor === 'Fall History')) {
    recommendations.push('Implement fall prevention protocol: non-slip footwear, clear pathways, grab bars');
  }
  if (input.functionalScores && Object.keys(input.functionalScores).length > 0) {
    recommendations.push('Target functional deficits identified in assessment scores with specific interventions');
  }
  if (input.livesAlone && riskLevel !== 'low') {
    recommendations.push('Establish daily check-in protocol (call, visit, or remote monitoring)');
  }
  if (input.cognitiveStatus && input.cognitiveStatus !== 'intact') {
    recommendations.push('Use simplified written instructions and involve caregiver in all education sessions');
  }

  return recommendations;
}

// ── Main function ───────────────────────────────────────────────────────────

/**
 * Stratify patient risk level based on clinical data.
 *
 * Uses a transparent, rule-based scoring system (not AI) for reliability,
 * auditability, and regulatory compliance.
 *
 * @param input - Patient clinical data
 * @param thresholds - Optional custom thresholds (uses defaults if omitted)
 * @returns Risk stratification result with level, score, factors, and recommendations
 */
export function stratifyRisk(
  input: RiskStratificationInput,
  thresholds: Partial<RiskThresholds> = {},
): RiskStratificationResult {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };

  // ── Compute component scores ──────────────────────────────────────────────

  const componentScores: Record<string, number> = {
    age: scoreAge(input.age, t),
    comorbidities: scoreComorbidities(input.comorbidities),
    falls: scoreFalls(input.fallHistoryCount, t),
    medications: scoreMedications(input.medicationCount, t),
    hospitalizations: scoreHospitalizations(input.previousHospitalizations, t),
    functional: scoreFunctionalScores(input.functionalScores),
    livesAlone: scoreLivesAlone(input.livesAlone),
    cognitive: scoreCognitiveStatus(input.cognitiveStatus),
    sarcFRisk: scoreSarcFRisk(input.sarcFRisk),
  };

  // ── Total risk score ──────────────────────────────────────────────────────

  const totalScore = Object.values(componentScores).reduce((sum, s) => sum + s, 0);
  const riskScore = Math.min(totalScore, 100);

  // ── Determine risk level ──────────────────────────────────────────────────

  let riskLevel: RiskLevel;
  if (riskScore >= t.critical) {
    riskLevel = 'critical';
  } else if (riskScore >= t.high) {
    riskLevel = 'high';
  } else if (riskScore >= t.moderate) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // ── Build risk factors ────────────────────────────────────────────────────

  const riskFactors = buildRiskFactors(input, t, componentScores);

  // ── Build recommendations ─────────────────────────────────────────────────

  const recommendations = buildRecommendations(riskLevel, input, riskFactors);

  return {
    riskLevel,
    riskScore,
    riskFactors,
    recommendations,
  };
}

export default stratifyRisk;
