'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import apiService from '@/lib/api';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Package, Archive } from 'lucide-react';

const TIERS = ['BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE', 'CUSTOM'];

export default function SubscriptionPackagesPage() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [form, setForm] = useState({
    packageCode: '',
    packageName: '',
    description: '',
    packageTier: 'BASIC',
    monthlyPrice: 0,
    annualPrice: 0,
    maxUsers: undefined as number | undefined,
    maxStorageGb: undefined as number | undefined,
    includedModules: [] as string[],
    features: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pkgRes, modRes] = await Promise.all([
        apiService.getSubscriptionPackages(),
        apiService.getAllPlatformModules(),
      ]);
      if (pkgRes.success && pkgRes.data) {
        setPackages(Array.isArray(pkgRes.data) ? pkgRes.data : []);
      }
      if (modRes.success) {
        const mods = modRes.data?.modules || modRes.modules || (Array.isArray(modRes.data) ? modRes.data : []);
        setAllModules(Array.isArray(mods) ? mods : []);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      packageCode: '',
      packageName: '',
      description: '',
      packageTier: 'BASIC',
      monthlyPrice: 0,
      annualPrice: 0,
      maxUsers: undefined,
      maxStorageGb: undefined,
      includedModules: [],
      features: [],
      isActive: true,
    });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (pkg: any) => {
    setEditing(pkg);
    setForm({
      packageCode: pkg.packageCode || '',
      packageName: pkg.packageName || '',
      description: pkg.description || '',
      packageTier: pkg.packageTier || 'BASIC',
      monthlyPrice: pkg.monthlyPrice || 0,
      annualPrice: pkg.annualPrice || 0,
      maxUsers: pkg.maxUsers,
      maxStorageGb: pkg.maxStorageGb,
      includedModules: pkg.includedModules || [],
      features: pkg.features || [],
      isActive: pkg.isActive !== false,
    });
    setDialogOpen(true);
  };

  const toggleModule = (code: string) => {
    setForm(f => ({
      ...f,
      includedModules: f.includedModules.includes(code)
        ? f.includedModules.filter(m => m !== code)
        : [...f.includedModules, code],
    }));
  };

  const handleSubmit = async () => {
    if (!form.packageCode?.trim() || !form.packageName?.trim()) {
      toast({ title: 'Error', description: 'Code and name required', variant: 'destructive' });
      return;
    }
    try {
      if (editing) {
        const res = await apiService.updateSubscriptionPackage(editing._id, form);
        if (res.success) {
          toast({ title: 'Success', description: 'Package updated' });
          setDialogOpen(false);
          loadData();
        }
      } else {
        const res = await apiService.createSubscriptionPackage(form);
        if (res.success) {
          toast({ title: 'Success', description: 'Package created' });
          setDialogOpen(false);
          loadData();
        }
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this package? It will be hidden from new assignments but preserved for history.')) return;
    try {
      const res = await apiService.archiveSubscriptionPackage(id);
      if (res.success) {
        toast({ title: 'Success', description: 'Package archived' });
        loadData();
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package? This action cannot be undone.')) return;
    try {
      const res = await apiService.deleteSubscriptionPackage(id);
      if (res.success) {
        toast({ title: 'Success', description: 'Package deleted' });
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
            <h1 className="text-3xl font-bold">Subscription Packages</h1>
            <p className="text-muted-foreground">Basic, Standard, Premium, Enterprise</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </div>

        {/* Active Packages */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Packages</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packages.filter((pkg: any) => !pkg.isArchived).map((pkg) => (
            <Card key={pkg._id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {pkg.packageName}
                    </CardTitle>
                    <CardDescription>{pkg.description || pkg.packageTier}</CardDescription>
                  </div>
                  <Badge variant={pkg.isActive ? 'default' : 'secondary'}>{pkg.packageTier}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹{Number(pkg.monthlyPrice || 0).toLocaleString()}/mo</p>
                {pkg.annualPrice && (
                  <p className="text-sm text-muted-foreground">₹{Number(pkg.annualPrice).toLocaleString()}/yr</p>
                )}
                <p className="text-sm mt-2">{pkg.includedModules?.length || 0} modules included</p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => openEdit(pkg)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleArchive(pkg._id)}>
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(pkg._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        </div>

        {/* Archived Packages */}
        {packages.filter((pkg: any) => pkg.isArchived).length > 0 && (
          <details className="mt-6">
            <summary className="text-lg font-semibold cursor-pointer mb-4">
              Archived Packages ({packages.filter((pkg: any) => pkg.isArchived).length})
            </summary>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {packages.filter((pkg: any) => pkg.isArchived).map((pkg) => (
                <Card key={pkg._id} className="opacity-60">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          {pkg.packageName}
                        </CardTitle>
                        <CardDescription>{pkg.description || pkg.packageTier}</CardDescription>
                      </div>
                      <Badge variant="secondary">Archived</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">₹{Number(pkg.monthlyPrice || 0).toLocaleString()}/mo</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Archived on {formatDateDDMMYYYY(pkg.archivedAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </details>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Package' : 'Create Package'}</DialogTitle>
              <DialogDescription>Configure subscription tier</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Package Code</Label>
                  <Input
                    value={form.packageCode}
                    onChange={e => setForm(f => ({ ...f, packageCode: e.target.value.toUpperCase() }))}
                    placeholder="BASIC"
                    disabled={!!editing}
                  />
                </div>
                <div>
                  <Label>Package Name</Label>
                  <Input
                    value={form.packageName}
                    onChange={e => setForm(f => ({ ...f, packageName: e.target.value }))}
                    placeholder="Basic Plan"
                  />
                </div>
              </div>
              <div>
                <Label>Tier</Label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.packageTier}
                  onChange={e => setForm(f => ({ ...f, packageTier: e.target.value }))}
                >
                  {TIERS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Price (₹)</Label>
                  <Input
                    type="number"
                    value={form.monthlyPrice || ''}
                    onChange={e => setForm(f => ({ ...f, monthlyPrice: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Annual Price (₹)</Label>
                  <Input
                    type="number"
                    value={form.annualPrice || ''}
                    onChange={e => setForm(f => ({ ...f, annualPrice: Number(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div>
                <Label>Included Modules</Label>
                <div className="border rounded p-3 max-h-40 overflow-y-auto flex flex-wrap gap-2 mt-1">
                  {allModules.filter(m => !m.isCore).map((m) => (
                    <Badge
                      key={m._id}
                      variant={form.includedModules.includes(m.moduleCode) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleModule(m.moduleCode)}
                    >
                      {m.moduleName} ({m.moduleCode})
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
