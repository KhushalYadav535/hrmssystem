'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Download, X, Save, CheckCircle2, Clock } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OneTimePayment {
  _id?: string;
  id?: string;
  employeeId: string;
  employeeName?: string;
  paymentType: string;
  description: string;
  amount: number;
  paymentMonth: string;
  paymentYear: number;
  taxable: boolean;
  status: string;
  createdAt?: string;
}

export default function OneTimePaymentPage() {
  const { isAuthenticated } = useAuth();
  const [payments, setPayments] = useState<OneTimePayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<OneTimePayment | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [formData, setFormData] = useState<Partial<OneTimePayment>>({
    employeeId: '',
    paymentType: 'Bonus',
    description: '',
    amount: 0,
    paymentMonth: new Date().toISOString().slice(0, 7),
    paymentYear: new Date().getFullYear(),
    taxable: true,
  });

  if (!isAuthenticated) redirect('/login');

  useEffect(() => {
    loadPayments();
  }, [selectedStatus]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      const response = await apiService.getOneTimePayments(params);
      if (response.success && response.data) {
        setPayments(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load one-time payments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error('Employee ID is required');
      return;
    }

    try {
      const data = {
        ...formData,
        paymentMonth: formData.paymentMonth?.split('-')[1] || new Date().getMonth().toString().padStart(2, '0'),
        paymentYear: formData.paymentYear || new Date().getFullYear(),
      };

      if (editingPayment?._id || editingPayment?.id) {
        const id = editingPayment._id || editingPayment.id;
        const response = await apiService.updateOneTimePayment(id!, data);
        if (response.success) {
          toast.success('Payment updated successfully');
          setShowForm(false);
          setEditingPayment(null);
          resetForm();
          loadPayments();
        } else {
          toast.error(response.message || 'Failed to update payment');
        }
      } else {
        const response = await apiService.createOneTimePayment(data);
        if (response.success) {
          toast.success('Payment created successfully');
          setShowForm(false);
          resetForm();
          loadPayments();
        } else {
          toast.error(response.message || 'Failed to create payment');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await apiService.approveOneTimePayment(id);
      if (response.success) {
        toast.success('Payment approved successfully');
        loadPayments();
      } else {
        toast.error(response.message || 'Failed to approve payment');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleProcess = async (id: string) => {
    try {
      const response = await apiService.processOneTimePayment(id);
      if (response.success) {
        toast.success('Payment processed successfully');
        loadPayments();
      } else {
        toast.error(response.message || 'Failed to process payment');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      paymentType: 'Bonus',
      description: '',
      amount: 0,
      paymentMonth: new Date().toISOString().slice(0, 7),
      paymentYear: new Date().getFullYear(),
      taxable: true,
    });
    setEditingPayment(null);
  };

  const getPaymentsByStatus = (status: string) => {
    if (status === 'all') return payments;
    return payments.filter(p => p.status === status);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Processed': return 'default';
      case 'Approved': return 'secondary';
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingCount = payments.filter(p => p.status === 'Pending').length;
  const approvedCount = payments.filter(p => p.status === 'Approved').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">One-Time Payments</h1>
            <p className="text-muted-foreground mt-2">Ex-gratia, special allowances, and ad-hoc payments</p>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            New Payment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{approvedCount}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({payments.length})</TabsTrigger>
            <TabsTrigger value="Pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="Approved">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="Processed">Processed</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center">Loading...</CardContent>
              </Card>
            ) : getPaymentsByStatus(selectedStatus).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No payments found</p>
                </CardContent>
              </Card>
            ) : (
              getPaymentsByStatus(selectedStatus).map((payment) => {
                const id = payment._id || payment.id;
                return (
                  <Card key={id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{payment.paymentType}</h3>
                          <p className="text-sm text-muted-foreground">
                            {payment.description} • {payment.paymentMonth}/{payment.paymentYear}
                          </p>
                          {payment.employeeName && (
                            <p className="text-sm text-muted-foreground mt-1">Employee: {payment.employeeName}</p>
                          )}
                        </div>
                        <Badge variant={getStatusBadgeVariant(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="text-lg font-bold">₹{payment.amount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Taxable</p>
                          <p className="text-lg font-bold">{payment.taxable ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Created</p>
                          <p className="text-sm font-medium">
                            {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {payment.status === 'Pending' && (
                          <Button size="sm" variant="outline" onClick={() => handleApprove(id!)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                          </Button>
                        )}
                        {payment.status === 'Approved' && (
                          <Button size="sm" variant="outline" onClick={() => handleProcess(id!)}>
                            <Clock className="w-4 h-4 mr-2" /> Process
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => { setEditingPayment(payment); setShowForm(true); }}>
                          <Edit2 className="w-4 h-4 mr-2" /> Edit
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPayment ? 'Edit Payment' : 'Create One-Time Payment'}</DialogTitle>
              <DialogDescription>
                Enter payment details for employee
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Employee ID *</Label>
                <Input
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                  placeholder="Enter employee ID"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Type *</Label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                    value={formData.paymentType}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                    required
                  >
                    <option value="Bonus">Bonus</option>
                    <option value="Arrears">Arrears</option>
                    <option value="Incentive">Incentive</option>
                    <option value="Ex-Gratia">Ex-Gratia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Month *</Label>
                  <Input
                    type="month"
                    value={formData.paymentMonth}
                    onChange={(e) => setFormData({ ...formData, paymentMonth: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Payment Year *</Label>
                  <Input
                    type="number"
                    value={formData.paymentYear}
                    onChange={(e) => setFormData({ ...formData, paymentYear: parseInt(e.target.value) || new Date().getFullYear() })}
                    required
                    min="2020"
                    max="2100"
                  />
                </div>
              </div>

              <div>
                <Label>Description *</Label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Enter reason/description for this payment"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="taxable"
                  checked={formData.taxable}
                  onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="taxable">Is Taxable</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" /> {editingPayment ? 'Update' : 'Create'} Payment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
