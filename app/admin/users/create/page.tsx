'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, CheckCircle2, X } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CreateUserPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    department: '',
    designation: '',
    joinDate: new Date().toISOString().split('T')[0],
    employmentType: 'Permanent',
    reportingManager: '',
    location: '',
    salary: '',
    ctc: '',
    bank: '',
    accountNumber: '',
    status: 'Active',
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadDepartments();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !hasPermission('manage_users')) {
    redirect('/dashboard');
  }

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

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const steps = [
    { number: 1, title: 'Personal Info' },
    { number: 2, title: 'Job Details' },
    { number: 3, title: 'Compensation' },
    { number: 4, title: 'Review' },
  ];

  const handleCreateEmployee = async () => {
    // Final validation
    if (!formData.employeeCode || !formData.firstName || !formData.lastName || !formData.email || 
        !formData.password || !formData.phone || !formData.department || !formData.designation ||
        !formData.dateOfBirth || !formData.joinDate || !formData.location ||
        !formData.salary || !formData.ctc) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!formData.department) {
      toast.error('Please select a department');
      return;
    }

    setIsCreating(true);
    try {
      const employeeData = {
        employeeCode: formData.employeeCode.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        designation: formData.designation.trim(),
        department: formData.department.trim(),
        status: formData.status,
        joinDate: formData.joinDate,
        location: formData.location.trim(),
        salary: parseFloat(formData.salary),
        ctc: parseFloat(formData.ctc),
        bankAccount: formData.accountNumber || undefined,
        ifscCode: formData.bank || undefined,
      };

      const response = await apiService.createEmployee(employeeData);
      if (response.success) {
        toast.success('Employee and User account created successfully! Both records are now available in Employee and User sections.');
        router.push('/admin/users');
        router.refresh();
      } else {
        const errorMsg = response.message || response.error || 'Failed to create employee';
        toast.error(errorMsg);
        console.error('Create employee error:', response);
      }
    } catch (error: any) {
      const errorMsg = error.message || error.error || 'Failed to create employee';
      toast.error(errorMsg);
      console.error('Create employee exception:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Employee</h1>
          <p className="text-muted-foreground mt-2">Create a new employee record with login access. This will create both employee record and user account.</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {steps.map((step) => (
            <div
              key={step.number}
              onClick={() => setCurrentStep(step.number)}
              className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                currentStep === step.number
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : currentStep > step.number
                  ? 'bg-green-500/20 text-green-700 border border-green-500'
                  : 'bg-card border border-border hover:border-accent'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                currentStep === step.number
                  ? 'bg-primary-foreground text-primary'
                  : currentStep > step.number
                  ? 'bg-green-500 text-white'
                  : 'bg-muted'
              }`}>
                {currentStep > step.number ? <CheckCircle2 className="w-5 h-5" /> : step.number}
              </div>
              <span className="font-medium whitespace-nowrap">{step.title}</span>
              {step.number < steps.length && (
                <ArrowRight className={`w-4 h-4 ${
                  currentStep > step.number ? 'text-green-500' : 'text-muted-foreground'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeCode">Employee Code *</Label>
                    <Input
                      id="employeeCode"
                      name="employeeCode"
                      value={formData.employeeCode}
                      onChange={handleInputChange}
                      placeholder="IB123456"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="employee@company.com"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password for login"
                      className="mt-2"
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
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
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.length > 0 ? (
                          departments.map((dept) => (
                            <SelectItem key={dept._id || dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">No departments available</div>
                        )}
                      </SelectContent>
                    </Select>
                    {formData.department && (
                      <p className="text-xs text-muted-foreground mt-1">Selected: {formData.department}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="designation">Designation *</Label>
                    <Input
                      id="designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="e.g., Senior Accountant"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="joinDate">Joining Date *</Label>
                    <Input
                      id="joinDate"
                      name="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Select 
                      value={formData.employmentType} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, employmentType: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Permanent">Permanent</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
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
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salary">Monthly Salary *</Label>
                    <Input
                      id="salary"
                      name="salary"
                      type="number"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="50000"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ctc">CTC (Cost to Company) *</Label>
                    <Input
                      id="ctc"
                      name="ctc"
                      type="number"
                      value={formData.ctc}
                      onChange={handleInputChange}
                      placeholder="600000"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank">Bank Name</Label>
                    <Input
                      id="bank"
                      name="bank"
                      value={formData.bank}
                      onChange={handleInputChange}
                      placeholder="Bank name"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Bank Account Number</Label>
                    <Input
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      placeholder="Account number"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-secondary/50 p-6 rounded-lg space-y-3">
                  <h3 className="font-semibold text-foreground">Review Employee Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Employee Code</p>
                      <p className="font-medium">{formData.employeeCode || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Password</p>
                      <p className="font-medium">{formData.password ? '••••••••' : 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{formData.phone || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-medium">{formData.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Designation</p>
                      <p className="font-medium">{formData.designation || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{formData.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Salary</p>
                      <p className="font-medium">₹{formData.salary || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CTC</p>
                      <p className="font-medium">₹{formData.ctc || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep > 1) {
                    setCurrentStep(currentStep - 1);
                  } else {
                    router.back();
                  }
                }}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </Button>
              {currentStep < steps.length ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)} className="gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleCreateEmployee} disabled={isCreating} className="gap-2">
                  {isCreating ? 'Creating...' : 'Create Employee & User Account'}
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
