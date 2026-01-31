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

export default function HousePropertyPage() {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);

  if (!isAuthenticated) redirect('/login');

  const properties = [
    {
      id: 1,
      address: 'Mumbai, Maharashtra',
      type: 'Self-Occupied',
      value: 5000000,
      sanctionedValue: 4500000,
      standardDeduction: 30000,
      interestPaid: 200000,
      deductionAllowed: 200000,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">House Property Income</h1>
            <p className="text-muted-foreground mt-2">Manage property details for tax exemption under Section 24</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Property
          </Button>
        </div>

        {showForm && (
          <Card className="border-accent/50">
            <CardHeader>
              <CardTitle>Add House Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Property Address</Label>
                  <Input placeholder="Enter complete property address" />
                </div>
                <div>
                  <Label>Property Type</Label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-card">
                    <option>Self-Occupied</option>
                    <option>Let Out</option>
                    <option>Deemed Let Out</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Market Value (as on 1st April)</Label>
                  <Input type="number" placeholder="5000000" />
                </div>
                <div>
                  <Label>Sanctioned Value</Label>
                  <Input type="number" placeholder="4500000" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Interest Paid (Loan)</Label>
                  <Input type="number" placeholder="200000" />
                </div>
                <div>
                  <Label>Property Tax Paid</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">Add Property</Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{property.address}</h3>
                    <Badge className="mt-2">{property.type}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Edit2 className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Market Value</p>
                    <p className="text-lg font-bold">₹{property.value.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Sanctioned Value</p>
                    <p className="text-lg font-bold">₹{property.sanctionedValue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Interest Paid</p>
                    <p className="text-lg font-bold">₹{property.interestPaid.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">Tax Deduction Allowed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-500 mt-2">₹{property.deductionAllowed.toLocaleString()}</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-2">Standard deduction of ₹30,000 + Interest on loan</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
