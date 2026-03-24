'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, DollarSign, FileText } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

export default function ExpenseApprovalsPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [expenseClaims, setExpenseClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getExpenses(filterStatus === 'all' ? {} : { status: filterStatus });
      if (response.success && response.data) {
        setExpenseClaims(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      toast.error('Failed to load expense claims');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filterStatus]);

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const response = await apiService.approveExpense(id, status);
      if (response.success) {
        toast.success(`Expense claim ${status.toLowerCase()}`);
        fetchExpenses();
      } else {
        toast.error(response.message || 'Failed to update expense claim');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const pendingClaims = expenseClaims.filter(c => c.status === 'Pending');
  const pendingCount = pendingClaims.length;
  const pendingAmount = pendingClaims.reduce((sum, c) => sum + (c.amount || 0), 0);
  
  const approvedThisMonth = expenseClaims.filter(c => {
    const d = new Date(c.date);
    const now = new Date();
    return c.status === 'Approved' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const approvedAmount = approvedThisMonth.reduce((sum, c) => sum + (c.amount || 0), 0);

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
          <h1 className="text-3xl font-bold text-foreground">Expense Approvals</h1>
          <p className="text-muted-foreground mt-2">Review and approve expense claims from your team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">₹{pendingAmount.toLocaleString()} amount</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">₹{approvedAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{approvedThisMonth.length} claims</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Expense Claims</CardTitle>
                <CardDescription>Manage pending expense claims</CardDescription>
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
            ) : expenseClaims.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No expense claims found</div>
            ) : (
              expenseClaims.map((claim) => (
                <Card key={claim._id || claim.id} className="border-border/60 hover:border-accent/40 transition-all">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                      <div className="col-span-1 md:col-span-2">
                        <p className="text-sm text-muted-foreground">Employee</p>
                        <p className="font-semibold text-foreground">
                          {claim.employeeId?.firstName} {claim.employeeId?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{claim.employeeId?.employeeCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-semibold text-foreground">{claim.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-semibold text-foreground">₹{claim.amount}</p>
                        <p className="text-xs text-muted-foreground">{formatDateDDMMYYYY(claim.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="font-semibold text-foreground truncate">{claim.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        {getStatusBadge(claim.status)}
                      </div>
                    </div>

                    {claim.status === 'Pending' && (
                      <div className="flex gap-2 pt-4 border-t border-border">
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                          onClick={() => handleAction(claim._id || claim.id, 'Approved')}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button 
                          className="flex-1 bg-transparent" 
                          variant="outline"
                          // onClick={() => handleViewDetails(claim)}
                        >
                          <FileText className="w-4 h-4" />
                          View Details
                        </Button>
                        <Button 
                          className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
                          onClick={() => handleAction(claim._id || claim.id, 'Rejected')}
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
