'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Plane, MapPin, Briefcase, DollarSign, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function TravelPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getExpenses();
      if (response.success && response.data) {
        setExpenses(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load expenses', error);
      toast.error('Failed to load expense data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveExpense = async (id: string) => {
    try {
      const response = await apiService.approveExpense(id, 'Approved');
      if (response.success) {
        toast.success('Expense approved successfully');
        loadExpenses();
      } else {
        toast.error(response.message || 'Failed to approve expense');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve expense');
    }
  };

  const handleRejectExpense = async (id: string) => {
    try {
      const response = await apiService.approveExpense(id, 'Rejected');
      if (response.success) {
        toast.success('Expense rejected');
        loadExpenses();
      } else {
        toast.error(response.message || 'Failed to reject expense');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject expense');
    }
  };

  if (!isAuthenticated) {
    redirect('/login');
  }

  // Check if user is Tenant Admin - they should see approval dashboard, not create options
  const isTenantAdmin = currentUser?.role === 'Tenant Admin';
  const canSubmitExpense = hasPermission('submit_expense') && !isTenantAdmin;

  const pendingExpenses = expenses.filter((e) => e.status === 'Pending' || e.status === 'Submitted');
  const approvedExpenses = expenses.filter((e) => e.status === 'Approved' || e.status === 'Paid');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Pending':
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const totalPending = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalApproved = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Travel & Expense Management</h1>
            <p className="text-muted-foreground mt-2">
              {isTenantAdmin ? 'Review and approve travel expenses' : 'Submit and track your travel expenses'}
            </p>
          </div>
          {canSubmitExpense && (
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" asChild>
                <Link href="/travel/request">
                  <Plus className="w-4 h-4" />
                  Travel Request
                </Link>
              </Button>
              <Button className="gap-2" asChild>
                <Link href="/travel/advance">
                  <Plus className="w-4 h-4" />
                  Request Advance
                </Link>
              </Button>
            </div>
          )}
          {isTenantAdmin && (
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/approvals/expense">
                <CheckCircle2 className="w-4 h-4" />
                View All Approvals
              </Link>
            </Button>
          )}
        </div>

        {/* Expense Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">{isTenantAdmin ? 'Total Claims' : 'Total Submitted'}</p>
                <p className="text-2xl font-bold">₹{expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{expenses.length} claims</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">₹{pendingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{pendingExpenses.length} claims</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Approved & Paid</p>
                <p className="text-2xl font-bold text-green-600">₹{approvedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{approvedExpenses.length} claims</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Only show for non-Tenant Admin users */}
        {!isTenantAdmin && canSubmitExpense && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" asChild>
              <Link href="/travel/request">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold">Create Travel Request</p>
                      <p className="text-xs text-muted-foreground">Submit new travel request</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" asChild>
              <Link href="/travel/advance">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold">Request Advance</p>
                      <p className="text-xs text-muted-foreground">Get travel advance payment</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" asChild>
              <Link href="/travel/lta">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold">LTA Management</p>
                      <p className="text-xs text-muted-foreground">Manage Leave Travel Allowance</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        )}

        {/* Expense Claims */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Expense Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All ({expenses.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingExpenses.length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedExpenses.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading expenses...</div>
                ) : expenses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No expense claims found</div>
                ) : (
                  expenses.map((expense) => {
                    const expenseId = expense._id || expense.id;
                    return (
                      <div key={expenseId} className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Plane className="w-4 h-4 text-muted-foreground" />
                              <p className="font-semibold text-sm">{expense.category}</p>
                              <Badge className={getStatusColor(expense.status)}>{expense.status}</Badge>
                            </div>
                            {expense.employeeId && (
                              <p className="text-xs text-muted-foreground mb-1">
                                Employee: {expense.employeeId.firstName} {expense.employeeId.lastName} ({expense.employeeId.employeeCode})
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground mb-1">{expense.description}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>Date: {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}</span>
                              <span>Amount: ₹{expense.amount?.toLocaleString() || '0'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4 flex-shrink-0">
                            {isTenantAdmin && (expense.status === 'Pending' || expense.status === 'Submitted') && (
                              <>
                                <Button size="sm" variant="outline" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproveExpense(expenseId)}>
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleRejectExpense(expenseId)}>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : pendingExpenses.length > 0 ? (
                  pendingExpenses.map((expense) => {
                    const expenseId = expense._id || expense.id;
                    return (
                      <div key={expenseId} className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm mb-1">{expense.category}</p>
                            {expense.employeeId && (
                              <p className="text-xs text-muted-foreground mb-1">
                                {expense.employeeId.firstName} {expense.employeeId.lastName}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground mb-2">₹{expense.amount?.toLocaleString() || '0'}</p>
                            <p className="text-xs text-muted-foreground">{expense.description}</p>
                          </div>
                          {isTenantAdmin && (
                            <div className="flex gap-2 ml-4">
                              <Button size="sm" variant="outline" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproveExpense(expenseId)}>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleRejectExpense(expenseId)}>
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No pending expense claims</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : approvedExpenses.length > 0 ? (
                  approvedExpenses.map((expense) => {
                    const expenseId = expense._id || expense.id;
                    return (
                      <div key={expenseId} className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-lg">
                        <p className="font-semibold text-sm mb-1">{expense.category}</p>
                        {expense.employeeId && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {expense.employeeId.firstName} {expense.employeeId.lastName}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mb-2">₹{expense.amount?.toLocaleString() || '0'}</p>
                        <p className="text-xs text-muted-foreground">{expense.description}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No approved expense claims</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
