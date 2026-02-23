'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Module Disabled Message Component
 * BRD: Dynamic Module Management System - DM-032
 */
interface ModuleDisabledMessageProps {
  moduleCode: string;
  moduleName?: string;
}

export const ModuleDisabledMessage: React.FC<ModuleDisabledMessageProps> = ({
  moduleCode,
  moduleName,
}) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>Module Not Available</CardTitle>
          </div>
          <CardDescription>
            {moduleName || moduleCode} is not enabled for your organization.
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
};
