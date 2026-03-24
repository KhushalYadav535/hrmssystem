'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Users, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [onboardingCandidates, setOnboardingCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOnboardings();
  }, []);

  const loadOnboardings = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getOnboardings();
      if (response.success && response.data) {
        setOnboardingCandidates(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load onboarding data', error);
      toast.error('Failed to load onboarding records');
    } finally {
      setIsLoading(false);
    }
  };

  // Only HR Administrators and Tenant Admin can access onboarding management
  if (!isAuthenticated || !hasPermission('manage_onboarding')) {
    redirect('/dashboard');
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-700 border-green-500">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Onboarding Management</h1>
            <p className="text-muted-foreground mt-2">Manage new employee onboarding process</p>
          </div>
          <Button onClick={() => {
            // Navigate to create onboarding page or open dialog
            window.location.href = '/onboarding/create';
          }}>
            + Create Onboarding
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{isLoading ? '...' : onboardingCandidates.length}</div>
              <p className="text-xs text-muted-foreground mt-2">Active candidates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {onboardingCandidates.filter(c => c.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Onboarding complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {onboardingCandidates.filter(c => c.status === 'in-progress').length}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Currently onboarding</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {onboardingCandidates.filter(c => c.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Awaiting documents</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Onboarding Status</CardTitle>
            <CardDescription>Track onboarding progress for all candidates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading onboarding records...</div>
            ) : onboardingCandidates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No onboarding records found</div>
            ) : (
              onboardingCandidates.map((candidate) => {
                const candidateId = candidate._id || candidate.id;
                const candidateName = candidate.candidateName || candidate.name || 'Unknown';
                const position = candidate.position || 'N/A';
                const department = candidate.department || 'N/A';
                const joiningDate = candidate.joiningDate ? formatDateDDMMYYYY(candidate.joiningDate) : 'N/A';
                const status = candidate.status || 'pending';
                const completionRate = candidate.completionRate || 0;
                const tasks = candidate.tasks || [];
                
                return (
                  <div key={candidateId} className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{candidateName}</h3>
                        <p className="text-sm text-muted-foreground">{position} • {department}</p>
                        <p className="text-xs text-muted-foreground mt-1">Joining: {joiningDate}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(status)}
                        <p className="text-2xl font-bold text-foreground mt-2">{completionRate}%</p>
                      </div>
                    </div>

                    <div className="w-full bg-secondary/50 rounded-full h-2 mb-4">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>

                    {tasks.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {tasks.map((task: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className={`text-xs ${task.completed ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
