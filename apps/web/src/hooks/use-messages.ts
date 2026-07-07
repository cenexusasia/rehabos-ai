'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  Message,
  ConversationListItem,
  SendMessageData,
  CreateConversationData,
} from '@/types/message';

// ── Conversation Hooks ──────────────────────────────────────────────────────

export function useConversations() {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .select(
          `id, patient_id, clinician_id, subject, is_archived, is_pinned, last_message_at, last_message_body, last_message_sender_type, unread_count, created_at,
          patient:patient_id(id, first_name, last_name, phone, email, avatar_url)`,
        )
        .or(`clinician_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return (data as ConversationListItem[]) ?? [];
    },
  });
}

export function useConversation(id: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['conversations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(
          `*,
          patient:patient_id(id, first_name, last_name, phone, email, avatar_url),
          clinician:clinician_id(id, first_name, last_name, avatar_url)`,
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// ── Message Hooks ────────────────────────────────────────────────────────────

export function useMessages(conversationId: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(
          `*,
          sender:sender_id(id, first_name, last_name, avatar_url)`,
        )
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data as Message[]) ?? [];
    },
    enabled: !!conversationId,
    // Poll every 5 seconds for real-time-ish updates
    refetchInterval: 5000,
  });
}

export function useUnreadCount() {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['messages', 'unread'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from('conversations')
        .select('unread_count')
        .eq('clinician_id', user.id)
        .eq('is_archived', false);

      if (error) throw error;
      return (data as { unread_count: number }[]).reduce(
        (sum, c) => sum + (c.unread_count || 0),
        0,
      );
    },
    refetchInterval: 15000,
  });
}

// ── Mutation Hooks ───────────────────────────────────────────────────────────

export function useSendMessage() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async (data: SendMessageData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Insert the message
      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: data.conversation_id,
        sender_id: user?.id ?? '',
        sender_type: 'clinician',
        body: data.body,
        attachment_urls: data.attachment_urls ?? [],
        status: 'sent',
      });
      if (msgError) throw msgError;

      // Update the conversation's last_message and unread_count
      const { error: convError } = await supabase
        .from('conversations')
        .update({
          last_message_body: data.body,
          last_message_sender_type: 'clinician',
          last_message_at: new Date().toISOString(),
        })
        .eq('id', data.conversation_id);

      if (convError) throw convError;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.conversation_id],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async (data: CreateConversationData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Check if conversation already exists with this patient
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('patient_id', data.patient_id)
        .eq('clinician_id', user?.id ?? '')
        .maybeSingle();

      if (existing) {
        // Add message to existing conversation
        const { error } = await supabase.from('messages').insert({
          conversation_id: existing.id,
          sender_id: user?.id ?? '',
          sender_type: 'clinician',
          body: data.body,
          attachment_urls: [],
          status: 'sent',
        });
        if (error) throw error;

        await supabase
          .from('conversations')
          .update({
            last_message_body: data.body,
            last_message_sender_type: 'clinician',
            last_message_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        return existing.id;
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          patient_id: data.patient_id,
          clinician_id: user?.id ?? '',
          subject: data.subject ?? null,
        })
        .select('id')
        .single();

      if (convError) throw convError;

      // Add initial message
      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: user?.id ?? '',
        sender_type: 'clinician',
        body: data.body,
        attachment_urls: [],
        status: 'sent',
      });
      if (msgError) throw msgError;

      return conversation.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkConversationRead() {
  const supabase = createClient() as any;

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);
      if (error) throw error;
    },
  });
}

// ── Invalidation Hook ────────────────────────────────────────────────────────

export function useInvalidateMessages() {
  const queryClient = useQueryClient();
  return {
    invalidateConversations: () =>
      queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    invalidateMessages: (conversationId: string) =>
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] }),
  };
}
