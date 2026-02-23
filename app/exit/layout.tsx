'use client';

import { ProtectedModuleRoute } from '@/components/modules/ProtectedModuleRoute';

export default function ExitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedModuleRoute moduleCode="EXIT_MGMT">
      {children}
    </ProtectedModuleRoute>
  );
}
