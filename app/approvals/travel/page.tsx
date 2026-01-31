'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, MapPin, Plane } from 'lucide-react';

export default function TravelApprovalsPage() {
  const [filterStatus, setFilterStatus] = useState('all');

  const travelRequests = [
    {
      id: 'TR-001',
      employeeName: 'Rajesh Kumar',
      employeeId: 'EMP-001',
      destination: 'Bangalore',
      purpose: 'Client Presentation',
      departDate: '2026-02-10',
      returnDate: '2026-02-12',
      days: 3,
      budget: 45000,
      currency: 'INR',
      status: 'pending',
    },
    {
      id: 'TR-002',
      employeeName: 'Priya Sharma',
      employeeId: 'EMP-002',
      destination: 'Pune',
      purpose: 'Conference Attendance',
      departDate: '2026-02-15',
      returnDate: '2026-02-18',
      days: 4,
      budget: 32000,
      currency: 'INR',
      status: 'pending',
    },
  ];

  const filteredRequests = filterStatus === 'all' ? travelRequests : travelRequests.filter(r => r.status === filterStatus);

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
          <h1 className="text-3xl font-bold text-foreground">Travel Approvals</h1>
          <p className="text-muted-foreground mt-2">Review and approve travel requests from your team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">2</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Budget Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">₹77,000</div>
              <p className="text-xs text-muted-foreground mt-1">Total requested</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Team Traveling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-xs text-muted-foreground mt-1">Currently on travel</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Decision Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">8h</div>
              <p className="text-xs text-muted-foreground mt-1">To approve</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Travel Requests</CardTitle>
                <CardDescription>Manage travel requests requiring approval</CardDescription>
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
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Destination
                      </p>
                      <p className="font-semibold text-foreground">{request.destination}</p>
                      <p className="text-xs text-muted-foreground">{request.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Travel Period</p>
                      <p className="font-semibold text-foreground">{request.departDate} to {request.returnDate}</p>
                      <p className="text-xs text-muted-foreground">{request.days} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-semibold text-foreground text-lg">{request.currency} {request.budget.toLocaleString()}</p>
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
