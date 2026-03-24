'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
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
import { CheckCircle2, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function LeaveEncashmentPage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [selectedLeaves, setSelectedLeaves] = useState<string[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [encashmentRequests, setEncashmentRequests] = useState<any[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    days: '',
    reason: '',
  });

  if (!isAuthenticated) {
    redirect('/login');
  }

  useEffect(() => {
    loadCurrentEmployee();
  }, []);

  useEffect(() => {
    if (currentEmployee) {
      loadLeaveBalances();
      loadEncashmentRequests();
    }
  }, [currentEmployee]);

  const loadCurrentEmployee = async () => {
    try {
      const empResponse = await apiService.getEmployees({ email: user?.email });
      if (empResponse.success && empResponse.data && Array.isArray(empResponse.data) && empResponse.data.length > 0) {
        setCurrentEmployee(empResponse.data[0]);
      }
    } catch (error) {
      console.error('Failed to load current employee', error);
    }
  };

  const loadLeaveBalances = async () => {
    if (!currentEmployee?._id && !currentEmployee?.id) return;
    try {
      setIsLoading(true);
      const employeeId = currentEmployee._id || currentEmployee.id;
      const response = await apiService.getLeaveBalance(employeeId);
      if (response.success && response.data) {
        setLeaveBalances(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load leave balances', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEncashmentRequests = async () => {
    if (!currentEmployee?._id && !currentEmployee?.id) return;
    try {
      const employeeId = currentEmployee._id || currentEmployee.id;
      const response = await apiService.getLeaveEncashments({ employeeId });
      if (response.success && response.data) {
        setEncashmentRequests(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load encashment requests', error);
    }
  };

  const handleSubmitEncashment = async () => {
    if (!formData.leaveType || !formData.days || !currentEmployee) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const employeeId = currentEmployee._id || currentEmployee.id;
      const response = await apiService.createLeaveEncashment({
        employeeId,
        leaveType: formData.leaveType,
        days: parseInt(formData.days),
        reason: formData.reason,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Leave encashment request submitted successfully",
        });
        setFormData({ leaveType: '', days: '', reason: '' });
        setSelectedLeaves([]);
        loadEncashmentRequests();
        loadLeaveBalances();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to submit encashment request",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter encashable leave types (Annual Leave, Compensatory Off)
  const encashableBalances = leaveBalances.filter(b => 
    b.leaveType.toLowerCase().includes('annual') || 
    b.leaveType.toLowerCase().includes('compensatory')
  );

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
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {leaveBalances.map((balance) => {
                        const isEncashable = balance.leaveType.toLowerCase().includes('annual') || 
                                            balance.leaveType.toLowerCase().includes('compensatory');
                        return (
                          <div 
                            key={balance.leaveType} 
                            className={`p-4 border rounded-lg ${
                              isEncashable 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <p className="text-xs text-muted-foreground mb-2">{balance.leaveType}</p>
                            <p className={`text-2xl font-bold ${
                              isEncashable ? 'text-blue-600' : 'text-gray-600'
                            }`}>
                              {balance.available || balance.currentBalance || 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {isEncashable ? `Eligible: ${Math.min(balance.available || 0, 10)}` : 'Not encashable'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Encashment Request Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Encashment Request</CardTitle>
                  <CardDescription>Select leave type and days you want to encash</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="leave-type">Leave Type *</Label>
                      <Select
                        value={formData.leaveType}
                        onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
                      >
                        <SelectTrigger id="leave-type">
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          {encashableBalances.map((balance) => (
                            <SelectItem key={balance.leaveType} value={balance.leaveType}>
                              {balance.leaveType} (Available: {balance.available || balance.currentBalance || 0} days)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="days">Number of Days *</Label>
                      <Input
                        id="days"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.days}
                        onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                        placeholder="Enter number of days (max 10)"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="reason">Reason for Encashment</Label>
                      <textarea
                        id="reason"
                        className="w-full p-3 border border-border rounded-lg"
                        placeholder="Mention reason if any"
                        rows={3}
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full gap-2 bg-green-600 hover:bg-green-700" 
                    disabled={!formData.leaveType || !formData.days || isSubmitting}
                    onClick={handleSubmitEncashment}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Submit Encashment Request
                      </>
                    )}
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
                {encashmentRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No encashment requests found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {encashmentRequests.map((req) => {
                      const reqId = req._id || req.id;
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'Approved':
                          case 'Processed':
                          case 'Paid':
                            return 'bg-green-600';
                          case 'Rejected':
                            return 'bg-red-600';
                          default:
                            return 'bg-yellow-600';
                        }
                      };
                      return (
                        <div key={reqId} className="p-4 border border-border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">{req.leaveType}</h3>
                              <p className="text-sm text-muted-foreground">{req.days} days</p>
                            </div>
                            <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Amount</p>
                              <p className="font-semibold">₹{req.encashmentAmount?.toLocaleString() || '0'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Requested</p>
                              <p className="font-semibold">
                                {req.requestedDate ? formatDateDDMMYYYY(req.requestedDate) : '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Status</p>
                              <p className="font-semibold">{req.status}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Paid Date</p>
                              <p className="font-semibold">
                                {req.paymentDate ? formatDateDDMMYYYY(req.paymentDate) : '-'}
                              </p>
                            </div>
                          </div>
                          {req.reason && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-muted-foreground">
                                <strong>Reason:</strong> {req.reason}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
