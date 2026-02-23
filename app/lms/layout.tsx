'use client';

import { ProtectedModuleRoute } from '@/components/modules/ProtectedModuleRoute';

export default function LMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedModuleRoute moduleCode="LMS">
      {children}
    </ProtectedModuleRoute>
  );
}
