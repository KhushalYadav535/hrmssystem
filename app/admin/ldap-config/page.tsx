'use client';

import { formatDateTimeFullDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, TestTube, RefreshCw, Plus, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/lib/api';

interface LDAPConfig {
  enabled: boolean;
  serverUrl: string;
  bindDN: string;
  baseDN: string;
  userSearchBase?: string;
  groupSearchBase?: string;
  sslEnabled: boolean;
  syncInterval: number;
  ssoEnabled: boolean;
  ssoProvider?: string;
  roleMappings: Array<{
    _id: string;
    ldapGroup: string;
    systemRole: string;
  }>;
  lastSyncDate?: string;
  lastSyncStatus?: string;
  lastSyncError?: string;
}

export default function LDAPConfigPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [config, setConfig] = useState<LDAPConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showRoleMappingDialog, setShowRoleMappingDialog] = useState(false);
  const [formData, setFormData] = useState({
    enabled: false,
    serverUrl: '',
    bindDN: '',
    bindPassword: '',
    baseDN: '',
    userSearchBase: '',
    groupSearchBase: '',
    sslEnabled: false,
    syncInterval: 24,
    ssoEnabled: false,
    ssoProvider: 'LDAP',
  });
  const [roleMappingForm, setRoleMappingForm] = useState({
    ldapGroup: '',
    systemRole: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadConfig();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !hasPermission('manage_users')) {
    redirect('/dashboard');
  }

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getLDAPConfig();
      if (response.success && response.data) {
        const configData = response.data;
        setConfig(configData);
        setFormData({
          enabled: configData.enabled || false,
          serverUrl: configData.serverUrl || '',
          bindDN: configData.bindDN || '',
          bindPassword: '', // Don't load password
          baseDN: configData.baseDN || '',
          userSearchBase: configData.userSearchBase || '',
          groupSearchBase: configData.groupSearchBase || '',
          sslEnabled: configData.sslEnabled || false,
          syncInterval: configData.syncInterval || 24,
          ssoEnabled: configData.ssoEnabled || false,
          ssoProvider: configData.ssoProvider || 'LDAP',
        });
      }
    } catch (error: any) {
      toast.error('Failed to load LDAP configuration');
      console.error('Load config error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await apiService.updateLDAPConfig(formData);
      if (response.success) {
        toast.success('LDAP configuration saved successfully');
        loadConfig();
      } else {
        toast.error(response.message || 'Failed to save configuration');
      }
    } catch (error: any) {
      toast.error('Failed to save configuration');
      console.error('Save config error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      const response = await apiService.testLDAPConnection();
      if (response.success) {
        toast.success('LDAP connection test successful!');
      } else {
        toast.error(response.message || 'LDAP connection test failed');
      }
    } catch (error: any) {
      toast.error('LDAP connection test failed');
      console.error('Test connection error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncUsers = async () => {
    if (!confirm('This will sync all users from LDAP. Continue?')) {
      return;
    }

    try {
      setIsSyncing(true);
      const response = await apiService.syncLDAPUsers();
      if (response.success) {
        toast.success(`Synced ${response.data?.syncedCount || 0} users successfully`);
        loadConfig();
      } else {
        toast.error(response.message || 'Failed to sync users');
      }
    } catch (error: any) {
      toast.error('Failed to sync users');
      console.error('Sync users error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddRoleMapping = async () => {
    if (!roleMappingForm.ldapGroup || !roleMappingForm.systemRole) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const response = await apiService.mapLDAPRole(roleMappingForm.ldapGroup, roleMappingForm.systemRole);
      if (response.success) {
        toast.success('Role mapping added successfully');
        setShowRoleMappingDialog(false);
        setRoleMappingForm({ ldapGroup: '', systemRole: '' });
        loadConfig();
      } else {
        toast.error(response.message || 'Failed to add role mapping');
      }
    } catch (error: any) {
      toast.error('Failed to add role mapping');
      console.error('Add role mapping error:', error);
    }
  };

  const handleDeleteRoleMapping = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role mapping?')) {
      return;
    }

    try {
      const response = await apiService.deleteLDAPRoleMapping(id);
      if (response.success) {
        toast.success('Role mapping deleted successfully');
        loadConfig();
      } else {
        toast.error(response.message || 'Failed to delete role mapping');
      }
    } catch (error: any) {
      toast.error('Failed to delete role mapping');
      console.error('Delete role mapping error:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">LDAP / Active Directory Configuration</h1>
          <p className="text-muted-foreground mt-2">Configure LDAP/AD integration for SSO and user synchronization</p>
        </div>

        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle>LDAP Configuration</CardTitle>
            <CardDescription>Configure connection to your LDAP/Active Directory server</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enabled">Enable LDAP Integration</Label>
                <p className="text-sm text-muted-foreground">Enable LDAP/AD authentication and user sync</p>
              </div>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
            </div>

            {formData.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serverUrl">Server URL <span className="text-red-500">*</span></Label>
                    <Input
                      id="serverUrl"
                      value={formData.serverUrl}
                      onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })}
                      placeholder="ldap://ldap.example.com or ldaps://ldap.example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bindDN">Bind DN <span className="text-red-500">*</span></Label>
                    <Input
                      id="bindDN"
                      value={formData.bindDN}
                      onChange={(e) => setFormData({ ...formData, bindDN: e.target.value })}
                      placeholder="cn=admin,dc=example,dc=com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bindPassword">Bind Password <span className="text-red-500">*</span></Label>
                    <Input
                      id="bindPassword"
                      type="password"
                      value={formData.bindPassword}
                      onChange={(e) => setFormData({ ...formData, bindPassword: e.target.value })}
                      placeholder="Enter bind password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baseDN">Base DN <span className="text-red-500">*</span></Label>
                    <Input
                      id="baseDN"
                      value={formData.baseDN}
                      onChange={(e) => setFormData({ ...formData, baseDN: e.target.value })}
                      placeholder="dc=example,dc=com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userSearchBase">User Search Base</Label>
                    <Input
                      id="userSearchBase"
                      value={formData.userSearchBase}
                      onChange={(e) => setFormData({ ...formData, userSearchBase: e.target.value })}
                      placeholder="ou=users,dc=example,dc=com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupSearchBase">Group Search Base</Label>
                    <Input
                      id="groupSearchBase"
                      value={formData.groupSearchBase}
                      onChange={(e) => setFormData({ ...formData, groupSearchBase: e.target.value })}
                      placeholder="ou=groups,dc=example,dc=com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="syncInterval">Sync Interval (hours)</Label>
                    <Input
                      id="syncInterval"
                      type="number"
                      value={formData.syncInterval}
                      onChange={(e) => setFormData({ ...formData, syncInterval: parseInt(e.target.value) || 24 })}
                      min={1}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sslEnabled">SSL/TLS Enabled</Label>
                      <p className="text-sm text-muted-foreground">Use secure LDAP connection</p>
                    </div>
                    <Switch
                      id="sslEnabled"
                      checked={formData.sslEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, sslEnabled: checked })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label htmlFor="ssoEnabled">Enable SSO</Label>
                    <p className="text-sm text-muted-foreground">Allow users to login via LDAP</p>
                  </div>
                  <Switch
                    id="ssoEnabled"
                    checked={formData.ssoEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, ssoEnabled: checked })}
                  />
                </div>

                {formData.ssoEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="ssoProvider">SSO Provider</Label>
                    <Select
                      value={formData.ssoProvider}
                      onValueChange={(value) => setFormData({ ...formData, ssoProvider: value })}
                    >
                      <SelectTrigger id="ssoProvider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LDAP">LDAP</SelectItem>
                        <SelectItem value="SAML">SAML (Coming Soon)</SelectItem>
                        <SelectItem value="OAuth">OAuth (Coming Soon)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                  {config?.enabled && (
                    <Button variant="outline" onClick={handleSyncUsers} disabled={isSyncing}>
                      {isSyncing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync Users
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {config?.lastSyncDate && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Last Sync</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTimeFullDDMMYYYY(config.lastSyncDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {config.lastSyncStatus === 'Success' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : config.lastSyncStatus === 'Failed' ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : null}
                        <Badge variant={config.lastSyncStatus === 'Success' ? 'default' : 'destructive'}>
                          {config.lastSyncStatus}
                        </Badge>
                      </div>
                    </div>
                    {config.lastSyncError && (
                      <p className="text-sm text-red-600 mt-2">{config.lastSyncError}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Role Mappings */}
        {formData.enabled && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Role Mappings</CardTitle>
                  <CardDescription>Map LDAP groups to system roles</CardDescription>
                </div>
                <Button onClick={() => setShowRoleMappingDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Mapping
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {config?.roleMappings && config.roleMappings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LDAP Group</TableHead>
                      <TableHead>System Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {config.roleMappings.map((mapping) => (
                      <TableRow key={mapping._id}>
                        <TableCell className="font-medium">{mapping.ldapGroup}</TableCell>
                        <TableCell>
                          <Badge>{mapping.systemRole}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRoleMapping(mapping._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No role mappings configured. Add a mapping to assign system roles based on LDAP groups.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Role Mapping Dialog */}
        <Dialog open={showRoleMappingDialog} onOpenChange={setShowRoleMappingDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Role Mapping</DialogTitle>
              <DialogDescription>Map an LDAP group to a system role</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ldapGroup">LDAP Group DN <span className="text-red-500">*</span></Label>
                <Input
                  id="ldapGroup"
                  value={roleMappingForm.ldapGroup}
                  onChange={(e) => setRoleMappingForm({ ...roleMappingForm, ldapGroup: e.target.value })}
                  placeholder="CN=HR Managers,OU=Groups,DC=example,DC=com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemRole">System Role <span className="text-red-500">*</span></Label>
                <Select
                  value={roleMappingForm.systemRole}
                  onValueChange={(value) => setRoleMappingForm({ ...roleMappingForm, systemRole: value })}
                >
                  <SelectTrigger id="systemRole">
                    <SelectValue placeholder="Select system role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Tenant Admin">Tenant Admin</SelectItem>
                    <SelectItem value="HR Administrator">HR Administrator</SelectItem>
                    <SelectItem value="Payroll Administrator">Payroll Administrator</SelectItem>
                    <SelectItem value="Finance Administrator">Finance Administrator</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Auditor">Auditor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRoleMappingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRoleMapping}>Add Mapping</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
