import OpenAI from 'openai';

// ── Types ──────────────────────────────────────────────────────────────────

export interface PatientInfo {
  age: number;
  gender?: string;
  diagnosis: string;
  /** Duration since diagnosis */
  conditionDuration?: string;
  /** Pain level 0-10 */
  painLevel?: number;
  /** Depression screening score (e.g., PHQ-9) */
  depressionScore?: number;
}

export interface AdherenceHistory {
  /** Previous adherence rate as decimal 0-1 (e.g., 0.72 = 72%) */
  previousAdherenceRate: number;
  /** Number of sessions completed vs prescribed */
  sessionCompletionRatio?: number;
  /** Any missed appointment patterns */
  missedAppointmentRate?: number;
}

export interface ExerciseComplexity {
  complexityLevel: 'simple' | 'moderate' | 'complex' | 'very-complex';
  /** Number of exercises prescribed */
  exerciseCount: number;
  /** Frequency per day */
  dailyFrequency: number;
  /** Minutes per session */
  durationPerSession: number;
  /** Total weekly minutes */
  totalWeeklyMinutes: number;
}

export interface AdherenceBarrier {
  category:
    | 'motivational'
    | 'physical'
    | 'cognitive'
    | 'environmental'
    | 'socioeconomic'
    | 'knowledge'
    | 'transportation'
    | 'time-constraint'
    | 'psychological'
    | 'social-support';
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Intervention {
  intervention: string;
  category: string;
  expectedImpact: 'high' | 'medium' | 'low';
  rationale: string;
}

export interface AdherencePrediction {
  /** Predicted adherence rate 0-1 */
  predictedAdherence: number;
  /** Confidence in the prediction 0-1 */
  confidence: number;
  /** Identified barriers to adherence */
  barriers: AdherenceBarrier[];
  /** Recommended interventions */
  interventions: Intervention[];
  /** Qualitative adherence category */
  adherenceCategory: 'high' | 'moderate' | 'low' | 'critical';
}

// ── Structured output schema ───────────────────────────────────────────────

const ADHERENCE_SCHEMA = {
  type: 'object' as const,
  properties: {
    predictedAdherence: {
      type: 'number' as const,
      description: 'Predicted adherence rate as a decimal 0-1',
    },
    confidence: {
      type: 'number' as const,
      description: 'Confidence in prediction 0-1 based on data completeness',
    },
    barriers: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          category: {
            type: 'string' as const,
            enum: [
              'motivational',
              'physical',
              'cognitive',
              'environmental',
              'socioeconomic',
              'knowledge',
              'transportation',
              'time-constraint',
              'psychological',
              'social-support',
            ] as const,
            description: 'Barrier category',
          },
          description: { type: 'string' as const, description: 'Description of the barrier' },
          severity: {
            type: 'string' as const,
            enum: ['high', 'medium', 'low'] as const,
            description: 'Barrier severity level',
          },
        },
        required: ['category', 'description', 'severity'],
        additionalProperties: false,
      },
      description: 'Identified barriers to exercise adherence',
    },
    interventions: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          intervention: { type: 'string' as const, description: 'The specific intervention' },
          category: { type: 'string' as const, description: 'Category of intervention (e.g., education, monitoring, support)' },
          expectedImpact: {
            type: 'string' as const,
            enum: ['high', 'medium', 'low'] as const,
            description: 'Expected impact on adherence',
          },
          rationale: { type: 'string' as const, description: 'Why this intervention is appropriate' },
        },
        required: ['intervention', 'category', 'expectedImpact', 'rationale'],
        additionalProperties: false,
      },
      description: 'Recommended interventions to improve adherence',
    },
  },
  required: ['predictedAdherence', 'confidence', 'barriers', 'interventions'],
  additionalProperties: false,
} as const;

// ── Prompt builder ─────────────────────────────────────────────────────────

function buildAdherencePrompt(
  patient: PatientInfo,
  history: AdherenceHistory,
  complexity: ExerciseComplexity,
  barriers: AdherenceBarrier[],
): string {
  return [
    `You are a rehabilitation adherence specialist. Predict a patient's likelihood of adhering to their home exercise program (HEP) and recommend tailored interventions.`,
    ``,
    `## Patient Information`,
    `Age: ${patient.age}`,
    patient.gender ? `Gender: ${patient.gender}` : '',
    `Diagnosis: ${patient.diagnosis}`,
    patient.conditionDuration ? `Condition Duration: ${patient.conditionDuration}` : '',
    patient.painLevel !== undefined ? `Pain Level (0-10): ${patient.painLevel}` : '',
    patient.depressionScore !== undefined ? `Depression Screen Score: ${patient.depressionScore}` : '',
    ``,
    `## Adherence History`,
    `Previous Adherence Rate: ${(history.previousAdherenceRate * 100).toFixed(0)}%`,
    history.sessionCompletionRatio !== undefined
      ? `Session Completion Ratio: ${(history.sessionCompletionRatio * 100).toFixed(0)}%`
      : '',
    history.missedAppointmentRate !== undefined
      ? `Missed Appointment Rate: ${(history.missedAppointmentRate * 100).toFixed(0)}%`
      : '',
    ``,
    `## Exercise Program Complexity`,
    `Complexity Level: ${complexity.complexityLevel}`,
    `Number of Exercises: ${complexity.exerciseCount}`,
    `Daily Frequency: ${complexity.dailyFrequency}x/day`,
    `Duration per Session: ${complexity.durationPerSession} min`,
    `Total Weekly Minutes: ${complexity.totalWeeklyMinutes} min`,
    ``,
    `## Known Barriers`,
    barriers.length > 0
      ? barriers
          .map(
            (b) =>
              `- [${b.severity.toUpperCase()}] ${b.category}: ${b.description}`,
          )
          .join('\n')
      : 'None reported',
    ``,
    `## Output`,
    `Provide a structured prediction of adherence with specific barriers and targeted interventions.`,
  ]
    .filter(Boolean)
    .join('\n');
}

// ── Rule-based fallback ─────────────────────────────────────────────────────

function ruleBasedPrediction(
  patient: PatientInfo,
  history: AdherenceHistory,
  complexity: ExerciseComplexity,
  knownBarriers: AdherenceBarrier[],
): AdherencePrediction {
  let baseRate = history.previousAdherenceRate;

  // Adjust for complexity
  const complexityPenalties: Record<string, number> = {
    simple: 0,
    moderate: -0.05,
    complex: -0.12,
    'very-complex': -0.2,
  };
  baseRate += complexityPenalties[complexity.complexityLevel] ?? -0.05;

  // Adjust for pain
  if (patient.painLevel !== undefined) {
    if (patient.painLevel >= 7) baseRate -= 0.15;
    else if (patient.painLevel >= 4) baseRate -= 0.05;
  }

  // Adjust for depression
  if (patient.depressionScore !== undefined) {
    if (patient.depressionScore >= 20) baseRate -= 0.2; // severe
    else if (patient.depressionScore >= 15) baseRate -= 0.12; // moderately severe
    else if (patient.depressionScore >= 10) baseRate -= 0.06; // moderate
  }

  // Adjust for age
  if (patient.age > 75) baseRate -= 0.05;
  if (patient.age > 85) baseRate -= 0.08;

  // Adjust for exercise count
  if (complexity.exerciseCount > 6) baseRate -= 0.08;
  else if (complexity.exerciseCount > 4) baseRate -= 0.03;

  // Known barriers have a compounding effect
  const highBarriers = knownBarriers.filter((b) => b.severity === 'high').length;
  baseRate -= highBarriers * 0.08;

  // Clamp
  const predictedAdherence = Math.max(0.1, Math.min(0.98, baseRate));

  // Adherence category
  let adherenceCategory: 'high' | 'moderate' | 'low' | 'critical';
  if (predictedAdherence >= 0.8) adherenceCategory = 'high';
  else if (predictedAdherence >= 0.6) adherenceCategory = 'moderate';
  else if (predictedAdherence >= 0.4) adherenceCategory = 'low';
  else adherenceCategory = 'critical';

  // Build interventions
  const interventions: Intervention[] = [];
  if (complexity.complexityLevel === 'complex' || complexity.complexityLevel === 'very-complex') {
    interventions.push({
      intervention: 'Simplify the exercise program — reduce total exercises to 4-5 key movements',
      category: 'program-design',
      expectedImpact: 'high',
      rationale: 'Complex programs have significantly lower adherence rates',
    });
  }
  if (knownBarriers.some((b) => b.category === 'time-constraint')) {
    interventions.push({
      intervention: 'Develop a "micro-session" protocol — 5-10 min exercise bursts throughout the day',
      category: 'program-design',
      expectedImpact: 'high',
      rationale: 'Addresses time constraints by reducing per-session time commitment',
    });
  }
  if (knownBarriers.some((b) => b.category === 'motivational')) {
    interventions.push({
      intervention: 'Implement self-monitoring with daily check-ins and goal tracking',
      category: 'behavioral',
      expectedImpact: 'medium',
      rationale: 'Self-monitoring improves adherence through accountability and reinforcement',
    });
  }
  if (knownBarriers.some((b) => b.category === 'knowledge')) {
    interventions.push({
      intervention: 'Provide written/video instructions and demonstrate each exercise with caregiver present',
      category: 'education',
      expectedImpact: 'medium',
      rationale: 'Improves exercise self-efficacy and correct technique',
    });
  }
  if (patient.painLevel !== undefined && patient.painLevel > 5) {
    interventions.push({
      intervention: 'Address pain management prior to exercise sessions',
      category: 'pain-management',
      expectedImpact: 'high',
      rationale: 'Pain is a major barrier to exercise adherence',
    });
  }
  if (knownBarriers.some((b) => b.category === 'transportation')) {
    interventions.push({
      intervention: 'Explore telehealth option for follow-up sessions',
      category: 'access',
      expectedImpact: 'medium',
      rationale: 'Reduces transportation burden while maintaining clinical oversight',
    });
  }
  if (history.previousAdherenceRate < 0.5) {
    interventions.push({
      intervention: 'Schedule more frequent check-ins (weekly vs. monthly) to boost accountability',
      category: 'monitoring',
      expectedImpact: 'high',
      rationale: 'Low baseline adherence requires closer supervision',
    });
  }
  if (knownBarriers.some((b) => b.category === 'social-support')) {
    interventions.push({
      intervention: 'Engage family member or caregiver as exercise coach',
      category: 'social-support',
      expectedImpact: 'medium',
      rationale: 'Social support significantly improves long-term adherence',
    });
  }

  // Default intervention if none specific
  if (interventions.length === 0) {
    interventions.push({
      intervention: 'Provide gradual progression plan with clear milestones and positive reinforcement',
      category: 'behavioral',
      expectedImpact: 'medium',
      rationale: 'Clear goals and reinforcement improve intrinsic motivation',
    });
  }

  return {
    predictedAdherence: Math.round(predictedAdherence * 100) / 100,
    confidence: 0.65, // rule-based has moderate confidence
    barriers: knownBarriers,
    interventions,
    adherenceCategory,
  };
}

// ── Main function ───────────────────────────────────────────────────────────

/**
 * Predict HEP adherence using AI with structured output.
 *
 * @param patient - Patient demographic and clinical information
 * @param history - Previous adherence history
 * @param complexity - Exercise program complexity
 * @param barriers - Known adherence barriers
 * @param openaiClient - Optional OpenAI client. Falls back to rule-based if omitted.
 * @returns Adherence prediction with barriers and interventions
 */
export async function predictAdherence(
  patient: PatientInfo,
  history: AdherenceHistory,
  complexity: ExerciseComplexity,
  barriers: AdherenceBarrier[] = [],
  openaiClient?: OpenAI,
): Promise<AdherencePrediction> {
  // ── Try AI prediction ─────────────────────────────────────────────────────

  if (openaiClient) {
    try {
      const prompt = buildAdherencePrompt(patient, history, complexity, barriers);

      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert in rehabilitation adherence prediction. Provide structured, evidence-based predictions and interventions.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'adherence_prediction',
            schema: ADHERENCE_SCHEMA,
            strict: true,
          },
        },
        temperature: 0.3,
        max_tokens: 1024,
      });

      const raw = response.choices[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw) as Omit<AdherencePrediction, 'adherenceCategory'>;

        // Compute adherence category from predicted adherence
        let adherenceCategory: 'high' | 'moderate' | 'low' | 'critical';
        if (parsed.predictedAdherence >= 0.8) adherenceCategory = 'high';
        else if (parsed.predictedAdherence >= 0.6) adherenceCategory = 'moderate';
        else if (parsed.predictedAdherence >= 0.4) adherenceCategory = 'low';
        else adherenceCategory = 'critical';

        return {
          ...parsed,
          predictedAdherence: Math.round(parsed.predictedAdherence * 100) / 100,
          adherenceCategory,
        };
      }
    } catch (error) {
      console.warn('AI adherence prediction failed, falling back to rule-based:', error);
    }
  }

  // ── Rule-based fallback ───────────────────────────────────────────────────

  return ruleBasedPrediction(patient, history, complexity, barriers);
}

export default predictAdherence;
