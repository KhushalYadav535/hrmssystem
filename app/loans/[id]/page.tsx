'use client';

import { formatDateDDMMYYYY, formatDateTimeFullDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  DollarSign,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { formatDesignationLabel } from '@/lib/utils';

export default function LoanDetailsPage() {
  const { currentUser } = useAuth();
  const params = useParams();
  const loanId = params.id as string;
  const [loan, setLoan] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      redirect('/login');
    }
    loadLoanDetails();
  }, [currentUser, loanId]);

  const loadLoanDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLoanDetails(loanId);
      if (response.success && response.data) {
        setLoan(response.data.loan);
        setApprovals(response.data.approvals || []);
      } else {
        toast.error('Failed to load loan details');
        redirect('/loans/my-loans');
      }
    } catch (error: any) {
      toast.error('Error loading loan details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      APPLIED: { label: 'Applied', variant: 'outline' },
      MANAGER_APPROVED: { label: 'Manager Approved', variant: 'secondary' },
      HR_VERIFIED: { label: 'HR Verified', variant: 'secondary' },
      FINANCE_SANCTIONED: { label: 'Finance Sanctioned', variant: 'default' },
      DISBURSED: { label: 'Disbursed', variant: 'default' },
      ACTIVE: { label: 'Active', variant: 'default' },
      CLOSED: { label: 'Closed', variant: 'secondary' },
      REJECTED: { label: 'Rejected', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!loan) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Loan not found
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Loan Details</h1>
          <p className="text-muted-foreground mt-1">
            View complete loan information and approval history
          </p>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Loan Details</TabsTrigger>
            <TabsTrigger value="approvals">Approval History</TabsTrigger>
            {['ACTIVE', 'DISBURSED'].includes(loan.status) && (
              <TabsTrigger value="schedule">EMI Schedule</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Type</p>
                    <p className="font-semibold">{loan.loanTypeId?.loanName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(loan.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Applied Amount</p>
                    <p className="font-semibold text-lg">₹{loan.appliedAmount.toLocaleString()}</p>
                  </div>
                  {loan.sanctionedAmount > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sanctioned Amount</p>
                      <p className="font-semibold text-lg">₹{loan.sanctionedAmount.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Tenure</p>
                    <p className="font-semibold">{loan.tenureMonths} months</p>
                  </div>
                  {loan.emiAmount > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly EMI</p>
                      <p className="font-semibold text-lg">₹{loan.emiAmount.toLocaleString()}</p>
                    </div>
                  )}
                  {loan.outstandingAmount > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Outstanding Amount</p>
                      <p className="font-semibold text-lg">₹{loan.outstandingAmount.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                    <p className="font-semibold">{loan.interestRate}% p.a.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Employee Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Employee Name</p>
                    <p className="font-semibold">
                      {loan.employeeId?.firstName} {loan.employeeId?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employee Code</p>
                    <p className="font-semibold">{loan.employeeId?.employeeCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Designation</p>
                    <p className="font-semibold">{formatDesignationLabel(loan.employeeId?.designation)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-semibold">{loan.employeeId?.department}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Important Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Application Date</p>
                    <p className="font-semibold">{formatDateDDMMYYYY(loan.createdAt)}</p>
                  </div>
                  {loan.disbursalDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Disbursal Date</p>
                      <p className="font-semibold">{formatDateDDMMYYYY(loan.disbursalDate)}</p>
                    </div>
                  )}
                  {loan.closureDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Closure Date</p>
                      <p className="font-semibold">{formatDateDDMMYYYY(loan.closureDate)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {loan.remarks && (
                <Card>
                  <CardHeader>
                    <CardTitle>Remarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{loan.remarks}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <CardTitle>Approval History</CardTitle>
                <CardDescription>Complete approval workflow trail</CardDescription>
              </CardHeader>
              <CardContent>
                {approvals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No approvals yet</p>
                ) : (
                  <div className="space-y-4">
                    {approvals.map((approval, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-4 border rounded-lg"
                      >
                        <div className={`p-2 rounded-full ${
                          approval.action === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {approval.action === 'APPROVED' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{approval.approverName}</p>
                            <Badge variant="outline">Level {approval.approvalLevel}</Badge>
                            <Badge variant={approval.action === 'APPROVED' ? 'default' : 'destructive'}>
                              {approval.action}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {approval.approverRole} • {formatDateTimeFullDDMMYYYY(approval.timestamp)}
                          </p>
                          {approval.remarks && (
                            <p className="text-sm">{approval.remarks}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <LoanScheduleTab loanId={loanId} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function LoanScheduleTab({ loanId }: { loanId: string }) {
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, [loanId]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLoanSchedule(loanId);
      if (response.success && response.data) {
        setSchedule(response.data);
      } else {
        toast.error('Failed to load EMI schedule');
      }
    } catch (error: any) {
      toast.error('Error loading EMI schedule');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!schedule) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No schedule available
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: 'Pending', variant: 'outline' },
      PAID: { label: 'Paid', variant: 'default' },
      OVERDUE: { label: 'Overdue', variant: 'destructive' },
      WAIVED: { label: 'Waived', variant: 'secondary' },
    };
    const c = config[status] || { label: status, variant: 'outline' };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>EMI Repayment Schedule</CardTitle>
        <CardDescription>
          {schedule.summary.totalEMIs} EMIs • {schedule.summary.paidEMIs} Paid • {schedule.summary.pendingEMIs} Pending
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {schedule.schedule.map((emi: any) => (
            <div
              key={emi.emiNumber}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">EMI</p>
                  <p className="font-bold">{emi.emiNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-semibold">{formatDateDDMMYYYY(emi.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">₹{emi.emiAmount.toLocaleString()}</p>
                </div>
                {emi.status === 'PAID' && emi.paidDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Paid Date</p>
                    <p className="font-semibold">{formatDateDDMMYYYY(emi.paidDate)}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(emi.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
