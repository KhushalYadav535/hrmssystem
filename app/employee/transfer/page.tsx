'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function TransferManagementPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const [selectedTab, setSelectedTab] = useState('create');
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    transferType: 'INTER_BRANCH',
    requestedLocation: { department: '', location: '', designation: '' },
    reason: '',
    requestedRelievingDate: '',
    requestedJoiningDate: '',
  });

  const isAdmin = ['HR Administrator', 'Tenant Admin', 'Manager', 'Super Admin'].includes(currentUser?.role || '');

  useEffect(() => {
    if (isAuthenticated) loadTransfers();
  }, [isAuthenticated]);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const res = await apiService.getTransferRequests({});
      if (res.success && res.data) {
        const data = res.data;
        setTransfers(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error: any) {
      toast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiService.submitTransferRequest(formData);
      if (res.success) {
        toast.success('Transfer request submitted');
        setFormData({
          transferType: 'INTER_BRANCH',
          requestedLocation: { department: '', location: '', designation: '' },
          reason: '',
          requestedRelievingDate: '',
          requestedJoiningDate: '',
        });
        loadTransfers();
      } else {
        toast.error(res.message || 'Failed to submit');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproval = async (id: string, type: 'current' | 'destination' | 'hr', approved: boolean) => {
    try {
      let res;
      if (type === 'current') res = await apiService.currentManagerApproval(id, { approved });
      else if (type === 'destination') res = await apiService.destinationManagerApproval(id, { approved });
      else res = await apiService.hrVerification(id, { availabilityConfirmed: approved });
      if (res.success) {
        toast.success(approved ? 'Approved' : 'Rejected');
        loadTransfers();
      } else toast.error(res.message || 'Failed');
    } catch (error: any) {
      toast.error(error.message || 'Failed');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      SUBMITTED: 'outline',
      CURRENT_MANAGER_PENDING: 'secondary',
      CURRENT_MANAGER_APPROVED: 'secondary',
      DESTINATION_MANAGER_PENDING: 'secondary',
      HR_VERIFICATION_PENDING: 'secondary',
      TRANSFER_ORDER_GENERATED: 'default',
      COMPLETED: 'default',
    };
    return <Badge variant={map[status] || 'outline'}>{status?.replace(/_/g, ' ')}</Badge>;
  };

  const pendingCount = transfers.filter((t: any) =>
    ['CURRENT_MANAGER_PENDING', 'DESTINATION_MANAGER_PENDING', 'HR_VERIFICATION_PENDING', 'SUBMITTED'].includes(t.status)
  ).length;
  const completedCount = transfers.filter((t: any) => t.status === 'COMPLETED').length;

  if (!isAuthenticated) redirect('/login');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transfer Management</h1>
          <p className="text-muted-foreground mt-2">Manage employee transfers and inter-department movements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{transfers.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="create">New Transfer</TabsTrigger>
            <TabsTrigger value="requests">Transfer Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Submit Transfer Request</CardTitle>
                <CardDescription>Request an inter-branch or inter-zone transfer</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                  <div>
                    <Label>Transfer Type</Label>
                    <Select
                      value={formData.transferType}
                      onValueChange={(v) => setFormData({ ...formData, transferType: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INTER_BRANCH">Inter Branch</SelectItem>
                        <SelectItem value="INTER_ZONE">Inter Zone</SelectItem>
                        <SelectItem value="PROMOTION_WITH_TRANSFER">Promotion with Transfer</SelectItem>
                        <SelectItem value="MUTUAL">Mutual Transfer</SelectItem>
                        <SelectItem value="COMPASSIONATE">Compassionate</SelectItem>
                        <SelectItem value="HARDSHIP">Hardship</SelectItem>
                        <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Requested Department</Label>
                      <Input
                        value={formData.requestedLocation.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requestedLocation: { ...formData.requestedLocation, department: e.target.value },
                          })
                        }
                        placeholder="e.g. IT"
                      />
                    </div>
                    <div>
                      <Label>Requested Location</Label>
                      <Input
                        value={formData.requestedLocation.location}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requestedLocation: { ...formData.requestedLocation, location: e.target.value },
                          })
                        }
                        placeholder="e.g. Mumbai"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Reason</Label>
                    <Textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Reason for transfer"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Requested Relieving Date</Label>
                      <Input
                        type="date"
                        value={formData.requestedRelievingDate}
                        onChange={(e) => setFormData({ ...formData, requestedRelievingDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Requested Joining Date</Label>
                      <Input
                        type="date"
                        value={formData.requestedJoiningDate}
                        onChange={(e) => setFormData({ ...formData, requestedJoiningDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Requests</CardTitle>
                <CardDescription>View and manage transfer requests</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : transfers.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">No transfer requests</div>
                ) : (
                  <div className="space-y-4">
                    {transfers.map((t: any) => (
                      <div
                        key={t._id}
                        className="p-4 border rounded-lg hover:bg-muted/30 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {t.employeeId?.firstName} {t.employeeId?.lastName} ({t.employeeId?.employeeCode})
                              </h3>
                              {getStatusBadge(t.status)}
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                              <span>
                                {t.currentLocation?.department || '-'} → {t.requestedLocation?.department || '-'}
                              </span>
                              <span>{t.currentLocation?.location} → {t.requestedLocation?.location}</span>
                            </div>
                            <p className="text-sm mt-2">{t.reason}</p>
                          </div>
                          {isAdmin && ['CURRENT_MANAGER_PENDING', 'DESTINATION_MANAGER_PENDING', 'HR_VERIFICATION_PENDING'].includes(t.status) && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleApproval(t._id, t.status === 'CURRENT_MANAGER_PENDING' ? 'current' : t.status === 'DESTINATION_MANAGER_PENDING' ? 'destination' : 'hr', true)}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleApproval(t._id, t.status === 'CURRENT_MANAGER_PENDING' ? 'current' : t.status === 'DESTINATION_MANAGER_PENDING' ? 'destination' : 'hr', false)}>
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
