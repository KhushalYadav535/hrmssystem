'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import EmployeeDashboard from '@/components/dashboards/employee-dashboard';
import ManagerDashboard from '@/components/dashboards/manager-dashboard';
import HRAdminDashboard from '@/components/dashboards/hr-admin-dashboard';
import PayrollAdminDashboard from '@/components/dashboards/payroll-admin-dashboard';

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

  return (
    <DashboardLayout>
      {currentUser?.role === 'Employee' && <EmployeeDashboard />}
      {currentUser?.role === 'Manager' && <ManagerDashboard />}
      {currentUser?.role === 'HR Administrator' && <HRAdminDashboard />}
      {currentUser?.role === 'Payroll Administrator' && <PayrollAdminDashboard />}
    </DashboardLayout>
  );
}
