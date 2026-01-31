'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Copy } from 'lucide-react';
import { useState } from 'react';

export default function SalaryStructurePage() {
  const { isAuthenticated } = useAuth();
  const [structures, setStructures] = useState([
    { id: 1, name: 'Senior Manager', basicSalary: 150000, deductions: 15000, allowances: 45000, netSalary: 180000, active: true },
    { id: 2, name: 'Manager', basicSalary: 100000, deductions: 10000, allowances: 30000, netSalary: 120000, active: true },
    { id: 3, name: 'Executive', basicSalary: 60000, deductions: 6000, allowances: 18000, netSalary: 72000, active: true },
  ]);
  const [showForm, setShowForm] = useState(false);

  if (!isAuthenticated) redirect('/login');

  const salaryComponents = [
    { component: 'Basic Salary', percentage: 40 },
    { component: 'House Rent Allowance', percentage: 20 },
    { component: 'Dearness Allowance', percentage: 15 },
    { component: 'Conveyance Allowance', percentage: 8 },
    { component: 'Medical Allowance', percentage: 5 },
    { component: 'Special Allowance', percentage: 12 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Salary Structure Builder</h1>
            <p className="text-muted-foreground mt-2">Create and manage salary structures with drag & drop components</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Structure
          </Button>
        </div>

        {showForm && (
          <Card className="border-accent/50">
            <CardHeader>
              <CardTitle>Create Salary Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Structure Name</Label>
                  <Input placeholder="e.g., Senior Manager" />
                </div>
                <div>
                  <Label>Base Salary</Label>
                  <Input type="number" placeholder="150000" />
                </div>
              </div>

              <div>
                <Label className="mb-4 block">Salary Components (Drag to reorder)</Label>
                <div className="space-y-2 bg-secondary/30 p-4 rounded-lg">
                  {salaryComponents.map((comp, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-card rounded border border-border/50 cursor-move hover:bg-secondary/50">
                      <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-xs font-bold">=</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{comp.component}</p>
                        <p className="text-xs text-muted-foreground">{comp.percentage}% of base salary</p>
                      </div>
                      <Input type="number" className="w-20" defaultValue={comp.percentage} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold text-foreground">₹2,25,000</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Deductions</p>
                    <p className="text-2xl font-bold text-red-600">₹15,000</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net Salary</p>
                    <p className="text-2xl font-bold text-green-600">₹2,10,000</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">Save Structure</Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {structures.map((structure) => (
            <Card key={structure.id} className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{structure.name}</h3>
                    <Badge variant={structure.active ? 'default' : 'outline'} className="mt-1">
                      {structure.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Edit2 className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline"><Copy className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" className="text-red-600 bg-transparent"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Basic Salary</p>
                    <p className="text-lg font-bold">₹{structure.basicSalary.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Allowances</p>
                    <p className="text-lg font-bold">₹{structure.allowances.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Deductions</p>
                    <p className="text-lg font-bold text-red-600">₹{structure.deductions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net Salary</p>
                    <p className="text-lg font-bold text-green-600">₹{structure.netSalary.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
