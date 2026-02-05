'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, FileText, DollarSign, TrendingUp, Clock, Plane } from 'lucide-react';
import { usePayroll } from '@/lib/hooks/usePayroll';
import { useLeaves } from '@/lib/hooks/useLeaves';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import Link from 'next/link';

export default function EmployeeDashboard() {
  const { currentUser } = useAuth();
  const { payrolls, isLoading: payrollLoading } = usePayroll({ employeeId: currentUser?.id });
  const { leaves, isLoading: leavesLoading } = useLeaves({ employeeId: currentUser?.id });
  const { expenses, isLoading: expensesLoading } = useExpenses({ employeeId: currentUser?.id });
  
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmployeeData();
  }, [currentUser]);

  const loadEmployeeData = async () => {
    try {
      setIsLoading(true);
      
      // Get current employee record
      if (currentUser?.email) {
        const empResponse = await apiService.getEmployees({ search: currentUser.email });
        if (empResponse.success && empResponse.data && Array.isArray(empResponse.data) && empResponse.data.length > 0) {
          const emp = empResponse.data[0];
          setCurrentEmployee(emp);
          
          // Load leave balances
          const employeeId = emp._id || emp.id;
          if (employeeId) {
            const balanceResponse = await apiService.getLeaveBalance(employeeId);
            if (balanceResponse.success && balanceResponse.data) {
              setLeaveBalances(Array.isArray(balanceResponse.data) ? balanceResponse.data : []);
            }
            
            // Load attendance for current week
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
            startOfWeek.setHours(0, 0, 0, 0);
            
            const attendanceResponse = await apiService.getAttendances({
              employeeId: employeeId,
              startDate: startOfWeek.toISOString().split('T')[0],
              endDate: today.toISOString().split('T')[0]
            });
            
            if (attendanceResponse.success && attendanceResponse.data) {
              const attData = Array.isArray(attendanceResponse.data) ? attendanceResponse.data : [];
              // Transform to chart format
              const weekData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + idx);
                const dayAttendance = attData.find((a: any) => {
                  const attDate = new Date(a.date);
                  return attDate.toDateString() === date.toDateString();
                });
                return {
                  date: day,
                  hours: dayAttendance?.workingHours || 0
                };
              });
              setAttendanceData(weekData);
            }
            
            // Load latest performance
            const perfResponse = await apiService.getPerformances({ employeeId: employeeId });
            if (perfResponse.success && perfResponse.data && Array.isArray(perfResponse.data) && perfResponse.data.length > 0) {
              setPerformance(perfResponse.data[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load employee data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recentPayroll = payrolls && payrolls.length > 0 ? payrolls[0] : null;
  const pendingLeaves = leaves.filter((l: any) => l.status === 'Pending');
  const pendingExpenses = expenses.filter((e: any) => e.status === 'Pending');
  const approvedLeaves = leaves.filter((l: any) => l.status === 'Approved');
  
  // Calculate total leave balance
  const totalLeaveBalance = leaveBalances.reduce((sum, balance) => sum + (balance.available || 0), 0);
  const totalLeaveUsed = leaveBalances.reduce((sum, balance) => sum + (balance.used || 0), 0);
  const totalLeaveAllocated = leaveBalances.reduce((sum, balance) => sum + (balance.daysPerYear || 0), 0);
  
  // Prepare leave chart data
  const leaveChartData = totalLeaveAllocated > 0 ? [
    { name: 'Used', value: totalLeaveUsed, fill: '#ef4444' },
    { name: 'Available', value: totalLeaveBalance, fill: '#10b981' },
  ] : [];
  
  // Get recent activity
  const recentActivities = [
    ...approvedLeaves.slice(0, 2).map((leave: any) => ({
      type: 'leave',
      icon: Calendar,
      title: 'Leave Approved',
      description: `${leave.leaveType} • ${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()}`,
      status: 'Approved',
      date: leave.approvedDate || leave.appliedDate
    })),
    ...payrolls.slice(0, 1).map((payroll: any) => ({
      type: 'payslip',
      icon: DollarSign,
      title: 'Payslip Generated',
      description: `${payroll.month} ${payroll.year} • ₹${((payroll.netSalary || 0) / 100000).toFixed(1)}L`,
      status: 'Paid',
      date: payroll.createdAt
    })),
    ...pendingExpenses.slice(0, 1).map((expense: any) => ({
      type: 'expense',
      icon: Plane,
      title: 'Expense Submitted',
      description: `${expense.category} • ₹${(expense.amount || 0).toLocaleString()}`,
      status: 'Pending',
      date: expense.submittedDate
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

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
                <p className="text-2xl font-bold text-foreground">
                  {recentPayroll?.netSalary ? `₹${(recentPayroll.netSalary / 100000).toFixed(1)}L` : 'N/A'}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : `${totalLeaveBalance} Days`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLoading ? '...' : `Used: ${totalLeaveUsed} days`}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : pendingLeaves.length + pendingExpenses.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLoading ? '...' : `${pendingLeaves.length} Leave, ${pendingExpenses.length} Expense`}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : performance?.overallRating ? `${performance.overallRating}/5` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLoading ? '...' : performance?.period || 'No rating yet'}
                </p>
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
                  <p className="text-xl font-bold">₹{recentPayroll?.basicSalary?.toLocaleString() || '0'}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">HRA</p>
                  <p className="text-xl font-bold">₹{recentPayroll?.hra?.toLocaleString() || '0'}</p>
                </div>
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Deductions</p>
                  <p className="text-xl font-bold">₹{((recentPayroll?.pfDeduction || 0) + (recentPayroll?.esiDeduction || 0) + (recentPayroll?.incomeTax || 0)).toLocaleString()}</p>
                </div>
                <div className="bg-green-100/50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Net Salary</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">₹{recentPayroll?.netSalary?.toLocaleString() || '0'}</p>
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
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : leaveChartData.length > 0 ? (
              <>
                <div className="flex items-center justify-center h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={leaveChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {leaveChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Leave</span>
                    <span className="font-semibold">{totalLeaveAllocated} Days</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm">Used</span>
                    <span className="font-semibold">{totalLeaveUsed} Days</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm">Available</span>
                    <span className="font-semibold">{totalLeaveBalance} Days</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">No leave data available</p>
              </div>
            )}
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
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-muted-foreground">Loading activity...</p>
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, idx) => {
                  const Icon = activity.icon;
                  const statusColors = {
                    'Approved': 'bg-green-100 text-green-700',
                    'Paid': 'bg-blue-100 text-blue-700',
                    'Pending': 'bg-yellow-100 text-yellow-700',
                    'Rejected': 'bg-red-100 text-red-700'
                  };
                  return (
                    <div key={idx} className={`flex items-start gap-4 ${idx < recentActivities.length - 1 ? 'pb-4 border-b' : ''}`}>
                      <Icon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                      <Badge className={statusColors[activity.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}>
                        {activity.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
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
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent" asChild>
              <Link href="/leave">
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-xs">Apply Leave</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent" asChild>
              <Link href="/travel">
                <Plane className="w-6 h-6 mb-2" />
                <span className="text-xs">Claim Expense</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent" asChild>
              <Link href="/payroll">
                <FileText className="w-6 h-6 mb-2" />
                <span className="text-xs">View Payslips</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent" asChild>
              <Link href="/performance">
                <TrendingUp className="w-6 h-6 mb-2" />
                <span className="text-xs">View Appraisal</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
