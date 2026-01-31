'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockAttendance } from '@/lib/mock-data';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import CalendarView from '@/components/common/calendar-view';
import { useState } from 'react';

export default function AttendancePage() {
  const { isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (!isAuthenticated) {
    redirect('/login');
  }

  const attendanceRecords = mockAttendance;
  const presentDays = attendanceRecords.filter((a) => a.status === 'Present').length;
  const totalWorkingHours = attendanceRecords.reduce((sum, a) => sum + a.workingHours, 0);
  const avgWorkingHours = attendanceRecords.length > 0 ? (totalWorkingHours / attendanceRecords.length).toFixed(1) : '0';

  const calendarEvents = attendanceRecords.map(record => ({
    date: record.date,
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
              <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                <Clock className="w-4 h-4" />
                Check In
              </Button>
              <Button className="w-full gap-2 bg-transparent" variant="outline">
                <Clock className="w-4 h-4" />
                Check Out
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                Request Regularization
              </Button>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Today's Status</p>
                <p className="text-lg font-semibold text-green-600 mt-2">Checked In at 9:00 AM</p>
                <p className="text-xs text-muted-foreground mt-1">Working since 9 hours 30 minutes</p>
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
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-left p-3 font-semibold">Check In</th>
                    <th className="text-left p-3 font-semibold">Check Out</th>
                    <th className="text-right p-3 font-semibold">Hours</th>
                    <th className="text-center p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {record.date}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {record.checkIn}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {record.checkOut}
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
