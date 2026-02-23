'use client';

import { ProtectedModuleRoute } from '@/components/modules/ProtectedModuleRoute';

export default function GrievanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedModuleRoute moduleCode="GRIEVANCE">
      {children}
    </ProtectedModuleRoute>
  );
}
