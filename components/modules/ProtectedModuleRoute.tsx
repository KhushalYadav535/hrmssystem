'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

/**
 * Protected Module Route Component
 * BRD: Dynamic Module Management System - DM-030
 */
interface ProtectedModuleRouteProps {
  moduleCode: string;
  children: React.ReactNode;
  permission?: string;
}

export const ProtectedModuleRoute: React.FC<ProtectedModuleRouteProps> = ({
  moduleCode,
  children,
  permission,
}) => {
  const { isEnabled, isLoading, hasPermission } = useModuleAccess(moduleCode);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Module Not Available</CardTitle>
            </div>
            <CardDescription>
              The {moduleCode} module is not enabled for your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please contact your administrator to request access to this module.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                Go to Dashboard
              </Button>
              <Button onClick={() => router.push('/company/modules')} variant="default">
                Request Module
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Permission Denied</CardTitle>
            <CardDescription>
              You do not have {permission} permission for {moduleCode} module.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
