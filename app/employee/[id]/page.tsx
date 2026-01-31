'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/lib/mock-data';
import { User, FileText, MapPin, Award, BookOpen, AlertCircle, Download, Edit } from 'lucide-react';

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated || !hasPermission('manage_employees')) {
    redirect('/dashboard');
  }

  const employee = mockUsers.find(u => u.id === params.id) || mockUsers[0];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Profile</h1>
            <p className="text-muted-foreground mt-2">{employee.name} - {employee.designation}</p>
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
              <div className="text-2xl font-bold">{employee.id}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-600">Active</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employee.department}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Join Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employee.joinDate}</div>
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
                    <p className="text-lg font-semibold">{employee.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-lg font-semibold">{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-lg font-semibold">+91 98765 43210</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="text-lg font-semibold">15-Mar-1990</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="text-lg font-semibold">Male</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marital Status</p>
                    <p className="text-lg font-semibold">Married</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PAN</p>
                    <p className="text-lg font-semibold">AAAPK1234X</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Aadhaar</p>
                    <p className="text-lg font-semibold">XXXX XXXX 1234</p>
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
                      <p className="text-lg font-semibold">{employee.joinDate}</p>
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
                    <span className="font-bold">₹50,000</span>
                  </div>
                  <div className="flex justify-between p-3 bg-secondary/50 rounded">
                    <span className="font-medium">HRA</span>
                    <span className="font-bold">₹15,000</span>
                  </div>
                  <div className="flex justify-between p-3 bg-secondary/50 rounded">
                    <span className="font-medium">Conveyance</span>
                    <span className="font-bold">₹5,000</span>
                  </div>
                  <div className="flex justify-between p-3 bg-primary/10 rounded border border-primary/20">
                    <span className="font-bold">Total CTC</span>
                    <span className="font-bold text-primary">₹70,000/month</span>
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
