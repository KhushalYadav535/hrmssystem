'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, DollarSign, FileText } from 'lucide-react';

export default function ExpenseApprovalsPage() {
  const [filterStatus, setFilterStatus] = useState('all');

  const expenseClaims = [
    {
      id: 'EXP-001',
      employeeName: 'Rajesh Kumar',
      employeeId: 'EMP-001',
      category: 'Travel',
      amount: 5400,
      currency: 'INR',
      date: '2026-02-01',
      description: 'Client meeting travel to Delhi',
      status: 'pending',
      attachments: 2,
    },
    {
      id: 'EXP-002',
      employeeName: 'Priya Sharma',
      employeeId: 'EMP-002',
      category: 'Meals',
      amount: 1200,
      currency: 'INR',
      date: '2026-02-02',
      description: 'Team lunch meeting',
      status: 'pending',
      attachments: 1,
    },
    {
      id: 'EXP-003',
      employeeName: 'Suresh Patel',
      employeeId: 'EMP-005',
      category: 'Office Supplies',
      amount: 2850,
      currency: 'INR',
      date: '2026-02-01',
      description: 'Stationery and office materials',
      status: 'approved',
      attachments: 3,
    },
  ];

  const filteredClaims = filterStatus === 'all' ? expenseClaims : expenseClaims.filter(c => c.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-700 border-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-700 border-red-500">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expense Approvals</h1>
          <p className="text-muted-foreground mt-2">Review and approve expense claims from your team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">2</div>
              <p className="text-xs text-muted-foreground mt-1">₹6,600 amount</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">₹2,850</div>
              <p className="text-xs text-muted-foreground mt-1">1 claim</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">4h 30m</div>
              <p className="text-xs text-muted-foreground mt-1">To approve</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">78%</div>
              <p className="text-xs text-muted-foreground mt-1">of monthly budget</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Expense Claims</CardTitle>
                <CardDescription>Manage expense claims requiring approval</CardDescription>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredClaims.map((claim) => (
              <Card key={claim.id} className="border-border/60 hover:border-accent/40 transition-all">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Employee</p>
                      <p className="font-semibold text-foreground">{claim.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{claim.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category & Date</p>
                      <p className="font-semibold text-foreground">{claim.category}</p>
                      <p className="text-xs text-muted-foreground">{claim.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-semibold text-foreground text-lg">{claim.currency} {claim.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="font-medium text-foreground text-sm">{claim.description}</p>
                      <Button variant="ghost" size="sm" className="gap-1 mt-1">
                        <FileText className="w-3 h-3" />
                        {claim.attachments} attachments
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(claim.status)}
                    </div>
                  </div>

                  {claim.status === 'pending' && (
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button className="flex-1 bg-transparent" variant="outline">
                        View Details
                      </Button>
                      <Button className="flex-1 bg-red-600 hover:bg-red-700 gap-2">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
