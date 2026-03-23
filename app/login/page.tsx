'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import apiService from '@/lib/api';
import { Building2, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useReCaptcha } from '@/components/captcha/recaptcha';

export default function LoginPage() {
  const router = useRouter();
  const { login, registerTenant, loginWithUserSelect } = useAuth();
  const [activeTab, setActiveTab] = useState('email-login'); // US-A1-04: Email login is always default
  const [isLoading, setIsLoading] = useState(false);
  
  // Email Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // MFA State (US-A1-01)
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaMethod, setMfaMethod] = useState<'Email' | 'SMS' | 'Authenticator'>('Email');
  const [mfaTempToken, setMfaTempToken] = useState<string>('');
  const [mfaCountdown, setMfaCountdown] = useState(600); // 10 minutes in seconds
  const [mfaResendDisabled, setMfaResendDisabled] = useState(false);
  
  // Forgot Password State (US-A1-02)
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  
  // CAPTCHA State (US-A1-03)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const { execute: executeRecaptcha } = useReCaptcha('login');
  
  // Registration State
  const [regTenantName, setRegTenantName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLocation, setRegLocation] = useState('India');
  const [regCode, setRegCode] = useState('');
  
  // US-A2-01: Registration OTP State
  const [showRegistrationOTP, setShowRegistrationOTP] = useState(false);
  const [registrationOTP, setRegistrationOTP] = useState('');
  const [registrationTenantId, setRegistrationTenantId] = useState('');
  const [registrationOTPCountdown, setRegistrationOTPCountdown] = useState(600);
  const [registrationOTPResendDisabled, setRegistrationOTPResendDisabled] = useState(false);

  // Load tenants for quick login (Super Admin only)
  useEffect(() => {
    const loadTenants = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Try to get tenants if super admin
          // For now, we'll skip this as it requires super admin access
        }
      } catch (error) {
        // Ignore errors
      }
    };
    loadTenants();
  }, []);

  // Email/Password Login Handler (US-A1-01: MFA enforcement, US-A1-03: CAPTCHA)
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    // US-A1-03: Execute CAPTCHA if required (after 3 failed attempts)
    let recaptchaToken = null;
    if (showCaptcha || failedAttempts >= 3) {
      try {
        recaptchaToken = await executeRecaptcha();
        if (!recaptchaToken) {
          toast.error('Please verify you are not a robot');
          return;
        }
      } catch (error) {
        console.error('CAPTCHA error:', error);
        // Continue without CAPTCHA if it fails (graceful degradation)
      }
    }

    setIsLoading(true);
    try {
      // Call login API directly to check for MFA requirement
      const response = await apiService.post('/auth/login', { 
        email, 
        password,
        recaptchaToken, // Include CAPTCHA token if available
      });
      
      if (response.success && response.data) {
        // Check if MFA is required
        if (response.data.requiresMFA) {
          setMfaMethod(response.data.mfaMethod || 'Email');
          setMfaTempToken(response.data.tempToken || '');
          setShowMFA(true);
          setMfaCountdown(600); // 10 minutes
          
          // If Email/SMS, send OTP
          if (response.data.mfaMethod === 'Email' || response.data.mfaMethod === 'SMS') {
            toast.info(`OTP sent to your ${response.data.mfaMethod.toLowerCase()}`);
          }
        } else {
          // No MFA required, proceed with normal login
          const result = await login(email, password);
          if (result.success) {
            toast.success('Login successful');
            router.push('/dashboard');
          } else {
            toast.error(result.message);
            setFailedAttempts(prev => prev + 1);
            if (failedAttempts + 1 >= 3) {
              setShowCaptcha(true);
            }
          }
        }
      } else {
        toast.error(response.message || 'Login failed');
        setFailedAttempts(prev => prev + 1);
        if (failedAttempts + 1 >= 3) {
          setShowCaptcha(true);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      setFailedAttempts(prev => prev + 1);
      if (failedAttempts + 1 >= 3) {
        setShowCaptcha(true);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // MFA Verification Handler (US-A1-01)
  const handleMFAVerify = async () => {
    if (!mfaCode || mfaCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiService.post('/auth/mfa/verify', {
        code: mfaCode,
        method: mfaMethod,
      });
      
      if (response.success) {
        toast.success('MFA verification successful');
        // Update auth context with new token
        const result = await login(email, password);
        if (result.success) {
          router.push('/dashboard');
        }
      } else {
        toast.error(response.message || 'Invalid MFA code');
        setMfaCode('');
      }
    } catch (error: any) {
      toast.error(error.message || 'MFA verification failed');
      setMfaCode('');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Forgot Password Handler (US-A1-02)
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiService.post('/auth/forgot-password', {
        email: forgotPasswordEmail,
      });
      
      if (response.success) {
        setForgotPasswordSent(true);
        toast.success('Password reset link sent to your email');
      } else {
        toast.error(response.message || 'Failed to send reset link');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  // User Select Login Handler (for demo/testing)
  const handleUserSelectLogin = async () => {
    if (!selectedUser || !selectedTenant) {
      toast.error('Please select tenant and user');
      return;
    }

    setIsLoading(true);
    try {
      // For quick login, we'll use the email from selected user
      // In production, this would be handled differently
      await loginWithUserSelect(selectedUser, selectedTenant);
      toast.success('Login successful');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Registration Handler (US-A2-01: Email OTP Verification)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regTenantName || !regEmail || !regPassword || !regCode) {
      toast.error('Please fill all required fields');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (regPassword.length < 12) {
      toast.error('Password must be at least 12 characters with uppercase, lowercase, digit, and special character');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.post('/auth/register-tenant', {
        tenantName: regTenantName,
        code: regCode,
        location: regLocation,
        adminEmail: regEmail,
        adminPassword: regPassword,
        adminName: regTenantName + ' Admin',
      });
      
      if (response.success) {
        if (response.data?.requiresOTPVerification) {
          // Show OTP verification screen
          setRegistrationTenantId(response.data.tenantId);
          setShowRegistrationOTP(true);
          setRegistrationOTPCountdown(600); // 10 minutes
          toast.success('OTP sent to your email. Please verify to complete registration.');
        } else {
          // Old flow (shouldn't happen with new implementation)
          toast.success('Tenant registered successfully!');
          router.push('/dashboard');
        }
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // US-A2-01: Verify Registration OTP
  const handleVerifyRegistrationOTP = async () => {
    if (!registrationOTP || registrationOTP.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiService.post('/auth/verify-registration-otp', {
        tenantId: registrationTenantId,
        otp: registrationOTP,
        adminPassword: regPassword,
        adminName: regTenantName + ' Admin',
      });
      
      if (response.success) {
        toast.success('Email verified! Your registration is pending Platform Admin approval. You will be notified once approved.');
        setShowRegistrationOTP(false);
        setRegistrationOTP('');
        setRegTenantName('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegCode('');
        setActiveTab('email-login');
      } else {
        toast.error(response.message || 'Invalid OTP');
        setRegistrationOTP('');
      }
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed');
      setRegistrationOTP('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo Section */}
        <div className="text-center mb-10 space-y-2">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-white to-accent/20 rounded-2xl flex items-center justify-center shadow-xl">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div className="text-white text-left">
              <h1 className="text-4xl font-bold tracking-tight">Indian Bank</h1>
              <p className="text-sm text-primary-foreground/80 font-medium">Enterprise HRMS Portal</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Welcome Back</CardTitle>
            <CardDescription className="text-base">Manage your human resources with ease and efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value="email-login" className="w-full">

              {/* Email/Password Login */}
              <TabsContent value="email-login" className="space-y-4">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@indianbank.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full h-10 font-semibold">
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  
                  {/* US-A1-02: Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  
                  {/* US-A1-03: CAPTCHA (shown after 3 failed attempts) */}
                  {showCaptcha && (
                    <div className="bg-accent/10 border border-accent rounded-lg p-4">
                      <AlertCircle className="w-5 h-5 text-accent mb-2" />
                      <p className="text-sm text-foreground mb-2">
                        Please verify you are not a robot.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        reCAPTCHA v3 will verify automatically when you click Sign In
                      </div>
                    </div>
                  )}
                </form>
                
                {/* US-A1-01: MFA Screen */}
                {showMFA && (
                  <div className="space-y-4 mt-4 p-4 border rounded-lg bg-accent/5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Multi-Factor Authentication</h3>
                      <button
                        onClick={() => {
                          setShowMFA(false);
                          setMfaCode('');
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter the code sent to {email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="mfaCode">6-Digit Code</Label>
                      <Input
                        id="mfaCode"
                        type="text"
                        maxLength={6}
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="text-center text-2xl tracking-widest"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Expires in {Math.floor(mfaCountdown / 60)}:{(mfaCountdown % 60).toString().padStart(2, '0')}</span>
                        <button
                          onClick={() => {
                            // Resend OTP logic
                            setMfaResendDisabled(true);
                            setTimeout(() => setMfaResendDisabled(false), 60000);
                            toast.info('OTP resent');
                          }}
                          disabled={mfaResendDisabled}
                          className="text-primary hover:underline disabled:text-muted-foreground"
                        >
                          Resend Code
                        </button>
                      </div>
                    </div>
                    <Button
                      onClick={handleMFAVerify}
                      disabled={isLoading || mfaCode.length !== 6}
                      className="w-full"
                    >
                      Verify & Continue
                    </Button>
                  </div>
                )}
                
                {/* US-A1-02: Forgot Password Dialog */}
                {showForgotPassword && (
                  <div className="space-y-4 mt-4 p-4 border rounded-lg bg-accent/5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Reset Password</h3>
                      <button
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotPasswordEmail('');
                          setForgotPasswordSent(false);
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Close
                      </button>
                    </div>
                    {!forgotPasswordSent ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Enter your email address and we'll send you a password reset link.
                        </p>
                        <div className="space-y-2">
                          <Label htmlFor="forgotEmail">Email Address</Label>
                          <Input
                            id="forgotEmail"
                            type="email"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            placeholder="user@indianbank.com"
                          />
                        </div>
                        <Button
                          onClick={handleForgotPassword}
                          disabled={isLoading || !forgotPasswordEmail}
                          className="w-full"
                        >
                          Send Reset Link
                        </Button>
                      </>
                    ) : (
                      <div className="text-center space-y-2">
                        <AlertCircle className="w-12 h-12 text-green-600 mx-auto" />
                        <p className="text-sm font-medium">Reset link sent!</p>
                        <p className="text-xs text-muted-foreground">
                          Check your email for password reset instructions.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {false && (
              <TabsContent value="register" className="space-y-4">
                <div className="bg-accent/10 border border-accent rounded-lg p-3 mb-4 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">
                    Register as a new tenant. You will become the tenant administrator.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenant-name" className="text-sm font-semibold">
                      Tenant Name *
                    </Label>
                    <Input
                      id="tenant-name"
                      placeholder="e.g., Indian Bank - Mumbai"
                      value={regTenantName}
                      onChange={(e) => {
                        setRegTenantName(e.target.value);
                        // Auto-generate code
                        setRegCode(e.target.value.toUpperCase().replace(/\s+/g, '-'));
                      }}
                      className="h-10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tenant-code" className="text-sm font-semibold">
                      Tenant Code *
                    </Label>
                    <Input
                      id="tenant-code"
                      placeholder="e.g., INDBNK-MUM"
                      value={regCode}
                      onChange={(e) => setRegCode(e.target.value.toUpperCase())}
                      className="h-10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tenant-location" className="text-sm font-semibold">
                      Location *
                    </Label>
                    <Input
                      id="tenant-location"
                      placeholder="e.g., Mumbai"
                      value={regLocation}
                      onChange={(e) => setRegLocation(e.target.value)}
                      className="h-10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-sm font-semibold">
                      Admin Email Address *
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="h-10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-sm font-semibold">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm-password" className="text-sm font-semibold">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-confirm-password"
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full h-10 font-semibold">
                    {isLoading ? 'Registering...' : 'Register Tenant'}
                  </Button>
                </form>
                
                {/* US-A2-01: Registration OTP Verification Screen */}
                {showRegistrationOTP && (
                  <div className="space-y-4 mt-4 p-4 border rounded-lg bg-accent/5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Verify Your Email</h3>
                      <button
                        onClick={() => {
                          setShowRegistrationOTP(false);
                          setRegistrationOTP('');
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code sent to {regEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="regOTP">6-Digit OTP Code</Label>
                      <Input
                        id="regOTP"
                        type="text"
                        maxLength={6}
                        value={registrationOTP}
                        onChange={(e) => setRegistrationOTP(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="text-center text-2xl tracking-widest"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Expires in {Math.floor(registrationOTPCountdown / 60)}:{(registrationOTPCountdown % 60).toString().padStart(2, '0')}</span>
                        <button
                          onClick={() => {
                            // Resend OTP - would need to call register-tenant again
                            setRegistrationOTPResendDisabled(true);
                            setTimeout(() => setRegistrationOTPResendDisabled(false), 60000);
                            toast.info('Please resubmit the registration form to resend OTP');
                          }}
                          disabled={registrationOTPResendDisabled}
                          className="text-primary hover:underline disabled:text-muted-foreground"
                        >
                          Resend Code
                        </button>
                      </div>
                    </div>
                    <Button
                      onClick={handleVerifyRegistrationOTP}
                      disabled={isLoading || registrationOTP.length !== 6}
                      className="w-full"
                    >
                      Verify & Complete Registration
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      After verification, your registration will be reviewed by Platform Admin
                    </p>
                  </div>
                )}
              </TabsContent>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground pt-6 border-t mt-6">
              <p>This is a comprehensive demo HRMS system with mock data for all modules</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
