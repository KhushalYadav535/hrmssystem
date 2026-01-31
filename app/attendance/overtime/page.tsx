'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock } from 'lucide-react';
import { useState } from 'react';

export default function OvertimePage() {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);

  if (!isAuthenticated) redirect('/login');

  const overtimeRecords = [
    { id: 1, date: '2026-02-20', hours: 3, reason: 'Project Deadline', status: 'Approved', approvalDate: '2026-02-21' },
    { id: 2, date: '2026-02-18', hours: 2.5, reason: 'Client Meeting', status: 'Pending', approvalDate: '-' },
    { id: 3, date: '2026-02-15', hours: 4, reason: 'Release Deployment', status: 'Approved', approvalDate: '2026-02-16' },
  ];

  const totalOvertime = overtimeRecords.reduce((sum, rec) => sum + rec.hours, 0);
  const approvedOvertime = overtimeRecords.filter(r => r.status === 'Approved').reduce((sum, rec) => sum + rec.hours, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Overtime Requests</h1>
            <p className="text-muted-foreground mt-2">Request and track overtime hours</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            New OT Request
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Overtime</p>
                  <p className="text-2xl font-bold">{totalOvertime.toFixed(1)} hrs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedOvertime.toFixed(1)} hrs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600">{(totalOvertime - approvedOvertime).toFixed(1)} hrs</p>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="border-accent/50">
            <CardHeader><CardTitle>New Overtime Request</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Hours</Label>
                  <Input type="number" step="0.5" placeholder="3" />
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <textarea className="w-full px-3 py-2 border border-border rounded-lg bg-card" rows={3} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">Submit Request</Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {overtimeRecords.map((rec) => (
            <Card key={rec.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{rec.date} - {rec.hours} hours</p>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  </div>
                  <Badge variant={rec.status === 'Approved' ? 'default' : 'secondary'}>{rec.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
