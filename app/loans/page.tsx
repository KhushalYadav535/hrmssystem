'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';

/**
 * /loans redirects to appropriate page based on user role
 * - Tenant Admin / HR Admin / Finance Admin → /loans/admin
 * - Employee → /loans/my-loans
 * - Others → /loans/admin
 */
export default function LoansPage() {
  const { isAuthenticated, currentUser } = useAuth();

  const adminRoles = ['Tenant Admin', 'HR Administrator', 'Finance Administrator', 'Payroll Administrator', 'Super Admin'];
  
  if (isAuthenticated && adminRoles.includes(currentUser?.role || '')) {
    redirect('/loans/admin');
  } else {
    redirect('/loans/my-loans');
  }

  return null;
}
