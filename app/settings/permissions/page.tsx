'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Save, Copy, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type ActionKey = 'view' | 'create' | 'edit' | 'delete' | 'approve';
type CellMatrix = Record<string, Record<string, Record<ActionKey, boolean>>>;

function buildInitialMatrix(
  moduleNames: string[],
  roleIds: string[],
  actions: ActionKey[]
): CellMatrix {
  const m: CellMatrix = {};
  moduleNames.forEach((mod) => {
    m[mod] = {};
    roleIds.forEach((rid) => {
      m[mod][rid] = {} as Record<ActionKey, boolean>;
      actions.forEach((a) => {
        m[mod][rid][a] = false;
      });
    });
  });
  return m;
}

export default function PermissionMatrixPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [cloneSourceRole, setCloneSourceRole] = useState('');
  const [cloneTargetName, setCloneTargetName] = useState('');

  if (!isAuthenticated || !hasPermission('manage_settings')) {
    redirect('/dashboard');
  }

  const roles = [
    { id: 'hr_admin', name: 'HR Administrator', color: 'bg-red-600' },
    { id: 'manager', name: 'Manager', color: 'bg-blue-600' },
    { id: 'hr_officer', name: 'HR Officer', color: 'bg-green-600' },
    { id: 'employee', name: 'Employee', color: 'bg-gray-600' },
  ];

  const modules = [
    'Dashboard',
    'Employee Management',
    'Leave Management',
    'Payroll',
    'Attendance',
    'Performance',
    'Reports',
    'Settings',
    'Approvals',
    'User Access',
  ];

  const actions: { key: ActionKey; label: string }[] = [
    { key: 'view', label: 'View' },
    { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete' },
    { key: 'approve', label: 'Approve' },
  ];

  const [permissions, setPermissions] = useState<CellMatrix>(() => {
    const base = buildInitialMatrix(modules, roles.map((r) => r.id), actions.map((a) => a.key));
    base['Dashboard']['hr_admin'].view = true;
    base['Dashboard']['hr_admin'].create = true;
    base['Dashboard']['hr_admin'].edit = true;
    base['Dashboard']['hr_admin'].delete = true;
    base['Dashboard']['hr_admin'].approve = true;
    base['Dashboard']['manager'].view = true;
    base['Dashboard']['manager'].create = true;
    base['Dashboard']['manager'].edit = true;
    base['Dashboard']['manager'].approve = true;
    base['Dashboard']['employee'].view = true;
    base['Dashboard']['hr_officer'].view = true;
    base['Dashboard']['hr_officer'].create = true;
    base['Dashboard']['hr_officer'].edit = true;
    return base;
  });

  const togglePermission = (moduleName: string, roleId: string, action: ActionKey) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [roleId]: {
          ...prev[moduleName][roleId],
          [action]: !prev[moduleName][roleId][action],
        },
      },
    }));
  };

  const handleCloneRole = () => {
    if (!cloneSourceRole || !cloneTargetName) {
      toast.error('Please select source role and enter target role name');
      return;
    }

    const newRoleId = cloneTargetName.toLowerCase().replace(/\s+/g, '_');
    const sourceRowTemplate = permissions['Dashboard']?.[cloneSourceRole];
    if (!sourceRowTemplate) {
      toast.error('Invalid source role');
      return;
    }
    setPermissions((prev) => {
      const next = { ...prev };
      modules.forEach((mod) => {
        next[mod] = { ...next[mod], [newRoleId]: { ...next[mod][cloneSourceRole] } };
      });
      return next;
    });

    toast.success(`Role "${cloneTargetName}" cloned successfully from "${roles.find(r => r.id === cloneSourceRole)?.name}"`);
    setShowCloneDialog(false);
    setCloneSourceRole('');
    setCloneTargetName('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Permission Matrix</h1>
            <p className="text-muted-foreground mt-2">Configure role-based access permissions</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Copy className="w-4 h-4" />
                  Clone Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clone Role Permissions</DialogTitle>
                  <DialogDescription>Create a new role by copying permissions from an existing role</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Source Role (Copy From)</Label>
                    <select
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card mt-1"
                      value={cloneSourceRole}
                      onChange={(e) => setCloneSourceRole(e.target.value)}
                    >
                      <option value="">Select role to clone...</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>New Role Name</Label>
                    <Input
                      value={cloneTargetName}
                      onChange={(e) => setCloneTargetName(e.target.value)}
                      placeholder="e.g., Senior Manager"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowCloneDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCloneRole} className="gap-2">
                      <Copy className="w-4 h-4" />
                      Clone Role
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${role.color}`} />
                  <CardTitle className="text-sm font-medium">{role.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {modules.reduce(
                    (sum, mod) =>
                      sum + actions.filter((a) => permissions[mod]?.[role.id]?.[a.key]).length,
                    0
                  )}
                  /{modules.length * actions.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">cells granted (all modules)</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Module Permissions</CardTitle>
            <CardDescription>Configure granular access control by role and module</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold">Module</th>
                    {roles.map((role) => (
                      <th key={role.id} className="text-center p-3 font-semibold">
                        <Badge variant="outline" className="text-xs">{role.name}</Badge>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((module) => (
                    <tr key={module} className="border-b border-border hover:bg-secondary/30">
                      <td className="p-3 font-medium">{module}</td>
                      {roles.map((role) => (
                        <td key={role.id} className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            {actions.map((action) => (
                              <button
                                key={action.key}
                                type="button"
                                className={`px-2 py-1 rounded text-xs font-medium transition ${
                                  permissions[module]?.[role.id]?.[action.key]
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-300 text-gray-600'
                                }`}
                                onClick={() => togglePermission(module, role.id, action.key)}
                                title={action.label}
                              >
                                {action.label[0]}
                              </button>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              {['V - View', 'C - Create', 'E - Edit', 'D - Delete', 'A - Approve'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
