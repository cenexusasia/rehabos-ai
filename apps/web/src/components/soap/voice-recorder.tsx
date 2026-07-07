'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceRecording } from '@/hooks/use-voice-recording';
import { sendAudioForTranscription, WhisperError } from '@/lib/ai/whisper';

export type VoiceRecorderStatus = 'idle' | 'recording' | 'processing' | 'success' | 'error';

interface VoiceRecorderProps {
  /** Called with the transcribed text once Whisper returns a result */
  onTranscription: (text: string) => void;
  /** Optional: which SOAP section this recorder feeds (for labelling) */
  section?: string;
  className?: string;
  /** Optional: override the Whisper API key */
  apiKey?: string;
  /** Optional: language code (default 'en') */
  language?: string;
  /** Disable the recorder */
  disabled?: boolean;
}

export function VoiceRecorder({
  onTranscription,
  section,
  className,
  apiKey,
  language = 'en',
  disabled = false,
}: VoiceRecorderProps) {
  const [localStatus, setLocalStatus] = useState<VoiceRecorderStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const processingRef = useRef(false);

  const {
    isRecording,
    duration,
    error: recordingError,
    audioBlob,
    startRecording,
    stopRecording,
    reset,
  } = useVoiceRecording();

  // Format duration as mm:ss
  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle recording errors from the hook
  useEffect(() => {
    if (recordingError) {
      setErrorMessage(recordingError);
      setLocalStatus('error');
    }
  }, [recordingError]);

  // Auto-process when recording stops and we have a blob
  useEffect(() => {
    if (localStatus !== 'processing' && audioBlob && !isRecording && !processingRef.current) {
      processAudio(audioBlob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob, isRecording]);

  const processAudio = useCallback(
    async (blob: Blob) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setLocalStatus('processing');
      setErrorMessage(null);

      try {
        const text = await sendAudioForTranscription(blob, {
          apiKey,
          language,
        });
        setLocalStatus('success');
        onTranscription(text);

        // Reset to idle after a brief success indicator
        setTimeout(() => {
          setLocalStatus('idle');
          reset();
          processingRef.current = false;
        }, 1500);
      } catch (err) {
        if (err instanceof WhisperError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage(
            `Transcription failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          );
        }
        setLocalStatus('error');
        processingRef.current = false;
      }
    },
    [apiKey, language, onTranscription, reset],
  );

  const handleToggle = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
      // Processing will be triggered by the useEffect above
    } else {
      setLocalStatus('recording');
      setErrorMessage(null);
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const dismissError = useCallback(() => {
    setErrorMessage(null);
    setLocalStatus('idle');
    reset();
  }, [reset]);

  // Determine visual state
  const isProcessing = localStatus === 'processing';
  const isIdle = localStatus === 'idle' && !isRecording;
  const isSuccess = localStatus === 'success';
  const isError = localStatus === 'error';

  return (
    <div className={cn('inline-flex flex-col gap-1.5', className)}>
      <div className="flex items-center gap-2">
        {/* Record button */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled || isProcessing}
          title={
            isRecording
              ? 'Stop recording'
              : isProcessing
                ? 'Transcribing...'
                : 'Start voice recording'
          }
          className={cn(
            'relative inline-flex items-center justify-center rounded-full p-3 transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            // State-specific styles
            isIdle &&
              'border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground border shadow-sm',
            isRecording &&
              'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 animate-pulse',
            isProcessing && 'bg-primary/20 text-primary border border-primary/30',
            isSuccess && 'bg-green-500/15 text-green-500 border border-green-500/30',
            isError && 'bg-destructive/10 text-destructive border border-destructive/30',
          )}
        >
          {isIdle && <Mic className="h-5 w-5" />}
          {isRecording && <Square className="h-4 w-4" />}
          {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
          {isSuccess && <CheckCircle2 className="h-5 w-5" />}
          {isError && <AlertCircle className="h-5 w-5" />}
        </button>

        {/* Status label */}
        <div className="flex flex-col">
          {isIdle && (
            <span className="text-muted-foreground text-xs">
              {section ? `Record ${section}` : 'Voice input'}
            </span>
          )}
          {isRecording && (
            <span className="text-destructive text-xs font-medium tabular-nums">
              Recording {formatDuration(duration)}
            </span>
          )}
          {isProcessing && (
            <span className="text-primary text-xs font-medium">Transcribing...</span>
          )}
          {isSuccess && (
            <span className="text-green-500 text-xs font-medium">Transcription complete</span>
          )}
          {isError && (
            <button
              type="button"
              onClick={dismissError}
              className="text-destructive text-left text-xs font-medium underline underline-offset-2 hover:no-underline"
            >
              Error — tap to dismiss
            </button>
          )}
        </div>
      </div>

      {/* Error detail */}
      {isError && errorMessage && (
        <p className="text-destructive max-w-[280px] text-xs leading-relaxed">{errorMessage}</p>
      )}
    </div>
  );
}
