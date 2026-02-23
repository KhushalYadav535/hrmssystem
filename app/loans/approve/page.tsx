'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  DollarSign,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

interface Loan {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    email: string;
    designation: string;
  };
  loanTypeId: {
    _id: string;
    loanName: string;
    loanCode: string;
    maxAmount: number;
  };
  appliedAmount: number;
  sanctionedAmount: number;
  tenureMonths: number;
  emiAmount: number;
  status: string;
  createdAt: string;
}

export default function LoanApprovePage() {
  const { currentUser } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalLevel, setApprovalLevel] = useState<number | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [action, setAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [sanctionedAmount, setSanctionedAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      redirect('/login');
    }
    loadApprovalQueue();
  }, [currentUser]);

  const loadApprovalQueue = async () => {
    try {
      setLoading(true);
      const response = await apiService.getApprovalQueue();
      if (response.success && response.data) {
        setLoans(response.data);
        setApprovalLevel(response.approvalLevel);
      } else {
        toast.error(response.message || 'Failed to load approval queue');
      }
    } catch (error: any) {
      toast.error('Error loading approval queue');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (loan: Loan) => {
    setSelectedLoan(loan);
    setAction('APPROVED');
    setRemarks('');
    setSanctionedAmount(loan.appliedAmount.toString());
    setIsDialogOpen(true);
  };

  const handleReject = (loan: Loan) => {
    setSelectedLoan(loan);
    setAction('REJECTED');
    setRemarks('');
    setSanctionedAmount('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedLoan) return;

    if (action === 'REJECTED' && !remarks.trim()) {
      toast.error('Please provide remarks for rejection');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiService.approveLoan(selectedLoan._id, {
        action,
        remarks: remarks.trim() || undefined,
        sanctionedAmount: action === 'APPROVED' && sanctionedAmount ? parseFloat(sanctionedAmount) : undefined,
      });

      if (response.success) {
        toast.success(`Loan ${action.toLowerCase()} successfully`);
        setIsDialogOpen(false);
        setSelectedLoan(null);
        loadApprovalQueue();
      } else {
        toast.error(response.message || 'Failed to process approval');
      }
    } catch (error: any) {
      toast.error('Error processing approval');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Loan Approval Queue</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve/reject loan applications
            {approvalLevel && ` (Level ${approvalLevel}: ${approvalLevel === 1 ? 'Manager' : approvalLevel === 2 ? 'HR' : 'Finance'})`}
          </p>
        </div>

        {loans.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No pending loan approvals
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <Card key={loan._id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold">{loan.loanTypeId?.loanName}</h3>
                        <Badge variant="outline">{loan.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Employee
                          </p>
                          <p className="font-semibold">
                            {loan.employeeId.firstName} {loan.employeeId.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{loan.employeeId.employeeCode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Applied Amount
                          </p>
                          <p className="font-semibold">₹{loan.appliedAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Tenure
                          </p>
                          <p className="font-semibold">{loan.tenureMonths} months</p>
                        </div>
                        {loan.emiAmount > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground">EMI Amount</p>
                            <p className="font-semibold">₹{loan.emiAmount.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Applied: {new Date(loan.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        onClick={() => handleApprove(loan)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(loan)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Approval Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {action === 'APPROVED' ? 'Approve Loan' : 'Reject Loan'}
              </DialogTitle>
              <DialogDescription>
                {selectedLoan && (
                  <>
                    {action === 'APPROVED' ? 'Approve' : 'Reject'} loan application for{' '}
                    {selectedLoan.employeeId.firstName} {selectedLoan.employeeId.lastName}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedLoan && action === 'APPROVED' && approvalLevel === 3 && (
                <div>
                  <Label>Sanctioned Amount (₹)</Label>
                  <Input
                    type="number"
                    value={sanctionedAmount}
                    onChange={(e) => setSanctionedAmount(e.target.value)}
                    placeholder={selectedLoan.appliedAmount.toString()}
                    min="0"
                    max={selectedLoan.loanTypeId.maxAmount}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied: ₹{selectedLoan.appliedAmount.toLocaleString()} • Max: ₹{selectedLoan.loanTypeId.maxAmount.toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <Label>Remarks {action === 'REJECTED' && '*'}</Label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={action === 'APPROVED' ? 'Optional remarks...' : 'Reason for rejection...'}
                  rows={3}
                  required={action === 'REJECTED'}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                variant={action === 'APPROVED' ? 'default' : 'destructive'}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {action === 'APPROVED' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
