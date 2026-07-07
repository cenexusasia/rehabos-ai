export type MessageSenderType = 'clinician' | 'patient' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  organization_id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: MessageSenderType;
  body: string;
  attachment_urls: string[];
  status: MessageStatus;
  read_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

export interface Conversation {
  id: string;
  organization_id: string;
  patient_id: string;
  clinician_id: string;
  subject: string | null;
  is_archived: boolean;
  is_pinned: boolean;
  last_message_at: string | null;
  last_message_body: string | null;
  last_message_sender_type: MessageSenderType | null;
  unread_count: number;
  created_at: string;
  updated_at: string;

  // Joined relations
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  clinician?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
  last_message?: Message | null;
}

export type ConversationListItem = Pick<
  Conversation,
  | 'id'
  | 'patient_id'
  | 'clinician_id'
  | 'subject'
  | 'is_archived'
  | 'is_pinned'
  | 'last_message_at'
  | 'last_message_body'
  | 'last_message_sender_type'
  | 'unread_count'
  | 'created_at'
> & {
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
};

export interface SendMessageData {
  conversation_id: string;
  body: string;
  attachment_urls?: string[];
}

export interface CreateConversationData {
  patient_id: string;
  subject?: string;
  body: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

export const MESSAGE_STATUS_ICONS: Record<MessageStatus, string> = {
  sending: 'clock',
  sent: 'check',
  delivered: 'check-check',
  read: 'eye',
  failed: 'alert-circle',
};

export const SENDER_TYPE_LABELS: Record<MessageSenderType, string> = {
  clinician: 'You',
  patient: 'Patient',
  system: 'System',
};
