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
import apiService from '@/lib/api';

export default function HRAdminDashboard() {
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { jobs, isLoading: jobsLoading } = useJobs({ status: 'Open' });
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveToday: 0,
    pendingOnboarding: 0,
    pendingLeaveApprovals: 0,
    pendingExpenseApprovals: 0,
    attritionRate: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, [employees]);

  // Also reload stats when component mounts or when user navigates back
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardStats();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      
      // Calculate employee stats from loaded employees
      if (employees && employees.length > 0) {
        const totalEmployees = employees.length;
        const activeEmployees = employees.filter((e: any) => e.status === 'Active').length;
        const inactiveEmployees = employees.filter((e: any) => e.status === 'Inactive' || e.status === 'Retired').length;
        const onLeaveToday = employees.filter((e: any) => e.status === 'On Leave').length;
        
        // Calculate attrition rate
        const attritionRate = totalEmployees > 0 
          ? ((inactiveEmployees / totalEmployees) * 100).toFixed(1)
          : '0.0';

        // Fetch pending onboarding
        const onboardingResponse = await apiService.getOnboardings({ status: 'pending' });
        const pendingOnboarding = onboardingResponse.success && onboardingResponse.data 
          ? onboardingResponse.data.length 
          : 0;

        // Fetch pending leave approvals
        const leavesResponse = await apiService.getLeaves({ status: 'Pending' });
        console.log('HR Admin Dashboard - Pending leaves API response:', {
          success: leavesResponse.success,
          dataLength: leavesResponse.data ? (Array.isArray(leavesResponse.data) ? leavesResponse.data.length : 'not array') : 'no data',
          data: leavesResponse.data,
          message: leavesResponse.message
        });
        const pendingLeaveApprovals = leavesResponse.success && leavesResponse.data 
          ? (Array.isArray(leavesResponse.data) ? leavesResponse.data.length : 0)
          : 0;

        // Fetch pending expense approvals
        const expensesResponse = await apiService.getExpenses({ status: 'Pending' });
        const pendingExpenseApprovals = expensesResponse.success && expensesResponse.data 
          ? expensesResponse.data.length 
          : 0;

        setDashboardStats({
          totalEmployees,
          activeEmployees,
          onLeaveToday,
          pendingOnboarding,
          pendingLeaveApprovals,
          pendingExpenseApprovals,
          attritionRate: parseFloat(attritionRate),
        });
      } else {
        // If no employees, still fetch other stats
        const onboardingResponse = await apiService.getOnboardings({ status: 'pending' });
        const leavesResponse = await apiService.getLeaves({ status: 'Pending' });
        console.log('HR Admin Dashboard (no employees) - Pending leaves response:', {
          success: leavesResponse.success,
          dataLength: leavesResponse.data ? (Array.isArray(leavesResponse.data) ? leavesResponse.data.length : 'not array') : 'no data',
        });
        const expensesResponse = await apiService.getExpenses({ status: 'Pending' });
        
        setDashboardStats({
          totalEmployees: 0,
          activeEmployees: 0,
          onLeaveToday: 0,
          pendingOnboarding: onboardingResponse.success && onboardingResponse.data ? (Array.isArray(onboardingResponse.data) ? onboardingResponse.data.length : 0) : 0,
          pendingLeaveApprovals: leavesResponse.success && leavesResponse.data ? (Array.isArray(leavesResponse.data) ? leavesResponse.data.length : 0) : 0,
          pendingExpenseApprovals: expensesResponse.success && expensesResponse.data ? (Array.isArray(expensesResponse.data) ? expensesResponse.data.length : 0) : 0,
          attritionRate: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const openPositions = jobs.length;
  
  // Calculate department distribution from employees
  const departmentData = employees && employees.length > 0 ? employees.reduce((acc: any[], emp: any) => {
    const dept = emp.department || 'Other';
    const existing = acc.find(d => d.name === dept);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: dept, value: 1, fill: `var(--color-chart-${(acc.length % 5) + 1})` });
    }
    return acc;
  }, []) : [];

  // Calculate recruitment pipeline data from jobs
  const recruitmentData = jobs.reduce((acc: any[], job: any) => {
    const month = job.postedDate ? new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short' }) : 'N/A';
    const existing = acc.find(d => d.month === month);
    if (existing) {
      existing.applications += job.applications || 0;
      existing.hires += 0; // Would need to track actual hires separately
    } else {
      acc.push({ 
        month, 
        applications: job.applications || 0, 
        hires: 0 // Would need actual hire data
      });
    }
    return acc;
  }, []);
  
  // Sort by month order
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sortedRecruitmentData = recruitmentData.sort((a, b) => {
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

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
                <p className="text-2xl font-bold text-foreground">
                  {isLoadingStats ? '...' : dashboardStats.totalEmployees.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {isLoadingStats ? '...' : `${dashboardStats.activeEmployees} active`}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {isLoadingStats ? '...' : jobs.reduce((sum: number, j: any) => sum + (j.openPositions || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLoadingStats ? '...' : `${jobs.reduce((sum: number, j: any) => sum + (j.applications || 0), 0)} applications`}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {isLoadingStats ? '...' : `${dashboardStats.attritionRate}%`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Based on inactive employees</p>
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
                <p className="text-2xl font-bold text-foreground">
                  {isLoadingStats ? '...' : dashboardStats.pendingOnboarding}
                </p>
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
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={departmentData} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No department data available</p>
                <p className="text-xs mt-2">Data will appear as employees are added</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recruitment Pipeline */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recruitment Pipeline</CardTitle>
            <CardDescription>Hiring trends for 2026</CardDescription>
          </CardHeader>
          <CardContent>
            {sortedRecruitmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={sortedRecruitmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="applications" stroke="var(--color-chart-1)" strokeWidth={2} name="Applications" />
                  <Line type="monotone" dataKey="hires" stroke="var(--color-chart-2)" strokeWidth={2} name="Hires" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recruitment data available</p>
                <p className="text-xs mt-2">Data will appear as jobs are posted</p>
              </div>
            )}
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
              <Button size="sm" className="gap-2" asChild>
                <Link href="/recruitment">
                  <Plus className="w-4 h-4" />
                  New Job
                </Link>
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

      {/* Pending Approvals */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Pending Approvals</CardTitle>
          <CardDescription>Requires your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className={`h-auto py-4 flex flex-col items-center justify-center bg-transparent ${dashboardStats.pendingLeaveApprovals > 0 ? 'border-yellow-500' : ''}`} 
              asChild
            >
              <Link href="/approvals/leave">
                <AlertCircle className={`w-6 h-6 mb-2 ${dashboardStats.pendingLeaveApprovals > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">Leave Approvals</span>
                <span className={`text-xs mt-1 ${dashboardStats.pendingLeaveApprovals > 0 ? 'text-yellow-600 font-semibold' : 'text-muted-foreground'}`}>
                  {isLoadingStats ? '...' : dashboardStats.pendingLeaveApprovals} pending
                </span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className={`h-auto py-4 flex flex-col items-center justify-center bg-transparent ${dashboardStats.pendingExpenseApprovals > 0 ? 'border-yellow-500' : ''}`} 
              asChild
            >
              <Link href="/approvals/expense">
                <AlertCircle className={`w-6 h-6 mb-2 ${dashboardStats.pendingExpenseApprovals > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">Expense Approvals</span>
                <span className={`text-xs mt-1 ${dashboardStats.pendingExpenseApprovals > 0 ? 'text-yellow-600 font-semibold' : 'text-muted-foreground'}`}>
                  {isLoadingStats ? '...' : dashboardStats.pendingExpenseApprovals} pending
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent" asChild>
              <Link href="/personnel">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-xs">Manage Employees</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent" asChild>
              <Link href="/recruitment">
                <Briefcase className="w-6 h-6 mb-2" />
                <span className="text-xs">Manage Jobs</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent" asChild>
              <Link href="/reports">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span className="text-xs">View Reports</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent" asChild>
              <Link href="/onboarding">
                <AlertCircle className="w-6 h-6 mb-2" />
                <span className="text-xs">Onboarding</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
