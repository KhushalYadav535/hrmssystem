'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Eye, Share2, Trash2, Copy } from 'lucide-react';
import { useState } from 'react';

export default function CustomReportBuilderPage() {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated || !hasPermission('view_reports')) {
    redirect('/dashboard');
  }

  const customReports = [
    { id: 1, name: 'Department Wise Payroll', created: '2026-02-01', author: 'You', frequency: 'Monthly', shared: 5, status: 'Active' },
    { id: 2, name: 'Attrition Analysis Q1', created: '2026-01-15', author: 'You', frequency: 'Quarterly', shared: 3, status: 'Active' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Custom Report Builder</h1>
            <p className="text-muted-foreground mt-2">Create and manage custom reports with advanced filtering</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </div>

        <Tabs defaultValue="my-reports" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-reports">My Reports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="my-reports">
            <div className="space-y-4">
              {customReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{report.name}</CardTitle>
                        <CardDescription>
                          Created {report.created} • {report.frequency} • Shared with {report.shared} people
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-600">{report.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Employee Headcount', desc: 'Track employee count by department' },
                { name: 'Payroll Summary', desc: 'Monthly payroll breakdown' },
                { name: 'Leave Analysis', desc: 'Leave utilization statistics' },
                { name: 'Attrition Report', desc: 'Employee separation analysis' },
              ].map((template) => (
                <Card key={template.name} className="hover:shadow-lg transition cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Use Template</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Report Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { report: 'Department Wise Payroll', frequency: 'Monthly', nextRun: '2026-03-01 09:00', recipients: 'finance@company.com' },
                    { report: 'Attrition Analysis Q1', frequency: 'Quarterly', nextRun: '2026-04-01 08:00', recipients: 'hr-team@company.com' },
                  ].map((scheduled) => (
                    <div key={scheduled.report} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{scheduled.report}</p>
                          <p className="text-sm text-muted-foreground">{scheduled.frequency} • Next: {scheduled.nextRun}</p>
                        </div>
                        <Badge>{scheduled.frequency}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">To: {scheduled.recipients}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit Schedule</Button>
                        <Button size="sm" variant="destructive">Disable</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
