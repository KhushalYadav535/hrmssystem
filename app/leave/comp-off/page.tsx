'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

/**
 * Comp-Off Management Page
 * BRD: BR-P1-003 - Leave Management Enhancements - Comp-Off
 */
export default function CompOffPage() {
  const { currentUser } = useAuth();
  const [compOffs, setCompOffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    workedDate: '',
    workedHours: 4,
    reason: '',
  });

  useEffect(() => {
    if (!currentUser) redirect('/login');
    loadCompOffs();
  }, [currentUser]);

  const loadCompOffs = async () => {
    try {
      const res = await apiService.getCompOffs({});
      if (res.success && res.data) {
        setCompOffs(Array.isArray(res.data) ? res.data : res.data.compOffs || []);
      }
    } catch (error: any) {
      toast.error('Failed to load comp-off data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCompOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workedDate || !formData.workedHours || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setSubmitting(true);
      const res = await apiService.requestCompOff({
        workedDate: formData.workedDate,
        workedHours: Number(formData.workedHours),
        reason: formData.reason.trim(),
      });
      if (res.success) {
        toast.success('Comp-off request submitted successfully');
        setDialogOpen(false);
        setFormData({ workedDate: '', workedHours: 4, reason: '' });
        loadCompOffs();
      } else {
        toast.error(res.message || 'Request failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      PENDING: { variant: 'outline', label: 'Pending' },
      APPROVED: { variant: 'default', label: 'Approved' },
      REJECTED: { variant: 'destructive', label: 'Rejected' },
      AVAILED: { variant: 'secondary', label: 'Availed' },
      EXPIRED: { variant: 'secondary', label: 'Expired' },
    };
    const c = map[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const isEmployee = currentUser?.role === 'Employee';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Compensatory Off</h1>
            <p className="text-muted-foreground mt-1">
              Request comp-off for working on holidays or weekly offs (BR-P1-003)
            </p>
          </div>
          {isEmployee && (
            <Button onClick={() => setDialogOpen(true)}>
              <Calendar className="w-4 h-4 mr-2" />
              Request Comp-Off
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Comp-Off</CardTitle>
            <CardDescription>
              Comp-off balance and request history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : compOffs.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">
                No comp-off records found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worked Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Days Earned</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compOffs.map((co) => (
                    <TableRow key={co._id}>
                      <TableCell>
                        {co.workedDate ? formatDateDDMMYYYY(co.workedDate) : '-'}
                      </TableCell>
                      <TableCell>{co.workedHours || '-'}</TableCell>
                      <TableCell>{co.workedHours >= 4 ? 1 : 0.5}</TableCell>
                      <TableCell>{getStatusBadge(co.status)}</TableCell>
                      <TableCell>
                        {co.expiryDate ? formatDateDDMMYYYY(co.expiryDate) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Comp-Off</DialogTitle>
              <DialogDescription>
                Request comp-off for working on a holiday or weekly off. Minimum 4 hours for full day (1 day).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRequestCompOff} className="space-y-4">
              <div>
                <Label>Worked Date *</Label>
                <Input
                  type="date"
                  value={formData.workedDate}
                  onChange={(e) => setFormData({ ...formData, workedDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Hours Worked * (4+ for full day, &lt;4 for half day)</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  step={0.5}
                  value={formData.workedHours}
                  onChange={(e) => setFormData({ ...formData, workedHours: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>Reason *</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Urgent project deadline"
                  rows={3}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
