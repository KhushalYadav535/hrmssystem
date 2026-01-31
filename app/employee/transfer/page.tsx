'use client';

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
import { Calendar, MapPin, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function TransferManagementPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [selectedTab, setSelectedTab] = useState('create');

  if (!isAuthenticated || !hasPermission('manage_employees')) {
    redirect('/dashboard');
  }

  const transferRequests = [
    { id: 1, employee: 'Rajesh Kumar', from: 'Finance', to: 'IT', date: '2026-02-15', status: 'Pending', reason: 'Skill enhancement' },
    { id: 2, employee: 'Priya Sharma', from: 'HR', to: 'Operations', date: '2026-02-01', status: 'Approved', reason: 'Career progression' },
    { id: 3, employee: 'Amit Verma', from: 'IT', to: 'Finance', date: '2026-01-20', status: 'Completed', reason: 'Organizational need' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transfer Management</h1>
          <p className="text-muted-foreground mt-2">Manage employee transfers and inter-department movements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">New Transfer</TabsTrigger>
            <TabsTrigger value="requests">Transfer Requests</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Initiate Transfer</CardTitle>
                <CardDescription>Create a new employee transfer request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee Name</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rajesh">Rajesh Kumar</SelectItem>
                        <SelectItem value="priya">Priya Sharma</SelectItem>
                        <SelectItem value="amit">Amit Verma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Employee ID</Label>
                    <Input placeholder="Auto-filled" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Department</Label>
                    <Input placeholder="Auto-filled" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Designation</Label>
                    <Input placeholder="Auto-filled" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Transfer To Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Effective Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reporting Manager</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="priya">Priya Sharma</SelectItem>
                        <SelectItem value="deepa">Deepa Gupta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason for Transfer</Label>
                  <Textarea placeholder="Provide reason for transfer" rows={4} />
                </div>
                <div className="flex gap-3">
                  <Button className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Submit for Approval
                  </Button>
                  <Button variant="outline">Save as Draft</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transferRequests.map((req) => (
                    <div key={req.id} className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{req.employee}</h3>
                            <Badge variant={req.status === 'Pending' ? 'outline' : req.status === 'Approved' ? 'secondary' : 'default'}>
                              {req.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {req.from} → {req.to}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {req.date}
                            </div>
                          </div>
                          <p className="text-sm">{req.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          {req.status === 'Pending' && (
                            <>
                              <Button size="sm">Approve</Button>
                              <Button size="sm" variant="destructive">Reject</Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Transfer History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transferRequests.map((req) => (
                    <div key={req.id} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">{req.employee}</p>
                        <p className="text-sm text-muted-foreground">{req.from} to {req.to}</p>
                      </div>
                      <Badge>{req.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
