'use client';

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
import { CheckCircle2, AlertCircle, Download, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function PayrollProcessingPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  if (!isAuthenticated || !hasPermission('process_payroll')) {
    redirect('/dashboard');
  }

  const steps = [
    { step: 1, title: 'Select Period', icon: '📅' },
    { step: 2, title: 'Review Employees', icon: '👥' },
    { step: 3, title: 'Verify Calculations', icon: '📊' },
    { step: 4, title: 'Approve Deductions', icon: '✓' },
    { step: 5, title: 'Generate Payslips', icon: '📄' },
    { step: 6, title: 'Bank File', icon: '🏦' },
    { step: 7, title: 'Confirm', icon: '✅' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll Processing</h1>
          <p className="text-muted-foreground mt-2">Step-by-step payroll processing wizard</p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <div key={s.step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                  currentStep >= s.step ? 'bg-primary text-white' : 'bg-secondary text-foreground'
                }`}>
                  {s.step}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-1 mx-2 transition-all ${currentStep > s.step ? 'bg-primary' : 'bg-secondary'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}</p>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Payroll Period</CardTitle>
              <CardDescription>Choose the month and year for payroll processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select defaultValue="02">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">January</SelectItem>
                      <SelectItem value="02">February</SelectItem>
                      <SelectItem value="03">March</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select defaultValue="2026">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Period: <strong>February 1-29, 2026</strong></p>
                <p className="text-sm text-muted-foreground mt-2">Working Days: <strong>20</strong></p>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Employees</CardTitle>
              <CardDescription>Employees included in this payroll</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Rajesh Kumar', 'Priya Sharma', 'Amit Verma', 'Suresh Patel'].map((emp) => (
                  <div key={emp} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-secondary/30 transition">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-medium">{emp}</span>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">Total Employees: <strong>4</strong></p>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Verify Calculations</CardTitle>
              <CardDescription>Review payroll calculations before approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Gross</p>
                  <p className="text-2xl font-bold">₹28,00,000</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Deductions</p>
                  <p className="text-2xl font-bold text-red-600">₹5,20,000</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Net Pay</p>
                  <p className="text-2xl font-bold text-green-600">₹22,80,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep >= 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deduction Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between p-2 text-sm">
                  <span>PF</span>
                  <span className="font-semibold">₹1,50,000</span>
                </div>
                <div className="flex justify-between p-2 text-sm bg-secondary/50">
                  <span>Income Tax</span>
                  <span className="font-semibold">₹2,00,000</span>
                </div>
                <div className="flex justify-between p-2 text-sm">
                  <span>Professional Tax</span>
                  <span className="font-semibold">₹70,000</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statutory Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 p-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>PF Deposit</span>
                </div>
                <div className="flex items-center gap-2 p-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>ESI Contribution</span>
                </div>
                <div className="flex items-center gap-2 p-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>TDS Filing</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <Button 
            variant="outline" 
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          >
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">Save as Draft</Button>
            {currentStep < 7 && (
              <Button 
                className="gap-2"
                onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {currentStep === 7 && (
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-4 h-4" />
                Finalize & Process
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
