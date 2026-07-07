import { NextResponse } from 'next/server';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Request validation schema
// ---------------------------------------------------------------------------

const assessmentInterpretSchema = z.object({
  assessmentResult: z.object({
    name: z.string().min(1),
    score: z.number(),
    previousScore: z.number().nullable(),
    maxScore: z.number().nullable(),
    minScore: z.number().nullable(),
    higherIsBetter: z.boolean(),
    mcid: z.number().nullable(),
  }),
  patient: z.object({
    age: z.number().optional(),
    gender: z.string().optional(),
    diagnosis: z.string().optional(),
    relevantHistory: z.string().optional(),
    goals: z.array(z.string()).optional(),
  }),
});

type AssessmentInterpretInput = z.infer<typeof assessmentInterpretSchema>;

// ---------------------------------------------------------------------------
// Rate limiting — simple in-memory store
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) return false;
  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}, 60_000).unref?.();

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildSystemPrompt(): string {
  return `You are a clinical AI assistant specialized in physical therapy and rehabilitation medicine. Your task is to interpret assessment results in the context of the patient's clinical presentation.

You must respond with valid JSON only, using this exact schema:
{
  "interpretation": "string — a clinical paragraph interpreting the score and what it means for this patient",
  "confidence": "low" | "medium" | "high",
  "significantChanges": [{ "description": "string", "type": "improvement" | "decline" | "stable", "magnitude": number }],
  "followUpActions": ["string — actionable recommendations"],
  "clinicalAlerts": ["string — any red flags or concerns"]
}

Clinical reasoning guidelines:
- Compare current score to previous score (if available) to determine trend
- Reference the MCID (minimal clinically important difference) to determine if changes are clinically meaningful
- Consider the patient's diagnosis, age, and relevant history in the interpretation
- For follow-up actions, suggest evidence-based next steps (reassessment interval, referral triggers, treatment adjustments)
- Flag clinical alerts when scores indicate decline, stagnation despite treatment, or values approaching red-flag thresholds
- Set confidence based on how much data is available: high when previous scores + MCID + patient context are all present, medium when some data is available, low when minimal context is provided

Format: Return ONLY valid JSON. Do not wrap in markdown or code fences.`;
}

function buildUserPrompt(input: AssessmentInterpretInput): string {
  const { assessmentResult, patient } = input;
  const lines: string[] = [];

  lines.push('## Assessment Result');
  lines.push(`- Name: ${assessmentResult.name}`);
  lines.push(`- Score: ${assessmentResult.score}`);
  if (assessmentResult.minScore !== null) lines.push(`- Min Score: ${assessmentResult.minScore}`);
  if (assessmentResult.maxScore !== null) lines.push(`- Max Score: ${assessmentResult.maxScore}`);
  lines.push(`- Higher is Better: ${assessmentResult.higherIsBetter}`);
  if (assessmentResult.previousScore !== null) {
    lines.push(`- Previous Score: ${assessmentResult.previousScore}`);
    const change = assessmentResult.score - assessmentResult.previousScore;
    lines.push(`- Change: ${change > 0 ? '+' : ''}${change.toFixed(1)}`);
  }
  if (assessmentResult.mcid !== null) {
    lines.push(`- MCID: ${assessmentResult.mcid}`);
  }

  lines.push('');
  lines.push('## Patient Context');
  if (patient.age) lines.push(`- Age: ${patient.age}`);
  if (patient.gender) lines.push(`- Gender: ${patient.gender}`);
  if (patient.diagnosis) lines.push(`- Diagnosis: ${patient.diagnosis}`);
  if (patient.relevantHistory) lines.push(`- Relevant History: ${patient.relevantHistory}`);
  if (patient.goals?.length) {
    lines.push('- Goals:');
    patient.goals.forEach((g) => lines.push(`  - ${g}`));
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Call to OpenAI
// ---------------------------------------------------------------------------

async function callOpenAI(input: AssessmentInterpretInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not configured');
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(input);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errBody}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  const content = data.choices?.[0]?.message?.content ?? '';
  if (!content) throw new Error('Empty response from OpenAI');

  const parsed = JSON.parse(content);

  return {
    interpretation: parsed.interpretation ?? 'No interpretation available.',
    confidence: (parsed.confidence ?? 'medium') as 'low' | 'medium' | 'high',
    significantChanges: (parsed.significantChanges ?? []) as {
      description: string;
      type: 'improvement' | 'decline' | 'stable';
      magnitude: number;
    }[],
    followUpActions: (parsed.followUpActions ?? []) as string[],
    clinicalAlerts: (parsed.clinicalAlerts ?? []) as string[],
  };
}

// ---------------------------------------------------------------------------
// Fallback interpretation when AI call fails
// ---------------------------------------------------------------------------

function fallbackInterpretation(input: AssessmentInterpretInput) {
  const { assessmentResult } = input;
  const change =
    assessmentResult.previousScore !== null
      ? assessmentResult.score - assessmentResult.previousScore
      : null;

  const isClinicallySignificant =
    change !== null &&
    assessmentResult.mcid !== null &&
    Math.abs(change) >= assessmentResult.mcid;

  let interpretation = `The patient scored ${assessmentResult.score}`;
  if (assessmentResult.maxScore !== null) {
    interpretation += ` out of ${assessmentResult.maxScore}`;
  }
  interpretation += `.`;

  if (change !== null) {
    interpretation += ` This represents a change of ${change > 0 ? '+' : ''}${change.toFixed(1)} points`;
    if (isClinicallySignificant) {
      interpretation += ` from the previous assessment, which exceeds the minimal clinically important difference (MCID) of ${assessmentResult.mcid} points.`;
    } else if (assessmentResult.mcid !== null) {
      interpretation += ` from the previous assessment, but does not exceed the MCID of ${assessmentResult.mcid} points.`;
    } else {
      interpretation += ' from the previous assessment.';
    }
  }

  interpretation += ' Clinical correlation is recommended.';

  const significantChanges: { description: string; type: 'improvement' | 'decline' | 'stable'; magnitude: number }[] = [];
  if (change !== null) {
    const type = assessmentResult.higherIsBetter
      ? change > 0
        ? 'improvement'
        : change < 0
          ? 'decline'
          : 'stable'
      : change < 0
        ? 'improvement'
        : change > 0
          ? 'decline'
          : 'stable';
    significantChanges.push({
      description: `Score change from previous assessment`,
      type,
      magnitude: Math.abs(change),
    });
  }

  const followUpActions: string[] = [
    'Review findings in the context of the full clinical presentation.',
    'Consider repeating the assessment at the next clinical visit to monitor trends.',
    'Document interpretation in the patient record.',
  ];

  const clinicalAlerts: string[] = [];
  if (change !== null && isClinicallySignificant) {
    const isDecline =
      assessmentResult.higherIsBetter ? change < 0 : change > 0;
    if (isDecline) {
      clinicalAlerts.push(
        'Clinically significant decline detected — consider adjusting treatment plan and reassessing sooner.',
      );
    }
  }

  return { interpretation, confidence: 'low' as const, significantChanges, followUpActions, clinicalAlerts };
}

// ---------------------------------------------------------------------------
// POST /api/ai/assess/interpret
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  // --- Rate limiting ---
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous';

  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please wait before making another request.',
      },
      {
        status: 429,
        headers: { 'Retry-After': '60' },
      },
    );
  }

  // --- Parse & validate body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body', message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const parsed = assessmentInterpretSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        message: 'The request body is missing required fields or contains invalid data.',
        details:
          parsed.error instanceof z.ZodError
            ? parsed.error.flatten().fieldErrors
            : null,
      },
      { status: 400 },
    );
  }

  // --- Call OpenAI ---
  try {
    const interpretation = await callOpenAI(parsed.data);

    return NextResponse.json({
      success: true,
      data: interpretation,
    });
  } catch (error) {
    console.error('[ai/assess/interpret] API call failed:', error);

    const isAuthError =
      error instanceof Error &&
      (error.message.includes('API key') || error.message.includes('authentication'));

    if (isAuthError) {
      return NextResponse.json(
        {
          error: 'Authentication failed',
          message:
            'The AI service is not properly configured. Please contact your administrator.',
          retryable: false,
        },
        { status: 500 },
      );
    }

    // Fallback to heuristic interpretation
    const fallback = fallbackInterpretation(parsed.data);

    return NextResponse.json({
      success: true,
      data: fallback,
      meta: {
        fallback: true,
        message:
          'AI interpretation was unavailable. A heuristic interpretation has been provided instead.',
      },
    });
  }
}

// ---------------------------------------------------------------------------
// OPTIONS — CORS preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
