'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  Calculator,
  CheckCircle2,
  Loader2,
  Download,
  AlertCircle,
} from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function FnfPage() {
  const { currentUser } = useAuth();
  const params = useParams();
  const separationId = params.id as string;
  const [separation, setSeparation] = useState<any>(null);
  const [fnfData, setFnfData] = useState<any>(null);
  const [fnfSettlement, setFnfSettlement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState('');
  const [paymentData, setPaymentData] = useState({
    paidDate: new Date().toISOString().split('T')[0],
    paymentMode: 'NEFT',
    paymentReference: '',
  });

  useEffect(() => {
    if (!currentUser) {
      redirect('/login');
    }
    loadData();
  }, [currentUser, separationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [separationRes, fnfRes] = await Promise.all([
        apiService.getSeparation(separationId),
        apiService.calculateFnf(separationId).catch(() => null),
      ]);

      if (separationRes.success && separationRes.data) {
        setSeparation(separationRes.data);
      }
      if (fnfRes?.success && fnfRes.data) {
        setFnfData(fnfRes.data);
      }
    } catch (error: any) {
      toast.error('Error loading F&F data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFnf = async () => {
    setCreating(true);
    try {
      const response = await apiService.createFnfSettlement(separationId);
      if (response.success) {
        toast.success('F&F settlement created successfully');
        setFnfSettlement(response.data);
        loadData();
      } else {
        toast.error(response.message || 'Failed to create F&F settlement');
      }
    } catch (error: any) {
      toast.error('Error creating F&F settlement');
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      const response = await apiService.approveFnfSettlement(separationId, {
        remarks: approveRemarks.trim() || undefined,
      });
      if (response.success) {
        toast.success('F&F settlement approved successfully');
        setIsApproveDialogOpen(false);
        setFnfSettlement(response.data);
        loadData();
      } else {
        toast.error(response.message || 'Failed to approve F&F settlement');
      }
    } catch (error: any) {
      toast.error('Error approving F&F settlement');
      console.error(error);
    } finally {
      setApproving(false);
    }
  };

  const handleMarkPaid = async () => {
    try {
      const response = await apiService.markFnfPaid(separationId, paymentData);
      if (response.success) {
        toast.success('F&F settlement marked as paid');
        setIsPayDialogOpen(false);
        setFnfSettlement(response.data);
        loadData();
      } else {
        toast.error(response.message || 'Failed to mark as paid');
      }
    } catch (error: any) {
      toast.error('Error marking F&F as paid');
      console.error(error);
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

  if (!separation) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Separation record not found
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const displayData = fnfSettlement || fnfData;
  const canApprove = currentUser?.role === 'HR Administrator' || currentUser?.role === 'Finance Administrator' || currentUser?.role === 'Tenant Admin' || currentUser?.role === 'Super Admin';
  const canPay = currentUser?.role === 'Finance Administrator' || currentUser?.role === 'Tenant Admin' || currentUser?.role === 'Super Admin';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Full & Final Settlement</h1>
            <p className="text-muted-foreground mt-1">
              {separation.employeeId?.firstName} {separation.employeeId?.lastName} ({separation.employeeId?.employeeCode})
            </p>
          </div>
          <div className="flex gap-2">
            {!fnfSettlement && canApprove && (
              <Button onClick={handleCreateFnf} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Create F&F Settlement
                  </>
                )}
              </Button>
            )}
            {fnfSettlement?.status === 'DRAFT' && canApprove && (
              <Button onClick={() => setIsApproveDialogOpen(true)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve F&F
              </Button>
            )}
            {fnfSettlement?.status === 'APPROVED' && canPay && (
              <Button onClick={() => setIsPayDialogOpen(true)}>
                <DollarSign className="w-4 h-4 mr-2" />
                Mark as Paid
              </Button>
            )}
          </div>
        </div>

        {displayData ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Settlement Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{displayData.totalEarnings?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Deductions</p>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{displayData.totalDeductions?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Net Payable</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{displayData.netPayable?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
                {fnfSettlement && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={fnfSettlement.status === 'PAID' ? 'default' : 'outline'}>
                      {fnfSettlement.status}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="earnings" className="w-full">
              <TabsList>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="deductions">Deductions</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="earnings">
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>Salary (Partial Month)</span>
                        <span className="font-semibold">₹{displayData.salaryAmount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>Leave Encashment ({displayData.leaveEncashmentDays} days)</span>
                        <span className="font-semibold">₹{displayData.leaveEncashmentAmount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>Gratuity ({displayData.gratuityYears} years)</span>
                        <span className="font-semibold">₹{displayData.gratuityAmount?.toLocaleString() || '0'}</span>
                      </div>
                      {displayData.bonusAmount > 0 && (
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <span>Bonus</span>
                          <span className="font-semibold">₹{displayData.bonusAmount?.toLocaleString()}</span>
                        </div>
                      )}
                      {displayData.pfContributionAmount > 0 && (
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <span>PF Contribution Refund</span>
                          <span className="font-semibold">₹{displayData.pfContributionAmount?.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center p-4 border-2 border-green-500 rounded-lg bg-green-50">
                        <span className="font-bold">Total Earnings</span>
                        <span className="font-bold text-lg">₹{displayData.totalEarnings?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deductions">
                <Card>
                  <CardHeader>
                    <CardTitle>Deductions Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {displayData.noticePeriodRecoveryAmount > 0 && (
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <span>Notice Period Recovery ({displayData.noticePeriodRecoveryDays} days)</span>
                          <span className="font-semibold text-red-600">
                            ₹{displayData.noticePeriodRecoveryAmount?.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {displayData.loanOutstandingRecovery > 0 && (
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <span>Loan Outstanding Recovery</span>
                          <span className="font-semibold text-red-600">
                            ₹{displayData.loanOutstandingRecovery?.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {displayData.advanceRecovery > 0 && (
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <span>Advance Recovery</span>
                          <span className="font-semibold text-red-600">
                            ₹{displayData.advanceRecovery?.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {displayData.otherDeductions > 0 && (
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <span>Other Deductions</span>
                          <span className="font-semibold text-red-600">
                            ₹{displayData.otherDeductions?.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center p-4 border-2 border-red-500 rounded-lg bg-red-50">
                        <span className="font-bold">Total Deductions</span>
                        <span className="font-bold text-lg text-red-600">
                          ₹{displayData.totalDeductions?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Calculation Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Service Years</p>
                        <p className="font-semibold">{displayData.serviceYears || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Service Days</p>
                        <p className="font-semibold">{displayData.serviceDays || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Salary Days Payable</p>
                        <p className="font-semibold">{displayData.salaryDaysPayable || '0'} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Basic Per Day</p>
                        <p className="font-semibold">₹{displayData.basicPerDay?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>F&F calculation not available yet</p>
              {canApprove && (
                <Button onClick={handleCreateFnf} className="mt-4" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      Create F&F Settlement
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Approve Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve F&F Settlement</DialogTitle>
              <DialogDescription>
                Approve the Full & Final settlement for this employee
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Remarks (Optional)</Label>
                <Input
                  value={approveRemarks}
                  onChange={(e) => setApproveRemarks(e.target.value)}
                  placeholder="Add any remarks..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={approving}>
                {approving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pay Dialog */}
        <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark F&F as Paid</DialogTitle>
              <DialogDescription>
                Record payment details for the F&F settlement
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Paid Date</Label>
                <Input
                  type="date"
                  value={paymentData.paidDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paidDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Payment Mode</Label>
                <Select
                  value={paymentData.paymentMode}
                  onValueChange={(value) => setPaymentData({ ...paymentData, paymentMode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEFT">NEFT</SelectItem>
                    <SelectItem value="RTGS">RTGS</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Reference/UTR</Label>
                <Input
                  value={paymentData.paymentReference}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentReference: e.target.value })}
                  placeholder="Enter UTR or reference number"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleMarkPaid}>
                <DollarSign className="w-4 h-4 mr-2" />
                Mark as Paid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
