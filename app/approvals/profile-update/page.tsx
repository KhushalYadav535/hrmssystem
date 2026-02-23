'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Loader2, UserPen } from 'lucide-react';
import apiService from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const REQUEST_TYPES: Record<string, string> = {
  PERSONAL: 'Personal Info',
  CONTACT: 'Contact',
  ADDRESS: 'Address',
  BANK: 'Bank',
  OTHER: 'Other',
};

export default function ProfileUpdateApprovalsPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; request: any }>({ open: false, request: null });
  const [reviewComments, setReviewComments] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  if (!isAuthenticated) redirect('/login');

  useEffect(() => {
    loadRequests();
  }, [filterStatus]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const res = await apiService.getProfileUpdateRequests(params);
      if (res.success && res.data) {
        setRequests(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to load requests', error);
      toast({ title: 'Error', description: 'Failed to load requests', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (action: 'Approved' | 'Rejected') => {
    const req = reviewDialog.request;
    if (!req) return;

    try {
      setActionInProgress(true);
      const response = await apiService.reviewProfileUpdateRequest(req._id || req.id, {
        action,
        reviewComments,
      });
      if (response.success) {
        toast({ title: 'Success', description: `Request ${action.toLowerCase()} successfully` });
        setReviewDialog({ open: false, request: null });
        setReviewComments('');
        loadRequests();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed', variant: 'destructive' });
    } finally {
      setActionInProgress(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case 'Approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile Update Approvals</h1>
          <p className="text-muted-foreground mt-2">Review and approve employee profile update requests</p>
        </div>

        <div className="flex gap-4 items-center">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Card className="flex-1 max-w-xs">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <UserPen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No profile update requests found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const emp = req.employeeId;
              const empName = emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'N/A';
              const empCode = emp?.employeeCode || '';

              return (
                <Card key={req._id || req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{empName}</CardTitle>
                        <CardDescription>{empCode} • {REQUEST_TYPES[req.requestType] || req.requestType}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(req.status)}
                        {req.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReviewDialog({ open: true, request: req })}
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {req.requestedFields?.map((f: any, i: number) => (
                        <div key={i} className="flex gap-4 text-sm">
                          <span className="text-muted-foreground w-28">{f.label || f.field}:</span>
                          <span className="line-through text-muted-foreground">{String(f.currentValue || '-')}</span>
                          <span className="text-green-600 font-medium">→ {String(f.requestedValue || '-')}</span>
                        </div>
                      ))}
                    </div>
                    {req.reason && <p className="text-sm text-muted-foreground mt-3">Reason: {req.reason}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={reviewDialog.open} onOpenChange={(o) => !o && setReviewDialog({ open: false, request: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Profile Update Request</DialogTitle>
              <DialogDescription>
                {reviewDialog.request?.employeeId
                  ? `${reviewDialog.request.employeeId.firstName} ${reviewDialog.request.employeeId.lastName}`
                  : ''}
              </DialogDescription>
            </DialogHeader>
            {reviewDialog.request && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {reviewDialog.request.requestedFields?.map((f: any, i: number) => (
                    <div key={i} className="flex gap-4 text-sm">
                      <span className="text-muted-foreground w-28">{f.label || f.field}:</span>
                      <span className="line-through">{String(f.currentValue || '-')}</span>
                      <span className="text-green-600 font-medium">→ {String(f.requestedValue || '-')}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <Label>Review Comments</Label>
                  <Textarea
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Optional comments for the employee"
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={() => handleReview('Rejected')}
                    disabled={actionInProgress}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={() => handleReview('Approved')} disabled={actionInProgress}>
                    {actionInProgress ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
