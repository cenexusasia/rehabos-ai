import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateSoap } from '@/lib/vendor/soap-generator';

// ---------------------------------------------------------------------------
// Request validation schema (mirrors soapGenerateParamsSchema with
// additional client-friendly field names)
// ---------------------------------------------------------------------------

const soapGenerateRequestSchema = z.object({
  visitType: z.enum([
    'initial_eval',
    'follow_up',
    'reevaluation',
    'discharge',
    'telehealth',
  ]),
  clinicianNotes: z.string().min(1, 'Clinician notes are required'),
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
  pastSoapNotes: z
    .array(
      z.object({
        date: z.string().optional(),
        subjective: z.string().optional(),
        objective: z.string().optional(),
        assessment: z.string().optional(),
        plan: z.string().optional(),
      }),
    )
    .optional(),
  additionalContext: z.string().optional(),
  /** Override the AI provider for this request */
  provider: z.enum(['openai', 'anthropic']).optional(),
  /** Override the AI model for this request */
  model: z.string().optional(),
});

export type SoapGenerateRequest = z.infer<typeof soapGenerateRequestSchema>;

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

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60_000).unref?.();

// ---------------------------------------------------------------------------
// POST /api/ai/soap/generate
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

  const parsed = soapGenerateRequestSchema.safeParse(body);
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

  // --- Call the SOAP generator ---
  try {
    const result = await generateSoap(
      {
        visitType: parsed.data.visitType,
        clinicianNotes: parsed.data.clinicianNotes,
        patientContext: parsed.data.patientContext ?? {},
        pastSoapNotes: parsed.data.pastSoapNotes ?? [],
        additionalContext: parsed.data.additionalContext,
      },
      {
        provider: parsed.data.provider,
        model: parsed.data.model,
      },
    );

    return NextResponse.json({
      success: true,
      data: {
        subjective: result.subjective,
        objective: result.objective,
        assessment: result.assessment,
        plan: result.plan,
      },
    });
  } catch (error) {
    console.error('[ai/soap/generate] Generation failed:', error);

    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    const isAuthError =
      message.includes('API key') || message.includes('authentication');

    return NextResponse.json(
      {
        error: isAuthError ? 'Authentication failed' : 'Generation failed',
        message,
        retryable: !isAuthError,
      },
      {
        status: isAuthError ? 500 : 500,
      },
    );
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
