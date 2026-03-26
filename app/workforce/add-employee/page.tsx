import { redirect } from 'next/navigation';

/**
 * HR Admin flow: provision employee + login (existing wizard).
 */
export default function WorkforceAddEmployeePage() {
  redirect('/admin/users/create');
}
