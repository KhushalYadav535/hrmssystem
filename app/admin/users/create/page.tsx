'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const PROVISION_ROLES = [
  'Employee',
  'Manager',
  'HR Administrator',
  'Payroll Administrator',
  'Finance Administrator',
  'Auditor',
] as const;

type ProvisionEmp = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeCode: string;
  department: string;
  designationName?: string;
};

function ProvisionLoginForm() {
  const router = useRouter();
  const [list, setList] = useState<ProvisionEmp[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState<string>('Employee');
  const [payrollSubRole, setPayrollSubRole] = useState<'Maker' | 'Checker'>('Maker');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiService.getProvisionableEmployees();
        if (res.success && res.data) {
          setList(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        toast.error('Failed to load employees');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = async () => {
    if (!employeeId) {
      toast.error('Select an employee');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiService.createUser({
        employeeId,
        role,
        roles: [role],
        payrollSubRole:
          role === 'Payroll Administrator' ? payrollSubRole : null,
      });
      if (res.success) {
        const tp = (res as { tempPassword?: string }).tempPassword;
        if (tp && typeof tp === 'string') {
          toast.success(`User created. Temporary password: ${tp}`, { duration: 20_000 });
        } else {
          toast.success('User created. Credentials were sent by email if configured.');
        }
        router.push('/admin/users?refresh=1');
        router.refresh();
      } else {
        toast.error((res as { message?: string }).message || 'Failed to create user');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create user';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing employee — new login</CardTitle>
        <CardDescription>
          Employees listed here have an HR record but no user account yet. Tenant Admins use this flow; HR can add
          brand-new employees under <strong>New employee &amp; login</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active employees without a login. Ask HR to create employee records first (Workforce / bulk import),
            then return here to enable access.
          </p>
        ) : (
          <>
            <div>
              <Label>Employee</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose employee" />
                </SelectTrigger>
                <SelectContent>
                  {list.map((e) => (
                    <SelectItem key={e._id} value={e._id}>
                      {e.employeeCode} — {e.firstName} {e.lastName} ({e.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVISION_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {role === 'Payroll Administrator' && (
              <div>
                <Label>Payroll sub-role</Label>
                <Select
                  value={payrollSubRole}
                  onValueChange={(v) => setPayrollSubRole(v as 'Maker' | 'Checker')}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maker">Maker</SelectItem>
                    <SelectItem value="Checker">Checker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={onSubmit} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create user account'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function HrAddEmployeeLink() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New employee full record</CardTitle>
        <CardDescription>
          Use the dedicated add-employee page (single form, photograph, all fields). Edit existing employees from the
          workforce directory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <a href="/workforce/add-employee">Open Add Employee form</a>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function CreateUserPage() {
  const { isAuthenticated, hasPermission, hasRole } = useAuth();

  if (!isAuthenticated || !hasPermission('manage_users')) {
    redirect('/dashboard');
  }

  const isHr = hasRole('HR Administrator');
  const isTa = hasRole('Tenant Admin');

  if (!isHr && !isTa) {
    redirect('/dashboard');
  }

  if (isTa && !isHr) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create user access</h1>
            <p className="text-muted-foreground mt-2">
              Provision login accounts for employees who already exist in the system. Adding full employee records is
              done by HR (Workforce / Add Employee).
            </p>
          </div>
          <ProvisionLoginForm />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create user / employee</h1>
          <p className="text-muted-foreground mt-2">
            HR: add a new employee with login, or grant access to someone who already has an HR record.
          </p>
        </div>

        <Tabs defaultValue="new">
          <TabsList>
            <TabsTrigger value="new">New employee &amp; login</TabsTrigger>
            <TabsTrigger value="provision">Provision login (existing)</TabsTrigger>
          </TabsList>
          <TabsContent value="new" className="mt-6">
            <HrAddEmployeeLink />
          </TabsContent>
          <TabsContent value="provision" className="mt-6">
            <ProvisionLoginForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
