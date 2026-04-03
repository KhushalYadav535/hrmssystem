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
  ShieldCheck,
  Puzzle,
  Link2,
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

/** Normalize API payloads — request() may set data to { codes } or a wider envelope. */
function parseEnabledModuleCodesPayload(payload: unknown): string[] | null {
  if (payload == null || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;
  if (Array.isArray(p.codes)) return p.codes.map((x) => String(x));
  const nested = p.data;
  if (nested && typeof nested === 'object' && Array.isArray((nested as Record<string, unknown>).codes)) {
    return ((nested as { codes: unknown[] }).codes).map((x) => String(x));
  }
  return null;
}

/** getMyCompanyModules: backend returns { modules: [] } merged into response.data as full JSON body. */
function parseCodesFromCompanyModulesPayload(payload: unknown): string[] | null {
  if (payload == null || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;
  const modules = Array.isArray(p.modules) ? p.modules : null;
  if (!modules) return null;
  return modules
    .filter((cm: any) => cm?.isEnabled && cm?.moduleId?.moduleCode)
    .map((cm: any) => String(cm.moduleId.moduleCode));
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
    subItems: [
      { label: 'General Settings', href: '/admin/platform-settings', roles: ['Super Admin'] },
      { label: 'Compliance', href: '/admin/platform-settings/compliance', roles: ['Super Admin'] },
      { label: 'White-Label', href: '/admin/platform-settings/white-label', roles: ['Super Admin'] },
    ],
  },
  {
    label: 'Platform Team',
    href: '/admin/platform-team',
    icon: <Users className="w-5 h-5" />,
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
  {
    label: 'Login Activity',
    href: '/admin/login-activity',
    icon: <AlertCircle className="w-5 h-5" />,
    roles: ['Super Admin'],
  },
  {
    label: 'IP Whitelist',
    href: '/admin/ip-whitelist',
    icon: <ShieldCheck className="w-5 h-5" />,
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
    label: 'Workforce',
    href: '/workforce',
    subItems: [
      { label: 'Employee List', href: '/workforce/employees', roles: ['Tenant Admin', 'HR Administrator'] },
      { label: 'Add Employee', href: '/workforce/add-employee', roles: ['Tenant Admin', 'HR Administrator'] },
      { label: 'Branch Promotions', href: '/workforce/promotions/branch-promotion', roles: ['Tenant Admin', 'HR Administrator'] },
      { label: 'Vacant Positions', href: '/workforce/positions/vacant-positions', roles: ['Tenant Admin', 'HR Administrator'] },
      { label: 'Branch Reports', href: '/workforce/reports/branch-report', roles: ['Tenant Admin', 'HR Administrator'] },
      { label: 'Org Chart', href: '/org/chart', roles: ['Tenant Admin', 'HR Administrator'] },
    ],
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
      { label: '⚡ Async Payroll Queue', href: '/payroll/queue', roles: ['Tenant Admin', 'Payroll Administrator'], permissionRequired: 'process_payroll' },
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
      { label: 'Leave policies', href: '/settings/leave-policies', roles: ['HR Administrator', 'Tenant Admin'] },
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
      { label: 'Competency Library', href: '/performance/competencies', roles: ['HR Administrator', 'Tenant Admin'] },
      { label: 'Appraisal Disputes', href: '/performance/disputes', roles: ['Employee', 'Manager', 'HR Administrator', 'Tenant Admin'] },
      { label: 'Increment Management', href: '/performance/increments', roles: ['HR Administrator', 'Tenant Admin'] },
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
    // Tenant Admin uses the dedicated "Reports" block below (System Admin hub) — avoid duplicate /reports key
    roles: ['Manager', 'HR Administrator', 'Payroll Administrator', 'Finance Administrator', 'Auditor'],
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
  // US-B3-01: New System Admin Hub Navigation Structure
  // For Tenant Admin (System Admin), show only system administration menus
  // These menus replace the HR operational menus for Tenant Admin role
  {
    label: 'Security & Access',
    href: '/admin/users',
    icon: <ShieldCheck className="w-5 h-5" />,
    roles: ['Tenant Admin'],
    subItems: [
      { label: 'Users', href: '/admin/users', roles: ['Tenant Admin'] },
      { label: 'Roles & Permissions', href: '/admin/users/role-permissions', roles: ['Tenant Admin'] },
      { label: 'Module Permissions', href: '/settings/permissions', roles: ['Tenant Admin'] },
      { label: 'Access Policies', href: '/admin/access-certification', roles: ['Tenant Admin'] },
      { label: 'Session Management', href: '/admin/sessions', roles: ['Tenant Admin'] },
      { label: 'Audit & Logs', href: '/admin/audit-log', roles: ['Tenant Admin'] },
    ],
  },
  {
    label: 'Configuration',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
    roles: ['Tenant Admin', 'HR Administrator'],
    subItems: [
      { label: 'Tenant Settings', href: '/settings', roles: ['Tenant Admin'] },
      { label: 'Organization Structure', href: '/settings/org-structure/org-tree', roles: ['Tenant Admin'] },
      { label: 'Departments', href: '/settings/departments', roles: ['Tenant Admin'] },
      { label: 'Head Office', href: '/settings/org-structure/zone-master?create=ho', roles: ['Tenant Admin'] },
      { label: 'Zone Master', href: '/settings/org-structure/zone-master', roles: ['Tenant Admin'] },
      { label: 'Branch Master', href: '/settings/org-structure/branch-master', roles: ['Tenant Admin'] },
      { label: 'Employee Transfer', href: '/settings/org-structure/employee-transfer', roles: ['Tenant Admin', 'HR Administrator'] },
      { label: 'Transfer Log', href: '/settings/org-structure/transfer-log', roles: ['Tenant Admin', 'HR Administrator'] },
      { label: 'Workflow Settings', href: '/settings/workflows', roles: ['Tenant Admin'] },
      { label: 'Designations', href: '/settings/designations', roles: ['Tenant Admin'] },
      { label: 'Modules', href: '/company/modules', roles: ['Tenant Admin'] },
    ],
  },
  {
    label: 'Integrations',
    href: '/admin/integrations',
    icon: <Link2 className="w-5 h-5" />,
    roles: ['Tenant Admin'],
    subItems: [
      { label: 'API & Webhooks', href: '/admin/integrations', roles: ['Tenant Admin'] },
      { label: 'SSO & Identity', href: '/admin/ldap-config', roles: ['Tenant Admin'] },
    ],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['Tenant Admin'],
    subItems: [
      { label: 'Analytics Dashboard', href: '/reports', roles: ['Tenant Admin'] },
      { label: 'Standard Reports', href: '/reports/standard', roles: ['Tenant Admin'] },
      { label: 'Scheduled Reports', href: '/reports/scheduled', roles: ['Tenant Admin'] },
      { label: 'Report Builder', href: '/reports/builder', roles: ['Tenant Admin'] },
      { label: 'Security & Audit Log', href: '/admin/audit-log', roles: ['Tenant Admin'] },
    ],
  },
  {
    label: 'Administration',
    href: '/admin',
    icon: <Settings className="w-5 h-5" />,
    roles: ['HR Administrator'], // HR Admin sees this, not System Admin
    // Administration is a core feature, no moduleCode
    subItems: [
      { label: 'Users', href: '/admin/users', roles: ['HR Administrator'] },
      { label: 'Role & Permissions', href: '/admin/users/role-permissions', roles: ['HR Administrator'] },
      { label: 'Access Certification', href: '/admin/access-certification', roles: ['HR Administrator'] },
      { label: 'Session Management', href: '/admin/sessions', roles: ['HR Administrator'] },
      { label: 'Promotions', href: '/employee/promotions', roles: ['HR Administrator', 'Manager'] },
      { label: 'Disciplinary Records', href: '/employee/disciplinary', roles: ['HR Administrator', 'Manager'] },
      { label: 'LDAP Config', href: '/admin/ldap-config', roles: ['HR Administrator'] },
      { label: 'Organization Chart', href: '/org/chart', roles: ['HR Administrator', 'Manager'] },
      { label: 'Bulk Import/Export', href: '/admin/employees/bulk-import', roles: ['HR Administrator'] },
      { label: 'Departments', href: '/settings/departments', roles: ['HR Administrator'] },
      { label: 'Leave Policies', href: '/settings/leave-policies', roles: ['HR Administrator'] },
      { label: 'Designations', href: '/settings/designations', roles: ['HR Administrator'] },
      { label: 'Module Permissions', href: '/settings/permissions', roles: ['HR Administrator'] },
      { label: 'Audit Log', href: '/admin/audit-log', roles: ['HR Administrator'] },
      { label: 'Settings', href: '/settings', roles: ['HR Administrator'] },
    ],
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
  /** Uppercased module codes enabled for this tenant (subscription). Always a Set once ready — empty = no optional modules. */
  const [tenantEnabledModuleCodes, setTenantEnabledModuleCodes] = React.useState<Set<string>>(new Set());
  const [tenantModulesReady, setTenantModulesReady] = React.useState(false);

  /** Union of all assigned roles (multi-hat users). */
  const effectiveRoleList = React.useMemo(() => {
    if (!currentUser) return [] as string[];
    if (currentUser.roles && currentUser.roles.length > 0) {
      return currentUser.roles as string[];
    }
    if (currentUser.role) return [currentUser.role];
    return [];
  }, [currentUser?.role, currentUser?.roles]);

  const navMatchesRoles = React.useCallback(
    (allowed?: string[]) => {
      if (!allowed || allowed.length === 0) return true;
      return allowed.some((r) => effectiveRoleList.includes(r));
    },
    [effectiveRoleList]
  );

  // BRD: Dynamic Module Management - DM-036 — hide nav for modules the tenant has not subscribed to (all users)
  React.useEffect(() => {
    const loadTenantModuleCodes = async () => {
      if (!currentUser?.tenantId) {
        setTenantEnabledModuleCodes(new Set());
        setTenantModulesReady(true);
        return;
      }

      if (effectiveRoleList.includes('Super Admin')) {
        setTenantEnabledModuleCodes(new Set());
        setTenantModulesReady(true);
        return;
      }

      setTenantModulesReady(false);
      try {
        let codes: string[] | null = null;

        const resCodes = await apiService.getMyEnabledModuleCodes();
        if (resCodes.success && resCodes.data) {
          codes = parseEnabledModuleCodesPayload(resCodes.data);
        }

        const canUseCompanyModulesApi = effectiveRoleList.some((r) =>
          ['Tenant Admin', 'HR Administrator'].includes(r)
        );
        if (codes === null && canUseCompanyModulesApi) {
          const resMod = await apiService.getMyCompanyModules();
          if (resMod.success && resMod.data) {
            codes = parseCodesFromCompanyModulesPayload(resMod.data);
          }
        }

        if (codes === null) {
          codes = [];
        }
        setTenantEnabledModuleCodes(
          new Set(codes.map((c) => c.toUpperCase().trim()).filter(Boolean))
        );
      } catch (error) {
        console.error('Failed to load enabled module codes:', error);
        setTenantEnabledModuleCodes(new Set());
      } finally {
        setTenantModulesReady(true);
      }
    };

    loadTenantModuleCodes();
  }, [currentUser?.tenantId, effectiveRoleList.join('|')]);

  const isModuleSubscribed = React.useCallback(
    (moduleCode?: string) => {
      if (!moduleCode) return true;
      if (effectiveRoleList.includes('Super Admin')) return true;
      if (!tenantModulesReady) return false;
      // HMR / legacy state can briefly leave null; never call .has on null
      const enabled = tenantEnabledModuleCodes ?? new Set<string>();
      return enabled.has(moduleCode.toUpperCase());
    },
    [effectiveRoleList, tenantModulesReady, tenantEnabledModuleCodes]
  );

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

  React.useEffect(() => {
    const sidebarNav = document.getElementById('sidebar-nav');
    if (sidebarNav) {
      sidebarNav.scrollTop = 0;
    }
  }, [pathname]);

  // BRD: Super Admin (Platform Admin) sees ONLY platform-level nav - NOT Personnel, Payroll, Leave, etc.
  // Platform Admin manages: Tenants, Modules, Subscriptions - Company Admin does operational HR
  
  // US-B2-01: Hide HR operational menus from System Admin (Tenant Admin) nav
  // US-B3-01: System Admin should only see system administration menus
  const hrOperationalMenus = [
    'Workforce', 'Payroll', 'Leave Management', 'Travel & Expenses', 
    'Loans & Advances', 'Exit Management', 'Profile Updates', 'Grievance Management',
    'Performance', 'Attendance', 'Tax Management', 'Recruitment', 'Onboarding',
    'Learning & Development', 'Approvals'
  ];
  
  // Hub mode: Tenant Admin with no operational "hat" — hide org HR menus (US-B2-01)
  const canSeeHrOperationalNav = effectiveRoleList.some((r) =>
    [
      'HR Administrator',
      'Payroll Administrator',
      'Finance Administrator',
      'Manager',
      'Employee',
      'Auditor',
    ].includes(r)
  );
  const hideHrOpsForTenantHub =
    effectiveRoleList.includes('Tenant Admin') && !canSeeHrOperationalNav;

  const visibleItems =
    effectiveRoleList.includes('Super Admin')
      ? platformAdminNavItems.filter((item) => !item.roles || item.roles.includes('Super Admin'))
      : navigationItems.filter((item) => {
        // US-B2-01: Hide HR operational menus from System Admin (Tenant Admin) hub-only users
        if (hideHrOpsForTenantHub && hrOperationalMenus.includes(item.label)) {
          return false;
        }

        // System Admin hub: only one "Reports" — hide module-scoped REPORTS_BASIC (operational) entry
        if (hideHrOpsForTenantHub && item.href === '/reports' && item.moduleCode === 'REPORTS_BASIC') {
          return false;
        }
        
        if (item.moduleCode && !isModuleSubscribed(item.moduleCode)) {
          return false;
        }

        // Approvals: visible for all Managers and for roles/permissions that can approve workflows
        if (item.label === 'Approvals') {
          return (
            effectiveRoleList.includes('Manager') ||
            (currentUser as any)?.isManager ||
            (item.roles && item.roles.length > 0 && navMatchesRoles(item.roles)) ||
            hasPermission('approve_leave') ||
            hasPermission('approve_expense') ||
            hasPermission('approve_travel')
          );
        }

        if (!item.roles || item.roles.length === 0) return true;
        return navMatchesRoles(item.roles);
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

      {/* Header Section - US-B1-01: System Admin Hub label */}
      <div className="p-6 border-b border-sidebar-border bg-gradient-to-b from-sidebar-primary/15 to-transparent flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-xl flex items-center justify-center shadow-md shadow-sidebar-primary/30">
            <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold text-sidebar-foreground leading-tight">
              {hideHrOpsForTenantHub ? 'System Admin Hub' : 'Indian Bank'}
            </h2>
            <p className="text-xs text-sidebar-foreground/70">
              {hideHrOpsForTenantHub
                ? `${currentTenant?.name || 'System Configuration'}`
                : currentTenant?.code}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Section - Scrollable */}
      <nav id="sidebar-nav" className="flex-1 overflow-y-auto overscroll-contain [overflow-anchor:none] p-4 space-y-2 pb-20">
        {visibleItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItems.includes(item.href);
          const isActive = isItemActive(item);
          const navKey = item.moduleCode ? `${item.href}:${item.moduleCode}` : item.href;

          return (
            <div key={navKey} className="space-y-1">
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
                        if (subItem.moduleCode && !isModuleSubscribed(subItem.moduleCode)) {
                          return false;
                        }
                        // Permission-based: e.g. Process Payroll only for Maker (process_payroll)
                        if (subItem.permissionRequired && !hasPermission(subItem.permissionRequired)) {
                          return false;
                        }
                        // Filter sub-items based on roles if specified
                        if (subItem.roles && subItem.roles.length > 0) {
                          return navMatchesRoles(subItem.roles);
                        }
                        return true;
                      }).map((subItem, subIdx) => (
                        <Link
                          key={`${subItem.href}-${subItem.label}-${subIdx}`}
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
            <p className="text-xs text-sidebar-foreground/70 truncate" title={effectiveRoleList.join(', ')}>
              {hideHrOpsForTenantHub
                ? 'System Admin'
                : effectiveRoleList.length > 1
                  ? `${effectiveRoleList.length} roles`
                  : (currentUser?.role ?? '')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
