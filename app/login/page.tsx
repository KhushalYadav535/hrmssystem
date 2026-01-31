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
import { mockTenants, mockUsers } from '@/lib/mock-data';
import { Building2, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, registerTenant } = useAuth();
  const [activeTab, setActiveTab] = useState('email-login');
  const [isLoading, setIsLoading] = useState(false);
  
  // Email Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string>(mockTenants[0]?.id || '');
  const [selectedUser, setSelectedUser] = useState<string>('');
  
  // Registration State
  const [regTenantName, setRegTenantName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const usersInTenant = mockUsers.filter((user) => user.tenantId === selectedTenant);

  // Email/Password Login Handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = login(email, password);
    
    if (result.success) {
      toast.success('Login successful');
      // Wait for localStorage to be written before redirecting
      await new Promise((resolve) => setTimeout(resolve, 200));
      router.push('/dashboard');
    } else {
      toast.error(result.message);
      setIsLoading(false);
    }
  };

  // User Select Login Handler
  const handleUserSelectLogin = async () => {
    if (!selectedUser || !selectedTenant) {
      toast.error('Please select tenant and user');
      return;
    }

    const user = mockUsers.find((u) => u.id === selectedUser);
    if (user) {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      const result = login(user.email, user.password, selectedTenant);
      if (result.success) {
        toast.success('Login successful');
        // Wait for localStorage to be written before redirecting
        await new Promise((resolve) => setTimeout(resolve, 200));
        router.push('/dashboard');
      } else {
        toast.error(result.message);
        setIsLoading(false);
      }
    }
  };

  // Registration Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regTenantName || !regEmail || !regPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = registerTenant(regTenantName, regEmail, regPassword);
    if (result.success) {
      toast.success('Tenant registered successfully! Please login.');
      setRegTenantName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setActiveTab('email-login');
      setEmail(regEmail);
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-secondary/50 p-1 h-auto">
                <TabsTrigger value="email-login" className="py-2.5 font-medium text-sm rounded-lg">📧 Email</TabsTrigger>
                <TabsTrigger value="user-login" className="py-2.5 font-medium text-sm rounded-lg">⚡ Quick</TabsTrigger>
                <TabsTrigger value="register" className="py-2.5 font-medium text-sm rounded-lg">✨ Register</TabsTrigger>
              </TabsList>

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
                </form>

                {/* Demo Credentials */}
                <div className="bg-gradient-to-br from-secondary/40 to-secondary/20 border border-secondary/50 rounded-xl p-4 mt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <p className="font-semibold text-sm text-foreground">Demo Credentials</p>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p className="font-medium">👤 Employee: <span className="text-foreground">rajesh.kumar@indianbank.com / password123</span></p>
                    <p className="font-medium">👔 Manager: <span className="text-foreground">priya.sharma@indianbank.com / password123</span></p>
                    <p className="font-medium">👨‍💼 HR Admin: <span className="text-foreground">admin.hr@indianbank.com / password123</span></p>
                    <p className="font-medium">🔐 Super Admin: <span className="text-foreground">superadmin@indianbank.com / admin123</span></p>
                  </div>
                </div>
              </TabsContent>

              {/* User Select Login */}
              <TabsContent value="user-login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant" className="text-sm font-semibold">
                    Select Tenant
                  </Label>
                  <select
                    id="tenant"
                    value={selectedTenant}
                    onChange={(e) => {
                      setSelectedTenant(e.target.value);
                      setSelectedUser('');
                    }}
                    className="w-full h-10 px-3 border border-border rounded-md bg-card text-foreground"
                  >
                    {mockTenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTenant && (
                  <div className="space-y-2">
                    <Label htmlFor="user" className="text-sm font-semibold">
                      Select User Account
                    </Label>
                    <select
                      id="user"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full h-10 px-3 border border-border rounded-md bg-card text-foreground"
                    >
                      <option value="">Choose your account...</option>
                      {usersInTenant.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Button
                  onClick={handleUserSelectLogin}
                  disabled={!selectedUser || !selectedTenant || isLoading}
                  className="w-full h-10 font-semibold"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </TabsContent>

              {/* Register */}
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
                      Tenant Name
                    </Label>
                    <Input
                      id="tenant-name"
                      placeholder="e.g., Indian Bank - Mumbai"
                      value={regTenantName}
                      onChange={(e) => setRegTenantName(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-sm font-semibold">
                      Email Address
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="h-10"
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
              </TabsContent>
            </Tabs>

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
