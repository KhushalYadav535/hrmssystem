'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import apiService from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, CheckCircle2, XCircle, AlertCircle, Package, Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';

/**
 * Company Admin - Module Request Page
 * BRD: Dynamic Module Management System - DM-034
 * Access: Tenant Admin, HR Administrator only
 */
export default function CompanyModuleRequestPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [myModules, setMyModules] = useState<any[]>([]);
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [requestData, setRequestData] = useState({
    requestType: 'ACTIVATION',
    businessJustification: '',
    expectedUsers: undefined as number | undefined,
    trialRequested: false,
    trialDurationDays: 30,
  });

  // BRD: Access Control - Module Management page is only for Tenant Admin and HR Administrator
  useEffect(() => {
    if (!isAuthenticated) {
      redirect('/login');
    }
    const adminRoles = ['Tenant Admin', 'HR Administrator'];
    if (!adminRoles.includes(currentUser?.role || '')) {
      // Non-admin users should not access module management
      redirect('/dashboard');
    }
  }, [isAuthenticated, currentUser?.role]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load my company modules (backend returns { modules: [] })
      const modulesRes = await apiService.getMyCompanyModules();
      if (modulesRes.success) {
        const raw = (modulesRes as any).data;
        const list = Array.isArray(raw) ? raw : (raw?.modules ?? (modulesRes as any).modules ?? []);
        setMyModules(list);
      }

      // Load available modules (backend returns { modules: [] })
      const availableRes = await apiService.getAvailableModules();
      if (availableRes.success) {
        const raw = (availableRes as any).data;
        const list = Array.isArray(raw) ? raw : (raw?.modules ?? (availableRes as any).modules ?? []);
        setAvailableModules(list);
      }

      // Load my tenant's module requests (use company API - platform API is Super Admin only)
      const requestsRes = await apiService.getCompanyModuleRequests();
      if (requestsRes.success) {
        const raw = (requestsRes as any).data;
        const list = Array.isArray(raw) ? raw : (raw?.requests ?? (requestsRes as any).requests ?? []);
        setMyRequests(list);
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

  const handleRequestModule = async () => {
    if (!selectedModule) return;

    if (!requestData.businessJustification.trim()) {
      toast({
        title: 'Error',
        description: 'Business justification is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await apiService.requestModuleActivation({
        moduleId: selectedModule._id,
        requestType: requestData.requestType,
        businessJustification: requestData.businessJustification,
        expectedUsers: requestData.expectedUsers,
        trialRequested: requestData.trialRequested,
      });

      if (res.success) {
        toast({
          title: 'Success',
          description: 'Module activation request submitted successfully',
        });
        setRequestDialogOpen(false);
        setRequestData({
          requestType: 'ACTIVATION',
          businessJustification: '',
          expectedUsers: undefined,
          trialRequested: false,
          trialDurationDays: 30,
        });
        loadData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit request',
        variant: 'destructive',
      });
    }
  };

  const openRequestDialog = (module: any) => {
    setSelectedModule(module);
    setRequestData({
      requestType: 'ACTIVATION',
      businessJustification: '',
      expectedUsers: undefined,
      trialRequested: false,
      trialDurationDays: 30,
    });
    setRequestDialogOpen(true);
  };

  const enabledModules = myModules.filter(m => m.isEnabled);
  const disabledModules = myModules.filter(m => !m.isEnabled);
  const pendingRequests = myRequests.filter(r => r.status === 'PENDING');
  const approvedRequests = myRequests.filter(r => r.status === 'APPROVED');
  const rejectedRequests = myRequests.filter(r => r.status === 'REJECTED');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Module Management</h1>
            <p className="text-muted-foreground">View enabled modules and request new ones</p>
          </div>
        </div>

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
              <CardTitle className="text-2xl">{enabledModules.length + availableModules.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Modules ({enabledModules.length})</TabsTrigger>
            <TabsTrigger value="available">Available Modules ({availableModules.length})</TabsTrigger>
            <TabsTrigger value="requests">My Requests ({myRequests.length})</TabsTrigger>
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
                            {formatDateDDMMYYYY(cm.activationDate)}
                          </p>
                        </div>
                        {cm.trialEndDate && (
                          <div>
                            <span className="text-muted-foreground">Trial Ends:</span>
                            <p className="font-medium">
                              {formatDateDDMMYYYY(cm.trialEndDate)}
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
                      <Button onClick={() => openRequestDialog(module)}>Request Activation</Button>
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
                              ? `₹${module.basePrice?.toLocaleString()}/user/month`
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

          {/* My Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button
                variant="default"
                onClick={() => {
                  if (availableModules.length === 0) {
                    toast({
                      title: 'All modules enabled',
                      description: 'All platform modules are already enabled for your organization.',
                      variant: 'default',
                    });
                    return;
                  }
                  setActiveTab('available');
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Request New Module
              </Button>
            </div>
            {myRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center space-y-4">
                  <p className="text-muted-foreground">No module requests yet</p>
                  <p className="text-sm text-muted-foreground">
                    {availableModules.length > 0
                      ? 'Click "Request New Module" above to request activation of additional modules.'
                      : 'All platform modules are enabled. Contact Platform Admin for custom module requests.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {pendingRequests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pending Requests</h3>
                    {pendingRequests.map((request) => {
                      const module = request.moduleId || {};
                      return (
                        <Card key={request._id}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              {module.moduleName}
                              <Badge variant="secondary">Pending</Badge>
                            </CardTitle>
                            <CardDescription>
                              Requested on {formatDateDDMMYYYY(request.requestedAt)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div>
                                <Label>Business Justification</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {request.businessJustification}
                                </p>
                              </div>
                              {request.expectedUsers && (
                                <div>
                                  <span className="text-muted-foreground">Expected Users: </span>
                                  <span className="font-medium">{request.expectedUsers}</span>
                                </div>
                              )}
                              {request.trialRequested && (
                                <div>
                                  <span className="text-muted-foreground">Trial Duration: </span>
                                  <span className="font-medium">{request.trialDurationDays} days</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {approvedRequests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Approved Requests</h3>
                    {approvedRequests.map((request) => {
                      const module = request.moduleId || {};
                      return (
                        <Card key={request._id}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              {module.moduleName}
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              Approved on {request.approvedAt ? formatDateDDMMYYYY(request.approvedAt) : 'N/A'}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {rejectedRequests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Rejected Requests</h3>
                    {rejectedRequests.map((request) => {
                      const module = request.moduleId || {};
                      return (
                        <Card key={request._id}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              {module.moduleName}
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejected
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              Rejected on {request.rejectedAt ? formatDateDDMMYYYY(request.rejectedAt) : 'N/A'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {request.rejectionReason && (
                              <div>
                                <Label>Rejection Reason</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {request.rejectionReason}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Module Request Dialog */}
        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request Module Activation: {selectedModule?.moduleName}</DialogTitle>
              <DialogDescription>
                Submit a request to activate this module for your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Request Type</Label>
                <Select
                  value={requestData.requestType}
                  onValueChange={(value) => setRequestData({ ...requestData, requestType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVATION">Full Activation</SelectItem>
                    <SelectItem value="TRIAL">Trial (30 days free)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Business Justification *</Label>
                <Textarea
                  value={requestData.businessJustification}
                  onChange={(e) =>
                    setRequestData({ ...requestData, businessJustification: e.target.value })
                  }
                  placeholder="Explain why this module is needed for your organization..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Expected Users (optional)</Label>
                <Input
                  type="number"
                  value={requestData.expectedUsers || ''}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      expectedUsers: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Number of users who will use this module"
                />
              </div>

              {requestData.requestType === 'TRIAL' && (
                <div>
                  <Label>Trial Duration (days)</Label>
                  <Input
                    type="number"
                    value={requestData.trialDurationDays}
                    onChange={(e) =>
                      setRequestData({
                        ...requestData,
                        trialDurationDays: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}

              {selectedModule && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Module Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>
                      <span className="text-muted-foreground">Category: </span>
                      <span className="font-medium">{selectedModule.moduleCategory}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pricing: </span>
                      <span className="font-medium">
                        {selectedModule.pricingModel === 'FLAT_FEE'
                          ? `₹${selectedModule.basePrice?.toLocaleString()}/month`
                          : selectedModule.pricingModel === 'PER_USER'
                            ? `₹${selectedModule.basePrice?.toLocaleString()}/user/month`
                            : 'Bundled'}
                      </span>
                    </div>
                    {selectedModule.dependsOnModules && selectedModule.dependsOnModules.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Dependencies: </span>
                        <span className="font-medium">{selectedModule.dependsOnModules.join(', ')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRequestModule} disabled={!requestData.businessJustification.trim()}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
