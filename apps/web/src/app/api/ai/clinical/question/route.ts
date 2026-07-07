import { NextResponse } from 'next/server';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Request validation schema
// ---------------------------------------------------------------------------

const clinicalQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required').max(2000, 'Question too long'),
  patientContext: z
    .object({
      diagnosis: z.string().optional(),
      age: z.number().optional(),
      gender: z.string().optional(),
      relevantHistory: z.string().optional(),
      medications: z.string().optional(),
      priorTreatments: z.string().optional(),
    })
    .optional(),
});

type ClinicalQuestionInput = z.infer<typeof clinicalQuestionSchema>;

// ---------------------------------------------------------------------------
// Rate limiting - simple in-memory store
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

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
// OpenAI prompt builder
// ---------------------------------------------------------------------------

function buildSystemPrompt(context?: ClinicalQuestionInput['patientContext']): string {
  const parts = [
    'You are a clinical AI assistant specialized in rehabilitation, physical therapy, and musculoskeletal medicine.',
    'Provide evidence-based answers to clinical questions. Be concise, accurate, and practical.',
    'Always include relevant clinical considerations, contraindications, and precautions.',
    'When appropriate, reference standard clinical guidelines (APTA, ACSM, etc.).',
    'Format your response with clear sections using markdown.',
    'If the question is outside your scope, clearly state that and recommend consulting appropriate specialists.',
  ];

  if (context) {
    const ctx: string[] = ['Patient context for reference:'];
    if (context.diagnosis) ctx.push(`- Diagnosis: ${context.diagnosis}`);
    if (context.age) ctx.push(`- Age: ${context.age}`);
    if (context.gender) ctx.push(`- Gender: ${context.gender}`);
    if (context.relevantHistory) ctx.push(`- Relevant History: ${context.relevantHistory}`);
    if (context.medications) ctx.push(`- Medications: ${context.medications}`);
    if (context.priorTreatments) ctx.push(`- Prior Treatments: ${context.priorTreatments}`);
    parts.push(ctx.join('\n'));
  }

  parts.push(
    '\nIMPORTANT: This is for informational purposes only and does not constitute medical advice. Always use clinical judgment.',
  );

  return parts.join('\n\n');
}

// ---------------------------------------------------------------------------
// Call to OpenAI
// ---------------------------------------------------------------------------

async function callOpenAI(question: string, context?: ClinicalQuestionInput['patientContext']) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not configured');
  }

  const systemPrompt = buildSystemPrompt(context);

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
        { role: 'user', content: question },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errBody}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  const answer = data.choices?.[0]?.message?.content ?? '';
  return answer;
}

// ---------------------------------------------------------------------------
// POST /api/ai/clinical/question
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  // Rate limiting
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous';

  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Too many requests', message: 'Rate limit exceeded. Please wait before making another request.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body', message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const parsed = clinicalQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        message: 'The request body is missing required fields or contains invalid data.',
        details: parsed.error instanceof z.ZodError ? parsed.error.flatten().fieldErrors : null,
      },
      { status: 400 },
    );
  }

  // Call OpenAI
  try {
    const answer = await callOpenAI(parsed.data.question, parsed.data.patientContext);

    // Determine confidence heuristically
    const lowIndicators = [
      "i'm not sure", "i don't have", "cannot provide",
      "outside my scope", "may not be accurate", "limited evidence",
    ];
    const hasLowIndicator = lowIndicators.some((ind) => answer.toLowerCase().includes(ind));
    const confidence: 'low' | 'medium' | 'high' = hasLowIndicator
      ? 'low'
      : answer.length > 300
        ? 'high'
        : 'medium';

    return NextResponse.json({
      success: true,
      data: {
        answer,
        evidence: null,
        confidence,
        disclaimer:
          'This information is for educational purposes only and does not constitute medical advice. Always exercise clinical judgment.',
        followUpQuestions: generateFollowUps(parsed.data.question, answer),
      },
    });
  } catch (error) {
    console.error('[ai/clinical/question] API call failed:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    const isAuthError = message.includes('API key') || message.includes('authentication');
    return NextResponse.json(
      {
        error: isAuthError ? 'Authentication failed' : 'Question processing failed',
        message,
        retryable: !isAuthError,
      },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// Follow-up question generator
// ---------------------------------------------------------------------------

function generateFollowUps(question: string, _answer: string): string[] {
  const lower = question.toLowerCase();

  if (lower.includes('exercise') || lower.includes('strength')) {
    return [
      'What are the contraindications for this exercise?',
      'How should I progress this exercise?',
      'What are alternative exercises if the patient has limited equipment?',
    ];
  }
  if (lower.includes('pain') || lower.includes('manual')) {
    return [
      'What are the evidence-based dosage parameters?',
      'How do I assess patient response to this intervention?',
      'What are the red flags to watch for?',
    ];
  }
  if (lower.includes('diagnosis') || lower.includes('assessment') || lower.includes('eval')) {
    return [
      'What outcome measures are most appropriate for this condition?',
      'What differential diagnoses should I consider?',
      'What are the key clinical tests with best diagnostic accuracy?',
    ];
  }

  return [
    'Can you elaborate on the evidence supporting this approach?',
    'What precautions should I take with this patient population?',
    'Are there any contraindications I should be aware of?',
  ];
}

// ---------------------------------------------------------------------------
// OPTIONS - CORS preflight
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
