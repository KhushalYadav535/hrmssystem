'use client';

import React from "react"

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  Plane,
  TrendingUp,
  FileText,
  Settings,
  Clock,
  Award,
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  subItems?: { label: string; href: string }[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Personnel',
    href: '/personnel',
    icon: <Users className="w-5 h-5" />,
    roles: ['Employee', 'Manager', 'HR Administrator'],
  },
  {
    label: 'Payroll',
    href: '/payroll',
    icon: <DollarSign className="w-5 h-5" />,
    roles: ['Employee', 'Payroll Administrator', 'HR Administrator'],
  },
  {
    label: 'Leave Management',
    href: '/leave',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['Employee', 'Manager', 'HR Administrator'],
  },
  {
    label: 'Travel & Expenses',
    href: '/travel',
    icon: <Plane className="w-5 h-5" />,
    roles: ['Employee', 'Manager', 'HR Administrator'],
  },
  {
    label: 'Performance',
    href: '/performance',
    icon: <TrendingUp className="w-5 h-5" />,
    roles: ['Employee', 'Manager', 'HR Administrator'],
  },
  {
    label: 'Attendance',
    href: '/attendance',
    icon: <Clock className="w-5 h-5" />,
    roles: ['Employee', 'Manager', 'HR Administrator'],
  },
  {
    label: 'Tax Management',
    href: '/tax',
    icon: <FileText className="w-5 h-5" />,
    roles: ['Employee', 'Payroll Administrator', 'HR Administrator'],
  },
  {
    label: 'Recruitment',
    href: '/recruitment',
    icon: <Briefcase className="w-5 h-5" />,
    roles: ['HR Administrator'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['Manager', 'HR Administrator', 'Payroll Administrator'],
  },
  {
    label: 'Approvals',
    href: '/approvals/leave',
    icon: <CheckCircle2 className="w-5 h-5" />,
    roles: ['Manager', 'HR Administrator'],
    subItems: [
      { label: 'Leave Approvals', href: '/approvals/leave' },
      { label: 'Travel Approvals', href: '/approvals/travel' },
      { label: 'Expense Approvals', href: '/approvals/expense' },
    ],
  },
  {
    label: 'Administration',
    href: '/admin',
    icon: <Settings className="w-5 h-5" />,
    roles: ['HR Administrator'],
    subItems: [
      { label: 'Departments', href: '/settings/departments' },
      { label: 'Designations', href: '/settings/designations' },
      { label: 'Permissions', href: '/settings/permissions' },
      { label: 'Settings', href: '/settings' },
    ],
  },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { currentUser, currentTenant } = useAuth();
  const pathname = usePathname();

  const visibleItems = navigationItems.filter((item) => !item.roles || item.roles.includes(currentUser?.role || ''));

  return (
    <aside
      className={cn(
        'w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 fixed h-full overflow-y-auto z-30',
        !isOpen && '-translate-x-full'
      )}
    >
      {/* Close button for mobile and desktop toggle */}
      <div className="absolute top-6 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-lg transition-all"
          title={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </Button>
      </div>
      <div className="p-6 border-b border-sidebar-border/50 bg-gradient-to-b from-sidebar-primary/10 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-sidebar-primary to-accent rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-sidebar-foreground leading-tight">Indian Bank</h2>
            <p className="text-xs text-sidebar-foreground/60">{currentTenant?.code}</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
              pathname === item.href
                ? 'bg-sidebar-primary text-white shadow-lg'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
            )}
          >
            <span className="flex-shrink-0 text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Info Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-sidebar-primary">
              {currentUser?.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{currentUser?.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{currentUser?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
