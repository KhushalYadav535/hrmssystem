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

  // Preload reCAPTCHA script on mount so it's ready after failed attempts
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey && typeof window !== 'undefined' && !document.querySelector('script[src*="recaptcha/api.js"]')) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);
  
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
    <div className="min-h-screen flex bg-background">
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 text-white flex-col justify-between overflow-hidden p-12 lg:p-16">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-zinc-900/80 to-zinc-950 z-10" />
          <div 
            className="absolute inset-0 mix-blend-overlay opacity-50 bg-cover bg-center transition-transform duration-[20s] ease-out hover:scale-110"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=2574&auto=format&fit=crop')" }} 
          />
          {/* Subtle glow effects */}
          <div className="absolute top-1/4 -left-1/4 w-[50%] h-[50%] bg-primary/30 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-1/4 right-0 w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen" />
        </div>

        {/* Top Logo */}
        <div className="relative z-20 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Indian Bank</h1>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="relative z-20 max-w-lg">
          <blockquote className="space-y-6">
            <p className="text-3xl sm:text-4xl font-semibold leading-tight text-white/95 drop-shadow-sm">
              Empowering our workforce through seamless management and intelligent enterprise solutions.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="h-[2px] w-12 bg-primary" />
              <footer className="text-sm font-semibold tracking-widest text-white/50 uppercase">Enterprise HRMS &copy; {new Date().getFullYear()}</footer>
            </div>
          </blockquote>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-28 relative">
        {/* Mobile abstract background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl lg:hidden pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl lg:hidden pointer-events-none" />

        <div className="mx-auto w-full max-w-[420px] space-y-8 relative z-10">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Indian Bank</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Enterprise HRMS</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border shadow-sm rounded-2xl p-6 sm:p-8">
            <Tabs value="email-login" className="w-full">
              <TabsContent value="email-login" className="space-y-4 m-0">
                <form onSubmit={handleEmailLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@indianbank.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 pl-10 bg-background/50 hover:bg-background transition-colors focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      {/* US-A1-02: Forgot Password Link */}
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pl-10 pr-10 bg-background/50 hover:bg-background transition-colors focus-visible:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* US-A1-03: CAPTCHA (shown after 3 failed attempts) */}
                  {showCaptcha && (
                    <div className="bg-amber-50/50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3 flex gap-3 text-amber-800 dark:text-amber-300">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium mb-0.5">Security verification required</p>
                        <p className="text-amber-700/80 dark:text-amber-300/80 text-xs">
                          reCAPTCHA v3 will verify automatically when you sign in. No extra steps needed.
                        </p>
                      </div>
                    </div>
                  )}

                  <Button type="submit" disabled={isLoading} className="w-full h-11 text-base font-medium shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]">
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
                
                {/* US-A1-01: MFA Screen */}
                {showMFA && (
                  <div className="mt-6 pt-6 border-t space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Two-Step Verification</h3>
                      <button
                        onClick={() => {
                          setShowMFA(false);
                          setMfaCode('');
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 my-2">
                       <p className="text-sm text-muted-foreground leading-relaxed">
                         Enter the verification code sent to <br/>
                         <span className="font-semibold text-foreground">{email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}</span>
                       </p>
                    </div>
                    <div className="space-y-3">
                      <Input
                        id="mfaCode"
                        type="text"
                        maxLength={6}
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="h-12 text-center text-2xl tracking-[0.5em] font-mono bg-background/50 focus-visible:ring-primary/20"
                      />
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-muted-foreground">Expires in <span className="font-medium">{Math.floor(mfaCountdown / 60)}:{(mfaCountdown % 60).toString().padStart(2, '0')}</span></span>
                        <button
                          onClick={() => {
                            setMfaResendDisabled(true);
                            setTimeout(() => setMfaResendDisabled(false), 60000);
                            toast.info('OTP resent');
                          }}
                          disabled={mfaResendDisabled}
                          className="font-medium text-primary hover:text-primary/80 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                        >
                          Resend Code
                        </button>
                      </div>
                    </div>
                    <Button
                      onClick={handleMFAVerify}
                      disabled={isLoading || mfaCode.length !== 6}
                      className="w-full h-11 shadow-md shadow-primary/20"
                    >
                      Verify & Continue
                    </Button>
                  </div>
                )}
                
                {/* US-A1-02: Forgot Password Dialog */}
                {showForgotPassword && (
                  <div className="mt-6 pt-6 border-t space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Reset Password</h3>
                      <button
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotPasswordEmail('');
                          setForgotPasswordSent(false);
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Close
                      </button>
                    </div>
                    {!forgotPasswordSent ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Enter your email address and we'll send you a link to reset your password.
                        </p>
                        <div className="space-y-3">
                          <Input
                            id="forgotEmail"
                            type="email"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            placeholder="user@indianbank.com"
                            className="h-11 bg-background/50 focus-visible:ring-primary/20"
                          />
                          <Button
                            onClick={handleForgotPassword}
                            disabled={isLoading || !forgotPasswordEmail}
                            className="w-full h-11 shadow-md shadow-primary/20"
                          >
                            Send Reset Link
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-3 py-6 animate-in zoom-in-95 duration-300">
                        <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                          <svg className="w-7 h-7 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-lg font-semibold text-foreground">Next steps sent</p>
                        <p className="text-sm text-muted-foreground px-2">
                          Please check your email for password reset instructions.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {false && (
                <TabsContent value="register" className="space-y-4 m-0">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 flex gap-3 text-primary">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">
                      Register as a new tenant. You will become the tenant administrator.
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tenant-name" className="text-sm font-medium">Tenant Name *</Label>
                      <Input id="tenant-name" placeholder="e.g., Indian Bank - Mumbai" value={regTenantName} onChange={(e) => { setRegTenantName(e.target.value); setRegCode(e.target.value.toUpperCase().replace(/\s+/g, '-')); }} className="h-11 bg-background/50" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenant-code" className="text-sm font-medium">Tenant Code *</Label>
                      <Input id="tenant-code" placeholder="e.g., INDBNK-MUM" value={regCode} onChange={(e) => setRegCode(e.target.value.toUpperCase())} className="h-11 bg-background/50" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenant-location" className="text-sm font-medium">Location *</Label>
                      <Input id="tenant-location" placeholder="e.g., Mumbai" value={regLocation} onChange={(e) => setRegLocation(e.target.value)} className="h-11 bg-background/50" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-sm font-medium">Admin Email Address *</Label>
                      <Input id="reg-email" type="email" placeholder="admin@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="h-11 bg-background/50" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-sm font-medium">Password</Label>
                      <div className="relative group">
                        <Input id="reg-password" type={showRegPassword ? 'text' : 'password'} placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="h-11 pr-10 bg-background/50" />
                        <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm-password" className="text-sm font-medium">Confirm Password</Label>
                      <div className="relative group">
                        <Input id="reg-confirm-password" type={showRegConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} className="h-11 pr-10 bg-background/50" />
                        <button type="button" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full h-11 text-base font-medium shadow-md">
                      {isLoading ? 'Registering...' : 'Register Tenant'}
                    </Button>
                  </form>
                  
                  {/* US-A2-01: Registration OTP Verification Screen */}
                  {showRegistrationOTP && (
                    <div className="mt-6 pt-6 border-t space-y-4 animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex items-center justify-between"><h3 className="font-semibold text-foreground">Verify Your Email</h3> <button onClick={() => { setShowRegistrationOTP(false); setRegistrationOTP(''); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button></div>
                      <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to <span className="font-medium text-foreground">{regEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}</span></p>
                      <div className="space-y-3"><Input id="regOTP" type="text" maxLength={6} value={registrationOTP} onChange={(e) => setRegistrationOTP(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="h-12 text-center text-2xl tracking-[0.5em] font-mono bg-background/50" />
                        <div className="flex items-center justify-between text-xs pt-1"><span className="text-muted-foreground">Expires in <span className="font-medium">{Math.floor(registrationOTPCountdown / 60)}:{(registrationOTPCountdown % 60).toString().padStart(2, '0')}</span></span><button onClick={() => { setRegistrationOTPResendDisabled(true); setTimeout(() => setRegistrationOTPResendDisabled(false), 60000); toast.info('Please resubmit the registration form to resend OTP'); }} disabled={registrationOTPResendDisabled} className="font-medium text-primary hover:text-primary/80 disabled:opacity-50 transition-colors">Resend Code</button></div>
                      </div>
                      <Button onClick={handleVerifyRegistrationOTP} disabled={isLoading || registrationOTP.length !== 6} className="w-full h-11 shadow-md shadow-primary/20">Verify & Complete Registration</Button>
                      <p className="text-xs text-center text-muted-foreground/80">After verification, your registration will be reviewed by Platform Admin</p>
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>
          
        </div>
      </div>
    </div>
  );
}