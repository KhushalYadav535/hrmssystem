'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Check, X, Clock, Users, TrendingUp, DollarSign } from 'lucide-react';
import { useLeaves } from '@/lib/hooks/useLeaves';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useEmployees } from '@/lib/hooks/useEmployees';
import { useAuth } from '@/lib/auth-context';
import { formatDesignationLabel } from '@/lib/utils';

const performanceData = [
  { employee: 'Rajesh', rating: 4.2 },
  { employee: 'Suresh', rating: 3.8 },
];

export default function ManagerDashboard() {
  const { currentUser } = useAuth();
  const { leaves } = useLeaves({ status: 'Pending' });
  const { expenses } = useExpenses({ status: 'Pending' });
  const { employees } = useEmployees();

  const pendingLeaves = leaves.filter((l: any) => l.status === 'Pending');
  const pendingExpenses = expenses.filter((e: any) => e.status === 'Pending');
  const teamMembers = employees || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Team Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your team and approvals</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold text-foreground">{teamMembers.length}</p>
                <p className="text-xs text-muted-foreground mt-1">All Active</p>
              </div>
              <Users className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-foreground">{pendingLeaves.length + pendingExpenses.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{pendingLeaves.length} Leaves, {pendingExpenses.length} Expenses</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Leave Today</p>
                <p className="text-2xl font-bold text-foreground">1</p>
                <p className="text-xs text-muted-foreground mt-1">Suresh (Casual)</p>
              </div>
              <Calendar className="w-10 h-10 text-accent/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold text-foreground">{teamMembers.length - 1}</p>
                <p className="text-xs text-muted-foreground mt-1">2/{teamMembers.length} members</p>
              </div>
              <Check className="w-10 h-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Leave Requests */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Pending Leave Requests</CardTitle>
            <CardDescription>{pendingLeaves.length} approval(s) required</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLeaves.length > 0 ? (
                pendingLeaves.map((leave: any) => {
                  const leaveId = leave._id || leave.id || '';
                  return (
                    <div key={leaveId} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">Leave Request</p>
                        <p className="text-xs text-muted-foreground mt-1">{leave.leaveType}</p>
                        <p className="text-xs text-muted-foreground">
                          {leave.startDate} to {leave.endDate} ({leave.days || 0} days)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Reason: {leave.reason || 'N/A'}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No pending leave requests</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Team Performance</CardTitle>
            <CardDescription>Q4 2025 Ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="employee" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="rating" fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expense Approvals and Team List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Expense Claims */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Pending Expense Claims</CardTitle>
            <CardDescription>{pendingExpenses.length} claim(s) to review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingExpenses.length > 0 ? (
                pendingExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{expense.category}</p>
                      <p className="text-xs text-muted-foreground">{expense.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <p className="font-semibold text-sm">₹{expense.amount.toLocaleString()}</p>
                      <Button size="sm" variant="outline" className="h-7 bg-transparent">
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No pending expense claims</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Team Members</CardTitle>
            <CardDescription>{teamMembers.length} direct reports</CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No team members found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member: any) => {
                  const memberId = member._id || member.id || '';
                  return (
                    <div key={memberId} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-muted-foreground">{formatDesignationLabel(member.designation)}</p>
                      </div>
                      <Badge className={member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {member.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
              <Check className="w-6 h-6 mb-2" />
              <span className="text-xs">Approve Leaves</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
              <DollarSign className="w-6 h-6 mb-2" />
              <span className="text-xs">Review Expenses</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
              <TrendingUp className="w-6 h-6 mb-2" />
              <span className="text-xs">Performance Reviews</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
              <Users className="w-6 h-6 mb-2" />
              <span className="text-xs">View Team</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
