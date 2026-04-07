'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import apiService from '@/lib/api';

/**
 * Resolves the logged-in user's Employee document and opens the same
 * full profile view as HR Admin (/employee/[id]).
 */
export default function MyEmployeeProfileRedirectPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.replace('/login');
      return;
    }

    const linkedId = currentUser.employeeId
      ? String(currentUser.employeeId)
      : null;

    const run = async () => {
      if (linkedId) {
        router.replace(`/employee/${encodeURIComponent(linkedId)}`);
        return;
      }
      try {
        const res = await apiService.getEmployees({ search: currentUser.email });
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const id = res.data[0]._id || res.data[0].id;
          if (id) {
            router.replace(`/employee/${encodeURIComponent(String(id))}`);
            return;
          }
        }
      } catch {
        /* fall through */
      }
      router.replace('/dashboard');
    };

    void run();
  }, [isAuthenticated, currentUser, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">
      Opening your profile…
    </div>
  );
}
