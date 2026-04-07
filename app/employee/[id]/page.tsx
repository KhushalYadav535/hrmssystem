'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect, useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Award, BookOpen, AlertCircle, Download, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { maskAadhaar, maskPAN, maskAccountNumber } from '@/lib/masking';
import { formatDateDDMMYYYY } from '@/lib/date-format';
import { designationToIdString, formatDesignationLabel } from '@/lib/utils';

function mixedRefToId(val: unknown): string {
  if (val == null || val === '') return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && '_id' in val) {
    const id = (val as { _id: unknown })._id;
    return id != null ? String(id) : '';
  }
  return '';
}

function formatEmployeeRef(ref: unknown): string {
  if (!ref) return '—';
  if (typeof ref === 'object' && ref !== null && 'firstName' in ref) {
    const o = ref as { firstName?: string; lastName?: string; employeeCode?: string };
    const name = `${o.firstName || ''} ${o.lastName || ''}`.trim();
    if (!name) return '—';
    return o.employeeCode ? `${name} (${o.employeeCode})` : name;
  }
  return '—';
}

function gradeDisplayLabel(grade: unknown): string {
  if (grade == null || grade === '') return '—';
  if (typeof grade === 'object' && grade !== null && 'name' in grade) {
    return String((grade as { name?: string }).name || '—');
  }
  return String(grade);
}

function toDateInput(val: string | Date | undefined): string {
  if (!val) return '';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

interface Employee {
  _id?: string;
  id?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  status: string;
  joinDate?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  salary?: number;
  ctc?: number;
  panNumber?: string;
  aadhaarNumber?: string;
  maritalStatus?: string;
  reportingManager?: string;
  [key: string]: any;
}

export default function EmployeeDetailPage() {
  const { isAuthenticated, hasPermission, hasRole, currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [nominees, setNominees] = useState<any[]>([]);
  const [previousEmployments, setPreviousEmployments] = useState<any[]>([]);
  const [familyDetails, setFamilyDetails] = useState<any | null>(null);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [salaryStructures, setSalaryStructures] = useState<any[]>([]);
  const [managersForEdit, setManagersForEdit] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    maritalStatus: '',
    designation: '',
    department: '',
    status: 'Active',
    joinDate: '',
    location: '',
    grade: '',
    salary: '',
    ctc: '',
    employmentType: 'Permanent',
    reportingManager: '',
    secondLevelManager: '',
    salaryStructure: '',
  });

  useEffect(() => {
    // Ensure params are available and extract ID
    if (params && params.id) {
      let id = Array.isArray(params.id) ? params.id[0] : params.id;
      // Decode URL-encoded ID
      if (typeof id === 'string') {
        id = decodeURIComponent(id);
      }
      setEmployeeId(id);
      console.log('Extracted employee ID from params:', id);
    } else {
      console.error('No ID found in params:', params);
    }
  }, [params]);

  useEffect(() => {
    if (isAuthenticated && employeeId) {
      loadEmployee();
    }
  }, [isAuthenticated, employeeId]);

  const loadEmployee = async () => {
    if (!employeeId) {
      console.error('Employee ID is missing from URL params');
      console.error('Params:', params);
      toast.error('Invalid employee ID');
      router.push('/dashboard');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading employee with ID:', employeeId);
      const response = await apiService.getEmployee(employeeId);
      if (response.success && response.data) {
        const empData: any = response.data;
        setEmployee(empData);

        // Set related data (already included in response from backend)
        setBankAccounts(empData.bankAccounts || []);
        setEmergencyContacts(empData.emergencyContacts || []);
        setNominees(empData.nominees || []);
        setPreviousEmployments(empData.previousEmployments || []);
        setFamilyDetails(empData.familyDetails || null);
      } else {
        toast.error('Employee not found');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error('Failed to load employee details');
      console.error('Load employee error:', error);
      console.error('Employee ID used:', employeeId);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const canManageEmployee =
    hasPermission('manage_employees') && currentUser?.role !== 'Auditor';

  const handleEditDesignationChange = (designationId: string) => {
    setEditForm((prev) => {
      const selectedDesig = designations.find((d: any) => (d._id || d.id) === designationId);
      let grade = prev.grade;
      if (selectedDesig?.defaultGradeId) {
        const gradeId =
          typeof selectedDesig.defaultGradeId === 'object'
            ? selectedDesig.defaultGradeId._id || selectedDesig.defaultGradeId
            : selectedDesig.defaultGradeId;
        grade = String(gradeId);
        toast.info('Grade auto-filled from Designation mapping');
      }
      return { ...prev, designation: designationId, grade };
    });
  };

  const openEditDialog = async () => {
    if (!employee || !employeeId) return;
    setManagersForEdit([]);
    setSalaryStructures([]);
    try {
      const selfId = String(employee._id || employee.id || '');
      const [deptRes, desigRes, locRes, gradeRes, structRes, empRes] = await Promise.all([
        apiService.getDepartments(),
        apiService.getActiveDesignations(),
        apiService.getActiveLocations(),
        apiService.getActiveGrades(),
        apiService.getSalaryStructures({ status: 'Active' }),
        apiService.getEmployees({ status: 'Active' }),
      ]);
      if (deptRes.success && deptRes.data) {
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      }
      if (desigRes.success && desigRes.data) {
        setDesignations(Array.isArray(desigRes.data) ? desigRes.data : []);
      }
      if (locRes.success && locRes.data) {
        const raw = locRes.data as unknown;
        const list = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown[] }).data)
            ? (raw as { data: unknown[] }).data
            : [];
        setLocations(list as any[]);
      }
      if (gradeRes.success && gradeRes.data) {
        setGrades(Array.isArray(gradeRes.data) ? gradeRes.data : []);
      }
      if (structRes.success && structRes.data) {
        setSalaryStructures(Array.isArray(structRes.data) ? structRes.data : []);
      }
      if (empRes.success && empRes.data) {
        const raw = empRes.data as unknown;
        const list = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown[] }).data)
            ? (raw as { data: unknown[] }).data
            : [];
        const all = list as any[];
        setManagersForEdit(all.filter((e) => String(e._id || e.id) !== selfId));
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load edit form data');
      return;
    }

    const desigId = designationToIdString(employee.designation);
    const empAny = employee as any;
    setEditForm({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      dateOfBirth: toDateInput(employee.dateOfBirth),
      gender: employee.gender || 'Male',
      maritalStatus: employee.maritalStatus || '',
      designation: desigId,
      department: employee.department || '',
      status: employee.status || 'Active',
      joinDate: toDateInput(employee.joinDate),
      location: mixedRefToId(employee.location),
      grade: mixedRefToId(employee.grade),
      salary: employee.salary != null ? String(employee.salary) : '',
      ctc: employee.ctc != null ? String(employee.ctc) : '',
      employmentType: employee.employmentType || 'Permanent',
      reportingManager: mixedRefToId(empAny.reportingManager),
      secondLevelManager: mixedRefToId(empAny.secondLevelManager),
      salaryStructure: mixedRefToId(empAny.salaryStructure),
    });
    setShowEditDialog(true);
  };

  const saveEmployeeEdit = async () => {
    if (!employeeId) return;
    if (
      !editForm.firstName?.trim() ||
      !editForm.lastName?.trim() ||
      !editForm.email?.trim() ||
      !editForm.phone?.trim() ||
      !editForm.dateOfBirth ||
      !editForm.department ||
      !editForm.designation ||
      !editForm.joinDate ||
      !editForm.location
    ) {
      toast.error('Please fill all required fields');
      return;
    }
    const salary = parseFloat(editForm.salary);
    const ctc = parseFloat(editForm.ctc);
    if (Number.isNaN(salary) || Number.isNaN(ctc)) {
      toast.error('Salary and CTC must be valid numbers');
      return;
    }
    setEditSaving(true);
    try {
      const payload: Record<string, unknown> = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim().toLowerCase(),
        phone: editForm.phone.trim(),
        dateOfBirth: editForm.dateOfBirth,
        gender: editForm.gender,
        department: editForm.department.trim(),
        designation: editForm.designation,
        status: editForm.status,
        joinDate: editForm.joinDate,
        location: editForm.location,
        salary,
        ctc,
        employmentType: editForm.employmentType,
      };
      if (editForm.maritalStatus) payload.maritalStatus = editForm.maritalStatus;
      if (editForm.grade) payload.grade = editForm.grade;
      payload.reportingManager = editForm.reportingManager || null;
      payload.secondLevelManager = editForm.secondLevelManager || null;
      payload.salaryStructure = editForm.salaryStructure || null;

      const res = await apiService.updateEmployee(employeeId, payload);
      if (res.success) {
        toast.success('Employee updated successfully');
        setShowEditDialog(false);
        await loadEmployee();
      } else {
        toast.error((res as { message?: string }).message || 'Update failed');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Update failed';
      toast.error(message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleExportProfile = () => {
    if (!employee) return;
    const exportPayload = {
      employeeCode: employee.employeeCode,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      department: employee.department,
      designation: formatDesignationLabel(employee.designation),
      status: employee.status,
      joinDate: employee.joinDate,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${employee.employeeCode || 'employee'}-profile-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Profile exported');
  };

  // Check permissions: Allow Tenant Admin, HR Admin, Manager, and users with manage_employees permission
  // Also allow users with view_profile or view_employee_data permissions, OR if the user is viewing their own profile
  // Wait for auth to be ready before checking
  useEffect(() => {
    // Don't check if auth is still loading or user is not authenticated
    if (!isAuthenticated || !currentUser) {
      // Only redirect if we're sure user is not authenticated (not just loading)
      if (isAuthenticated === false) {
        router.push('/dashboard');
      }
      return;
    }

    const hasRoleAccess =
      hasRole('Tenant Admin') ||
      hasRole('HR Administrator') ||
      hasRole('Manager');
    const hasPermissionAccess =
      hasPermission('manage_employees') ||
      hasPermission('view_profile') ||
      hasPermission('view_employee_data');

    const currentUserId = currentUser ? (currentUser.id || (currentUser as any)._id) : null;
    const employeeDocId = employee ? (employee._id || employee.id) : null;
    const linkedEmployeeId = currentUser?.employeeId
      ? String(currentUser.employeeId)
      : null;
    const isOwnProfile =
      !!currentUser &&
      !!employee &&
      (String(currentUser.email || '').toLowerCase() ===
        String(employee.email || '').toLowerCase() ||
        (!!linkedEmployeeId &&
          !!employeeDocId &&
          linkedEmployeeId === String(employeeDocId)));

    // Check both permission-based access and whether the data has loaded to check ownership
    // If we're still loading the employee data, we can't determine ownership yet
    if (!isLoading && !hasRoleAccess && !hasPermissionAccess && !isOwnProfile) {
      console.log('Access denied - redirecting to dashboard', {
        role: currentUser.role,
        hasRoleAccess,
        hasPermissionAccess,
        isOwnProfile,
        hasManageEmployees: hasPermission('manage_employees'),
        hasViewProfile: hasPermission('view_profile'),
        hasViewEmployeeData: hasPermission('view_employee_data'),
      });
      router.push('/dashboard');
    }
  }, [isAuthenticated, currentUser, hasPermission, hasRole, router, isLoading, employee]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading employee details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Employee not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const editFormDesignationId = designationToIdString(editForm.designation);
  const editFormDesignationLabel = editFormDesignationId
    ? designations.find((d: any) => String(d._id || d.id) === editFormDesignationId)?.name ||
      ''
    : '';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Profile</h1>
            <p className="text-muted-foreground mt-2">{fullName} - {formatDesignationLabel(employee.designation) || '—'}</p>
          </div>
          <div className="flex gap-2">
            {canManageEmployee && (
              <Button
                type="button"
                variant="outline"
                className="gap-2 bg-transparent"
                onClick={() => void openEditDialog()}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={handleExportProfile}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Employee ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employee.employeeCode}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={employee.status === 'Active' ? 'bg-green-600' : 'bg-gray-600'}>
                {employee.status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employee.department || 'N/A'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Join Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDateDDMMYYYY(employee.joinDate)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="family">Family & Nominees</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">Previous Employment</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="text-lg font-semibold">{fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-lg font-semibold">{employee.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-lg font-semibold">{employee.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="text-lg font-semibold">{formatDateDDMMYYYY(employee.dateOfBirth)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="text-lg font-semibold">{employee.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marital Status</p>
                    <p className="text-lg font-semibold">{employee.maritalStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PAN</p>
                    <p className="text-lg font-semibold">{maskPAN(employee.panNumber)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Aadhaar</p>
                    <p className="text-lg font-semibold">{maskAadhaar(employee.aadhaarNumber)}</p>
                  </div>
                  {employee.uanNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">UAN</p>
                      <p className="text-lg font-semibold">{employee.uanNumber}</p>
                    </div>
                  )}
                  {employee.passportNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Passport</p>
                      <p className="text-lg font-semibold">{employee.passportNumber}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employment">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Designation</p>
                      <p className="text-lg font-semibold">{formatDesignationLabel(employee.designation) || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="text-lg font-semibold">{employee.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Grade</p>
                      <p className="text-lg font-semibold">A1</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reporting Manager</p>
                      <p className="text-lg font-semibold">Priya Sharma</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Join Date</p>
                      <p className="text-lg font-semibold">{formatDateDDMMYYYY(employee.joinDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Employment Type</p>
                      <p className="text-lg font-semibold">Permanent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Salary Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between p-3 bg-secondary/50 rounded">
                    <span className="font-medium">Basic Salary</span>
                    <span className="font-bold">₹{employee.salary ? employee.salary.toLocaleString('en-IN') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-secondary/50 rounded">
                    <span className="font-medium">HRA</span>
                    <span className="font-bold">₹{employee.salary ? Math.round(employee.salary * 0.3).toLocaleString('en-IN') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-secondary/50 rounded">
                    <span className="font-medium">Conveyance</span>
                    <span className="font-bold">₹{employee.salary ? Math.round(employee.salary * 0.1).toLocaleString('en-IN') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-primary/10 rounded border border-primary/20">
                    <span className="font-bold">Total CTC</span>
                    <span className="font-bold text-primary">₹{employee.ctc ? employee.ctc.toLocaleString('en-IN') : (employee.salary ? (employee.salary * 12).toLocaleString('en-IN') : 'N/A')}/year</span>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Accounts */}
              <Card>
                <CardHeader>
                  <CardTitle>Bank Accounts</CardTitle>
                  <CardDescription>Employee bank account details</CardDescription>
                </CardHeader>
                <CardContent>
                  {bankAccounts.length > 0 ? (
                    <div className="space-y-3">
                      {bankAccounts.map((account: any) => (
                        <div key={account._id || account.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{account.bankName}</span>
                              {account.isPrimary && (
                                <Badge variant="default" className="text-xs">Primary</Badge>
                              )}
                            </div>
                            <Badge variant="outline">{account.accountType}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Account Number:</span>
                              <span className="ml-2 font-mono">{maskAccountNumber(account.accountNumber)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">IFSC:</span>
                              <span className="ml-2 font-mono">{account.ifscCode}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Branch:</span>
                              <span className="ml-2">{account.branchName}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Account Holder:</span>
                              <span className="ml-2">{account.accountHolderName}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No bank accounts found</p>
                  )}
                </CardContent>
              </Card>

              {/* Emergency Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contacts</CardTitle>
                  <CardDescription>Emergency contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  {emergencyContacts.length > 0 ? (
                    <div className="space-y-3">
                      {emergencyContacts.map((contact: any) => (
                        <div key={contact._id || contact.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{contact.name}</span>
                            <Badge variant="outline">{contact.relationship}</Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="ml-2">{contact.phone}</span>
                            </div>
                            {contact.address && (
                              <div>
                                <span className="text-muted-foreground">Address:</span>
                                <span className="ml-2">{contact.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No emergency contacts found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New Tab: Family & Nominees */}
          <TabsContent value="family">
            <div className="space-y-4">
              {/* Family Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Family Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {familyDetails ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Dependent Children</p>
                        <p className="text-lg font-semibold">{familyDetails.dependentChildrenCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Dependent Parents</p>
                        <p className="text-lg font-semibold">{familyDetails.hasDependentParents ? 'Yes' : 'No'}</p>
                      </div>
                      {familyDetails.spouseName && (
                        <div>
                          <p className="text-sm text-muted-foreground">Spouse Name</p>
                          <p className="text-lg font-semibold">{familyDetails.spouseName}</p>
                        </div>
                      )}
                      {familyDetails.spouseOccupation && (
                        <div>
                          <p className="text-sm text-muted-foreground">Spouse Occupation</p>
                          <p className="text-lg font-semibold">{familyDetails.spouseOccupation}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No family details found</p>
                  )}
                </CardContent>
              </Card>

              {/* Nominees */}
              <Card>
                <CardHeader>
                  <CardTitle>Nominees</CardTitle>
                  <CardDescription>PF and Gratuity nominees</CardDescription>
                </CardHeader>
                <CardContent>
                  {nominees.length > 0 ? (
                    <div className="space-y-3">
                      {nominees.map((nominee: any) => (
                        <div key={nominee._id || nominee.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{nominee.nomineeName}</span>
                            <Badge variant="outline">{nominee.nomineeType}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Relationship:</span>
                              <span className="ml-2">{nominee.relationship}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Share:</span>
                              <span className="ml-2">{nominee.sharePercentage}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date of Birth:</span>
                              <span className="ml-2">{formatDateDDMMYYYY(nominee.dateOfBirth)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No nominees found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New Tab: Previous Employment */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Previous Employment History</CardTitle>
                <CardDescription>Previous employment records</CardDescription>
              </CardHeader>
              <CardContent>
                {previousEmployments.length > 0 ? (
                  <div className="space-y-4">
                    {previousEmployments.map((employment: any) => (
                      <div key={employment._id || employment.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-lg">{employment.employerName}</span>
                          <div className="text-sm text-muted-foreground">
                            {formatDateDDMMYYYY(employment.startDate)} - {formatDateDDMMYYYY(employment.endDate)}
                          </div>
                        </div>
                        {employment.employerAddress && (
                          <p className="text-sm text-muted-foreground mb-2">{employment.employerAddress}</p>
                        )}
                        <div className="flex gap-2 mt-3">
                          {employment.relievingLetterUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={employment.relievingLetterUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-4 h-4 mr-2" />
                                Relieving Letter
                              </a>
                            </Button>
                          )}
                          {employment.experienceCertUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={employment.experienceCertUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-4 h-4 mr-2" />
                                Experience Certificate
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No previous employment records found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Document Library</CardTitle>
                <CardDescription>All employee documents and certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Appointment Letter', 'PAN Certificate', 'Aadhaar Card', 'Passport', 'Educational Certificates', 'Experience Certificate'].map((doc) => (
                    <div key={doc} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/30 transition">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-medium">{doc}</span>
                      </div>
                      <Button size="sm" variant="outline">Download</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Previous Employment History</CardTitle>
                <CardDescription>Previous employment records</CardDescription>
              </CardHeader>
              <CardContent>
                {previousEmployments.length > 0 ? (
                  <div className="space-y-4">
                    {previousEmployments.map((employment: any) => (
                      <div key={employment._id || employment.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-lg">{employment.employerName}</span>
                          <div className="text-sm text-muted-foreground">
                            {formatDateDDMMYYYY(employment.startDate)} - {formatDateDDMMYYYY(employment.endDate)}
                          </div>
                        </div>
                        {employment.employerAddress && (
                          <p className="text-sm text-muted-foreground mb-2">{employment.employerAddress}</p>
                        )}
                        <div className="flex gap-2 mt-3">
                          {employment.relievingLetterUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={employment.relievingLetterUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-4 h-4 mr-2" />
                                Relieving Letter
                              </a>
                            </Button>
                          )}
                          {employment.experienceCertUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={employment.experienceCertUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-4 h-4 mr-2" />
                                Experience Certificate
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No previous employment records found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Latest Rating</p>
                      <p className="text-3xl font-bold text-yellow-600 mt-2">4.2/5</p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Rating Trend</p>
                      <p className="text-lg font-bold mt-2">↑ Improving</p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Appraisals Completed</p>
                      <p className="text-3xl font-bold mt-2">3/3</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                className="h-20 text-lg gap-2"
                onClick={() => {
                  if (!employeeId) return;
                  const targetId = encodeURIComponent(employeeId);
                  window.location.href = `/employee/transfer?employeeId=${targetId}`;
                }}
              >
                <Award className="w-5 h-5" />
                Initiate Transfer
              </Button>
              <Button
                className="h-20 text-lg gap-2"
                onClick={() => {
                  if (!employeeId) return;
                  const targetId = encodeURIComponent(employeeId);
                  window.location.href = `/employee/promotions?employeeId=${targetId}`;
                }}
              >
                <Award className="w-5 h-5" />
                Initiate Promotion
              </Button>
              <Button
                className="h-20 text-lg gap-2"
                onClick={() => {
                  if (!employeeId) return;
                  const targetId = encodeURIComponent(employeeId);
                  window.location.href = `/employee/disciplinary?employeeId=${targetId}`;
                }}
              >
                <AlertCircle className="w-5 h-5" />
                Add Disciplinary Record
              </Button>
              <Button
                className="h-20 text-lg gap-2"
                onClick={() => {
                  if (!employeeId) return;
                  const targetId = encodeURIComponent(employeeId);
                  window.location.href = `/employee/training?employeeId=${targetId}`;
                }}
              >
                <BookOpen className="w-5 h-5" />
                Assign Training
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit employee</DialogTitle>
              <DialogDescription>
                Update core employment details. Changes apply after you save.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-firstName">First name *</Label>
                  <Input
                    id="edit-firstName"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lastName">Last name *</Label>
                  <Input
                    id="edit-lastName"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone *</Label>
                  <Input
                    id="edit-phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-dob">Date of birth *</Label>
                  <Input
                    id="edit-dob"
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Gender *</Label>
                  <Select
                    value={editForm.gender}
                    onValueChange={(value) => setEditForm({ ...editForm, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Marital status</Label>
                  <Select
                    value={editForm.maritalStatus || '__none__'}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, maritalStatus: value === '__none__' ? '' : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Not specified" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not specified</SelectItem>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department *</Label>
                  <Select
                    value={editForm.department}
                    onValueChange={(value) => setEditForm({ ...editForm, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept._id || dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Designation *</Label>
                  <Select
                    value={editFormDesignationId || undefined}
                    onValueChange={handleEditDesignationChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation">
                        {editFormDesignationId
                          ? editFormDesignationLabel || editFormDesignationId
                          : 'Select designation'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map((desig: any) => (
                        <SelectItem key={desig._id || desig.id} value={String(desig._id || desig.id)}>
                          {desig.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location *</Label>
                  <Select
                    value={editForm.location}
                    onValueChange={(value) => setEditForm({ ...editForm, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc: any) => (
                        <SelectItem key={loc._id || loc.id} value={String(loc._id || loc.id)}>
                          {loc.name}
                          {loc.state ? ` (${loc.state})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Grade</Label>
                  <Select
                    value={editForm.grade || '__none__'}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, grade: value === '__none__' ? '' : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Not specified" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not specified</SelectItem>
                      {grades.map((g: any) => (
                        <SelectItem key={g._id || g.id} value={String(g._id || g.id)}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status *</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-join">Join date *</Label>
                  <Input
                    id="edit-join"
                    type="date"
                    value={editForm.joinDate}
                    onChange={(e) => setEditForm({ ...editForm, joinDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Employment type</Label>
                  <Select
                    value={editForm.employmentType}
                    onValueChange={(value) => setEditForm({ ...editForm, employmentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Probation">Probation</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-salary">Monthly salary *</Label>
                  <Input
                    id="edit-salary"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editForm.salary}
                    onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-ctc">Annual CTC *</Label>
                  <Input
                    id="edit-ctc"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editForm.ctc}
                    onChange={(e) => setEditForm({ ...editForm, ctc: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  disabled={editSaving}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={() => void saveEmployeeEdit()} disabled={editSaving}>
                  {editSaving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
