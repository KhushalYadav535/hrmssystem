'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Users, BarChart3, TrendingUp, Briefcase, AlertCircle, Plus, DollarSign, Calendar, Building2, Award } from 'lucide-react';
import Link from 'next/link';
import { useEmployees } from '@/lib/hooks/useEmployees';
import { useJobs } from '@/lib/hooks/useJobs';
import { useState, useEffect } from 'react';

const departmentData = [
  { name: 'Finance', value: 320, fill: 'hsl(var(--chart-1))' },
  { name: 'IT', value: 450, fill: 'hsl(var(--chart-2))' },
  { name: 'HR', value: 120, fill: 'hsl(var(--chart-3))' },
  { name: 'Operations', value: 230, fill: 'hsl(var(--chart-4))' },
  { name: 'Retail Banking', value: 380, fill: 'hsl(var(--chart-5))' },
];

const monthlyRevenue = [
  { month: 'Jan', revenue: 45000000, expenses: 32000000 },
  { month: 'Feb', revenue: 52000000, expenses: 35000000 },
  { month: 'Mar', revenue: 48000000, expenses: 33000000 },
  { month: 'Apr', revenue: 55000000, expenses: 36000000 },
  { month: 'May', revenue: 60000000, expenses: 38000000 },
  { month: 'Jun', revenue: 58000000, expenses: 37000000 },
];

export default function TenantAdminDashboard() {
  const { employees } = useEmployees();
  const { jobs } = useJobs({ status: 'Open' });
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    newJoinings: 0,
    pendingApprovals: 0,
    pendingOnboarding: 0,
  });

  useEffect(() => {
    if (employees) {
      setDashboardStats({
        totalEmployees: employees.length,
        newJoinings: 0, // TODO: Calculate from joinDate
        pendingApprovals: 0, // TODO: Load from API
        pendingOnboarding: 0, // TODO: Load from API
      });
    }
  }, [employees]);

  const openPositions = jobs.reduce((sum: number, j: any) => sum + (j.openPositions || 0), 0);
  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = monthlyRevenue.reduce((sum, m) => sum + m.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">CEO Dashboard</h1>
        <p className="text-muted-foreground mt-2">Executive overview and company insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats.totalEmployees.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">↑ {dashboardStats.newJoinings} new joinings</p>
              </div>
              <Users className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹{(totalRevenue / 10000000).toFixed(1)}Cr</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% vs last month</p>
              </div>
              <DollarSign className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold text-foreground">₹{(netProfit / 10000000).toFixed(1)}Cr</p>
                <p className="text-xs text-green-600 mt-1">↑ 8% growth</p>
              </div>
              <TrendingUp className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-2xl font-bold text-foreground">{openPositions}</p>
                <p className="text-xs text-muted-foreground mt-1">{jobs.reduce((sum: number, j: any) => sum + (j.applications || 0), 0)} applications</p>
              </div>
              <Briefcase className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Employee count by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${(value / 1000000).toFixed(1)}M`} />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Revenue" />
                <Bar dataKey="expenses" fill="hsl(var(--chart-2))" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/personnel">
                <Users className="w-5 h-5 mb-2" />
                <span className="font-medium">View Employees</span>
                <span className="text-xs text-muted-foreground">Manage workforce</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/reports">
                <BarChart3 className="w-5 h-5 mb-2" />
                <span className="font-medium">View Reports</span>
                <span className="text-xs text-muted-foreground">Analytics & insights</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/admin">
                <Building2 className="w-5 h-5 mb-2" />
                <span className="font-medium">Administration</span>
                <span className="text-xs text-muted-foreground">System settings</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/performance">
                <Award className="w-5 h-5 mb-2" />
                <span className="font-medium">Performance</span>
                <span className="text-xs text-muted-foreground">Appraisals & reviews</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Joinings</CardTitle>
            <CardDescription>New employees this month</CardDescription>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No recent joinings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {employees.slice(0, 5).map((emp: any) => {
                  const empId = emp._id || emp.id || '';
                  return (
                    <div key={empId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                        <p className="text-sm text-muted-foreground">{emp.designation} • {emp.department}</p>
                      </div>
                      <Badge variant="outline">{emp.status}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Requires your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Leave Requests</p>
                  <p className="text-sm text-muted-foreground">{dashboardStats.pendingApprovals} pending approvals</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/approvals/leave">Review</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Expense Claims</p>
                  <p className="text-sm text-muted-foreground">15 pending approvals</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/approvals/expense">Review</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Onboarding</p>
                  <p className="text-sm text-muted-foreground">{dashboardStats.pendingOnboarding} candidates pending</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/onboarding">Review</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
