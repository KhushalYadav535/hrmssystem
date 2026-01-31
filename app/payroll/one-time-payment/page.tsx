'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Download } from 'lucide-react';
import { useState } from 'react';

export default function OneTimePaymentPage() {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);

  if (!isAuthenticated) redirect('/login');

  const payments = [
    { id: 1, type: 'Ex-gratia', amount: 50000, employees: 15, month: 'February 2026', status: 'Approved' },
    { id: 2, type: 'Special Allowance', amount: 25000, employees: 285, month: 'January 2026', status: 'Paid' },
    { id: 3, type: 'Festival Bonus', amount: 30000, employees: 280, month: 'October 2025', status: 'Paid' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">One-Time Payments</h1>
            <p className="text-muted-foreground mt-2">Ex-gratia, special allowances, and ad-hoc payments</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Payment
          </Button>
        </div>

        {showForm && (
          <Card className="border-accent/50">
            <CardHeader>
              <CardTitle>Create One-Time Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Payment Type</Label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-card">
                    <option>Ex-gratia</option>
                    <option>Special Allowance</option>
                    <option>Festival Bonus</option>
                    <option>Award / Recognition</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <Label>Amount Per Employee</Label>
                  <Input type="number" placeholder="50000" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Payment Month</Label>
                  <Input type="month" />
                </div>
                <div>
                  <Label>Applicable To</Label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-card">
                    <option>All Employees</option>
                    <option>Specific Department</option>
                    <option>Specific Employees</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Reason / Description</Label>
                <textarea className="w-full px-3 py-2 border border-border rounded-lg bg-card" rows={3} placeholder="Enter reason for this payment" />
              </div>

              <div className="bg-secondary/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Outgo: <span className="text-lg font-bold text-foreground">₹14,25,00,000</span></p>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">Save & Submit</Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{payment.type}</h3>
                      <p className="text-sm text-muted-foreground">{payment.month}</p>
                    </div>
                    <Badge variant={payment.status === 'Paid' ? 'default' : 'secondary'}>{payment.status}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount Per Employee</p>
                      <p className="text-lg font-bold">₹{payment.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Employees Covered</p>
                      <p className="text-lg font-bold">{payment.employees}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="text-lg font-bold">₹{(payment.amount * payment.employees).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent"><Edit2 className="w-4 h-4 mr-2" />Edit</Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">View Details</Button>
                    {payment.status !== 'Paid' && <Button size="sm" variant="outline" className="flex-1 bg-transparent">Process</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
