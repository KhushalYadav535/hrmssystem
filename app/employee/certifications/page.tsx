'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertCircle } from 'lucide-react';

export default function CertificationsPage() {
  const [certs] = useState([
    { id: 1, name: 'PMP', issuer: 'PMI', issued: '2023-06-15', expiry: '2026-06-15', status: 'Active', daysLeft: 134 },
    { id: 2, name: 'AWS Solutions Architect', issuer: 'Amazon', issued: '2022-09-20', expiry: '2025-09-20', status: 'Expiring Soon', daysLeft: 232 },
    { id: 3, name: 'Scrum Master', issuer: 'Scrum.org', issued: '2024-01-10', expiry: '2027-01-10', status: 'Active', daysLeft: 680 },
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Certifications & Training</h1>
          <Button className="gap-2"><Plus className="w-4 h-4" /> Add Certification</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {certs.map((cert) => (
              <div key={cert.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{cert.name}</h4>
                  <Badge className={cert.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900'}>
                    {cert.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{cert.issuer} • Issued: {cert.issued}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm"><strong>Expires:</strong> {cert.expiry}</p>
                  <p className={`text-sm font-semibold ${cert.daysLeft < 180 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {cert.daysLeft} days remaining
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {certs.some(c => c.status === 'Expiring Soon') && (
          <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Renewal Required:</strong> AWS Solutions Architect certification expires in 232 days. Please plan renewal.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
