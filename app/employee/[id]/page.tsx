'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect, useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { User, FileText, MapPin, Award, BookOpen, AlertCircle, Download, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

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
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

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
      router.push('/personnel');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading employee with ID:', employeeId);
      const response = await apiService.getEmployee(employeeId);
      if (response.success && response.data) {
        setEmployee(response.data);
      } else {
        toast.error('Employee not found');
        router.push('/personnel');
      }
    } catch (error: any) {
      toast.error('Failed to load employee details');
      console.error('Load employee error:', error);
      console.error('Employee ID used:', employeeId);
      router.push('/personnel');
    } finally {
      setIsLoading(false);
    }
  };

  // Check permissions: Allow Tenant Admin, HR Admin, Manager, and users with manage_employees permission
  // Also allow users with view_profile or view_employee_data permissions
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

    // Allow Tenant Admin, HR Administrator, Manager, and users with appropriate permissions
    const allowedRoles = ['Tenant Admin', 'HR Administrator', 'Manager'];
    const hasRoleAccess = currentUser && allowedRoles.includes(currentUser.role);
    const hasPermissionAccess = hasPermission('manage_employees') || hasPermission('view_profile') || hasPermission('view_employee_data');
    
    // Only redirect if user definitely doesn't have access
    if (!hasRoleAccess && !hasPermissionAccess) {
      console.log('Access denied - redirecting to dashboard', {
        role: currentUser.role,
        hasRoleAccess,
        hasPermissionAccess,
        hasManageEmployees: hasPermission('manage_employees'),
        hasViewProfile: hasPermission('view_profile'),
        hasViewEmployeeData: hasPermission('view_employee_data'),
      });
      router.push('/dashboard');
    }
  }, [isAuthenticated, currentUser, hasPermission, router]);

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
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Profile</h1>
            <p className="text-muted-foreground mt-2">{fullName} - {employee.designation}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
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
              <div className="text-2xl font-bold">{formatDate(employee.joinDate)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
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
                    <p className="text-lg font-semibold">{formatDate(employee.dateOfBirth)}</p>
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
                    <p className="text-lg font-semibold">{employee.panNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Aadhaar</p>
                    <p className="text-lg font-semibold">{employee.aadhaarNumber ? `${employee.aadhaarNumber.substring(0, 4)} XXXX ${employee.aadhaarNumber.substring(8)}` : 'N/A'}</p>
                  </div>
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
                      <p className="text-lg font-semibold">{employee.designation}</p>
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
                      <p className="text-lg font-semibold">{formatDate(employee.joinDate)}</p>
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
            </div>
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
                <CardTitle>Employment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { date: '2023-01-15', event: 'Promoted to Senior Accountant', detail: 'Grade: A1' },
                    { date: '2022-06-01', event: 'Salary Revision', detail: 'Increment: 8%' },
                    { date: '2020-01-15', event: 'Joined Organization', detail: 'Designation: Accountant' }
                  ].map((item, idx) => (
                    <div key={idx} className="border-l-2 border-primary pl-4">
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                      <p className="font-semibold mt-1">{item.event}</p>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>
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
              <Button className="h-20 text-lg gap-2">
                <Award className="w-5 h-5" />
                Initiate Transfer
              </Button>
              <Button className="h-20 text-lg gap-2">
                <Award className="w-5 h-5" />
                Initiate Promotion
              </Button>
              <Button className="h-20 text-lg gap-2">
                <AlertCircle className="w-5 h-5" />
                Add Disciplinary Record
              </Button>
              <Button className="h-20 text-lg gap-2">
                <BookOpen className="w-5 h-5" />
                Assign Training
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
