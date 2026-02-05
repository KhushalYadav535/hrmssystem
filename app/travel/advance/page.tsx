'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, DollarSign, AlertCircle, Save, X, Info, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import apiService from '@/lib/api';

export default function TravelAdvancePage() {
  const { isAuthenticated } = useAuth();
  const [travelDate, setTravelDate] = useState<Date>();
  const [formData, setFormData] = useState({
    travelRequestId: '',
    purpose: '',
    destination: '',
    estimatedExpense: '',
    advanceAmount: '',
    reason: '',
  });

  if (!isAuthenticated) {
    redirect('/login');
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate advance amount (80% of estimated expense)
      if (field === 'estimatedExpense' && value) {
        const estimated = parseFloat(value) || 0;
        updated.advanceAmount = (estimated * 0.8).toFixed(2);
      }
      
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!travelDate || !formData.purpose || !formData.destination || !formData.estimatedExpense) {
      toast.error('Please fill all required fields');
      return;
    }

    toast.success('Travel advance request submitted successfully!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Request Travel Advance</h1>
          <p className="text-muted-foreground mt-2">Request advance payment for your upcoming travel</p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Advance Policy</p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>Maximum advance: 80% of estimated expenses</li>
                  <li>Advance will be adjusted against final claim settlement</li>
                  <li>Approval required from reporting manager and finance (if amount &gt; ₹50,000)</li>
                  <li>Advance will be credited in next salary cycle</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advance Request Details</CardTitle>
            <CardDescription>Fill in the information below to request travel advance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Travel Request Link */}
            <div className="space-y-2">
              <Label htmlFor="travelRequestId">Linked Travel Request <span className="text-red-500">*</span></Label>
              <Select value={formData.travelRequestId} onValueChange={(value) => {
                handleInputChange('travelRequestId', value);
                // Auto-fill from selected travel request
                const selectedRequest = travelRequests.find(r => (r._id || r.id) === value);
                if (selectedRequest) {
                  setFormData(prev => ({
                    ...prev,
                    travelRequestId: value,
                    estimatedExpense: selectedRequest.estimatedAmount?.toString() || '',
                    advanceAmount: (selectedRequest.estimatedAmount * 0.8).toFixed(2),
                  }));
                }
              }}>
                <SelectTrigger id="travelRequestId">
                  <SelectValue placeholder="Select approved travel request" />
                </SelectTrigger>
                <SelectContent>
                  {travelRequests.length > 0 ? (
                    travelRequests.map((request) => {
                      const requestId = request._id || request.id;
                      return (
                        <SelectItem key={requestId} value={requestId}>
                          {request.origin} → {request.destination} ({request.departureDate ? new Date(request.departureDate).toLocaleDateString() : ''}) - ₹{request.estimatedAmount}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="" disabled>No approved travel requests found</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Select an approved travel request to link this advance</p>
            </div>

            {/* Travel Date */}
            <div className="space-y-2">
              <Label>Travel Date <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !travelDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {travelDate ? format(travelDate, 'PPP') : 'Select travel date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={travelDate}
                    onSelect={setTravelDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Travel <span className="text-red-500">*</span></Label>
              <Textarea
                id="purpose"
                placeholder="Describe the purpose of your travel..."
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                rows={2}
              />
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <Label htmlFor="destination">Destination <span className="text-red-500">*</span></Label>
              <Input
                id="destination"
                placeholder="City, State"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
              />
            </div>

            {/* Estimated Expense */}
            <div className="space-y-2">
              <Label htmlFor="estimatedExpense">Estimated Total Expense <span className="text-red-500">*</span></Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="estimatedExpense"
                  type="number"
                  placeholder="0.00"
                  value={formData.estimatedExpense}
                  onChange={(e) => handleInputChange('estimatedExpense', e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Include travel, accommodation, meals, and other expenses
              </p>
            </div>

            {/* Advance Amount (Auto-calculated) */}
            <div className="space-y-2">
              <Label htmlFor="advanceAmount">Requested Advance Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="advanceAmount"
                  type="number"
                  value={formData.advanceAmount}
                  readOnly
                  className="pl-10 bg-muted"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {formData.estimatedExpense ? `${((parseFloat(formData.advanceAmount) / parseFloat(formData.estimatedExpense)) * 100).toFixed(0)}%` : '80%'} of estimated
                </Badge>
                <span className="text-xs text-muted-foreground">(Maximum allowed: 80%)</span>
              </div>
            </div>

            {/* Reason for Advance */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Advance <span className="text-red-500">*</span></Label>
              <Textarea
                id="reason"
                placeholder="Explain why advance is needed..."
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                rows={3}
              />
            </div>

            {/* Expense Breakdown */}
            {formData.estimatedExpense && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Estimated Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Travel</span>
                    <span className="font-medium">₹{((parseFloat(formData.estimatedExpense) || 0) * 0.4).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accommodation</span>
                    <span className="font-medium">₹{((parseFloat(formData.estimatedExpense) || 0) * 0.35).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Meals & DA</span>
                    <span className="font-medium">₹{((parseFloat(formData.estimatedExpense) || 0) * 0.2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Other</span>
                    <span className="font-medium">₹{((parseFloat(formData.estimatedExpense) || 0) * 0.05).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Total</span>
                    <span>₹{(parseFloat(formData.estimatedExpense) || 0).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSubmit} className="gap-2">
                <Save className="w-4 h-4" />
                Submit Advance Request
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
