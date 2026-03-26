'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Eye, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function PayrollPage() {
  const { isAuthenticated, hasPermission, currentUser, hasRole } = useAuth();
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect "admin-only" payroll users to admin. Users with Employee/Manager + HR/Payroll etc. can stay here for My Payslips.
    const adminOnlyIfNoPayslipView = [
      'Payroll Administrator',
      'HR Administrator',
      'Tenant Admin',
      'Finance Administrator',
      'Auditor',
      'Super Admin',
    ];
    const canUsePayslipView = hasRole('Employee') || hasRole('Manager');
    const hasAdminPayrollRole = adminOnlyIfNoPayslipView.some((r) => hasRole(r as any));
    if (isAuthenticated && hasAdminPayrollRole && !canUsePayslipView) {
      router.push('/payroll/admin');
      return;
    }
    loadPayrolls();
  }, [selectedMonth, selectedYear, isAuthenticated, currentUser, router, hasRole]);

  const loadPayrolls = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getPayrolls({ month: selectedMonth, year: selectedYear });
      if (response.success && response.data) {
        setPayrolls(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load payrolls', error);
      toast.error('Failed to load payroll data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    redirect('/login');
  }

  // BRD Access Control for /payroll page:
  // - Employee: View own payslip only
  // - Manager: View team payslips
  // - Others: Redirected to admin dashboard
  
  const isEmployee = hasRole('Employee');
  const isManager = hasRole('Manager');

  if (!isEmployee && !isManager) {
    redirect('/payroll/admin');
  }

  if (!hasPermission('view_payslip')) {
    redirect('/dashboard');
  }

  // Filter payroll data - API already filters by month/year and employee (if Employee role)
  const filteredPayroll = payrolls;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = ['2024', '2025', '2026'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{isEmployee ? 'My Payslips' : 'Payroll Management'}</h1>
          <p className="text-muted-foreground mt-2">{isEmployee ? 'View and download your monthly payslips' : 'View and manage employee payroll'}</p>
        </div>

        {/* Month/Year Selection */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-64">
                <label className="text-sm font-semibold mb-2 block">Select Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-64">
                <label className="text-sm font-semibold mb-2 block">Select Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {hasPermission('process_payroll') && !isEmployee && (
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Process Payroll
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payroll Summary - HIDE for Employees */}
        {!isEmployee && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Salary</p>
                  <p className="text-2xl font-bold">₹{filteredPayroll.reduce((sum, p) => sum + (p.basicSalary || 0), 0).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Deductions</p>
                  <p className="text-2xl font-bold">₹{filteredPayroll.reduce((sum, p) => sum + ((p.pfDeduction || 0) + (p.esiDeduction || 0) + (p.incomeTax || 0)), 0).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Net Payroll</p>
                  <p className="text-2xl font-bold text-green-600">₹{filteredPayroll.reduce((sum, p) => sum + (p.netSalary || 0), 0).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payroll Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{isEmployee ? 'Payslip Details' : 'Payroll Details'}</CardTitle>
            <CardDescription>{isEmployee ? `${selectedMonth} ${selectedYear}` : `${filteredPayroll.length} employees`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold">Employee</th>
                    <th className="text-right p-3 font-semibold">Basic</th>
                    <th className="text-right p-3 font-semibold">Allowances</th>
                    <th className="text-right p-3 font-semibold">Deductions</th>
                    <th className="text-right p-3 font-semibold">Net Salary</th>
                    <th className="text-center p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center p-6 text-muted-foreground">
                        Loading payroll data...
                      </td>
                    </tr>
                  ) : filteredPayroll.length > 0 ? (
                    filteredPayroll.map((payroll) => {
                      const employee = payroll.employeeId;
                      const payrollId = payroll._id || payroll.id;
                      return (
                        <tr key={payrollId} className="border-b border-border hover:bg-secondary/50">
                          <td className="p-3">{employee?.firstName || ''} {employee?.lastName || ''}</td>
                          <td className="text-right p-3">₹{payroll.basicSalary?.toLocaleString() || '0'}</td>
                          <td className="text-right p-3">₹{((payroll.da || 0) + (payroll.hra || 0) + (payroll.allowances || 0)).toLocaleString()}</td>
                          <td className="text-right p-3 text-red-600">-₹{((payroll.pfDeduction || 0) + (payroll.esiDeduction || 0) + (payroll.incomeTax || 0)).toLocaleString()}</td>
                          <td className="text-right p-3 font-semibold text-green-600">₹{payroll.netSalary?.toLocaleString() || '0'}</td>
                          <td className="text-center p-3">
                            <Badge className={payroll.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                              {payroll.status || 'Pending'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {isEmployee && (
                              <Button size="sm" variant="ghost" className="ml-2">
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center p-6 text-muted-foreground">
                        No payroll records found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        {!isEmployee && hasPermission('process_payroll') && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Export & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Export as Excel
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Export as PDF
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Bank File (NEFT)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
