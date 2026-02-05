'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, Filter } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

export default function LeaveApprovalsPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      // For HR Admin and Tenant Admin, fetch all pending leaves (no employeeId filter)
      // Backend will automatically filter by tenantId
      const params = filterStatus === 'all' ? {} : { status: filterStatus };
      const response = await apiService.getLeaves(params);
      if (response.success && response.data) {
        setLeaveRequests(Array.isArray(response.data) ? response.data : []);
      } else {
        toast.error(response.message || 'Failed to load leave requests');
      }
    } catch (error: any) {
      console.error('Failed to load leave requests:', error);
      toast.error(error.message || 'Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [filterStatus]);

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    if (!id) {
      toast.error('Invalid leave request ID');
      return;
    }

    try {
      const response = await apiService.approveLeave(id, status);
      if (response.success) {
        toast.success(`Leave request ${status.toLowerCase()} successfully`);
        fetchLeaveRequests(); // Reload the list
      } else {
        toast.error(response.message || 'Failed to update leave request');
      }
    } catch (error: any) {
      console.error('Approve/Reject leave error:', error);
      toast.error(error.message || 'An error occurred while processing the request');
    }
  };

  const pendingCount = leaveRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'Approved').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500">Pending</Badge>;
      case 'Approved':
        return <Badge className="bg-green-500/20 text-green-700 border-green-500">Approved</Badge>;
      case 'Rejected':
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
              <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting decision</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Total approved</p>
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : leaveRequests.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No leave requests found</div>
            ) : (
              leaveRequests.map((request) => (
                <Card key={request._id || request.id} className="border-border/60 hover:border-accent/40 transition-all">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Employee</p>
                        <p className="font-semibold text-foreground">
                          {request.employeeId?.firstName} {request.employeeId?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{request.employeeId?.employeeCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Leave Type</p>
                        <p className="font-semibold text-foreground">{request.leaveType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold text-foreground">
                          {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                        </p>
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

                    {request.status === 'Pending' && (
                      <div className="flex gap-2 pt-4 border-t border-border">
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                          onClick={() => handleAction(request._id || request.id, 'Approved')}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button 
                          className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
                          onClick={() => handleAction(request._id || request.id, 'Rejected')}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
