'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Clock, Loader2, DollarSign } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

/**
 * Leave Encashment Management Page
 * BRD: BR-P1-003 - Leave Management Enhancements
 */
export default function LeaveEncashmentPage() {
  const { currentUser } = useAuth();
  const [encashments, setEncashments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    financialYear: new Date().getFullYear(),
  });

  useEffect(() => {
    loadEncashments();
  }, [filters]);

  const loadEncashments = async () => {
    try {
      setLoading(true);
      const res = await apiService.getLeaveEncashments(filters);
      if (res.success && res.data) {
        setEncashments(res.data);
      }
    } catch (error: any) {
      toast.error('Error loading leave encashments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await apiService.approveLeaveEncashment(id);
      if (res.success) {
        toast.success('Leave encashment approved');
        loadEncashments();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const res = await apiService.rejectLeaveEncashment(id, reason);
      if (res.success) {
        toast.success('Leave encashment rejected');
        loadEncashments();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: 'Pending', variant: 'outline' },
      APPROVED: { label: 'Approved', variant: 'default' },
      REJECTED: { label: 'Rejected', variant: 'destructive' },
      PROCESSED: { label: 'Processed', variant: 'secondary' },
    };
    const c = config[status] || { label: status, variant: 'outline' };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const pendingEncashments = encashments.filter(e => e.status === 'PENDING');
  const approvedEncashments = encashments.filter(e => e.status === 'APPROVED' || e.status === 'PROCESSED');
  const rejectedEncashments = encashments.filter(e => e.status === 'REJECTED');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Leave Encashment</h1>
            <p className="text-muted-foreground mt-1">
              Manage employee leave encashment requests (BR-P1-003)
            </p>
          </div>
          <div className="flex gap-4">
            <Select
              value={filters.financialYear.toString()}
              onValueChange={(v) => setFilters({ ...filters, financialYear: parseInt(v) })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{encashments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingEncashments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedEncashments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{encashments.reduce((sum, e) => sum + (e.encashmentAmount || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leave Encashment Requests</CardTitle>
            <CardDescription>Review and approve leave encashment requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({pendingEncashments.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedEncashments.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejectedEncashments.length})
                </TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : pendingEncashments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending leave encashment requests
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingEncashments.map((enc) => (
                        <TableRow key={enc._id}>
                          <TableCell>
                            {enc.employeeId?.firstName} {enc.employeeId?.lastName}
                          </TableCell>
                          <TableCell>{enc.leaveType}</TableCell>
                          <TableCell>{enc.encashmentDays}</TableCell>
                          <TableCell className="font-semibold">
                            ₹{enc.encashmentAmount?.toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(enc.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(enc._id)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(enc._id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="approved">
                {/* Similar table for approved encashments */}
                <div className="text-center py-8 text-muted-foreground">
                  Approved encashments will appear here
                </div>
              </TabsContent>

              <TabsContent value="rejected">
                {/* Similar table for rejected encashments */}
                <div className="text-center py-8 text-muted-foreground">
                  Rejected encashments will appear here
                </div>
              </TabsContent>

              <TabsContent value="all">
                {/* All encashments table */}
                <div className="text-center py-8 text-muted-foreground">
                  All encashments will appear here
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
