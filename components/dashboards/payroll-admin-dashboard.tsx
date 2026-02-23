'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, FileText, TrendingUp, AlertTriangle, Plus, Download, Play } from 'lucide-react';
import { usePayroll } from '@/lib/hooks/usePayroll';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';

const payrollTrendData = [
  { month: 'Nov', amount: 3200000 },
  { month: 'Dec', amount: 3250000 },
  { month: 'Jan', amount: 3180000 },
];

export default function PayrollAdminDashboard() {
  const { payrolls } = usePayroll();
  const { hasPermission } = useAuth();
  const canProcessPayroll = hasPermission('process_payroll'); // BRD: Maker only
  const [deductionData, setDeductionData] = useState([
    { name: 'PF', amount: 0 },
    { name: 'ESI', amount: 0 },
    { name: 'Tax', amount: 0 },
  ]);

  useEffect(() => {
    if (payrolls && payrolls.length > 0) {
      setDeductionData([
        { name: 'PF', amount: payrolls.reduce((sum: number, p: any) => sum + (p.pfDeduction || 0), 0) },
        { name: 'ESI', amount: payrolls.reduce((sum: number, p: any) => sum + (p.esiDeduction || 0), 0) },
        { name: 'Tax', amount: payrolls.reduce((sum: number, p: any) => sum + (p.incomeTax || 0), 0) },
      ]);
    }
  }, [payrolls]);

  const totalNetPayroll = payrolls.reduce((sum: number, p: any) => sum + (p.netSalary || 0), 0);
  const totalDeductions = payrolls.reduce((sum: number, p: any) => sum + ((p.pfDeduction || 0) + (p.esiDeduction || 0) + (p.incomeTax || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payroll Administration</h1>
        <p className="text-muted-foreground mt-2">Manage payroll processing and statutory compliance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold text-foreground">₹{(totalNetPayroll / 10000000).toFixed(1)}Cr</p>
                <p className="text-xs text-muted-foreground mt-1">January 2026</p>
              </div>
              <DollarSign className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing Status</p>
                <p className="text-2xl font-bold text-foreground text-green-600">100%</p>
                <p className="text-xs text-green-600 mt-1">All paid</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deductions</p>
                <p className="text-2xl font-bold text-foreground">₹{(totalDeductions / 100000).toFixed(1)}L</p>
                <p className="text-xs text-muted-foreground mt-1">PF, ESI, Tax</p>
              </div>
              <FileText className="w-10 h-10 text-accent/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Status</p>
                <p className="text-2xl font-bold text-foreground text-green-600">100%</p>
                <p className="text-xs text-green-600 mt-1">All filed</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payroll Summary */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">January 2026 Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Employees</p>
                  <p className="text-2xl font-bold">{payrolls.length}</p>
                </div>
                <div className="bg-green-100/50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200/50">
                  <p className="text-xs text-muted-foreground mb-1">Net Payroll</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">₹{(totalNetPayroll / 10000000).toFixed(1)}Cr</p>
                </div>
                <div className="bg-blue-100/50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200/50">
                  <p className="text-xs text-muted-foreground mb-1">Processed</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{payrolls.length}/{payrolls.length}</p>
                </div>
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Basic Salary</span>
                  <span className="font-semibold">₹{payrolls.reduce((sum: number, p: any) => sum + (p.basicSalary || 0), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Allowances (DA+HRA+Other)</span>
                  <span className="font-semibold">₹{payrolls.reduce((sum: number, p: any) => sum + ((p.da || 0) + (p.hra || 0) + (p.allowances || 0)), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Deductions</span>
                  <span className="font-semibold text-red-600">-₹{totalDeductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-3 font-bold">
                  <span>Net Payroll</span>
                  <span className="text-green-600">₹{totalNetPayroll.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1">Generate Reports</Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canProcessPayroll && (
              <Button asChild className="w-full justify-start h-auto py-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/payroll/admin" className="flex items-center gap-2">
                  <Play className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Process Payroll</p>
                    <p className="text-xs opacity-90">Create new payroll cycle</p>
                  </div>
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full justify-start h-auto py-2 bg-transparent">
              <Link href="/payroll/admin" className="flex items-center gap-2">
                <Plus className="w-4 h-4 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium">Admin Dashboard</p>
                  <p className="text-xs text-muted-foreground">View & manage payroll</p>
                </div>
              </Link>
            </Button>
            <Button className="w-full justify-start h-auto py-2 bg-transparent" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              <div className="text-left">
                <p className="text-sm font-medium">EPFO Returns</p>
                <p className="text-xs text-muted-foreground">File statutory returns</p>
              </div>
            </Button>
            <Button className="w-full justify-start h-auto py-2 bg-transparent" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              <div className="text-left">
                <p className="text-sm font-medium">ESIC Returns</p>
                <p className="text-xs text-muted-foreground">File statutory returns</p>
              </div>
            </Button>
            <Button className="w-full justify-start h-auto py-2 bg-transparent" variant="outline">
              <DollarSign className="w-4 h-4 mr-2" />
              <div className="text-left">
                <p className="text-sm font-medium">Tax Summary</p>
                <p className="text-xs text-muted-foreground">View tax calculations</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Payroll Trend</CardTitle>
            <CardDescription>Last 3 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={payrollTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deductions Breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Deductions Breakdown</CardTitle>
            <CardDescription>January 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deductionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="var(--color-chart-1)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Statutory Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200/50">
              <div>
                <p className="font-medium text-sm">EPFO Returns</p>
                <p className="text-xs text-muted-foreground">Employee Provident Fund</p>
              </div>
              <Badge className="bg-green-600">Filed</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200/50">
              <div>
                <p className="font-medium text-sm">ESIC Returns</p>
                <p className="text-xs text-muted-foreground">Employee State Insurance</p>
              </div>
              <Badge className="bg-green-600">Filed</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50">
              <div>
                <p className="font-medium text-sm">ITR Reconciliation</p>
                <p className="text-xs text-muted-foreground">Income Tax Returns</p>
              </div>
              <Badge className="bg-blue-600">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200/50">
              <div>
                <p className="font-medium text-sm">TRACES Filing</p>
                <p className="text-xs text-muted-foreground">TDS Reconciliation</p>
              </div>
              <Badge className="bg-green-600">Filed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
