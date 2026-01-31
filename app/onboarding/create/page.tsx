'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OnboardingCreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    joiningDate: '',
    reportingManager: '',
    documentCollection: false,
    backgroundVerification: false,
    systemAccess: false,
    inductionTraining: false,
  });

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const steps = [
    { number: 1, title: 'Personal Info' },
    { number: 2, title: 'Job Details' },
    { number: 3, title: 'Onboarding Tasks' },
    { number: 4, title: 'Review' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Start New Onboarding</h1>
          <p className="text-muted-foreground mt-2">Create onboarding checklist for new employee</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {steps.map((step) => (
            <div
              key={step.number}
              onClick={() => setCurrentStep(step.number)}
              className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                currentStep === step.number
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : currentStep > step.number
                  ? 'bg-green-500/20 text-green-700 border border-green-500'
                  : 'bg-card border border-border hover:border-accent'
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-current opacity-30">
                {currentStep > step.number ? <CheckCircle2 className="w-5 h-5" /> : step.number}
              </div>
              <span className="font-medium whitespace-nowrap">{step.title}</span>
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@company.com"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="e.g., Senior Analyst"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="joiningDate">Joining Date</Label>
                    <Input
                      id="joiningDate"
                      name="joiningDate"
                      type="date"
                      value={formData.joiningDate}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reportingManager">Reporting Manager</Label>
                    <Input
                      id="reportingManager"
                      name="reportingManager"
                      value={formData.reportingManager}
                      onChange={handleInputChange}
                      placeholder="Manager name"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-foreground">Onboarding Checklist</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-secondary/30 cursor-pointer">
                    <Checkbox
                      id="documentCollection"
                      name="documentCollection"
                      checked={formData.documentCollection}
                      onChange={handleInputChange}
                    />
                    <div>
                      <Label htmlFor="documentCollection" className="font-medium cursor-pointer">Document Collection</Label>
                      <p className="text-sm text-muted-foreground">Collect all required documents from employee</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-secondary/30 cursor-pointer">
                    <Checkbox
                      id="backgroundVerification"
                      name="backgroundVerification"
                      checked={formData.backgroundVerification}
                      onChange={handleInputChange}
                    />
                    <div>
                      <Label htmlFor="backgroundVerification" className="font-medium cursor-pointer">Background Verification</Label>
                      <p className="text-sm text-muted-foreground">Conduct background verification check</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-secondary/30 cursor-pointer">
                    <Checkbox
                      id="systemAccess"
                      name="systemAccess"
                      checked={formData.systemAccess}
                      onChange={handleInputChange}
                    />
                    <div>
                      <Label htmlFor="systemAccess" className="font-medium cursor-pointer">System Access Setup</Label>
                      <p className="text-sm text-muted-foreground">Set up system logins and access credentials</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-secondary/30 cursor-pointer">
                    <Checkbox
                      id="inductionTraining"
                      name="inductionTraining"
                      checked={formData.inductionTraining}
                      onChange={handleInputChange}
                    />
                    <div>
                      <Label htmlFor="inductionTraining" className="font-medium cursor-pointer">Induction Training</Label>
                      <p className="text-sm text-muted-foreground">Complete company induction training</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-secondary/50 p-6 rounded-lg space-y-4">
                  <h3 className="font-semibold text-foreground">Review Onboarding Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Position</p>
                      <p className="font-medium">{formData.position}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-medium">{formData.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Joining Date</p>
                      <p className="font-medium">{formData.joiningDate}</p>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium mb-3">Onboarding Tasks:</p>
                    <div className="space-y-2">
                      <p className="text-sm">{formData.documentCollection ? '✓' : '○'} Document Collection</p>
                      <p className="text-sm">{formData.backgroundVerification ? '✓' : '○'} Background Verification</p>
                      <p className="text-sm">{formData.systemAccess ? '✓' : '○'} System Access Setup</p>
                      <p className="text-sm">{formData.inductionTraining ? '✓' : '○'} Induction Training</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <div className="flex-1" />
              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep(Math.min(4, currentStep + 1))} className="gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button className="bg-green-600 hover:bg-green-700">Create Onboarding</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
