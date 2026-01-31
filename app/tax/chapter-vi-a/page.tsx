'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function ChapterVIAPage() {
  const [deductions] = useState([
    { section: '80C', name: 'Life Insurance, PPF, Mutual Funds', max: 150000, claimed: 150000 },
    { section: '80D', name: 'Health Insurance Premium', max: 25000, claimed: 15000 },
    { section: '80E', name: 'Education Loan Interest', max: 50000, claimed: 45000 },
    { section: '80G', name: 'Donations to Charity', max: null, claimed: 10000 },
    { section: '80CCD', name: 'NPS Contribution', max: 50000, claimed: 50000 },
    { section: '80TTA', name: 'Savings Account Interest', max: 10000, claimed: 8000 },
  ]);

  const totalClaimed = deductions.reduce((sum, d) => sum + d.claimed, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Chapter VI-A Deductions</h1>

        <Card>
          <CardHeader>
            <CardTitle>Tax-Saving Investment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deductions.map((item) => (
              <div key={item.section} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{item.section}: {item.name}</h4>
                    {item.max && <p className="text-xs text-muted-foreground">Maximum: ₹{item.max.toLocaleString()}</p>}
                  </div>
                  <Badge variant={item.claimed >= (item.max || 0) ? 'default' : 'secondary'}>
                    {item.claimed >= (item.max || 0) ? 'Max Claimed' : 'Partial'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Max Limit</Label>
                    <p className="font-bold text-foreground">₹{item.max ? item.max.toLocaleString() : 'No Limit'}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Amount Claimed</Label>
                    <Input type="number" defaultValue={item.claimed} className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Remaining</Label>
                    <p className="font-bold text-blue-600 mt-2">₹{((item.max || 0) - item.claimed).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Chapter VI-A Deductions Claimed</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">₹{totalClaimed.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">Estimated tax saving: ₹{(totalClaimed * 0.30).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
