'use client';

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
import { Plus, Search, Edit2, Eye, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DocumentViewer from '@/components/document-viewer';

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
  [key: string]: any;
}

export default function PersonnelPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    designation: '',
    department: '',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0],
    location: '',
    salary: '',
    ctc: '',
  });

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      if (response.success && response.data) {
        setDepartments(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      
      const response = await apiService.getEmployees(params);
      if (response.success && response.data) {
        setEmployees(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        loadEmployees();
      } else {
        loadEmployees();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  if (!isAuthenticated) {
    redirect('/login');
  }

  // Allow access for: managers, HR admins, auditors (view only), and employees (own profile)
  if (!hasPermission('manage_employees') && !hasPermission('view_profile') && !hasPermission('view_employee_data')) {
    redirect('/dashboard');
  }

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowViewDialog(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditDialog(true);
  };

  const handleViewDocument = (doc: any) => {
    // Document viewer will handle the display
    setSelectedDocument(doc);
  };

  const handleCreateEmployee = async () => {
    // Validate required fields
    if (!employeeForm.firstName || !employeeForm.lastName || !employeeForm.email || 
        !employeeForm.phone || !employeeForm.department || !employeeForm.designation ||
        !employeeForm.employeeCode || !employeeForm.dateOfBirth || !employeeForm.joinDate ||
        !employeeForm.location || !employeeForm.salary || !employeeForm.ctc) {
      toast.error('Please fill all required fields');
      console.log('Form validation failed:', employeeForm);
      return;
    }

    if (!employeeForm.department) {
      toast.error('Please select a department');
      return;
    }

    setIsCreating(true);
    try {
      const employeeData = {
        employeeCode: employeeForm.employeeCode.trim(),
        firstName: employeeForm.firstName.trim(),
        lastName: employeeForm.lastName.trim(),
        email: employeeForm.email.trim().toLowerCase(),
        phone: employeeForm.phone.trim(),
        dateOfBirth: employeeForm.dateOfBirth,
        gender: employeeForm.gender,
        designation: employeeForm.designation.trim(),
        department: employeeForm.department.trim(),
        status: employeeForm.status,
        joinDate: employeeForm.joinDate,
        location: employeeForm.location.trim(),
        salary: parseFloat(employeeForm.salary),
        ctc: parseFloat(employeeForm.ctc),
      };

      console.log('Creating employee with data:', employeeData);

      const response = await apiService.createEmployee(employeeData);
      if (response.success) {
        toast.success('Employee created successfully!');
        setShowAddDialog(false);
        setEmployeeForm({
          employeeCode: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          gender: 'Male',
          designation: '',
          department: '',
          status: 'Active',
          joinDate: new Date().toISOString().split('T')[0],
          location: '',
          salary: '',
          ctc: '',
        });
        loadEmployees();
      } else {
        toast.error(response.message || 'Failed to create employee');
        console.error('Create employee error:', response);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create employee');
      console.error('Create employee exception:', error);
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
            <h1 className="text-3xl font-bold text-foreground">Personnel Information System</h1>
            <p className="text-muted-foreground mt-2">Manage employee records and information</p>
          </div>
          {hasPermission('manage_employees') && currentUser?.role !== 'Auditor' && (
            <Dialog 
              open={showAddDialog} 
              onOpenChange={(open) => {
                setShowAddDialog(open);
                if (!open) {
                  // Reset form when dialog closes
                  setEmployeeForm({
                    employeeCode: '',
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    dateOfBirth: '',
                    gender: 'Male',
                    designation: '',
                    department: '',
                    status: 'Active',
                    joinDate: new Date().toISOString().split('T')[0],
                    location: '',
                    salary: '',
                    ctc: '',
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
                        placeholder="EMP001"
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
                            <SelectItem value="" disabled>No departments available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {employeeForm.department && (
                        <p className="text-xs text-muted-foreground mt-1">Selected: {employeeForm.department}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="designation">Designation *</Label>
                      <Input
                        id="designation"
                        value={employeeForm.designation}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                        placeholder="Software Engineer"
                      />
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
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={employeeForm.location}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, location: e.target.value })}
                        placeholder="Mumbai"
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
                    if (e.key === 'Enter') {
                      loadEmployees();
                    }
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
                    <th className="text-left p-3 font-semibold text-sm">Status</th>
                    <th className="text-left p-3 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="p-3 text-sm font-medium">{employee.employeeCode}</td>
                      <td className="p-3 text-sm">
                        {employee.firstName} {employee.lastName}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{employee.designation || 'Not specified'}</td>
                      <td className="p-3 text-sm text-muted-foreground">{employee.department || 'Not specified'}</td>
                      <td className="p-3 text-sm">
                        <Badge className={employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {employee.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleViewEmployee(employee)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {hasPermission('manage_employees') && currentUser?.role !== 'Auditor' && (
                            <Button size="sm" variant="ghost" onClick={() => handleEditEmployee(employee)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
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
                    <p>{selectedEmployee.designation}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p>{selectedEmployee.department || 'Not specified'}</p>
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
                    <p>{selectedEmployee.joinDate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <p>{selectedEmployee.location}</p>
                  </div>
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
                                {doc.size || 'N/A'} • {doc.uploadedDate ? new Date(doc.uploadedDate).toLocaleDateString() : 'N/A'}
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
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => router.push(`/employee/${selectedEmployee._id || selectedEmployee.id}`)} className="flex-1">
                    View Full Profile
                  </Button>
                  {hasPermission('manage_employees') && currentUser?.role !== 'Auditor' && (
                    <Button onClick={() => {
                      setShowViewDialog(false);
                      handleEditEmployee(selectedEmployee);
                    }} className="flex-1">
                      Edit Employee
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Employee Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>Update employee information</DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Employee editing form would go here. For now, you can navigate to the employee page.
                </p>
                <Button onClick={() => router.push(`/employee/${selectedEmployee.id}`)} className="w-full">
                  Go to Employee Page
                </Button>
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
