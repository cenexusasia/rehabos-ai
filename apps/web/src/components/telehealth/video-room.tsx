'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare } from 'lucide-react';

import { cn } from '@/lib/utils';

interface VideoRoomProps {
  roomName: string;
  patientName: string;
  userName: string;
  onEndCall: () => void;
  className?: string;
}

/**
 * VideoRoom component with Jitsi Meet iframe integration.
 * Falls back to a simulated video room when Jitsi is not available.
 */
export function VideoRoom({
  roomName,
  patientName,
  userName,
  onEndCall,
  className,
}: VideoRoomProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [jitsiError, setJitsiError] = useState(false);

  // Construct Jitsi meeting URL
  const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si';
  const meetingUrl = `https://${jitsiDomain}/${encodeURIComponent(roomName)}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName="${encodeURIComponent(userName)}"`;

  useEffect(() => {
    // Try to load Jitsi API script
    const script = document.createElement('script');
    script.src = `https://${jitsiDomain}/external_api.js`;
    script.async = true;
    script.onload = () => {
      setIsJitsiLoaded(true);
    };
    script.onerror = () => {
      setJitsiError(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [jitsiDomain]);

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Video Area */}
      <div className="relative flex flex-1 items-center justify-center bg-black">
        {jitsiError ? (
          /* Fallback Simulated Room */
          <div className="flex flex-col items-center gap-4">
            <div className="border-border bg-card flex h-48 w-48 items-center justify-center rounded-full border-4">
              <div className="text-center">
                <div className="bg-primary/20 mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full">
                  <span className="text-primary text-3xl font-bold">
                    {patientName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-foreground text-sm font-medium">{patientName}</p>
                <p className="text-muted-foreground text-xs">Connected</p>
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              Jitsi Meet unavailable — using simulated room
            </p>
            <p className="text-muted-foreground text-[10px]">
              Room: {roomName}
            </p>
          </div>
        ) : (
          /* Jitsi Iframe */
          <iframe
            ref={iframeRef}
            src={meetingUrl}
            className="absolute inset-0 h-full w-full"
            allow="camera; microphone; display-capture; fullscreen"
            allowFullScreen
            title="Telehealth Video Room"
          />
        )}

        {/* Waiting for Jitsi overlay */}
        {!isJitsiLoaded && !jitsiError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="text-foreground font-medium">Connecting to video room...</p>
              <p className="text-muted-foreground mt-1 text-xs">{roomName}</p>
            </div>
          </div>
        )}

        {/* In-call controls - always visible */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/70 px-4 py-2 backdrop-blur-sm">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
              isMicOn
                ? 'bg-muted/30 text-white hover:bg-muted/50'
                : 'bg-destructive/80 text-white',
            )}
            title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
              isCameraOn
                ? 'bg-muted/30 text-white hover:bg-muted/50'
                : 'bg-destructive/80 text-white',
            )}
            title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/30 text-white transition-colors hover:bg-muted/50"
            title="Toggle chat"
          >
            <MessageSquare className="h-5 w-5" />
          </button>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
            onClick={onEndCall}
            title="End call"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Patient Info Bar */}
      <div className="border-border bg-card flex items-center justify-between border-t px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-full">
            <span className="text-primary text-xs font-bold">
              {patientName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">{patientName}</p>
            <p className="text-muted-foreground text-[10px]">
              {isCameraOn ? 'Video On' : 'Video Off'} · {isMicOn ? 'Audio On' : 'Muted'}
            </p>
          </div>
        </div>
        <span className="text-muted-foreground text-xs">
          Room: {roomName}
        </span>
      </div>

      {/* Chat Sidebar */}
      {isChatOpen && (
        <div className="border-border bg-card flex h-64 flex-col border-t">
          <div className="border-border flex items-center justify-between border-b px-4 py-2">
            <span className="text-foreground text-sm font-medium">In-Call Chat</span>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-muted-foreground text-center text-xs">
              Chat messages appear here during the session.
            </p>
          </div>
          <div className="border-border flex border-t p-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="border-border bg-background text-foreground placeholder:text-muted-foreground min-w-0 flex-1 rounded-l-lg border px-3 py-1.5 text-sm focus:outline-none"
            />
            <button className="bg-primary text-primary-foreground rounded-r-lg px-3 py-1.5 text-sm font-medium">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
