'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/dashboard-layout';
import apiService from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Settings } from 'lucide-react';
import { Tenant } from '@/lib/types';

/**
 * Platform Admin - Module Management Dashboard
 * BRD: Dynamic Module Management System - DM-033
 */
export default function PlatformModuleManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [allModules, setAllModules] = useState<any[]>([]);
  const [companyModules, setCompanyModules] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enablingModule, setEnablingModule] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [configData, setConfigData] = useState({
    pricingModel: '',
    monthlyCost: 0,
    userLimit: undefined as number | undefined,
    trialDays: undefined as number | undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      loadCompanyModules();
      loadPendingRequests();
    }
  }, [selectedTenant]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load tenants
      const tenantsRes = await apiService.getTenants();
      if (tenantsRes.success && tenantsRes.data) {
        setTenants(tenantsRes.data);
        if (tenantsRes.data.length > 0) {
          setSelectedTenant(tenantsRes.data[0].id);
        }
      }

      // Load all platform modules
      const modulesRes = await apiService.getAllPlatformModules();
      if (modulesRes.success && modulesRes.data) {
        setAllModules(modulesRes.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyModules = async () => {
    if (!selectedTenant) return;
    
    try {
      const res = await apiService.getCompanyModules(selectedTenant, true);
      if (res.success && res.data) {
        setCompanyModules(res.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load company modules',
        variant: 'destructive',
      });
    }
  };

  const loadPendingRequests = async () => {
    if (!selectedTenant) return;
    
    try {
      const res = await apiService.getModuleRequests('PENDING');
      if (res.success && res.data) {
        const raw = res.data as any;
        const list = Array.isArray(raw) ? raw : (raw?.requests || []);
        const filtered = list.filter((r: any) => String(r.tenantId) === String(selectedTenant));
        setPendingRequests(filtered);
      }
    } catch (error: any) {
      console.error('Failed to load requests:', error);
    }
  };

  const handleEnableModule = async (moduleId: string) => {
    if (!selectedTenant) return;
    const id = typeof moduleId === 'string' ? moduleId : (moduleId as any)?.toString?.() || '';
    if (!id) {
      toast({ title: 'Error', description: 'Invalid module', variant: 'destructive' });
      return;
    }

    setEnablingModule(true);
    try {
      const res = await apiService.enableModule(selectedTenant, id, {
        pricingModel: configData.pricingModel || 'FLAT_FEE',
        monthlyCost: Number(configData.monthlyCost) || 0,
        userLimit: configData.userLimit,
        trialDays: configData.trialDays,
      });
      if (res.success) {
        toast({ title: 'Success', description: 'Module enabled successfully' });
        setConfigDialogOpen(false);
        setSelectedModule(null);
        loadCompanyModules();
      } else {
        toast({
          title: 'Error',
          description: (res as any).error || (res as any).message || 'Failed to enable module',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to enable module',
        variant: 'destructive',
      });
    } finally {
      setEnablingModule(false);
    }
  };

  const handleDisableModule = async (moduleId: string, reason: string) => {
    if (!selectedTenant) return;

    if (!reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for disabling',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await apiService.disableModule(selectedTenant, moduleId, reason);
      if (res.success) {
        toast({
          title: 'Success',
          description: 'Module disabled successfully',
        });
        loadCompanyModules();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disable module',
        variant: 'destructive',
      });
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const res = await apiService.approveModuleRequest(requestId);
      if (res.success) {
        toast({
          title: 'Success',
          description: 'Request approved successfully',
        });
        loadPendingRequests();
        loadCompanyModules();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve request',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    if (!reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await apiService.rejectModuleRequest(requestId, reason);
      if (res.success) {
        toast({
          title: 'Success',
          description: 'Request rejected',
        });
        loadPendingRequests();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  const openConfigDialog = (module: any) => {
    setSelectedModule(module);
    setConfigData({
      pricingModel: module.pricingModel || 'FLAT_FEE',
      monthlyCost: module.basePrice || 0,
      userLimit: undefined,
      trialDays: undefined,
    });
    setConfigDialogOpen(true);
  };

  const enabledModules = companyModules.filter(m => m.isEnabled);
  const disabledModules = companyModules.filter(m => !m.isEnabled);
  const availableModules = allModules.filter(
    m => !m.isCore && !companyModules.some(cm => cm.moduleId?._id === m._id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Management</h1>
          <p className="text-muted-foreground">Manage modules for companies</p>
        </div>
      </div>

      {/* Tenant Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Company</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTenant} onValueChange={setSelectedTenant}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name} ({tenant.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedTenant && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Modules</CardDescription>
                <CardTitle className="text-2xl">{enabledModules.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Available Modules</CardDescription>
                <CardTitle className="text-2xl">{availableModules.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending Requests</CardDescription>
                <CardTitle className="text-2xl">{pendingRequests.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Modules</CardDescription>
                <CardTitle className="text-2xl">{allModules.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active Modules ({enabledModules.length})</TabsTrigger>
              <TabsTrigger value="available">Available Modules ({availableModules.length})</TabsTrigger>
              <TabsTrigger value="requests">Pending Requests ({pendingRequests.length})</TabsTrigger>
            </TabsList>

            {/* Active Modules Tab */}
            <TabsContent value="active" className="space-y-4">
              {enabledModules.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No active modules
                  </CardContent>
                </Card>
              ) : (
                enabledModules.map((cm) => {
                  const module = cm.moduleId || {};
                  return (
                    <Card key={cm._id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {module.moduleName}
                              <Badge variant={cm.trialEndDate ? 'secondary' : 'default'}>
                                {cm.trialEndDate ? 'Trial' : 'Active'}
                              </Badge>
                            </CardTitle>
                            <CardDescription>{module.description}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openConfigDialog(module)}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                            {!module.isCore && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const reason = prompt('Reason for disabling:');
                                  if (reason) {
                                    handleDisableModule(module._id, reason);
                                  }
                                }}
                              >
                                Disable
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Category:</span>
                            <p className="font-medium">{module.moduleCategory}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Monthly Cost:</span>
                            <p className="font-medium">₹{cm.monthlyCost?.toLocaleString() || 0}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Activated:</span>
                            <p className="font-medium">
                              {new Date(cm.activationDate).toLocaleDateString()}
                            </p>
                          </div>
                          {cm.trialEndDate && (
                            <div>
                              <span className="text-muted-foreground">Trial Ends:</span>
                              <p className="font-medium">
                                {new Date(cm.trialEndDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* Available Modules Tab */}
            <TabsContent value="available" className="space-y-4">
              {availableModules.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    All modules are enabled
                  </CardContent>
                </Card>
              ) : (
                availableModules.map((module) => (
                  <Card key={module._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{module.moduleName}</CardTitle>
                          <CardDescription>{module.description}</CardDescription>
                        </div>
                        <Button onClick={() => openConfigDialog(module)}>Enable</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <p className="font-medium">{module.moduleCategory}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pricing:</span>
                          <p className="font-medium">
                            {module.pricingModel === 'FLAT_FEE'
                              ? `₹${module.basePrice?.toLocaleString()}/month`
                              : module.pricingModel === 'PER_USER'
                              ? `₹${module.basePrice}/user/month`
                              : 'Bundled'}
                          </p>
                        </div>
                        {module.dependsOnModules && module.dependsOnModules.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Depends on:</span>
                            <p className="font-medium">{module.dependsOnModules.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Pending Requests Tab */}
            <TabsContent value="requests" className="space-y-4">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No pending requests
                  </CardContent>
                </Card>
              ) : (
                pendingRequests.map((request) => {
                  const module = request.moduleId || {};
                  return (
                    <Card key={request._id}>
                      <CardHeader>
                        <CardTitle>{module.moduleName}</CardTitle>
                        <CardDescription>
                          Requested by: {request.requestedBy} on{' '}
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Business Justification</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.businessJustification}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Request Type:</span>
                            <p className="font-medium">{request.requestType}</p>
                          </div>
                          {request.expectedUsers && (
                            <div>
                              <span className="text-muted-foreground">Expected Users:</span>
                              <p className="font-medium">{request.expectedUsers}</p>
                            </div>
                          )}
                          {request.trialRequested && (
                            <div>
                              <span className="text-muted-foreground">Trial Duration:</span>
                              <p className="font-medium">{request.trialDurationDays} days</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveRequest(request._id)}
                            className="flex-1"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) {
                                handleRejectRequest(request._id, reason);
                              }
                            }}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Module Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Module: {selectedModule?.moduleName}</DialogTitle>
            <DialogDescription>
              Set pricing, limits, and activation options for this module
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pricing Model</Label>
              <Select
                value={configData.pricingModel}
                onValueChange={(value) => setConfigData({ ...configData, pricingModel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLAT_FEE">Flat Fee</SelectItem>
                  <SelectItem value="PER_USER">Per User</SelectItem>
                  <SelectItem value="PER_TRANSACTION">Per Transaction</SelectItem>
                  <SelectItem value="BUNDLED">Bundled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Monthly Cost (₹)</Label>
              <Input
                type="number"
                value={configData.monthlyCost}
                onChange={(e) =>
                  setConfigData({ ...configData, monthlyCost: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>User Limit (optional)</Label>
              <Input
                type="number"
                value={configData.userLimit || ''}
                onChange={(e) =>
                  setConfigData({
                    ...configData,
                    userLimit: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div>
              <Label>Trial Period (days, optional)</Label>
              <Input
                type="number"
                value={configData.trialDays || ''}
                onChange={(e) =>
                  setConfigData({
                    ...configData,
                    trialDays: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Leave empty for direct activation"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedModule && handleEnableModule(selectedModule._id)}
              disabled={enablingModule}
            >
              {enablingModule ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                'Save & Activate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  );
}
