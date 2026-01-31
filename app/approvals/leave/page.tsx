'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, Filter } from 'lucide-react';
import AdvancedDataTable from '@/components/common/advanced-data-table';

export default function LeaveApprovalsPage() {
  const [filterStatus, setFilterStatus] = useState('all');

  const leaveRequests = [
    {
      id: 'LR-001',
      employeeName: 'Rajesh Kumar',
      employeeId: 'EMP-001',
      leaveType: 'Annual Leave',
      startDate: '2026-02-15',
      endDate: '2026-02-20',
      days: 5,
      reason: 'Personal vacation',
      status: 'pending',
      appliedOn: '2026-02-01',
    },
    {
      id: 'LR-002',
      employeeName: 'Priya Sharma',
      employeeId: 'EMP-002',
      leaveType: 'Sick Leave',
      startDate: '2026-02-10',
      endDate: '2026-02-11',
      days: 2,
      reason: 'Medical appointment',
      status: 'pending',
      appliedOn: '2026-02-08',
    },
    {
      id: 'LR-003',
      employeeName: 'Suresh Patel',
      employeeId: 'EMP-005',
      leaveType: 'Casual Leave',
      startDate: '2026-02-05',
      endDate: '2026-02-06',
      days: 2,
      reason: 'Family event',
      status: 'approved',
      appliedOn: '2026-02-01',
    },
  ];

  const filteredRequests = filterStatus === 'all' ? leaveRequests : leaveRequests.filter(r => r.status === filterStatus);

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
          <h1 className="text-3xl font-bold text-foreground">Leave Approvals</h1>
          <p className="text-muted-foreground mt-2">Review and approve leave requests from your team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">2</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting decision</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">1</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Team Leave Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-xs text-muted-foreground mt-1">Members on leave</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">2h</div>
              <p className="text-xs text-muted-foreground mt-1">To approve</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>Manage pending leave requests</CardDescription>
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
            {filteredRequests.map((request) => (
              <Card key={request.id} className="border-border/60 hover:border-accent/40 transition-all">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Employee</p>
                      <p className="font-semibold text-foreground">{request.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{request.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Leave Type</p>
                      <p className="font-semibold text-foreground">{request.leaveType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold text-foreground">{request.startDate} to {request.endDate}</p>
                      <p className="text-xs text-muted-foreground">{request.days} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reason</p>
                      <p className="font-semibold text-foreground">{request.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  {request.status === 'pending' && (
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
