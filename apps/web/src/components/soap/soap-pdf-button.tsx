'use client';

import { useCallback, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SoapPdfData } from '@/lib/pdf/soap-pdf';

interface SoapPdfButtonProps {
  data: SoapPdfData;
  fileName?: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  children?: React.ReactNode;
}

export function SoapPdfButton({
  data,
  fileName,
  className,
  variant = 'default',
  children,
}: SoapPdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { SoapPdfDocument } = await import('@/lib/pdf/soap-pdf');

      const blob = await pdf(<SoapPdfDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download =
        fileName ??
        `soap-note-${data.patientName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [data, fileName]);

  const variantStyles: Record<string, string> = {
    default:
      'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    ghost:
      'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    outline:
      'border border-border bg-card text-foreground hover:bg-accent',
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50',
          variantStyles[variant],
          className,
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {children ?? 'Download PDF'}
      </button>
      {error && (
        <span className="text-destructive text-xs">{error}</span>
      )}
    </div>
  );
}
