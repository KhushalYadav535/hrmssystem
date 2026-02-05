'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plane, Users, MapPin, AlertCircle, Plus, FileText, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import apiService from '@/lib/api';

export default function LTAPage() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('balance');
  const [journeyDate, setJourneyDate] = useState<Date>();
  const [ltaBalance, setLtaBalance] = useState<any>(null);
  const [ltas, setLtas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);

  useEffect(() => {
    loadCurrentEmployee();
  }, []);

  useEffect(() => {
    if (currentEmployee) {
      loadLTAData();
    }
  }, [currentEmployee]);

  const loadCurrentEmployee = async () => {
    try {
      const empResponse = await apiService.getEmployees({ email: user?.email });
      if (empResponse.success && empResponse.data && Array.isArray(empResponse.data) && empResponse.data.length > 0) {
        setCurrentEmployee(empResponse.data[0]);
      }
    } catch (error) {
      console.error('Failed to load current employee', error);
    }
  };

  const loadLTAData = async () => {
    if (!currentEmployee?._id && !currentEmployee?.id) return;
    try {
      setIsLoading(true);
      const employeeId = currentEmployee._id || currentEmployee.id;
      
      const [balanceRes, ltasRes] = await Promise.all([
        apiService.getLTABalance(employeeId),
        apiService.getLTAs({ employeeId }),
      ]);

      if (balanceRes.success && balanceRes.data) {
        setLtaBalance(balanceRes.data);
      }
      if (ltasRes.success && ltasRes.data) {
        setLtas(Array.isArray(ltasRes.data) ? ltasRes.data : []);
      }
    } catch (error) {
      console.error('Failed to load LTA data', error);
      toast.error('Failed to load LTA data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    redirect('/login');
  }

  const handleNewLTA = () => {
    toast.success('LTA claim form opened');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leave Travel Allowance (LTA)</h1>
            <p className="text-muted-foreground mt-2">Manage your LTA claims and track block utilization</p>
          </div>
          <Button onClick={handleNewLTA} className="gap-2">
            <Plus className="w-4 h-4" />
            New LTA Claim
          </Button>
        </div>

        {/* LTA Balance Summary */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Current Block</p>
                  <p className="text-2xl font-bold">{ltaBalance?.blockYear || 'N/A'}</p>
                  {ltaBalance?.blockStartDate && ltaBalance?.blockEndDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(ltaBalance.blockStartDate), 'MMM dd, yyyy')} - {format(new Date(ltaBalance.blockEndDate), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Journeys</p>
                  <p className="text-2xl font-bold">{ltaBalance?.totalJourneys || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Available per block</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Journeys Used</p>
                  <p className="text-2xl font-bold text-yellow-600">{ltaBalance?.journeysUtilized || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Out of {ltaBalance?.totalJourneys || 0}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold text-green-600">{ltaData.journeysRemaining}</p>
                  <p className="text-xs text-muted-foreground mt-1">Journeys available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">LTA Policy</p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>2 journeys allowed per block of 4 years</li>
                  <li>Family includes: Self, Spouse, and up to 2 children</li>
                  <li>Eligible modes: Train, Air, Public Transport</li>
                  <li>Exemption amount: Actual fare or entitled class fare, whichever is lower</li>
                  <li>Block expires on: {format(new Date(ltaData.blockEndDate), 'MMMM dd, yyyy')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="balance">LTA Balance</TabsTrigger>
            <TabsTrigger value="claims">My Claims</TabsTrigger>
            <TabsTrigger value="new">New Claim</TabsTrigger>
          </TabsList>

          <TabsContent value="balance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>LTA Utilization Summary</CardTitle>
                <CardDescription>Track your LTA usage in the current block</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-semibold">Block Period</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(ltaData.blockStartDate), 'MMM dd, yyyy')} - {format(new Date(ltaData.blockEndDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Badge variant="outline">{ltaData.currentBlock}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{ltaData.totalJourneys}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Available</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{ltaData.journeysUsed}</p>
                      <p className="text-xs text-muted-foreground mt-1">Used</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{ltaData.journeysRemaining}</p>
                      <p className="text-xs text-muted-foreground mt-1">Remaining</p>
                    </div>
                  </div>

                  {new Date(ltaData.blockEndDate) < new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                        ⚠️ Block expires in less than 6 months. Use remaining journeys soon!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>LTA Claims History</CardTitle>
                <CardDescription>View all your LTA claims in the current block</CardDescription>
              </CardHeader>
              <CardContent>
                {ltaData.journeys.length > 0 ? (
                  <div className="space-y-3">
                    {ltaData.journeys.map((journey) => (
                      <div key={journey.id} className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Plane className="w-4 h-4 text-muted-foreground" />
                              <p className="font-semibold">{journey.destination}</p>
                              <Badge className={journey.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                {journey.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Date: {format(new Date(journey.date), 'MMM dd, yyyy')}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {journey.familyMembers.join(', ')}
                              </span>
                              <span>Amount: ₹{journey.amount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No LTA claims submitted yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>New LTA Claim</CardTitle>
                <CardDescription>Submit a new LTA claim for your travel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Journey Date <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !journeyDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {journeyDate ? format(journeyDate, 'PPP') : 'Select journey date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={journeyDate}
                        onSelect={setJourneyDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination <span className="text-red-500">*</span></Label>
                  <Input id="destination" placeholder="City, State" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode">Mode of Travel <span className="text-red-500">*</span></Label>
                  <Select>
                    <SelectTrigger id="mode">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="air">Air</SelectItem>
                      <SelectItem value="bus">Bus (Public Transport)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Family Members Traveling</Label>
                  <div className="space-y-2">
                    {['Self', 'Spouse', 'Child 1', 'Child 2'].map((member) => (
                      <div key={member} className="flex items-center space-x-2">
                        <input type="checkbox" id={member} className="rounded" defaultChecked={member === 'Self'} />
                        <Label htmlFor={member} className="cursor-pointer">{member}</Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Maximum 2 children allowed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticketAmount">Ticket Amount <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">₹</span>
                    <Input id="ticketAmount" type="number" placeholder="0.00" className="pl-8" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticketUpload">Upload Ticket Copies</Label>
                  <Input id="ticketUpload" type="file" accept="image/*,.pdf" multiple />
                  <p className="text-xs text-muted-foreground">Upload tickets for all family members</p>
                </div>

                <Button className="w-full">Submit LTA Claim</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
