'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, MessageSquare, User } from 'lucide-react';

import { useConversation } from '@/hooks/use-messages';
import { MessageThread } from '@/components/messaging/message-thread';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: conversation, isLoading, error } = useConversation(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6 py-8">
        <div className="text-center">
          <MessageSquare className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
          <h2 className="text-foreground text-lg font-semibold">Conversation not found</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            This conversation may have been deleted or you may not have access.
          </p>
          <button
            onClick={() => router.push('/messages')}
            className="mt-4 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  const patientName = conversation.patient
    ? `${conversation.patient.first_name} ${conversation.patient.last_name}`
    : 'Patient';

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border flex items-center gap-3 border-b px-4 py-3">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="bg-accent flex h-9 w-9 items-center justify-center rounded-full">
          <User className="text-muted-foreground h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-foreground truncate text-sm font-semibold">
              {patientName}
            </h1>
            {conversation.patient?.phone && (
              <span className="text-muted-foreground hidden text-xs sm:inline">
                · {conversation.patient.phone}
              </span>
            )}
          </div>
          {conversation.subject && (
            <p className="text-muted-foreground/70 truncate text-xs">
              {conversation.subject}
            </p>
          )}
        </div>

        {/* Desktop back link */}
        <button
          onClick={() => router.push('/messages')}
          className="text-muted-foreground hover:text-foreground hidden items-center gap-1.5 text-sm transition-colors lg:inline-flex"
        >
          <ArrowLeft className="h-4 w-4" />
          All Messages
        </button>
      </div>

      {/* Message Thread */}
      <MessageThread
        conversationId={id}
        patientName={patientName}
        className="flex-1"
      />
    </div>
  );
}
