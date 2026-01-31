'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DepartmentManagementPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated || !hasPermission('manage_settings')) {
    redirect('/dashboard');
  }

  const departments = [
    { id: 1, name: 'Finance', head: 'Deepa Gupta', employees: 45, costCenter: 'CC001', status: 'Active' },
    { id: 2, name: 'IT', head: 'Rajesh Verma', employees: 65, costCenter: 'CC002', status: 'Active' },
    { id: 3, name: 'HR', head: 'Priya Sharma', employees: 35, costCenter: 'CC003', status: 'Active' },
    { id: 4, name: 'Operations', head: 'Amit Patel', employees: 80, costCenter: 'CC004', status: 'Active' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Department Management</h1>
            <p className="text-muted-foreground mt-2">Create and manage organizational departments</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Department</DialogTitle>
                <DialogDescription>Add a new department to the organization</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Department Name</Label>
                  <Input placeholder="e.g., Sales" />
                </div>
                <div className="space-y-2">
                  <Label>Department Head</Label>
                  <Input placeholder="Select head" />
                </div>
                <div className="space-y-2">
                  <Label>Cost Center</Label>
                  <Input placeholder="e.g., CC005" />
                </div>
                <div className="space-y-2">
                  <Label>Parent Department (Optional)</Label>
                  <Input placeholder="Select parent" />
                </div>
                <Button className="w-full">Create Department</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{departments.reduce((sum, d) => sum + d.employees, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Employees/Dept</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(departments.reduce((sum, d) => sum + d.employees, 0) / departments.length)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{departments.filter(d => d.status === 'Active').length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.id} className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{dept.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Head: {dept.head}</Badge>
                        <Badge variant="outline">{dept.costCenter}</Badge>
                        <Badge className="bg-green-600">{dept.status}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{dept.employees}</p>
                      <p className="text-xs text-muted-foreground">employees</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
