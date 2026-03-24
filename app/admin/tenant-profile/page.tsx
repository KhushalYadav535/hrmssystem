'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Mail, User, Building2, Calendar } from 'lucide-react';

export default function TenantAdminProfilePage() {
  const { currentUser, currentTenant } = useAuth();

  const initials = (currentUser?.name ?? '')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase() || 'TA';

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Tenant Administrator Account</p>
        </div>

        {/* Avatar + Name */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-blue-600/20 border-2 border-blue-600/30 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-blue-600">{initials}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{currentUser?.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-600 text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    {currentUser?.role}
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-500">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Tenant-level administrative account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
              <User className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-semibold">{currentUser?.name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
              <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="font-semibold">{currentUser?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
              <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="font-semibold">{currentUser?.role || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
              <Building2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Tenant / Organization</p>
                <p className="font-semibold">{currentTenant?.name || '—'}</p>
              </div>
            </div>
            {currentUser?.joinDate && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="font-semibold">
                    {formatDateDDMMYYYY(currentUser.joinDate)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Access & Permissions</CardTitle>
            <CardDescription>Tenant Admin has administrative access within this tenant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Tenant Configuration',
                'User Management',
                'Department Management',
                'Payroll Administration',
                'Leave Management',
                'Approval Workflows',
                'Tenant Analytics',
                'Tenant Audit Logs',
              ].map((perm) => (
                <div
                  key={perm}
                  className="flex items-center gap-2 text-sm p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                >
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                  {perm}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
