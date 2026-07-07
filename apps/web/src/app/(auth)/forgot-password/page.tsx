'use client';

import { Mail, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Reset password
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        {sent ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                <CheckCircle2 className="text-primary h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-foreground text-sm font-medium">
                  Check your email
                </h2>
                <p className="text-muted-foreground text-sm">
                  We&apos;ve sent a password reset link to{' '}
                  <span className="text-foreground font-medium">{email}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
              className={cn(
                'border-input bg-background text-foreground w-full rounded-lg border py-2.5 text-sm font-medium',
                'hover:bg-accent transition-colors',
                'focus:ring-primary focus:ring-offset-background focus:ring-2 focus:ring-offset-2 focus:outline-none',
              )}
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendResetLink} className="space-y-4">
            {error && (
              <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-foreground text-sm font-medium"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={cn(
                    'border-input bg-background text-foreground w-full rounded-lg border py-2 pr-3 pl-10 text-sm',
                    'placeholder:text-muted-foreground/60',
                    'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none',
                    'transition-colors',
                  )}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'bg-primary text-primary-foreground w-full rounded-lg py-2.5 text-sm font-medium',
                'hover:bg-primary/90 transition-colors',
                'focus:ring-primary focus:ring-offset-background focus:ring-2 focus:ring-offset-2 focus:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'inline-flex items-center justify-center gap-2',
              )}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>

      <p className="text-center">
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
