'use client';

import { ProtectedModuleRoute } from '@/components/modules/ProtectedModuleRoute';

export default function PayrollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedModuleRoute moduleCode="PAYROLL">
      {children}
    </ProtectedModuleRoute>
  );
}
