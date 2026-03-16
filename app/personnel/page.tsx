'use client';

// Spec C3: Redirect /personnel → /workforce
// BR-C3-01: 301 redirect for all old URLs
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PersonnelRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/workforce');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirecting to Workforce...</p>
    </div>
  );
}
