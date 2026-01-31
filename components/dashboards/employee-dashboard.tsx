'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockPayroll, mockLeaves, mockExpenses, mockPerformance, mockAttendance, mockNotifications, mockDashboardStats } from '@/lib/mock-data';
import { Calendar, FileText, DollarSign, TrendingUp, Clock, Plane } from 'lucide-react';

const attendanceData = [
  { date: 'Mon', hours: 9 },
  { date: 'Tue', hours: 8.5 },
  { date: 'Wed', hours: 9 },
  { date: 'Thu', hours: 8 },
  { date: 'Fri', hours: 9 },
];

const leaveData = [
  { name: 'Used', value: 8, fill: '#ef4444' },
  { name: 'Available', value: 12, fill: '#10b981' },
];

export default function EmployeeDashboard() {
  const recentPayroll = mockPayroll[0];
  const recentLeave = mockLeaves[0];
  const recentExpense = mockExpenses[0];
  const appraisal = mockPerformance[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground mt-2">Here's your HR information at a glance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Salary (Jan 2026)</p>
                <p className="text-2xl font-bold text-foreground">₹{(recentPayroll?.netSalary / 100000).toFixed(1)}L</p>
              </div>
              <DollarSign className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leave Balance</p>
                <p className="text-2xl font-bold text-foreground">12 Days</p>
                <p className="text-xs text-muted-foreground mt-1">Used: 8 days</p>
              </div>
              <Calendar className="w-10 h-10 text-accent/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-xs text-muted-foreground mt-1">1 Leave, 1 Expense</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance Rating</p>
                <p className="text-2xl font-bold text-foreground">{appraisal?.overallRating}/5</p>
                <p className="text-xs text-muted-foreground mt-1">Q4 2025</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payslip */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Payslip</CardTitle>
            <CardDescription>January 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Basic Salary</p>
                  <p className="text-xl font-bold">₹{recentPayroll?.basicSalary?.toLocaleString()}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">HRA</p>
                  <p className="text-xl font-bold">₹{recentPayroll?.hra?.toLocaleString()}</p>
                </div>
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Deductions</p>
                  <p className="text-xl font-bold">₹{((recentPayroll?.pfDeduction || 0) + (recentPayroll?.esiDeduction || 0) + (recentPayroll?.incomeTax || 0)).toLocaleString()}</p>
                </div>
                <div className="bg-green-100/50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Net Salary</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">₹{recentPayroll?.netSalary?.toLocaleString()}</p>
                </div>
              </div>
              <Button className="w-full bg-transparent" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                View Full Payslip
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leave Balance */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leaveData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {leaveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Leave</span>
                <span className="font-semibold">20 Days</span>
              </div>
              <div className="flex justify-between items-center text-red-600">
                <span className="text-sm">Used</span>
                <span className="font-semibold">8 Days</span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm">Available</span>
                <span className="font-semibold">12 Days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Attendance</CardTitle>
            <CardDescription>Working hours per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b">
                <Calendar className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Leave Approved</p>
                  <p className="text-xs text-muted-foreground">Feb 1-3 • Sick Leave</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Done</Badge>
              </div>
              <div className="flex items-start gap-4 pb-4 border-b">
                <DollarSign className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Payslip Generated</p>
                  <p className="text-xs text-muted-foreground">January 2026 • ₹7.45L</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">Paid</Badge>
              </div>
              <div className="flex items-start gap-4">
                <Plane className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Expense Submitted</p>
                  <p className="text-xs text-muted-foreground">Travel claim • ₹5,000</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
              </div>
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
              <Calendar className="w-6 h-6 mb-2" />
              <span className="text-xs">Apply Leave</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
              <Plane className="w-6 h-6 mb-2" />
              <span className="text-xs">Claim Expense</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
              <FileText className="w-6 h-6 mb-2" />
              <span className="text-xs">View Payslips</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
              <TrendingUp className="w-6 h-6 mb-2" />
              <span className="text-xs">View Appraisal</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
