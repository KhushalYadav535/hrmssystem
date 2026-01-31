'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  Plane,
  TrendingUp,
  Clock,
  Award,
  FileText,
  Briefcase,
  Settings,
  Building2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const features = [
    {
      title: 'Personnel Information System (PIS)',
      description: 'Comprehensive employee database with profiles, designations, and department management',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Payroll Management',
      description: 'Automated monthly salary processing with statutory compliance and bank file generation',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Leave Management',
      description: 'Leave request approval workflow with balance tracking and compliance',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Travel & Expenses',
      description: 'Travel request and expense claim management with quick reimbursement',
      icon: Plane,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Performance Appraisal',
      description: 'Rating-based appraisal system with detailed feedback and analytics',
      icon: TrendingUp,
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'Attendance Tracking',
      description: 'Daily check-in/check-out with working hours calculation and reports',
      icon: Clock,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'Tax Management',
      description: 'Income tax calculation and ITR filing with compliance tracking',
      icon: FileText,
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      title: 'Recruitment',
      description: 'Job posting and application pipeline management',
      icon: Briefcase,
      color: 'from-pink-500 to-pink-600',
    },
  ];

  const capabilities = [
    { icon: CheckCircle2, text: '40,000+ employees support' },
    { icon: CheckCircle2, text: 'Multi-tenant architecture' },
    { icon: CheckCircle2, text: 'Role-based access control' },
    { icon: CheckCircle2, text: 'Real-time dashboards & analytics' },
    { icon: CheckCircle2, text: 'Statutory compliance automation' },
    { icon: CheckCircle2, text: 'Self-service employee portal' },
    { icon: CheckCircle2, text: 'Manager approval workflows' },
    { icon: CheckCircle2, text: 'Comprehensive reporting' },
  ];

  const userRoles = [
    {
      role: 'Employee',
      email: 'rajesh.kumar@indianbank.com',
      password: 'password123',
      description: 'View payslips, apply leaves, submit expenses',
    },
    {
      role: 'Manager',
      email: 'priya.sharma@indianbank.com',
      password: 'password123',
      description: 'Approve leaves, review team performance',
    },
    {
      role: 'HR Administrator',
      email: 'admin.hr@indianbank.com',
      password: 'password123',
      description: 'Manage employees, configure system',
    },
    {
      role: 'Payroll Administrator',
      email: 'payroll@indianbank.com',
      password: 'password123',
      description: 'Process payroll, manage compliance',
    },
    {
      role: 'Super Admin',
      email: 'superadmin@indianbank.com',
      password: 'admin123',
      description: 'Development team access',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Indian Bank HRMS</h1>
              <p className="text-xs text-muted-foreground">Enterprise HR Management Platform</p>
            </div>
          </div>
          <Link href="/login">
            <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-secondary/40 to-transparent">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-tight">
              Transform Your HR <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Management</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Complete HRMS platform with 8 integrated modules, multi-tenant support, and enterprise-grade RBAC. Manage 40,000+ employees with real-time analytics and full compliance automation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto px-8 h-12 shadow-lg hover:shadow-xl transition-all">
                Login to System
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 hover:bg-secondary transition-colors bg-transparent">
                Register Tenant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h3 className="text-4xl font-bold text-foreground">8 Powerful Modules</h3>
            <p className="text-muted-foreground text-lg">Everything you need for complete HR management</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="border-border/60 bg-card hover:border-accent/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-muted-foreground">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 px-6 bg-gradient-to-b from-secondary/20 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h3 className="text-4xl font-bold text-foreground">Enterprise-Grade Features</h3>
            <p className="text-muted-foreground text-lg">Built for scale and compliance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/40 hover:border-accent/30 hover:bg-card hover:shadow-md transition-all duration-200">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-foreground font-medium text-sm">{cap.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Credentials */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h3 className="text-4xl font-bold text-foreground">Test All Roles</h3>
            <p className="text-muted-foreground text-lg">Pre-configured demo accounts ready to use</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {userRoles.map((user, idx) => (
              <Card key={idx} className="border-border/60 hover:border-accent/40 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-foreground">{user.role}</CardTitle>
                  <CardDescription className="text-xs">{user.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-secondary/30 font-mono text-xs space-y-2 border border-border/40">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-foreground text-right font-medium break-all">{user.email}</span>
                    </div>
                    <div className="h-px bg-border/30" />
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-muted-foreground">Password:</span>
                      <span className="text-foreground font-medium">{user.password}</span>
                    </div>
                  </div>
                  <Link href="/login" className="block">
                    <Button className="w-full h-9 text-sm bg-transparent" variant="outline">
                      Login Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-secondary/30 to-transparent">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary via-primary/90 to-accent rounded-2xl p-12 md:p-16 text-center text-primary-foreground shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 opacity-5" />
          <div className="relative space-y-6">
            <h3 className="text-4xl md:text-5xl font-bold">Ready to Transform?</h3>
            <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
              Start exploring with pre-configured demo accounts or register your organization as a super administrator.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href="/login">
                <Button size="lg" variant="secondary" className="gap-2 font-semibold">
                  Start Login <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="gap-2 font-semibold">
                  Create Tenant <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-foreground">Indian Bank HRMS</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enterprise HR management with 8 modules, multi-tenant architecture, and complete RBAC.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Core Modules</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="hover:text-foreground transition-colors">Personnel Information</li>
                <li className="hover:text-foreground transition-colors">Payroll Management</li>
                <li className="hover:text-foreground transition-colors">Leave Management</li>
                <li className="hover:text-foreground transition-colors">Travel & Expenses</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Additional Modules</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="hover:text-foreground transition-colors">Performance Appraisal</li>
                <li className="hover:text-foreground transition-colors">Attendance Tracking</li>
                <li className="hover:text-foreground transition-colors">Tax Management</li>
                <li className="hover:text-foreground transition-colors">Recruitment</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Key Features</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="hover:text-foreground transition-colors">Multi-tenant RBAC</li>
                <li className="hover:text-foreground transition-colors">40,000+ employees</li>
                <li className="hover:text-foreground transition-colors">Real-time Analytics</li>
                <li className="hover:text-foreground transition-colors">Compliance Automation</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 Indian Bank HRMS. All rights reserved. | Enterprise Demo Version</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
