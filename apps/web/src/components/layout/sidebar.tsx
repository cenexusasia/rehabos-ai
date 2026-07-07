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
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-card transition-all duration-200',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        {!collapsed && (
          <span className="text-sm font-semibold text-foreground">RehabOS AI</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
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
      <div className="flex items-center justify-center border-t border-border p-2">
        {!collapsed && <ThemeToggle />}
      </div>
    </aside>
  );
}
