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
import { toast } from 'sonner';

const payrollTrendData = [
  { month: 'Nov', amount: 3200000 },
  { month: 'Dec', amount: 3250000 },
  { month: 'Jan', amount: 3180000 },
];

const getCurrentDisplayMonthYear = (payrolls: any[]) => {
  if (payrolls && payrolls.length > 0) {
    // Sort by year and month descending to get the latest
    const latest = [...payrolls].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return months.indexOf(b.month) - months.indexOf(a.month);
    })[0];
    if (latest.month && latest.year) {
      return `${latest.month} ${latest.year}`;
    }
  }
  const date = new Date();
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

export default function PayrollAdminDashboard() {
  const { payrolls } = usePayroll();
  const { hasPermission } = useAuth();
  const canProcessPayroll = hasPermission('process_payroll'); // BRD: Maker only
  const [deductionData, setDeductionData] = useState([
    { name: 'PF', amount: 0 },
    { name: 'ESI', amount: 0 },
    { name: 'Tax', amount: 0 },
  ]);

  // Filter payrolls to only show the most recent month's data in the overview stats
  const [currentPayrolls, setCurrentPayrolls] = useState<any[]>([]);

  useEffect(() => {
    if (payrolls && payrolls.length > 0) {
      const latest = [...payrolls].sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(b.month) - months.indexOf(a.month);
      })[0];

      const filtered = payrolls.filter(p => p.month === latest.month && p.year === latest.year);
      setCurrentPayrolls(filtered);

      setDeductionData([
        { name: 'PF', amount: filtered.reduce((sum: number, p: any) => sum + (p.pfDeduction || 0), 0) },
        { name: 'ESI', amount: filtered.reduce((sum: number, p: any) => sum + (p.esiDeduction || 0), 0) },
        { name: 'Tax', amount: filtered.reduce((sum: number, p: any) => sum + (p.incomeTax || 0), 0) },
      ]);
    } else {
      setCurrentPayrolls([]);
    }
  }, [payrolls]);

  const totalNetPayroll = currentPayrolls.reduce((sum: number, p: any) => sum + (p.netSalary || 0), 0);
  const totalDeductions = currentPayrolls.reduce((sum: number, p: any) => sum + ((p.pfDeduction || 0) + (p.esiDeduction || 0) + (p.incomeTax || 0)), 0);

  const displayMonthYear = getCurrentDisplayMonthYear(payrolls);

  const handleExport = () => {
    try {
      if (!payrolls || payrolls.length === 0) {
        toast.warning('No payroll data to export');
        return;
      }

      const rows = ['Employee Name,Code,Basic,DA,HRA,Allowances,Gross,EPF,ESI,Tax,Other Deductions,Net Salary,Status'];
      payrolls.forEach((p: any) => {
        const emp = p.employeeId || {};
        const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
        const code = emp.employeeCode || '';
        const gross = (p.basicSalary || 0) + (p.da || 0) + (p.hra || 0) + (p.allowances || 0);
        rows.push(`"${name}","${code}",${p.basicSalary || 0},${p.da || 0},${p.hra || 0},${p.allowances || 0},${gross},${p.pfDeduction || 0},${p.esiDeduction || 0},${p.incomeTax || 0},${p.otherDeductions || 0},${p.netSalary || 0},${p.status || ''}`);
      });

      const csvContent = rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Payroll_Summary.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Payroll summary exported to CSV');
    } catch (err) {
      toast.error('Failed to export payrolls');
      console.error(err);
    }
  };

  const handleGenerateReport = () => {
    toast.success('Report generation started. The detailed report will be available in the Reports section shortly.');
    // In a real app, this would trigger a backend job to generate a complex PDF/Excel report
  };

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
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalNetPayroll)}</p>
                <p className="text-xs text-muted-foreground mt-1">{displayMonthYear}</p>
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
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalDeductions)}</p>
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
            <CardTitle className="text-lg">{displayMonthYear} Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Employees</p>
                  <p className="text-2xl font-bold">{currentPayrolls.length}</p>
                </div>
                <div className="bg-green-100/50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200/50">
                  <p className="text-xs text-muted-foreground mb-1">Net Payroll</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(totalNetPayroll)}</p>
                </div>
                <div className="bg-blue-100/50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200/50">
                  <p className="text-xs text-muted-foreground mb-1">Processed</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{currentPayrolls.length}/{currentPayrolls.length}</p>
                </div>
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Basic Salary</span>
                  <span className="font-semibold">₹{currentPayrolls.reduce((sum: number, p: any) => sum + (p.basicSalary || 0), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Allowances (DA+HRA+Other)</span>
                  <span className="font-semibold">₹{currentPayrolls.reduce((sum: number, p: any) => sum + ((p.da || 0) + (p.hra || 0) + (p.allowances || 0)), 0).toLocaleString()}</span>
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
                <Button className="flex-1" onClick={handleGenerateReport}>
                  Generate Reports
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleExport}>
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
            <Button asChild className="w-full justify-start h-auto py-2 bg-transparent" variant="outline">
              <Link href="/payroll/epfo" className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <p className="text-sm font-medium">EPFO Returns</p>
                  <p className="text-xs text-muted-foreground">File statutory returns</p>
                </div>
              </Link>
            </Button>
            <Button asChild className="w-full justify-start h-auto py-2 bg-transparent" variant="outline">
              <Link href="/payroll/esic" className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <p className="text-sm font-medium">ESIC Returns</p>
                  <p className="text-xs text-muted-foreground">File statutory returns</p>
                </div>
              </Link>
            </Button>
            <Button asChild className="w-full justify-start h-auto py-2 bg-transparent" variant="outline">
              <Link href="/tax" className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <p className="text-sm font-medium">Tax Summary</p>
                  <p className="text-xs text-muted-foreground">View tax calculations</p>
                </div>
              </Link>
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
            <CardDescription>{displayMonthYear}</CardDescription>
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
