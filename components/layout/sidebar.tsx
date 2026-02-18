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
  ChevronDown,
  ChevronUp,
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
  subItems?: { label: string; href: string; roles?: string[] }[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    // All roles can see dashboard
  },
  {
    label: 'Personnel',
    href: '/personnel',
    icon: <Users className="w-5 h-5" />,
    roles: ['Super Admin', 'Tenant Admin', 'Manager', 'HR Administrator', 'Auditor'],
    // Employee role removed - they should only see own profile via dashboard or dedicated profile page
  },
  {
    label: 'Payroll',
    href: '/payroll',
    icon: <DollarSign className="w-5 h-5" />,
    roles: ['Super Admin', 'Tenant Admin', 'Employee', 'Payroll Administrator', 'Finance Administrator', 'Auditor', 'Manager'],
    subItems: [
      { label: 'My Payslips', href: '/payroll', roles: ['Employee', 'Manager'] },
      { label: 'Admin Dashboard', href: '/payroll/admin', roles: ['Super Admin', 'Tenant Admin', 'Payroll Administrator', 'Finance Administrator', 'Auditor'] },
      { label: 'Salary Structure', href: '/payroll/salary-structure', roles: ['Super Admin', 'Tenant Admin', 'Payroll Administrator'] },
    ],
  },
  {
    label: 'Leave Management',
    href: '/leave',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['Super Admin', 'Tenant Admin', 'Employee', 'Manager', 'HR Administrator'],
  },
  {
    label: 'Travel & Expenses',
    href: '/travel',
    icon: <Plane className="w-5 h-5" />,
    roles: ['Super Admin', 'Tenant Admin', 'Employee', 'Manager', 'HR Administrator', 'Finance Administrator'],
  },
  {
    label: 'Performance',
    href: '/performance',
    icon: <TrendingUp className="w-5 h-5" />,
    roles: ['Super Admin', 'Tenant Admin', 'Employee', 'Manager', 'HR Administrator'],
  },
  {
    label: 'Attendance',
    href: '/attendance',
    icon: <Clock className="w-5 h-5" />,
    roles: ['Super Admin', 'Tenant Admin', 'Employee', 'Manager', 'HR Administrator'],
  },
  {
    label: 'Tax Management',
    href: '/tax',
    icon: <FileText className="w-5 h-5" />,
    roles: ['Super Admin', 'Tenant Admin', 'Employee', 'Payroll Administrator', 'Finance Administrator', 'Auditor'],
    subItems: [
      { label: 'Overview', href: '/tax' },
      { label: 'Declarations', href: '/tax/declarations' },
      { label: 'Form 16', href: '/tax/form16' },
      { label: 'Regime Comparison', href: '/tax/regime-comparison' },
    ],
  },
  {
    label: 'Recruitment',
    href: '/recruitment',
    icon: <Briefcase className="w-5 h-5" />,
    roles: ['Super Admin', 'Tenant Admin', 'HR Administrator'],
  },
  {
    label: 'Onboarding',
    href: '/onboarding',
    icon: <Users className="w-5 h-5" />,
    roles: ['Super Admin', 'Tenant Admin', 'HR Administrator'],
    subItems: [
      { label: 'Onboarding Dashboard', href: '/onboarding' },
      { label: 'Pre-joining Portal', href: '/onboarding/pre-joining' },
      { label: 'Offer Letters', href: '/onboarding/offer-letter' },
      { label: 'Verification', href: '/onboarding/verification' },
      { label: 'Background Check', href: '/onboarding/background-verification' },
    ],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['Super Admin', 'Tenant Admin', 'Manager', 'HR Administrator', 'Payroll Administrator', 'Finance Administrator', 'Auditor'],
  },
  {
    label: 'Approvals',
    href: '/approvals/leave',
    icon: <CheckCircle2 className="w-5 h-5" />,
    roles: ['Super Admin', 'Tenant Admin', 'Manager', 'HR Administrator', 'Finance Administrator'],
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
    roles: ['Super Admin', 'Tenant Admin', 'HR Administrator'],
    subItems: [
      { label: 'Users', href: '/admin/users', roles: ['Super Admin', 'Tenant Admin', 'HR Administrator'] },
      { label: 'Role & Permissions', href: '/admin/users/role-permissions', roles: ['Super Admin', 'Tenant Admin'] },
      { label: 'Access Certification', href: '/admin/access-certification', roles: ['Super Admin', 'Tenant Admin'] },
      { label: 'LDAP Config', href: '/admin/ldap-config', roles: ['Super Admin', 'Tenant Admin'] },
      { label: 'Departments', href: '/settings/departments', roles: ['Super Admin', 'Tenant Admin', 'HR Administrator'] },
      { label: 'Designations', href: '/settings/designations', roles: ['Super Admin', 'Tenant Admin', 'HR Administrator'] },
      { label: 'Permissions', href: '/settings/permissions', roles: ['Super Admin', 'Tenant Admin'] },
      { label: 'Audit Log', href: '/admin/audit-log', roles: ['Super Admin', 'Tenant Admin', 'HR Administrator'] },
      { label: 'Settings', href: '/settings', roles: ['Super Admin', 'Tenant Admin'] },
    ],
  },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { currentUser, currentTenant } = useAuth();
  const pathname = usePathname();
  
  // Auto-expand parent items if current path matches a sub-item
  const getInitialExpandedItems = () => {
    const expanded: string[] = [];
    navigationItems.forEach(item => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(subItem => pathname === subItem.href);
        if (hasActiveSubItem) {
          expanded.push(item.href);
        }
      }
    });
    return expanded;
  };
  
  const [expandedItems, setExpandedItems] = React.useState<string[]>(getInitialExpandedItems);

  const visibleItems = navigationItems.filter((item) => {
    // Super Admin can see everything
    if (currentUser?.role === 'Super Admin') {
      return true;
    }
    // If no roles specified, show to all authenticated users
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    // Check if user's role is in the allowed roles
    return item.roles.includes(currentUser?.role || '');
  });

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(h => h !== href)
        : [...prev, href]
    );
  };

  const isItemActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => pathname === subItem.href);
    }
    return false;
  };

  const isSubItemActive = (href: string) => pathname === href;

  return (
    <aside
      className={cn(
        'w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 fixed h-screen overflow-hidden z-30 flex flex-col',
        !isOpen && '-translate-x-full'
      )}
    >
      {/* Close button for mobile and desktop toggle */}
      <div className="absolute top-6 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-all"
          title={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </Button>
      </div>
      
      {/* Header Section */}
      <div className="p-6 border-b border-sidebar-border bg-gradient-to-b from-sidebar-primary/15 to-transparent flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-xl flex items-center justify-center shadow-md shadow-sidebar-primary/30">
            <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold text-sidebar-foreground leading-tight">Indian Bank</h2>
            <p className="text-xs text-sidebar-foreground/70">{currentTenant?.code}</p>
          </div>
        </div>
      </div>

      {/* Navigation Section - Scrollable */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 pb-20">
        {visibleItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItems.includes(item.href);
          const isActive = isItemActive(item);

          return (
            <div key={item.href} className="space-y-1">
              {hasSubItems ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.href)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="ml-4 space-y-1 border-l-2 border-sidebar-border pl-2">
                      {item.subItems?.filter((subItem) => {
                        // Filter sub-items based on roles if specified
                        if (subItem.roles && subItem.roles.length > 0) {
                          return subItem.roles.includes(currentUser?.role || '');
                        }
                        return true;
                      }).map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200',
                            isSubItemActive(subItem.href)
                              ? 'bg-sidebar-primary/80 text-sidebar-primary-foreground'
                              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          )}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <span className="flex-shrink-0 text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info Section - Fixed at bottom */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary/25 border border-sidebar-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-sidebar-primary">
              {currentUser?.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{currentUser?.name}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{currentUser?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
