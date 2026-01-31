'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockPayroll, mockEmployees } from '@/lib/mock-data';
import { Download, Eye, Send } from 'lucide-react';
import { useState } from 'react';

export default function PayrollPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState('2026');

  if (!isAuthenticated) {
    redirect('/login');
  }

  if (!hasPermission('view_payslip') && !hasPermission('process_payroll')) {
    redirect('/dashboard');
  }

  const filteredPayroll = mockPayroll.filter((p) => p.month === selectedMonth && p.year === parseInt(selectedYear));

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = ['2024', '2025', '2026'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground mt-2">View and manage employee payroll</p>
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
              {hasPermission('process_payroll') && (
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Process Payroll
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payroll Summary */}
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

        {/* Payroll Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Payroll Details</CardTitle>
            <CardDescription>{filteredPayroll.length} employees</CardDescription>
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
                  {filteredPayroll.map((payroll) => {
                    const employee = mockEmployees.find((e) => e.id === payroll.employeeId);
                    return (
                      <tr key={payroll.id} className="border-b border-border hover:bg-secondary/50">
                        <td className="p-3">{employee?.firstName} {employee?.lastName}</td>
                        <td className="text-right p-3">₹{payroll.basicSalary?.toLocaleString()}</td>
                        <td className="text-right p-3">₹{((payroll.da || 0) + (payroll.hra || 0) + (payroll.allowances || 0)).toLocaleString()}</td>
                        <td className="text-right p-3 text-red-600">-₹{((payroll.pfDeduction || 0) + (payroll.esiDeduction || 0) + (payroll.incomeTax || 0)).toLocaleString()}</td>
                        <td className="text-right p-3 font-semibold text-green-600">₹{payroll.netSalary?.toLocaleString()}</td>
                        <td className="text-center p-3">
                          <Badge className={payroll.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {payroll.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        {hasPermission('process_payroll') && (
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
