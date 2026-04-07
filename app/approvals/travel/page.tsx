'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, MapPin, Loader2, Plane } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { formatDateDDMMYYYY } from '@/lib/date-format';

export default function TravelApprovalsPage() {
  const { isAuthenticated, currentUser, hasRole } = useAuth();
  const [filterStatus, setFilterStatus] = useState('Submitted');
  const [travelRequests, setTravelRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (!isAuthenticated) {
    redirect('/login');
  }

  const uid = currentUser?.id ? String(currentUser.id) : '';

  const loadRequests = async () => {
    try {
      setLoading(true);
      const params: { status?: string } = {};
      if (filterStatus && filterStatus !== 'all') {
        params.status = filterStatus;
      }
      const res = await apiService.getTravelRequests(params);
      if (res.success && res.data) {
        setTravelRequests(Array.isArray(res.data) ? res.data : []);
      } else {
        setTravelRequests([]);
        if (res.message) toast.error(res.message);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to load travel requests');
      setTravelRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, [filterStatus]);

  const filteredForAction =
    filterStatus === 'all'
      ? travelRequests
      : travelRequests.filter((r) => r.status === filterStatus);

  const canApprove = (request: any) => {
    if (request.status !== 'Submitted') return false;
    if (
      hasRole('HR Administrator') ||
      hasRole('Tenant Admin') ||
      hasRole('Super Admin')
    ) {
      return true;
    }
    const aid = request.approverId;
    const approverUserId =
      typeof aid === 'object' && aid !== null
        ? String((aid as { _id?: string })._id || '')
        : aid
          ? String(aid)
          : '';
    return !!uid && approverUserId === uid;
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await apiService.approveTravelRequest(id, 'Approved');
      if (res.success) {
        toast.success('Travel request approved');
        void loadRequests();
      } else toast.error(res.message || 'Approve failed');
    } catch (e: any) {
      toast.error(e.message || 'Approve failed');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await apiService.approveTravelRequest(id, 'Rejected');
      if (res.success) {
        toast.success('Travel request rejected');
        void loadRequests();
      } else toast.error(res.message || 'Reject failed');
    } catch (e: any) {
      toast.error(e.message || 'Reject failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
      case 'Pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500">
            Pending
          </Badge>
        );
      case 'Approved':
        return (
          <Badge className="bg-green-500/20 text-green-700 border-green-500">
            Approved
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge className="bg-red-500/20 text-red-700 border-red-500">
            Rejected
          </Badge>
        );
      case 'Draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = travelRequests.filter((r) => r.status === 'Submitted').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Travel Approvals</h1>
          <p className="text-muted-foreground mt-2">
            Review travel requests routed to you or your team
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Awaiting decision</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Submitted</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle>Travel requests</CardTitle>
                <CardDescription>Data from your approval queue</CardDescription>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading…
              </div>
            ) : filteredForAction.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No travel requests in this view.
              </p>
            ) : (
              filteredForAction.map((request) => {
                const requestId = String(request._id || request.id);
                const emp = request.employeeId;
                const empLabel = emp
                  ? `${emp.firstName || ''} ${emp.lastName || ''} (${emp.employeeCode || ''})`
                  : '—';
                return (
                  <Card key={requestId} className="border-border/60">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Employee</p>
                          <p className="font-semibold text-foreground">{empLabel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Route
                          </p>
                          <p className="font-semibold text-foreground">
                            {request.origin} → {request.destination}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Plane className="w-3 h-3" />
                            {request.travelType}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Travel period</p>
                          <p className="font-semibold text-foreground">
                            {request.departureDate
                              ? formatDateDDMMYYYY(request.departureDate)
                              : '—'}{' '}
                            –{' '}
                            {request.returnDate
                              ? formatDateDDMMYYYY(request.returnDate)
                              : '—'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{request.purpose}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Est. amount</p>
                          <p className="font-semibold text-lg">
                            ₹{Number(request.estimatedAmount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>

                      {canApprove(request) && (
                        <div className="flex gap-2 pt-4 border-t border-border flex-wrap">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 gap-2 min-w-[120px]"
                            onClick={() => handleApprove(requestId)}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 gap-2 min-w-[120px]"
                            onClick={() => handleReject(requestId)}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
