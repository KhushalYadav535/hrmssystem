'use client';

import { TooltipProvider } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Legend, Line, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChartComponent, LineChartComponent, PieChartComponent, RadarChartComponent } from '@/components/common/charts';
import { Download, Filter, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const headcountData = [
  { month: 'Jan', employees: 250, attrition: 2 },
  { month: 'Feb', employees: 258, attrition: 1 },
  { month: 'Mar', employees: 265, attrition: 3 },
  { month: 'Apr', employees: 272, attrition: 2 },
  { month: 'May', employees: 280, attrition: 4 },
  { month: 'Jun', employees: 285, attrition: 1 },
];

const departmentData = [
  { department: 'Finance', employees: 45 },
  { department: 'Operations', employees: 65 },
  { department: 'IT', employees: 85 },
  { department: 'HR', employees: 35 },
  { department: 'Sales', employees: 55 },
];

const leaveData = [
  { type: 'Annual Leave', count: 450 },
  { type: 'Sick Leave', count: 120 },
  { type: 'Casual Leave', count: 280 },
  { type: 'Comp Off', count: 85 },
];

const performanceData = [
  { name: 'Communication', A: 80, B: 70, C: 60 },
  { name: 'Technical', A: 85, B: 75, C: 65 },
  { name: 'Leadership', A: 75, B: 65, C: 55 },
  { name: 'Problem Solving', A: 90, B: 80, C: 70 },
  { name: 'Team Work', A: 88, B: 78, C: 68 },
];

const mockChartData = [
  { month: 'Jan', applications: 100, hires: 50 },
  { month: 'Feb', applications: 150, hires: 75 },
  { month: 'Mar', applications: 200, hires: 100 },
  { month: 'Apr', applications: 250, hires: 125 },
  { month: 'May', applications: 300, hires: 150 },
];

const departmentWiseData = [
  { department: 'Finance', count: 45 },
  { department: 'Operations', count: 65 },
  { department: 'IT', count: 85 },
  { department: 'HR', count: 35 },
  { department: 'Sales', count: 55 },
];

const designationData = [
  { name: 'Manager', value: 50, fill: '#8884d8' },
  { name: 'Developer', value: 100, fill: '#82ca9d' },
  { name: 'Designer', value: 75, fill: '#ffc658' },
  { name: 'Analyst', value: 25, fill: '#a4de6c' },
];

export default function ReportsPage() {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated || !hasPermission('view_reports')) {
    redirect('/dashboard');
  }

  if (!isAuthenticated || !hasPermission('view_reports')) {
    redirect('/dashboard');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-2">Comprehensive HR metrics and insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">285</div>
              <p className="text-xs text-green-600 mt-2">↑ 2.2% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Attrition Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">1.4%</div>
              <p className="text-xs text-muted-foreground mt-2">2 employees left this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">3.8/5</div>
              <p className="text-xs text-muted-foreground mt-2">Performance appraisals</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Leave Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">62%</div>
              <p className="text-xs text-muted-foreground mt-2">Of annual entitlement</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChartComponent
            data={headcountData}
            dataKey="employees"
            title="Headcount Trend"
            description="Employee count over the last 6 months"
          />
          <BarChartComponent
            data={departmentData}
            dataKey="employees"
            title="Department Distribution"
            description="Employee count by department"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChartComponent
            data={leaveData}
            dataKey="count"
            nameKey="type"
            title="Leave Distribution"
            description="Types of leaves taken YTD"
          />
          <RadarChartComponent
            data={performanceData}
            dataKey="A"
            title="Performance Comparison"
            description="Competency levels across teams"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payroll Summary</CardTitle>
                <CardDescription>Monthly payroll distribution</CardDescription>
              </div>
              <Select defaultValue="2026-02">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026-02">February 2026</SelectItem>
                  <SelectItem value="2026-01">January 2026</SelectItem>
                  <SelectItem value="2025-12">December 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold text-foreground mt-2">₹45,62,500</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Average Salary</p>
                <p className="text-2xl font-bold text-foreground mt-2">₹1,60,088</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600 mt-2">₹8,45,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
