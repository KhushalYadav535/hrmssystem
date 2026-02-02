'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import CalendarView from '@/components/common/calendar-view';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function AttendancePage() {
  const { isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (!isAuthenticated) {
    redirect('/login');
  }

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAttendance({});
      if (res.success && res.data) {
        setAttendanceRecords(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch attendance', error);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        fetchAttendance();
    }
  }, [isAuthenticated]);

  const handleCheckIn = async () => {
    try {
        const res = await apiService.checkIn({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toISOString()
        });
        if (res.success) {
            toast.success('Checked in successfully');
            fetchAttendance();
        } else {
            toast.error(res.message || 'Failed to check in');
        }
    } catch (error: any) {
        toast.error(error.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
        const res = await apiService.checkOut({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toISOString()
        });
        if (res.success) {
            toast.success('Checked out successfully');
            fetchAttendance();
        } else {
            toast.error(res.message || 'Failed to check out');
        }
    } catch (error: any) {
        toast.error(error.message || 'Failed to check out');
    }
  };

  const presentDays = attendanceRecords.filter((a) => a.status === 'Present').length;
  const totalWorkingHours = attendanceRecords.reduce((sum, a) => sum + (a.workingHours || 0), 0);
  const avgWorkingHours = attendanceRecords.length > 0 ? (totalWorkingHours / attendanceRecords.length).toFixed(1) : '0';

  const calendarEvents = attendanceRecords.map(record => ({
    date: record.date.split('T')[0],
    title: record.status,
    type: (record.status === 'Present' ? 'event' : record.status === 'Leave' ? 'leave' : 'holiday') as any,
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

  // Check today's status
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceRecords.find(r => r.date.startsWith(todayStr));
  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;
  const isCheckedOut = !!todayRecord?.checkOut;
  const hasCheckedInToday = !!todayRecord;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground mt-2">Track your attendance and check-in/out history</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Present Days</p>
                <p className="text-2xl font-bold">{presentDays}</p>
                <p className="text-xs text-muted-foreground mt-1">Current month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Working Hours</p>
                <p className="text-2xl font-bold">{totalWorkingHours.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground mt-1">This period</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Average Daily Hours</p>
                <p className="text-2xl font-bold">{avgWorkingHours}h</p>
                <p className="text-xs text-muted-foreground mt-1">Per working day</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-green-600">100%</p>
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
                disabled={hasCheckedInToday}
              >
                <Clock className="w-4 h-4" />
                {hasCheckedInToday ? 'Checked In' : 'Check In'}
              </Button>
              <Button 
                className="w-full gap-2 bg-transparent" 
                variant="outline"
                onClick={handleCheckOut}
                disabled={!isCheckedIn}
              >
                <Clock className="w-4 h-4" />
                Check Out
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                Request Regularization
              </Button>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Today's Status</p>
                {todayRecord ? (
                     <>
                        <p className="text-lg font-semibold text-green-600 mt-2">
                            {todayRecord.checkOut ? 'Checked Out' : 'Checked In'}
                        </p>
                        {todayRecord.checkIn && (
                            <p className="text-xs text-muted-foreground mt-1">
                                at {new Date(todayRecord.checkIn).toLocaleTimeString()}
                            </p>
                        )}
                     </>
                ) : (
                    <p className="text-lg font-semibold text-gray-600 mt-2">Not Checked In</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Attendance Records</CardTitle>
            <CardDescription>History</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-left p-3 font-semibold">Check In</th>
                    <th className="text-left p-3 font-semibold">Check Out</th>
                    <th className="text-right p-3 font-semibold">Hours</th>
                    <th className="text-center p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.length === 0 ? (
                      <tr>
                          <td colSpan={5} className="text-center p-4 text-muted-foreground">No attendance records found.</td>
                      </tr>
                  ) : attendanceRecords.map((record) => (
                    <tr key={record._id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {record.date.split('T')[0]}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                        </div>
                      </td>
                      <td className="text-right p-3 font-medium">{record.workingHours}h</td>
                      <td className="text-center p-3">
                        <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
