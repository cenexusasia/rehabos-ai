// ── AI Conversation Types ────────────────────────────────────────────────────

export type AIProvider = 'openai' | 'anthropic';

export type ClinicalQuestionRole = 'user' | 'assistant' | 'system';

export interface ClinicalMessage {
  id: string;
  role: ClinicalQuestionRole;
  content: string;
  createdAt: string;
}

export interface ClinicalConversation {
  id: string;
  patientId: string | null;
  patientName: string | null;
  messages: ClinicalMessage[];
  title: string;
  created_at: string;
  updated_at: string;
}

// ── Question / Answer ────────────────────────────────────────────────────────

export interface ClinicalQuestionRequest {
  question: string;
  patientContext?: {
    diagnosis?: string;
    age?: number;
    gender?: string;
    relevantHistory?: string;
    medications?: string;
    priorTreatments?: string;
  };
}

export interface ClinicalQuestionResponse {
  answer: string;
  evidence?: string;
  confidence: 'low' | 'medium' | 'high';
  disclaimer?: string;
  followUpQuestions?: string[];
}

// ── AI Settings ──────────────────────────────────────────────────────────────

export interface AISettings {
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'openai',
  model: 'gpt-4o',
  temperature: 0.3,
  maxTokens: 1024,
};

// ── Quick Actions ────────────────────────────────────────────────────────────

export interface ClinicalQuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: string;
  category: 'diagnosis' | 'treatment' | 'medication' | 'referral' | 'general';
}
