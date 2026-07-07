'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'error';

export interface VoiceRecordingState {
  isRecording: boolean;
  status: RecordingStatus;
  duration: number; // seconds
  error: string | null;
  audioBlob: Blob | null;
}

export interface UseVoiceRecordingReturn extends VoiceRecordingState {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  reset: () => void;
}

/**
 * Hook for browser-based audio recording using the MediaRecorder API.
 *
 * @returns Control functions and state for voice recording
 *
 * @example
 * ```tsx
 * const { isRecording, duration, startRecording, stopRecording } = useVoiceRecording();
 * ```
 */
export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setDuration(0);
    chunksRef.current = [];

    // Check for MediaRecorder support
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Recording is not supported in this browser.');
      setStatus('error');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone permissions.');
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.');
      } else {
        setError(
          `Microphone error: ${err instanceof Error ? err.message : 'Unable to access microphone'}`,
        );
      }
      setStatus('error');
      return;
    }

    try {
      // Determine supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        // Stop all tracks so the microphone light turns off
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.onerror = () => {
        setError('Recording error occurred.');
        setStatus('error');
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(100); // collect data every 100ms for low-latency
      setStatus('recording');
      startTimeRef.current = Date.now();

      // Start duration counter
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 200);
    } catch (err) {
      setError(
        `Failed to start recording: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      setStatus('error');
      stream.getTracks().forEach((t) => t.stop());
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      return audioBlob;
    }

    return new Promise<Blob | null>((resolve) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      recorder.addEventListener('stop', () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType,
        });
        setAudioBlob(blob);
        setStatus('idle');
        setDuration(0);
        resolve(blob);
      });

      recorder.stop();
    });
  }, [audioBlob]);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus('idle');
    setDuration(0);
    setError(null);
    setAudioBlob(null);
    chunksRef.current = [];
  }, []);

  return {
    isRecording: status === 'recording',
    status,
    duration,
    error,
    audioBlob,
    startRecording,
    stopRecording,
    reset,
  };
}
