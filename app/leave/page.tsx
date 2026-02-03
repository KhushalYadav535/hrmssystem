'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar as CalendarIcon, Check, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import apiService from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function LeavePage() {
  const { isAuthenticated, hasPermission, user } = useAuth();
  const { toast } = useToast();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    reason: '',
  });

  if (!isAuthenticated) {
    redirect('/login');
  }

  const [allLeaves, setAllLeaves] = useState<any[]>([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(true);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);

  useEffect(() => {
    loadCurrentEmployee();
  }, []);

  useEffect(() => {
    if (currentEmployee) {
      loadLeaves();
      loadLeaveBalances();
    }
  }, [currentEmployee]);

  const loadCurrentEmployee = async () => {
    try {
      // Get current user's employee record
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
      const employeeId = currentEmployee._id || currentEmployee.id;
      const response = await apiService.getLeaveBalance(employeeId);
      if (response.success && response.data) {
        setLeaveBalances(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load leave balances', error);
    }
  };

  const loadLeaves = async () => {
    try {
      setIsLoadingLeaves(true);
      const response = await apiService.getLeaves();
      if (response.success && response.data) {
        setAllLeaves(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load leaves', error);
    } finally {
      setIsLoadingLeaves(false);
    }
  };

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

  const handleApplyLeave = async () => {
    try {
      if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      const payload = {
        leaveType: formData.leaveType,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        reason: formData.reason,
        employeeId: user?.id,
      };

      const response = await apiService.createLeave(payload);

      if (response.success) {
        toast({
          title: "Success",
          description: "Leave request submitted successfully",
        });
        setIsApplyDialogOpen(false);
        setFormData({
          leaveType: '',
          startDate: undefined,
          endDate: undefined,
          reason: '',
        });
        loadLeaves(); // Reload leaves after successful submission
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to submit leave request",
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
            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Apply Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to submit your leave request.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="leave-type">Leave Type</Label>
                    <Select
                      value={formData.leaveType}
                      onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
                    >
                      <SelectTrigger id="leave-type">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                        <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                        <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                        <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                        <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) => setFormData({ ...formData, startDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.endDate}
                            onSelect={(date) => setFormData({ ...formData, endDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please provide a reason for your leave"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleApplyLeave} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Leave Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaveBalances.length > 0 ? (
            leaveBalances.map((balance) => (
              <Card key={balance.leaveType} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm text-muted-foreground">{balance.leaveType}</p>
                    <div className="flex gap-2 mt-2">
                      <div>
                        <p className="text-2xl font-bold">{balance.available}</p>
                        <p className="text-xs text-muted-foreground">Available</p>
                      </div>
                      <div className="border-l pl-4">
                        <p className="text-2xl font-bold">{balance.used}</p>
                        <p className="text-xs text-muted-foreground">Used</p>
                      </div>
                    </div>
                    {balance.carryForward && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Max carry forward: {balance.maxCarryForward} days
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-4 text-muted-foreground">
              {currentEmployee ? 'Loading leave balances...' : 'Employee record not found. Please contact HR.'}
            </div>
          )}
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
                {isLoadingLeaves ? (
                  <div className="text-center py-4 text-muted-foreground">Loading leaves...</div>
                ) : allLeaves.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No leave requests found</div>
                ) : (
                  allLeaves.map((leave) => {
                    const leaveId = leave._id || leave.id;
                    const startDate = leave.startDate ? new Date(leave.startDate).toLocaleDateString() : '';
                    const endDate = leave.endDate ? new Date(leave.endDate).toLocaleDateString() : '';
                    const days = leave.days || (leave.startDate && leave.endDate ? 
                      Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0);
                    return (
                      <div key={leaveId} className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <p className="font-semibold text-sm">{leave.leaveType}</p>
                            <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {startDate} to {endDate} ({days} days)
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Reason: {leave.reason}</p>
                          {leave.approvedBy && (
                            <p className="text-xs text-muted-foreground">Approved by: {leave.approvedBy}</p>
                          )}
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
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3">
                {isLoadingLeaves ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : pendingLeaves.length > 0 ? (
                  pendingLeaves.map((leave) => {
                    const leaveId = leave._id || leave.id;
                    const startDate = leave.startDate ? new Date(leave.startDate).toLocaleDateString() : '';
                    const endDate = leave.endDate ? new Date(leave.endDate).toLocaleDateString() : '';
                    return (
                      <div key={leaveId} className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                        <p className="font-semibold text-sm mb-1">{leave.leaveType}</p>
                        <p className="text-sm text-muted-foreground">
                          {startDate} to {endDate}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No pending leave requests</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-3">
                {isLoadingLeaves ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : approvedLeaves.length > 0 ? (
                  approvedLeaves.map((leave) => {
                    const leaveId = leave._id || leave.id;
                    const startDate = leave.startDate ? new Date(leave.startDate).toLocaleDateString() : '';
                    const endDate = leave.endDate ? new Date(leave.endDate).toLocaleDateString() : '';
                    const days = leave.days || (leave.startDate && leave.endDate ? 
                      Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0);
                    return (
                      <div key={leaveId} className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-lg">
                        <p className="font-semibold text-sm mb-1">{leave.leaveType}</p>
                        <p className="text-sm text-muted-foreground">
                          {startDate} to {endDate} ({days} days)
                        </p>
                      </div>
                    );
                  })
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
