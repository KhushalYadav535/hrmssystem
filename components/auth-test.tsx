'use client';

import { mockUsers, mockTenants } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AuthTest() {
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Mock Users Available</CardTitle>
          <CardDescription>Total: {mockUsers.length} users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockUsers.map((user) => (
            <div key={user.id} className="border rounded p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{user.name}</span>
                <Badge>{user.role}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Email: {user.email}</p>
                <p>Password: {user.password}</p>
                <p>Tenant ID: {user.tenantId}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mock Tenants Available</CardTitle>
          <CardDescription>Total: {mockTenants.length} tenants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockTenants.map((tenant) => (
            <div key={tenant.id} className="border rounded p-3 space-y-2">
              <div className="font-semibold">{tenant.name}</div>
              <div className="text-sm text-muted-foreground">
                <p>ID: {tenant.id}</p>
                <p>Code: {tenant.code}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
