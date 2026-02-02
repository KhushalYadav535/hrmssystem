'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertCircle, FileText, RefreshCw, User, GraduationCap, Briefcase, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationCheck {
  id: string;
  type: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  initiatedDate: string;
  completedDate?: string;
  agency: string;
  report?: string;
}

export default function BackgroundVerificationPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [selectedCandidate, setSelectedCandidate] = useState('candidate-1');

  if (!isAuthenticated) {
    redirect('/login');
  }

  // Mock BGV data
  const bgvData = {
    'candidate-1': {
      name: 'Rajesh Kumar',
      position: 'Senior Analyst',
      checks: [
        {
          id: '1',
          type: 'Identity Verification',
          status: 'completed',
          initiatedDate: '2026-01-15',
          completedDate: '2026-01-18',
          agency: 'First Advantage',
          report: 'BGV-Report-001.pdf',
        },
        {
          id: '2',
          type: 'Address Verification',
          status: 'completed',
          initiatedDate: '2026-01-15',
          completedDate: '2026-01-20',
          agency: 'First Advantage',
          report: 'BGV-Report-002.pdf',
        },
        {
          id: '3',
          type: 'Education Verification',
          status: 'in-progress',
          initiatedDate: '2026-01-16',
          agency: 'First Advantage',
        },
        {
          id: '4',
          type: 'Employment Verification',
          status: 'in-progress',
          initiatedDate: '2026-01-16',
          agency: 'First Advantage',
        },
        {
          id: '5',
          type: 'Criminal Record Check',
          status: 'pending',
          initiatedDate: '',
          agency: 'First Advantage',
        },
      ],
    },
  };

  const currentCandidate = bgvData[selectedCandidate as keyof typeof bgvData];
  const completedChecks = currentCandidate.checks.filter(c => c.status === 'completed').length;
  const totalChecks = currentCandidate.checks.length;
  const completionPercentage = (completedChecks / totalChecks) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'in-progress':
        return 'bg-blue-600';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-yellow-600';
    }
  };

  const handleInitiateCheck = (checkId: string) => {
    toast.success('Background verification check initiated');
  };

  const handleDownloadReport = (report: string) => {
    toast.success(`Downloading ${report}...`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Background Verification</h1>
            <p className="text-muted-foreground mt-2">Track background verification status for candidates</p>
          </div>
          {hasPermission('manage_onboarding') && (
            <Button className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </Button>
          )}
        </div>

        {/* Candidate Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Candidate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(bgvData).map(([id, candidate]) => (
                <div
                  key={id}
                  onClick={() => setSelectedCandidate(id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedCandidate === id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-accent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">{candidate.position}</p>
                    </div>
                    <Badge className={completionPercentage === 100 ? 'bg-green-600' : 'bg-yellow-600'}>
                      {Math.round(completionPercentage)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {currentCandidate && (
          <>
            {/* Progress Overview */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Progress</p>
                      <p className="text-2xl font-bold mt-1">
                        {completedChecks} / {totalChecks} Checks
                      </p>
                    </div>
                    <Badge className={completionPercentage === 100 ? 'bg-green-600' : 'bg-yellow-600'}>
                      {Math.round(completionPercentage)}% Complete
                    </Badge>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Verification Checks */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Checks</CardTitle>
                <CardDescription>Status of all background verification checks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentCandidate.checks.map((check) => (
                    <Card key={check.id} className={check.status === 'completed' ? 'border-green-500' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            {getStatusIcon(check.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-semibold">{check.type}</p>
                                <Badge className={getStatusColor(check.status)}>
                                  {check.status === 'completed' ? 'Completed' :
                                   check.status === 'in-progress' ? 'In Progress' :
                                   check.status === 'failed' ? 'Failed' : 'Pending'}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p>Agency: {check.agency}</p>
                                {check.initiatedDate && (
                                  <p>Initiated: {new Date(check.initiatedDate).toLocaleDateString('en-IN')}</p>
                                )}
                                {check.completedDate && (
                                  <p>Completed: {new Date(check.completedDate).toLocaleDateString('en-IN')}</p>
                                )}
                                {check.report && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <FileText className="w-4 h-4" />
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() => handleDownloadReport(check.report!)}
                                      className="h-auto p-0"
                                    >
                                      Download Report
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {check.status === 'pending' && hasPermission('manage_onboarding') && (
                            <Button
                              size="sm"
                              onClick={() => handleInitiateCheck(check.id)}
                              className="gap-2"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Initiate
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Check Types Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { icon: User, label: 'Identity', count: 1 },
                { icon: Shield, label: 'Address', count: 1 },
                { icon: GraduationCap, label: 'Education', count: 1 },
                { icon: Briefcase, label: 'Employment', count: 1 },
                { icon: AlertCircle, label: 'Criminal', count: 1 },
              ].map((item, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4 text-center">
                    <item.icon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.count} check</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            {completionPercentage === 100 && (
              <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="font-semibold text-lg">Background Verification Complete</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    All verification checks have been completed successfully. Candidate is ready for onboarding.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
