export const dynamic = 'force-dynamic';

import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col md:ml-0">
        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-14 sm:px-6 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
