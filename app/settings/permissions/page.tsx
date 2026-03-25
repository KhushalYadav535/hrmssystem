'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { Save, Copy } from 'lucide-react';
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

function mergeStoredPermissions(
  stored: unknown,
  modules: string[],
  roleIds: string[],
  actionKeys: ActionKey[],
  fallback: CellMatrix
): CellMatrix {
  if (!stored || typeof stored !== 'object') return fallback;
  const s = stored as CellMatrix;
  const next = buildInitialMatrix(modules, roleIds, actionKeys);
  for (const mod of modules) {
    if (!s[mod]) continue;
    for (const rid of roleIds) {
      if (!s[mod][rid]) continue;
      for (const ak of actionKeys) {
        const v = s[mod][rid][ak];
        if (typeof v === 'boolean') next[mod][rid][ak] = v;
      }
    }
  }
  return next;
}

const PERMISSION_ROLES = [
  { id: 'hr_admin', name: 'HR Administrator', color: 'bg-red-600' },
  { id: 'manager', name: 'Manager', color: 'bg-blue-600' },
  { id: 'hr_officer', name: 'HR Officer', color: 'bg-green-600' },
  { id: 'employee', name: 'Employee', color: 'bg-gray-600' },
] as const;

const PERMISSION_MODULES = [
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
] as const;

const PERMISSION_ACTIONS: { key: ActionKey; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'approve', label: 'Approve' },
];

function makeDefaultPermissionMatrix(): CellMatrix {
  const modules = [...PERMISSION_MODULES];
  const roleIds = PERMISSION_ROLES.map((r) => r.id);
  const actionKeys = PERMISSION_ACTIONS.map((a) => a.key);
  const base = buildInitialMatrix(modules, roleIds, actionKeys);
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
}

export default function PermissionMatrixPage() {
  const { isAuthenticated, hasPermission, currentUser, currentTenant } = useAuth();
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [cloneSourceRole, setCloneSourceRole] = useState('');
  const [cloneTargetName, setCloneTargetName] = useState('');
  const permissionStorageKey = currentTenant?.id
    ? `hrms-module-permissions:${currentTenant.id}`
    : null;
  const [permissions, setPermissions] = useState<CellMatrix>(makeDefaultPermissionMatrix);

  useEffect(() => {
    if (!permissionStorageKey || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(permissionStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setPermissions(
        mergeStoredPermissions(
          parsed,
          [...PERMISSION_MODULES],
          PERMISSION_ROLES.map((r) => r.id),
          PERMISSION_ACTIONS.map((a) => a.key),
          makeDefaultPermissionMatrix()
        )
      );
    } catch {
      /* ignore corrupt storage */
    }
  }, [permissionStorageKey]);

  const roles = PERMISSION_ROLES;
  const modules = PERMISSION_MODULES;
  const actions = PERMISSION_ACTIONS;

  if (
    !isAuthenticated ||
    (currentUser?.role !== 'Tenant Admin' && !hasPermission('manage_settings'))
  ) {
    redirect('/dashboard');
  }

  const setPermission = (moduleName: string, roleId: string, action: ActionKey, granted: boolean) => {
    setPermissions((prev) => {
      const mod = prev[moduleName] ?? {};
      const roleRow = mod[roleId] ?? Object.fromEntries(actions.map((a) => [a.key, false])) as Record<ActionKey, boolean>;
      if (!!roleRow[action] === granted) return prev;
      return {
        ...prev,
        [moduleName]: {
          ...mod,
          [roleId]: {
            ...roleRow,
            [action]: granted,
          },
        },
      };
    });
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
            <Button
              className="gap-2"
              type="button"
              onClick={() => {
                if (!permissionStorageKey) {
                  toast.error('Tenant context not ready. Refresh the page and try again.');
                  return;
                }
                try {
                  localStorage.setItem(permissionStorageKey, JSON.stringify(permissions));
                  toast.success('Module permissions saved for this tenant');
                } catch (e: any) {
                  toast.error(e?.message || 'Could not save permissions');
                }
              }}
            >
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
                <p className="text-xs text-muted-foreground mt-1">checks granted (all module × action cells for this role)</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Module Permissions</CardTitle>
            <CardDescription>
              One row per <strong>module</strong> and <strong>role</strong>. Each checkbox only changes that module + role + action — not an entire column.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold min-w-[10rem]">Module</th>
                    <th className="text-left p-3 font-semibold min-w-[8rem]">Role</th>
                    {actions.map((action) => (
                      <th key={action.key} className="text-center p-3 font-semibold whitespace-nowrap">
                        {action.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.flatMap((module) =>
                    roles.map((role, roleIdx) => (
                      <tr
                        key={`${module}-${role.id}`}
                        className="border-b border-border hover:bg-secondary/30"
                      >
                        {roleIdx === 0 ? (
                          <td
                            rowSpan={roles.length}
                            className="p-3 font-medium align-top bg-muted/20 border-r border-border"
                          >
                            {module}
                          </td>
                        ) : null}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${role.color}`} />
                            <span className="font-medium text-foreground">{role.name}</span>
                          </div>
                        </td>
                        {actions.map((action) => {
                          const checked = !!permissions[module]?.[role.id]?.[action.key];
                          return (
                            <td key={action.key} className="p-2 text-center">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(v) =>
                                    setPermission(module, role.id, action.key, v === true)
                                  }
                                  aria-label={`${module}, ${role.name}, ${action.label}`}
                                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white"
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
            <CardDescription>Checked = permission granted for that row only</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
              {actions.map((a) => (
                <div key={a.key} className="flex items-center gap-2">
                  <span className="inline-block size-4 rounded border border-green-600 bg-green-600 shrink-0" aria-hidden />
                  <span>{a.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
