'use client';

import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import EmployeeDashboard from '@/components/dashboards/employee-dashboard';
import ManagerDashboard from '@/components/dashboards/manager-dashboard';
import HRAdminDashboard from '@/components/dashboards/hr-admin-dashboard';
import PayrollAdminDashboard from '@/components/dashboards/payroll-admin-dashboard';
import SuperAdminDashboard from '@/components/dashboards/super-admin-dashboard';
import TenantAdminDashboard from '@/components/dashboards/tenant-admin-dashboard';
import AuditorDashboard from '@/components/dashboards/auditor-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DASHBOARD_TAB_ORDER: UserRole[] = [
  'Super Admin',
  'Tenant Admin',
  'HR Administrator',
  'Payroll Administrator',
  'Finance Administrator',
  'Auditor',
  'Manager',
  'Employee',
];

function DashboardForRole({ role }: { role: UserRole }) {
  switch (role) {
    case 'Super Admin':
      return <SuperAdminDashboard />;
    case 'Tenant Admin':
      return <TenantAdminDashboard />;
    case 'HR Administrator':
      return <HRAdminDashboard />;
    case 'Payroll Administrator':
      return <PayrollAdminDashboard />;
    case 'Finance Administrator':
      return <PayrollAdminDashboard />;
    case 'Manager':
      return <ManagerDashboard />;
    case 'Employee':
      return <EmployeeDashboard />;
    case 'Auditor':
      return <AuditorDashboard />;
    default:
      return <EmployeeDashboard />;
  }
}

function tabLabel(role: UserRole, payrollSubRole?: string | null) {
  if (role === 'Payroll Administrator' && payrollSubRole) {
    return `Payroll (${payrollSubRole})`;
  }
  return role;
}

export default function DashboardPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give context time to restore from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated && !currentUser) {
        router.push('/login');
      }
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, currentUser, router]);

  const dashboardRoles = useMemo(() => {
    if (!currentUser) return [] as UserRole[];
    const fromRoles =
      currentUser.roles && currentUser.roles.length > 0 ? [...currentUser.roles] : [];
    const primary = currentUser.role;
    const rs = [...fromRoles] as UserRole[];
    if (primary && !rs.includes(primary as UserRole)) rs.push(primary as UserRole);
    const unique = [...new Set(rs)] as UserRole[];
    return DASHBOARD_TAB_ORDER.filter((r) => unique.includes(r));
  }, [currentUser?.role, currentUser?.roles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-primary/30 rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (dashboardRoles.length === 0) {
    return (
      <DashboardLayout>
        <EmployeeDashboard />
      </DashboardLayout>
    );
  }

  if (dashboardRoles.length === 1) {
    return (
      <DashboardLayout>
        <DashboardForRole role={dashboardRoles[0]} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Multiple roles are assigned to your account. Use the tabs below to open each role&apos;s dashboard.
        </p>
        <Tabs defaultValue={dashboardRoles[0]} className="w-full">
          <TabsList className="flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
            {dashboardRoles.map((r) => (
              <TabsTrigger
                key={r}
                value={r}
                className="max-w-full shrink text-xs sm:text-sm data-[state=active]:bg-background"
              >
                {tabLabel(r, currentUser?.payrollSubRole)}
              </TabsTrigger>
            ))}
          </TabsList>
          {dashboardRoles.map((r) => (
            <TabsContent key={r} value={r} className="mt-6 outline-none">
              <DashboardForRole role={r} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
