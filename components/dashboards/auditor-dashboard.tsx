'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import { FileText, BarChart3, Shield, AlertTriangle, Download, Eye, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useEmployees } from '@/lib/hooks/useEmployees';
import { usePayroll } from '@/lib/hooks/usePayroll';
import { useState, useEffect } from 'react';

const auditActivityData = [
  { month: 'Jan', logins: 1250, changes: 45, exports: 12 },
  { month: 'Feb', logins: 1320, changes: 52, exports: 15 },
  { month: 'Mar', logins: 1280, changes: 38, exports: 18 },
  { month: 'Apr', logins: 1450, changes: 61, exports: 20 },
  { month: 'May', logins: 1380, changes: 48, exports: 16 },
  { month: 'Jun', logins: 1520, changes: 55, exports: 22 },
];

const complianceStatusData = [
  { name: 'Compliant', value: 85, fill: '#10b981' },
  { name: 'Review Required', value: 12, fill: '#f59e0b' },
  { name: 'Non-Compliant', value: 3, fill: '#ef4444' },
];

const departmentAuditData = [
  { department: 'Finance', audits: 25, issues: 2, status: 'Compliant' },
  { department: 'HR', audits: 18, issues: 1, status: 'Compliant' },
  { department: 'IT', audits: 15, issues: 3, status: 'Review Required' },
  { department: 'Operations', audits: 22, issues: 1, status: 'Compliant' },
  { department: 'Sales', audits: 12, issues: 0, status: 'Compliant' },
];

export default function AuditorDashboard() {
  const { employees } = useEmployees();
  const { payrolls } = usePayroll();
  const [dashboardStats, setDashboardStats] = useState({
    totalAudits: 92,
    pendingReviews: 8,
    complianceRate: 85,
    totalExports: 103,
  });

  useEffect(() => {
    // Calculate stats from available data
    if (employees && payrolls) {
      setDashboardStats({
        totalAudits: 92, // TODO: Load from audit API
        pendingReviews: 8, // TODO: Load from audit API
        complianceRate: 85, // TODO: Calculate from audit data
        totalExports: 103, // TODO: Load from export logs
      });
    }
  }, [employees, payrolls]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit & Compliance Dashboard</h1>
        <p className="text-muted-foreground mt-2">Comprehensive audit logs, compliance monitoring, and reporting</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Audits</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats.totalAudits}</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <Shield className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold text-foreground text-yellow-600">{dashboardStats.pendingReviews}</p>
                <p className="text-xs text-yellow-600 mt-1">⚠️ Action required</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                <p className="text-2xl font-bold text-foreground text-green-600">{dashboardStats.complianceRate}%</p>
                <p className="text-xs text-green-600 mt-1">↑ 2% from last month</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reports Exported</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats.totalExports}</p>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
              </div>
              <Download className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Compliance Status</CardTitle>
            <CardDescription>Overall compliance distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={complianceStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {complianceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Audit Activity Trend */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Audit Activity Trend</CardTitle>
            <CardDescription>Monthly audit activities and exports</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={auditActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="hsl(var(--chart-1))" strokeWidth={2} name="User Logins" />
                <Line type="monotone" dataKey="changes" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Data Changes" />
                <Line type="monotone" dataKey="exports" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Report Exports" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Audit Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Department Audit Status</CardTitle>
          <CardDescription>Recent audit findings by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departmentAuditData.map((dept) => (
              <div key={dept.department} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{dept.department}</p>
                    <p className="text-sm text-muted-foreground">{dept.audits} audits • {dept.issues} issues found</p>
                  </div>
                </div>
                <Badge className={dept.status === 'Compliant' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {dept.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Logs */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Audit Logs</CardTitle>
            <CardDescription>View system activity and audit trails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent" asChild>
                <Link href="/admin/audit-log">
                  <Eye className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium text-sm">View Audit Logs</p>
                    <p className="text-xs text-muted-foreground">System activity and user actions</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent" asChild>
                <Link href="/reports">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium text-sm">View Reports</p>
                    <p className="text-xs text-muted-foreground">HR analytics and insights</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent" asChild>
                <Link href="/personnel">
                  <Users className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium text-sm">View Employee Data</p>
                    <p className="text-xs text-muted-foreground">Employee records and information</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Reports */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Compliance Reports</CardTitle>
            <CardDescription>Financial and payroll compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent" asChild>
                <Link href="/payroll">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Payroll Reports</p>
                    <p className="text-xs text-muted-foreground">Payroll compliance and audits</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent" asChild>
                <Link href="/tax">
                  <FileText className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Tax Compliance</p>
                    <p className="text-xs text-muted-foreground">Tax reports and Form 16/24Q</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <p className="font-medium text-sm">Export Audit Report</p>
                  <p className="text-xs text-muted-foreground">Generate comprehensive audit report</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audit Activities */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Audit Activities</CardTitle>
          <CardDescription>Latest audit log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 1, action: 'Payroll Data Export', user: 'HR Administrator', time: '2 hours ago', status: 'Success' },
              { id: 2, action: 'Employee Data Access', user: 'Finance Admin', time: '5 hours ago', status: 'Success' },
              { id: 3, action: 'Report Generation', user: 'Payroll Admin', time: '1 day ago', status: 'Success' },
              { id: 4, action: 'Bulk Data Export', user: 'System Admin', time: '2 days ago', status: 'Success' },
              { id: 5, action: 'Compliance Report', user: 'Auditor', time: '3 days ago', status: 'Success' },
            ].map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">By {activity.user} • {activity.time}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">{activity.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
