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

export default function PunchCorrectionPage() {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);

  if (!isAuthenticated) redirect('/login');

  const corrections = [
    {
      id: 1,
      date: '2026-02-20',
      originalIn: '09:05',
      correctedIn: '09:00',
      originalOut: '18:35',
      correctedOut: '18:30',
      reason: 'System delay',
      status: 'Approved',
    },
    {
      id: 2,
      date: '2026-02-18',
      originalIn: 'No Punch',
      correctedIn: '08:55',
      originalOut: '18:20',
      correctedOut: '18:20',
      reason: 'Badge malfunction',
      status: 'Pending',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Punch Correction</h1>
            <p className="text-muted-foreground mt-2">Correct punch-in and punch-out times</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Correction
          </Button>
        </div>

        {showForm && (
          <Card className="border-accent/50">
            <CardHeader><CardTitle>Request Punch Correction</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Correct Check-In Time</Label>
                  <Input type="time" />
                </div>
                <div>
                  <Label>Correct Check-Out Time</Label>
                  <Input type="time" />
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <textarea className="w-full px-3 py-2 border border-border rounded-lg bg-card" rows={3} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">Submit Correction</Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {corrections.map((corr) => (
            <Card key={corr.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{corr.date}</h3>
                    <p className="text-sm text-muted-foreground">{corr.reason}</p>
                  </div>
                  <Badge variant={corr.status === 'Approved' ? 'default' : 'secondary'}>{corr.status}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Original Check-In</p>
                    <p className="font-bold">{corr.originalIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Corrected Check-In</p>
                    <p className="font-bold text-green-600">{corr.correctedIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Original Check-Out</p>
                    <p className="font-bold">{corr.originalOut}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Corrected Check-Out</p>
                    <p className="font-bold text-green-600">{corr.correctedOut}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
