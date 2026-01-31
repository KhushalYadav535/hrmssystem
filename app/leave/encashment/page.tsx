'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, DollarSign, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function LeaveEncashmentPage() {
  const { isAuthenticated } = useAuth();
  const [selectedLeaves, setSelectedLeaves] = useState<string[]>([]);

  if (!isAuthenticated) {
    redirect('/login');
  }

  const leaveBalance = {
    annual: 12,
    casual: 8,
    sick: 10,
    compensatory: 3,
  };

  const encashmentRequests = [
    { id: 1, leaveType: 'Annual Leave', days: 5, amount: 25000, date: '2026-01-31', status: 'Approved', paidDate: '2026-02-05' },
    { id: 2, leaveType: 'Casual Leave', days: 3, amount: 15000, date: '2025-12-20', status: 'Approved', paidDate: '2025-12-25' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Encashment</h1>
          <p className="text-muted-foreground mt-2">Request encashment of unused leave balance</p>
        </div>

        <Tabs defaultValue="new-request" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new-request">New Request</TabsTrigger>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="new-request">
            <div className="space-y-6">
              {/* Eligibility Check */}
              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Check</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Eligible for Encashment</p>
                      <p className="text-xs text-muted-foreground">You can encash up to 10 days of annual leave</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Balance */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Leave Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Annual Leave</p>
                      <p className="text-2xl font-bold text-blue-600">{leaveBalance.annual}</p>
                      <p className="text-xs text-muted-foreground mt-1">Eligible: 10</p>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Casual Leave</p>
                      <p className="text-2xl font-bold text-yellow-600">{leaveBalance.casual}</p>
                      <p className="text-xs text-muted-foreground mt-1">Not encashable</p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Sick Leave</p>
                      <p className="text-2xl font-bold text-green-600">{leaveBalance.sick}</p>
                      <p className="text-xs text-muted-foreground mt-1">Not encashable</p>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Compensatory Off</p>
                      <p className="text-2xl font-bold text-purple-600">{leaveBalance.compensatory}</p>
                      <p className="text-xs text-muted-foreground mt-1">Eligible: 3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Encashment Request Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Encashment Request</CardTitle>
                  <CardDescription>Select leaves you want to encash</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="annual-10" 
                          className="w-5 h-5"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeaves([...selectedLeaves, 'annual-10']);
                            } else {
                              setSelectedLeaves(selectedLeaves.filter(l => l !== 'annual-10'));
                            }
                          }}
                        />
                        <label htmlFor="annual-10" className="flex-1 cursor-pointer">
                          <div className="font-medium">Annual Leave - 10 Days</div>
                          <p className="text-sm text-muted-foreground">Daily Rate: ₹2,500 | Total: ₹25,000</p>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="comp-3" 
                          className="w-5 h-5"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeaves([...selectedLeaves, 'comp-3']);
                            } else {
                              setSelectedLeaves(selectedLeaves.filter(l => l !== 'comp-3'));
                            }
                          }}
                        />
                        <label htmlFor="comp-3" className="flex-1 cursor-pointer">
                          <div className="font-medium">Compensatory Off - 3 Days</div>
                          <p className="text-sm text-muted-foreground">Daily Rate: ₹2,500 | Total: ₹7,500</p>
                        </label>
                      </div>
                    </div>
                  </div>

                  {selectedLeaves.length > 0 && (
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Total Encashment Amount</p>
                      <p className="text-2xl font-bold text-green-600">₹{selectedLeaves.includes('annual-10') && selectedLeaves.includes('comp-3') ? '32,500' : selectedLeaves.includes('annual-10') ? '25,000' : '7,500'}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Reason for Encashment</Label>
                    <textarea className="w-full p-3 border border-border rounded-lg" placeholder="Mention reason if any" rows={3} />
                  </div>

                  <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" disabled={selectedLeaves.length === 0}>
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Encashment Request
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="my-requests">
            <Card>
              <CardHeader>
                <CardTitle>Encashment Request History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {encashmentRequests.map((req) => (
                    <div key={req.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{req.leaveType}</h3>
                          <p className="text-sm text-muted-foreground">{req.days} days</p>
                        </div>
                        <Badge className="bg-green-600">{req.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-semibold">₹{req.amount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Requested</p>
                          <p className="font-semibold">{req.date}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-semibold">{req.status}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Paid Date</p>
                          <p className="font-semibold">{req.paidDate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle>Leave Encashment Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Policy Details</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Encashable Leave:</strong> Annual Leave and Compensatory Off only</li>
                    <li>• <strong>Maximum:</strong> 10 days of Annual Leave per year</li>
                    <li>• <strong>Minimum Balance:</strong> Must retain at least 2 days</li>
                    <li>• <strong>Rate:</strong> Based on gross daily salary</li>
                    <li>• <strong>Processing:</strong> Encashed amount credited within 5 working days</li>
                    <li>• <strong>Tax:</strong> Encashment amount subject to income tax</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
