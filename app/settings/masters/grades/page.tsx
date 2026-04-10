'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

export default function GradeMasterPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    level: '1',
    payrollBand: '',
    status: 'Active',
  });

  const canAccess =
    hasPermission('manage_settings') ||
    currentUser?.role === 'Tenant Admin' ||
    currentUser?.role === 'HR Administrator';

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        setLoading(true);
        const res = await apiService.getGrades();
        if (res.success && res.data) setRows(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error('Failed to load grades');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  if (!isAuthenticated || !canAccess) redirect('/dashboard');

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      const res = await apiService.createGrade({
        name: form.name.trim(),
        level: parseInt(form.level, 10) || 1,
        payrollBand: form.payrollBand.trim() || undefined,
        status: form.status,
      });
      if (res.success) {
        toast.success('Grade created');
        setOpen(false);
        setForm({ name: '', level: '1', payrollBand: '', status: 'Active' });
        const r = await apiService.getGrades();
        if (r.success && r.data) setRows(Array.isArray(r.data) ? r.data : []);
      } else {
        toast.error((res as { message?: string }).message || 'Failed');
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Grade / Band Master</h1>
            <p className="text-muted-foreground mt-2">Manage pay bands and grade levels for employees and positions.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add grade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New grade</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Name *</Label>
                  <Input className="mt-1" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Level</Label>
                  <Input className="mt-1" type="number" min={1} value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} />
                </div>
                <div>
                  <Label>Payroll band</Label>
                  <Input className="mt-1" value={form.payrollBand} onChange={(e) => setForm((f) => ({ ...f, payrollBand: e.target.value }))} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submit}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grades</CardTitle>
            <CardDescription>{loading ? 'Loading…' : `${rows.length} records`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Name</th>
                    <th className="p-2">Level</th>
                    <th className="p-2">Band</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((g) => (
                    <tr key={g._id || g.id} className="border-b">
                      <td className="p-2 font-medium">{g.name}</td>
                      <td className="p-2">{g.level}</td>
                      <td className="p-2">{g.payrollBand || '—'}</td>
                      <td className="p-2">{g.status}</td>
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
