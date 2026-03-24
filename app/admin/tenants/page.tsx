'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Building2, AlertCircle, CheckCircle2, XCircle, Pause, Play, Ban, Plus, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

/**
 * US-A4-01: Suspend / Deactivate Tenant Capability
 * US-A4-02: Tenant Search and Filter
 */
export default function TenantsPage() {
  const { currentUser } = useAuth();
  const [tenants, setTenants] = useState<any[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showAddTenantDialog, setShowAddTenantDialog] = useState(false);
  const [showEditTenantDialog, setShowEditTenantDialog] = useState(false);
  const [showDeleteTenantDialog, setShowDeleteTenantDialog] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Add Tenant form state
  const [addTenantForm, setAddTenantForm] = useState({
    name: '',
    code: '',
    location: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    bank_id: '',
    bank_code: '',
    bank_name: '',
    short_name: '',
    registration_no: '',
    rbi_license_no: '',
    registered_office: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pin: '',
    phone: '',
    email: '',
    website: '',
  });

  // Edit Tenant form state - all fields like Create
  const [editTenantForm, setEditTenantForm] = useState({
    name: '',
    code: '',
    location: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    bank_id: '',
    bank_code: '',
    bank_name: '',
    short_name: '',
    registration_no: '',
    rbi_license_no: '',
    registered_office: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pin: '',
    phone: '',
    email: '',
    website: '',
  });

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    filterTenants();
  }, [tenants, searchQuery, statusFilter]);

  const loadTenants = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getTenants();
      if (response.success && response.data) {
        const list = Array.isArray(response.data) ? response.data : [];
        setTenants(list);
      }
    } catch (error: any) {
      toast.error('Failed to load tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTenants = () => {
    let filtered = [...tenants];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(query) ||
        t.code?.toLowerCase().includes(query) ||
        t.location?.toLowerCase().includes(query) ||
        t.registrationEmail?.toLowerCase().includes(query)
      );
    }

    setFilteredTenants(filtered);
  };

  const handleSuspend = async () => {
    if (!reason || reason.trim().length < 20) {
      toast.error('Please provide a reason (minimum 20 characters)');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiService.suspendTenant(selectedTenant._id || selectedTenant.id, reason);
      if (response.success) {
        toast.success('Tenant suspended successfully');
        setShowSuspendDialog(false);
        setReason('');
        setSelectedTenant(null);
        loadTenants();
      } else {
        toast.error(response.message || 'Failed to suspend tenant');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to suspend tenant');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeactivate = async () => {
    if (!reason || reason.trim().length < 20) {
      toast.error('Please provide a reason (minimum 20 characters)');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiService.deactivateTenant(selectedTenant._id || selectedTenant.id, reason);
      if (response.success) {
        toast.success('Tenant deactivated successfully');
        setShowDeactivateDialog(false);
        setReason('');
        setSelectedTenant(null);
        loadTenants();
      } else {
        toast.error(response.message || 'Failed to deactivate tenant');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to deactivate tenant');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async () => {
    setIsProcessing(true);
    try {
      const response = await apiService.reactivateTenant(selectedTenant._id || selectedTenant.id);
      if (response.success) {
        toast.success('Tenant reactivated successfully');
        setShowReactivateDialog(false);
        setSelectedTenant(null);
        loadTenants();
      } else {
        toast.error(response.message || 'Failed to reactivate tenant');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reactivate tenant');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditTenant = async () => {
    if (!editTenantForm.name?.trim()) {
      toast.error('Tenant name is required');
      return;
    }
    if (!editTenantForm.code?.trim()) {
      toast.error('Tenant code is required');
      return;
    }
    if (!editTenantForm.adminEmail?.trim()) {
      toast.error('Admin email is required');
      return;
    }
    if (editTenantForm.adminPassword && editTenantForm.adminPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const tid = selectedTenant._id || selectedTenant.id;
    setIsProcessing(true);
    try {
      const payload: Record<string, any> = {
        name: editTenantForm.name.trim(),
        code: editTenantForm.code.trim().toUpperCase(),
        location: editTenantForm.location?.trim() || '',
        adminName: editTenantForm.adminName?.trim() || undefined,
        adminEmail: editTenantForm.adminEmail.trim().toLowerCase(),
        bank_id: editTenantForm.bank_id?.trim() || undefined,
        bank_code: editTenantForm.bank_code?.trim() || undefined,
        bank_name: editTenantForm.bank_name?.trim() || undefined,
        short_name: editTenantForm.short_name?.trim() || undefined,
        registration_no: editTenantForm.registration_no?.trim() || undefined,
        rbi_license_no: editTenantForm.rbi_license_no?.trim() || undefined,
        registered_office: editTenantForm.registered_office?.trim() || undefined,
        address: editTenantForm.address?.trim() || undefined,
        city: editTenantForm.city?.trim() || undefined,
        state: editTenantForm.state?.trim() || undefined,
        country: editTenantForm.country?.trim() || undefined,
        pin: editTenantForm.pin?.trim() || undefined,
        phone: editTenantForm.phone?.trim() || undefined,
        email: editTenantForm.email?.trim() || undefined,
        website: editTenantForm.website?.trim() || undefined,
      };
      if (editTenantForm.adminPassword) payload.adminPassword = editTenantForm.adminPassword;
      const response = await apiService.updateTenant(tid, payload);
      if (response.success) {
        toast.success('Tenant updated successfully');
        setShowEditTenantDialog(false);
        setSelectedTenant(null);
        loadTenants();
      } else {
        toast.error(response.message || 'Failed to update tenant');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tenant');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTenant = async () => {
    const tid = selectedTenant._id || selectedTenant.id;
    setIsProcessing(true);
    try {
      const response = await apiService.deleteTenant(tid);
      if (response.success) {
        toast.success('Tenant deleted successfully');
        setShowDeleteTenantDialog(false);
        setSelectedTenant(null);
        loadTenants();
      } else {
        toast.error(response.message || 'Failed to delete tenant');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete tenant');
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditTenant = (tenant: any) => {
    setSelectedTenant(tenant);
    setEditTenantForm({
      name: tenant.name || '',
      code: tenant.code || '',
      location: tenant.location || '',
      adminName: tenant.adminName || '',
      adminEmail: tenant.adminEmail || tenant.registrationEmail || '',
      adminPassword: '',
      bank_id: tenant.bank_id || '',
      bank_code: tenant.bank_code || '',
      bank_name: tenant.bank_name || '',
      short_name: tenant.short_name || '',
      registration_no: tenant.registration_no || '',
      rbi_license_no: tenant.rbi_license_no || '',
      registered_office: tenant.registered_office || '',
      address: tenant.address || '',
      city: tenant.city || '',
      state: tenant.state || '',
      country: tenant.country || '',
      pin: tenant.pin || '',
      phone: tenant.phone || '',
      email: tenant.email || '',
      website: tenant.website || '',
    });
    setShowEditTenantDialog(true);
  };

  const getPasswordErrors = (pwd: string): string[] => {
    const errs: string[] = [];
    if (!pwd || pwd.length < 6) errs.push('At least 6 characters');
    return errs;
  };

  const handleAddTenant = async () => {
    const { name, code, location, adminName, adminEmail, adminPassword } = addTenantForm;
    if (!name?.trim() || !code?.trim()) {
      toast.error('Tenant name and code are required');
      return;
    }
    if (!adminEmail?.trim()) {
      toast.error('Admin email is required');
      return;
    }
    if (!adminPassword || adminPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const pwdErrors = getPasswordErrors(adminPassword);
    if (pwdErrors.length > 0) {
      toast.error(`Invalid password: ${pwdErrors.join(', ')}`);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiService.createTenant({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        location: location?.trim() || undefined,
        adminName: adminName?.trim() || undefined,
        adminEmail: adminEmail.trim().toLowerCase(),
        adminPassword,
        bank_id: addTenantForm.bank_id?.trim() || undefined,
        bank_code: addTenantForm.bank_code?.trim() || undefined,
        bank_name: addTenantForm.bank_name?.trim() || undefined,
        short_name: addTenantForm.short_name?.trim() || undefined,
        registration_no: addTenantForm.registration_no?.trim() || undefined,
        rbi_license_no: addTenantForm.rbi_license_no?.trim() || undefined,
        registered_office: addTenantForm.registered_office?.trim() || undefined,
        address: addTenantForm.address?.trim() || undefined,
        city: addTenantForm.city?.trim() || undefined,
        state: addTenantForm.state?.trim() || undefined,
        country: addTenantForm.country?.trim() || undefined,
        pin: addTenantForm.pin?.trim() || undefined,
        phone: addTenantForm.phone?.trim() || undefined,
        email: addTenantForm.email?.trim() || undefined,
        website: addTenantForm.website?.trim() || undefined,
      });
        if (response.success) {
        toast.success('Tenant created successfully');
        setShowAddTenantDialog(false);
        setAddTenantForm({
          name: '', code: '', location: '', adminName: '', adminEmail: '', adminPassword: '',
          bank_id: '', bank_code: '', bank_name: '', short_name: '', registration_no: '',
          rbi_license_no: '', registered_office: '', address: '', city: '', state: '', country: '',
          pin: '', phone: '', email: '', website: '',
        });
        loadTenants();
      } else {
        toast.error(response.message || 'Failed to create tenant');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tenant');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      inactive: { variant: 'secondary', label: 'Inactive' },
      suspended: { variant: 'destructive', label: 'Suspended' },
      pending: { variant: 'outline', label: 'Pending' },
      rejected: { variant: 'destructive', label: 'Rejected' },
    };
    const config = statusMap[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tenant Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage all organization tenants, including suspension and deactivation
            </p>
          </div>
          <Button onClick={() => setShowAddTenantDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, location, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tenants List */}
        <Card>
          <CardHeader>
            <CardTitle>Tenants ({filteredTenants.length})</CardTitle>
            <CardDescription>
              Showing {filteredTenants.length} of {tenants.length} tenants
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading tenants...</p>
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tenants found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTenants.map((tenant: any) => (
                  <div
                    key={tenant._id || tenant.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg">{tenant.name}</p>
                          {getStatusBadge(tenant.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Code: {tenant.code} • Location: {tenant.location || 'N/A'}
                        </p>
                        {tenant.registrationEmail && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Email: {tenant.registrationEmail}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Employees: {tenant.employeeCount || tenant.employees || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditTenant(tenant)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setShowDeleteTenantDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                      {tenant.status === 'active' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setShowSuspendDialog(true);
                            }}
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Suspend
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setShowDeactivateDialog(true);
                            }}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Deactivate
                          </Button>
                        </>
                      )}
                      {(tenant.status === 'suspended' || tenant.status === 'inactive') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setShowReactivateDialog(true);
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suspend Dialog */}
        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Tenant</DialogTitle>
              <DialogDescription>
                Suspend tenant "{selectedTenant?.name}". All user accounts will be locked.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Reason (minimum 20 characters) *</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for suspension..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSuspend} disabled={isProcessing || reason.trim().length < 20}>
                  {isProcessing ? 'Suspending...' : 'Suspend Tenant'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Deactivate Dialog */}
        <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate Tenant</DialogTitle>
              <DialogDescription>
                Deactivate tenant "{selectedTenant?.name}". All user accounts will be locked.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Reason (minimum 20 characters) *</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for deactivation..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDeactivate} disabled={isProcessing || reason.trim().length < 20} variant="destructive">
                  {isProcessing ? 'Deactivating...' : 'Deactivate Tenant'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Tenant Dialog - Full form like Create, fully visible with scroll */}
        <Dialog open={showEditTenantDialog} onOpenChange={(open) => {
          setShowEditTenantDialog(open);
          if (!open) setSelectedTenant(null);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
              <DialogTitle>Edit Tenant</DialogTitle>
              <DialogDescription>
                Update tenant details, bank info, and admin user
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 space-y-4 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tenant Name *</Label>
                  <Input
                    value={editTenantForm.name}
                    onChange={(e) => setEditTenantForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Acme Corporation"
                  />
                </div>
                <div>
                  <Label>Tenant Code *</Label>
                  <Input
                    value={editTenantForm.code}
                    onChange={(e) => setEditTenantForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. ACME-CORP"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Unique code</p>
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={editTenantForm.location}
                  onChange={(e) => setEditTenantForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Mumbai, India"
                />
              </div>

              {/* Bank/Organization Details */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Bank / Organization Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Bank ID</Label><Input placeholder="Bank ID" value={editTenantForm.bank_id} onChange={(e) => setEditTenantForm(f => ({ ...f, bank_id: e.target.value }))} /></div>
                  <div><Label>Bank Code</Label><Input placeholder="Bank Code" value={editTenantForm.bank_code} onChange={(e) => setEditTenantForm(f => ({ ...f, bank_code: e.target.value }))} /></div>
                  <div className="md:col-span-2"><Label>Bank Name</Label><Input placeholder="Bank Name" value={editTenantForm.bank_name} onChange={(e) => setEditTenantForm(f => ({ ...f, bank_name: e.target.value }))} /></div>
                  <div><Label>Short Name</Label><Input placeholder="Short Name" value={editTenantForm.short_name} onChange={(e) => setEditTenantForm(f => ({ ...f, short_name: e.target.value }))} /></div>
                  <div><Label>Registration No</Label><Input placeholder="Registration No" value={editTenantForm.registration_no} onChange={(e) => setEditTenantForm(f => ({ ...f, registration_no: e.target.value }))} /></div>
                  <div><Label>RBI License No</Label><Input placeholder="RBI License No" value={editTenantForm.rbi_license_no} onChange={(e) => setEditTenantForm(f => ({ ...f, rbi_license_no: e.target.value }))} /></div>
                  <div className="md:col-span-2"><Label>Registered Office</Label><Input placeholder="Registered Office" value={editTenantForm.registered_office} onChange={(e) => setEditTenantForm(f => ({ ...f, registered_office: e.target.value }))} /></div>
                  <div className="md:col-span-2"><Label>Address</Label><Input placeholder="Address" value={editTenantForm.address} onChange={(e) => setEditTenantForm(f => ({ ...f, address: e.target.value }))} /></div>
                  <div><Label>City</Label><Input placeholder="City" value={editTenantForm.city} onChange={(e) => setEditTenantForm(f => ({ ...f, city: e.target.value }))} /></div>
                  <div><Label>State</Label><Input placeholder="State" value={editTenantForm.state} onChange={(e) => setEditTenantForm(f => ({ ...f, state: e.target.value }))} /></div>
                  <div><Label>Country</Label><Input placeholder="Country" value={editTenantForm.country} onChange={(e) => setEditTenantForm(f => ({ ...f, country: e.target.value }))} /></div>
                  <div><Label>PIN</Label><Input placeholder="PIN" value={editTenantForm.pin} onChange={(e) => setEditTenantForm(f => ({ ...f, pin: e.target.value }))} /></div>
                  <div><Label>Phone</Label><Input placeholder="Phone" value={editTenantForm.phone} onChange={(e) => setEditTenantForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div><Label>Email</Label><Input type="email" placeholder="Organization Email" value={editTenantForm.email} onChange={(e) => setEditTenantForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><Label>Website</Label><Input placeholder="Website" value={editTenantForm.website} onChange={(e) => setEditTenantForm(f => ({ ...f, website: e.target.value }))} /></div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Tenant Admin User</p>
                <div className="space-y-3">
                  <div>
                    <Label>Admin Name</Label>
                    <Input
                      value={editTenantForm.adminName}
                      onChange={(e) => setEditTenantForm(f => ({ ...f, adminName: e.target.value }))}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <Label>Admin Email *</Label>
                    <Input
                      type="email"
                      value={editTenantForm.adminEmail}
                      onChange={(e) => setEditTenantForm(f => ({ ...f, adminEmail: e.target.value }))}
                      placeholder="admin@company.com"
                    />
                  </div>
                  <div>
                    <Label>New Password (optional)</Label>
                    <div className="relative">
                      <Input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editTenantForm.adminPassword}
                        onChange={(e) => setEditTenantForm(f => ({ ...f, adminPassword: e.target.value }))}
                        placeholder="Leave blank to keep current"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {editTenantForm.adminPassword && editTenantForm.adminPassword.length < 6 && (
                      <p className="text-xs text-destructive mt-1">Password must be at least 6 characters</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters if changing</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-6 pt-4 border-t shrink-0">
              <Button variant="outline" onClick={() => setShowEditTenantDialog(false)}>Cancel</Button>
              <Button
                onClick={handleEditTenant}
                disabled={
                  isProcessing ||
                  !editTenantForm.name?.trim() ||
                  !editTenantForm.code?.trim() ||
                  !editTenantForm.adminEmail?.trim() ||
                  (editTenantForm.adminPassword ? editTenantForm.adminPassword.length < 6 : false)
                }
              >
                {isProcessing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Tenant Dialog - Full form with scroll */}
        <Dialog open={showAddTenantDialog} onOpenChange={(open) => {
          setShowAddTenantDialog(open);
          if (!open) setAddTenantForm({
            name: '', code: '', location: '', adminName: '', adminEmail: '', adminPassword: '',
            bank_id: '', bank_code: '', bank_name: '', short_name: '', registration_no: '',
            rbi_license_no: '', registered_office: '', address: '', city: '', state: '', country: '',
            pin: '', phone: '', email: '', website: '',
          });
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
              <DialogTitle>Add Tenant</DialogTitle>
              <DialogDescription>
                Create a new tenant organization with a Tenant Admin user.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 space-y-4 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tenant Name *</Label>
                  <Input
                    placeholder="e.g. Acme Corporation"
                    value={addTenantForm.name}
                    onChange={(e) => setAddTenantForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Tenant Code *</Label>
                  <Input
                    placeholder="e.g. ACME-CORP"
                    value={addTenantForm.code}
                    onChange={(e) => setAddTenantForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Unique code</p>
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  placeholder="e.g. Mumbai, India"
                  value={addTenantForm.location}
                  onChange={(e) => setAddTenantForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>

              {/* Bank/Organization Details */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Bank / Organization Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Bank ID</Label><Input placeholder="Bank ID" value={addTenantForm.bank_id} onChange={(e) => setAddTenantForm(f => ({ ...f, bank_id: e.target.value }))} /></div>
                  <div><Label>Bank Code</Label><Input placeholder="Bank Code" value={addTenantForm.bank_code} onChange={(e) => setAddTenantForm(f => ({ ...f, bank_code: e.target.value }))} /></div>
                  <div className="md:col-span-2"><Label>Bank Name</Label><Input placeholder="Bank Name" value={addTenantForm.bank_name} onChange={(e) => setAddTenantForm(f => ({ ...f, bank_name: e.target.value }))} /></div>
                  <div><Label>Short Name</Label><Input placeholder="Short Name" value={addTenantForm.short_name} onChange={(e) => setAddTenantForm(f => ({ ...f, short_name: e.target.value }))} /></div>
                  <div><Label>Registration No</Label><Input placeholder="Registration No" value={addTenantForm.registration_no} onChange={(e) => setAddTenantForm(f => ({ ...f, registration_no: e.target.value }))} /></div>
                  <div><Label>RBI License No</Label><Input placeholder="RBI License No" value={addTenantForm.rbi_license_no} onChange={(e) => setAddTenantForm(f => ({ ...f, rbi_license_no: e.target.value }))} /></div>
                  <div className="md:col-span-2"><Label>Registered Office</Label><Input placeholder="Registered Office" value={addTenantForm.registered_office} onChange={(e) => setAddTenantForm(f => ({ ...f, registered_office: e.target.value }))} /></div>
                  <div className="md:col-span-2"><Label>Address</Label><Input placeholder="Address" value={addTenantForm.address} onChange={(e) => setAddTenantForm(f => ({ ...f, address: e.target.value }))} /></div>
                  <div><Label>City</Label><Input placeholder="City" value={addTenantForm.city} onChange={(e) => setAddTenantForm(f => ({ ...f, city: e.target.value }))} /></div>
                  <div><Label>State</Label><Input placeholder="State" value={addTenantForm.state} onChange={(e) => setAddTenantForm(f => ({ ...f, state: e.target.value }))} /></div>
                  <div><Label>Country</Label><Input placeholder="Country" value={addTenantForm.country} onChange={(e) => setAddTenantForm(f => ({ ...f, country: e.target.value }))} /></div>
                  <div><Label>PIN</Label><Input placeholder="PIN" value={addTenantForm.pin} onChange={(e) => setAddTenantForm(f => ({ ...f, pin: e.target.value }))} /></div>
                  <div><Label>Phone</Label><Input placeholder="Phone" value={addTenantForm.phone} onChange={(e) => setAddTenantForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div><Label>Email</Label><Input type="email" placeholder="Organization Email" value={addTenantForm.email} onChange={(e) => setAddTenantForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><Label>Website</Label><Input placeholder="Website" value={addTenantForm.website} onChange={(e) => setAddTenantForm(f => ({ ...f, website: e.target.value }))} /></div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Tenant Admin User</p>
                <div className="space-y-3">
                  <div>
                    <Label>Admin Name</Label>
                    <Input
                      placeholder="e.g. John Doe"
                      value={addTenantForm.adminName}
                      onChange={(e) => setAddTenantForm(f => ({ ...f, adminName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Admin Email *</Label>
                    <Input
                      type="email"
                      placeholder="admin@company.com"
                      value={addTenantForm.adminEmail}
                      onChange={(e) => setAddTenantForm(f => ({ ...f, adminEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Admin Password *</Label>
                    <div className="relative">
                      <Input
                        type={showAddPassword ? 'text' : 'password'}
                        placeholder="Minimum 6 characters required"
                        value={addTenantForm.adminPassword}
                        onChange={(e) => setAddTenantForm(f => ({ ...f, adminPassword: e.target.value }))}
                        className={`pr-10 ${addTenantForm.adminPassword && addTenantForm.adminPassword.length < 6 ? 'border-destructive' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAddPassword(!showAddPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {addTenantForm.adminPassword && addTenantForm.adminPassword.length < 6 && (
                      <p className="text-xs text-destructive mt-1">Password must be at least 6 characters</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-6 pt-4 border-t shrink-0">
              <Button variant="outline" onClick={() => setShowAddTenantDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddTenant}
                disabled={
                  isProcessing ||
                  !addTenantForm.name?.trim() ||
                  !addTenantForm.code?.trim() ||
                  !addTenantForm.adminEmail?.trim() ||
                  !addTenantForm.adminPassword ||
                  addTenantForm.adminPassword.length < 6
                }
              >
                {isProcessing ? 'Creating...' : 'Create Tenant'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Tenant Dialog */}
        <Dialog open={showDeleteTenantDialog} onOpenChange={setShowDeleteTenantDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Tenant</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete tenant &quot;{selectedTenant?.name}&quot;? This will permanently remove the tenant and all associated data. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteTenantDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteTenant} disabled={isProcessing}>
                {isProcessing ? 'Deleting...' : 'Delete Tenant'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reactivate Dialog */}
        <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reactivate Tenant</DialogTitle>
              <DialogDescription>
                Reactivate tenant "{selectedTenant?.name}". All user accounts will be unlocked.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to reactivate this tenant? All user accounts will be unlocked and the tenant will be able to access the system again.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReactivateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReactivate} disabled={isProcessing}>
                  {isProcessing ? 'Reactivating...' : 'Reactivate Tenant'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
