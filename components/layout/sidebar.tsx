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
  Package,
  UserPen,
  AlertCircle,
  Globe,
  Sliders,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import apiService from '@/lib/api';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  moduleCode?: string; // BRD: Dynamic Module Management - DM-036
  subItems?: { label: string; href: string; roles?: string[]; moduleCode?: string; permissionRequired?: string }[];
}

// BRD: Platform Admin (Super Admin) - Full Platform Control
const platformAdminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  {
    label: 'Tenant Management',
    href: '/admin/tenants',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['Super Admin'],
  },
  {
    label: 'Companies & Modules',
    href: '/admin/modules',
    icon: <Package className="w-5 h-5" />,
    roles: ['Super Admin'],
  },
  {
    label: 'Subscription Packages',
    href: '/admin/subscription-packages',
    icon: <Package className="w-5 h-5" />,
    roles: ['Super Admin'],
  },
  {
    label: 'Module Master',
    href: '/admin/module-master',
    icon: <Package className="w-5 h-5" />,
    roles: ['Super Admin'],
  },
  {
    label: 'Integrations',
    href: '/admin/integrations',
    icon: <Globe className="w-5 h-5" />,
    roles: ['Super Admin'],
  },
  {
    label: 'Platform Settings',
    href: '/admin/platform-settings',
    icon: <Sliders className="w-5 h-5" />,
    roles: ['Super Admin'],
  },
  {
    label: 'Analytics & Usage',
    href: '/admin/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['Super Admin'],
  },
  {
    label: 'Audit Log',
    href: '/admin/audit-log',
    icon: <Settings className="w-5 h-5" />,
    roles: ['Super Admin'],
  },
];

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    // All roles can see dashboard - Core module, no moduleCode
  },
  {
    label: 'Personnel',
    href: '/personnel',
    icon: <Users className="w-5 h-5" />,
    roles: ['Tenant Admin', 'Manager', 'HR Administrator', 'Auditor'],
    moduleCode: 'PIS', // BRD: Dynamic Module Management - matches seed script
    // Employee role removed - they should only see own profile via dashboard or dedicated profile page
  },
  {
    label: 'Payroll',
    href: '/payroll',
    icon: <DollarSign className="w-5 h-5" />,
    roles: ['Tenant Admin', 'Employee', 'Payroll Administrator', 'Finance Administrator', 'Auditor', 'Manager'],
    moduleCode: 'PAYROLL', // BRD: Dynamic Module Management - matches seed script
    subItems: [
      { label: 'My Payslips', href: '/payroll', roles: ['Employee', 'Manager'] },
      { label: 'Process Payroll', href: '/payroll/admin', roles: ['Tenant Admin', 'Payroll Administrator'], permissionRequired: 'process_payroll' },
      { label: 'Admin Dashboard', href: '/payroll/admin', roles: ['Tenant Admin', 'Payroll Administrator', 'Finance Administrator', 'Auditor'] },
      { label: 'Salary Structure', href: '/payroll/salary-structure', roles: ['Tenant Admin', 'Payroll Administrator'], permissionRequired: 'process_payroll' },
      { label: 'EPFO Returns', href: '/payroll/epfo', roles: ['Tenant Admin', 'Payroll Administrator'], permissionRequired: 'process_payroll' },
      { label: 'ESIC Returns', href: '/payroll/esic', roles: ['Tenant Admin', 'Payroll Administrator'], permissionRequired: 'process_payroll' },
      { label: 'Tax Summary', href: '/tax', roles: ['Tenant Admin', 'Payroll Administrator', 'Finance Administrator', 'Auditor'] },
    ],
  },
  {
    label: 'Leave Management',
    href: '/leave',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['Tenant Admin', 'Employee', 'Manager', 'HR Administrator'],
    moduleCode: 'LEAVE', // BRD: Dynamic Module Management - matches seed script
    subItems: [
      { label: 'My Leaves', href: '/leave', roles: ['Employee', 'Manager'] },
      { label: 'Comp-Off', href: '/leave/comp-off', roles: ['Employee', 'Manager', 'HR Administrator', 'Tenant Admin'] },
      { label: 'Holiday Calendar', href: '/admin/leave/holiday-calendar', roles: ['HR Administrator', 'Tenant Admin'] },
      { label: 'Leave Encashment', href: '/admin/leave/encashment', roles: ['HR Administrator', 'Tenant Admin'] },
    ],
  },
  {
    label: 'Travel & Expenses',
    href: '/travel',
    icon: <Plane className="w-5 h-5" />,
    roles: ['Tenant Admin', 'Employee', 'Manager', 'HR Administrator', 'Finance Administrator'],
    moduleCode: 'TRAVEL', // BRD: Dynamic Module Management - matches seed script
  },
  {
    label: 'Loans & Advances',
    href: '/loans/my-loans',
    icon: <DollarSign className="w-5 h-5" />,
    roles: ['Tenant Admin', 'Employee', 'Manager', 'HR Administrator', 'Finance Administrator'],
    moduleCode: 'STAFF_LOANS', // BRD: Dynamic Module Management - matches seed script
    subItems: [
      { label: 'My Loans', href: '/loans/my-loans', roles: ['Employee'] },
      { label: 'Apply for Loan', href: '/loans/apply', roles: ['Employee'] },
      { label: 'Approval Queue', href: '/loans/approve', roles: ['Manager', 'HR Administrator', 'Finance Administrator', 'Tenant Admin'] },
      { label: 'Loan Management', href: '/loans/admin', roles: ['HR Administrator', 'Finance Administrator', 'Tenant Admin'] },
    ],
  },
  {
    label: 'Exit Management',
    href: '/exit/my-separation',
    icon: <FileText className="w-5 h-5" />,
    roles: ['Tenant Admin', 'Employee', 'Manager', 'HR Administrator', 'Finance Administrator'],
    moduleCode: 'EXIT_MGMT', // BRD: Dynamic Module Management - matches seed script
    subItems: [
      { label: 'My Exit Process', href: '/exit/my-separation', roles: ['Employee'] },
      { label: 'Submit Resignation', href: '/exit/apply', roles: ['Employee'] },
      { label: 'Exit Management', href: '/exit/admin', roles: ['HR Administrator', 'Finance Administrator', 'Tenant Admin'] },
    ],
  },
  {
    label: 'Profile Updates',
    href: '/employee/profile-update',
    icon: <UserPen className="w-5 h-5" />,
    roles: ['Tenant Admin', 'Employee', 'Manager', 'HR Administrator'],
    subItems: [
      { label: 'My Requests', href: '/employee/profile-update', roles: ['Employee', 'Manager'] },
      { label: 'Review Requests', href: '/approvals/profile-update', roles: ['Tenant Admin', 'Manager', 'HR Administrator'] },
    ],
  },
  {
    label: 'Grievance Management',
    href: '/grievance',
    icon: <AlertCircle className="w-5 h-5" />,
    roles: ['Tenant Admin', 'Employee', 'Manager', 'HR Administrator'],
    moduleCode: 'GRIEVANCE', // BRD: Dynamic Module Management - BR-P1-004
    subItems: [
      { label: 'My Grievances', href: '/grievance', roles: ['Employee'] },
      { label: 'Submit Grievance', href: '/grievance/submit', roles: ['Employee'] },
      { label: 'Grievance Dashboard', href: '/grievance', roles: ['HR Administrator', 'Tenant Admin', 'Manager'] },
    ],
  },
  {
    label: 'Performance',
    href: '/performance',
    icon: <TrendingUp className="w-5 h-5" />,
    roles: ['Tenant Admin', 'Employee', 'Manager', 'HR Administrator'],
    moduleCode: 'PERFORMANCE', // BRD: Dynamic Module Management - matches seed script
    subItems: [
      { label: 'My Appraisal', href: '/performance/my-appraisal', roles: ['Employee'] },
      { label: 'Manager Reviews', href: '/performance/manager/appraisals', roles: ['Manager', 'HR Administrator', 'Tenant Admin'] },
      { label: 'Appraisal Cycles', href: '/performance/cycles', roles: ['HR Administrator', 'Tenant Admin'] },
      { label: 'Normalization', href: '/performance/normalization', roles: ['HR Administrator', 'Tenant Admin'] },
    ],
  },
  {
    label: 'Attendance',
    href: '/attendance',
    icon: <Clock className="w-5 h-5" />,
    roles: ['Tenant Admin', 'Employee', 'Manager', 'HR Administrator'],
    moduleCode: 'ATTENDANCE', // BRD: Dynamic Module Management
    subItems: [
      { label: 'My Attendance', href: '/attendance', roles: ['Employee', 'Manager'] },
      { label: 'My Shift', href: '/attendance/my-shift', roles: ['Employee', 'Manager'] },
      { label: 'Overtime', href: '/attendance/overtime', roles: ['Employee', 'Manager'] },
      { label: 'Shift Roster', href: '/attendance/shift-roster', roles: ['HR Administrator', 'Tenant Admin'] },
      { label: 'Shift Management', href: '/admin/attendance/shifts', roles: ['HR Administrator', 'Tenant Admin'] },
      { label: 'Biometric Sync', href: '/admin/attendance/biometric', roles: ['HR Administrator', 'Tenant Admin'] },
      { label: 'Weekly Off', href: '/admin/attendance/weekly-off', roles: ['HR Administrator', 'Tenant Admin'] },
    ],
  },
  {
    label: 'Tax Management',
    href: '/tax',
    icon: <FileText className="w-5 h-5" />,
    roles: ['Tenant Admin', 'Employee', 'Payroll Administrator', 'Finance Administrator', 'Auditor'],
    moduleCode: 'TAX', // BRD: Dynamic Module Management - matches seed script
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
    roles: ['Tenant Admin', 'HR Administrator'],
    moduleCode: 'RECRUITMENT', // BRD: Dynamic Module Management
  },
  {
    label: 'Onboarding',
    href: '/onboarding',
    icon: <Users className="w-5 h-5" />,
    roles: ['Tenant Admin', 'HR Administrator'],
    moduleCode: 'ONBOARDING', // BRD: Dynamic Module Management
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
    roles: ['Tenant Admin', 'Manager', 'HR Administrator', 'Payroll Administrator', 'Finance Administrator', 'Auditor'],
    moduleCode: 'REPORTS_BASIC', // BRD: Dynamic Module Management - matches seed script
    subItems: [
      { label: 'Analytics Dashboard', href: '/reports' },
      { label: 'Standard Reports', href: '/reports/standard' },
      { label: 'Scheduled Reports', href: '/reports/scheduled' },
      { label: 'Report Builder', href: '/reports/builder' },
    ],
  },
  {
    label: 'Approvals',
    href: '/approvals/leave',
    icon: <CheckCircle2 className="w-5 h-5" />,
    roles: ['Tenant Admin', 'Manager', 'HR Administrator', 'Finance Administrator'],
    // Approvals is a core feature, no moduleCode
    subItems: [
      { label: 'Leave Approvals', href: '/approvals/leave' },
      { label: 'Travel Approvals', href: '/approvals/travel' },
      { label: 'Expense Approvals', href: '/approvals/expense' },
      { label: 'Profile Update Approvals', href: '/approvals/profile-update' },
    ],
  },
  {
    label: 'Administration',
    href: '/admin',
    icon: <Settings className="w-5 h-5" />,
    roles: ['Tenant Admin', 'HR Administrator'],
    // Administration is a core feature, no moduleCode
    subItems: [
      { label: 'Users', href: '/admin/users', roles: ['Tenant Admin', 'HR Administrator'] },
      { label: 'Role & Permissions', href: '/admin/users/role-permissions', roles: ['Tenant Admin'] },
      { label: 'Access Certification', href: '/admin/access-certification', roles: ['Tenant Admin'] },
      { label: 'LDAP Config', href: '/admin/ldap-config', roles: ['Tenant Admin'] },
      { label: 'Organization Chart', href: '/org/chart', roles: ['Tenant Admin', 'Manager'] },
      { label: 'Bulk Import/Export', href: '/admin/employees/bulk-import', roles: ['Tenant Admin', 'HR Administrator'] },
      { label: 'Departments', href: '/settings/departments', roles: ['Tenant Admin', 'HR Administrator'] },
      { label: 'Designations', href: '/settings/designations', roles: ['Tenant Admin', 'HR Administrator'] },
      { label: 'Permissions', href: '/settings/permissions', roles: ['Tenant Admin'] },
      { label: 'Audit Log', href: '/admin/audit-log', roles: ['Tenant Admin'] },
      { label: 'Settings', href: '/settings', roles: ['Tenant Admin'] },
    ],
  },
  {
    label: 'Module Management',
    href: '/company/modules',
    icon: <Package className="w-5 h-5" />,
    roles: ['Tenant Admin'],
    // Company Admin can request modules - no moduleCode (core feature for Tenant Admin)
  },
  // NOTE: Super Admin (Platform Admin) uses platformAdminNavItems below - NOT these operational modules
  {
    label: 'Learning & Development',
    href: '/lms/courses',
    icon: <Award className="w-5 h-5" />,
    roles: ['Tenant Admin', 'Employee', 'Manager', 'HR Administrator'],
    moduleCode: 'LMS', // BRD: Dynamic Module Management - BR-P1-005
    subItems: [
      { label: 'Course Catalog', href: '/lms/courses', roles: ['Employee', 'Manager', 'HR Administrator', 'Tenant Admin'] },
      { label: 'My Trainings', href: '/lms/my-trainings', roles: ['Employee'] },
      { label: 'Assign Training', href: '/lms/assign', roles: ['HR Administrator', 'Tenant Admin', 'Manager'] },
      { label: 'Certificates', href: '/lms/certificates', roles: ['Employee', 'Manager', 'HR Administrator', 'Tenant Admin'] },
    ],
  },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { currentUser, currentTenant, hasPermission } = useAuth();
  const pathname = usePathname();
  const [enabledModules, setEnabledModules] = React.useState<Set<string>>(new Set());
  const [modulesLoading, setModulesLoading] = React.useState(true);
  
  // BRD: Dynamic Module Management - DM-036
  // Fetch enabled modules for current tenant
  React.useEffect(() => {
    const loadEnabledModules = async () => {
      if (!currentUser?.tenantId) {
        setModulesLoading(false);
        return;
      }

      try {
        // Super Admin can see everything
        if (currentUser.role === 'Super Admin') {
          setEnabledModules(new Set());
          setModulesLoading(false);
          return;
        }

        const res = await apiService.getMyCompanyModules();
        if (res.success) {
          const enabled = new Set<string>();
          const raw = (res as any).data;
          const modules = Array.isArray(raw) ? raw : (raw?.modules ?? (res as any).modules ?? []);
          modules.forEach((cm: any) => {
            if (cm.isEnabled && cm.moduleId?.moduleCode) {
              enabled.add(cm.moduleId.moduleCode);
            }
          });
          setEnabledModules(enabled);
        }
      } catch (error) {
        console.error('Failed to load enabled modules:', error);
        // On error, show all items (graceful degradation)
        setEnabledModules(new Set());
      } finally {
        setModulesLoading(false);
      }
    };

    loadEnabledModules();
  }, [currentUser?.tenantId, currentUser?.role]);
  
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

  // BRD: Super Admin (Platform Admin) sees ONLY platform-level nav - NOT Personnel, Payroll, Leave, etc.
  // Platform Admin manages: Tenants, Modules, Subscriptions - Company Admin does operational HR
  const visibleItems =
    currentUser?.role === 'Super Admin'
      ? platformAdminNavItems.filter((item) => !item.roles || item.roles.includes('Super Admin'))
      : navigationItems.filter((item) => {
          // BRD: No bypass - show only modules enabled for tenant, filtered by role
          if (item.moduleCode) {
            const isPayrollRole = ['Payroll Administrator', 'Finance Administrator'].includes(currentUser?.role || '');
            const isPayrollItem = item.moduleCode === 'PAYROLL';
            if (isPayrollItem && isPayrollRole) {
              // Payroll roles always see Payroll - getMyCompanyModules may exclude them
            } else {
              if (modulesLoading) return false;
              if (!enabledModules.has(item.moduleCode)) return false;
            }
          }
          if (!item.roles || item.roles.length === 0) return true;
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
                        // BRD: No bypass - Super Admin uses platform nav; others follow module + role
                        if (subItem.moduleCode && currentUser?.role !== 'Super Admin') {
                          if (modulesLoading || !enabledModules.has(subItem.moduleCode)) {
                            return false;
                          }
                        }
                        // Permission-based: e.g. Process Payroll only for Maker (process_payroll)
                        if (subItem.permissionRequired && !hasPermission(subItem.permissionRequired)) {
                          return false;
                        }
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
              {(currentUser?.name ?? '')
                .split(' ')
                .map((n) => n[0])
                .filter(Boolean)
                .join('') || '?'}
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
