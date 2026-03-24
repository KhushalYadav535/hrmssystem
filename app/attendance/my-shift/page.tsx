'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function MyShiftPage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [shift, setShift] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  if (!isAuthenticated) redirect('/login');

  useEffect(() => {
    loadMyShift();
  }, []);

  const loadMyShift = async () => {
    try {
      setIsLoading(true);
      const empResponse = await apiService.getEmployees({ email: user?.email });
      if (empResponse.success && empResponse.data && Array.isArray(empResponse.data) && empResponse.data.length > 0) {
        const emp = empResponse.data[0];
        setEmployee(emp);
        const empId = emp._id || emp.id;
        const response = await apiService.getEmployeeShift(empId);
        if (response.success && response.data) {
          setShift(response.data);
        } else {
          setShift(null);
        }
      } else {
        setEmployee(null);
        setShift(null);
      }
    } catch (error) {
      console.error('Failed to load shift', error);
      toast({
        title: 'Error',
        description: 'Failed to load your shift details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (t: string) => {
    if (!t) return '-';
    const parts = t.split(':');
    const h = parseInt(parts[0] || '0', 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Shift</h1>
            <p className="text-muted-foreground mt-2">View your current shift assignment and schedule</p>
          </div>
          <Link
            href="/attendance"
            className="text-sm text-primary hover:underline"
          >
            ← Back to Attendance
          </Link>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : !employee ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Employee record not found. Please contact HR.</p>
            </CardContent>
          </Card>
        ) : !shift ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active shift assigned to you.</p>
              <p className="text-sm text-muted-foreground mt-2">Please contact your manager or HR for shift assignment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Current Shift
                </CardTitle>
                <CardDescription>
                  Effective from {shift.effectiveDate ? formatDateDDMMYYYY(shift.effectiveDate) : '-'}
                  {shift.endDate && ` until ${formatDateDDMMYYYY(shift.endDate)}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Shift Name</p>
                    <p className="text-xl font-semibold">
                      {shift.shiftId?.shiftName || shift.shiftId?.shiftCode || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shift Code</p>
                    <p className="text-xl font-semibold">{shift.shiftId?.shiftCode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Time</p>
                    <p className="text-lg font-medium">{formatTime(shift.shiftId?.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Time</p>
                    <p className="text-lg font-medium">{formatTime(shift.shiftId?.endTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-lg font-medium">{shift.shiftId?.totalHours || 8} hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="secondary">{shift.shiftId?.shiftType || 'Regular'}</Badge>
                  </div>
                </div>
                {shift.remarks && (
                  <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Remarks</p>
                    <p className="text-sm">{shift.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Link
                  href="/attendance"
                  className="px-4 py-2 rounded-lg border border-border hover:bg-secondary/50 text-sm font-medium"
                >
                  Attendance
                </Link>
                <Link
                  href="/attendance/overtime"
                  className="px-4 py-2 rounded-lg border border-border hover:bg-secondary/50 text-sm font-medium"
                >
                  Overtime Requests
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
