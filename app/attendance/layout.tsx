'use client';

import { ProtectedModuleRoute } from '@/components/modules/ProtectedModuleRoute';

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedModuleRoute moduleCode="ATTENDANCE">
      {children}
    </ProtectedModuleRoute>
  );
}
