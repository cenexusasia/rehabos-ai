'use client';

import { SignOutButton } from '@/components/auth/sign-out';
import { useUser } from '@/hooks/use-user';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-foreground text-lg font-semibold">RehabOS AI</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">{user?.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-foreground text-3xl font-bold">
            Welcome to RehabOS AI
          </h2>
          <p className="text-muted-foreground mt-2">
            AI-Native Operating System for Rehabilitation Professionals
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-4">
            {[
              { title: 'Patients', desc: 'Manage patient records', href: '#' },
              { title: 'Schedule', desc: 'Appointments & calendar', href: '#' },
              {
                title: 'SOAP Notes',
                desc: 'AI-powered documentation',
                href: '#',
              },
              { title: 'Exercises', desc: 'Exercise library & HEP', href: '#' },
              { title: 'Assessments', desc: 'Outcome measures', href: '#' },
              { title: 'Analytics', desc: 'Practice insights', href: '#' },
            ].map((item) => (
              <button
                key={item.title}
                className="border-border bg-card hover:border-primary/50 hover:bg-accent/50 rounded-xl border p-4 text-left transition-all"
              >
                <h3 className="text-foreground font-medium">{item.title}</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
