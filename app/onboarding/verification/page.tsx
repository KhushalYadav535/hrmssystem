'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, Clock, RefreshCw, User, CreditCard, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function VerificationPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<{
    aadhaar: 'pending' | 'verifying' | 'verified' | 'failed';
    pan: 'pending' | 'verifying' | 'verified' | 'failed';
  }>({
    aadhaar: 'pending',
    pan: 'pending',
  });

  if (!isAuthenticated) {
    redirect('/login');
  }

  const handleAadhaarVerify = () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      toast.error('Please enter valid 12-digit Aadhaar number');
      return;
    }

    setVerificationStatus(prev => ({ ...prev, aadhaar: 'verifying' }));
    toast.info('Initiating Aadhaar verification...');

    // Simulate API call
    setTimeout(() => {
      setVerificationStatus(prev => ({ ...prev, aadhaar: 'verified' }));
      toast.success('Aadhaar verified successfully!');
    }, 2000);
  };

  const handlePANVerify = () => {
    if (!panNumber || panNumber.length !== 10) {
      toast.error('Please enter valid 10-character PAN number');
      return;
    }

    setVerificationStatus(prev => ({ ...prev, pan: 'verifying' }));
    toast.info('Initiating PAN verification...');

    // Simulate API call
    setTimeout(() => {
      setVerificationStatus(prev => ({ ...prev, pan: 'verified' }));
      toast.success('PAN verified successfully!');
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Identity Verification</h1>
          <p className="text-muted-foreground mt-2">Verify Aadhaar and PAN through government APIs</p>
        </div>

        <Tabs defaultValue="aadhaar" className="w-full">
          <TabsList>
            <TabsTrigger value="aadhaar">Aadhaar Verification</TabsTrigger>
            <TabsTrigger value="pan">PAN Verification</TabsTrigger>
            <TabsTrigger value="status">Verification Status</TabsTrigger>
          </TabsList>

          <TabsContent value="aadhaar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Aadhaar Verification (UIDAI)
                </CardTitle>
                <CardDescription>Verify Aadhaar number through UIDAI API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="aadhaar">Aadhaar Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="aadhaar"
                    placeholder="XXXX XXXX XXXX"
                    maxLength={14}
                    value={aadhaarNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '');
                      if (/^\d{0,12}$/.test(value)) {
                        const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                        setAadhaarNumber(formatted);
                      }
                    }}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter 12-digit Aadhaar number. OTP will be sent to registered mobile number.
                  </p>
                </div>

                {verificationStatus.aadhaar === 'verified' && (
                  <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-100">Aadhaar Verified</p>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            Name: Rajesh Kumar | DOB: 15/06/1990
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            Masked Aadhaar: XXXX XXXX 1234
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {verificationStatus.aadhaar === 'verifying' && (
                  <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                        <p className="font-semibold text-blue-900 dark:text-blue-100">Verifying Aadhaar...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={handleAadhaarVerify}
                  disabled={verificationStatus.aadhaar === 'verifying' || verificationStatus.aadhaar === 'verified'}
                  className="w-full"
                  size="lg"
                >
                  {verificationStatus.aadhaar === 'verifying' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : verificationStatus.aadhaar === 'verified' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verified
                    </>
                  ) : (
                    'Verify Aadhaar'
                  )}
                </Button>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs font-semibold mb-2">Verification Process:</p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Enter Aadhaar number</li>
                    <li>OTP will be sent to registered mobile number</li>
                    <li>Enter OTP to complete verification</li>
                    <li>Demographic details will be fetched (name, DOB, address)</li>
                    <li>Only masked Aadhaar (XXXX-XXXX-1234) will be stored</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  PAN Verification (Income Tax Department)
                </CardTitle>
                <CardDescription>Verify PAN authenticity through Income Tax API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="pan"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    value={panNumber}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      if (value.length <= 10) {
                        setPanNumber(value);
                      }
                    }}
                    className="text-lg font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter 10-character PAN number (e.g., ABCDE1234F)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="panName">Name as per PAN</Label>
                  <Input
                    id="panName"
                    placeholder="Enter name exactly as per PAN card"
                  />
                  <p className="text-xs text-muted-foreground">
                    Name will be matched with PAN database
                  </p>
                </div>

                {verificationStatus.pan === 'verified' && (
                  <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-100">PAN Verified</p>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            PAN: {panNumber} | Status: Active
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            Name match: Verified
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {verificationStatus.pan === 'verifying' && (
                  <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                        <p className="font-semibold text-blue-900 dark:text-blue-100">Verifying PAN...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={handlePANVerify}
                  disabled={verificationStatus.pan === 'verifying' || verificationStatus.pan === 'verified'}
                  className="w-full"
                  size="lg"
                >
                  {verificationStatus.pan === 'verifying' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : verificationStatus.pan === 'verified' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verified
                    </>
                  ) : (
                    'Verify PAN'
                  )}
                </Button>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs font-semibold mb-2">Verification Process:</p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Enter PAN number and name</li>
                    <li>System validates PAN format and authenticity</li>
                    <li>PAN-Name match is verified</li>
                    <li>PAN status (Active/Inactive) is checked</li>
                    <li>Verification result is stored</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Verification Status Summary</CardTitle>
                <CardDescription>Overall verification status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className={verificationStatus.aadhaar === 'verified' ? 'border-green-500' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">Aadhaar</p>
                            <p className="text-xs text-muted-foreground">UIDAI Verification</p>
                          </div>
                        </div>
                        <Badge className={
                          verificationStatus.aadhaar === 'verified' ? 'bg-green-600' :
                          verificationStatus.aadhaar === 'verifying' ? 'bg-blue-600' : 'bg-gray-600'
                        }>
                          {verificationStatus.aadhaar === 'verified' ? 'Verified' :
                           verificationStatus.aadhaar === 'verifying' ? 'Verifying' : 'Pending'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={verificationStatus.pan === 'verified' ? 'border-green-500' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">PAN</p>
                            <p className="text-xs text-muted-foreground">Income Tax Verification</p>
                          </div>
                        </div>
                        <Badge className={
                          verificationStatus.pan === 'verified' ? 'bg-green-600' :
                          verificationStatus.pan === 'verifying' ? 'bg-blue-600' : 'bg-gray-600'
                        }>
                          {verificationStatus.pan === 'verified' ? 'Verified' :
                           verificationStatus.pan === 'verifying' ? 'Verifying' : 'Pending'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {verificationStatus.aadhaar === 'verified' && verificationStatus.pan === 'verified' && (
                  <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="p-6 text-center">
                      <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <p className="font-semibold text-lg">All Verifications Complete</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Aadhaar and PAN have been successfully verified
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
