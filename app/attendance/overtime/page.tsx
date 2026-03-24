'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

export default function OvertimePage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [overtimeRecords, setOvertimeRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    requestedHours: '',
    reason: '',
    otType: 'WEEKDAY',
  });

  if (!isAuthenticated) redirect('/login');

  useEffect(() => {
    loadEmployeeAndOvertime();
  }, []);

  const loadEmployeeAndOvertime = async () => {
    try {
      setIsLoading(true);
      let empId: string | null = null;
      const empRes = await apiService.getEmployees({ email: user?.email });
      if (empRes.success && empRes.data && Array.isArray(empRes.data) && empRes.data.length > 0) {
        empId = empRes.data[0]._id || empRes.data[0].id;
        setEmployeeId(empId);
      }
      const response = await apiService.getOvertime(empId ? { employeeId: empId } : undefined);
      if (response.success && response.data) {
        setOvertimeRecords(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load overtime', error);
      toast({
        title: 'Error',
        description: 'Failed to load overtime records',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(formData.requestedHours);
    if (!hours || hours <= 0 || hours > 24) {
      toast({
        title: 'Error',
        description: 'Please enter valid hours (0.5 to 24)',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.reason?.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiService.requestOvertime({
        date: formData.date,
        requestedHours: hours,
        reason: formData.reason.trim(),
        otType: formData.otType,
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Overtime request submitted successfully',
        });
        setShowForm(false);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          requestedHours: '',
          reason: '',
          otType: 'WEEKDAY',
        });
        loadEmployeeAndOvertime();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to submit request',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit overtime request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalOvertime = overtimeRecords.reduce((sum, r) => sum + (r.actualHours || 0), 0);
  const approvedOvertime = overtimeRecords
    .filter((r) => r.status === 'APPROVED' || r.status === 'PAID')
    .reduce((sum, r) => sum + (r.actualHours || 0), 0);
  const pendingOvertime = overtimeRecords
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + (r.requestedHours || r.actualHours || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
        return <Badge className="bg-green-600">{status}</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-600">{status}</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Overtime Requests</h1>
            <p className="text-muted-foreground mt-2">Request and track overtime hours</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/attendance/my-shift"
              className="text-sm text-primary hover:underline"
            >
              My Shift
            </Link>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="w-4 h-4" />
              New OT Request
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Overtime</p>
                  <p className="text-2xl font-bold">{totalOvertime.toFixed(1)} hrs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedOvertime.toFixed(1)} hrs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingOvertime.toFixed(1)} hrs</p>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="border-accent/50">
            <CardHeader>
              <CardTitle>New Overtime Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      placeholder="3"
                      value={formData.requestedHours}
                      onChange={(e) => setFormData({ ...formData, requestedHours: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="otType">OT Type</Label>
                  <Select
                    value={formData.otType}
                    onValueChange={(v) => setFormData({ ...formData, otType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKDAY">Weekday (1.5x)</SelectItem>
                      <SelectItem value="WEEKEND">Weekend (2x)</SelectItem>
                      <SelectItem value="HOLIDAY">Holiday (2.5x)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <textarea
                    id="reason"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card min-h-[80px]"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Brief reason for overtime"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Overtime Records</h3>
          {isLoading ? (
            <Card>
              <CardContent className="p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : overtimeRecords.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No overtime records yet. Submit a request above.
              </CardContent>
            </Card>
          ) : (
            overtimeRecords.map((rec) => (
              <Card key={rec._id || rec.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {rec.date ? formatDateDDMMYYYY(rec.date) : '-'} -{' '}
                        {(rec.actualHours ?? rec.requestedHours ?? 0)} hours
                      </p>
                      <p className="text-sm text-muted-foreground">{rec.reason || '-'}</p>
                      {rec.otType && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Type: {rec.otType} ({(rec.otRate || 1.5)}x)
                        </p>
                      )}
                    </div>
                    {getStatusBadge(rec.status)}
                  </div>
                  {rec.status === 'REJECTED' && rec.rejectionReason && (
                    <p className="text-sm text-red-600 mt-2">Reason: {rec.rejectionReason}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
