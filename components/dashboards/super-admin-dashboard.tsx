'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Users, Building2, Settings, Shield, AlertCircle, Plus, Database, Server, Globe } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';

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
  const [tenants, setTenants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Load tenants and users from API when endpoints are available
    // For now, use default values
    setTenants([]);
    setUsers([]);
    setIsLoading(false);
  }, []);

  const activeTenants = tenants.filter((t: any) => t.status === 'active').length || 1;
  const totalUsers = users.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">System-wide administration and monitoring</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tenants</p>
                <p className="text-2xl font-bold text-foreground">{activeTenants}</p>
                <p className="text-xs text-green-600 mt-1">All systems operational</p>
              </div>
              <Building2 className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">Across all tenants</p>
              </div>
              <Users className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
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

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
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
      </div>

      {/* Tenant Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tenant Management</CardTitle>
                <CardDescription>Manage all organization tenants</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href="/admin/tenants">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tenant
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
                <p className="text-xs text-muted-foreground mt-2">Tenant management API coming soon</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tenants.map((tenant: any) => (
                  <div key={tenant._id || tenant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-muted-foreground">{tenant.code} • {tenant.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                        {tenant.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{tenant.employees || 0} employees</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>System administration tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/admin/users">
                <Users className="w-5 h-5 mb-2" />
                <span className="font-medium">Manage Users</span>
                <span className="text-xs text-muted-foreground">Create and manage system users</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/admin/tenants">
                <Building2 className="w-5 h-5 mb-2" />
                <span className="font-medium">Manage Tenants</span>
                <span className="text-xs text-muted-foreground">Add or configure tenants</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/admin/system-settings">
                <Settings className="w-5 h-5 mb-2" />
                <span className="font-medium">System Settings</span>
                <span className="text-xs text-muted-foreground">Configure system-wide settings</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/admin/audit-log">
                <Shield className="w-5 h-5 mb-2" />
                <span className="font-medium">Audit Logs</span>
                <span className="text-xs text-muted-foreground">View system activity logs</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/admin/integrations">
                <Globe className="w-5 h-5 mb-2" />
                <span className="font-medium">Integrations</span>
                <span className="text-xs text-muted-foreground">Manage API integrations</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start" asChild>
              <Link href="/admin/backup">
                <Database className="w-5 h-5 mb-2" />
                <span className="font-medium">Backup & Restore</span>
                <span className="text-xs text-muted-foreground">Database backup management</span>
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
    </div>
  );
}
