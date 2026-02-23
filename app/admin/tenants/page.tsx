'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import apiService from '@/lib/api';
import Link from 'next/link';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Building2, Pencil, Package } from 'lucide-react';

export default function TenantsPage() {
  const { toast } = useToast();
  const [tenants, setTenants] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [assignPackageId, setAssignPackageId] = useState('');
  const [form, setForm] = useState({ name: '', code: '', location: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, pRes] = await Promise.all([
        apiService.getTenants(),
        apiService.getSubscriptionPackages(),
      ]);
      if (tRes.success && tRes.data) {
        setTenants(Array.isArray(tRes.data) ? tRes.data : []);
      }
      if (pRes.success && pRes.data) {
        setPackages(Array.isArray(pRes.data) ? pRes.data : []);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({ name: '', code: '', location: '' });
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!form.name?.trim() || !form.code?.trim()) {
      toast({ title: 'Error', description: 'Name and code required', variant: 'destructive' });
      return;
    }
    try {
      const res = await apiService.createTenant(form);
      if (res.success) {
        toast({ title: 'Success', description: 'Company created' });
        setDialogOpen(false);
        loadData();
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleAssignPackage = async () => {
    if (!selectedTenant?.id || !assignPackageId) return;
    try {
      const res = await apiService.applySubscriptionPackage(selectedTenant.id, assignPackageId);
      if (res.success) {
        toast({ title: 'Success', description: 'Package assigned' });
        setAssignDialogOpen(false);
        setSelectedTenant(null);
        setAssignPackageId('');
        loadData();
      } else {
        toast({
          title: 'Error',
          description: (res as any).error || (res as any).message || 'Failed to assign package',
          variant: 'destructive',
        });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to assign package', variant: 'destructive' });
    }
  };

  const updateTenant = async (tenant: any, updates: any) => {
    try {
      const res = await apiService.updateTenant(tenant.id, updates);
      if (res.success) {
        toast({ title: 'Success', description: 'Updated' });
        loadData();
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tenant Management</h1>
          <p className="text-muted-foreground">Add and manage companies</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((t) => (
          <Card key={t.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle>{t.name}</CardTitle>
                    <CardDescription>{t.code} {t.location ? `• ${t.location}` : ''}</CardDescription>
                  </div>
                </div>
                <Badge variant={t.status === 'active' ? 'default' : 'secondary'}>{t.status || 'active'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t.employees || 0} employees</p>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/admin/modules?tenant=${t.id}`}>Modules</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedTenant(t);
                    setAssignPackageId('');
                    setAssignDialogOpen(true);
                  }}
                >
                  <Package className="h-4 w-4 mr-1" />
                  Assign Package
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Company</DialogTitle>
            <DialogDescription>Create a new tenant/company</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Company Name</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <Label>Code (unique)</Label>
              <Input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="ACME"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Mumbai"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Package</DialogTitle>
            <DialogDescription>Assign subscription package to {selectedTenant?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Select Package</Label>
            <Select value={assignPackageId} onValueChange={setAssignPackageId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose package" />
              </SelectTrigger>
              <SelectContent>
                {packages.filter(p => p.isActive !== false).map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.packageName} – ₹{Number(p.monthlyPrice || 0).toLocaleString()}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignPackage} disabled={!assignPackageId}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  );
}
