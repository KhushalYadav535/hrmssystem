'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export default function NomineeAllocationPage() {
  const [nominees] = useState([
    { id: 1, name: 'Priya Sharma', relation: 'Spouse', percentage: 60, phone: '+91-9876543210' },
    { id: 2, name: 'Aditya Sharma', relation: 'Son', percentage: 40, phone: '-' },
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Nominee Allocation</h1>
          <Button className="gap-2"><Plus className="w-4 h-4" /> Add Nominee</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Benefit Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nominees.map((nominee) => (
              <div key={nominee.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{nominee.name}</h4>
                    <p className="text-xs text-muted-foreground">{nominee.relation}</p>
                  </div>
                  <div className="text-2xl font-bold text-primary">{nominee.percentage}%</div>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: `${nominee.percentage}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{nominee.phone}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Allocation</p>
            <p className="text-3xl font-bold text-green-600">100%</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
