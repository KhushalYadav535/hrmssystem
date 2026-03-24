'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, CheckCircle2, Clock, AlertCircle, X, DollarSign, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/lib/api';

interface ExpenseItem {
  id: string;
  category: string;
  date: string;
  amount: string;
  description: string;
  gstin?: string;
  gstAmount?: string;
  bills: File[];
}

export default function TravelClaimPage() {
  // BR-P0-001 Bug 2: Fix crash - use currentUser instead of user
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [travelRequests, setTravelRequests] = useState<any[]>([]);
  const [selectedTravelRequest, setSelectedTravelRequest] = useState<string>('');
  const [claimType, setClaimType] = useState<'Regular Travel' | 'LTA' | 'Mileage' | 'Other Allowance'>('Regular Travel');
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<ExpenseItem>>({
    category: '',
    date: '',
    amount: '',
    description: '',
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadApprovedTravelRequests();
  }, []);

  const loadApprovedTravelRequests = async () => {
    try {
      const response = await apiService.getTravelRequests({ status: 'Approved' });
      if (response.success && response.data) {
        setTravelRequests(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load travel requests', error);
    }
  };

  if (!isAuthenticated) {
    redirect('/login');
  }

  const handleAddExpense = () => {
    if (!currentItem.category || !currentItem.date || !currentItem.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      category: currentItem.category || '',
      date: currentItem.date || '',
      amount: currentItem.amount || '',
      description: currentItem.description || '',
      gstin: currentItem.gstin,
      gstAmount: currentItem.gstAmount,
      bills: [],
    };

    setExpenseItems([...expenseItems, newItem]);
    setCurrentItem({ category: '', date: '', amount: '', description: '' });
    toast.success('Expense item added');
  };

  const handleRemoveExpense = (id: string) => {
    setExpenseItems(expenseItems.filter(item => item.id !== id));
  };

  // BR-P0-001 Bug 2: Enhanced form validation and error handling
  const handleSubmitClaim = async () => {
    // Validation: Travel request selection
    if (!selectedTravelRequest) {
      toast.error('Please select a travel request');
      return;
    }

    // Validation: At least one expense item
    if (expenseItems.length === 0) {
      toast.error('Please add at least one expense item');
      return;
    }

    // Validation: All expense items must have valid data
    const invalidItems = expenseItems.filter(item => {
      return !item.category || !item.date || !item.amount || parseFloat(item.amount || '0') <= 0 || !item.description;
    });

    if (invalidItems.length > 0) {
      toast.error('Please ensure all expense items have valid category, date, amount, and description');
      return;
    }

    // Validation: Date format
    const invalidDates = expenseItems.filter(item => {
      const date = new Date(item.date);
      return isNaN(date.getTime());
    });

    if (invalidDates.length > 0) {
      toast.error('Please ensure all dates are valid');
      return;
    }

    try {
      setIsSubmitting(true);

      // Transform expense items to match backend structure
      const travelExpenses = expenseItems
        .filter(item => item.category === 'travel')
        .map(item => ({
          date: new Date(item.date),
          mode: 'Other', // TODO: Get from form
          from: '',
          to: '',
          amount: parseFloat(item.amount || '0'),
          bookingCharges: 0,
          bills: [],
        }));

      const payload = {
        travelRequestId: selectedTravelRequest,
        claimType,
        travelExpenses,
        accommodation: [],
        dailyAllowance: [],
        localConveyance: [],
        incidentalExpenses: expenseItems
          .filter(item => item.category === 'other')
          .map(item => ({
            category: item.category,
            date: new Date(item.date),
            description: item.description,
            amount: parseFloat(item.amount || '0'),
            bills: [],
          })),
        remarks: '',
      };

      const response = await apiService.createTravelClaim(payload);

      if (response.success) {
        toast.success('Travel claim created successfully!');
        router.push('/travel');
      } else {
        toast.error(response.message || 'Failed to create travel claim');
      }
    } catch (error: any) {
      // BR-P0-001 Bug 2: User-friendly error messages
      if (error.message && error.message.includes('fetch')) {
        toast.error('Network error: Please check your internet connection and try again');
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred. Please try again later.');
      }
      console.error('Expense claim submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = expenseItems.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Submit Travel Claim</h1>
          <p className="text-muted-foreground mt-2">Submit your travel expenses for reimbursement</p>
        </div>

        {/* Travel Request Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Travel Request</CardTitle>
            <CardDescription>Link this claim to an approved travel request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="travelRequest">Travel Request <span className="text-red-500">*</span></Label>
              <Select value={selectedTravelRequest} onValueChange={setSelectedTravelRequest}>
                <SelectTrigger id="travelRequest">
                  <SelectValue placeholder="Select travel request" />
                </SelectTrigger>
                <SelectContent>
                  {travelRequests.length > 0 ? (
                    travelRequests.map((request) => {
                      const requestId = request._id || request.id;
                      return (
                        <SelectItem key={requestId} value={requestId}>
                          {request.origin} → {request.destination} {isMounted && request.departureDate ? `(${formatDateDDMMYYYY(request.departureDate)})` : ''}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="" disabled>No approved travel requests found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="claimType">Claim Type</Label>
              <Select value={claimType} onValueChange={(value: any) => setClaimType(value)}>
                <SelectTrigger id="claimType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular Travel">Regular Travel</SelectItem>
                  <SelectItem value="LTA">LTA (Leave Travel Allowance)</SelectItem>
                  <SelectItem value="Mileage">Mileage</SelectItem>
                  <SelectItem value="Other Allowance">Other Allowance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="expenses" className="w-full">
          <TabsList>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="travel">Travel Details</TabsTrigger>
            <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
            <TabsTrigger value="da">Daily Allowance</TabsTrigger>
            <TabsTrigger value="review">Review & Submit</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Items</CardTitle>
                <CardDescription>Add all expense items with bills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                    <Select value={currentItem.category} onValueChange={(value) => setCurrentItem({ ...currentItem, category: value })}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="meals">Meals</SelectItem>
                        <SelectItem value="local">Local Conveyance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="date"
                      type="date"
                      value={currentItem.date}
                      onChange={(e) => setCurrentItem({ ...currentItem, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={currentItem.amount}
                        onChange={(e) => setCurrentItem({ ...currentItem, amount: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN (if applicable)</Label>
                    <Input
                      id="gstin"
                      placeholder="29ABCDE1234F1Z5"
                      maxLength={15}
                      value={currentItem.gstin || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, gstin: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the expense..."
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <Button onClick={handleAddExpense} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Expense
                </Button>

                {expenseItems.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    {expenseItems.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{item.category}</p>
                            <Badge variant="outline">₹{parseFloat(item.amount).toLocaleString()}</Badge>
                            {item.gstin && <Badge variant="outline" className="text-xs">GST: {item.gstin}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Date: {item.date}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExpense(item.id)}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Claim Amount</span>
                        <span>₹{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>Review your claim before submission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-semibold">Total Expenses</span>
                    <span className="font-bold">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-semibold">Advance Paid</span>
                    <span className="font-bold">₹0</span>
                  </div>
                  <div className="flex justify-between p-3 bg-primary/10 rounded-lg font-bold text-lg">
                    <span>Net Payable</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Approval Workflow:</p>
                  <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                    <li>Level 1: Reporting Manager (verify purpose, bills)</li>
                    {totalAmount > 25000 && <li>Level 2: Department Head (if claim &gt; ₹25,000)</li>}
                    <li>Level 3: Finance (policy compliance, GST validation)</li>
                    <li>Level 4: Finance Approval for Payment</li>
                  </ol>
                </div>

                <Button className="w-full" size="lg" onClick={handleSubmitClaim} disabled={isSubmitting || !selectedTravelRequest || expenseItems.length === 0}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Claim for Approval'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
