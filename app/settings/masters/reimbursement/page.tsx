'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

export default function ReimbursementMasterPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    maxAmountPerClaim: '',
    description: '',
  });

  const canAccess =
    hasPermission('manage_settings') ||
    currentUser?.role === 'Tenant Admin' ||
    currentUser?.role === 'HR Administrator';

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiService.getReimbursementCategories();
      if (res.success && res.data) setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load categories');
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
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Code and name required');
      return;
    }
    try {
      const res = await apiService.createReimbursementCategory({
        code: form.code.trim(),
        name: form.name.trim(),
        maxAmountPerClaim: parseFloat(form.maxAmountPerClaim) || 0,
        description: form.description.trim() || undefined,
        requiresReceipt: true,
        isTaxExempt: false,
        isActive: true,
      });
      if (res.success) {
        toast.success('Category created');
        setOpen(false);
        setForm({ code: '', name: '', maxAmountPerClaim: '', description: '' });
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
            <h1 className="text-3xl font-bold">Reimbursement Master</h1>
            <p className="text-muted-foreground mt-2">Claim categories and limits for employee reimbursements.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New category</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Code *</Label>
                  <Input className="mt-1" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
                </div>
                <div>
                  <Label>Name *</Label>
                  <Input className="mt-1" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Max per claim (INR)</Label>
                  <Input className="mt-1" type="number" value={form.maxAmountPerClaim} onChange={(e) => setForm((f) => ({ ...f, maxAmountPerClaim: e.target.value }))} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input className="mt-1" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
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
            <CardTitle>Categories</CardTitle>
            <CardDescription>{loading ? 'Loading…' : `${rows.length} records`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Code</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Max / claim</th>
                    <th className="p-2">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id || r.id} className="border-b">
                      <td className="p-2 font-mono">{r.code}</td>
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">{r.maxAmountPerClaim}</td>
                      <td className="p-2">{r.isActive ? 'Yes' : 'No'}</td>
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
