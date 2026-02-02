'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import EmployeeDashboard from '@/components/dashboards/employee-dashboard';
import ManagerDashboard from '@/components/dashboards/manager-dashboard';
import HRAdminDashboard from '@/components/dashboards/hr-admin-dashboard';
import PayrollAdminDashboard from '@/components/dashboards/payroll-admin-dashboard';
import SuperAdminDashboard from '@/components/dashboards/super-admin-dashboard';
import TenantAdminDashboard from '@/components/dashboards/tenant-admin-dashboard';
import AuditorDashboard from '@/components/dashboards/auditor-dashboard';

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

  // Render dashboard based on role
  const renderDashboard = () => {
    switch (currentUser?.role) {
      case 'Super Admin':
        return <SuperAdminDashboard />;
      case 'Tenant Admin':
        return <TenantAdminDashboard />;
      case 'HR Administrator':
        return <HRAdminDashboard />;
      case 'Payroll Administrator':
        return <PayrollAdminDashboard />;
      case 'Finance Administrator':
        return <PayrollAdminDashboard />; // Can reuse or create separate
      case 'System Administrator':
        return <SuperAdminDashboard />; // Can reuse or create separate
      case 'Manager':
        return <ManagerDashboard />;
      case 'Employee':
        return <EmployeeDashboard />;
      case 'Auditor':
        return <AuditorDashboard />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}
