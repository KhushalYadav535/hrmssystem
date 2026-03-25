'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Building2, Shield, Bell, Lock, Users, FileText, Save, X, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/lib/api';
import Link from 'next/link';

interface TenantData {
  id?: string;
  name?: string;
  code?: string;
  location?: string;
  /** API may return _id */
  _id?: string;
  employees?: number;
  status?: string;
  /** Organization profile from tenant record (Add Tenant) */
  email?: string;
  phone?: string;
  address?: string;
  registered_office?: string;
  city?: string;
  state?: string;
  country?: string;
  pin?: string;
  website?: string;
  bank_id?: string;
  bank_code?: string;
  bank_name?: string;
  short_name?: string;
  registration_no?: string;
  rbi_license_no?: string;
  primaryAdminEmail?: string;
  primaryAdminName?: string;
  settings?: {
    organizationName?: string;
    email?: string;
    phone?: string;
    address?: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    leaveApprovals?: boolean;
    expenseApprovals?: boolean;
    payrollNotifications?: boolean;
    twoFactorAuth?: boolean;
    passwordPolicy?: {
      minLength?: number;
      requireUppercase?: boolean;
      requireLowercase?: boolean;
      requireNumbers?: boolean;
      requireSpecialChars?: boolean;
    };
  };
}

export default function SettingsPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    leaveApprovals: true,
    expenseApprovals: true,
    payrollNotifications: true,
    twoFactorAuth: false,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadTenantData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    redirect('/login');
  }

  // Only Tenant Admin can access settings
  if (currentUser?.role !== 'Tenant Admin' && !hasPermission('manage_settings')) {
    redirect('/dashboard');
  }

  const loadTenantData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCurrentTenant();
      if (response.success && response.data) {
        const tenant = response.data;
        setTenantData(tenant);
        
        // Populate form data from tenant
        const settings = tenant.settings || {};
        setFormData({
          emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications : true,
          smsNotifications: settings.smsNotifications !== undefined ? settings.smsNotifications : false,
          leaveApprovals: settings.leaveApprovals !== undefined ? settings.leaveApprovals : true,
          expenseApprovals: settings.expenseApprovals !== undefined ? settings.expenseApprovals : true,
          payrollNotifications: settings.payrollNotifications !== undefined ? settings.payrollNotifications : true,
          twoFactorAuth: settings.twoFactorAuth !== undefined ? settings.twoFactorAuth : false,
          passwordMinLength: settings.passwordPolicy?.minLength || 8,
          passwordRequireUppercase: settings.passwordPolicy?.requireUppercase !== undefined ? settings.passwordPolicy.requireUppercase : true,
          passwordRequireLowercase: settings.passwordPolicy?.requireLowercase !== undefined ? settings.passwordPolicy.requireLowercase : true,
          passwordRequireNumbers: settings.passwordPolicy?.requireNumbers !== undefined ? settings.passwordPolicy.requireNumbers : true,
          passwordRequireSpecialChars: settings.passwordPolicy?.requireSpecialChars !== undefined ? settings.passwordPolicy.requireSpecialChars : true,
        });
      }
    } catch (error: any) {
      toast.error('Failed to load tenant settings');
      console.error('Load tenant data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setIsSaving(true);
      const settings = {
        ...tenantData?.settings,
        emailNotifications: formData.emailNotifications,
        smsNotifications: formData.smsNotifications,
        leaveApprovals: formData.leaveApprovals,
        expenseApprovals: formData.expenseApprovals,
        payrollNotifications: formData.payrollNotifications,
      };

      const response = await apiService.updateTenantSettings(settings);
      if (response.success) {
        toast.success('Notification settings saved successfully');
        loadTenantData();
      } else {
        toast.error(response.message || 'Failed to save settings');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setIsSaving(true);
      const settings = {
        ...tenantData?.settings,
        twoFactorAuth: formData.twoFactorAuth,
        passwordPolicy: {
          minLength: formData.passwordMinLength,
          requireUppercase: formData.passwordRequireUppercase,
          requireLowercase: formData.passwordRequireLowercase,
          requireNumbers: formData.passwordRequireNumbers,
          requireSpecialChars: formData.passwordRequireSpecialChars,
        },
      };

      const response = await apiService.updateTenantSettings(settings);
      if (response.success) {
        toast.success('Security settings saved successfully');
        setIsEditDialogOpen(false);
        setEditingSection(null);
        loadTenantData();
      } else {
        toast.error(response.message || 'Failed to save settings');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPolicy = (policyType: string) => {
    setEditingSection(policyType);
    setIsEditDialogOpen(true);
  };

  const orgField = (value: string | undefined) => (value && String(value).trim() ? value : '—');

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your organization and system settings</p>
        </div>

        <Tabs defaultValue="organization" className="space-y-4">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="organization" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="access" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Access</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="policies" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Policies</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>
                  All details below come from the tenant record created in Platform Admin&apos;s <strong>Add Tenant</strong> flow.
                  They are read-only here; contact Platform Admin to change organization or bank registration data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Core</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4">
                    <div>
                      <Label>Organization / Tenant Name</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.name)}</p>
                    </div>
                    <div>
                      <Label>Tenant Code</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.code)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Registered location</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.location)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Contact &amp; address</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4">
                    <div>
                      <Label>Organization email</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.email)}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.phone)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Address</Label>
                      <p className="mt-2 text-sm font-medium whitespace-pre-wrap">{orgField(tenantData?.address)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Registered office</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.registered_office)}</p>
                    </div>
                    <div>
                      <Label>City</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.city)}</p>
                    </div>
                    <div>
                      <Label>State</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.state)}</p>
                    </div>
                    <div>
                      <Label>Country</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.country)}</p>
                    </div>
                    <div>
                      <Label>PIN</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.pin)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Website</Label>
                      <p className="mt-2 text-sm font-medium break-all">{orgField(tenantData?.website)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Bank / organization registration</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4">
                    <div>
                      <Label>Bank ID</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.bank_id)}</p>
                    </div>
                    <div>
                      <Label>Bank Code</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.bank_code)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Bank Name</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.bank_name)}</p>
                    </div>
                    <div>
                      <Label>Short Name</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.short_name)}</p>
                    </div>
                    <div>
                      <Label>Registration No</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.registration_no)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label>RBI License No</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.rbi_license_no)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Tenant Admin (created with tenant)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4">
                    <div>
                      <Label>Admin name</Label>
                      <p className="mt-2 text-sm font-medium">{orgField(tenantData?.primaryAdminName)}</p>
                    </div>
                    <div>
                      <Label>Admin email</Label>
                      <p className="mt-2 text-sm font-medium break-all">{orgField(tenantData?.primaryAdminEmail)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={formData.emailNotifications}
                    onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                  </div>
                  <Switch
                    checked={formData.smsNotifications}
                    onCheckedChange={(checked) => setFormData({ ...formData, smsNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Leave Approval Notifications</p>
                    <p className="text-sm text-muted-foreground">Notify on leave requests</p>
                  </div>
                  <Switch
                    checked={formData.leaveApprovals}
                    onCheckedChange={(checked) => setFormData({ ...formData, leaveApprovals: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Expense Approval Notifications</p>
                    <p className="text-sm text-muted-foreground">Notify on expense claims</p>
                  </div>
                  <Switch
                    checked={formData.expenseApprovals}
                    onCheckedChange={(checked) => setFormData({ ...formData, expenseApprovals: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Payroll Notifications</p>
                    <p className="text-sm text-muted-foreground">Notify on payroll processing</p>
                  </div>
                  <Switch
                    checked={formData.payrollNotifications}
                    onCheckedChange={(checked) => setFormData({ ...formData, payrollNotifications: checked })}
                  />
                </div>
                <Button onClick={handleSaveNotifications} disabled={isSaving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>Manage roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage role-based access control from the Administration section.
                  </p>
                  <Link href="/admin">
                    <Button variant="outline" className="gap-2">
                      <Shield className="w-4 h-4" />
                      Go to Access Control
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage system users and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage users from the Administration section.
                  </p>
                  <Link href="/admin/users">
                    <Button className="gap-2">
                      <Users className="w-4 h-4" />
                      Go to User Management
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle>Organization Policies</CardTitle>
                <CardDescription>Configure HR policies and workflows</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">Leave Policy</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure leave types, days, and carry forward rules
                      </p>
                    </div>
                    <Link href="/admin">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Policy
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">Travel Policy</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure travel approval workflows and limits
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleEditPolicy('travel')}>
                      <Edit className="w-4 h-4" />
                      Edit Policy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage security and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground mt-1">Add extra security to your account</p>
                    </div>
                    <Switch
                      checked={formData.twoFactorAuth}
                      onCheckedChange={(checked) => setFormData({ ...formData, twoFactorAuth: checked })}
                    />
                  </div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium">Password Policy</p>
                      <p className="text-sm text-muted-foreground mt-1">Require strong passwords for all users</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setEditingSection('password');
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      Configure
                    </Button>
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    <p>Minimum Length: {formData.passwordMinLength} characters</p>
                    <p>Requirements: {[
                      formData.passwordRequireUppercase && 'Uppercase',
                      formData.passwordRequireLowercase && 'Lowercase',
                      formData.passwordRequireNumbers && 'Numbers',
                      formData.passwordRequireSpecialChars && 'Special Characters',
                    ].filter(Boolean).join(', ')}</p>
                  </div>
                </div>
                <Button onClick={handleSaveSecurity} disabled={isSaving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Security Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Password Policy Dialog */}
        <Dialog open={isEditDialogOpen && editingSection === 'password'} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Configure Password Policy</DialogTitle>
              <DialogDescription>Set password requirements for all users</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Minimum Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  min="6"
                  max="20"
                  value={formData.passwordMinLength}
                  onChange={(e) => setFormData({ ...formData, passwordMinLength: parseInt(e.target.value) || 8 })}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireUppercase"
                    checked={formData.passwordRequireUppercase}
                    onCheckedChange={(checked) => setFormData({ ...formData, passwordRequireUppercase: checked })}
                  />
                  <Label htmlFor="requireUppercase" className="cursor-pointer">Require Uppercase Letters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireLowercase"
                    checked={formData.passwordRequireLowercase}
                    onCheckedChange={(checked) => setFormData({ ...formData, passwordRequireLowercase: checked })}
                  />
                  <Label htmlFor="requireLowercase" className="cursor-pointer">Require Lowercase Letters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireNumbers"
                    checked={formData.passwordRequireNumbers}
                    onCheckedChange={(checked) => setFormData({ ...formData, passwordRequireNumbers: checked })}
                  />
                  <Label htmlFor="requireNumbers" className="cursor-pointer">Require Numbers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireSpecialChars"
                    checked={formData.passwordRequireSpecialChars}
                    onCheckedChange={(checked) => setFormData({ ...formData, passwordRequireSpecialChars: checked })}
                  />
                  <Label htmlFor="requireSpecialChars" className="cursor-pointer">Require Special Characters</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setEditingSection(null);
              }} className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button onClick={handleSaveSecurity} disabled={isSaving} className="gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
