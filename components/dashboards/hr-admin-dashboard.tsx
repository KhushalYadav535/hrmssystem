'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useJobs } from '@/lib/hooks/useJobs';
import { Users, BarChart3, TrendingUp, Briefcase, AlertCircle, Plus, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiService from '@/lib/api';

export default function HRAdminDashboard() {
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
    // Load stats on component mount
    loadDashboardStats();

    // Set up interval to refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      
      const response = await apiService.getDashboardStats();
      if (response.success && response.data) {
        setDashboardStats({
          totalEmployees: response.data.activeEmployees || 0,
          activeEmployees: response.data.activeEmployees || 0,
          onLeaveToday: response.data.onLeaveToday || 0,
          pendingOnboarding: response.data.pendingApprovals?.onboarding || 0,
          pendingLeaveApprovals: response.data.pendingApprovals?.leaves || 0,
          pendingExpenseApprovals: response.data.pendingApprovals?.expenses || 0,
          attritionRate: response.data.totalEmployees > 0 
            ? parseFloat(((response.data.inactiveEmployees / (response.data.totalEmployees + response.data.inactiveEmployees)) * 100).toFixed(1))
            : 0,
        });
        setDepartmentData(response.data.departmentData || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const openPositions = jobs.length;
  const [departmentData, setDepartmentData] = useState<any[]>([]);

  // Calculate recruitment pipeline data from jobs
  const recruitmentData = jobs.reduce((acc: any[], job: any) => {
    const pd = job.postedDate ? new Date(job.postedDate) : null;
    const monthStart = pd ? new Date(pd.getFullYear(), pd.getMonth(), 1) : null;
    const month = monthStart ? formatDateDDMMYYYY(monthStart) : 'N/A';
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
  
  const parseUkDmy = (s: string) => {
    const parts = s.split('/');
    if (parts.length !== 3) return 0;
    const [dd, mm, yyyy] = parts.map(Number);
    return new Date(yyyy, mm - 1, dd).getTime();
  };
  const sortedRecruitmentData = [...recruitmentData].sort(
    (a, b) => parseUkDmy(a.month) - parseUkDmy(b.month)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">HR Administration</h1>
        <p className="text-muted-foreground mt-2">Organization-wide HR management and analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => window.location.href = '/onboarding'}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">
                  {dashboardStats.totalEmployees.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {`${dashboardStats.activeEmployees} active`}
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
                  {jobs.reduce((sum: number, j: any) => sum + (j.openPositions || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {`${jobs.reduce((sum: number, j: any) => sum + (j.applications || 0), 0)} applications`}
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
                  {`${dashboardStats.attritionRate}%`}
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
                  {dashboardStats.pendingOnboarding}
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
                        <p className="font-medium text-sm text-foreground capitalize">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.department} • Posted {job.postedDate ? formatDateDDMMYYYY(job.postedDate) : 'N/A'}
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
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent" asChild>
                <Link href="/settings/leave-policies">
                  <div className="text-left">
                    <p className="font-medium text-sm">Leave Policies</p>
                    <p className="text-xs text-muted-foreground">Configure leave types and balances</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent" asChild>
                <Link href="/settings/departments">
                  <div className="text-left">
                    <p className="font-medium text-sm">Department Management</p>
                    <p className="text-xs text-muted-foreground">Add/edit departments and roles</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent" asChild>
                <Link href="/settings/compliance">
                  <div className="text-left">
                    <p className="font-medium text-sm">Statutory Compliance</p>
                    <p className="text-xs text-muted-foreground">EPFO, ESIC, and tax configurations</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent" asChild>
                <Link href="/settings/workflows">
                  <div className="text-left">
                    <p className="font-medium text-sm">Workflow Rules</p>
                    <p className="text-xs text-muted-foreground">Setup approval workflows</p>
                  </div>
                </Link>
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
              <Link href="/leave">
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-xs">Apply Leave</span>
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
