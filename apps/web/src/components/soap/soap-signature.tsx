'use client';

import { useState } from 'react';
import { Loader2, FileSignature } from 'lucide-react';
import { signSoapNote } from '@/app/_actions/soap-sign';

interface SoapSignatureProps {
  soapNoteId: string;
  clinicianName?: string;
  onSigned?: () => void;
}

export function SoapSignature({ soapNoteId, clinicianName, onSigned }: SoapSignatureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    setIsSigning(true);
    setError(null);
    try {
      await signSoapNote(soapNoteId);
      setIsOpen(false);
      onSigned?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <FileSignature className="h-4 w-4" />
        Sign & Lock
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">Sign SOAP Note</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Signing will lock this SOAP note from further edits.
              {clinicianName && (
                <> Signed by <span className="font-medium text-foreground">{clinicianName}</span>.</>
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Date: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>

            {error && (
              <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isSigning}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSign}
                disabled={isSigning}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSigning && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSigning ? 'Signing...' : 'Sign & Lock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
