'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, Smartphone, Mail, CheckCircle2, AlertCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function MFAPage() {
  const { isAuthenticated } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaMethod, setMfaMethod] = useState<'sms' | 'email' | 'app'>('sms');
  const [otpCode, setOtpCode] = useState('');
  const [qrCode, setQrCode] = useState('');

  if (!isAuthenticated) {
    redirect('/login');
  }

  const handleEnableMFA = () => {
    if (mfaMethod === 'sms') {
      toast.success('OTP sent to your registered mobile number');
      setOtpCode('');
    } else if (mfaMethod === 'email') {
      toast.success('OTP sent to your registered email');
      setOtpCode('');
    } else if (mfaMethod === 'app') {
      setQrCode('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5RUiBDb2RlPC90ZXh0Pjwvc3ZnPg==');
      toast.success('QR code generated. Scan with authenticator app.');
    }
  };

  const handleVerifyOTP = () => {
    if (!otpCode) {
      toast.error('Please enter OTP');
      return;
    }
    setMfaEnabled(true);
    toast.success('MFA enabled successfully!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Multi-Factor Authentication</h1>
          <p className="text-muted-foreground mt-2">Enable MFA for enhanced account security</p>
        </div>

        {/* Current Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className={`w-8 h-8 ${mfaEnabled ? 'text-green-600' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-semibold">MFA Status</p>
                  <p className="text-sm text-muted-foreground">
                    {mfaEnabled ? 'Multi-factor authentication is enabled' : 'Multi-factor authentication is disabled'}
                  </p>
                </div>
              </div>
              <Badge className={mfaEnabled ? 'bg-green-600' : 'bg-gray-600'}>
                {mfaEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {!mfaEnabled ? (
          <Card>
            <CardHeader>
              <CardTitle>Enable Multi-Factor Authentication</CardTitle>
              <CardDescription>Choose your preferred MFA method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Select MFA Method <span className="text-red-500">*</span></Label>
                <RadioGroup value={mfaMethod} onValueChange={(value: any) => setMfaMethod(value)} className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-secondary/50">
                    <RadioGroupItem value="sms" id="sms" className="mt-1" />
                    <Label htmlFor="sms" className="cursor-pointer flex-1">
                      <div className="flex items-start gap-3">
                        <Smartphone className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-semibold">SMS OTP</p>
                          <p className="text-xs text-muted-foreground">
                            Receive OTP via SMS on your registered mobile number
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-secondary/50">
                    <RadioGroupItem value="email" id="email" className="mt-1" />
                    <Label htmlFor="email" className="cursor-pointer flex-1">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-semibold">Email OTP</p>
                          <p className="text-xs text-muted-foreground">
                            Receive OTP via email on your registered email address
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-secondary/50">
                    <RadioGroupItem value="app" id="app" className="mt-1" />
                    <Label htmlFor="app" className="cursor-pointer flex-1">
                      <div className="flex items-start gap-3">
                        <QrCode className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-semibold">Authenticator App</p>
                          <p className="text-xs text-muted-foreground">
                            Use Google Authenticator, Microsoft Authenticator, or similar apps
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {mfaMethod === 'app' && qrCode && (
                <Card className="border-primary">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto border rounded-lg" />
                        <p className="text-sm text-muted-foreground mt-3">
                          Scan this QR code with your authenticator app
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Enter 6-digit code from app</Label>
                        <Input
                          placeholder="000000"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="text-center text-lg font-mono"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(mfaMethod === 'sms' || mfaMethod === 'email') && (
                <div className="space-y-2">
                  <Label>Enter OTP</Label>
                  <Input
                    placeholder="6-digit OTP"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-lg font-mono"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleEnableMFA} variant="outline">
                  {mfaMethod === 'app' ? 'Generate QR Code' : 'Send OTP'}
                </Button>
                {otpCode && (
                  <Button onClick={handleVerifyOTP} className="flex-1">
                    Verify & Enable MFA
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    MFA is Enabled
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                    Your account is protected with {mfaMethod === 'sms' ? 'SMS OTP' : mfaMethod === 'email' ? 'Email OTP' : 'Authenticator App'}.
                    You will be required to verify your identity during login and for sensitive operations.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setMfaEnabled(false)}>
                    Disable MFA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">MFA Requirements</p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>MFA is mandatory for Payroll Admin, HR Admin, and System Admin roles</li>
                  <li>MFA will be required for sensitive operations (salary revision, data export, etc.)</li>
                  <li>OTP is valid for 5 minutes</li>
                  <li>You can change MFA method anytime from settings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
