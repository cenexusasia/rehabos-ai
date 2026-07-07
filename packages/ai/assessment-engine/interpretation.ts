import OpenAI from 'openai';

// ── Types ──────────────────────────────────────────────────────────────────

export interface NormativeData {
  /** Population mean score */
  mean: number;
  /** Population standard deviation */
  standardDeviation: number;
  /** Minimum clinically important difference */
  mcid?: number;
  /** Cutoff scores for different severity levels */
  severityCutoffs?: Record<string, number>;
}

export interface PreviousScore {
  date: string | Date;
  score: number;
}

export interface PatientDemographics {
  age: number;
  gender?: string;
  diagnosis?: string;
  conditionDuration?: string;
  dominantHand?: 'left' | 'right' | 'ambidextrous';
  language?: string;
  educationLevel?: string;
}

export interface FollowUpAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  timeframe?: string;
}

export interface AssessmentInterpretation {
  interpretation: string;
  confidence: number;
  significantChange: boolean;
  followUpActions: FollowUpAction[];
  /** Z-score relative to normative population (if normativeData provided) */
  zScore?: number;
  /** Percentile rank relative to normative population */
  percentile?: number;
  /** Categorical severity level */
  severityLevel?: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical';
}

// ── Structured output schema as JSON-instructions (OpenAI structured output) ─

const INTERPRETATION_SCHEMA = {
  type: 'object' as const,
  properties: {
    interpretation: {
      type: 'string' as const,
      description: 'Clinical interpretation of the assessment results, 2-4 sentences',
    },
    confidence: {
      type: 'number' as const,
      description: 'Confidence score 0-1 based on data completeness and clarity',
    },
    significantChange: {
      type: 'boolean' as const,
      description: 'Whether the change from previous scores exceeds MCID or is clinically significant',
    },
    followUpActions: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          action: { type: 'string' as const, description: 'The recommended action' },
          priority: {
            type: 'string' as const,
            enum: ['high', 'medium', 'low'] as const,
            description: 'Priority level',
          },
          rationale: { type: 'string' as const, description: 'Why this action is recommended' },
          timeframe: {
            type: 'string' as const,
            description: 'Suggested timeframe (e.g., "within 1 week")',
          },
        },
        required: ['action', 'priority', 'rationale'],
        additionalProperties: false,
      },
      description: 'Ordered list of recommended follow-up actions',
    },
  },
  required: ['interpretation', 'confidence', 'significantChange', 'followUpActions'],
  additionalProperties: false,
} as const;

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Calculate z-score: (score - mean) / standardDeviation
 */
function calculateZScore(score: number, mean: number, stdDev: number): number {
  if (stdDev <= 0) return 0;
  return (score - mean) / stdDev;
}

/**
 * Convert z-score to approximate percentile.
 */
function zScoreToPercentile(z: number): number {
  // Approximation using the error function
  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.39894228 * Math.exp(-(z * z) / 2);
  const p = d * (t * (1.330274429 + t * (-1.821255978 + t * (1.781477937 + t * (-0.356563782 + t * 0.31938153)))));
  return Math.round((0.5 + sign * (0.5 - p)) * 100);
}

/**
 * Determine severity level from score using cutoff map.
 */
function determineSeverityLevel(
  score: number,
  cutoffs?: Record<string, number>,
): 'normal' | 'mild' | 'moderate' | 'severe' | 'critical' | undefined {
  if (!cutoffs) return undefined;

  // Sort cutoffs by threshold value (ascending, representing increasing severity)
  const sorted = Object.entries(cutoffs).sort(([, a], [, b]) => a - b);

  let level: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical' = 'normal';
  for (const [label, threshold] of sorted) {
    if (score >= threshold) {
      level = label as typeof level;
    }
  }
  return level;
}

/**
 * Detect if change from previous scores is clinically significant.
 */
function detectSignificantChange(
  score: number,
  previousScores: PreviousScore[],
  mcid?: number,
): boolean {
  if (previousScores.length === 0) return false;

  // Get the most recent previous score
  const sorted = [...previousScores].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const lastScore = sorted[0].score;
  const diff = Math.abs(score - lastScore);

  if (mcid) return diff >= mcid;

  // Fallback: 10% change is considered significant
  if (lastScore === 0) return diff !== 0;
  return diff / Math.abs(lastScore) >= 0.1;
}

/**
 * Build system prompt for the AI interpretation.
 */
function buildInterpretationPrompt(params: {
  assessmentName: string;
  score: number;
  previousScores: PreviousScore[];
  normativeData?: NormativeData;
  patientDemographics?: PatientDemographics;
  zScore?: number;
  percentile?: number;
  severityLevel?: string;
  significantChange: boolean;
}): string {
  return [
    `You are a clinical assessment interpretation specialist for physical and occupational therapy.`,
    ``,
    `## Assessment: ${params.assessmentName}`,
    `Current Score: ${params.score}`,
    params.previousScores.length > 0
      ? `Previous Scores: ${params.previousScores
          .map(
            (ps) =>
              `${ps.date instanceof Date ? ps.date.toISOString().split('T')[0] : ps.date}: ${ps.score}`,
          )
          .join(', ')}`
      : 'No previous scores available.',
    params.significantChange ? '⚠️ The change is clinically significant.' : 'No significant change detected.',
    ``,
    params.zScore !== undefined
      ? `Z-Score vs. Normative Population: ${params.zScore.toFixed(2)}`
      : '',
    params.percentile !== undefined ? `Percentile Rank: ${params.percentile}th` : '',
    params.severityLevel ? `Severity Level: ${params.severityLevel}` : '',
    ``,
    params.normativeData
      ? [
          `## Normative Data`,
          `Population Mean: ${params.normativeData.mean}`,
          `Population SD: ${params.normativeData.standardDeviation}`,
          params.normativeData.mcid !== undefined
            ? `MCID: ${params.normativeData.mcid}`
            : 'MCID: Not available',
        ].join('\n')
      : 'No normative data available.',
    ``,
    params.patientDemographics
      ? [
          `## Patient Demographics`,
          `Age: ${params.patientDemographics.age}`,
          params.patientDemographics.gender ? `Gender: ${params.patientDemographics.gender}` : '',
          params.patientDemographics.diagnosis
            ? `Diagnosis: ${params.patientDemographics.diagnosis}`
            : '',
          params.patientDemographics.conditionDuration
            ? `Condition Duration: ${params.patientDemographics.conditionDuration}`
            : '',
        ]
          .filter(Boolean)
          .join('\n')
      : '',
    ``,
    `## Output Requirements`,
    `Provide a concise clinical interpretation (2-4 sentences) including:`,
    `1. What the score means in functional terms`,
    `2. How it compares to the normative population (if data available)`,
    `3. Clinical significance and trajectory`,
    `4. Specific follow-up actions for the care team`,
  ]
    .filter(Boolean)
    .join('\n');
}

// ── Main function ───────────────────────────────────────────────────────────

/**
 * Interpret assessment results using AI with structured output.
 *
 * @param assessmentName - Name of the assessment (e.g., "DASH", "FMA-UE", "Berg Balance")
 * @param score - Current assessment score
 * @param previousScores - Array of previous scores with dates
 * @param normativeData - Population normative data (optional, improves interpretation)
 * @param patientDemographics - Patient demographic info (optional, improves personalization)
 * @param openaiClient - Optional OpenAI client instance. If omitted, uses a rule-based fallback.
 * @returns Structured interpretation with confidence, significant change detection, and follow-ups
 */
export async function interpretAssessmentResults(
  assessmentName: string,
  score: number,
  previousScores: PreviousScore[] = [],
  normativeData?: NormativeData,
  patientDemographics?: PatientDemographics,
  openaiClient?: OpenAI,
): Promise<AssessmentInterpretation> {
  // ── Compute analytical values ─────────────────────────────────────────────

  const zScore =
    normativeData ? calculateZScore(score, normativeData.mean, normativeData.standardDeviation) : undefined;

  const percentile = zScore !== undefined ? zScoreToPercentile(zScore) : undefined;

  const severityLevel = normativeData?.severityCutoffs
    ? determineSeverityLevel(score, normativeData.severityCutoffs)
    : undefined;

  const significantChange = detectSignificantChange(score, previousScores, normativeData?.mcid);

  // ── Try AI interpretation ──────────────────────────────────────────────────

  if (openaiClient) {
    try {
      const prompt = buildInterpretationPrompt({
        assessmentName,
        score,
        previousScores,
        normativeData,
        patientDemographics,
        zScore,
        percentile,
        severityLevel,
        significantChange,
      });

      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini', // cost-effective for structured outputs
        messages: [
          {
            role: 'system',
            content:
              'You are an expert clinical assessment interpreter. Provide structured, evidence-based interpretations.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'assessment_interpretation',
            schema: INTERPRETATION_SCHEMA,
            strict: true,
          },
        },
        temperature: 0.3,
        max_tokens: 1024,
      });

      const raw = response.choices[0]?.message?.content;
      if (raw) {
        const parsed: AssessmentInterpretation = JSON.parse(raw);
        // Attach computed values
        parsed.zScore = zScore;
        parsed.percentile = percentile;
        parsed.severityLevel = severityLevel;
        return parsed;
      }
    } catch (error) {
      console.warn('AI interpretation failed, falling back to rule-based:', error);
      // Fall through to rule-based fallback
    }
  }

  // ── Rule-based fallback ────────────────────────────────────────────────────

  return generateRuleBasedInterpretation(
    assessmentName,
    score,
    previousScores,
    normativeData,
    patientDemographics,
    zScore,
    percentile,
    severityLevel,
    significantChange,
  );
}

// ── Rule-based fallback ──────────────────────────────────────────────────────

function generateRuleBasedInterpretation(
  assessmentName: string,
  score: number,
  previousScores: PreviousScore[],
  normativeData?: NormativeData,
  patientDemographics?: PatientDemographics,
  zScore?: number,
  percentile?: number,
  severityLevel?: string,
  significantChange?: boolean,
): AssessmentInterpretation {
  const parts: string[] = [];
  const followUpActions: FollowUpAction[] = [];

  // Score interpretation
  if (severityLevel) {
    parts.push(
      `The patient scores at a **${severityLevel}** severity level on the ${assessmentName}.`,
    );
  } else {
    parts.push(`The patient achieved a score of ${score} on the ${assessmentName}.`);
  }

  // Normative comparison
  if (zScore !== undefined && percentile !== undefined) {
    if (Math.abs(zScore) < 0.5) {
      parts.push(`This is within the average range (z=${zScore.toFixed(2)}, ${percentile}th percentile).`);
      followUpActions.push({
        action: 'Continue current plan of care with routine reassessment',
        priority: 'low',
        rationale: 'Function is within normal limits',
        timeframe: 'Reassess at standard intervals',
      });
    } else if (zScore < -1) {
      parts.push(
        `This is **below average** compared to the normative population (z=${zScore.toFixed(2)}, ${percentile}th percentile).`,
      );
      followUpActions.push({
        action: 'Consider more intensive intervention or additional support',
        priority: 'high',
        rationale: `Score is ${Math.abs(zScore).toFixed(1)} standard deviations below the mean`,
        timeframe: 'Address within current treatment cycle',
      });
    } else if (zScore > 1) {
      parts.push(
        `This is **above average** compared to the normative population (z=${zScore.toFixed(2)}, ${percentile}th percentile).`,
      );
      followUpActions.push({
        action: 'Consider transitioning to maintenance phase',
        priority: 'medium',
        rationale: 'Performance exceeds population norms',
        timeframe: 'Discuss at next care conference',
      });
    } else {
      parts.push(
        `This is slightly ${zScore < 0 ? 'below' : 'above'} the mean (z=${zScore.toFixed(2)}, ${percentile}th percentile).`,
      );
      followUpActions.push({
        action: 'Monitor progress and adjust interventions as needed',
        priority: 'medium',
        rationale: 'Slight deviation from normative mean',
        timeframe: 'Within 2 weeks',
      });
    }
  }

  // Trajectory from previous scores
  if (previousScores.length > 0) {
    const sorted = [...previousScores].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const lastScore = sorted[0].score;
    const diff = score - lastScore;

    if (significantChange && Math.abs(diff) > 0) {
      if (diff > 0) {
        parts.push(`This represents a **clinically significant improvement** from the last assessment (${lastScore}).`);
      } else {
        parts.push(
          `This represents a **clinically significant decline** from the last assessment (${lastScore}).`,
        );
        followUpActions.push({
          action: 'Urgent clinical review and possible plan modification',
          priority: 'high',
          rationale: 'Clinically significant decline detected',
          timeframe: 'Within 48 hours',
        });
      }
    } else {
      parts.push(`This is relatively stable compared to the previous score of ${lastScore}.`);
    }

    // Look at overall trend
    if (sorted.length >= 2) {
      const oldestScore = sorted[sorted.length - 1].score;
      const totalChange = score - oldestScore;
      if (totalChange > 0) {
        parts.push(`Overall trend is **improving** since initial assessment (${oldestScore} → ${score}).`);
        followUpActions.push({
          action: 'Continue current interventions with progressive loading',
          priority: 'low',
          rationale: 'Positive trajectory indicates effective treatment',
          timeframe: 'Next regular session',
        });
      } else if (totalChange < 0) {
        parts.push(`Overall trend is **declining** since initial assessment (${oldestScore} → ${score}).`);
        followUpActions.push({
          action: 'Re-evaluate treatment approach and consider alternative interventions',
          priority: 'high',
          rationale: 'Negative trajectory despite intervention',
          timeframe: 'Within 1 week',
        });
      }
    }
  } else {
    parts.push('No prior assessment data available for trajectory analysis.');
    followUpActions.push({
      action: 'Establish baseline and schedule follow-up assessment',
      priority: 'medium',
      rationale: 'No previous data for comparison',
      timeframe: 'Reassess in 4-6 weeks',
    });
  }

  // Patient-specific considerations
  if (patientDemographics?.age && patientDemographics.age > 75) {
    followUpActions.push({
      action: 'Assess for fall risk and environmental safety',
      priority: 'high',
      rationale: `Patient is ${patientDemographics.age} years old — higher risk of functional decline`,
      timeframe: 'This session',
    });
  }

  if (patientDemographics?.diagnosis) {
    parts.push(`Consider the patient's diagnosis of ${patientDemographics.diagnosis} when interpreting these results.`);
  }

  // Build confidence
  let confidence = 0.7; // base confidence without normative data
  if (normativeData) confidence += 0.15;
  if (previousScores.length > 0) confidence += 0.1;
  if (patientDemographics) confidence += 0.05;
  confidence = Math.min(confidence, 0.95);

  return {
    interpretation: parts.filter(Boolean).join(' '),
    confidence: Math.round(confidence * 100) / 100,
    significantChange: significantChange ?? false,
    followUpActions: followUpActions.slice(0, 5), // cap at 5 actions
    zScore,
    percentile,
    severityLevel: severityLevel as AssessmentInterpretation['severityLevel'],
  };
}

export default interpretAssessmentResults;
