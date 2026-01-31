'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Save } from 'lucide-react';

export default function PermissionMatrixPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [permissions, setPermissions] = useState({
    hr_admin: { view: true, create: true, edit: true, delete: true, approve: true },
    manager: { view: true, create: true, edit: true, delete: false, approve: true },
    employee: { view: true, create: false, edit: false, delete: false, approve: false },
    hr_officer: { view: true, create: true, edit: true, delete: false, approve: false },
  });

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

  const actions = ['View', 'Create', 'Edit', 'Delete', 'Approve'];

  const togglePermission = (role: string, action: string) => {
    setPermissions({
      ...permissions,
      [role]: {
        ...permissions[role as keyof typeof permissions],
        [action.toLowerCase()]: !permissions[role as keyof typeof permissions][action.toLowerCase() as keyof typeof permissions[keyof typeof permissions]],
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Permission Matrix</h1>
            <p className="text-muted-foreground mt-2">Configure role-based access permissions</p>
          </div>
          <Button className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
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
                  {Object.values(permissions[role.id as keyof typeof permissions] as any).filter((v: any) => v).length}/{actions.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">permissions</p>
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
                                key={action}
                                className={`px-2 py-1 rounded text-xs font-medium transition ${
                                  permissions[role.id as keyof typeof permissions]?.[action.toLowerCase() as keyof (typeof permissions)[keyof typeof permissions]] as any
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-300 text-gray-600'
                                }`}
                                onClick={() => togglePermission(role.id, action)}
                                title={action}
                              >
                                {action[0]}
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
