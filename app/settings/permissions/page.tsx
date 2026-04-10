'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect, useMemo } from 'react';
import { Save, Copy, Info } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

type ActionKey = 'view' | 'create' | 'edit' | 'delete' | 'approve';
type CellMatrix = Record<string, Record<string, Record<ActionKey, boolean>>>;

export type ModuleRoleDef = { id: string; name: string; color: string };

const SYSTEM_MODULE_ROLES: ModuleRoleDef[] = [
  { id: 'Super Admin', name: 'Super Admin', color: 'bg-red-600' },
  { id: 'Tenant Admin', name: 'Tenant Admin', color: 'bg-purple-600' },
  { id: 'HR Administrator', name: 'HR Administrator', color: 'bg-blue-600' },
  { id: 'Payroll Administrator', name: 'Payroll Administrator', color: 'bg-emerald-600' },
  { id: 'Finance Administrator', name: 'Finance Administrator', color: 'bg-amber-600' },
  { id: 'Manager', name: 'Manager', color: 'bg-indigo-600' },
  { id: 'Employee', name: 'Employee', color: 'bg-gray-600' },
  { id: 'Auditor', name: 'Auditor', color: 'bg-slate-600' },
];

/** Tenant Module Permissions: Super Admin is not shown or edited here (platform scope only). */
const TENANT_MODULE_MATRIX_ROLES: ModuleRoleDef[] = SYSTEM_MODULE_ROLES.filter((r) => r.id !== 'Super Admin');

const LEGACY_ROLE_MAP: Record<string, string> = {
  hr_admin: 'HR Administrator',
  manager: 'Manager',
  hr_officer: 'Employee',
  employee: 'Employee',
};

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

const STORAGE_V1 = (tenantId: string) => `hrms-module-permissions:${tenantId}`;
const STORAGE_V2 = (tenantId: string) => `hrms-module-permissions-v2:${tenantId}`;

function buildInitialMatrix(moduleNames: string[], roleIds: string[], actions: ActionKey[]): CellMatrix {
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

function applyTemplateDefaults(base: CellMatrix): CellMatrix {
  const TA = 'Tenant Admin';
  const HR = 'HR Administrator';
  const M = 'Manager';
  const E = 'Employee';
  const PA = 'Payroll Administrator';
  const FA = 'Finance Administrator';
  const AU = 'Auditor';

  for (const mod of PERMISSION_MODULES) {
    if (base[mod]?.[TA]) {
      for (const a of PERMISSION_ACTIONS) base[mod][TA][a.key] = true;
    }
  }

  if (base['Dashboard']?.[HR]) {
    base['Dashboard'][HR] = { view: true, create: true, edit: true, delete: true, approve: true };
  }
  if (base['Dashboard']?.[M]) {
    base['Dashboard'][M] = { view: true, create: true, edit: true, delete: false, approve: true };
  }
  if (base['Dashboard']?.[E]) {
    base['Dashboard'][E] = { view: true, create: false, edit: false, delete: false, approve: false };
  }
  for (const rid of [PA, FA, AU]) {
    if (base['Dashboard']?.[rid]) {
      base['Dashboard'][rid] = { ...base['Dashboard'][rid], view: true };
    }
  }
  return base;
}

function makeDefaultPermissionMatrix(roleIds: string[]): CellMatrix {
  const modules = [...PERMISSION_MODULES];
  const actionKeys = PERMISSION_ACTIONS.map((a) => a.key);
  const base = buildInitialMatrix(modules, roleIds, actionKeys);
  return applyTemplateDefaults(base);
}

function mergeMatrixValues(target: CellMatrix, source: CellMatrix, modules: string[], roleIds: string[]): void {
  for (const mod of modules) {
    if (!source[mod]) continue;
    for (const rid of roleIds) {
      if (!source[mod][rid]) continue;
      if (!target[mod][rid]) {
        target[mod][rid] = { view: false, create: false, edit: false, delete: false, approve: false };
      }
      for (const ak of PERMISSION_ACTIONS) {
        const v = source[mod][rid][ak.key];
        if (typeof v === 'boolean') target[mod][rid][ak.key] = v;
      }
    }
  }
}

function ensureRoleAcrossModules(matrix: CellMatrix, roleId: string) {
  for (const mod of PERMISSION_MODULES) {
    if (!matrix[mod]) matrix[mod] = {};
    if (!matrix[mod][roleId]) {
      matrix[mod][roleId] = { view: false, create: false, edit: false, delete: false, approve: false };
    }
  }
}

function migrateV1Raw(raw: unknown, extraRoleIds: string[]): { matrix: CellMatrix; customRoles: ModuleRoleDef[] } {
  const modules = [...PERMISSION_MODULES];
  const systemIds = TENANT_MODULE_MATRIX_ROLES.map((r) => r.id);
  const allIds = [...new Set([...systemIds, ...extraRoleIds])];
  const actionKeys = PERMISSION_ACTIONS.map((a) => a.key);
  const base = makeDefaultPermissionMatrix(allIds);
  const customRoles: ModuleRoleDef[] = [];
  const customSeen = new Set<string>();

  if (!raw || typeof raw !== 'object') {
    return { matrix: base, customRoles };
  }

  const r = raw as CellMatrix;
  for (const mod of modules) {
    const row = r[mod];
    if (!row || typeof row !== 'object') continue;
    for (const [oldKey, cells] of Object.entries(row)) {
      if (typeof cells !== 'object' || !cells) continue;
      let targetId = LEGACY_ROLE_MAP[oldKey] ?? (systemIds.includes(oldKey) ? oldKey : oldKey);
      if (!systemIds.includes(targetId) && !customSeen.has(targetId)) {
        customSeen.add(targetId);
        customRoles.push({
          id: targetId,
          name: targetId.replace(/_/g, ' '),
          color: 'bg-zinc-500',
        });
        ensureRoleAcrossModules(base, targetId);
      }
      ensureRoleAcrossModules(base, targetId);
      for (const ak of actionKeys) {
        const v = (cells as Record<string, boolean>)[ak];
        if (typeof v === 'boolean') base[mod][targetId][ak] = v;
      }
    }
  }
  return { matrix: base, customRoles };
}

function parseStored(
  v2Raw: string | null,
  v1Raw: string | null
): { matrix: CellMatrix; customRoles: ModuleRoleDef[] } {
  const systemIds = TENANT_MODULE_MATRIX_ROLES.map((r) => r.id);

  if (v2Raw) {
    try {
      const parsed = JSON.parse(v2Raw) as { version?: number; matrix?: CellMatrix; customRoles?: ModuleRoleDef[] };
      if (parsed?.matrix && typeof parsed.matrix === 'object') {
        const custom = Array.isArray(parsed.customRoles) ? parsed.customRoles : [];
        const roleIds = [...systemIds, ...custom.map((c) => c.id)];
        const base = makeDefaultPermissionMatrix(roleIds);
        mergeMatrixValues(base, parsed.matrix, [...PERMISSION_MODULES], roleIds);
        return { matrix: base, customRoles: custom };
      }
    } catch {
      /* fall through */
    }
  }

  if (v1Raw) {
    try {
      const parsed = JSON.parse(v1Raw);
      return migrateV1Raw(parsed, []);
    } catch {
      /* ignore */
    }
  }

  return {
    matrix: makeDefaultPermissionMatrix(systemIds),
    customRoles: [],
  };
}

export default function PermissionMatrixPage() {
  const { isAuthenticated, hasPermission, currentUser, currentTenant } = useAuth();
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [cloneSourceRole, setCloneSourceRole] = useState('');
  const [cloneTargetName, setCloneTargetName] = useState('');
  const [activeRoleTab, setActiveRoleTab] = useState<string>(TENANT_MODULE_MATRIX_ROLES[0]?.id ?? '');
  const [customRoles, setCustomRoles] = useState<ModuleRoleDef[]>([]);
  const tenantId = currentTenant?.id ?? null;

  const storageKeys = useMemo(() => {
    if (!tenantId) return { v1: null as string | null, v2: null as string | null };
    return { v1: STORAGE_V1(tenantId), v2: STORAGE_V2(tenantId) };
  }, [tenantId]);

  const [permissions, setPermissions] = useState<CellMatrix>(() =>
    makeDefaultPermissionMatrix(TENANT_MODULE_MATRIX_ROLES.map((r) => r.id))
  );

  useEffect(() => {
    if (!storageKeys.v2 || typeof window === 'undefined') return;
    try {
      const v2 = localStorage.getItem(storageKeys.v2);
      const v1 = localStorage.getItem(storageKeys.v1!);
      const { matrix, customRoles: cr } = parseStored(v2, v1);
      setPermissions(matrix);
      setCustomRoles(cr);
      setActiveRoleTab(TENANT_MODULE_MATRIX_ROLES[0]?.id ?? '');
    } catch {
      /* ignore */
    }
  }, [storageKeys.v1, storageKeys.v2]);

  const allRoles = useMemo(
    () => [...TENANT_MODULE_MATRIX_ROLES, ...customRoles.filter((c) => c.id !== 'Super Admin')],
    [customRoles]
  );

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
      const roleRow =
        mod[roleId] ?? (Object.fromEntries(actions.map((a) => [a.key, false])) as Record<ActionKey, boolean>);
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
    if (!cloneSourceRole || !cloneTargetName.trim()) {
      toast.error('Please select source role and enter target role name');
      return;
    }

    const newRoleId = cloneTargetName.toLowerCase().replace(/\s+/g, '_');
    if (allRoles.some((r) => r.id === newRoleId)) {
      toast.error('A role with this key already exists');
      return;
    }

    const sourceRowTemplate = permissions['Dashboard']?.[cloneSourceRole];
    if (!sourceRowTemplate) {
      toast.error('Invalid source role');
      return;
    }

    setCustomRoles((prev) => [
      ...prev,
      { id: newRoleId, name: cloneTargetName.trim(), color: 'bg-cyan-600' },
    ]);

    setPermissions((prev) => {
      const next: CellMatrix = { ...prev };
      modules.forEach((mod) => {
        const modRow = { ...next[mod] };
        const src = next[mod][cloneSourceRole];
        modRow[newRoleId] = src
          ? { ...src }
          : (Object.fromEntries(actions.map((a) => [a.key, false])) as Record<ActionKey, boolean>);
        next[mod] = modRow;
      });
      return next;
    });

    toast.success(`Cloned permissions to local role "${cloneTargetName.trim()}" (planning only — not a login role)`);
    setShowCloneDialog(false);
    setCloneSourceRole('');
    setCloneTargetName('');
    setActiveRoleTab(newRoleId);
  };

  const stripSuperAdminFromMatrix = (m: CellMatrix): CellMatrix => {
    const next: CellMatrix = { ...m };
    for (const mod of PERMISSION_MODULES) {
      const row = next[mod] ? { ...next[mod] } : {};
      delete row['Super Admin'];
      next[mod] = row;
    }
    return next;
  };

  const handleSave = () => {
    if (!storageKeys.v2) {
      toast.error('Tenant context not ready. Refresh the page and try again.');
      return;
    }
    try {
      const payload = JSON.stringify({
        version: 2,
        matrix: stripSuperAdminFromMatrix(permissions),
        customRoles,
      });
      localStorage.setItem(storageKeys.v2, payload);
      toast.success('Saved module permission matrix for this tenant');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Could not save permissions');
    }
  };

  const grantedCount = (roleId: string) =>
    modules.reduce((sum, mod) => sum + actions.filter((a) => permissions[mod]?.[roleId]?.[a.key]).length, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Module Permissions</h1>
            <p className="text-muted-foreground mt-2">
              Planning matrix stored in this browser per tenant. <strong>Super Admin</strong> is not listed here — it is
              managed only at platform level. This screen does not replace{' '}
              <strong>Admin → Roles &amp; Permissions</strong> (API-backed access for menus and APIs).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Copy className="w-4 h-4" />
                  Clone role (local)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clone permission row set</DialogTitle>
                  <DialogDescription>
                    Copies this screen’s checkboxes into a new column. New names do not create database roles or logins.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Source role</Label>
                    <select
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card mt-1"
                      value={cloneSourceRole}
                      onChange={(e) => setCloneSourceRole(e.target.value)}
                    >
                      <option value="">Select…</option>
                      {allRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>New label</Label>
                    <Input
                      value={cloneTargetName}
                      onChange={(e) => setCloneTargetName(e.target.value)}
                      placeholder="e.g. Regional HR"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowCloneDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCloneRole} className="gap-2">
                      <Copy className="w-4 h-4" />
                      Clone
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button className="gap-2" type="button" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4" />
              Role &amp; Permissions vs this screen
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Roles &amp; Permissions</strong> (under Security &amp; Access) defines
              real permission strings in the database and drives the sidebar, APIs, and User Management.
            </p>
            <p>
              <strong className="text-foreground">Module Permissions</strong> here is a tenant-local checklist for
              workshops and proposals. It is not wired to authorization unless you integrate it separately.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {allRoles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setActiveRoleTab(role.id)}
              className={`rounded-lg border p-3 text-left transition hover:bg-secondary/60 ${
                activeRoleTab === role.id ? 'border-primary bg-secondary/40' : 'border-border'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${role.color}`} />
                <span className="text-xs font-medium line-clamp-2">{role.name}</span>
              </div>
              <div className="text-lg font-bold tabular-nums">
                {grantedCount(role.id)}/{modules.length * actions.length}
              </div>
            </button>
          ))}
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Edit by role</CardTitle>
            <CardDescription>
              Pick a role, then set View / Create / Edit / Delete / Approve for each module (one role at a time).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeRoleTab} onValueChange={setActiveRoleTab}>
              <div className="overflow-x-auto pb-2 -mx-1 px-1">
                <TabsList className="inline-flex h-auto min-w-min flex-nowrap justify-start gap-1 bg-muted/50 p-1">
                  {allRoles.map((role) => (
                    <TabsTrigger
                      key={role.id}
                      value={role.id}
                      className="shrink-0 px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-background"
                    >
                      <span className={`inline-block w-2 h-2 rounded-full shrink-0 mr-2 ${role.color}`} />
                      {role.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {allRoles.map((role) => (
                <TabsContent key={role.id} value={role.id} className="mt-4">
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm border-collapse min-w-[640px]">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left p-3 font-semibold w-[40%]">Module</th>
                          {actions.map((action) => (
                            <th key={action.key} className="text-center p-3 font-semibold whitespace-nowrap">
                              {action.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {modules.map((module) => (
                          <tr key={`${role.id}-${module}`} className="border-b border-border hover:bg-secondary/20">
                            <td className="p-3 font-medium align-middle">{module}</td>
                            {actions.map((action) => {
                              const checked = !!permissions[module]?.[role.id]?.[action.key];
                              return (
                                <td key={action.key} className="p-2 text-center align-middle">
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(v) =>
                                        setPermission(module, role.id, action.key, v === true)
                                      }
                                      aria-label={`${module}, ${role.name}, ${action.label}`}
                                      className="h-5 w-5 border-2 border-foreground/40 bg-background shadow-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground"
                                    />
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
            <CardDescription>Checked = granted for that module and role on this screen only</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
              {actions.map((a) => (
                <div key={a.key} className="flex items-center gap-2">
                  <span
                    className="inline-block size-4 rounded border-2 border-primary bg-primary shrink-0"
                    aria-hidden
                  />
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
