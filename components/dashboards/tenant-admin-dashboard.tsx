'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, BarChart3, TrendingUp, Briefcase, DollarSign, Building2, Award } from 'lucide-react';
import Link from 'next/link';
import { useEmployees } from '@/lib/hooks/useEmployees';
import { useJobs } from '@/lib/hooks/useJobs';
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

export default function TenantAdminDashboard() {
  const { employees } = useEmployees();
  const { jobs } = useJobs({ status: 'Open' });
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    newJoinings: 0,
    pendingApprovals: {
      leaves: 0,
      expenses: 0,
      onboarding: 0
    },
    openPositions: 0,
    applications: 0
  });
  
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getDashboardStats();
        if (response.success && response.data) {
          setDashboardStats(prev => ({
            ...prev,
            totalEmployees: response.data.totalEmployees,
            newJoinings: response.data.newJoinings,
            pendingApprovals: response.data.pendingApprovals,
            openPositions: response.data.openPositions,
            applications: response.data.applications
          }));
          setDepartmentData(response.data.departmentData || []);
          setFinancialData(response.data.financialData || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const totalRevenue = financialData.reduce((sum, m) => sum + (m.revenue || 0), 0);
  const totalExpenses = financialData.reduce((sum, m) => sum + (m.expenses || 0), 0);
  const netProfit = totalRevenue - totalExpenses; // Or just show Total Cost since it's HRMS

  // Get recent joinings from employees list
  const recentJoinings = employees
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    .slice(0, 5);

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
                <p className="text-sm text-muted-foreground">Total Cost (6M)</p>
                <p className="text-2xl font-bold text-foreground">₹{(totalExpenses / 100000).toFixed(1)}L</p>
                <p className="text-xs text-muted-foreground mt-1">Payroll & Expenses</p>
              </div>
              <DollarSign className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-foreground">
                  {dashboardStats.pendingApprovals.leaves + dashboardStats.pendingApprovals.expenses}
                </p>
                <p className="text-xs text-yellow-600 mt-1">Action required</p>
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
                <p className="text-2xl font-bold text-foreground">{dashboardStats.openPositions}</p>
                <p className="text-xs text-muted-foreground mt-1">{dashboardStats.applications} applications</p>
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
            <CardTitle>Cost Overview</CardTitle>
            <CardDescription>Monthly Payroll & Expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${(value / 1000).toFixed(1)}k`} />
                <Legend />
                <Bar dataKey="expenses" fill="hsl(var(--chart-2))" name="Total Cost" />
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
            <CardDescription>New employees</CardDescription>
          </CardHeader>
          <CardContent>
            {recentJoinings.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No recent joinings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJoinings.map((emp: any) => {
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
                  <p className="text-sm text-muted-foreground">{dashboardStats.pendingApprovals.leaves} pending approvals</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/approvals/leave">Review</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Expense Claims</p>
                  <p className="text-sm text-muted-foreground">{dashboardStats.pendingApprovals.expenses} pending approvals</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/approvals/expense">Review</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Onboarding</p>
                  <p className="text-sm text-muted-foreground">{dashboardStats.pendingApprovals.onboarding} candidates pending</p>
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
