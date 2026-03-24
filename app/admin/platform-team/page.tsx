'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Shield, Users, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

/**
 * US-A7-01: Role-Based Access Control for Platform Admin Team
 * Define sub-admin roles with specific permission scopes
 */
export default function PlatformTeamPage() {
  const { currentUser } = useAuth();
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    permissions: {} as Record<string, boolean>,
  });

  // Predefined roles with permission scopes
  const PREDEFINED_ROLES = {
    'Super Admin': {
      description: 'Full platform access - all permissions',
      permissions: {
        tenant_management: true,
        module_management: true,
        subscription_management: true,
        platform_settings: true,
        integrations: true,
        analytics: true,
        audit_logs: true,
        billing: true,
        compliance: true,
      },
    },
    'Billing Admin': {
      description: 'Manage subscriptions, billing, and revenue',
      permissions: {
        subscription_management: true,
        billing: true,
        analytics: true,
        tenant_management: false,
        module_management: false,
        platform_settings: false,
        integrations: false,
        audit_logs: false,
        compliance: false,
      },
    },
    'Tenant Manager': {
      description: 'Manage tenants, approvals, and tenant settings',
      permissions: {
        tenant_management: true,
        module_management: true,
        audit_logs: true,
        analytics: true,
        subscription_management: false,
        platform_settings: false,
        integrations: false,
        billing: false,
        compliance: false,
      },
    },
    'Read-Only Auditor': {
      description: 'View-only access to audit logs and analytics',
      permissions: {
        audit_logs: true,
        analytics: true,
        tenant_management: false,
        module_management: false,
        subscription_management: false,
        platform_settings: false,
        integrations: false,
        billing: false,
        compliance: false,
      },
    },
  };

  const PERMISSION_GROUPS = [
    {
      group: 'Tenant Management',
      key: 'tenant_management',
      description: 'Create, edit, suspend, and manage tenants',
    },
    {
      group: 'Module Management',
      key: 'module_management',
      description: 'Enable/disable modules for tenants',
    },
    {
      group: 'Subscription Management',
      key: 'subscription_management',
      description: 'Manage subscription packages and assignments',
    },
    {
      group: 'Platform Settings',
      key: 'platform_settings',
      description: 'Configure platform-wide settings',
    },
    {
      group: 'Integrations',
      key: 'integrations',
      description: 'Configure and manage integrations',
    },
    {
      group: 'Analytics',
      key: 'analytics',
      description: 'View analytics and usage reports',
    },
    {
      group: 'Audit Logs',
      key: 'audit_logs',
      description: 'View audit logs and activity',
    },
    {
      group: 'Billing',
      key: 'billing',
      description: 'Manage billing and revenue',
    },
    {
      group: 'Compliance',
      key: 'compliance',
      description: 'Configure compliance settings',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load platform admin users and roles
      // TODO: Implement API endpoints for platform team management
      setRoles(Object.entries(PREDEFINED_ROLES).map(([name, data]) => ({
        name,
        ...data,
      })));
    } catch (error: any) {
      toast.error('Failed to load platform team data');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({
      name: '',
      description: '',
      permissions: {},
    });
    setEditingRole(null);
    setDialogOpen(true);
  };

  const openEdit = (role: any) => {
    setEditingRole(role);
    setForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions || {},
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    // BR-A7-01: Only Super Admin can create or modify roles
    if (currentUser?.role !== 'Super Admin') {
      toast.error('Only Super Admin can manage roles');
      return;
    }

    try {
      // TODO: Implement API endpoint for role creation/update
      toast.success(`Role ${editingRole ? 'updated' : 'created'} successfully`);
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save role');
    }
  };

  const getPermissionCount = (role: any) => {
    return Object.values(role.permissions || {}).filter(Boolean).length;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Platform Team</h1>
            <p className="text-muted-foreground mt-2">
              Manage platform admin roles and permissions
            </p>
          </div>
          {currentUser?.role === 'Super Admin' && (
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          )}
        </div>

        {/* Roles List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.name}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {role.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {role.description}
                    </CardDescription>
                  </div>
                  {role.name === 'Super Admin' && (
                    <Badge variant="default">System</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(role.permissions || {})
                        .filter(([_, enabled]) => enabled)
                        .slice(0, 3)
                        .map(([key]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key.replace('_', ' ')}
                          </Badge>
                        ))}
                      {getPermissionCount(role) > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{getPermissionCount(role) - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  {currentUser?.role === 'Super Admin' &&
                    !['Super Admin', 'Platform Admin'].includes(role.name) && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(role)}
                        className="flex-1"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Permission Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>
              View which roles have access to which features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Permission</th>
                    {roles.map((role) => (
                      <th key={role.name} className="text-center p-2">
                        {role.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_GROUPS.map((group) => (
                    <tr key={group.key} className="border-b">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{group.group}</p>
                          <p className="text-xs text-muted-foreground">{group.description}</p>
                        </div>
                      </td>
                      {roles.map((role) => (
                        <td key={role.name} className="text-center p-2">
                          {role.permissions?.[group.key] ? (
                            <Badge variant="default" className="bg-green-100 text-green-700">
                              ✓
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50">
                              —
                            </Badge>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Role Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
              <DialogDescription>
                Define role permissions for platform administration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Role Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Billing Admin"
                  disabled={!!editingRole}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the role's responsibilities"
                />
              </div>
              <div>
                <Label className="text-base font-semibold mb-3 block">Permissions</Label>
                <div className="space-y-2">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="font-medium">{group.group}</Label>
                        <p className="text-xs text-muted-foreground">{group.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.permissions[group.key] || false}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            permissions: { ...form.permissions, [group.key]: e.target.checked },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
