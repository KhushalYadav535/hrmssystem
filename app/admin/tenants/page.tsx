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
import { Search, Building2, AlertCircle, CheckCircle2, XCircle, Pause, Play, Ban } from 'lucide-react';
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
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reactivate tenant');
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
