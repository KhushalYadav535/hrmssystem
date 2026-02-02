'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useEmployees } from '@/lib/hooks/useEmployees';
import { useJobs } from '@/lib/hooks/useJobs';
import { Users, BarChart3, TrendingUp, Briefcase, AlertCircle, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HRAdminDashboard() {
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { jobs, isLoading: jobsLoading } = useJobs({ status: 'Open' });
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveToday: 0,
    pendingOnboarding: 0,
  });

  useEffect(() => {
    if (employees) {
      setDashboardStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e: any) => e.status === 'Active').length,
        onLeaveToday: employees.filter((e: any) => e.status === 'On Leave').length,
        pendingOnboarding: 0, // Will be fetched from onboarding API
      });
    }
  }, [employees]);

  const openPositions = jobs.length;
  
  // Calculate department distribution from employees
  const departmentData = employees.reduce((acc: any[], emp: any) => {
    const dept = emp.department || 'Other';
    const existing = acc.find(d => d.name === dept);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: dept, value: 1, fill: `var(--color-chart-${(acc.length % 5) + 1})` });
    }
    return acc;
  }, []);

  // Mock chart data for recruitment pipeline
  const mockChartData = [
    { month: 'Jan', applications: 65, hires: 8 },
    { month: 'Feb', applications: 59, hires: 6 },
    { month: 'Mar', applications: 80, hires: 10 },
    { month: 'Apr', applications: 81, hires: 9 },
    { month: 'May', applications: 56, hires: 7 },
    { month: 'Jun', applications: 55, hires: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">HR Administration</h1>
        <p className="text-muted-foreground mt-2">Organization-wide HR management and analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats.totalEmployees.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">Active employees</p>
              </div>
              <Users className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-2xl font-bold text-foreground">{jobs.reduce((sum: number, j: any) => sum + (j.openPositions || 0), 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">{jobs.reduce((sum: number, j: any) => sum + (j.applications || 0), 0)} applications</p>
              </div>
              <Briefcase className="w-10 h-10 text-accent/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attrition Rate</p>
                <p className="text-2xl font-bold text-foreground">2.1%</p>
                <p className="text-xs text-green-600 mt-1">↓ 0.3% from last month</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Onboarding</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats.pendingOnboarding}</p>
                <p className="text-xs text-yellow-600 mt-1">⚠️ Action required</p>
              </div>
              <AlertCircle className="w-10 h-10 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={departmentData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={80} fill="#8884d8" dataKey="value">
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recruitment Pipeline */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recruitment Pipeline</CardTitle>
            <CardDescription>Hiring trends for 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="var(--color-chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="hires" stroke="var(--color-chart-2)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Job Openings and Active Processes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Positions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Open Positions</CardTitle>
                <CardDescription>{openPositions} active job postings</CardDescription>
              </div>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Job
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No open positions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job: any) => {
                  const jobId = job._id || job.id || '';
                  return (
                    <div key={jobId} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.department} • Posted {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Badge className="bg-primary/20 text-primary">{job.openPositions || 0} Open</Badge>
                        <span className="text-xs text-muted-foreground">{job.applications || 0} applications</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* HR Policies & Compliance */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">System Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent">
                <div className="text-left">
                  <p className="font-medium text-sm">Leave Policies</p>
                  <p className="text-xs text-muted-foreground">Configure leave types and balances</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent" asChild>
                <Link href="/settings/departments">
                  <div className="text-left">
                    <p className="font-medium text-sm">Department Management</p>
                    <p className="text-xs text-muted-foreground">Add/edit departments and roles</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent">
                <div className="text-left">
                  <p className="font-medium text-sm">Statutory Compliance</p>
                  <p className="text-xs text-muted-foreground">EPFO, ESIC, and tax configurations</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent">
                <div className="text-left">
                  <p className="font-medium text-sm">Workflow Rules</p>
                  <p className="text-xs text-muted-foreground">Setup approval workflows</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
              <Users className="w-6 h-6 mb-2" />
              <span className="text-xs">Manage Employees</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
              <Briefcase className="w-6 h-6 mb-2" />
              <span className="text-xs">Manage Jobs</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
              <BarChart3 className="w-6 h-6 mb-2" />
              <span className="text-xs">View Reports</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
              <AlertCircle className="w-6 h-6 mb-2" />
              <span className="text-xs">System Alerts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
