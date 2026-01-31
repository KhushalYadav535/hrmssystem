'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Building2, Shield, Bell, Lock, Users, FileText } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    organizationName: 'Indian Bank',
    email: 'admin@indianbank.com',
    phone: '+91 98765 43210',
    address: 'Mumbai, India',
    emailNotifications: true,
    smsNotifications: false,
    leaveApprovals: true,
    expenseApprovals: true,
    payrollNotifications: true,
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
                <CardDescription>Update your organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Organization Name</Label>
                    <Input value={settings.organizationName} className="mt-2" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={settings.email} className="mt-2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input value={settings.phone} className="mt-2" />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input value={settings.address} className="mt-2" />
                  </div>
                </div>
                <Button className="bg-primary">Save Changes</Button>
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
                  <Switch checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                  </div>
                  <Switch checked={settings.smsNotifications} onChange={() => handleToggle('smsNotifications')} />
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Leave Approval Notifications</p>
                    <p className="text-sm text-muted-foreground">Notify on leave requests</p>
                  </div>
                  <Switch checked={settings.leaveApprovals} onChange={() => handleToggle('leaveApprovals')} />
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Expense Approval Notifications</p>
                    <p className="text-sm text-muted-foreground">Notify on expense claims</p>
                  </div>
                  <Switch checked={settings.expenseApprovals} onChange={() => handleToggle('expenseApprovals')} />
                </div>
                <Button className="bg-primary">Save Preferences</Button>
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
                  <div className="p-4 border border-border rounded-lg">
                    <p className="font-medium">Employee Role</p>
                    <p className="text-sm text-muted-foreground mt-1">Can view own records and apply for leaves</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <p className="font-medium">Manager Role</p>
                    <p className="text-sm text-muted-foreground mt-1">Can manage team and approve requests</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <p className="font-medium">HR Administrator Role</p>
                    <p className="text-sm text-muted-foreground mt-1">Full system access and configuration</p>
                  </div>
                  <Button variant="outline">Edit Permissions</Button>
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-border rounded">
                    <div>
                      <p className="font-medium">admin.hr@indianbank.com</p>
                      <p className="text-sm text-muted-foreground">HR Administrator</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded">
                    <div>
                      <p className="font-medium">priya.sharma@indianbank.com</p>
                      <p className="text-sm text-muted-foreground">Manager</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <Button className="w-full mt-4">Add New User</Button>
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
                  <p className="font-medium">Leave Policy</p>
                  <p className="text-sm text-muted-foreground mt-1">20 days annual leave, 5 days sick leave</p>
                  <Button variant="outline" size="sm" className="mt-3 bg-transparent">Edit Policy</Button>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="font-medium">Travel Policy</p>
                  <p className="text-sm text-muted-foreground mt-1">Approval required for international travel</p>
                  <Button variant="outline" size="sm" className="mt-3 bg-transparent">Edit Policy</Button>
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
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground mt-1">Add extra security to your account</p>
                  <Button variant="outline" size="sm" className="mt-3 bg-transparent">Enable 2FA</Button>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="font-medium">Password Policy</p>
                  <p className="text-sm text-muted-foreground mt-1">Require strong passwords for all users</p>
                  <Button variant="outline" size="sm" className="mt-3 bg-transparent">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
