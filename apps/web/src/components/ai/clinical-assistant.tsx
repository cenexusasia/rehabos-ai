'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Loader2,
  X,
  Sparkles,
  Lightbulb,
  Stethoscope,
  Pill,
  AlertTriangle,
  MessageSquare,
  BrainCircuit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClinicalMessage, ClinicalQuestionResponse } from '@/types/clinical';

// ── Quick Actions ───────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    id: 'dx',
    label: 'Differential Diagnosis',
    prompt: 'What are the differential diagnoses for...',
    icon: <Stethoscope className="h-3.5 w-3.5" />,
    category: 'diagnosis' as const,
  },
  {
    id: 'rx',
    label: 'Treatment Options',
    prompt: 'What are the evidence-based treatment options for...',
    icon: <Lightbulb className="h-3.5 w-3.5" />,
    category: 'treatment' as const,
  },
  {
    id: 'med',
    label: 'Medication Check',
    prompt: 'What are the considerations for prescribing...',
    icon: <Pill className="h-3.5 w-3.5" />,
    category: 'medication' as const,
  },
  {
    id: 'contra',
    label: 'Contraindications',
    prompt: 'What are the contraindications for...',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    category: 'general' as const,
  },
];

// ── Props ────────────────────────────────────────────────────────────────────

interface ClinicalAssistantProps {
  patientContext?: {
    diagnosis?: string;
    age?: number;
    gender?: string;
    relevantHistory?: string;
    medications?: string;
    priorTreatments?: string;
  };
  onClose?: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ClinicalAssistant({ patientContext, onClose }: ClinicalAssistantProps) {
  const [messages, setMessages] = useState<ClinicalMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hi, I\'m your Clinical AI Assistant. I can help answer clinical questions, suggest differential diagnoses, check for contraindications, and provide evidence-based treatment guidance. How can I help you today?',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: ClinicalMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: question.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setShowQuickActions(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/clinical/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          patientContext: patientContext ?? undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message ?? `Request failed (${response.status})`);
      }

      const result = (await response.json()) as {
        success: boolean;
        data: ClinicalQuestionResponse;
      };

      const assistantMessage: ClinicalMessage = {
        id: `msg-${Date.now()}-resp`,
        role: 'assistant',
        content: result.data.answer,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ClinicalMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content:
          error instanceof Error
            ? `I encountered an error: ${error.message}`
            : 'Sorry, I encountered an unexpected error. Please try again.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-lg">
            <BrainCircuit className="text-primary h-4 w-4" />
          </div>
          <div>
            <h3 className="text-foreground text-sm font-semibold">Clinical AI</h3>
            <p className="text-muted-foreground text-[10px]">Ask clinical questions</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-accent-foreground',
                )}
              >
                {msg.role === 'user' ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border bg-card border',
                )}
              >
                {msg.role === 'assistant' && msg.id === 'welcome' && (
                  <div className="mb-2">
                    <Sparkles className="text-primary h-3.5 w-3.5" />
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {/* Loading */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="bg-accent flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="border-border bg-card flex items-center gap-2 rounded-xl border px-4 py-3">
                <Loader2 className="text-primary h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {showQuickActions && !isLoading && (
          <div className="border-t border-border px-4 py-3">
            <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider">
              <MessageSquare className="h-3 w-3" />
              Quick Questions
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleQuickAction(action.prompt)}
                  className={cn(
                    'border-border bg-card hover:border-primary/40 hover:bg-accent/50 flex items-center gap-2 rounded-lg border p-2.5 text-left transition-all',
                  )}
                >
                  <span className="text-muted-foreground">{action.icon}</span>
                  <span className="text-foreground text-xs font-medium">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a clinical question..."
            disabled={isLoading}
            className={cn(
              'border-input bg-background text-foreground flex-1 rounded-lg border px-3.5 py-2.5 text-sm',
              'placeholder:text-muted-foreground/60',
              'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
              'disabled:pointer-events-none disabled:opacity-50',
              'transition-colors',
            )}
          />
          <button
            type="button"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className={cn(
              'bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-lg p-2.5 transition-colors',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
