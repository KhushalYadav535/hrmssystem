'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plane, MapPin, Clock, FileText, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function TravelRequestPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [travelType, setTravelType] = useState<'domestic' | 'international' | 'local'>('domestic');
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [mode, setMode] = useState<string>('');
  const [formData, setFormData] = useState({
    purpose: '',
    origin: '',
    destination: '',
    estimatedAmount: '',
    remarks: '',
  });

  if (!isAuthenticated) {
    redirect('/login');
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!departureDate || !returnDate || !mode || !formData.purpose || !formData.origin || !formData.destination) {
      toast.error('Please fill all required fields');
      return;
    }

    if (returnDate < departureDate) {
      toast.error('Return date must be after departure date');
      return;
    }

    toast.success('Travel request submitted successfully!');
    // In production, this would call an API
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Travel Request</h1>
          <p className="text-muted-foreground mt-2">Submit a new travel request for approval</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Travel Details</CardTitle>
            <CardDescription>Fill in the travel information below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Travel Type */}
            <div className="space-y-3">
              <Label>Travel Type <span className="text-red-500">*</span></Label>
              <RadioGroup value={travelType} onValueChange={(value: any) => setTravelType(value)} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="domestic" id="domestic" />
                  <Label htmlFor="domestic" className="cursor-pointer">Domestic</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="international" id="international" />
                  <Label htmlFor="international" className="cursor-pointer">International</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="local" id="local" />
                  <Label htmlFor="local" className="cursor-pointer">Local Conveyance</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Travel <span className="text-red-500">*</span></Label>
              <Textarea
                id="purpose"
                placeholder="Describe the purpose of your travel..."
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                rows={3}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Departure Date <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !departureDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {departureDate ? format(departureDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={departureDate}
                      onSelect={setDepartureDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Return Date <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !returnDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {returnDate ? format(returnDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={setReturnDate}
                      initialFocus
                      disabled={(date) => departureDate ? date < departureDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Origin & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="origin"
                    placeholder="City, State"
                    value={formData.origin}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="destination"
                    placeholder="City, State"
                    value={formData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Mode of Travel */}
            <div className="space-y-2">
              <Label htmlFor="mode">Mode of Travel <span className="text-red-500">*</span></Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger id="mode">
                  <SelectValue placeholder="Select mode of travel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="car">Car (Own/Company)</SelectItem>
                  <SelectItem value="taxi">Taxi/Cab</SelectItem>
                  {travelType === 'local' && (
                    <>
                      <SelectItem value="metro">Metro</SelectItem>
                      <SelectItem value="auto">Auto Rickshaw</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Amount */}
            <div className="space-y-2">
              <Label htmlFor="estimatedAmount">Estimated Expense Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-muted-foreground">₹</span>
                <Input
                  id="estimatedAmount"
                  type="number"
                  placeholder="0.00"
                  value={formData.estimatedAmount}
                  onChange={(e) => handleInputChange('estimatedAmount', e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum advance available: 80% of estimated amount
              </p>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Additional Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Any additional information..."
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSubmit} className="gap-2">
                <Save className="w-4 h-4" />
                Submit Request
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
