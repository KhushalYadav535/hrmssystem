'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiService from '@/lib/api';
import { Plus, Search, Edit2, Eye, FileText, MapPin, Banknote } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DocumentViewer from '@/components/document-viewer';
import { designationToIdString, formatDesignationLabel } from '@/lib/utils';

interface Employee {
  _id?: string;
  id?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: any;
  department: string;
  location: any;
  grade: any;
  status: string;
  [key: string]: any;
}

function employeeLocationId(employee: Employee): string {
  const loc = employee?.location;
  if (loc == null || loc === '') return '';
  if (typeof loc === 'string') return loc;
  if (typeof loc === 'object' && loc !== null && '_id' in loc) {
    const id = (loc as { _id: unknown })._id;
    return id != null ? String(id) : '';
  }
  return '';
}

export default function WorkforcePage() {
  const { isAuthenticated, hasPermission, currentUser, hasRole } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect pure employees (no Manager / HR / Auditor / Tenant Admin hat) from workforce management
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    const canUseWorkforceNav =
      hasRole('Tenant Admin') ||
      hasRole('HR Administrator') ||
      hasRole('Manager') ||
      hasRole('Auditor');
    if (hasRole('Employee') && !canUseWorkforceNav) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, currentUser, router, hasRole]);

  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  // Master data for dropdowns (Spec C1)
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [salaryStructures, setSalaryStructures] = useState<any[]>([]);

  const [isCreating, setIsCreating] = useState(false);
  const [editLocationId, setEditLocationId] = useState('');
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [payrollAssignEmployee, setPayrollAssignEmployee] = useState<Employee | null>(null);
  const [payrollSalary, setPayrollSalary] = useState('');
  const [payrollCtc, setPayrollCtc] = useState('');
  const [payrollSalaryStructureId, setPayrollSalaryStructureId] = useState('');
  const [isSavingPayroll, setIsSavingPayroll] = useState(false);
  const [employeeForm, setEmployeeForm] = useState<any>({
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
    salary: '',
    ctc: '',
    salaryStructure: '',
    reportingManager: '',
    secondLevelManager: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadEmployees();
      loadMasterData();
    }
  }, [isAuthenticated]);

  // Refresh data when page comes into focus
  useEffect(() => {
    const handleFocus = () => {
      loadEmployees();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadMasterData = async () => {
    try {
      // Load all master data in parallel
      const [deptRes, desigRes, locRes, gradeRes, structRes] = await Promise.all([
        apiService.getDepartments(),
        apiService.getActiveDesignations(),
        apiService.getActiveLocations(),
        apiService.getActiveGrades(),
        apiService.getSalaryStructures({ status: 'Active' }),
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
    } catch (error: any) {
      console.error('Failed to load master data:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;

      const response = await apiService.getEmployees(params);

      if (response.success && response.data) {
        const employeesList = Array.isArray(response.data) ? response.data : [];
        const normalizedEmployees = employeesList.map((emp: any) => {
          const employeeId = emp._id ? (typeof emp._id === 'string' ? emp._id : emp._id.toString()) : (emp.id || null);
          return {
            ...emp,
            _id: employeeId,
            id: employeeId,
            employeeCode: emp.employeeCode || emp.employee_code || '',
          };
        });
        setEmployees(normalizedEmployees);
      } else {
        toast.error(response.message || 'Failed to load employees');
      }
    } catch (error: any) {
      toast.error('Failed to load employees: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => { loadEmployees(); }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  if (!isAuthenticated) redirect('/login');
  if (!hasPermission('manage_employees') && !hasPermission('view_profile') && !hasPermission('view_employee_data')) {
    redirect('/dashboard');
  }

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // BR-C1-14: Auto-fill Grade from Designation mapping
  const handleDesignationChange = (designationId: string) => {
    setEmployeeForm(prev => ({ ...prev, designation: designationId }));

    // Find the selected designation and check for default grade mapping
    const selectedDesig = designations.find((d: any) => (d._id || d.id) === designationId);
    if (selectedDesig?.defaultGradeId) {
      const gradeId = typeof selectedDesig.defaultGradeId === 'object'
        ? selectedDesig.defaultGradeId._id || selectedDesig.defaultGradeId
        : selectedDesig.defaultGradeId;
      setEmployeeForm(prev => ({ ...prev, designation: designationId, grade: gradeId }));
      toast.info('Grade auto-filled from Designation mapping');
    }
  };

  const addFormDesignationId = designationToIdString(employeeForm.designation);
  const addFormDesignationLabel =
    addFormDesignationId
      ? designations.find((d: any) => String(d._id || d.id) === addFormDesignationId)?.name ||
        formatDesignationLabel(employeeForm.designation)
      : '';

  // Helper to display designation name (API may send { _id, name } or a legacy ObjectId string)
  const getDesignationName = (designation: any) => {
    if (!designation) return 'Not specified';
    if (typeof designation === 'object' && typeof designation.name === 'string' && designation.name) {
      return designation.name;
    }
    const idStr =
      typeof designation === 'object' && designation?._id != null
        ? String(designation._id)
        : typeof designation === 'string'
          ? designation
          : '';
    const fromMaster =
      idStr && designations.find((d) => String(d._id || d.id) === idStr);
    if (fromMaster?.name) return fromMaster.name;
    if (typeof designation === 'string' && !/^[a-fA-F0-9]{24}$/.test(designation)) return designation;
    const label = formatDesignationLabel(designation);
    return label || 'Not specified';
  };

  // Helper to display location name
  const getLocationName = (location: any) => {
    if (!location) return 'Not specified';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') return location.name || location.toString();
    return String(location);
  };

  // Helper to display grade name
  const getGradeName = (grade: any) => {
    if (!grade) return '';
    if (typeof grade === 'string') return grade;
    if (typeof grade === 'object') return grade.name || grade.toString();
    return String(grade);
  };

  const handleViewEmployee = (employee: Employee) => {
    const empId = employee._id || employee.id || undefined;
    const normalizedEmployee = {
      ...employee,
      _id: empId,
      id: empId,
    };
    setSelectedEmployee(normalizedEmployee);
    setShowEditDialog(false);
    setShowViewDialog(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    const empId = employee._id || employee.id || undefined;
    const normalizedEmployee = {
      ...employee,
      _id: empId,
      id: empId,
    };
    setSelectedEmployee(normalizedEmployee);
    setEditLocationId(employeeLocationId(normalizedEmployee));
    setShowEditDialog(true);
  };

  const handleOpenPayrollAssign = (employee: Employee) => {
    const empId = employee._id || employee.id;
    const normalized = {
      ...employee,
      _id: empId,
      id: empId,
    };
    setPayrollAssignEmployee(normalized);
    setPayrollSalary(
      employee.salary != null && employee.salary !== '' ? String(employee.salary) : ''
    );
    setPayrollCtc(employee.ctc != null && employee.ctc !== '' ? String(employee.ctc) : '');
    const rawStruct = (employee as any).salaryStructure;
    const structId =
      rawStruct && typeof rawStruct === 'object' && '_id' in rawStruct
        ? String((rawStruct as { _id: unknown })._id)
        : rawStruct != null && rawStruct !== ''
          ? String(rawStruct)
          : '';
    setPayrollSalaryStructureId(structId);
    setShowPayrollDialog(true);
  };

  const handleSavePayrollAssignment = async () => {
    if (!payrollAssignEmployee) return;
    const employeeId = payrollAssignEmployee._id || payrollAssignEmployee.id;
    if (!employeeId) {
      toast.error('Employee ID not found. Please refresh the page.');
      return;
    }
    const salary = parseFloat(payrollSalary);
    const ctcParsed = parseFloat(payrollCtc);
    if (Number.isNaN(salary) || salary <= 0 || Number.isNaN(ctcParsed) || ctcParsed <= 0) {
      toast.error('Enter valid monthly salary and annual CTC (both must be greater than 0).');
      return;
    }
    setIsSavingPayroll(true);
    try {
      const response = await apiService.updateEmployee(employeeId, {
        salary,
        ctc: ctcParsed,
        salaryStructure: payrollSalaryStructureId || undefined,
      });
      if (response.success) {
        toast.success('Payroll details (salary & CTC) saved on employee record');
        setShowPayrollDialog(false);
        setPayrollAssignEmployee(null);
        setPayrollSalaryStructureId('');
        await loadEmployees();
      } else {
        toast.error((response as { message?: string }).message || 'Failed to update payroll details');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update payroll details';
      toast.error(message);
    } finally {
      setIsSavingPayroll(false);
    }
  };

  const handleSaveLocationAssignment = async () => {
    if (!selectedEmployee) return;
    const employeeId = selectedEmployee._id || selectedEmployee.id;
    if (!employeeId) {
      toast.error('Employee ID not found. Please refresh the page.');
      return;
    }
    if (!editLocationId) {
      toast.error('Please select a location');
      return;
    }
    setIsSavingLocation(true);
    try {
      const response = await apiService.updateEmployee(employeeId, { location: editLocationId });
      if (response.success) {
        toast.success('Employee location updated');
        setShowEditDialog(false);
        await loadEmployees();
      } else {
        toast.error((response as { message?: string }).message || 'Failed to update location');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update location';
      toast.error(message);
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handleCreateEmployee = async () => {
    if (!employeeForm.firstName || !employeeForm.lastName || !employeeForm.email ||
      !employeeForm.password || !employeeForm.phone || !employeeForm.department || !employeeForm.designation ||
      !employeeForm.employeeCode || !employeeForm.dateOfBirth || !employeeForm.joinDate ||
      !employeeForm.location || !employeeForm.salary || !employeeForm.ctc) {
      toast.error('Please fill all required fields');
      return;
    }

    if (employeeForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsCreating(true);
    try {
      const employeeData = {
        employeeCode: employeeForm.employeeCode.trim(),
        firstName: employeeForm.firstName.trim(),
        lastName: employeeForm.lastName.trim(),
        email: employeeForm.email.trim().toLowerCase(),
        password: employeeForm.password,
        phone: employeeForm.phone.trim(),
        dateOfBirth: employeeForm.dateOfBirth,
        gender: employeeForm.gender,
        designation: employeeForm.designation,
        department: employeeForm.department.trim(),
        status: employeeForm.status,
        joinDate: employeeForm.joinDate,
        location: employeeForm.location,
        grade: employeeForm.grade || undefined,
        salary: parseFloat(employeeForm.salary),
        ctc: parseFloat(employeeForm.ctc),
        reportingManager: employeeForm.reportingManager && employeeForm.reportingManager !== 'none' ? employeeForm.reportingManager : undefined,
        secondLevelManager: employeeForm.secondLevelManager && employeeForm.secondLevelManager !== 'none' ? employeeForm.secondLevelManager : undefined,
      };

      const response = await apiService.createEmployee(employeeData);
      if (response.success) {
        toast.success('Employee created successfully!');
        setShowAddDialog(false);
        setEmployeeForm({
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
          salary: '',
          ctc: '',
          salaryStructure: '',
          reportingManager: '',
          secondLevelManager: '',
        });
        loadEmployees();
      } else {
        toast.error(response.message || 'Failed to create employee');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create employee');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workforce Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage employee records: locations (Location Master), and payroll inputs — monthly salary and annual CTC
              used when payroll is run.
            </p>
          </div>
          {hasPermission('manage_employees') && currentUser?.role !== 'Auditor' && (
            <Dialog
              open={showAddDialog}
              onOpenChange={(open) => {
                setShowAddDialog(open);
                if (open) {
                  setEmployeeForm((prev) => ({ ...prev, employeeCode: '' }));
                } else {
                  setEmployeeForm({
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
                    salary: '',
                    ctc: '',
                    salaryStructure: '',
                    reportingManager: '',
                    secondLevelManager: '',
                  });
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>Create a new employee record</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeCode">Employee Code *</Label>
                      <Input
                        id="employeeCode"
                        value={employeeForm.employeeCode}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, employeeCode: e.target.value })}
                        placeholder="Client reference / employee code (your format)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status *</Label>
                      <Select value={employeeForm.status} onValueChange={(value) => setEmployeeForm({ ...employeeForm, status: value })}>
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
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={employeeForm.firstName}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, firstName: e.target.value })}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={employeeForm.lastName}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, lastName: e.target.value })}
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={employeeForm.email}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={employeeForm.password}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                        placeholder="Enter password for login"
                        minLength={6}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={employeeForm.phone}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={employeeForm.dateOfBirth}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, dateOfBirth: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <Select value={employeeForm.gender} onValueChange={(value) => setEmployeeForm({ ...employeeForm, gender: value })}>
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
                      <Label htmlFor="department">Department *</Label>
                      <Select
                        value={employeeForm.department}
                        onValueChange={(value) => {
                          setEmployeeForm({ ...employeeForm, department: value });
                        }}
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department">
                            {employeeForm.department || 'Select department'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {departments.length > 0 ? (
                            departments.map((dept) => (
                              <SelectItem key={dept._id || dept.id} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no_departments" disabled>No departments available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reportingManager">Reporting Manager</Label>
                      <Select
                        value={employeeForm.reportingManager || undefined}
                        onValueChange={(value) => setEmployeeForm({ ...employeeForm, reportingManager: value })}
                      >
                        <SelectTrigger id="reportingManager">
                          <SelectValue placeholder="Select manager">
                            {employeeForm.reportingManager
                              ? employees.find((e) => (e._id || e.id) === employeeForm.reportingManager)?.firstName + ' ' + employees.find((e) => (e._id || e.id) === employeeForm.reportingManager)?.lastName
                              : 'Select manager'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {employees.map((emp: any) => (
                            <SelectItem key={emp._id || emp.id} value={emp._id || emp.id}>
                              {emp.firstName} {emp.lastName} {emp.employeeCode ? `(${emp.employeeCode})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="secondLevelManager">Second Level Manager</Label>
                      <Select
                        value={employeeForm.secondLevelManager || undefined}
                        onValueChange={(value) => setEmployeeForm({ ...employeeForm, secondLevelManager: value })}
                      >
                        <SelectTrigger id="secondLevelManager">
                          <SelectValue placeholder="Select 2nd level manager">
                            {employeeForm.secondLevelManager
                              ? employees.find((e) => (e._id || e.id) === employeeForm.secondLevelManager)?.firstName + ' ' + employees.find((e) => (e._id || e.id) === employeeForm.secondLevelManager)?.lastName
                              : 'Select manager'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {employees.map((emp: any) => (
                            <SelectItem key={emp._id || emp.id} value={emp._id || emp.id}>
                              {emp.firstName} {emp.lastName} {emp.employeeCode ? `(${emp.employeeCode})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Spec C1-01: Designation dropdown from Designation Master */}
                    <div>
                      <Label htmlFor="designation">Designation *</Label>
                      <Select
                        value={addFormDesignationId || undefined}
                        onValueChange={handleDesignationChange}
                      >
                        <SelectTrigger id="designation">
                          <SelectValue placeholder="Select designation">
                            {addFormDesignationId
                              ? addFormDesignationLabel || addFormDesignationId
                              : 'Select designation'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {designations.length > 0 ? (
                            designations.map((desig: any) => (
                              <SelectItem key={desig._id || desig.id} value={desig._id || desig.id}>
                                {desig.name} {desig.grade ? `(${desig.grade})` : ''}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no_designations" disabled>No designations available — add in Settings</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Populated from Designation Master
                      </p>
                    </div>
                    {/* Spec C1-02: Location dropdown from Location Master */}
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Select
                        value={employeeForm.location}
                        onValueChange={(value) => setEmployeeForm({ ...employeeForm, location: value })}
                      >
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Select location">
                            {employeeForm.location
                              ? locations.find((l: any) => (l._id || l.id) === employeeForm.location)?.name || employeeForm.location
                              : 'Select location'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {locations.length > 0 ? (
                            locations.map((loc: any) => (
                              <SelectItem key={loc._id || loc.id} value={loc._id || loc.id}>
                                {loc.name} {loc.state ? `(${loc.state})` : ''}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no_locations" disabled>No workplaces — add Branches under Org structure or Location Master</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Populated from Location Master
                      </p>
                    </div>
                    {/* Spec C1-03: Grade dropdown from Grade Master */}
                    <div>
                      <Label htmlFor="grade">Grade</Label>
                      <Select
                        value={employeeForm.grade}
                        onValueChange={(value) => setEmployeeForm({ ...employeeForm, grade: value })}
                      >
                        <SelectTrigger id="grade">
                          <SelectValue placeholder="Select grade">
                            {employeeForm.grade
                              ? grades.find((g: any) => (g._id || g.id) === employeeForm.grade)?.name || employeeForm.grade
                              : 'Select grade'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {grades.length > 0 ? (
                            grades.map((g: any) => (
                              <SelectItem key={g._id || g.id} value={g._id || g.id}>
                                {g.name} {g.level ? `(Level ${g.level})` : ''}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no_grades" disabled>No grades available — add in Settings</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Auto-fills from Designation if mapping exists
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="joinDate">Join Date *</Label>
                      <Input
                        id="joinDate"
                        type="date"
                        value={employeeForm.joinDate}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, joinDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="salary">Salary *</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={employeeForm.salary}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })}
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctc">CTC (Cost to Company) *</Label>
                      <Input
                        id="ctc"
                        type="number"
                        value={employeeForm.ctc}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, ctc: e.target.value })}
                        placeholder="600000"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateEmployee} disabled={isCreating} className="flex-1">
                      {isCreating ? 'Creating...' : 'Create Employee'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or employee code..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') loadEmployees();
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Employee Directory</CardTitle>
            <CardDescription>{filteredEmployees.length} employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold text-sm">Employee Code</th>
                    <th className="text-left p-3 font-semibold text-sm">Name</th>
                    <th className="text-left p-3 font-semibold text-sm">Designation</th>
                    <th className="text-left p-3 font-semibold text-sm">Department</th>
                    <th className="text-left p-3 font-semibold text-sm">Location</th>
                    <th className="text-left p-3 font-semibold text-sm">Grade</th>
                    <th className="text-left p-3 font-semibold text-sm">Status</th>
                    <th className="text-left p-3 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id || employee.id || employee.employeeCode} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="p-3 text-sm font-medium">{employee.employeeCode || 'N/A'}</td>
                      <td className="p-3 text-sm">
                        {employee.firstName} {employee.lastName}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{getDesignationName(employee.designation)}</td>
                      <td className="p-3 text-sm text-muted-foreground">{employee.department || 'Not specified'}</td>
                      <td className="p-3 text-sm text-muted-foreground">{getLocationName(employee.location)}</td>
                      <td className="p-3 text-sm text-muted-foreground">{getGradeName(employee.grade)}</td>
                      <td className="p-3 text-sm">
                        <Badge className={employee.status === 'Active' ? 'bg-green-100 text-green-700' : employee.status === 'Inactive' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>
                          {employee.status || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewEmployee(employee)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {hasPermission('manage_employees') && currentUser?.role !== 'Auditor' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Assign to location"
                                onClick={() => handleEditEmployee(employee)}
                              >
                                <MapPin className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Assign payroll (salary & CTC)"
                                onClick={() => handleOpenPayrollAssign(employee)}
                              >
                                <Banknote className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Full profile"
                                onClick={() => {
                                  const id = employee._id || employee.id;
                                  if (!id) {
                                    toast.error('Employee ID not found.');
                                    return;
                                  }
                                  window.location.href = `/employee/${encodeURIComponent(id)}`;
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* View Employee Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
              <DialogDescription>{selectedEmployee?.firstName} {selectedEmployee?.lastName}</DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Employee Code</Label>
                    <p className="font-semibold">{selectedEmployee.employeeCode}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge className={selectedEmployee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {selectedEmployee.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Designation</Label>
                    <p>{getDesignationName(selectedEmployee.designation)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p>{selectedEmployee.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <p>{getLocationName(selectedEmployee.location)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Grade</Label>
                    <p>{getGradeName(selectedEmployee.grade) || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p>{selectedEmployee.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Join Date</Label>
                    <p>
                      {selectedEmployee.joinDate
                        ? formatDateDDMMYYYY(selectedEmployee.joinDate): 'N/A'}
                    </p>
                  </div>
                  {(hasPermission('view_employee_salary') || hasPermission('manage_employees')) && (
                    <>
                      <div>
                        <Label className="text-muted-foreground">Monthly salary</Label>
                        <p className="font-medium">
                          {selectedEmployee.salary != null && selectedEmployee.salary !== ''
                            ? `₹${Number(selectedEmployee.salary).toLocaleString('en-IN')}`
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Annual CTC</Label>
                        <p className="font-medium">
                          {selectedEmployee.ctc != null && selectedEmployee.ctc !== ''
                            ? `₹${Number(selectedEmployee.ctc).toLocaleString('en-IN')}`
                            : '—'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                {selectedEmployee?.documents && selectedEmployee.documents.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Documents</h4>
                    <div className="space-y-2">
                      {selectedEmployee.documents.slice(0, 3).map((doc: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.size || 'N/A'} • {doc.uploadedDate ? formatDateDDMMYYYY(doc.uploadedDate) : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedDocument(doc);
                            setShowViewDialog(false);
                          }}>
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const employeeId = selectedEmployee._id || selectedEmployee.id;
                      if (!employeeId) {
                        toast.error('Employee ID not found. Please refresh the page.');
                        return;
                      }
                      window.location.href = `/employee/${encodeURIComponent(employeeId)}`;
                    }}
                    className="flex-1 min-w-[140px]"
                  >
                    View Full Profile
                  </Button>
                  {hasPermission('manage_employees') && currentUser?.role !== 'Auditor' && (
                    <>
                      <Button
                        onClick={() => {
                          setShowViewDialog(false);
                          handleEditEmployee(selectedEmployee);
                        }}
                        className="flex-1 min-w-[140px]"
                      >
                        Assign location
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowViewDialog(false);
                          handleOpenPayrollAssign(selectedEmployee);
                        }}
                        className="flex-1 min-w-[140px]"
                      >
                        Assign payroll
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Assign payroll — monthly salary & annual CTC on employee (HR Admin) */}
        <Dialog
          open={showPayrollDialog}
          onOpenChange={(open) => {
            setShowPayrollDialog(open);
            if (!open) {
              setPayrollAssignEmployee(null);
              setPayrollSalary('');
              setPayrollCtc('');
              setPayrollSalaryStructureId('');
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign payroll</DialogTitle>
              <DialogDescription>
                {payrollAssignEmployee
                  ? `${payrollAssignEmployee.firstName} ${payrollAssignEmployee.lastName} · ${payrollAssignEmployee.employeeCode || '—'}`
                  : 'Set compensation used for payroll runs.'}
              </DialogDescription>
            </DialogHeader>
            {payrollAssignEmployee && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  These values are stored on the employee record. Payroll processing uses them to build payslips
                  (along with attendance and leave).
                </p>
                <div className="space-y-2">
                  <Label htmlFor="payroll-salary">Monthly salary *</Label>
                  <Input
                    id="payroll-salary"
                    type="number"
                    min={0}
                    step="0.01"
                    value={payrollSalary}
                    onChange={(e) => setPayrollSalary(e.target.value)}
                    placeholder="e.g., 50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payroll-ctc">Annual CTC *</Label>
                  <Input
                    id="payroll-ctc"
                    type="number"
                    min={0}
                    step="1"
                    value={payrollCtc}
                    onChange={(e) => setPayrollCtc(e.target.value)}
                    placeholder="e.g., 600000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payroll-structure">Salary structure (template)</Label>
                  <Select
                    value={payrollSalaryStructureId || '__none__'}
                    onValueChange={(value) =>
                      setPayrollSalaryStructureId(value === '__none__' ? '' : value)
                    }
                  >
                    <SelectTrigger id="payroll-structure">
                      <SelectValue placeholder="Select template">
                        {payrollSalaryStructureId
                          ? salaryStructures.find(
                              (s: any) => String(s._id || s.id) === payrollSalaryStructureId,
                            )?.name || 'Selected'
                          : 'Optional — link payslip breakdown template'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {salaryStructures.length > 0 ? (
                        salaryStructures.map((struct: any) => (
                          <SelectItem
                            key={String(struct._id || struct.id)}
                            value={String(struct._id || struct.id)}
                          >
                            {struct.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__no_structures" disabled>
                          No active salary structures found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={() => void handleSavePayrollAssignment()} disabled={isSavingPayroll}>
                    {isSavingPayroll ? 'Saving…' : 'Save payroll details'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const id = payrollAssignEmployee._id || payrollAssignEmployee.id;
                      if (!id) return;
                      window.location.href = `/employee/${encodeURIComponent(id)}`;
                    }}
                  >
                    Open full employee profile
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Assign location (HR Admin) — uses Location Master */}
        <Dialog
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) setEditLocationId('');
            if (open) void loadMasterData();
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign to location</DialogTitle>
              <DialogDescription>
                {selectedEmployee
                  ? `${selectedEmployee.firstName} ${selectedEmployee.lastName} · ${selectedEmployee.employeeCode || '—'}`
                  : 'Select an employee from the directory.'}
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Current location: </span>
                  <span className="font-medium">{getLocationName(selectedEmployee.location)}</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assign-location">Location *</Label>
                  <Select value={editLocationId} onValueChange={setEditLocationId}>
                    <SelectTrigger id="assign-location">
                      <SelectValue placeholder="Select location">
                        {editLocationId
                          ? locations.find((l: any) => String(l._id || l.id) === editLocationId)?.name ||
                            'Selected'
                          : 'Select location'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {locations.length > 0 ? (
                        locations.map((loc: any) => (
                          <SelectItem key={loc._id || loc.id} value={String(loc._id || loc.id)}>
                            {loc.name}
                            {loc.state ? ` (${loc.state})` : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="_none" disabled>
                          No workplaces — add Branches (or HO/ZO/RO) under Settings → Org structure, or use Location Master
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    List includes Location Master entries and active HO / Zone / Region / Branch units from Org structure.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={() => void handleSaveLocationAssignment()} disabled={isSavingLocation}>
                    {isSavingLocation ? 'Saving…' : 'Save location'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const employeeId = selectedEmployee._id || selectedEmployee.id;
                      if (!employeeId) {
                        toast.error('Employee ID not found.');
                        return;
                      }
                      window.location.href = `/employee/${encodeURIComponent(employeeId)}`;
                    }}
                  >
                    Open full employee profile
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Document Viewer */}
        <DocumentViewer
          open={!!selectedDocument}
          onOpenChange={(open) => {
            if (!open) setSelectedDocument(null);
          }}
          document={selectedDocument}
        />
      </div>
    </DashboardLayout>
  );
}
