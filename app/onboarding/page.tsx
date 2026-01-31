'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Users, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const onboardingCandidates = [
    {
      id: 'OB-001',
      name: 'Raj Kumar Singh',
      position: 'Senior Analyst',
      joiningDate: '2026-02-15',
      department: 'Finance',
      status: 'in-progress',
      completionRate: 65,
      tasks: [
        { title: 'Document Collection', completed: true },
        { title: 'Background Verification', completed: true },
        { title: 'System Access Setup', completed: false },
        { title: 'Induction Training', completed: false },
      ],
    },
    {
      id: 'OB-002',
      name: 'Priya Desai',
      position: 'Software Engineer',
      joiningDate: '2026-02-10',
      department: 'IT',
      status: 'completed',
      completionRate: 100,
      tasks: [
        { title: 'Document Collection', completed: true },
        { title: 'Background Verification', completed: true },
        { title: 'System Access Setup', completed: true },
        { title: 'Induction Training', completed: true },
      ],
    },
    {
      id: 'OB-003',
      name: 'Suresh Patel',
      position: 'HR Manager',
      joiningDate: '2026-02-20',
      department: 'HR',
      status: 'pending',
      completionRate: 20,
      tasks: [
        { title: 'Document Collection', completed: true },
        { title: 'Background Verification', completed: false },
        { title: 'System Access Setup', completed: false },
        { title: 'Induction Training', completed: false },
      ],
    },
  ];

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
          <Link href="/onboarding/create">
            <Button>+ New Onboarding</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{onboardingCandidates.length}</div>
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
            {onboardingCandidates.map((candidate) => (
              <div key={candidate.id} className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.position} • {candidate.department}</p>
                    <p className="text-xs text-muted-foreground mt-1">Joining: {candidate.joiningDate}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(candidate.status)}
                    <p className="text-2xl font-bold text-foreground mt-2">{candidate.completionRate}%</p>
                  </div>
                </div>

                <div className="w-full bg-secondary/50 rounded-full h-2 mb-4">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${candidate.completionRate}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {candidate.tasks.map((task, idx) => (
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

                <Button variant="outline" size="sm">View Details</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
