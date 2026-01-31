'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockRecruitement } from '@/lib/mock-data';
import { Briefcase, Plus, Users, TrendingUp } from 'lucide-react';

export default function RecruitmentPage() {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated || !hasPermission('manage_employees')) {
    redirect('/dashboard');
  }

  const jobs = mockRecruitement;
  const openPositions = jobs.filter((j) => j.status === 'Open');
  const totalApplications = jobs.reduce((sum, j) => sum + j.applications, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Recruitment Management</h1>
            <p className="text-muted-foreground mt-2">Manage job openings and candidates</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Post New Job
          </Button>
        </div>

        {/* Recruitment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Positions</p>
                  <p className="text-2xl font-bold">{openPositions.length}</p>
                </div>
                <Briefcase className="w-10 h-10 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{totalApplications}</p>
                </div>
                <Users className="w-10 h-10 text-accent/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Applications</p>
                  <p className="text-2xl font-bold">{jobs.length > 0 ? (totalApplications / jobs.length).toFixed(1) : 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Per position</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Openings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Job Openings</CardTitle>
            <CardDescription>{jobs.length} active and inactive positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.department}</p>
                    </div>
                    <Badge className={job.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {job.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Open Positions</p>
                      <p className="text-lg font-bold">{job.openPositions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Applications</p>
                      <p className="text-lg font-bold">{job.applications}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Posted Date</p>
                      <p className="text-sm">{job.postedDate}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Applications
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit Job
                    </Button>
                    <Button variant="outline" size="sm">
                      Schedule Interview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application Pipeline */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Application Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { stage: 'Applied', count: 156, color: 'bg-blue-100 text-blue-700' },
                { stage: 'Screened', count: 98, color: 'bg-purple-100 text-purple-700' },
                { stage: 'Interviewed', count: 42, color: 'bg-yellow-100 text-yellow-700' },
                { stage: 'Offered', count: 18, color: 'bg-green-100 text-green-700' },
              ].map((stage) => (
                <Card key={stage.stage} className="border-0 shadow-sm bg-secondary/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">{stage.stage}</p>
                    <p className="text-3xl font-bold mb-2">{stage.count}</p>
                    <Badge className={stage.color}>Active</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
