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
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function DesignationManagementPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated || !hasPermission('manage_settings')) {
    redirect('/dashboard');
  }

  const designations = [
    { id: 1, name: 'CEO', grade: 'Executive', level: 10, employees: 1, salaryBand: '₹5,00,000 - ₹10,00,000', status: 'Active' },
    { id: 2, name: 'Manager', grade: 'Senior', level: 7, employees: 12, salaryBand: '₹80,000 - ₹1,50,000', status: 'Active' },
    { id: 3, name: 'Senior Executive', grade: 'Mid', level: 5, employees: 45, salaryBand: '₹50,000 - ₹80,000', status: 'Active' },
    { id: 4, name: 'Executive', grade: 'Entry', level: 3, employees: 120, salaryBand: '₹30,000 - ₹50,000', status: 'Active' },
    { id: 5, name: 'Trainee', grade: 'Entry', level: 1, employees: 85, salaryBand: '₹20,000 - ₹30,000', status: 'Active' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Designation Management</h1>
            <p className="text-muted-foreground mt-2">Manage designations and salary bands</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Designation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Designation</DialogTitle>
                <DialogDescription>Add a new designation to the organization</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Designation Name</Label>
                  <Input placeholder="e.g., Senior Manager" />
                </div>
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Input placeholder="e.g., A1" />
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Input type="number" placeholder="e.g., 5" />
                </div>
                <div className="space-y-2">
                  <Label>Min Salary</Label>
                  <Input type="number" placeholder="₹" />
                </div>
                <div className="space-y-2">
                  <Label>Max Salary</Label>
                  <Input type="number" placeholder="₹" />
                </div>
                <Button className="w-full">Create Designation</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Designations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{designations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Employees Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{designations.reduce((sum, d) => sum + d.employees, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{new Set(designations.map(d => d.grade)).size}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Level Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1-10</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Designations & Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {designations.map((desig) => (
                <div key={desig.id} className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{desig.name}</h3>
                        <Badge variant="outline">{desig.grade}</Badge>
                        <Badge className="bg-blue-600">L{desig.level}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{desig.salaryBand}</span>
                        <span>•</span>
                        <span>{desig.employees} employees</span>
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Career Progression Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-center">
              {['Trainee', 'Executive', 'Senior Executive', 'Manager', 'Senior Manager', 'Director', 'CEO'].map((role, idx) => (
                <div key={idx} className="flex-1">
                  <div className="p-3 bg-secondary/50 rounded text-sm font-medium">{role}</div>
                  {idx < 6 && <div className="text-2xl text-muted-foreground">→</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
