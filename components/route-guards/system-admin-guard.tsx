'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle } from 'lucide-react';

/**
 * US-B2-01: Route Guard for System Admin (Tenant Admin)
 * Blocks access to HR operational pages for System Admin role
 */
export default function SystemAdminGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // HR operational routes that System Admin should not access
  const hrOperationalRoutes = [
    '/workforce',
    '/payroll',
    '/leave',
    '/travel',
    '/loans',
    '/exit',
    '/employee/profile-update',
    '/grievance',
    '/performance',
    '/attendance',
    '/tax',
    '/recruitment',
    '/onboarding',
    '/lms',
    '/approvals',
  ];

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    // Check if user is System Admin (Tenant Admin)
    if (currentUser.role === 'Tenant Admin') {
      // Check if current path is an HR operational route
      const isHROperationalRoute = hrOperationalRoutes.some(route => 
        pathname.startsWith(route)
      );

      if (isHROperationalRoute) {
        // Redirect to dashboard with access denied message
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, currentUser, pathname, router]);

  // If System Admin tries to access HR route, show access denied
  if (currentUser?.role === 'Tenant Admin') {
    const isHROperationalRoute = hrOperationalRoutes.some(route => 
      pathname.startsWith(route)
    );

    if (isHROperationalRoute) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <CardTitle>Access Denied</CardTitle>
              </div>
              <CardDescription>
                This area is managed by your HR team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your role provides system configuration access only. HR operational functions 
                (Personnel, Payroll, Leave, etc.) are managed by HR Administrators.
              </p>
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Go to System Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}
