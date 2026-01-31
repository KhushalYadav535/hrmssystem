'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Settings, Users, Lock, Database, FileText } from 'lucide-react';

export default function AdminPage() {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated || !hasPermission('configure_system')) {
    redirect('/dashboard');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Administration</h1>
          <p className="text-muted-foreground mt-2">Configure system settings and manage access</p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'System Status', value: 'Operational', color: 'bg-green-100 text-green-700' },
            { label: 'Database', value: 'Connected', color: 'bg-green-100 text-green-700' },
            { label: 'Active Users', value: '4,850', color: 'bg-blue-100 text-blue-700' },
            { label: 'Pending Tasks', value: '35', color: 'bg-yellow-100 text-yellow-700' },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-2xl font-bold mb-2">{stat.value}</p>
                <Badge className={stat.color}>Live</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Configuration Tabs */}
        <Tabs defaultValue="policies" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="policies">Leave Policies</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Leave Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Leave Types Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'Casual Leave', days: 12, carryForward: true },
                    { type: 'Sick Leave', days: 6, carryForward: false },
                    { type: 'Earned Leave', days: 20, carryForward: true },
                    { type: 'Maternity Leave', days: 180, carryForward: false },
                  ].map((policy) => (
                    <div key={policy.type} className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium text-sm">{policy.type}</p>
                        <p className="text-xs text-muted-foreground">{policy.days} days per year • Carry forward: {policy.carryForward ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Department Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Finance', head: 'Amit Verma', employees: 320 },
                    { name: 'IT', head: 'Deepa Gupta', employees: 450 },
                    { name: 'HR', head: 'Priya Sharma', employees: 120 },
                    { name: 'Operations', head: 'Rajesh Kumar', employees: 230 },
                  ].map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium text-sm">{dept.name}</p>
                        <p className="text-xs text-muted-foreground">Head: {dept.head} • {dept.employees} employees</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Control Tab */}
          <TabsContent value="access" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Role-Based Access Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { role: 'Employee', permissions: 4, status: 'Active' },
                    { role: 'Manager', permissions: 4, status: 'Active' },
                    { role: 'HR Administrator', permissions: 4, status: 'Active' },
                    { role: 'Payroll Administrator', permissions: 3, status: 'Active' },
                  ].map((role) => (
                    <div key={role.role} className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium text-sm">{role.role}</p>
                        <p className="text-xs text-muted-foreground">{role.permissions} permissions • {role.status}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit Permissions
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Statutory Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'EPFO Contribution', value: '12%', status: 'Configured' },
                    { name: 'ESI Coverage', value: '0.75%', status: 'Configured' },
                    { name: 'Gratuity', value: '15 days', status: 'Configured' },
                    { name: 'PF Interest Rate', value: '8.15%', status: 'Configured' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.value}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">{item.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Third-party Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Banking System (CBS)', status: 'Connected' },
                    { name: 'Email Server (SMTP)', status: 'Connected' },
                    { name: 'SMS Gateway', status: 'Pending' },
                    { name: 'Active Directory (LDAP)', status: 'Connected' },
                    { name: 'Biometric System', status: 'Not Connected' },
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium text-sm">{integration.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          className={
                            integration.status === 'Connected'
                              ? 'bg-green-100 text-green-700'
                              : integration.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }
                        >
                          {integration.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Configure
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Alerts */}
        <Card className="border-0 shadow-sm border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <CardTitle className="text-lg">System Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                '⚠️ Database backup scheduled for tonight at 2:00 AM',
                '⚠️ 8 users pending onboarding completion',
                '⚠️ Payroll cycle for February 2026 due in 5 days',
              ].map((alert, idx) => (
                <p key={idx} className="text-sm text-yellow-700 dark:text-yellow-400">
                  {alert}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
