'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { designationToIdString, formatDesignationLabel } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const MAX_PHOTO_BYTES = 1_500_000;

export default function AddEmployeePage() {
  const { isAuthenticated, hasRole, hasPermission } = useAuth();
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    designation: '',
    department: '',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0],
    location: '',
    grade: '',
    reportingManager: '',
    secondLevelManager: '',
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const [d, des, loc, g, emp] = await Promise.all([
          apiService.getDepartments(),
          apiService.getDesignations(),
          apiService.getLocations(),
          apiService.getActiveGrades(),
          apiService.getEmployees(),
        ]);
        if (d.success && d.data) setDepartments(Array.isArray(d.data) ? d.data : []);
        if (des.success && des.data) setDesignations(Array.isArray(des.data) ? des.data : []);
        if (loc.success && loc.data) setLocations(Array.isArray(loc.data) ? loc.data : []);
        if (g.success && g.data) setGrades(Array.isArray(g.data) ? g.data : []);
        if (emp.success && emp.data) setEmployees(Array.isArray(emp.data) ? emp.data : []);
      } catch {
        toast.error('Failed to load master data');
      }
    })();
  }, [isAuthenticated]);

  if (!isAuthenticated) redirect('/login');
  if (!hasPermission('manage_employees') || !hasRole('HR Administrator')) {
    redirect('/dashboard');
  }

  const handleDesignationChange = (designationId: string) => {
    setForm((prev) => ({ ...prev, designation: designationId }));
    const selectedDesig = designations.find((d: any) => (d._id || d.id) === designationId);
    if (selectedDesig?.defaultGradeId) {
      const gradeId =
        typeof selectedDesig.defaultGradeId === 'object'
          ? selectedDesig.defaultGradeId._id || selectedDesig.defaultGradeId
          : selectedDesig.defaultGradeId;
      setForm((prev) => ({ ...prev, designation: designationId, grade: String(gradeId) }));
      toast.info('Grade auto-filled from designation mapping');
    }
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoPreview(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error('Image must be under ~1.5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      if (typeof r === 'string') setPhotoPreview(r);
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password ||
      !form.phone ||
      !form.department ||
      !form.designation ||
      !form.employeeCode ||
      !form.dateOfBirth ||
      !form.joinDate ||
      !form.location
    ) {
      toast.error('Please complete all required fields in Personal, Organization, and Employment tabs');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsCreating(true);
    try {
      const payload: Record<string, unknown> = {
        employeeCode: form.employeeCode.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        designation: form.designation,
        department: form.department.trim(),
        status: form.status,
        joinDate: form.joinDate,
        location: form.location,
        grade: form.grade || undefined,
        salary: 0,
        ctc: 0,
        reportingManager:
          form.reportingManager && form.reportingManager !== 'none' ? form.reportingManager : undefined,
        secondLevelManager:
          form.secondLevelManager && form.secondLevelManager !== 'none' ? form.secondLevelManager : undefined,
      };
      if (photoPreview) payload.photograph = photoPreview;

      const response = await apiService.createEmployee(payload);
      if (response.success) {
        toast.success('Employee created. Salary / CTC can be assigned by Payroll or Tenant Admin.');
        router.push('/workforce/employees');
        router.refresh();
      } else {
        toast.error((response as { message?: string }).message || 'Failed to create employee');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create employee');
    } finally {
      setIsCreating(false);
    }
  };

  const desigLabel = (() => {
    const id = designationToIdString(form.designation);
    if (!id) return '';
    return (
      designations.find((d: any) => String(d._id || d.id) === id)?.name ||
      formatDesignationLabel(form.designation)
    );
  })();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/workforce/employees">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to directory
            </Link>
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add employee</h1>
          <p className="text-muted-foreground mt-2">
            Four steps for HR onboarding. Department, designation, L1/L2 managers, location, and grade — no salary
            definition here; Payroll or Tenant Admin assigns compensation later.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New employee</CardTitle>
            <CardDescription>Fields marked * are required</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg bg-muted p-1 sm:grid-cols-4">
                <TabsTrigger value="personal" className="text-xs sm:text-sm">
                  Personal
                </TabsTrigger>
                <TabsTrigger value="organization" className="text-xs sm:text-sm">
                  Organization
                </TabsTrigger>
                <TabsTrigger value="employment" className="text-xs sm:text-sm">
                  Employment
                </TabsTrigger>
                <TabsTrigger value="review" className="text-xs sm:text-sm">
                  Review
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label>Photograph</Label>
                  <Input type="file" accept="image/*" onChange={onPhoto} className="max-w-md" />
                  {photoPreview && (
                    <img src={photoPreview} alt="Preview" className="mt-2 h-24 w-24 rounded-md object-cover border" />
                  )}
                  <p className="text-xs text-muted-foreground">Optional. Max ~1.5 MB. JPEG/PNG recommended.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Employee code *</Label>
                    <Input
                      className="mt-2"
                      value={form.employeeCode}
                      onChange={(e) => setForm((f) => ({ ...f, employeeCode: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Status *</Label>
                    <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                      <SelectTrigger className="mt-2">
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
                    <Label>First name *</Label>
                    <Input
                      className="mt-2"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Last name *</Label>
                    <Input
                      className="mt-2"
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      className="mt-2"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Password (login) *</Label>
                    <Input
                      className="mt-2"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input
                      className="mt-2"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Date of birth *</Label>
                    <Input
                      className="mt-2"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Gender *</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="organization" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Department *</Label>
                    <Select value={form.department} onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept: any) => (
                          <SelectItem key={dept._id || dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Designation *</Label>
                    <Select value={form.designation || undefined} onValueChange={handleDesignationChange}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select">{desigLabel || 'Select'}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map((d: any) => (
                          <SelectItem key={d._id || d.id} value={String(d._id || d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>L1 reporting manager</Label>
                    <Select
                      value={form.reportingManager || undefined}
                      onValueChange={(v) => setForm((f) => ({ ...f, reportingManager: v }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {employees.map((e: any) => (
                          <SelectItem key={e._id || e.id} value={String(e._id || e.id)}>
                            {e.firstName} {e.lastName} ({e.employeeCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>L2 reporting manager</Label>
                    <Select
                      value={form.secondLevelManager || undefined}
                      onValueChange={(v) => setForm((f) => ({ ...f, secondLevelManager: v }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {employees.map((e: any) => (
                          <SelectItem key={e._id || e.id} value={String(e._id || e.id)}>
                            {e.firstName} {e.lastName} ({e.employeeCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Location *</Label>
                    <Select value={form.location || undefined} onValueChange={(v) => setForm((f) => ({ ...f, location: v }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc: any) => (
                          <SelectItem key={loc._id || loc.id} value={String(loc._id || loc.id)}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Grade</Label>
                    <Select value={form.grade || undefined} onValueChange={(v) => setForm((f) => ({ ...f, grade: v }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((g: any) => (
                          <SelectItem key={g._id || g.id} value={String(g._id || g.id)}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="employment" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                  <div className="md:col-span-2">
                    <Label>Join date *</Label>
                    <Input
                      className="mt-2"
                      type="date"
                      value={form.joinDate}
                      onChange={(e) => setForm((f) => ({ ...f, joinDate: e.target.value }))}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Compensation is not captured on this screen. Use Assign payroll from the employee directory when
                  acting as Tenant Admin or Payroll Administrator.
                </p>
              </TabsContent>

              <TabsContent value="review" className="mt-6 space-y-6">
                <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
                  <p>
                    <span className="font-medium text-foreground">Name:</span> {form.firstName} {form.lastName}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Code / Email:</span> {form.employeeCode || '—'} ·{' '}
                    {form.email || '—'}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Department / Designation:</span> {form.department || '—'}{' '}
                    · {desigLabel || '—'}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Location / Join:</span>{' '}
                    {locations.find((l: any) => String(l._id || l.id) === form.location)?.name || '—'} ·{' '}
                    {form.joinDate || '—'}
                  </p>
                  <p className="text-muted-foreground">Salary / CTC: set later (not part of HR add flow)</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => void submit()} disabled={isCreating}>
                    {isCreating ? 'Creating…' : 'Create employee'}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/workforce/employees">Cancel</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
