'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function ChapterVIAPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('80c');

  if (!isAuthenticated) redirect('/login');

  const deductions = {
    '80C': [
      { item: 'Life Insurance Premium', maxLimit: 150000, claimed: 45000, status: 'Approved' },
      { item: 'ELSS Mutual Fund', maxLimit: 150000, claimed: 60000, status: 'Approved' },
      { item: 'PPF Contribution', maxLimit: 150000, claimed: 30000, status: 'Pending' },
      { item: 'Home Loan Principal', maxLimit: '₹∞', claimed: 150000, status: 'Approved' },
    ],
    '80D': [
      { item: 'Self Health Insurance', maxLimit: 75000, claimed: 45000, status: 'Approved' },
      { item: 'Parent Health Insurance', maxLimit: 75000, claimed: 30000, status: 'Approved' },
    ],
    '80E': [
      { item: 'Education Loan Interest', maxLimit: '₹∞', claimed: 125000, status: 'Pending' },
    ],
    '80G': [
      { item: 'Charitable Donations', maxLimit: '50%', claimed: 5000, status: 'Approved' },
    ],
  };

  const sections = {
    '80C': 'Life Insurance, PPF, ELSS, Home Loan Principal, etc.',
    '80D': 'Health Insurance Premiums',
    '80E': 'Interest on Education Loan',
    '80G': 'Donations to Approved Charities',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chapter VI-A Deductions</h1>
          <p className="text-muted-foreground mt-2">Manage tax deductions under Chapter VI-A of Income Tax Act</p>
        </div>

        <Tabs defaultValue="80c" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="80c">Section 80C</TabsTrigger>
            <TabsTrigger value="80d">Section 80D</TabsTrigger>
            <TabsTrigger value="80e">Section 80E</TabsTrigger>
            <TabsTrigger value="80g">Section 80G</TabsTrigger>
          </TabsList>

          {Object.entries(deductions).map(([section, items]) => (
            <TabsContent key={section} value={section.toLowerCase()} className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">{sections[section as keyof typeof sections]}</p>
              </div>

              {items.map((item, idx) => (
                <Card key={idx}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{item.item}</h3>
                        <p className="text-sm text-muted-foreground">Max Limit: ₹{typeof item.maxLimit === 'number' ? item.maxLimit.toLocaleString() : item.maxLimit}</p>
                      </div>
                      <Badge variant={item.status === 'Approved' ? 'default' : 'secondary'}>{item.status}</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Max Limit</p>
                        <p className="text-lg font-bold">₹{typeof item.maxLimit === 'number' ? item.maxLimit.toLocaleString() : item.maxLimit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Amount Claimed</p>
                        <p className="text-lg font-bold">₹{item.claimed.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Remaining</p>
                        <p className="text-lg font-bold text-accent">₹{(typeof item.maxLimit === 'number' ? item.maxLimit - item.claimed : 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">View Details</Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">Upload Proof</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Total Tax Savings Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Section 80C</p>
                <p className="text-2xl font-bold">₹2,85,000</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Section 80D</p>
                <p className="text-2xl font-bold">₹75,000</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Section 80E</p>
                <p className="text-2xl font-bold">₹1,25,000</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                <p className="text-xs text-green-700 dark:text-green-400">Total Deduction</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-500">₹4,85,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
