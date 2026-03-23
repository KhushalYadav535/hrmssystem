'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Users, Building2, Shield, AlertCircle, Plus, Database, Server, Package, Globe, Settings, CheckCircle2, XCircle, Clock, DollarSign, TrendingUp, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const systemHealthData = [
  { name: 'Mon', uptime: 99.9, performance: 95 },
  { name: 'Tue', uptime: 99.8, performance: 96 },
  { name: 'Wed', uptime: 99.9, performance: 94 },
  { name: 'Thu', uptime: 99.7, performance: 97 },
  { name: 'Fri', uptime: 99.9, performance: 95 },
  { name: 'Sat', uptime: 99.8, performance: 96 },
  { name: 'Sun', uptime: 99.9, performance: 95 },
];

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTenants, setPendingTenants] = useState<any[]>([]);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  // US-A3-02: Expiring Subscriptions
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<any[]>([]);
  // US-A3-03: Revenue Metrics
  const [revenueMetrics, setRevenueMetrics] = useState({
    mrr: 0,
    arr: 0,
    revenueThisMonth: 0,
    pendingInvoices: 0,
    pendingInvoiceValue: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const tenantsRes = await apiService.getTenants();
        if (tenantsRes.success && tenantsRes.data) {
          const list = Array.isArray(tenantsRes.data) ? tenantsRes.data : [];
          setTenants(list);
          const total = list.reduce((acc: number, t: any) => acc + (t.employeeCount || t.employees || 0), 0);
          setTotalUsers(total);
          
          // US-A2-02: Filter pending tenants for approval
          const pending = list.filter((t: any) => t.status === 'pending' || t.status === 'Pending');
          setPendingTenants(pending);
          
          // US-A3-02: Filter expiring subscriptions (within 30 days)
          const now = new Date();
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(now.getDate() + 30);
          const expiring = list.filter((t: any) => {
            if (!t.subscriptionExpiryDate || t.status !== 'active') return false;
            const expiry = new Date(t.subscriptionExpiryDate);
            return expiry >= now && expiry <= thirtyDaysFromNow;
          }).map((t: any) => {
            const expiry = new Date(t.subscriptionExpiryDate);
            const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return { ...t, daysRemaining };
          }).sort((a: any, b: any) => a.daysRemaining - b.daysRemaining);
          setExpiringSubscriptions(expiring);
          
          // US-A3-03: Calculate revenue metrics
          const activeTenants = list.filter((t: any) => t.status === 'active');
          // Load subscription packages to calculate MRR
          try {
            const packagesRes = await apiService.getSubscriptionPackages();
            const packages = packagesRes.success && packagesRes.data ? 
              (Array.isArray(packagesRes.data) ? packagesRes.data : []) : [];
            
            // BR-A3-06: MRR = SUM(plan monthly price × active tenants on that plan)
            let mrr = 0;
            activeTenants.forEach((tenant: any) => {
              if (tenant.subscriptionPlanId) {
                const pkg = packages.find((p: any) => 
                  (p._id || p.id) === (tenant.subscriptionPlanId._id || tenant.subscriptionPlanId || tenant.subscriptionPlanId)
                );
                if (pkg && pkg.monthlyPrice) {
                  mrr += pkg.monthlyPrice;
                }
              }
            });
            
            // BR-A3-07: ARR = MRR × 12
            const arr = mrr * 12;
            
            // BR-A3-08: Revenue This Month (simplified - using MRR as approximation)
            const revenueThisMonth = mrr;
            
            setRevenueMetrics({
              mrr,
              arr,
              revenueThisMonth,
              pendingInvoices: 0, // TODO: Implement invoice tracking
              pendingInvoiceValue: 0, // TODO: Implement invoice tracking
            });
          } catch (error) {
            console.error('Failed to load revenue metrics:', error);
          }
        }
      } catch {
        setTenants([]);
        setTotalUsers(0);
        setPendingTenants([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    // Refresh every 30 seconds to check for new pending registrations
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // US-A2-02: Approve Tenant
  const handleApproveTenant = async (tenantId: string) => {
    try {
      const response = await apiService.approveTenant(tenantId);
      if (response.success) {
        toast.success('Tenant approved successfully');
        setShowApprovalDialog(false);
        setSelectedTenant(null);
        // Reload data
        const tenantsRes = await apiService.getTenants();
        if (tenantsRes.success && tenantsRes.data) {
          const list = Array.isArray(tenantsRes.data) ? tenantsRes.data : [];
          setTenants(list);
          const pending = list.filter((t: any) => t.status === 'pending' || t.status === 'Pending');
          setPendingTenants(pending);
        }
      } else {
        toast.error(response.message || 'Failed to approve tenant');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve tenant');
    }
  };
  
  // US-A2-02: Reject Tenant
  const handleRejectTenant = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 20) {
      toast.error('Rejection reason must be at least 20 characters');
      return;
    }
    
    try {
      const response = await apiService.rejectTenant(selectedTenant.id, rejectionReason.trim());
      if (response.success) {
        toast.success('Tenant rejected successfully');
        setShowApprovalDialog(false);
        setSelectedTenant(null);
        setRejectionReason('');
        // Reload data
        const tenantsRes = await apiService.getTenants();
        if (tenantsRes.success && tenantsRes.data) {
          const list = Array.isArray(tenantsRes.data) ? tenantsRes.data : [];
          setTenants(list);
          const pending = list.filter((t: any) => t.status === 'pending' || t.status === 'Pending');
          setPendingTenants(pending);
        }
      } else {
        toast.error(response.message || 'Failed to reject tenant');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject tenant');
    }
  };

  // BR-A3-01: Active Tenants = COUNT where status = 'Active' (case-insensitive check)
  const activeTenants = tenants.filter((t: any) => 
    (t.status?.toLowerCase() === 'active' || t.status === 'Active')
  ).length;

  return (
    <div className="space-y-6">
      {/* Header - BRD: Platform Admin manages tenants, modules, subscriptions - NOT operational HR */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage companies, modules, subscriptions and platform configuration</p>
      </div>

      {/* Key Metrics - Clickable cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/tenants?status=active">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Tenants</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? '--' : activeTenants}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isLoading ? 'Loading...' : 'All systems operational'}
                  </p>
                </div>
                <Building2 className="w-10 h-10 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/tenants">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? '--' : totalUsers.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isLoading ? 'Loading...' : 'Across all tenants'}
                  </p>
                </div>
                <Users className="w-10 h-10 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/integrations/health">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Uptime</p>
                  <p className="text-2xl font-bold text-foreground">99.9%</p>
                  <p className="text-xs text-green-600 mt-1">Last 7 days</p>
                </div>
                <Server className="w-10 h-10 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Database Size</p>
                  <p className="text-2xl font-bold text-foreground">2.4 GB</p>
                  <p className="text-xs text-muted-foreground mt-1">Optimized</p>
                </div>
                <Database className="w-10 h-10 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* US-A2-02: Pending Registrations Alert */}
      {pendingTenants.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-orange-900 dark:text-orange-100">
                  Pending Tenant Registrations
                </CardTitle>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                  {pendingTenants.length}
                </Badge>
              </div>
            </div>
            <CardDescription>Review and approve new tenant registration requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTenants.slice(0, 3).map((tenant: any) => (
                <div key={tenant.id} className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-800">
                  <div>
                    <p className="font-medium">{tenant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {tenant.code} • {tenant.location} • {tenant.registrationEmail || tenant.adminEmail}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Registered: {new Date(tenant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTenant(tenant);
                        setShowApprovalDialog(true);
                      }}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
              {pendingTenants.length > 3 && (
                <Link href="/admin/tenants?status=pending">
                  <Button variant="outline" className="w-full">
                    View All {pendingTenants.length} Pending Registrations
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* US-A3-02: Expiring Subscriptions Alert */}
      {expiringSubscriptions.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Expiring Subscriptions
              </CardTitle>
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                {expiringSubscriptions.length}
              </Badge>
            </div>
            <CardDescription>Subscriptions expiring within 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringSubscriptions.slice(0, 5).map((sub: any) => {
                const isUrgent = sub.daysRemaining <= 7;
                return (
                  <div
                    key={sub._id || sub.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      isUrgent ? 'bg-red-50 dark:bg-red-950/20 border-red-200' : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sub.code} • Expires: {new Date(sub.subscriptionExpiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={isUrgent ? 'destructive' : 'outline'}>
                        {sub.daysRemaining} {sub.daysRemaining === 1 ? 'day' : 'days'} remaining
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                );
              })}
              {expiringSubscriptions.length > 5 && (
                <Link href="/admin/tenants?filter=expiring">
                  <Button variant="outline" className="w-full">
                    View All {expiringSubscriptions.length} Expiring Subscriptions
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* US-A3-03: Revenue / Billing Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Revenue & Billing Overview
          </CardTitle>
          <CardDescription>Monthly recurring revenue and billing metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">MRR</p>
              <p className="text-2xl font-bold">
                ₹{revenueMetrics.mrr.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Monthly Recurring Revenue</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">ARR</p>
              <p className="text-2xl font-bold">
                ₹{revenueMetrics.arr.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Annual Recurring Revenue</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Revenue This Month</p>
              <p className="text-2xl font-bold">
                ₹{revenueMetrics.revenueThisMonth.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Current month revenue</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Pending Invoices</p>
              <p className="text-2xl font-bold">
                {revenueMetrics.pendingInvoices}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ₹{revenueMetrics.pendingInvoiceValue.toLocaleString('en-IN')} value
              </p>
            </div>
          </div>
          {/* TODO: Add 6-month MRR sparkline chart */}
        </CardContent>
      </Card>

      {/* Tenant Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow h-full" onClick={() => router.push('/admin/tenants')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && router.push('/admin/tenants')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tenant Management</CardTitle>
                <CardDescription>Manage all organization tenants</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href="/admin/tenants">
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Tenants
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading tenants...</p>
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tenants found</p>
                <p className="text-xs text-muted-foreground mt-2">
                  <Link href="/admin/tenants" className="text-primary hover:underline">Add tenants</Link> via Tenant Management
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tenants.map((tenant: any) => (
                  <div key={tenant._id || tenant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-muted-foreground">{tenant.code} {tenant.location ? `• ${tenant.location}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                        {tenant.status || 'active'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{tenant.employeeCount || tenant.employees || 0} employees</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow h-full" onClick={() => router.push('/admin/integrations/health')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && router.push('/admin/integrations/health')}>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Performance and uptime monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={systemHealthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="uptime" stroke="hsl(var(--chart-1))" name="Uptime %" />
                <Line type="monotone" dataKey="performance" stroke="hsl(var(--chart-2))" name="Performance %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - BRD: Platform Admin manages Tenants, Modules, Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Platform administration – tenants, modules, subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/admin/tenants">
                <Building2 className="w-5 h-5 mb-2" />
                <span className="font-medium">Tenant Management</span>
                <span className="text-xs text-muted-foreground">Add companies, assign packages</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/admin/modules">
                <Package className="w-5 h-5 mb-2" />
                <span className="font-medium">Companies & Modules</span>
                <span className="text-xs text-muted-foreground">Enable/disable modules per company</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/admin/subscription-packages">
                <Package className="w-5 h-5 mb-2" />
                <span className="font-medium">Subscription Packages</span>
                <span className="text-xs text-muted-foreground">Basic, Standard, Premium, Enterprise</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/admin/integrations">
                <Globe className="w-5 h-5 mb-2" />
                <span className="font-medium">Integrations</span>
                <span className="text-xs text-muted-foreground">Biometric, WhatsApp, Email, CBS</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/admin/platform-settings">
                <Settings className="w-5 h-5 mb-2" />
                <span className="font-medium">Platform Settings</span>
                <span className="text-xs text-muted-foreground">Billing, white-label config</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/admin/audit-log">
                <Shield className="w-5 h-5 mb-2" />
                <span className="font-medium">Audit Logs</span>
                <span className="text-xs text-muted-foreground">View system activity logs</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent system notifications</CardDescription>
            </div>
            <Badge variant="outline">All Clear</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <AlertCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">All systems operational</p>
                <p className="text-xs text-muted-foreground">No critical issues detected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Database className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Database backup completed</p>
                <p className="text-xs text-muted-foreground">Last backup: 2 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* US-A2-02: Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Tenant Registration</DialogTitle>
            <DialogDescription>
              Review the tenant registration details and approve or reject
            </DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tenant Name</Label>
                  <p className="font-medium">{selectedTenant.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tenant Code</Label>
                  <p className="font-medium">{selectedTenant.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">{selectedTenant.location}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Admin Email</Label>
                  <p className="font-medium">{selectedTenant.registrationEmail || selectedTenant.adminEmail}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email Verified</Label>
                  <p className="font-medium">
                    {selectedTenant.emailVerified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-orange-600">Pending</span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Registration Date</Label>
                  <p className="font-medium">
                    {new Date(selectedTenant.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleApproveTenant(selectedTenant.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    if (rejectionReason.trim().length >= 20) {
                      handleRejectTenant();
                    } else {
                      toast.error('Please provide a rejection reason (min 20 characters)');
                    }
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason (Required for rejection, min 20 characters)</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {rejectionReason.length}/20 characters (minimum)
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
