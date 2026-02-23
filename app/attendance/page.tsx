'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import CalendarView from '@/components/common/calendar-view';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployees } from '@/lib/hooks/useEmployees';
import Link from 'next/link';

export default function AttendancePage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const { employees } = useEmployees();
  
  // Check if user is HR Admin or Tenant Admin (can see all employees)
  const isHRAdmin = currentUser?.role === 'HR Administrator' || currentUser?.role === 'Tenant Admin' || currentUser?.role === 'Super Admin';

  useEffect(() => {
    loadAttendances();
    loadTodayStatus();
  }, [selectedEmployeeId]);

  const loadTodayStatus = async () => {
    try {
      const response = await apiService.getTodayAttendance();
      if (response.success && response.data) {
        setTodayStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load today status', error);
    }
  };

  const loadAttendances = async () => {
    try {
      setIsLoading(true);
      // Get current month's attendance
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      // If HR Admin and employee selected, filter by employee
      const params: any = { startDate, endDate };
      if (isHRAdmin && selectedEmployeeId && selectedEmployeeId !== 'all') {
        params.employeeId = selectedEmployeeId;
      }
      
      const response = await apiService.getAttendances(params);
      if (response.success && response.data) {
        const records = Array.isArray(response.data) ? response.data : [];
        setAttendanceRecords(records);
        
        // Calculate summary
        const presentDays = records.filter((a) => a.status === 'Present').length;
        const totalWorkingHours = records.reduce((sum, a) => sum + (a.workingHours || 0), 0);
        const avgWorkingHours = records.length > 0 ? (totalWorkingHours / records.length).toFixed(1) : '0';
        const attendanceRate = records.length > 0 ? Math.round((presentDays / records.length) * 100) : 0;
        
        setSummary({
          presentDays,
          totalWorkingHours,
          avgWorkingHours,
          attendanceRate,
        });
      }
    } catch (error) {
      console.error('Failed to load attendance data', error);
      toast.error('Failed to load attendance records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true);
      const response = await apiService.checkIn();
      if (response.success) {
        toast.success('Checked in successfully');
        loadTodayStatus();
        loadAttendances();
      } else {
        toast.error(response.message || 'Failed to check in');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to check in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsCheckingOut(true);
      const response = await apiService.checkOut();
      if (response.success) {
        toast.success('Checked out successfully');
        loadTodayStatus();
        loadAttendances();
      } else {
        toast.error(response.message || 'Failed to check out');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to check out');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleRequestRegularization = () => {
    // Navigate to punch correction page
    window.location.href = '/attendance/punch-correction';
  };

  if (!isAuthenticated) {
    redirect('/login');
  }

  const calendarEvents = attendanceRecords.map(record => ({
    date: new Date(record.date).toISOString().split('T')[0],
    title: record.status,
    type: record.status === 'Present' ? 'event' : record.status === 'Leave' ? 'leave' : 'holiday' as const,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-700';
      case 'Absent':
        return 'bg-red-100 text-red-700';
      case 'Half Day':
        return 'bg-yellow-100 text-yellow-700';
      case 'Leave':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
            <p className="text-muted-foreground mt-2">
              {isHRAdmin ? 'View and manage all employees\' attendance' : 'Track your attendance and check-in/out history'}
            </p>
          </div>
          {isHRAdmin && (
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select Employee (All)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((emp: any) => (
                  <SelectItem key={emp._id || emp.id} value={emp._id || emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Present Days</p>
                <p className="text-2xl font-bold">{isLoading ? '...' : (summary?.presentDays || 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Current month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Working Hours</p>
                <p className="text-2xl font-bold">{isLoading ? '...' : (summary?.totalWorkingHours?.toFixed(1) || '0')}h</p>
                <p className="text-xs text-muted-foreground mt-1">This period</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Average Daily Hours</p>
                <p className="text-2xl font-bold">{isLoading ? '...' : (summary?.avgWorkingHours || '0')}h</p>
                <p className="text-xs text-muted-foreground mt-1">Per working day</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-green-600">{isLoading ? '...' : (summary?.attendanceRate || 0)}%</p>
                <p className="text-xs text-muted-foreground mt-1">This period</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalendarView events={calendarEvents} onDateClick={setSelectedDate} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Check in/out and manage attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleCheckIn}
                disabled={isCheckingIn || todayStatus?.checkedIn}
              >
                {isCheckingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking In...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Check In
                  </>
                )}
              </Button>
              <Button 
                className="w-full gap-2 bg-transparent" 
                variant="outline"
                onClick={handleCheckOut}
                disabled={isCheckingOut || !todayStatus?.checkedIn || todayStatus?.checkedOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking Out...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Check Out
                  </>
                )}
              </Button>
              <Button 
                className="w-full bg-transparent" 
                variant="outline"
                onClick={handleRequestRegularization}
                asChild
              >
                <Link href="/attendance/punch-correction">
                  Request Regularization
                </Link>
              </Button>
              <Button 
                className="w-full bg-transparent" 
                variant="outline"
                asChild
              >
                <Link href="/attendance/my-shift">
                  View My Shift
                </Link>
              </Button>
              <Button 
                className="w-full bg-transparent" 
                variant="outline"
                asChild
              >
                <Link href="/attendance/overtime">
                  Overtime Requests
                </Link>
              </Button>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Today's Status</p>
                {todayStatus?.checkedIn ? (
                  <>
                    <p className="text-lg font-semibold text-green-600 mt-2">
                      Checked In at {todayStatus.checkIn ? new Date(todayStatus.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </p>
                    {todayStatus.checkedOut ? (
                      <p className="text-sm text-muted-foreground mt-1">
                        Checked Out at {todayStatus.checkOut ? new Date(todayStatus.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        Working since {todayStatus.workingHours ? `${todayStatus.workingHours.toFixed(1)} hours` : '0 hours'}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-lg font-semibold text-muted-foreground mt-2">Not Checked In</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Attendance Records</CardTitle>
            <CardDescription>January 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {isHRAdmin && <th className="text-left p-3 font-semibold">Employee</th>}
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-left p-3 font-semibold">Check In</th>
                    <th className="text-left p-3 font-semibold">Check Out</th>
                    <th className="text-right p-3 font-semibold">Hours</th>
                    <th className="text-center p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={isHRAdmin ? 6 : 5} className="p-8 text-center text-muted-foreground">Loading attendance records...</td>
                    </tr>
                  ) : attendanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan={isHRAdmin ? 6 : 5} className="p-8 text-center text-muted-foreground">No attendance records found</td>
                    </tr>
                  ) : (
                    attendanceRecords.map((record) => {
                      const recordId = record._id || record.id;
                      const recordDate = record.date ? new Date(record.date).toLocaleDateString() : 'N/A';
                      const checkIn = record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-';
                      const checkOut = record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-';
                      const workingHours = record.workingHours || 0;
                      const status = record.status || 'Absent';
                      const employee = record.employeeId;
                      const employeeName = employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() : 'N/A';
                      const employeeCode = employee?.employeeCode || '';
                      
                      return (
                        <tr key={recordId} className="border-b border-border hover:bg-secondary/50 transition-colors">
                          {isHRAdmin && (
                            <td className="p-3">
                              <div>
                                <p className="font-medium text-sm">{employeeName}</p>
                                <p className="text-xs text-muted-foreground">{employeeCode}</p>
                              </div>
                            </td>
                          )}
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {recordDate}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {checkIn}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {checkOut}
                            </div>
                          </td>
                          <td className="text-right p-3 font-medium">{workingHours.toFixed(1)}h</td>
                          <td className="text-center p-3">
                            <Badge className={getStatusColor(status)}>{status}</Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
