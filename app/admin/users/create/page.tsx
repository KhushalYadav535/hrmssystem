'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Save, X, User, Mail, Phone, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateUserPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    location: '',
    managerId: '',
    roles: [] as string[],
    sendCredentials: true,
    requirePasswordChange: true,
  });

  if (!isAuthenticated || !hasPermission('manage_users')) {
    redirect('/dashboard');
  }

  const roles = [
    { id: 'ROLE-EMP', name: 'Employee' },
    { id: 'ROLE-MGR', name: 'Manager' },
    { id: 'ROLE-HR', name: 'HR Administrator' },
    { id: 'ROLE-PAYROLL', name: 'Payroll Administrator' },
    { id: 'ROLE-FIN', name: 'Finance Administrator' },
    { id: 'ROLE-ADMIN', name: 'System Administrator' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(r => r !== roleId)
        : [...prev.roles, roleId],
    }));
  };

  const handleSubmit = () => {
    if (!formData.employeeId || !formData.email || !formData.roles.length) {
      toast.error('Please fill all required fields');
      return;
    }

    // Generate username
    const username = `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`;
    
    toast.success(`User account created! Username: ${username}`);
    // In production, this would call API
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create User Account</h1>
          <p className="text-muted-foreground mt-2">Create a new user account for an employee</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
            <CardDescription>Basic employee details for account creation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID <span className="text-red-500">*</span></Label>
                <Input
                  id="employeeId"
                  placeholder="IB123456"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Auto-generated Username</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-mono">
                    {formData.firstName && formData.lastName
                      ? `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`
                      : 'username will be generated'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation <span className="text-red-500">*</span></Label>
                <Select value={formData.designation} onValueChange={(value) => handleInputChange('designation', value)}>
                  <SelectTrigger id="designation">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="senior-analyst">Senior Analyst</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chennai">Chennai</SelectItem>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerId">Reporting Manager</Label>
                <Select value={formData.managerId} onValueChange={(value) => handleInputChange('managerId', value)}>
                  <SelectTrigger id="managerId">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mgr-001">Suresh Kumar</SelectItem>
                    <SelectItem value="mgr-002">Priya Desai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Role Assignment</CardTitle>
            <CardDescription>Assign one or more roles to the user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50">
                  <Checkbox
                    id={role.id}
                    checked={formData.roles.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <Label htmlFor={role.id} className="cursor-pointer flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{role.name}</span>
                      <Badge variant="outline" className="text-xs">{role.id}</Badge>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            {formData.roles.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Selected Roles:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.roles.map((roleId) => {
                    const role = roles.find(r => r.id === roleId);
                    return role ? (
                      <Badge key={roleId} className="bg-blue-600">{role.name}</Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Configure account creation options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendCredentials"
                checked={formData.sendCredentials}
                onCheckedChange={(checked) => handleInputChange('sendCredentials', checked)}
              />
              <Label htmlFor="sendCredentials" className="cursor-pointer">
                Send welcome email and SMS with login credentials
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requirePasswordChange"
                checked={formData.requirePasswordChange}
                onCheckedChange={(checked) => handleInputChange('requirePasswordChange', checked)}
              />
              <Label htmlFor="requirePasswordChange" className="cursor-pointer">
                Require password change on first login
              </Label>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-semibold mb-2">Account Creation Summary:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Username will be auto-generated: {formData.firstName && formData.lastName ? `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}` : 'firstname.lastname'}</li>
                <li>Temporary password will be generated (16 characters, complex)</li>
                {formData.sendCredentials && <li>Credentials will be sent via email and SMS</li>}
                {formData.requirePasswordChange && <li>User must change password on first login</li>}
                <li>Default role will be assigned based on designation</li>
                <li>Account status: Pending Activation</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSubmit} className="gap-2" size="lg">
            <UserPlus className="w-4 h-4" />
            Create User Account
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
