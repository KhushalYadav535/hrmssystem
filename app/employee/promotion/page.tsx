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
import { TrendingUp, CheckCircle2, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function PromotionManagementPage() {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated || !hasPermission('manage_employees')) {
    redirect('/dashboard');
  }

  const promotions = [
    { id: 1, employee: 'Rajesh Kumar', from: 'Accountant', to: 'Senior Accountant', grade: 'A1→A2', salary: '+₹15,000', date: '2026-03-01', status: 'Pending' },
    { id: 2, employee: 'Priya Sharma', from: 'Officer', to: 'Manager', grade: 'B1→B2', salary: '+₹25,000', date: '2026-02-15', status: 'Approved' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Promotion Management</h1>
          <p className="text-muted-foreground mt-2">Manage employee promotions, grade upgrades and salary revisions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Promotions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved This Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹2.5 Cr</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Used Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹1.2 Cr</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="create" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">New Promotion</TabsTrigger>
            <TabsTrigger value="requests">Promotion Queue</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Promotion Proposal</CardTitle>
                <CardDescription>Create new promotion request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rajesh">Rajesh Kumar</SelectItem>
                        <SelectItem value="priya">Priya Sharma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Grade</Label>
                    <Input placeholder="Auto-filled" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Promoted Grade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a1">A1</SelectItem>
                        <SelectItem value="a2">A2</SelectItem>
                        <SelectItem value="b1">B1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>New Designation</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="senior">Senior Role</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Salary</Label>
                    <Input placeholder="Auto-filled" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>New Salary</Label>
                    <Input type="number" placeholder="₹" />
                  </div>
                  <div className="space-y-2">
                    <Label>Effective Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Arrears Period</Label>
                    <Input type="month" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Promotion Reason</Label>
                  <Textarea placeholder="Performance, skill set, leadership..." rows={4} />
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm font-medium mb-3">Salary Comparison</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Current CTC</p>
                      <p className="text-lg font-bold">₹70,000/month</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">New CTC</p>
                      <p className="text-lg font-bold text-green-600">₹85,000/month</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Increment</p>
                      <p className="text-lg font-bold">₹15,000 (21%)</p>
                    </div>
                  </div>
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
                <CardTitle>Promotion Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{promo.employee}</h3>
                          <Badge className="mt-1">{promo.status}</Badge>
                        </div>
                        <Badge variant="outline">{promo.date}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">From</p>
                          <p className="font-medium">{promo.from}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">To</p>
                          <p className="font-medium">{promo.to}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Grade</p>
                          <p className="font-medium">{promo.grade}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Salary</p>
                          <p className="font-medium text-green-600">{promo.salary}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">View Details</Button>
                        {promo.status === 'Pending' && (
                          <>
                            <Button size="sm">Approve</Button>
                            <Button size="sm" variant="destructive">Reject</Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Promotion Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-secondary/50 rounded">
                      <span>Q1 2026</span>
                      <span className="font-bold">5 promotions</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary/50 rounded">
                      <span>Q4 2025</span>
                      <span className="font-bold">3 promotions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Budget Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Budget Used</span>
                      <span>48%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div className="bg-gradient-to-r from-primary to-accent rounded-full h-3" style={{ width: '48%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
