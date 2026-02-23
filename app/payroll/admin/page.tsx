'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Eye, 
  Send, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  FileText, 
  TrendingUp,
  Users,
  Calculator,
  Building2,
  FileCheck,
  BarChart3,
  Settings,
  CheckSquare,
  Square
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function PayrollAdminDashboard() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [designationFilter, setDesignationFilter] = useState<string>('all');
  const [designations, setDesignations] = useState<string[]>([]);
  const [selectedPayrolls, setSelectedPayrolls] = useState<Set<string>>(new Set());
  const [selectedPayrollsForApproval, setSelectedPayrollsForApproval] = useState<Set<string>>(new Set());
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitComments, setSubmitComments] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveComments, setApproveComments] = useState('');

  useEffect(() => {
    loadPayrollData();
  }, [selectedMonth, selectedYear]);

  // Reset designation filter when month/year changes
  useEffect(() => {
    setDesignationFilter('all');
  }, [selectedMonth, selectedYear]);

  const loadPayrollData = async () => {
    try {
      setIsLoading(true);
      const [payrollsResponse, statsResponse] = await Promise.all([
        apiService.getPayrolls({ month: selectedMonth, year: parseInt(selectedYear) }),
        apiService.getPayrollStats({ month: selectedMonth, year: parseInt(selectedYear) })
      ]);

      if (payrollsResponse.success && payrollsResponse.data) {
        setPayrolls(Array.isArray(payrollsResponse.data) ? payrollsResponse.data : []);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Extract unique designations from payrolls
      if (payrollsResponse.success && payrollsResponse.data) {
        const payrollList = Array.isArray(payrollsResponse.data) ? payrollsResponse.data : [];
        const uniqueDesignations = [...new Set(
          payrollList
            .map((p: any) => p.employeeId?.designation)
            .filter((d: string) => d)
        )].sort();
        setDesignations(uniqueDesignations);
      }
    } catch (error) {
      console.error('Failed to load payroll data', error);
      toast.error('Failed to load payroll data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    try {
      setIsProcessing(true);
      const response = await apiService.processPayroll(selectedMonth, parseInt(selectedYear));
      
      if (response.success) {
        const processed = response.data?.processed || 0;
        const errors = response.errors || 0;
        const totalEmployees = response.totalEmployees || 0;
        const summary = response.data?.summaryByDesignation;
        
        let message = `Payroll processed successfully! ${processed} records created.`;
        if (errors > 0) {
          message += ` ${errors} employees skipped (check errors below).`;
        }
        if (summary && Object.keys(summary).length > 0) {
          const designationSummary = Object.entries(summary)
            .map(([desig, data]: [string, any]) => `${desig}: ${data.count}`)
            .join(', ');
          message += `\nBy Designation: ${designationSummary}`;
        }
        
        if (processed === 0) {
          toast.warning(
            `No payroll records created. ${errors > 0 ? `${errors} employees had errors.` : 'Please check if employees have salary assigned and payroll doesn\'t already exist for this period.'}`,
            { duration: 5000 }
          );
          
          // Show errors if any
          if (response.data?.errors && response.data.errors.length > 0) {
            const errorMessages = response.data.errors.slice(0, 5).map((e: any) => 
              `${e.employeeCode || e.employeeName}: ${e.error}`
            ).join('\n');
            console.error('Payroll Processing Errors:', response.data.errors);
            toast.error(`Errors:\n${errorMessages}`, { duration: 8000 });
          }
        } else {
          toast.success(message);
        }
        
        setProcessDialogOpen(false);
        loadPayrollData();
      } else {
        toast.error(response.message || 'Failed to process payroll');
        if (response.data?.errors && response.data.errors.length > 0) {
          console.error('Payroll Processing Errors:', response.data.errors);
        }
      }
    } catch (error: any) {
      console.error('Payroll processing error:', error);
      toast.error(error.message || 'Failed to process payroll');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewPayroll = (payroll: any) => {
    setSelectedPayroll(payroll);
    setViewDialogOpen(true);
  };

  const handleSubmitPayroll = async (payrollId: string, comments?: string) => {
    try {
      const response = await apiService.submitPayroll(payrollId, comments);
      if (response.success) {
        toast.success('Payroll submitted for approval');
        loadPayrollData();
        setSelectedPayrolls(new Set());
        setSubmitDialogOpen(false);
        setSubmitComments('');
      } else {
        toast.error(response.message || 'Failed to submit payroll');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit payroll');
    }
  };

  const handleBulkSubmitPayroll = async () => {
    if (selectedPayrolls.size === 0) {
      toast.error('Please select at least one payroll to submit');
      return;
    }

    try {
      const promises = Array.from(selectedPayrolls).map(id => 
        apiService.submitPayroll(id, submitComments || 'Bulk submitted for approval')
      );
      const results = await Promise.allSettled(promises);
      
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} payroll(s) submitted for approval${failCount > 0 ? ` (${failCount} failed)` : ''}`);
        loadPayrollData();
        setSelectedPayrolls(new Set());
        setSubmitDialogOpen(false);
        setSubmitComments('');
      } else {
        toast.error('Failed to submit payrolls');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit payrolls');
    }
  };

  const togglePayrollSelection = (payrollId: string) => {
    const newSelected = new Set(selectedPayrolls);
    if (newSelected.has(payrollId)) {
      newSelected.delete(payrollId);
    } else {
      newSelected.add(payrollId);
    }
    setSelectedPayrolls(newSelected);
  };

  const selectAllDraftPayrolls = () => {
    const draftPayrolls = payrolls.filter((p: any) => p.status === 'Draft');
    setSelectedPayrolls(new Set(draftPayrolls.map((p: any) => p._id || p.id)));
  };

  const clearSelection = () => {
    setSelectedPayrolls(new Set());
  };

  const handleApprovePayroll = async (payrollId: string, comments?: string) => {
    try {
      const response = await apiService.approvePayroll(payrollId, comments);
      if (response.success) {
        toast.success('Payroll approved successfully');
        loadPayrollData();
        // Remove from selected list
        const newSelected = new Set(selectedPayrollsForApproval);
        newSelected.delete(payrollId);
        setSelectedPayrollsForApproval(newSelected);
      } else {
        toast.error(response.message || 'Failed to approve payroll');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve payroll');
    }
  };

  const handleBulkApprovePayroll = async () => {
    if (selectedPayrollsForApproval.size === 0) {
      toast.error('Please select at least one payroll to approve');
      return;
    }

    try {
      setIsProcessing(true);
      const promises = Array.from(selectedPayrollsForApproval).map(id => 
        apiService.approvePayroll(id, approveComments || 'Bulk approved by checker')
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`${successful} payroll(s) approved successfully`);
      }
      if (failed > 0) {
        toast.error(`${failed} payroll(s) failed to approve`);
      }

      setApproveDialogOpen(false);
      setApproveComments('');
      setSelectedPayrollsForApproval(new Set());
      loadPayrollData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve payrolls');
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePayrollSelectionForApproval = (payrollId: string) => {
    const newSelected = new Set(selectedPayrollsForApproval);
    if (newSelected.has(payrollId)) {
      newSelected.delete(payrollId);
    } else {
      newSelected.add(payrollId);
    }
    setSelectedPayrollsForApproval(newSelected);
  };

  const selectAllApprovablePayrolls = () => {
    const currentUserId = currentUser?.id || currentUser?._id;
    const approvablePayrolls = payrolls.filter((p: any) => {
      const payrollId = p._id || p.id;
      const isMaker = p.makerId && currentUserId && p.makerId.toString() === currentUserId.toString();
      const isPayrollAdmin = currentUser?.role === 'Payroll Administrator' || currentUser?.role === 'Finance Administrator' || currentUser?.role === 'Super Admin';
      const canApproveDraft = p.status === 'Draft' && isPayrollAdmin && (!p.makerId || !isMaker);
      const canApproveSubmitted = p.status === 'Submitted' && !isMaker && isPayrollAdmin;
      return canApproveDraft || canApproveSubmitted;
    });
    setSelectedPayrollsForApproval(new Set(approvablePayrolls.map((p: any) => p._id || p.id)));
  };

  const clearApprovalSelection = () => {
    setSelectedPayrollsForApproval(new Set());
  };

  const handleRejectPayroll = async (payrollId: string, reason: string) => {
    try {
      const response = await apiService.rejectPayroll(payrollId, reason);
      if (response.success) {
        toast.success('Payroll rejected');
        loadPayrollData();
      } else {
        toast.error(response.message || 'Failed to reject payroll');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject payroll');
    }
  };

  const handleFinalizePayroll = async (payrollId: string, comments?: string) => {
    try {
      const response = await apiService.finalizePayroll(payrollId, comments);
      if (response.success) {
        toast.success('Payroll finalized and marked as paid');
        loadPayrollData();
      } else {
        toast.error(response.message || 'Failed to finalize payroll');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to finalize payroll');
    }
  };

  if (!isAuthenticated) {
    redirect('/login');
  }

  // BRD Access Control:
  // - Payroll Administrator (Maker): Can CREATE, EDIT, SUBMIT payroll. Cannot APPROVE.
  // - Payroll Administrator (Checker): Can VIEW, APPROVE, REJECT payroll. Cannot EDIT or CREATE.
  // - HR Administrator: NOT ALLOWED (cannot process payroll or modify salary structures per BRD)
  // - Tenant Admin: View access (all reports)
  // - Finance Administrator: View access (financial reports)
  // - Auditor: Read-only access (view reports)
  // - Employee: Should use /payroll page (own payslip only)
  // - Manager: Should use /payroll page (team payslips)
  
  // BR-P0-001 Bug 4: Separate Maker and Checker permissions
  const allowedRoles = ['Payroll Administrator', 'Tenant Admin', 'Finance Administrator', 'Auditor', 'Super Admin'];
  
  // BR-P0-001 Bug 4: Maker can CREATE, EDIT, SUBMIT payroll (cannot APPROVE)
  // Checker can VIEW, APPROVE, REJECT (cannot EDIT or CREATE)
  // Logic: If user has process_payroll permission, they are Maker. If they have approve_payroll, they are Checker.
  // A user can be both Maker and Checker, but cannot approve their own created payrolls (enforced per transaction).
  const isMaker = hasPermission('process_payroll') || (currentUser?.role === 'Payroll Administrator' && !hasPermission('approve_payroll_only'));
  const isChecker = hasPermission('approve_payroll') || currentUser?.role === 'Payroll Administrator' || currentUser?.role === 'Finance Administrator';
  
  // BR-P0-001 Bug 4: Maker can process payroll, Checker cannot
  const canProcessPayroll = isMaker || currentUser?.role === 'Super Admin';
  
  // BR-P0-001 Bug 4: Checker can approve payroll (but not their own created ones - enforced per transaction)
  const canApprovePayroll = isChecker || currentUser?.role === 'Super Admin';
  
  const canViewPayroll = hasPermission('view_payroll_reports') || hasPermission('process_payroll') || hasPermission('approve_payroll') || allowedRoles.includes(currentUser?.role || '');

  if (!canViewPayroll && currentUser?.role !== 'Super Admin') {
    // Employees and Managers should use /payroll page
    if (currentUser?.role === 'Employee' || currentUser?.role === 'Manager') {
      redirect('/payroll');
    } else {
      redirect('/dashboard');
    }
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = ['2024', '2025', '2026', '2027'];

  const statusData = stats ? [
    { name: 'Draft', value: stats.statusBreakdown?.Draft || 0 },
    { name: 'Processed', value: stats.statusBreakdown?.Processed || 0 },
    { name: 'Paid', value: stats.statusBreakdown?.Paid || 0 },
    { name: 'Pending', value: stats.statusBreakdown?.Pending || 0 },
  ] : [];

  const deductionData = stats ? [
    { name: 'EPF', amount: stats.totalEPF || 0 },
    { name: 'ESI', amount: stats.totalESI || 0 },
    { name: 'Income Tax', amount: stats.totalIncomeTax || 0 },
    { name: 'Other', amount: stats.totalOtherDeductions || 0 },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payroll Administration</h1>
            <p className="text-muted-foreground mt-2">Manage payroll processing and statutory compliance</p>
          </div>
          {canProcessPayroll && (
            <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Play className="w-4 h-4" />
                  Process Payroll
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Payroll</DialogTitle>
                <DialogDescription>
                  Process payroll for all active employees for {selectedMonth} {selectedYear}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProcessPayroll} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Process Payroll'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>

        {/* Key Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalEmployees || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedMonth} {selectedYear}</p>
                  </div>
                  <Users className="w-10 h-10 text-primary/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Gross Salary</p>
                    <p className="text-2xl font-bold text-foreground">₹{((stats.totalGrossSalary || 0) / 100000).toFixed(1)}L</p>
                    <p className="text-xs text-muted-foreground mt-1">Before deductions</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-500/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Deductions</p>
                    <p className="text-2xl font-bold text-foreground">₹{((stats.totalDeductions || 0) / 100000).toFixed(1)}L</p>
                    <p className="text-xs text-muted-foreground mt-1">EPF, ESI, Tax</p>
                  </div>
                  <FileText className="w-10 h-10 text-red-500/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Payroll</p>
                    <p className="text-2xl font-bold text-green-600">₹{((stats.totalNetSalary || 0) / 10000000).toFixed(2)}Cr</p>
                    <p className="text-xs text-green-600 mt-1">After all deductions</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-500/30" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employee Salary Summary - Quick View */}
        {payrolls.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Employee Salary Summary - {selectedMonth} {selectedYear}
                  </CardTitle>
                  <CardDescription>
                    {payrolls.filter((p: any) => ['Processed', 'Paid'].includes(p.status)).length} employees processed out of {payrolls.length} total
                  </CardDescription>
                </div>
                {/* Bulk Approval Buttons */}
                {payrolls.some((p: any) => {
                  const currentUserId = currentUser?.id || currentUser?._id;
                  const isMaker = p.makerId && currentUserId && p.makerId.toString() === currentUserId.toString();
                  const isPayrollAdmin = currentUser?.role === 'Payroll Administrator' || currentUser?.role === 'Finance Administrator' || currentUser?.role === 'Super Admin';
                  const canApproveDraft = p.status === 'Draft' && isPayrollAdmin && (!p.makerId || !isMaker);
                  const canApproveSubmitted = p.status === 'Submitted' && !isMaker && isPayrollAdmin;
                  return canApproveDraft || canApproveSubmitted;
                }) && (
                  <div className="flex gap-2">
                    {selectedPayrollsForApproval.size > 0 && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => {
                            setApproveDialogOpen(true);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve Selected ({selectedPayrollsForApproval.size})
                        </Button>
                        <Button variant="ghost" size="sm" onClick={clearApprovalSelection}>
                          Clear
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={selectAllApprovablePayrolls}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Select All Approvable
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {payrolls.map((payroll: any) => {
                  const employee = payroll.employeeId;
                  const isProcessed = ['Processed', 'Paid'].includes(payroll.status);
                  const payrollId = payroll._id || payroll.id;
                  const currentUserId = currentUser?.id || currentUser?._id;
                  const isMaker = payroll.makerId && currentUserId && payroll.makerId.toString() === currentUserId.toString();
                  const isPayrollAdmin = currentUser?.role === 'Payroll Administrator' || currentUser?.role === 'Finance Administrator' || currentUser?.role === 'Super Admin';
                  const canApproveDraft = payroll.status === 'Draft' && isPayrollAdmin && (!payroll.makerId || !isMaker);
                  const canApproveSubmitted = payroll.status === 'Submitted' && !isMaker && isPayrollAdmin;
                  const canApprove = canApproveDraft || canApproveSubmitted;
                  const isSelectedForApproval = selectedPayrollsForApproval.has(payrollId);
                  
                  return (
                    <Card key={payrollId} className={`border-2 ${isProcessed ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10' : isSelectedForApproval ? 'border-green-400 bg-green-100/50 dark:bg-green-900/20' : 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10'}`}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              {/* Checkbox for bulk approval */}
                              {canApprove && (
                                <button
                                  onClick={() => togglePayrollSelectionForApproval(payrollId)}
                                  className="cursor-pointer"
                                  title={isSelectedForApproval ? 'Deselect for approval' : 'Select for approval'}
                                >
                                  {isSelectedForApproval ? (
                                    <CheckSquare className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Square className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </button>
                              )}
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{employee?.firstName || ''} {employee?.lastName || ''}</p>
                                <p className="text-xs text-muted-foreground">{employee?.employeeCode || ''} • {employee?.designation || ''}</p>
                              </div>
                            </div>
                            <Badge className={isProcessed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                              {payroll.status || 'Draft'}
                            </Badge>
                          </div>
                          <div className="pt-2 border-t space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Gross:</span>
                              <span className="font-medium">₹{((payroll.basicSalary || 0) + (payroll.da || 0) + (payroll.hra || 0) + (payroll.allowances || 0)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Deductions:</span>
                              <span className="font-medium text-red-600">-₹{((payroll.pfDeduction || 0) + (payroll.esiDeduction || 0) + (payroll.incomeTax || 0) + (payroll.otherDeductions || 0)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-1 border-t font-bold">
                              <span>Net Salary:</span>
                              <span className="text-green-600">₹{payroll.netSalary?.toLocaleString() || '0'}</span>
                            </div>
                          </div>
                          {/* Approve button for Draft/Submitted payrolls */}
                          {(payroll.status === 'Draft' || payroll.status === 'Submitted') && canApprove && (
                            <div className="pt-2 border-t">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApprovePayroll(payrollId)}
                                title={`Approve Payroll (${payroll.status})`}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payrolls">Payroll Records</TabsTrigger>
            <TabsTrigger value="by-designation">By Designation</TabsTrigger>
            <TabsTrigger value="employee-summary">Employee Summary</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payroll Summary */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Payroll Summary</CardTitle>
                  <CardDescription>{selectedMonth} {selectedYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Total Basic Salary</span>
                        <span className="font-semibold">₹{(stats?.totalBasicSalary || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>DA (Dearness Allowance)</span>
                        <span className="font-semibold">₹{(stats?.totalDA || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>HRA (House Rent Allowance)</span>
                        <span className="font-semibold">₹{(stats?.totalHRA || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Other Allowances</span>
                        <span className="font-semibold">₹{(stats?.totalAllowances || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-3">
                        <span>Gross Salary</span>
                        <span className="font-semibold">₹{((stats?.totalGrossSalary || 0) || ((stats?.totalBasicSalary || 0) + (stats?.totalDA || 0) + (stats?.totalHRA || 0) + (stats?.totalAllowances || 0))).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Total Deductions</span>
                        <span className="font-semibold">-₹{(stats?.totalDeductions || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-3 font-bold text-lg">
                        <span>Net Payroll</span>
                        <span className="text-green-600">₹{(stats?.totalNetSalary || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Breakdown */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Status Breakdown</CardTitle>
                  <CardDescription>Payroll processing status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Deductions Breakdown */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Deductions Breakdown</CardTitle>
                <CardDescription>{selectedMonth} {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deductionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="var(--color-primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Records Tab */}
          <TabsContent value="payrolls" className="space-y-4">
            {/* Filters */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex gap-4 items-end flex-wrap">
                  <div className="flex-1 min-w-64">
                    <Label className="text-sm font-semibold mb-2 block">Select Month</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-64">
                    <Label className="text-sm font-semibold mb-2 block">Select Year</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-64">
                    <Label className="text-sm font-semibold mb-2 block">Filter by Designation</Label>
                    <Select value={designationFilter} onValueChange={setDesignationFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Designations</SelectItem>
                        {designations.map((designation) => (
                          <SelectItem key={designation} value={designation}>
                            {designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Designation-wise Summary */}
            {stats?.byDesignation && Object.keys(stats.byDesignation).length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Summary by Designation</CardTitle>
                  <CardDescription>Payroll breakdown by employee designation/position</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(stats.byDesignation).map(([designation, data]: [string, any]) => (
                      <Card key={designation} className="border-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{designation}</CardTitle>
                          <CardDescription>{data.count} employees</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Gross Salary:</span>
                            <span className="font-semibold">₹{data.totalGross.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Deductions:</span>
                            <span className="font-semibold text-red-600">-₹{data.totalDeductions.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm border-t pt-2 font-bold">
                            <span>Net Salary:</span>
                            <span className="text-green-600">₹{data.totalNet.toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payroll Table */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Payroll Records</CardTitle>
                    <CardDescription>{payrolls.length} employees</CardDescription>
                  </div>
                  {canProcessPayroll && payrolls.filter((p: any) => p.status === 'Draft').length > 0 && (
                    <div className="flex gap-2">
                      {selectedPayrolls.size > 0 && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSubmitDialogOpen(true);
                            }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit Selected ({selectedPayrolls.size})
                          </Button>
                          <Button variant="ghost" size="sm" onClick={clearSelection}>
                            Clear
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={selectAllDraftPayrolls}
                      >
                        Select All Draft
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                  <tr className="border-b border-border">
                    {canProcessPayroll && (
                      <th className="text-left p-3 font-semibold w-12">
                        <CheckSquare className="w-4 h-4" />
                      </th>
                    )}
                    <th className="text-left p-3 font-semibold">Designation / Employee</th>
                    <th className="text-left p-3 font-semibold">Department</th>
                    <th className="text-right p-3 font-semibold">Basic</th>
                    <th className="text-right p-3 font-semibold">Allowances</th>
                    <th className="text-right p-3 font-semibold">Deductions</th>
                    <th className="text-right p-3 font-semibold">Net Salary</th>
                    <th className="text-center p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Maker/Checker</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={8} className="text-center p-6 text-muted-foreground">
                            Loading payroll data...
                          </td>
                        </tr>
                      ) : (() => {
                        // Filter payrolls by designation if filter is set
                        let filteredPayrolls = payrolls;
                        if (designationFilter !== 'all') {
                          filteredPayrolls = payrolls.filter(
                            (p: any) => p.employeeId?.designation === designationFilter
                          );
                        }

                        // Group by designation for organized display
                        const groupedByDesignation: Record<string, any[]> = {};
                        filteredPayrolls.forEach((payroll: any) => {
                          const designation = payroll.employeeId?.designation || 'Other';
                          if (!groupedByDesignation[designation]) {
                            groupedByDesignation[designation] = [];
                          }
                          groupedByDesignation[designation].push(payroll);
                        });

                        if (filteredPayrolls.length === 0) {
                          return (
                            <tr>
                              <td colSpan={(canProcessPayroll ? 1 : 0) + (payrolls.some((p: any) => {
                                const currentUserId = currentUser?.id || currentUser?._id;
                                const isMaker = p.makerId && currentUserId && p.makerId.toString() === currentUserId.toString();
                                const isPayrollAdmin = currentUser?.role === 'Payroll Administrator' || currentUser?.role === 'Finance Administrator' || currentUser?.role === 'Super Admin';
                                const canApproveDraft = p.status === 'Draft' && isPayrollAdmin && (!p.makerId || !isMaker);
                                const canApproveSubmitted = p.status === 'Submitted' && !isMaker && isPayrollAdmin;
                                return canApproveDraft || canApproveSubmitted;
                              }) ? 1 : 0) + 9} className="text-center p-6 text-muted-foreground">
                                No payroll records found for this period.
                              </td>
                            </tr>
                          );
                        }

                        // Render grouped by designation
                        return Object.entries(groupedByDesignation).map(([designation, designationPayrolls]) => [
                          // Designation Header Row
                          <tr key={`header-${designation}`} className="bg-secondary/50">
                            <td colSpan={canProcessPayroll ? 10 : 9} className="p-3 font-bold text-lg">
                              <div className="flex items-center justify-between">
                                <span>{designation}</span>
                                <Badge variant="outline">
                                  {designationPayrolls.length} {designationPayrolls.length === 1 ? 'employee' : 'employees'}
                                </Badge>
                              </div>
                            </td>
                          </tr>,
                          // Employee rows for this designation
                          ...designationPayrolls.map((payroll) => {
                          const employee = payroll.employeeId;
                          const payrollId = payroll._id || payroll.id;
                          const allowances = (payroll.da || 0) + (payroll.hra || 0) + (payroll.allowances || 0);
                          const deductions = (payroll.pfDeduction || 0) + (payroll.esiDeduction || 0) + (payroll.incomeTax || 0) + (payroll.otherDeductions || 0);
                          
                          const isSelected = selectedPayrolls.has(payrollId);
                          // Check if current user is the maker
                          // Note: currentUser uses 'id' field, not '_id'
                          const currentUserId = currentUser?.id || currentUser?._id;
                          const isMaker = payroll.makerId && currentUserId && payroll.makerId.toString() === currentUserId.toString();
                          
                          // Checker can approve Draft payrolls created by different Maker OR Submitted payrolls
                          // For Draft: If makerId is set, current user must NOT be the maker. If makerId is not set, allow approval (backward compatibility)
                          // For Submitted: Current user must NOT be the maker
                          const isPayrollAdmin = currentUser?.role === 'Payroll Administrator' || currentUser?.role === 'Finance Administrator' || currentUser?.role === 'Super Admin';
                          
                          // Draft approval: Allow if makerId is not set (backward compatibility) OR if makerId is set and user is not the maker
                          const canApproveDraft = payroll.status === 'Draft' && 
                            isPayrollAdmin && 
                            (!payroll.makerId || !isMaker); // Allow if no makerId OR if makerId exists and user is not the maker
                          
                          // Submitted approval: Only if user is not the maker
                          const canApproveSubmitted = payroll.status === 'Submitted' && 
                            !isMaker && 
                            isPayrollAdmin;
                          
                          const canApprove = canApproveDraft || canApproveSubmitted;
                          const canSubmit = payroll.status === 'Draft' && canProcessPayroll && !isMaker; // Maker can submit their own Draft payrolls
                          
                          // Debug logging (remove in production)
                          if ((payroll.status === 'Draft' || payroll.status === 'Submitted') && isPayrollAdmin) {
                            console.log(`[Payroll ${payrollId}] Status: ${payroll.status}, MakerId: ${payroll.makerId || 'NOT SET'}, CurrentUserId: ${currentUserId || 'NOT SET'}, IsMaker: ${isMaker}, CanApproveDraft: ${canApproveDraft}, CanApproveSubmitted: ${canApproveSubmitted}, CanApprove: ${canApprove}, Role: ${currentUser?.role}`);
                          }
                          
                          return (
                            <tr key={payrollId} className="border-b border-border hover:bg-secondary/50">
                              {canProcessPayroll && (
                                <td className="p-3">
                                  {payroll.status === 'Draft' ? (
                                    <button
                                      onClick={() => togglePayrollSelection(payrollId)}
                                      className="cursor-pointer"
                                    >
                                      {isSelected ? (
                                        <CheckSquare className="w-4 h-4 text-primary" />
                                      ) : (
                                        <Square className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </button>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </td>
                              )}
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{employee?.firstName || ''} {employee?.lastName || ''}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {employee?.employeeCode || ''}
                                    {employee?.designation && ` • ${employee.designation}`}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">{employee?.department || '-'}</td>
                              <td className="text-right p-3">₹{payroll.basicSalary?.toLocaleString() || '0'}</td>
                              <td className="text-right p-3">₹{allowances.toLocaleString()}</td>
                              <td className="text-right p-3 text-red-600">-₹{deductions.toLocaleString()}</td>
                              <td className="text-right p-3 font-semibold text-green-600">₹{payroll.netSalary?.toLocaleString() || '0'}</td>
                              <td className="text-center p-3">
                                <Badge 
                                  className={
                                    payroll.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                    payroll.status === 'Processed' ? 'bg-blue-100 text-blue-700' :
                                    payroll.status === 'Approved' ? 'bg-purple-100 text-purple-700' :
                                    payroll.status === 'Submitted' ? 'bg-yellow-100 text-yellow-700' :
                                    payroll.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                                    'bg-red-100 text-red-700'
                                  }
                                >
                                  {payroll.status || 'Pending'}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="text-xs space-y-1">
                                  {payroll.makerName && (
                                    <div>
                                      <span className="text-muted-foreground">Maker:</span>
                                      <span className="ml-1 font-medium">{payroll.makerName}</span>
                                    </div>
                                  )}
                                  {payroll.checkerName && (
                                    <div>
                                      <span className="text-muted-foreground">Checker:</span>
                                      <span className="ml-1 font-medium">{payroll.checkerName}</span>
                                    </div>
                                  )}
                                  {!payroll.makerName && !payroll.checkerName && (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => handleViewPayroll(payroll)} title="View Details">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {canSubmit && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => {
                                        setSelectedPayroll(payroll);
                                        setSubmitDialogOpen(true);
                                      }}
                                      title="Submit for Approval"
                                    >
                                      <Send className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {canApprove && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => handleApprovePayroll(payrollId)}
                                      title={`Approve Payroll (${payroll.status})`}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {/* Debug: Show why approve button is not visible */}
                                  {(payroll.status === 'Draft' || payroll.status === 'Submitted') && !canApprove && (currentUser?.role === 'Payroll Administrator' || currentUser?.role === 'Finance Administrator' || currentUser?.role === 'Super Admin') && (
                                    <span className="text-xs text-muted-foreground" title={`Cannot approve: ${isMaker ? 'Own payroll' : !payroll.makerId ? 'No maker set' : 'Unknown reason'}`}>
                                      {isMaker ? 'Own' : 'N/A'}
                                    </span>
                                  )}
                                  {payroll.status === 'Processed' && canProcessPayroll && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => handleFinalizePayroll(payrollId)}
                                      title="Mark as Paid"
                                    >
                                      <Send className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {(payroll.status === 'Submitted' || payroll.status === 'Draft') && isMaker && (
                                    <span className="text-xs text-muted-foreground" title="You cannot approve your own payroll">
                                      Cannot approve
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                          })
                        ]);
                      })()}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Designation Tab */}
          <TabsContent value="by-designation" className="space-y-4">
            {/* Filters */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex gap-4 items-end flex-wrap">
                  <div className="flex-1 min-w-64">
                    <Label className="text-sm font-semibold mb-2 block">Select Month</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-64">
                    <Label className="text-sm font-semibold mb-2 block">Select Year</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Designation-wise Breakdown */}
            {stats?.byDesignation && Object.keys(stats.byDesignation).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.byDesignation)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([designation, data]: [string, any]) => {
                    const designationPayrolls = payrolls.filter(
                      (p: any) => p.employeeId?.designation === designation
                    );
                    
                    return (
                      <Card key={designation} className="border-0 shadow-sm">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xl">{designation}</CardTitle>
                              <CardDescription>
                                {data.count} {data.count === 1 ? 'employee' : 'employees'} • 
                                Total Net: ₹{data.totalNet.toLocaleString()}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-lg px-4 py-2">
                              {data.count}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-secondary/50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Total Basic</p>
                              <p className="text-lg font-bold">₹{data.totalBasic.toLocaleString()}</p>
                            </div>
                            <div className="bg-secondary/50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Total Gross</p>
                              <p className="text-lg font-bold">₹{data.totalGross.toLocaleString()}</p>
                            </div>
                            <div className="bg-secondary/50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Total Deductions</p>
                              <p className="text-lg font-bold text-red-600">₹{data.totalDeductions.toLocaleString()}</p>
                            </div>
                            <div className="bg-green-100/50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200/50">
                              <p className="text-xs text-muted-foreground mb-1">Net Salary</p>
                              <p className="text-lg font-bold text-green-600">₹{data.totalNet.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left p-2 font-semibold">Employee</th>
                                  <th className="text-left p-2 font-semibold">Department</th>
                                  <th className="text-right p-2 font-semibold">Basic</th>
                                  <th className="text-right p-2 font-semibold">Gross</th>
                                  <th className="text-right p-2 font-semibold">Deductions</th>
                                  <th className="text-right p-2 font-semibold">Net</th>
                                  <th className="text-center p-2 font-semibold">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {designationPayrolls.map((payroll: any) => {
                                  const employee = payroll.employeeId;
                                  const payrollId = payroll._id || payroll.id;
                                  const allowances = (payroll.da || 0) + (payroll.hra || 0) + (payroll.allowances || 0);
                                  const deductions = (payroll.pfDeduction || 0) + (payroll.esiDeduction || 0) + (payroll.incomeTax || 0) + (payroll.otherDeductions || 0);
                                  const gross = (payroll.basicSalary || 0) + allowances;
                                  
                                  return (
                                    <tr key={payrollId} className="border-b border-border hover:bg-secondary/50">
                                      <td className="p-2">
                                        <div>
                                          <div className="font-medium">{employee?.firstName || ''} {employee?.lastName || ''}</div>
                                          <div className="text-xs text-muted-foreground">{employee?.employeeCode || ''}</div>
                                        </div>
                                      </td>
                                      <td className="p-2">{employee?.department || '-'}</td>
                                      <td className="text-right p-2">₹{payroll.basicSalary?.toLocaleString() || '0'}</td>
                                      <td className="text-right p-2">₹{gross.toLocaleString()}</td>
                                      <td className="text-right p-2 text-red-600">-₹{deductions.toLocaleString()}</td>
                                      <td className="text-right p-2 font-semibold text-green-600">₹{payroll.netSalary?.toLocaleString() || '0'}</td>
                                      <td className="text-center p-2">
                                        <Badge 
                                          className={
                                            payroll.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                            payroll.status === 'Processed' ? 'bg-blue-100 text-blue-700' :
                                            payroll.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                                            'bg-yellow-100 text-yellow-700'
                                          }
                                        >
                                          {payroll.status || 'Pending'}
                                        </Badge>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No payroll data available for this period.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Employee Summary Tab */}
          <TabsContent value="employee-summary" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Employee-Wise Processed Salary Summary
                </CardTitle>
                <CardDescription>
                  {selectedMonth} {selectedYear} • 
                  {payrolls.filter((p: any) => ['Processed', 'Paid'].includes(p.status)).length} Processed / {payrolls.length} Total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="border-2">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Total Employees</p>
                      <p className="text-2xl font-bold">{payrolls.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-green-200 bg-green-50/50 dark:bg-green-900/10">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Processed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {payrolls.filter((p: any) => ['Processed', 'Paid'].includes(p.status)).length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {payrolls.filter((p: any) => !['Processed', 'Paid'].includes(p.status)).length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Total Net Salary</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{payrolls.reduce((sum: number, p: any) => sum + (p.netSalary || 0), 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Employee List Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="text-left p-3 font-semibold">Employee</th>
                        <th className="text-left p-3 font-semibold">Designation</th>
                        <th className="text-left p-3 font-semibold">Department</th>
                        <th className="text-right p-3 font-semibold">Basic Salary</th>
                        <th className="text-right p-3 font-semibold">Gross Salary</th>
                        <th className="text-right p-3 font-semibold">Deductions</th>
                        <th className="text-right p-3 font-semibold">Net Salary</th>
                        <th className="text-center p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={9} className="text-center p-6 text-muted-foreground">
                            Loading payroll data...
                          </td>
                        </tr>
                      ) : payrolls.length > 0 ? (
                        payrolls
                          .sort((a: any, b: any) => {
                            // Sort by status: Processed/Paid first, then others
                            const statusOrder = { 'Paid': 1, 'Processed': 2, 'Approved': 3, 'Submitted': 4, 'Draft': 5, 'Rejected': 6 };
                            const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 7;
                            const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 7;
                            return aOrder - bOrder;
                          })
                          .map((payroll: any) => {
                            const employee = payroll.employeeId;
                            const payrollId = payroll._id || payroll.id;
                            const grossSalary = (payroll.basicSalary || 0) + (payroll.da || 0) + (payroll.hra || 0) + (payroll.allowances || 0);
                            const deductions = (payroll.pfDeduction || 0) + (payroll.esiDeduction || 0) + (payroll.incomeTax || 0) + (payroll.otherDeductions || 0);
                            const isProcessed = ['Processed', 'Paid'].includes(payroll.status);
                            
                            return (
                              <tr 
                                key={payrollId} 
                                className={`border-b border-border hover:bg-secondary/50 ${isProcessed ? 'bg-green-50/30 dark:bg-green-900/5' : ''}`}
                              >
                                <td className="p-3">
                                  <div>
                                    <div className="font-medium">{employee?.firstName || ''} {employee?.lastName || ''}</div>
                                    <div className="text-xs text-muted-foreground">{employee?.employeeCode || ''}</div>
                                  </div>
                                </td>
                                <td className="p-3">{employee?.designation || '-'}</td>
                                <td className="p-3">{employee?.department || '-'}</td>
                                <td className="text-right p-3">₹{payroll.basicSalary?.toLocaleString() || '0'}</td>
                                <td className="text-right p-3 font-medium">₹{grossSalary.toLocaleString()}</td>
                                <td className="text-right p-3 text-red-600">-₹{deductions.toLocaleString()}</td>
                                <td className="text-right p-3 font-bold text-green-600 text-base">
                                  ₹{payroll.netSalary?.toLocaleString() || '0'}
                                </td>
                                <td className="text-center p-3">
                                  <Badge 
                                    className={
                                      payroll.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                      payroll.status === 'Processed' ? 'bg-blue-100 text-blue-700' :
                                      payroll.status === 'Approved' ? 'bg-purple-100 text-purple-700' :
                                      payroll.status === 'Submitted' ? 'bg-yellow-100 text-yellow-700' :
                                      payroll.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                                      'bg-red-100 text-red-700'
                                    }
                                  >
                                    {payroll.status || 'Pending'}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => handleViewPayroll(payroll)} title="View Details">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    {canProcessPayroll && payroll.status === 'Processed' && (
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => handleFinalizePayroll(payrollId)}
                                        title="Mark as Paid"
                                      >
                                        <Send className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={canProcessPayroll ? 10 : 9} className="text-center p-6 text-muted-foreground">
                            No payroll records found for {selectedMonth} {selectedYear}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Quick Summary by Status */}
                {payrolls.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">Quick Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {['Paid', 'Processed', 'Approved', 'Submitted', 'Draft'].map((status) => {
                        const statusPayrolls = payrolls.filter((p: any) => p.status === status);
                        if (statusPayrolls.length === 0) return null;
                        const totalNet = statusPayrolls.reduce((sum: number, p: any) => sum + (p.netSalary || 0), 0);
                        return (
                          <Card key={status} className="border-2">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <Badge className={
                                  status === 'Paid' ? 'bg-green-100 text-green-700' :
                                  status === 'Processed' ? 'bg-blue-100 text-blue-700' :
                                  status === 'Approved' ? 'bg-purple-100 text-purple-700' :
                                  status === 'Submitted' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }>
                                  {status}
                                </Badge>
                                <span className="text-sm font-semibold">{statusPayrolls.length}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">Total Net Salary</p>
                              <p className="text-xl font-bold text-green-600">₹{totalNet.toLocaleString()}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Statutory Compliance Status</CardTitle>
                <CardDescription>EPFO, ESIC, TDS, and other statutory filings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200/50">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">EPFO Returns</p>
                        <p className="text-xs text-muted-foreground">Employee Provident Fund - ₹{(stats?.totalEPF || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600">Filed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200/50">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">ESIC Returns</p>
                        <p className="text-xs text-muted-foreground">Employee State Insurance - ₹{(stats?.totalESI || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600">Filed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50">
                    <div className="flex items-center gap-3">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">TDS Filing (Form 24Q)</p>
                        <p className="text-xs text-muted-foreground">Income Tax Deduction - ₹{(stats?.totalIncomeTax || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-600">In Progress</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200/50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">TRACES Reconciliation</p>
                        <p className="text-xs text-muted-foreground">TDS Reconciliation Statement</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600">Filed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Export & Reports</CardTitle>
                <CardDescription>Generate and download payroll reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
                    <Download className="w-5 h-5" />
                    <div className="text-center">
                      <p className="font-medium">Export as Excel</p>
                      <p className="text-xs text-muted-foreground">Payroll summary</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
                    <Download className="w-5 h-5" />
                    <div className="text-center">
                      <p className="font-medium">Export as PDF</p>
                      <p className="text-xs text-muted-foreground">Detailed report</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
                    <FileText className="w-5 h-5" />
                    <div className="text-center">
                      <p className="font-medium">Bank File (NEFT)</p>
                      <p className="text-xs text-muted-foreground">Salary transfer file</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
                    <BarChart3 className="w-5 h-5" />
                    <div className="text-center">
                      <p className="font-medium">EPFO ECR File</p>
                      <p className="text-xs text-muted-foreground">EPF contribution</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
                    <FileCheck className="w-5 h-5" />
                    <div className="text-center">
                      <p className="font-medium">ESIC Return</p>
                      <p className="text-xs text-muted-foreground">ESI contribution</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
                    <Calculator className="w-5 h-5" />
                    <div className="text-center">
                      <p className="font-medium">Form 24Q</p>
                      <p className="text-xs text-muted-foreground">TDS statement</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Payroll Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payroll Details</DialogTitle>
              <DialogDescription>
                {selectedPayroll?.employeeId?.firstName} {selectedPayroll?.employeeId?.lastName} - {selectedMonth} {selectedYear}
              </DialogDescription>
            </DialogHeader>
            {selectedPayroll && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Employee Code</Label>
                    <p className="font-medium">{selectedPayroll.employeeId?.employeeCode}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Department</Label>
                    <p className="font-medium">{selectedPayroll.employeeId?.department}</p>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <h4 className="font-semibold">Earnings</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Basic Salary</span>
                      <span className="font-medium">₹{selectedPayroll.basicSalary?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DA</span>
                      <span className="font-medium">₹{selectedPayroll.da?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HRA</span>
                      <span className="font-medium">₹{selectedPayroll.hra?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Allowances</span>
                      <span className="font-medium">₹{selectedPayroll.allowances?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 col-span-2">
                      <span>Gross Salary</span>
                      <span>₹{((selectedPayroll.basicSalary || 0) + (selectedPayroll.da || 0) + (selectedPayroll.hra || 0) + (selectedPayroll.allowances || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <h4 className="font-semibold">Deductions</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>EPF</span>
                      <span className="font-medium text-red-600">-₹{selectedPayroll.pfDeduction?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ESI</span>
                      <span className="font-medium text-red-600">-₹{selectedPayroll.esiDeduction?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Income Tax (TDS)</span>
                      <span className="font-medium text-red-600">-₹{selectedPayroll.incomeTax?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Deductions</span>
                      <span className="font-medium text-red-600">-₹{selectedPayroll.otherDeductions?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 col-span-2">
                      <span>Total Deductions</span>
                      <span className="text-red-600">-₹{((selectedPayroll.pfDeduction || 0) + (selectedPayroll.esiDeduction || 0) + (selectedPayroll.incomeTax || 0) + (selectedPayroll.otherDeductions || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Net Salary</span>
                    <span className="text-green-600">₹{selectedPayroll.netSalary?.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Maker-Checker Information */}
                {(selectedPayroll.makerName || selectedPayroll.checkerName) && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-semibold">Approval Workflow</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedPayroll.makerName && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Maker (Created By)</Label>
                          <p className="font-medium">{selectedPayroll.makerName}</p>
                          {selectedPayroll.submittedDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted: {new Date(selectedPayroll.submittedDate).toLocaleDateString('en-IN')}
                            </p>
                          )}
                        </div>
                      )}
                      {selectedPayroll.checkerName && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Checker (Approved By)</Label>
                          <p className="font-medium">{selectedPayroll.checkerName}</p>
                          {selectedPayroll.approvedDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Approved: {new Date(selectedPayroll.approvedDate).toLocaleDateString('en-IN')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    {selectedPayroll.approvalHistory && selectedPayroll.approvalHistory.length > 0 && (
                      <div className="mt-3">
                        <Label className="text-xs text-muted-foreground mb-2 block">Approval History</Label>
                        <div className="space-y-2">
                          {selectedPayroll.approvalHistory.map((history: any, idx: number) => (
                            <div key={idx} className="text-xs bg-secondary/50 p-2 rounded">
                              <div className="flex justify-between">
                                <span className="font-medium">{history.action}</span>
                                <span className="text-muted-foreground">
                                  {new Date(history.timestamp).toLocaleDateString('en-IN')}
                                </span>
                              </div>
                              <div className="text-muted-foreground mt-1">
                                {history.userName} ({history.userRole})
                              </div>
                              {history.comments && (
                                <div className="text-muted-foreground mt-1 italic">
                                  "{history.comments}"
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                toast.info('Download feature coming soon');
              }}>
                <Download className="w-4 h-4 mr-2" />
                Download Payslip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Submit Payroll Dialog */}
        <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedPayrolls.size > 0 
                  ? `Submit ${selectedPayrolls.size} Payroll(s) for Approval`
                  : 'Submit Payroll for Approval'
                }
              </DialogTitle>
              <DialogDescription>
                {selectedPayrolls.size > 0
                  ? `Submit ${selectedPayrolls.size} selected payroll record(s) for approval.`
                  : selectedPayroll 
                    ? `Submit payroll for ${selectedPayroll.employeeId?.firstName} ${selectedPayroll.employeeId?.lastName} (${selectedPayroll.month} ${selectedPayroll.year}) for approval.`
                    : 'Submit payroll for approval.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="submit-comments">Comments (Optional)</Label>
                <Textarea
                  id="submit-comments"
                  placeholder="Add any comments for the checker..."
                  value={submitComments}
                  onChange={(e) => setSubmitComments(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setSubmitDialogOpen(false);
                setSubmitComments('');
                setSelectedPayroll(null);
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (selectedPayrolls.size > 0) {
                  handleBulkSubmitPayroll();
                } else if (selectedPayroll) {
                  handleSubmitPayroll(selectedPayroll._id || selectedPayroll.id, submitComments);
                }
              }}>
                <Send className="w-4 h-4 mr-2" />
                Submit for Approval
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedPayrollsForApproval.size > 0 
                  ? `Approve ${selectedPayrollsForApproval.size} Payroll(s)`
                  : 'Approve Payroll'}
              </DialogTitle>
              <DialogDescription>
                {selectedPayrollsForApproval.size > 0
                  ? `Approve ${selectedPayrollsForApproval.size} selected payroll record(s).`
                  : 'Approve this payroll record.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="approve-comments">Comments (Optional)</Label>
                <Textarea
                  id="approve-comments"
                  placeholder="Add comments for approval..."
                  value={approveComments}
                  onChange={(e) => setApproveComments(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setApproveDialogOpen(false);
                setApproveComments('');
              }}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  handleBulkApprovePayroll();
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isProcessing ? 'Approving...' : 'Approve'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
