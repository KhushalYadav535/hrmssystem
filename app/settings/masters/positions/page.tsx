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

export default function PositionMasterPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    positionCode: '',
    title: '',
    designation: '',
    department: '',
    postingUnitId: '',
  });

  const canAccess =
    hasPermission('manage_settings') ||
    currentUser?.role === 'Tenant Admin' ||
    currentUser?.role === 'HR Administrator';

  const load = async () => {
    try {
      setLoading(true);
      const [p, u, d] = await Promise.all([
        apiService.getPositions({}),
        apiService.getOrganizationUnits({}),
        apiService.getDesignations(),
      ]);
      if (p.success && p.data) setRows(Array.isArray(p.data) ? p.data : []);
      if (u.success && u.data) {
        const raw = u.data as unknown;
        const list = Array.isArray(raw) ? raw : [];
        setUnits(list);
      }
      if (d.success && d.data) setDesignations(Array.isArray(d.data) ? d.data : []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    void load();
  }, [isAuthenticated]);

  if (!isAuthenticated || !canAccess) redirect('/dashboard');

  const submit = async () => {
    if (!form.positionCode || !form.title || !form.designation || !form.department || !form.postingUnitId) {
      toast.error('Fill code, title, designation, department, and org unit');
      return;
    }
    try {
      const res = await apiService.createPosition({
        positionCode: form.positionCode.trim(),
        title: form.title.trim(),
        designation: form.designation,
        department: form.department.trim(),
        postingUnitId: form.postingUnitId,
      });
      if (res.success) {
        toast.success('Position created');
        setOpen(false);
        setForm({ positionCode: '', title: '', designation: '', department: '', postingUnitId: '' });
        await load();
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
            <h1 className="text-3xl font-bold">Position Master</h1>
            <p className="text-muted-foreground mt-2">Define positions linked to org units and designations.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add position
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>New position</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                <div>
                  <Label>Position code *</Label>
                  <Input className="mt-1" value={form.positionCode} onChange={(e) => setForm((f) => ({ ...f, positionCode: e.target.value }))} />
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input className="mt-1" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <Label>Department *</Label>
                  <Input className="mt-1" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
                </div>
                <div>
                  <Label>Designation *</Label>
                  <Select value={form.designation || undefined} onValueChange={(v) => setForm((f) => ({ ...f, designation: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map((d: any) => (
                        <SelectItem key={d._id || d.id} value={String(d._id || d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Org unit (branch / HO / ZO) *</Label>
                  <Select value={form.postingUnitId || undefined} onValueChange={(v) => setForm((f) => ({ ...f, postingUnitId: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u: any) => (
                        <SelectItem key={u._id || u.id} value={String(u._id || u.id)}>
                          {u.unitCode} — {u.unitName}
                        </SelectItem>
                      ))}
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
            <CardTitle>Positions</CardTitle>
            <CardDescription>{loading ? 'Loading…' : `${rows.length} records`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Code</th>
                    <th className="p-2">Title</th>
                    <th className="p-2">Dept</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id || r.id} className="border-b">
                      <td className="p-2 font-mono">{r.positionCode}</td>
                      <td className="p-2">{r.title}</td>
                      <td className="p-2">{r.department}</td>
                      <td className="p-2">{r.status}</td>
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
