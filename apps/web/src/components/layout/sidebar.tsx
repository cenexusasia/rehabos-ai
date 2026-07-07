'use client';

import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Dumbbell,
  ClipboardList,
  MessageSquare,
  Video,
  DollarSign,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Patients', href: '/patients', icon: <Users className="h-4 w-4" /> },
  { label: 'Schedule', href: '/schedule', icon: <Calendar className="h-4 w-4" /> },
  { label: 'SOAP Notes', href: '/soap', icon: <FileText className="h-4 w-4" /> },
  { label: 'Exercises', href: '/exercises', icon: <Dumbbell className="h-4 w-4" /> },
  { label: 'Assessments', href: '/assessments', icon: <ClipboardList className="h-4 w-4" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="h-4 w-4" /> },
  { label: 'Telehealth', href: '/telehealth', icon: <Video className="h-4 w-4" /> },
  { label: 'Billing', href: '/billing', icon: <DollarSign className="h-4 w-4" /> },
  { label: 'Analytics', href: '/analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { label: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Mobile hamburger button (fixed, always visible on small screens) ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-40 rounded-lg border border-border bg-card p-2 text-foreground shadow-sm md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          'flex h-screen flex-col border-r border-border bg-card transition-all duration-200',
          // Desktop: collapsed or expanded
          'max-md:fixed max-md:top-0 max-md:z-40 max-md:h-full',
          'max-md:transition-transform max-md:duration-300',
          mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          collapsed ? 'w-16' : 'w-56',
        )}
      >
        {/* ── Header ── */}
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          {!collapsed && (
            <span className="truncate text-sm font-semibold text-foreground">RehabOS AI</span>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors md:inline-flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors md:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  'md:py-2',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="flex items-center justify-center border-t border-border p-2">
          {!collapsed && <ThemeToggle />}
        </div>
      </aside>
    </>
  );
}
