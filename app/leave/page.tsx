'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockLeaves } from '@/lib/mock-data';
import { Plus, Calendar, Check, X } from 'lucide-react';

export default function LeavePage() {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    redirect('/login');
  }

  const allLeaves = mockLeaves;
  const pendingLeaves = allLeaves.filter((l) => l.status === 'Pending');
  const approvedLeaves = allLeaves.filter((l) => l.status === 'Approved');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
            <p className="text-muted-foreground mt-2">Apply and manage your leaves</p>
          </div>
          {hasPermission('apply_leave') && (
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Apply Leave
            </Button>
          )}
        </div>

        {/* Leave Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Casual Leave</p>
                <div className="flex gap-2 mt-2">
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                  <div className="border-l pl-4">
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-xs text-muted-foreground">Used</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Sick Leave</p>
                <div className="flex gap-2 mt-2">
                  <div>
                    <p className="text-2xl font-bold">6</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                  <div className="border-l pl-4">
                    <p className="text-2xl font-bold">4</p>
                    <p className="text-xs text-muted-foreground">Used</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Earned Leave</p>
                <div className="flex gap-2 mt-2">
                  <div>
                    <p className="text-2xl font-bold">15</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                  <div className="border-l pl-4">
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-xs text-muted-foreground">Used</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All ({allLeaves.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingLeaves.length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedLeaves.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {allLeaves.map((leave) => (
                  <div key={leave.id} className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p className="font-semibold text-sm">{leave.leaveType}</p>
                        <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {leave.startDate} to {leave.endDate} ({leave.days} days)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Reason: {leave.reason}</p>
                      <p className="text-xs text-muted-foreground">Approved by: {leave.approverName}</p>
                    </div>
                    {hasPermission('approve_leave') && leave.status === 'Pending' && (
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 bg-transparent">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3">
                {pendingLeaves.length > 0 ? (
                  pendingLeaves.map((leave) => (
                    <div key={leave.id} className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                      <p className="font-semibold text-sm mb-1">{leave.leaveType}</p>
                      <p className="text-sm text-muted-foreground">
                        {leave.startDate} to {leave.endDate}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No pending leave requests</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-3">
                {approvedLeaves.length > 0 ? (
                  approvedLeaves.map((leave) => (
                    <div key={leave.id} className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-lg">
                      <p className="font-semibold text-sm mb-1">{leave.leaveType}</p>
                      <p className="text-sm text-muted-foreground">
                        {leave.startDate} to {leave.endDate} ({leave.days} days)
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No approved leaves</p>
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
