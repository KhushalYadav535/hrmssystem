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
import { Loader2, Plus, Building2, Pencil, Package, Eye, EyeOff } from 'lucide-react';

export default function TenantsPage() {
  const { toast } = useToast();
  const [tenants, setTenants] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [assignPackageId, setAssignPackageId] = useState('');
  const [editForm, setEditForm] = useState({ name: '', location: '', status: 'active', adminEmail: '', adminName: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    location: 'India',
    adminEmail: '',
    adminPassword: '',
    adminName: 'Tenant Administrator',
  });
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

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
    setForm({
      name: '',
      code: '',
      location: 'India',
      adminEmail: '',
      adminPassword: '',
      adminName: 'Tenant Administrator',
    });
    setAdminConfirmPassword('');
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!form.name?.trim() || !form.code?.trim()) {
      toast({ title: 'Error', description: 'Name and code required', variant: 'destructive' });
      return;
    }
    if (!form.adminEmail?.trim()) {
      toast({ title: 'Error', description: 'Admin email required', variant: 'destructive' });
      return;
    }
    if (!form.adminPassword) {
      toast({ title: 'Error', description: 'Admin password required', variant: 'destructive' });
      return;
    }
    if (form.adminPassword !== adminConfirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (form.adminPassword.length < 12) {
      toast({ title: 'Error', description: 'Password must be at least 12 characters (uppercase, lowercase, digit, special char)', variant: 'destructive' });
      return;
    }
    try {
      const res = await apiService.createTenant({
        name: form.name,
        code: form.code,
        location: form.location,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
        adminName: form.adminName,
      });
      if (res.success) {
        toast({ title: 'Success', description: 'Tenant and admin user created successfully' });
        setDialogOpen(false);
        loadData();
      } else {
        toast({
          title: 'Error',
          description: (res as any).message || (res as any).error || 'Failed to create tenant',
          variant: 'destructive',
        });
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

  const openEdit = (tenant: any) => {
    setSelectedTenant(tenant);
    setEditForm({
      name: tenant.name || '',
      location: tenant.location || '',
      status: tenant.status || 'active',
      adminEmail: tenant.adminEmail || '',
      adminName: tenant.adminName || '',
    });
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!editForm.name?.trim()) {
      toast({ title: 'Error', description: 'Company name is required', variant: 'destructive' });
      return;
    }
    try {
      setEditLoading(true);
      const res = await apiService.updateTenant(selectedTenant.id, {
        name: editForm.name.trim(),
        location: editForm.location.trim(),
        status: editForm.status,
        adminEmail: editForm.adminEmail.trim() || undefined,
        adminName: editForm.adminName.trim() || undefined,
      });
      if (res.success) {
        toast({ title: 'Success', description: 'Tenant updated successfully' });
        setEditDialogOpen(false);
        setSelectedTenant(null);
        loadData();
      } else {
        toast({
          title: 'Error',
          description: (res as any).message || (res as any).error || 'Failed to update tenant',
          variant: 'destructive',
        });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setEditLoading(false);
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
                <div className="flex gap-2 mt-4 flex-wrap">
                  <Button size="sm" variant="default" asChild>
                    <Link href={`/admin/modules?tenant=${t.id}`}>
                      <Package className="h-4 w-4 mr-1" />
                      Manage Modules
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(t)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Company</DialogTitle>
              <DialogDescription>Create a new tenant/company. Admin user will become Tenant Administrator.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Acme Corp"
                />
              </div>
              <div>
                <Label>Code (unique) *</Label>
                <Input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g., ACME"
                />
              </div>
              <div>
                <Label>Location *</Label>
                <Input
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g., India"
                />
              </div>
              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-medium text-muted-foreground mb-3">Tenant Administrator</p>
                <div className="space-y-4">
                  <div>
                    <Label>Admin Email Address *</Label>
                    <Input
                      type="email"
                      value={form.adminEmail}
                      onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <Label>Admin Name</Label>
                    <Input
                      value={form.adminName}
                      onChange={e => setForm(f => ({ ...f, adminName: e.target.value }))}
                      placeholder="Tenant Administrator"
                    />
                  </div>
                  <div>
                    <Label>Password *</Label>
                    <div className="relative">
                      <Input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={form.adminPassword}
                        onChange={e => setForm(f => ({ ...f, adminPassword: e.target.value }))}
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Min 12 chars, uppercase, lowercase, digit, special char</p>
                  </div>
                  <div>
                    <Label>Confirm Password *</Label>
                    <Input
                      type="password"
                      value={adminConfirmPassword}
                      onChange={e => setAdminConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
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
        {/* Edit Tenant Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Tenant</DialogTitle>
              <DialogDescription>Update details for {selectedTenant?.name}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
              <div>
                <Label>Code</Label>
                <Input
                  value={selectedTenant?.code || ''}
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Tenant code cannot be changed</p>
              </div>
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Acme Corp"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={editForm.location}
                  onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g., India"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-medium text-muted-foreground mb-3">Tenant Administrator</p>
                <div className="space-y-4">
                  <div>
                    <Label>Admin Email Address</Label>
                    <Input
                      type="email"
                      value={editForm.adminEmail}
                      onChange={e => setEditForm(f => ({ ...f, adminEmail: e.target.value }))}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <Label>Admin Name</Label>
                    <Input
                      value={editForm.adminName}
                      onChange={e => setEditForm(f => ({ ...f, adminName: e.target.value }))}
                      placeholder="Tenant Administrator"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEdit} disabled={editLoading}>
                {editLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
