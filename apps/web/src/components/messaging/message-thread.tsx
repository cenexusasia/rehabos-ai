'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Send, Loader2, Check, CheckCheck, AlertCircle, Paperclip } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useMessages, useSendMessage, useMarkConversationRead } from '@/hooks/use-messages';
import type { MessageStatus } from '@/types/message';

interface MessageThreadProps {
  conversationId: string;
  patientName?: string;
  className?: string;
}

export function MessageThread({
  conversationId,
  patientName,
  className,
}: MessageThreadProps) {
  const { data: messages, isLoading, error } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const markRead = useMarkConversationRead();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mark conversation as read when thread opens
  useEffect(() => {
    if (conversationId) {
      markRead.mutate(conversationId);
    }
  }, [conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = newMessage.trim();
    if (!text) return;

    setNewMessage('');
    try {
      await sendMessage.mutateAsync({
        conversation_id: conversationId,
        body: text,
      });
    } catch {
      // Error handled by mutation
      setNewMessage(text); // Restore on failure
    }
  }, [newMessage, sendMessage, conversationId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            Failed to load messages.
          </div>
        )}

        {!isLoading && !error && messages && messages.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">No messages yet</p>
              <p className="text-muted-foreground/60 mt-1 text-xs">
                Send a message to start the conversation.
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && messages && messages.length > 0 && (
          <div className="space-y-3">
            {/* Date separators would go here for production */}
            {messages.map((msg, idx) => {
              const isClinician = msg.sender_type === 'clinician';
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const showAvatar =
                !prevMsg || prevMsg.sender_id !== msg.sender_id;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    isClinician ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[75%]',
                      isClinician ? 'items-end' : 'items-start',
                    )}
                  >
                    {/* Sender name (for patient messages) */}
                    {!isClinician && showAvatar && (
                      <p className="text-muted-foreground mb-1 px-1 text-[10px] font-medium">
                        {patientName ?? 'Patient'}
                      </p>
                    )}

                    {/* Message bubble */}
                    <div
                      className={cn(
                        'rounded-2xl px-3 py-2 text-sm leading-relaxed',
                        isClinician
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-accent text-accent-foreground rounded-bl-md',
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    </div>

                    {/* Timestamp + status */}
                    <div
                      className={cn(
                        'mt-0.5 flex items-center gap-1 px-1',
                        isClinician ? 'justify-end' : 'justify-start',
                      )}
                    >
                      <span className="text-muted-foreground/60 text-[10px]">
                        {formatMessageTime(msg.created_at)}
                      </span>
                      {isClinician && (
                        <MessageStatusIcon status={msg.status} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-border flex items-end gap-2 border-t p-3">
        <button
          className="text-muted-foreground hover:text-foreground mb-0.5 rounded-md p-1.5 transition-colors"
          title="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${patientName ?? 'patient'}...`}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sendMessage.isPending}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
            newMessage.trim()
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed',
          )}
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// ── Message Status Icon ──────────────────────────────────────────────────────

function MessageStatusIcon({ status }: { status: MessageStatus }) {
  switch (status) {
    case 'sending':
      return <Loader2 className="text-muted-foreground/40 h-2.5 w-2.5 animate-spin" />;
    case 'sent':
      return <Check className="text-muted-foreground/40 h-2.5 w-2.5" />;
    case 'delivered':
      return <CheckCheck className="text-muted-foreground/60 h-2.5 w-2.5" />;
    case 'read':
      return <CheckCheck className="text-blue-400 h-2.5 w-2.5" />;
    case 'failed':
      return <AlertCircle className="text-red-400 h-2.5 w-2.5" />;
    default:
      return null;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatMessageTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
