'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, FileText, CheckCircle2, Clock, Calculator, Download } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExitSettlement {
  _id?: string;
  id?: string;
  employeeId: string;
  employeeName?: string;
  exitDate: string;
  exitType: string;
  pendingSalary: number;
  leaveEncashment: number;
  gratuity: number;
  bonus: number;
  otherEarnings: number;
  totalEarnings: number;
  noticePeriodDeduction: number;
  loanOutstanding: number;
  advanceRecovery: number;
  taxDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSettlementAmount: number;
  status: string;
}

export default function ExitSettlementPage() {
  const { isAuthenticated } = useAuth();
  const [settlements, setSettlements] = useState<ExitSettlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('Draft');
  const [showForm, setShowForm] = useState(false);
  const [showCalculateDialog, setShowCalculateDialog] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<ExitSettlement | null>(null);
  const [formData, setFormData] = useState<Partial<ExitSettlement>>({
    employeeId: '',
    exitDate: new Date().toISOString().split('T')[0],
    exitType: 'Resignation',
  });

  if (!isAuthenticated) redirect('/login');

  useEffect(() => {
    loadSettlements();
  }, [selectedStatus]);

  const loadSettlements = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      const response = await apiService.getExitSettlements(params);
      if (response.success && response.data) {
        setSettlements(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load exit settlements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error('Employee ID is required');
      return;
    }

    try {
      const response = await apiService.createExitSettlement({
        employeeId: formData.employeeId,
        exitDate: formData.exitDate,
        exitType: formData.exitType,
      });
      if (response.success) {
        toast.success('Exit settlement created successfully');
        setShowForm(false);
        resetForm();
        loadSettlements();
      } else {
        toast.error(response.message || 'Failed to create settlement');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleCalculate = async (id: string) => {
    try {
      const response = await apiService.calculateExitSettlement(id);
      if (response.success) {
        toast.success('Settlement calculated successfully');
        loadSettlements();
        setShowCalculateDialog(false);
        setSelectedSettlement(null);
      } else {
        toast.error(response.message || 'Failed to calculate settlement');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await apiService.approveExitSettlement(id);
      if (response.success) {
        toast.success('Settlement approved successfully');
        loadSettlements();
      } else {
        toast.error(response.message || 'Failed to approve settlement');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleProcess = async (id: string) => {
    try {
      const response = await apiService.processExitSettlement(id, {
        paymentDate: new Date().toISOString(),
        paymentMode: 'NEFT',
      });
      if (response.success) {
        toast.success('Settlement processed successfully');
        loadSettlements();
      } else {
        toast.error(response.message || 'Failed to process settlement');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      exitDate: new Date().toISOString().split('T')[0],
      exitType: 'Resignation',
    });
  };

  const getSettlementsByStatus = (status: string) => {
    if (status === 'all') return settlements;
    return settlements.filter(s => s.status === status);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Processed': return 'default';
      case 'Approved': return 'secondary';
      case 'Calculated': return 'secondary';
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Exit Settlement & F&F</h1>
            <p className="text-muted-foreground mt-2">Full & Final settlement for employee separation</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <FileText className="w-4 h-4" /> New Settlement
          </Button>
        </div>

        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="Draft">Draft</TabsTrigger>
            <TabsTrigger value="Calculated">Calculated</TabsTrigger>
            <TabsTrigger value="Approved">Approved</TabsTrigger>
            <TabsTrigger value="Processed">Processed</TabsTrigger>
            <TabsTrigger value="Paid">Paid</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center">Loading...</CardContent>
              </Card>
            ) : getSettlementsByStatus(selectedStatus).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-foreground">No settlements found</p>
                </CardContent>
              </Card>
            ) : (
              getSettlementsByStatus(selectedStatus).map((settlement) => {
                const id = settlement._id || settlement.id;
                return (
                  <Card key={id} className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{settlement.employeeName || `Employee ${settlement.employeeId}`}</CardTitle>
                          <CardDescription>
                            Exit Date: {new Date(settlement.exitDate).toLocaleDateString()} • Type: {settlement.exitType}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusBadgeVariant(settlement.status)}>
                          {settlement.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="p-3 bg-secondary/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">Net Settlement</p>
                          <p className="text-lg font-bold">₹{settlement.netSettlementAmount?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">Gratuity</p>
                          <p className="text-lg font-bold">₹{settlement.gratuity?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">Leave Encashment</p>
                          <p className="text-lg font-bold">₹{settlement.leaveEncashment?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">Pending Salary</p>
                          <p className="text-lg font-bold">₹{settlement.pendingSalary?.toLocaleString() || '0'}</p>
                        </div>
                      </div>

                      <div className="bg-secondary/20 p-4 rounded-lg space-y-3">
                        <p className="font-semibold text-foreground">Settlement Breakdown</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Earnings</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Pending Salary</span>
                                <span>₹{settlement.pendingSalary?.toLocaleString() || '0'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Leave Encashment</span>
                                <span>₹{settlement.leaveEncashment?.toLocaleString() || '0'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Gratuity</span>
                                <span>₹{settlement.gratuity?.toLocaleString() || '0'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Bonus</span>
                                <span>₹{settlement.bonus?.toLocaleString() || '0'}</span>
                              </div>
                              <div className="flex justify-between font-semibold pt-2 border-t">
                                <span>Total Earnings</span>
                                <span>₹{settlement.totalEarnings?.toLocaleString() || '0'}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Deductions</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Notice Period</span>
                                <span>₹{settlement.noticePeriodDeduction?.toLocaleString() || '0'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Loan Outstanding</span>
                                <span>₹{settlement.loanOutstanding?.toLocaleString() || '0'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Advance Recovery</span>
                                <span>₹{settlement.advanceRecovery?.toLocaleString() || '0'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax Deduction</span>
                                <span>₹{settlement.taxDeduction?.toLocaleString() || '0'}</span>
                              </div>
                              <div className="flex justify-between font-semibold pt-2 border-t">
                                <span>Total Deductions</span>
                                <span>₹{settlement.totalDeductions?.toLocaleString() || '0'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {settlement.status === 'Draft' && (
                          <Button
                            onClick={() => {
                              setSelectedSettlement(settlement);
                              setShowCalculateDialog(true);
                            }}
                            className="flex-1 gap-2"
                          >
                            <Calculator className="w-4 h-4" /> Calculate Settlement
                          </Button>
                        )}
                        {settlement.status === 'Calculated' && (
                          <Button onClick={() => handleApprove(id!)} className="flex-1 gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Approve Settlement
                          </Button>
                        )}
                        {settlement.status === 'Approved' && (
                          <Button onClick={() => handleProcess(id!)} className="flex-1 gap-2">
                            <Clock className="w-4 h-4" /> Process Payment
                          </Button>
                        )}
                        <Button variant="outline" className="gap-2">
                          <Download className="w-4 h-4" /> Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Exit Settlement</DialogTitle>
              <DialogDescription>
                Enter employee details for exit settlement
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Employee ID *</Label>
                <Input
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Exit Date *</Label>
                <Input
                  type="date"
                  value={formData.exitDate}
                  onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Exit Type *</Label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                  value={formData.exitType}
                  onChange={(e) => setFormData({ ...formData, exitType: e.target.value })}
                  required
                >
                  <option value="Resignation">Resignation</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Termination">Termination</option>
                  <option value="VRS">VRS</option>
                  <option value="Death">Death</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Settlement</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showCalculateDialog} onOpenChange={setShowCalculateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Calculate Exit Settlement</DialogTitle>
              <DialogDescription>
                This will calculate all settlement components including gratuity, leave encashment, and deductions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to calculate the settlement for this employee?
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowCalculateDialog(false); setSelectedSettlement(null); }}>
                  Cancel
                </Button>
                <Button onClick={() => selectedSettlement && handleCalculate(selectedSettlement._id || selectedSettlement.id!)}>
                  <Calculator className="w-4 h-4 mr-2" /> Calculate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
