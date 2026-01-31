'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockExpenses } from '@/lib/mock-data';
import { Plus, Plane, MapPin } from 'lucide-react';

export default function TravelPage() {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    redirect('/login');
  }

  const expenses = mockExpenses;
  const pendingExpenses = expenses.filter((e) => e.status === 'Pending');
  const approvedExpenses = expenses.filter((e) => e.status === 'Approved');

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
            <p className="text-muted-foreground mt-2">Submit and track your travel expenses</p>
          </div>
          {hasPermission('submit_expense') && (
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Submit Expense
            </Button>
          )}
        </div>

        {/* Expense Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Submitted</p>
                <p className="text-2xl font-bold">₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{expenses.length} claims</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">₹{totalPending.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{pendingExpenses.length} claims</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Approved & Paid</p>
                <p className="text-2xl font-bold text-green-600">₹{totalApproved.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{approvedExpenses.length} claims</p>
              </div>
            </CardContent>
          </Card>
        </div>

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
                {expenses.map((expense) => (
                  <div key={expense.id} className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Plane className="w-4 h-4 text-muted-foreground" />
                          <p className="font-semibold text-sm">{expense.category}</p>
                          <Badge className={getStatusColor(expense.status)}>{expense.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{expense.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Date: {expense.date}</span>
                          <span>Amount: ₹{expense.amount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3">
                {pendingExpenses.length > 0 ? (
                  pendingExpenses.map((expense) => (
                    <div key={expense.id} className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                      <p className="font-semibold text-sm mb-1">{expense.category}</p>
                      <p className="text-sm text-muted-foreground mb-2">₹{expense.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{expense.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No pending expense claims</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-3">
                {approvedExpenses.length > 0 ? (
                  approvedExpenses.map((expense) => (
                    <div key={expense.id} className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-lg">
                      <p className="font-semibold text-sm mb-1">{expense.category}</p>
                      <p className="text-sm text-muted-foreground mb-2">₹{expense.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{expense.description}</p>
                    </div>
                  ))
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
