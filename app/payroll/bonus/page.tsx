'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Download } from 'lucide-react';

export default function BonusIncentivePage() {
  const [bonuses, setBonuses] = useState([
    { id: 1, name: 'Annual Bonus', amount: 50000, percentage: 5, month: 'March', status: 'Pending' },
    { id: 2, name: 'Performance Bonus', amount: 25000, percentage: 2.5, month: 'June', status: 'Approved' },
    { id: 3, name: 'Festival Bonus', amount: 30000, percentage: 3, month: 'December', status: 'Pending' },
  ]);

  const statusColors: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bonus & Incentive Management</h1>
            <p className="text-muted-foreground mt-2">Create and manage employee bonuses and incentives</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Bonus
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Bonuses</p>
              <p className="text-3xl font-bold text-foreground">₹1,05,000</p>
              <p className="text-xs text-green-600 mt-2">10.5% of base salary</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-600">2</p>
              <p className="text-xs text-muted-foreground mt-2">₹80,000 total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Average per Employee</p>
              <p className="text-3xl font-bold text-blue-600">₹35,000</p>
              <p className="text-xs text-muted-foreground mt-2">Across 3 bonuses</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bonus Schedule</CardTitle>
            <CardDescription>Annual bonus plan for all employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bonuses.map((bonus) => (
                <div key={bonus.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{bonus.name}</h4>
                        <p className="text-xs text-muted-foreground">Due: {bonus.month}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-foreground">₹{bonus.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{bonus.percentage}% of salary</p>
                  </div>
                  <Badge className={statusColors[bonus.status]}>{bonus.status}</Badge>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="ghost"><Edit2 className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4 text-red-600" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incentive Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Sales Target Achievement', criteria: 'Monthly sales > ₹10L', amount: '5% commission' },
                { name: 'Quality Excellence', criteria: 'Zero defects', amount: '₹5,000' },
                { name: 'Attendance Excellence', criteria: '100% attendance', amount: '₹2,500' },
                { name: 'Customer Satisfaction', criteria: 'Rating > 4.5', amount: '₹3,000' },
              ].map((program, idx) => (
                <Card key={idx} className="border-l-4 border-l-accent">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-foreground mb-2">{program.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Criteria</p>
                        <p className="font-medium">{program.criteria}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reward</p>
                        <p className="font-bold text-green-600">{program.amount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" /> Export Report
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">Approve All</Button>
            <Button variant="outline" className="gap-2 bg-transparent">Generate Payroll Entries</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
