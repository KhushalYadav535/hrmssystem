'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calculator,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
} from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

interface LoanType {
  _id: string;
  loanCode: string;
  loanName: string;
  maxAmount: number;
  interestRatePercent: number;
  maxTenureMonths: number;
  minServiceYears: number;
  description?: string;
}

export default function LoanApplyPage() {
  const { currentUser } = useAuth();
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    loanTypeId: '',
    appliedAmount: '',
    tenureMonths: '',
    remarks: '',
  });
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(null);
  const [emiPreview, setEmiPreview] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) {
      redirect('/login');
    }
    loadLoanTypes();
  }, [currentUser]);

  useEffect(() => {
    if (formData.loanTypeId && formData.appliedAmount && formData.tenureMonths) {
      calculateEMIPreview();
    } else {
      setEmiPreview(null);
    }
  }, [formData.loanTypeId, formData.appliedAmount, formData.tenureMonths]);

  const loadLoanTypes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLoanTypes({ isActive: true });
      if (response.success && response.data) {
        setLoanTypes(response.data);
      } else {
        toast.error('Failed to load loan types');
      }
    } catch (error: any) {
      toast.error('Error loading loan types');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEMIPreview = async () => {
    const loanType = loanTypes.find(lt => lt._id === formData.loanTypeId);
    if (!loanType) return;

    const amount = parseFloat(formData.appliedAmount);
    const tenure = parseInt(formData.tenureMonths);

    if (isNaN(amount) || isNaN(tenure) || amount <= 0 || tenure <= 0) {
      setEmiPreview(null);
      return;
    }

    // Simple EMI calculation for preview (same formula as backend)
    const monthlyRate = loanType.interestRatePercent / 12 / 100;
    let emiAmount = 0;

    if (loanType.interestRatePercent === 0) {
      emiAmount = Math.round(amount / tenure);
    } else {
      const onePlusR = 1 + monthlyRate;
      const onePlusRPowerN = Math.pow(onePlusR, tenure);
      emiAmount = amount * monthlyRate * onePlusRPowerN / (onePlusRPowerN - 1);
      emiAmount = Math.round(emiAmount * 100) / 100;
    }

    const totalAmount = emiAmount * tenure;
    const totalInterest = totalAmount - amount;

    setEmiPreview({
      emiAmount,
      totalAmount,
      totalInterest,
    });

    setSelectedLoanType(loanType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.loanTypeId || !formData.appliedAmount || !formData.tenureMonths) {
      toast.error('Please fill all required fields');
      return;
    }

    const amount = parseFloat(formData.appliedAmount);
    const tenure = parseInt(formData.tenureMonths);

    if (isNaN(amount) || isNaN(tenure)) {
      toast.error('Invalid amount or tenure');
      return;
    }

    setSubmitting(true);
    setValidationErrors([]);
    setWarnings([]);

    try {
      const response = await apiService.applyForLoan({
        loanTypeId: formData.loanTypeId,
        appliedAmount: amount,
        tenureMonths: tenure,
        remarks: formData.remarks,
      });

      if (response.success) {
        toast.success('Loan application submitted successfully');
        // Reset form
        setFormData({
          loanTypeId: '',
          appliedAmount: '',
          tenureMonths: '',
          remarks: '',
        });
        setEmiPreview(null);
        setSelectedLoanType(null);
        // Redirect to my loans
        window.location.href = '/loans/my-loans';
      } else {
        if (response.errors) {
          setValidationErrors(response.errors);
        }
        if (response.warnings) {
          setWarnings(response.warnings);
        }
        toast.error(response.message || 'Failed to submit loan application');
      }
    } catch (error: any) {
      toast.error('Error submitting loan application');
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
          <h1 className="text-3xl font-bold">Apply for Loan</h1>
          <p className="text-muted-foreground mt-1">
            Submit a loan application. Your application will go through approval workflow.
          </p>
        </div>

        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {warnings.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Application Form</CardTitle>
              <CardDescription>Fill in the details to apply for a loan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Loan Type *</Label>
                <Select
                  value={formData.loanTypeId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, loanTypeId: value });
                    const lt = loanTypes.find(t => t._id === value);
                    setSelectedLoanType(lt || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    {loanTypes.map((loanType) => (
                      <SelectItem key={loanType._id} value={loanType._id}>
                        {loanType.loanName} (Max: ₹{loanType.maxAmount.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedLoanType && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Interest Rate: {selectedLoanType.interestRatePercent}% p.a.</p>
                    <p>Max Tenure: {selectedLoanType.maxTenureMonths} months</p>
                    <p>Min Service: {selectedLoanType.minServiceYears} year(s)</p>
                    {selectedLoanType.description && <p>{selectedLoanType.description}</p>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Loan Amount (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.appliedAmount}
                    onChange={(e) => setFormData({ ...formData, appliedAmount: e.target.value })}
                    placeholder="Enter amount"
                    min="0"
                    step="1000"
                    required
                  />
                  {selectedLoanType && formData.appliedAmount && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Max: ₹{selectedLoanType.maxAmount.toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Tenure (Months) *</Label>
                  <Input
                    type="number"
                    value={formData.tenureMonths}
                    onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
                    placeholder="Enter tenure"
                    min="1"
                    required
                  />
                  {selectedLoanType && formData.tenureMonths && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Max: {selectedLoanType.maxTenureMonths} months
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Remarks (Optional)</Label>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {emiPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  EMI Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly EMI</p>
                    <p className="text-2xl font-bold">₹{emiPreview.emiAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold">₹{emiPreview.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Interest</p>
                    <p className="text-2xl font-bold">₹{emiPreview.totalInterest.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
