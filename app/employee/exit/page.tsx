'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';

export default function EmployeeExitPage() {
  const [exitProcess] = useState({
    exitDate: '2026-03-31',
    reason: 'Voluntary Resignation',
    noticePeriod: 60,
    daysRemaining: 28,
    status: 'In Progress',
    tasks: [
      { name: 'Exit Approval', status: 'Completed', completedDate: '2026-01-15' },
      { name: 'Knowledge Transfer', status: 'In Progress', completedDate: null },
      { name: 'Final Settlement Calculation', status: 'Pending', completedDate: null },
      { name: 'Asset Recovery', status: 'Pending', completedDate: null },
      { name: 'Exit Formalities', status: 'Pending', completedDate: null },
    ],
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Employee Exit Process</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Exit Date</p>
              <p className="text-2xl font-bold text-foreground">{exitProcess.exitDate}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Days Remaining</p>
              <p className="text-2xl font-bold text-yellow-600">{exitProcess.daysRemaining}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="mt-2">{exitProcess.status}</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exit Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exitProcess.tasks.map((task, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                {task.status === 'Completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : task.status === 'In Progress' ? (
                  <Clock className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold">{task.name}</h4>
                  {task.completedDate && <p className="text-xs text-muted-foreground">Completed: {task.completedDate}</p>}
                </div>
                <Badge variant={task.status === 'Completed' ? 'default' : task.status === 'In Progress' ? 'secondary' : 'outline'}>
                  {task.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Reason for Exit</p>
              <p className="font-semibold text-foreground">{exitProcess.reason}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Notice Period</p>
              <p className="font-semibold text-foreground">{exitProcess.noticePeriod} days</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
