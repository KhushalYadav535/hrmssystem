'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DependentsPage() {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);

  if (!isAuthenticated) redirect('/login');

  const dependents = [
    {
      id: 1,
      name: 'Spouse - Priya',
      relation: 'Spouse',
      dateOfBirth: '1990-03-15',
      income: 0,
      ageExemption: false,
    },
    {
      id: 2,
      name: 'Child 1 - Aaryan',
      relation: 'Child',
      dateOfBirth: '2015-06-10',
      income: 0,
      ageExemption: false,
    },
    {
      id: 3,
      name: 'Father - Rajesh',
      relation: 'Parent',
      dateOfBirth: '1950-01-20',
      income: 80000,
      ageExemption: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dependent Details</h1>
            <p className="text-muted-foreground mt-2">Manage dependent family members for tax deduction purposes</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Dependent
          </Button>
        </div>

        {showForm && (
          <Card className="border-accent/50">
            <CardHeader>
              <CardTitle>Add Dependent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input placeholder="Enter full name" />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-card">
                    <option>Spouse</option>
                    <option>Child</option>
                    <option>Parent</option>
                    <option>Sibling</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Annual Income</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="ageExemption" />
                <Label htmlFor="ageExemption" className="cursor-pointer">Senior Citizen (Age 60+)</Label>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">Add Dependent</Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {dependents.map((dependent) => {
            const age = new Date().getFullYear() - new Date(dependent.dateOfBirth).getFullYear();
            return (
              <Card key={dependent.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{dependent.name}</h3>
                      <p className="text-sm text-muted-foreground">Age: {age} years</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {dependent.ageExemption && <Badge variant="default">Senior Citizen</Badge>}
                      <Button size="sm" variant="outline"><Edit2 className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Relationship</p>
                      <p className="text-sm font-bold">{dependent.relation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date of Birth</p>
                      <p className="text-sm font-bold">{dependent.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Annual Income</p>
                      <p className="text-sm font-bold">₹{dependent.income.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deduction Eligible</p>
                      <Badge variant={dependent.income === 0 ? 'default' : 'outline'}>
                        {dependent.income === 0 ? 'Yes' : 'Limited'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
