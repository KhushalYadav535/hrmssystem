'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, FileText, Upload, AlertCircle, User, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function PreJoiningPortalPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  
  // Pre-joining portal is accessible to:
  // 1. Candidates (via special token/credentials - no auth required)
  // 2. HR Administrators (for viewing/managing)
  // For now, allow access if authenticated OR if accessed via special token (to be implemented)
  // Note: In production, this would check for candidate token from URL params
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dob: '',
      aadhaar: '',
      pan: '',
    },
    documents: {
      aadhaarUploaded: false,
      panUploaded: false,
      photoUploaded: false,
      educationalUploaded: false,
      addressProofUploaded: false,
    },
    offerAccepted: false,
  });

  const steps = [
    { id: 1, title: 'Offer Acceptance', completed: formData.offerAccepted },
    { id: 2, title: 'Personal Information', completed: Object.values(formData.personalInfo).every(v => v) },
    { id: 3, title: 'Document Upload', completed: Object.values(formData.documents).every(v => v) },
    { id: 4, title: 'Verification', completed: false },
    { id: 5, title: 'Ready to Join', completed: false },
  ];

  const completionPercentage = (steps.filter(s => s.completed).length / steps.length) * 100;

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleFileUpload = (documentType: string) => {
    toast.success(`${documentType} uploaded successfully`);
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: true,
      },
    }));
  };

  const handleOfferAcceptance = () => {
    setFormData(prev => ({ ...prev, offerAccepted: true }));
    setCurrentStep(2);
    toast.success('Offer letter accepted!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pre-Joining Portal</h1>
          <p className="text-muted-foreground mt-2">Complete your onboarding formalities before joining</p>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Onboarding Progress</p>
                  <p className="text-2xl font-bold mt-1">{Math.round(completionPercentage)}%</p>
                </div>
                <Badge className={completionPercentage === 100 ? 'bg-green-600' : 'bg-blue-600'}>
                  {completionPercentage === 100 ? 'Complete' : 'In Progress'}
                </Badge>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Started</span>
                <span>Target: 7 days before joining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {steps.map((step) => (
            <div
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                currentStep === step.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : step.completed
                  ? 'bg-green-500/20 text-green-700 border border-green-500'
                  : 'bg-card border border-border hover:border-accent'
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-current opacity-30">
                {step.completed ? <CheckCircle2 className="w-5 h-5" /> : step.id}
              </div>
              <span className="font-medium whitespace-nowrap">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Offer Letter</h2>
                  <p className="text-muted-foreground">Please review and accept your offer letter</p>
                </div>
                <Card className="bg-muted/50">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Offer Letter - Senior Analyst</p>
                          <p className="text-sm text-muted-foreground">Issued on: January 15, 2026</p>
                        </div>
                        <Button variant="outline" className="gap-2">
                          <FileText className="w-4 h-4" />
                          View Offer Letter
                        </Button>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm font-semibold mb-2">Key Details:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Position: Senior Analyst</li>
                          <li>Department: Finance</li>
                          <li>Joining Date: February 15, 2026</li>
                          <li>CTC: ₹12,00,000 per annum</li>
                          <li>Probation Period: 6 months</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button onClick={handleOfferAcceptance} className="w-full" size="lg">
                  Accept Offer Letter
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
                  <p className="text-muted-foreground">Please provide your personal details</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="firstName"
                      value={formData.personalInfo.firstName}
                      onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="lastName"
                      value={formData.personalInfo.lastName}
                      onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.personalInfo.phone}
                      onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth <span className="text-red-500">*</span></Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.personalInfo.dob}
                      onChange={(e) => handleInputChange('personalInfo', 'dob', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aadhaar">Aadhaar Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="aadhaar"
                      placeholder="XXXX XXXX XXXX"
                      maxLength={14}
                      value={formData.personalInfo.aadhaar}
                      onChange={(e) => handleInputChange('personalInfo', 'aadhaar', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="pan"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      value={formData.personalInfo.pan}
                      onChange={(e) => handleInputChange('personalInfo', 'pan', e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={() => setCurrentStep(3)} className="ml-auto">
                    Next: Document Upload
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Document Upload</h2>
                  <p className="text-muted-foreground">Upload required documents for verification</p>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'aadhaarUploaded', label: 'Aadhaar Card', required: true },
                    { key: 'panUploaded', label: 'PAN Card', required: true },
                    { key: 'photoUploaded', label: 'Passport Size Photo', required: true },
                    { key: 'educationalUploaded', label: 'Educational Certificates', required: true },
                    { key: 'addressProofUploaded', label: 'Address Proof', required: true },
                  ].map((doc) => (
                    <Card key={doc.key} className={formData.documents[doc.key as keyof typeof formData.documents] ? 'border-green-500' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {formData.documents[doc.key as keyof typeof formData.documents] ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-semibold">{doc.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.required && <span className="text-red-500">Required</span>}
                                {formData.documents[doc.key as keyof typeof formData.documents] && ' • Uploaded'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {formData.documents[doc.key as keyof typeof formData.documents] ? (
                              <Badge className="bg-green-600">Uploaded</Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFileUpload(doc.key)}
                                className="gap-2"
                              >
                                <Upload className="w-4 h-4" />
                                Upload
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Previous
                  </Button>
                  <Button onClick={() => setCurrentStep(4)} className="ml-auto">
                    Next: Verification
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Verification Status</h2>
                  <p className="text-muted-foreground">Track verification of your documents</p>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Aadhaar Verification', status: 'Verified', icon: CheckCircle2 },
                    { label: 'PAN Verification', status: 'Verified', icon: CheckCircle2 },
                    { label: 'Background Verification', status: 'In Progress', icon: Clock },
                    { label: 'Document Verification', status: 'Pending', icon: Clock },
                  ].map((item, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <item.icon className={`w-5 h-5 ${
                              item.status === 'Verified' ? 'text-green-600' : 'text-yellow-600'
                            }`} />
                            <div>
                              <p className="font-semibold">{item.label}</p>
                              <p className="text-xs text-muted-foreground">Status: {item.status}</p>
                            </div>
                          </div>
                          <Badge className={
                            item.status === 'Verified' ? 'bg-green-600' : 'bg-yellow-600'
                          }>
                            {item.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Verification in Progress</p>
                      <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                        Your documents are being verified. You will be notified once all verifications are complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Ready to Join!</h2>
                  <p className="text-muted-foreground">All onboarding formalities are complete</p>
                </div>
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="font-semibold">Joining Date: February 15, 2026</p>
                      <p className="text-sm text-muted-foreground">Location: Indian Bank Head Office, Chennai</p>
                      <p className="text-sm text-muted-foreground">Reporting Manager: Mr. Suresh Kumar</p>
                    </div>
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground">
                  You will receive joining instructions via email 3 days before your joining date.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
