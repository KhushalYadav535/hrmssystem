'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Clock, Loader2, ArrowLeft, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import apiService from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
const REPORT_TYPES = [
  'EMPLOYEE_MASTER', 'PAYROLL_SUMMARY', 'ATTENDANCE_SUMMARY', 'LEAVE_BALANCE',
  'PERFORMANCE_RATING', 'GRIEVANCE_STATUS', 'TRANSFER_HISTORY', 'LOAN_SUMMARY',
];

export default function ScheduledReportsPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const { toast } = useToast();
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [reportTypes, setReportTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reportName: '',
    reportType: 'EMPLOYEE_MASTER',
    frequency: 'MONTHLY',
    recipients: '',
  });

  if (!isAuthenticated || (!hasPermission('view_reports') && !hasPermission('view_all_reports'))) {
    redirect('/dashboard');
  }

  useEffect(() => {
    loadScheduled();
    apiService.getStandardReportTypes().then((r) => {
      if (r.success && r.data) setReportTypes(r.data);
    });
  }, []);

  const loadScheduled = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.getScheduledReports();
      if (res.success && res.data) {
        setScheduled(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to load scheduled reports', error);
      toast({ title: 'Error', description: 'Failed to load', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reportName) {
      toast({ title: 'Error', description: 'Enter report name', variant: 'destructive' });
      return;
    }
    try {
      setIsSubmitting(true);
      const recipients = formData.recipients
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean)
        .map((email) => ({ email }));
      const res = await apiService.createScheduledReport({
        reportName: formData.reportName,
        reportType: formData.reportType,
        frequency: formData.frequency,
        recipients,
      });
      if (res.success) {
        toast({ title: 'Success', description: 'Scheduled report created' });
        setIsDialogOpen(false);
        setFormData({ reportName: '', reportType: 'EMPLOYEE_MASTER', frequency: 'MONTHLY', recipients: '' });
        loadScheduled();
      } else {
        toast({ title: 'Error', description: res.message || 'Failed', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await apiService.updateScheduledReport(id, { status: newStatus });
      if (res.success) {
        toast({ title: 'Success', description: `Report ${newStatus.toLowerCase()}` });
        loadScheduled();
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/reports" className="text-sm text-primary hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Reports
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Scheduled Reports</h1>
            <p className="text-muted-foreground mt-2">Automate report delivery via email</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Schedule Report
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : scheduled.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No scheduled reports yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Create a schedule to automatically receive reports by email.</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>Schedule Report</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {scheduled.map((s) => (
              <Card key={s._id || s.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{s.reportName}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.filters?.reportType || s.reportType || 'Report'} • {s.frequency} • {s.format || 'EXCEL'}
                      </p>
                      {s.recipients?.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          To: {s.recipients.map((r: any) => r.email).filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={s.status === 'ACTIVE' ? 'bg-green-600' : 'bg-gray-500'}>
                        {s.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStatus(s._id || s.id, s.status)}
                      >
                        {s.status === 'ACTIVE' ? <><Pause className="w-4 h-4 mr-1" /> Pause</> : <><Play className="w-4 h-4 mr-1" /> Resume</>}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Report</DialogTitle>
              <DialogDescription>Report will be sent to recipients based on the selected frequency.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Report Name *</Label>
                <Input
                  value={formData.reportName}
                  onChange={(e) => setFormData({ ...formData, reportName: e.target.value })}
                  placeholder="e.g. Monthly Employee Master"
                  required
                />
              </div>
              <div>
                <Label>Report Type</Label>
                <Select value={formData.reportType} onValueChange={(v) => setFormData({ ...formData, reportType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recipients (comma-separated emails)</Label>
                <Input
                  value={formData.recipients}
                  onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  placeholder="hr@company.com, manager@company.com"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</> : 'Create Schedule'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
