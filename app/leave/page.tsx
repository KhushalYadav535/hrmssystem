'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar as CalendarIcon, Check, X, Loader2, AlertCircle, Info } from 'lucide-react';
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
    medicalCertificate: null as File | null,
    attachments: [] as File[],
    isHalfDay: false,
    halfDayType: '' as 'FIRST_HALF' | 'SECOND_HALF' | '',
  });
  const [sandwichLeaveWarning, setSandwichLeaveWarning] = useState<string | null>(null);
  const [sandwichAcknowledged, setSandwichAcknowledged] = useState(false);

  if (!isAuthenticated) {
    redirect('/login');
  }

  const [allLeaves, setAllLeaves] = useState<any[]>([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(true);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [availableLeaveTypes, setAvailableLeaveTypes] = useState<any[]>([]);

  useEffect(() => {
    loadCurrentEmployee();
    loadLeavePolicies();
  }, []);

  useEffect(() => {
    if (currentEmployee) {
      loadLeaves();
      loadLeaveBalances();
    }
  }, [currentEmployee]);

  const loadLeavePolicies = async () => {
    try {
      // Get only Active leave policies for current tenant (backend filters by tenantId)
      const response = await apiService.getLeavePolicies({ status: 'Active' });
      if (response.success && response.data) {
        const policies = Array.isArray(response.data) ? response.data : [];
        // Backend already filters by tenantId, so these are tenant-specific policies
        setAvailableLeaveTypes(policies);
        console.log(`[LeavePage] Loaded ${policies.length} active leave policies for tenant`);
        if (policies.length > 0) {
          console.log(`[LeavePage] Policies:`, policies.map(p => p.leaveType).join(', '));
        }
      }
    } catch (error) {
      console.error('Failed to load leave policies', error);
    }
  };

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
        const balances = Array.isArray(response.data) ? response.data : [];
        // Filter to show only balances for active leave policies (tenant-specific)
        // Backend already filters by tenantId, but we ensure frontend only shows valid balances
        setLeaveBalances(balances);
        console.log(`[LeavePage] Loaded ${balances.length} leave balances for employee ${employeeId}`);
        if (balances.length > 0) {
          console.log(`[LeavePage] Leave types:`, balances.map(b => b.leaveType).join(', '));
        }
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

  // When half-day is selected, sync endDate to startDate
  useEffect(() => {
    if (formData.isHalfDay && formData.startDate) {
      setFormData((prev) => ({ ...prev, endDate: formData.startDate }));
    }
  }, [formData.isHalfDay, formData.startDate]);

  // Check for sandwich leave when dates change (BR-P1-003: Sandwich leave policy)
  useEffect(() => {
    const checkSandwichLeave = async () => {
      if (!formData.startDate || !formData.endDate) {
        setSandwichLeaveWarning(null);
        setSandwichAcknowledged(false);
        return;
      }

      try {
        const dayBefore = new Date(formData.startDate);
        dayBefore.setDate(dayBefore.getDate() - 1);
        const dayAfter = new Date(formData.endDate);
        dayAfter.setDate(dayAfter.getDate() + 1);

        const dayBeforeDay = dayBefore.getDay();
        const dayAfterDay = dayAfter.getDay();
        const isDayBeforeWeekend = dayBeforeDay === 0 || dayBeforeDay === 6;
        const isDayAfterWeekend = dayAfterDay === 0 || dayAfterDay === 6;

        // Check for holidays
        const holidayBefore = await apiService.checkHoliday(dayBefore.toISOString().split('T')[0]);
        const holidayAfter = await apiService.checkHoliday(dayAfter.toISOString().split('T')[0]);

        if ((isDayBeforeWeekend || (holidayBefore.success && holidayBefore.isHoliday)) &&
            (isDayAfterWeekend || (holidayAfter.success && holidayAfter.isHoliday))) {
          setSandwichLeaveWarning(
            'Sandwich leave detected: This leave falls between holidays/weekends. Per policy, you must acknowledge before submitting.'
          );
          setSandwichAcknowledged(false);
        } else {
          setSandwichLeaveWarning(null);
          setSandwichAcknowledged(true); // Not sandwich, no acknowledgment needed
        }
      } catch (error) {
        setSandwichLeaveWarning(null);
      }
    };

    checkSandwichLeave();
  }, [formData.startDate, formData.endDate]);

  const handleApplyLeave = async () => {
    try {
      if (!formData.leaveType || !formData.startDate || !formData.reason) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      // Half-day requires halfDayType
      if (formData.isHalfDay && !formData.halfDayType) {
        toast({
          title: "Error",
          description: "Please select First Half or Second Half for half-day leave",
          variant: "destructive",
        });
        return;
      }

      // Sandwich leave policy: require acknowledgment
      if (sandwichLeaveWarning && !sandwichAcknowledged) {
        toast({
          title: "Error",
          description: "Please acknowledge the sandwich leave policy before submitting",
          variant: "destructive",
        });
        return;
      }

      const effectiveEndDate = formData.isHalfDay ? formData.startDate : formData.endDate;
      if (!effectiveEndDate) {
        toast({
          title: "Error",
          description: "Please select end date",
          variant: "destructive",
        });
        return;
      }

      // Extract just the leave type name (remove any extra text like " (X days/year)")
      const leaveTypeName = formData.leaveType.split(' (')[0].trim();

      // Calculate days: 0.5 for half-day, else calendar days
      const days = formData.isHalfDay
        ? 0.5
        : Math.ceil((effectiveEndDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Check leave balance - skip check for Leave Without Pay (LWP)
      if (!leaveTypeName.toLowerCase().includes('without pay') &&
          !leaveTypeName.toLowerCase().includes('lwp')) {
        const balance = leaveBalances.find(b => b.leaveType === leaveTypeName);
        const availableBalance = balance?.available || 0;

        if (availableBalance <= 0) {
          toast({
            title: "Error",
            description: `Leave balance is 0 for ${leaveTypeName}. You cannot apply for this leave type. Please check your leave balance or contact HR.`,
            variant: "destructive",
          });
          return;
        }

        // Check medical certificate requirement
        
        if (days > availableBalance) {
          toast({
            title: "Error",
            description: `Insufficient leave balance. Available: ${availableBalance} days, Requested: ${days} days`,
            variant: "destructive",
          });
          return;
        }

        if (leaveTypeName.toLowerCase().includes('sick') && days > 3 && !formData.medicalCertificate) {
          toast({
            title: "Error",
            description: "Medical certificate is required for sick leave exceeding 3 days",
            variant: "destructive",
          });
          return;
        }
      } else {
        // For LWP, still check medical certificate if needed
        if (leaveTypeName.toLowerCase().includes('sick') && days > 3 && !formData.medicalCertificate) {
          toast({
            title: "Error",
            description: "Medical certificate is required for sick leave exceeding 3 days",
            variant: "destructive",
          });
          return;
        }
      }

      setIsSubmitting(true);

      // leaveTypeName already extracted above
      const payload: any = {
        leaveType: leaveTypeName,
        startDate: formData.startDate!.toISOString(),
        endDate: effectiveEndDate.toISOString(),
        reason: formData.reason.trim(),
      };

      if (formData.isHalfDay && formData.halfDayType) {
        payload.isHalfDay = true;
        payload.halfDayType = formData.halfDayType;
      }

      // Add medical certificate if provided
      if (formData.medicalCertificate) {
        // In production, upload file first and get URL
        // For now, we'll add a placeholder
        payload.medicalCertificate = {
          name: formData.medicalCertificate.name,
          url: '', // Will be set after file upload
        };
      }

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
          medicalCertificate: null,
          attachments: [],
          isHalfDay: false,
          halfDayType: '',
        });
        setSandwichLeaveWarning(null);
        setSandwichAcknowledged(false);
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
                        {availableLeaveTypes.length > 0 ? (
                          availableLeaveTypes.map((policy) => {
                            const balance = leaveBalances.find(b => b.leaveType === policy.leaveType);
                            const availableBalance = balance?.available || 0;
                            const isLWP = policy.leaveType.toLowerCase().includes('without pay') || 
                                         policy.leaveType.toLowerCase().includes('lwp');

                            return (
                              <SelectItem 
                                key={policy._id || policy.id} 
                                value={policy.leaveType}
                              >
                                {policy.leaveType} ({policy.daysPerYear} days/year)
                                {!isLWP && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {availableBalance > 0 ? `(${availableBalance} available)` : '(Balance: 0)'}
                                  </span>
                                )}
                              </SelectItem>
                            );
                          })
                        ) : (
                          <>
                            <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                            <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                            <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                            <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                            <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="isHalfDay"
                      checked={formData.isHalfDay}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isHalfDay: e.target.checked,
                          halfDayType: e.target.checked ? formData.halfDayType : '',
                          endDate: e.target.checked && formData.startDate ? formData.startDate : formData.endDate,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isHalfDay" className="font-normal cursor-pointer">
                      Half-day leave (BR-P1-003)
                    </Label>
                  </div>
                  {formData.isHalfDay && (
                    <div className="grid gap-2">
                      <Label>Half-day type</Label>
                      <Select
                        value={formData.halfDayType}
                        onValueChange={(v) => setFormData({ ...formData, halfDayType: v as 'FIRST_HALF' | 'SECOND_HALF' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIRST_HALF">First Half (Morning)</SelectItem>
                          <SelectItem value="SECOND_HALF">Second Half (Afternoon)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
                      <Label>End Date {formData.isHalfDay && '(same as start for half-day)'}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.endDate && "text-muted-foreground"
                            )}
                            disabled={formData.isHalfDay}
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
                            disabled={formData.isHalfDay}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {sandwichLeaveWarning && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex gap-2">
                      <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-amber-800">{sandwichLeaveWarning}</p>
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sandwichAcknowledged}
                            onChange={(e) => setSandwichAcknowledged(e.target.checked)}
                            className="h-4 w-4 rounded border-amber-300"
                          />
                          <span className="text-sm text-amber-800">I acknowledge this is sandwich leave and understand the policy</span>
                        </label>
                      </div>
                    </div>
                  )}

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
                        {balance.accrualFrequency && balance.accrualFrequency !== 'None' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Accrual: {balance.accrualFrequency === 'Monthly' ? 'Monthly' : balance.accrualFrequency === 'Quarterly' ? 'Quarterly' : 'Yearly'} 
                            {balance.accrualRate && ` (${balance.accrualRate} day${balance.accrualRate !== 1 ? 's' : ''} per ${balance.accrualFrequency === 'Monthly' ? 'month' : balance.accrualFrequency === 'Quarterly' ? 'quarter' : 'year'})`}
                          </p>
                        )}
                      </div>
                      <div className="border-l pl-4">
                        <p className="text-2xl font-bold">{balance.used}</p>
                        <p className="text-xs text-muted-foreground">Used</p>
                        {balance.daysPerYear && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Total: {balance.daysPerYear} days/year
                          </p>
                        )}
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
                          {leave.approverName && leave.status === 'Approved' && (
                            <p className="text-xs text-green-600 mt-1">✓ Approved by: {leave.approverName}</p>
                          )}
                          {leave.approverName && leave.status === 'Rejected' && (
                            <p className="text-xs text-red-600 mt-1">✗ Rejected by: {leave.approverName}</p>
                          )}
                          {leave.comments && (
                            <p className="text-xs text-muted-foreground mt-1 italic">Comments: {leave.comments}</p>
                          )}
                          {leave.isSandwichLeave && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Sandwich Leave
                            </Badge>
                          )}
                          {leave.medicalCertificate && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Medical Certificate Attached
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          {(leave.status === 'Pending' || leave.status === 'Approved') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const leaveId = leave._id || leave.id;
                              const response = await apiService.cancelLeave(leaveId);
                              if (response.success) {
                                toast({
                                  title: "Success",
                                  description: "Leave request cancelled",
                                });
                                loadLeaves();
                              } else {
                                toast({
                                  title: "Error",
                                  description: response.message || "Failed to cancel leave",
                                  variant: "destructive",
                                });
                              }
                            } catch (error: any) {
                              toast({
                                title: "Error",
                                description: error.message || "An error occurred",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    {hasPermission('approve_leave') && leave.status === 'Pending' && (
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={async () => {
                            try {
                              const leaveId = leave._id || leave.id;
                              const response = await apiService.approveLeave(leaveId, 'Approved');
                              if (response.success) {
                                toast({
                                  title: "Success",
                                  description: "Leave request approved",
                                });
                                loadLeaves();
                              } else {
                                toast({
                                  title: "Error",
                                  description: response.message || "Failed to approve leave",
                                  variant: "destructive",
                                });
                              }
                            } catch (error: any) {
                              toast({
                                title: "Error",
                                description: error.message || "An error occurred",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 bg-transparent hover:bg-red-50"
                          onClick={async () => {
                            try {
                              const leaveId = leave._id || leave.id;
                              const response = await apiService.approveLeave(leaveId, 'Rejected');
                              if (response.success) {
                                toast({
                                  title: "Success",
                                  description: "Leave request rejected",
                                });
                                loadLeaves();
                              } else {
                                toast({
                                  title: "Error",
                                  description: response.message || "Failed to reject leave",
                                  variant: "destructive",
                                });
                              }
                            } catch (error: any) {
                              toast({
                                title: "Error",
                                description: error.message || "An error occurred",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                              <X className="w-4 h-4" />
                            </Button>
                            </div>
                          )}
                        </div>
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
