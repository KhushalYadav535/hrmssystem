'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function RegularizationPage() {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);

  if (!isAuthenticated) redirect('/login');

  const requests = [
    { id: 1, date: '2026-02-15', reason: 'Doctor Appointment', status: 'Approved', approvedBy: 'Manager Name' },
    { id: 2, date: '2026-02-10', reason: 'Official Work', status: 'Pending', approvedBy: '-' },
    { id: 3, date: '2026-01-28', reason: 'Emergency Leave', status: 'Rejected', approvedBy: 'HR Admin' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Attendance Regularization</h1>
            <p className="text-muted-foreground mt-2">Request regularization for missed punch or absent days</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </div>

        {showForm && (
          <Card className="border-accent/50">
            <CardHeader><CardTitle>Regularization Request</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Reason</Label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-card">
                  <option>Missed Punch</option>
                  <option>Doctor Appointment</option>
                  <option>Emergency Work</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <Label>Details</Label>
                <textarea className="w-full px-3 py-2 border border-border rounded-lg bg-card" rows={3} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">Submit</Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Date: {req.date}</p>
                    <p className="text-sm text-muted-foreground">{req.reason}</p>
                  </div>
                  <Badge variant={req.status === 'Approved' ? 'default' : req.status === 'Rejected' ? 'destructive' : 'secondary'}>
                    {req.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
