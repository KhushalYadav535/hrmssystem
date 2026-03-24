'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, Download, CheckCircle2, XCircle, Clock, Loader2, ArrowRight } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

/**
 * Transfer Log Page
 * BR-ORG-15: Sab org changes ki history (move/rename/merge) audit log mein record hon effective date ke saath
 */
export default function TransferLogPage() {
  const { currentUser } = useAuth();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    transferType: 'all',
    search: '',
  });
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadTransfers();
  }, [filters]);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.transferType !== 'all') params.transferType = filters.transferType;

      const response = await apiService.getEmployeeTransfers(params);
      if (response.success && response.data) {
        let transfersList = Array.isArray(response.data) ? response.data : [];
        
        // Filter by search term
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          transfersList = transfersList.filter((t: any) =>
            t.employeeId?.firstName?.toLowerCase().includes(searchLower) ||
            t.employeeId?.lastName?.toLowerCase().includes(searchLower) ||
            t.employeeId?.employeeCode?.toLowerCase().includes(searchLower) ||
            t.fromUnitId?.unitCode?.toLowerCase().includes(searchLower) ||
            t.toUnitId?.unitCode?.toLowerCase().includes(searchLower)
          );
        }
        
        setTransfers(transfersList);
      }
    } catch (error: any) {
      toast.error('Failed to load transfer log');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transfer: any) => {
    try {
      const response = await apiService.approveEmployeeTransfer(transfer._id);
      if (response.success) {
        toast.success('Transfer approved and completed');
        loadTransfers();
        setSelectedTransfer(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve transfer');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      toast.error('Rejection reason is required (minimum 10 characters)');
      return;
    }

    try {
      const response = await apiService.rejectEmployeeTransfer(selectedTransfer._id, rejectionReason);
      if (response.success) {
        toast.success('Transfer rejected');
        loadTransfers();
        setSelectedTransfer(null);
        setRejectionReason('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject transfer');
    }
  };

  const handleExport = () => {
    const csvHeaders = ['Date', 'Employee', 'From Unit', 'To Unit', 'Type', 'Status', 'Effective Date'];
    const csvRows = transfers.map((t: any) => [
      formatDateDDMMYYYY(t.createdAt),
      `${t.employeeId?.firstName || ''} ${t.employeeId?.lastName || ''}`,
      t.fromUnitId?.unitCode || '',
      t.toUnitId?.unitCode || '',
      t.transferType,
      t.status,
      formatDateDDMMYYYY(t.effectiveDate),
    ]);
    const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transfer-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'Approved':
        return <Badge className="bg-blue-100 text-blue-700"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Transfer Log</h1>
            <p className="text-muted-foreground mt-2">
              History of all organizational changes (transfers, moves, merges)
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by employee name, code, or unit..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.transferType} onValueChange={(v) => setFilters({ ...filters, transferType: v })}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Permanent">Permanent</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                  <SelectItem value="Deputation">Deputation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transfers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer History</CardTitle>
            <CardDescription>
              All employee transfers across organization units
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Employee</th>
                    <th className="text-left p-2">From</th>
                    <th className="text-left p-2">To</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Effective Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer._id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{formatDateDDMMYYYY(transfer.createdAt)}</td>
                      <td className="p-2">
                        {transfer.employeeId?.firstName} {transfer.employeeId?.lastName}
                        <br />
                        <span className="text-xs text-muted-foreground">{transfer.employeeId?.employeeCode}</span>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{transfer.fromUnitId?.unitCode}</Badge>
                        <br />
                        <span className="text-xs text-muted-foreground">{transfer.fromUnitId?.unitName}</span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <Badge variant="outline">{transfer.toUnitId?.unitCode}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{transfer.toUnitId?.unitName}</span>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{transfer.transferType}</Badge>
                        {transfer.isTemporary && (
                          <Badge variant="secondary" className="ml-1 text-xs">Temp</Badge>
                        )}
                      </td>
                      <td className="p-2">{formatDateDDMMYYYY(transfer.effectiveDate)}</td>
                      <td className="p-2">{getStatusBadge(transfer.status)}</td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTransfer(transfer)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transfers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No transfer records found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transfer Details Dialog */}
        {selectedTransfer && (
          <Dialog open={!!selectedTransfer} onOpenChange={() => setSelectedTransfer(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Transfer Details</DialogTitle>
                <DialogDescription>
                  Employee transfer request information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Employee</Label>
                    <p className="font-medium">
                      {selectedTransfer.employeeId?.firstName} {selectedTransfer.employeeId?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedTransfer.employeeId?.employeeCode}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Transfer Type</Label>
                    <Badge>{selectedTransfer.transferType}</Badge>
                    {selectedTransfer.isTemporary && (
                      <Badge variant="secondary" className="ml-2">Temporary</Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">From Unit</Label>
                    <p className="font-medium">{selectedTransfer.fromUnitId?.unitName}</p>
                    <p className="text-sm text-muted-foreground">{selectedTransfer.fromUnitId?.unitCode}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">To Unit</Label>
                    <p className="font-medium">{selectedTransfer.toUnitId?.unitName}</p>
                    <p className="text-sm text-muted-foreground">{selectedTransfer.toUnitId?.unitCode}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Effective Date</Label>
                  <p className="font-medium">{formatDateDDMMYYYY(selectedTransfer.effectiveDate)}</p>
                </div>
                {selectedTransfer.reason && (
                  <div>
                    <Label className="text-muted-foreground">Reason</Label>
                    <p>{selectedTransfer.reason}</p>
                  </div>
                )}
                {selectedTransfer.remarks && (
                  <div>
                    <Label className="text-muted-foreground">Remarks</Label>
                    <p>{selectedTransfer.remarks}</p>
                  </div>
                )}
                {selectedTransfer.rejectionReason && (
                  <div>
                    <Label className="text-muted-foreground">Rejection Reason</Label>
                    <p className="text-red-600">{selectedTransfer.rejectionReason}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTransfer.status)}</div>
                </div>
                {selectedTransfer.status === 'Pending' && currentUser?.role === 'Tenant Admin' && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Rejection Reason (if rejecting)</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection (minimum 10 characters)"
                      rows={3}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setSelectedTransfer(null);
                  setRejectionReason('');
                }}>
                  Close
                </Button>
                {selectedTransfer.status === 'Pending' && currentUser?.role === 'Tenant Admin' && (
                  <>
                    <Button variant="outline" onClick={handleReject} disabled={!rejectionReason || rejectionReason.length < 10}>
                      Reject
                    </Button>
                    <Button onClick={handleApprove}>
                      Approve
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
