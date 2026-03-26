'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Mail, User, Building2, Calendar, Users, Landmark } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { formatDesignationLabel } from '@/lib/utils';

interface TenantInfo {
  _id?: string;
  id?: string;
  name?: string;
  code?: string;
}

interface EmployeeInfo {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  employeeCode?: string;
  designation?: string;
  department?: string;
  joinDate?: string;
}

export default function MyProfilePage() {
  const { currentUser, currentTenant } = useAuth();
  const [employeeData, setEmployeeData] = useState<EmployeeInfo | null>(null);
  const [tenantData, setTenantData] = useState<TenantInfo | null>(currentTenant || null);
  const [isLoading, setIsLoading] = useState(true);
  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', ifscCode: '' });
  const [primaryBankAccountId, setPrimaryBankAccountId] = useState<string | null>(null);
  const [bankSaving, setBankSaving] = useState(false);

  const canEditOwnBank =
    currentUser?.role === 'Employee' || currentUser?.role === 'Manager';

  useEffect(() => {
    loadProfileData();
  }, [currentUser]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);

      // Load employee data: via employeeId if present, else by email (Employee/Manager roles)
      let loaded = false;
      if (currentUser?.employeeId) {
        try {
          const response = await apiService.getEmployee(currentUser.employeeId);
          if (response.success && response.data) {
            setEmployeeData(response.data);
            loaded = true;
          }
        } catch (empError: any) {
          console.error('Employee data error:', empError.message);
        }
      }
      if (!loaded && currentUser?.email) {
        try {
          const empRes = await apiService.getEmployees({ search: currentUser.email });
          if (empRes.success && empRes.data && Array.isArray(empRes.data) && empRes.data.length > 0) {
            setEmployeeData(empRes.data[0]);
          }
        } catch (e) {
          console.error('Employee lookup by email failed:', e);
        }
      }
    } catch (error: any) {
      toast.error('Failed to load profile data');
      console.error('Profile load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadBank = async () => {
      if (!employeeData?._id || !canEditOwnBank) return;
      try {
        const res = await apiService.getEmployeeBankAccounts(employeeData._id);
        const list = res.success && Array.isArray(res.data) ? res.data : [];
        const primary = list.find((a: any) => a.isPrimary) || list[0];
        if (primary?._id) {
          setPrimaryBankAccountId(primary._id);
          setBankForm({
            bankName: primary.bankName || '',
            accountNumber: '',
            ifscCode: primary.ifscCode || '',
          });
        } else {
          setPrimaryBankAccountId(null);
          setBankForm({ bankName: '', accountNumber: '', ifscCode: '' });
        }
      } catch {
        /* ignore */
      }
    };
    loadBank();
  }, [employeeData?._id, canEditOwnBank]);

  const initials = (currentUser?.name ?? '')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase() || 'U';

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-red-600 text-white';
      case 'Tenant Admin':
        return 'bg-blue-600 text-white';
      case 'HR Administrator':
        return 'bg-purple-600 text-white';
      case 'Manager':
        return 'bg-orange-600 text-white';
      case 'Employee':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-primary text-white';
    }
  };

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      'Super Admin': 'Platform-level administrative access',
      'Tenant Admin': 'Tenant-level administrative access',
      'HR Administrator': 'HR department management access',
      'Manager': 'Team and employee management access',
      'Employee': 'Self-service employee access',
      'Payroll Administrator': 'Payroll processing and administration',
      'Finance Administrator': 'Finance and approval management',
      'Auditor': 'Audit and compliance viewing access',
    };
    return descriptions[role] || 'User access';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Your account information and settings</p>
        </div>

        {/* Avatar + Name */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-primary">{initials}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{currentUser?.name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className={getRoleColor(currentUser?.role || '')}>
                    <Shield className="w-3 h-3 mr-1" />
                    {currentUser?.role}
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-500">
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{getRoleDescription(currentUser?.role || '')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your login and access information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
              <User className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-semibold">{currentUser?.name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
              <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="font-semibold">{currentUser?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
              <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="font-semibold">{currentUser?.role || '—'}</p>
              </div>
            </div>
            {currentTenant && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                <Building2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Tenant / Organization</p>
                  <p className="font-semibold">{currentTenant.name || '—'}</p>
                </div>
              </div>
            )}
            {currentUser?.joinDate && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="font-semibold">
                    {formatDateDDMMYYYY(currentUser.joinDate)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Details (if available) */}
        {employeeData && canEditOwnBank && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="w-5 h-5" />
                Salary bank account
              </CardTitle>
              <CardDescription>
                Enter bank name, account number (9–18 digits), and IFSC. This is used for salary credits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div>
                <Label htmlFor="bankName">Bank name</Label>
                <Input
                  id="bankName"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))}
                  className="mt-1"
                  placeholder="e.g. State Bank of India"
                />
              </div>
              <div>
                <Label htmlFor="acct">Account number</Label>
                <Input
                  id="acct"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm((f) => ({ ...f, accountNumber: e.target.value }))}
                  className="mt-1"
                  placeholder="Digits only, 9–18 characters"
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="ifsc">IFSC code</Label>
                <Input
                  id="ifsc"
                  value={bankForm.ifscCode}
                  onChange={(e) => setBankForm((f) => ({ ...f, ifscCode: e.target.value.toUpperCase() }))}
                  className="mt-1"
                  placeholder="e.g. SBIN0001234"
                  maxLength={11}
                />
              </div>
              <Button
                type="button"
                disabled={bankSaving}
                onClick={async () => {
                  if (!employeeData._id) return;
                  const digits = bankForm.accountNumber.replace(/\D/g, '');
                  if (!bankForm.bankName.trim() || digits.length < 9 || digits.length > 18) {
                    toast.error('Bank name and a valid account number (9–18 digits) are required');
                    return;
                  }
                  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankForm.ifscCode.trim())) {
                    toast.error('Invalid IFSC format (e.g. HDFC0001234)');
                    return;
                  }
                  setBankSaving(true);
                  try {
                    const payload = {
                      bankName: bankForm.bankName.trim(),
                      accountNumber: bankForm.accountNumber.trim(),
                      ifscCode: bankForm.ifscCode.trim(),
                      isPrimary: true,
                    };
                    if (primaryBankAccountId) {
                      const res = await apiService.updateBankAccount(employeeData._id, primaryBankAccountId, payload);
                      if (res.success) toast.success('Bank details updated');
                      else toast.error(res.message || 'Update failed');
                    } else {
                      const res = await apiService.createBankAccount(employeeData._id, payload);
                      if (res.success) {
                        toast.success('Bank details saved');
                        const id = (res.data as any)?._id || (res.data as any)?.id;
                        if (id) setPrimaryBankAccountId(id);
                        setBankForm((f) => ({ ...f, accountNumber: '' }));
                      } else toast.error(res.message || 'Save failed');
                    }
                  } catch (e: any) {
                    toast.error(e?.message || 'Request failed');
                  } finally {
                    setBankSaving(false);
                  }
                }}
              >
                {bankSaving ? 'Saving…' : primaryBankAccountId ? 'Update bank details' : 'Save bank details'}
              </Button>
            </CardContent>
          </Card>
        )}

        {employeeData && (
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
              <CardDescription>Your employment details in the organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employeeData.employeeCode && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                    <User className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Employee ID</p>
                      <p className="font-semibold">{employeeData.employeeCode}</p>
                    </div>
                  </div>
                )}
                {formatDesignationLabel(employeeData.designation) && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                    <Users className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Designation</p>
                      <p className="font-semibold">{formatDesignationLabel(employeeData.designation)}</p>
                    </div>
                  </div>
                )}
                {employeeData.department && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                    <Building2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="font-semibold">{employeeData.department}</p>
                    </div>
                  </div>
                )}
                {employeeData.joinDate && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                    <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Join Date</p>
                      <p className="font-semibold">
                        {formatDateDDMMYYYY(employeeData.joinDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Access Scope */}
        <Card>
          <CardHeader>
            <CardTitle>Access Scope</CardTitle>
            <CardDescription>Your access permissions and scope</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {currentUser?.role === 'Super Admin' ? (
                [
                  'Tenant Management',
                  'Module Management',
                  'Subscription Packages',
                  'Platform Settings',
                  'Integrations',
                  'Analytics & Usage',
                  'Audit Logs',
                  'All Tenant Data',
                ].map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center gap-2 text-sm p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                  >
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                    {perm}
                  </div>
                ))
              ) : currentUser?.role === 'Tenant Admin' ? (
                [
                  'Tenant Configuration',
                  'User Management',
                  'Department Management',
                  'Payroll Management',
                  'Leave Management',
                  'Approval Workflows',
                  'Tenant Analytics',
                  'Tenant Audit Logs',
                ].map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center gap-2 text-sm p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                  >
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                    {perm}
                  </div>
                ))
              ) : (
                [
                  'View Own Profile',
                  'Submit Requests',
                  'View Own Data',
                  'Team Management',
                ].map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center gap-2 text-sm p-2 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                  >
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                    {perm}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
