'use client';

import { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Loader2,
  Pin,
  ChevronRight,
  User,
  Inbox,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useConversations } from '@/hooks/use-messages';
import type { ConversationListItem } from '@/types/message';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const selectedPatientId = searchParams.get('patientId');

  const { data: conversations, isLoading, error } = useConversations();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    let filtered = [...conversations];

    if (filter === 'unread') {
      filtered = filtered.filter((c) => (c.unread_count ?? 0) > 0);
    } else if (filter === 'archived') {
      filtered = filtered.filter((c) => c.is_archived);
    } else {
      filtered = filtered.filter((c) => !c.is_archived);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((c) => {
        const name = c.patient
          ? `${c.patient.first_name} ${c.patient.last_name}`.toLowerCase()
          : '';
        const subject = (c.subject ?? '').toLowerCase();
        return name.includes(q) || subject.includes(q);
      });
    }

    return filtered;
  }, [conversations, filter, search]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Communicate securely with your patients
        </p>
      </div>

      <div className="flex gap-6">
        {/* Conversation List */}
        <div className="w-full lg:w-96 lg:shrink-0">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="mb-4 flex items-center gap-1 rounded-lg bg-muted/50 p-0.5">
            {(['all', 'unread', 'archived'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  filter === f
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f === 'all' ? 'Inbox' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Loading & Error */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
              Failed to load conversations.
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredConversations.length === 0 && (
            <div className="py-8 text-center">
              <Inbox className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">No conversations</p>
              <p className="text-muted-foreground/60 mt-1 text-xs">
                {search ? 'No results for your search' : 'Start a conversation from a patient profile'}
              </p>
            </div>
          )}

          {/* Conversation List */}
          {!isLoading && !error && (
            <div className="space-y-1">
              {filteredConversations.map((conv) => (
                <ConversationRow
                  key={conv.id}
                  conversation={conv}
                  isHighlighted={conv.patient_id === selectedPatientId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Empty Thread View (desktop) */}
        <div className="border-border bg-card hidden flex-1 items-center justify-center rounded-xl border lg:flex">
          <div className="text-center">
            <MessageSquare className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <h3 className="text-foreground text-lg font-medium">Select a conversation</h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              Choose a conversation from the list to view and reply to messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Conversation Row ─────────────────────────────────────────────────────────

function ConversationRow({
  conversation,
  isHighlighted,
}: {
  conversation: ConversationListItem;
  isHighlighted?: boolean;
}) {
  const lastMessageDate = conversation.last_message_at
    ? formatConversationTime(conversation.last_message_at)
    : '';

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className={cn(
        'flex items-start gap-3 rounded-lg p-3 transition-colors',
        isHighlighted
          ? 'bg-primary/5 border border-primary/20'
          : 'border border-transparent hover:bg-accent/50',
      )}
    >
      <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
        <User className="text-muted-foreground h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-foreground truncate text-sm font-medium">
            {conversation.patient
              ? `${conversation.patient.first_name} ${conversation.patient.last_name}`
              : 'Unknown Patient'}
          </p>
          {lastMessageDate && (
            <span className="text-muted-foreground shrink-0 text-[10px]">
              {lastMessageDate}
            </span>
          )}
        </div>

        {conversation.subject && (
          <p className="text-muted-foreground/70 truncate text-xs font-medium">
            {conversation.subject}
          </p>
        )}

        <div className="mt-0.5 flex items-center gap-2">
          {conversation.last_message_body ? (
            <p className="text-muted-foreground/50 truncate text-xs">
              {conversation.last_message_sender_type === 'clinician'
                ? 'You: '
                : ''}
              {conversation.last_message_body}
            </p>
          ) : (
            <p className="text-muted-foreground/30 text-xs italic">No messages yet</p>
          )}

          {(conversation.unread_count ?? 0) > 0 && (
            <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
              {conversation.unread_count}
            </span>
          )}

          {conversation.is_pinned && (
            <Pin className="text-muted-foreground/40 h-3 w-3 shrink-0" />
          )}
        </div>
      </div>

      <ChevronRight className="text-muted-foreground/40 mt-2 h-3.5 w-3.5 shrink-0" />
    </Link>
  );
}

// ── Helper ───────────────────────────────────────────────────────────────────

function formatConversationTime(dateStr: string): string {
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
