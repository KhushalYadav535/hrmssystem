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

export default function LoanAdvanceMasterPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    loanCode: '',
    loanName: '',
    maxAmount: '',
    interestRatePercent: '0',
    maxTenureMonths: '12',
    minServiceYears: '0',
    description: '',
  });

  const canAccess =
    hasPermission('manage_settings') ||
    currentUser?.role === 'Tenant Admin' ||
    currentUser?.role === 'HR Administrator';

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiService.getLoanTypes();
      if (res.success && res.data) setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load loan types');
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
    if (!form.loanCode.trim() || !form.loanName.trim()) {
      toast.error('Code and name required');
      return;
    }
    try {
      const res = await apiService.createLoanType({
        loanCode: form.loanCode.trim(),
        loanName: form.loanName.trim(),
        maxAmount: parseFloat(form.maxAmount) || 0,
        interestRatePercent: parseFloat(form.interestRatePercent) || 0,
        maxTenureMonths: parseInt(form.maxTenureMonths, 10) || 12,
        minServiceYears: parseInt(form.minServiceYears, 10) || 0,
        isActive: true,
        description: form.description.trim() || undefined,
      });
      if (res.success) {
        toast.success('Loan type created');
        setOpen(false);
        setForm({
          loanCode: '',
          loanName: '',
          maxAmount: '',
          interestRatePercent: '0',
          maxTenureMonths: '12',
          minServiceYears: '0',
          description: '',
        });
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
            <h1 className="text-3xl font-bold">Loan &amp; Advance Master</h1>
            <p className="text-muted-foreground mt-2">Loan products available for employee applications.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add loan type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New loan type</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Code *</Label>
                  <Input className="mt-1" value={form.loanCode} onChange={(e) => setForm((f) => ({ ...f, loanCode: e.target.value }))} />
                </div>
                <div>
                  <Label>Name *</Label>
                  <Input className="mt-1" value={form.loanName} onChange={(e) => setForm((f) => ({ ...f, loanName: e.target.value }))} />
                </div>
                <div>
                  <Label>Max amount (INR)</Label>
                  <Input className="mt-1" type="number" value={form.maxAmount} onChange={(e) => setForm((f) => ({ ...f, maxAmount: e.target.value }))} />
                </div>
                <div>
                  <Label>Interest % p.a.</Label>
                  <Input className="mt-1" type="number" value={form.interestRatePercent} onChange={(e) => setForm((f) => ({ ...f, interestRatePercent: e.target.value }))} />
                </div>
                <div>
                  <Label>Max tenure (months)</Label>
                  <Input className="mt-1" type="number" value={form.maxTenureMonths} onChange={(e) => setForm((f) => ({ ...f, maxTenureMonths: e.target.value }))} />
                </div>
                <div>
                  <Label>Min service (years)</Label>
                  <Input className="mt-1" type="number" value={form.minServiceYears} onChange={(e) => setForm((f) => ({ ...f, minServiceYears: e.target.value }))} />
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
            <CardTitle>Loan types</CardTitle>
            <CardDescription>{loading ? 'Loading…' : `${rows.length} records`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Code</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Max</th>
                    <th className="p-2">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id || r.id} className="border-b">
                      <td className="p-2 font-mono">{r.loanCode}</td>
                      <td className="p-2">{r.loanName}</td>
                      <td className="p-2">{r.maxAmount}</td>
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
