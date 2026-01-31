'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function ExitSettlementPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) redirect('/login');

  const settlements = [
    {
      id: 1,
      employeeName: 'Rajesh Kumar',
      designation: 'Senior Accountant',
      exitDate: '2026-02-28',
      reason: 'Retirement',
      status: 'In Progress',
      fullSettlement: 450000,
      gratuity: 200000,
      leaveEncashment: 150000,
      otherBenefits: 100000,
    },
  ];

  const calculations = [
    { item: 'Full & Final Settlement', amount: '₹4,50,000', status: 'Pending' },
    { item: 'Gratuity Calculation', amount: '₹2,00,000', status: 'Approved' },
    { item: 'Leave Encashment', amount: '₹1,50,000', status: 'Approved' },
    { item: 'Pro-rata Bonus', amount: '₹50,000', status: 'Pending' },
    { item: 'Variable Pay', amount: '₹1,00,000', status: 'Pending' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exit Settlement & F&F</h1>
          <p className="text-muted-foreground mt-2">Full & Final settlement for employee separation</p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {settlements.map((settlement) => (
              <Card key={settlement.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{settlement.employeeName}</CardTitle>
                      <CardDescription>{settlement.designation} - Exit Date: {settlement.exitDate}</CardDescription>
                    </div>
                    <Badge variant="secondary">{settlement.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Full Settlement</p>
                      <p className="text-lg font-bold">₹{settlement.fullSettlement.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Gratuity</p>
                      <p className="text-lg font-bold">₹{settlement.gratuity.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Leave Encashment</p>
                      <p className="text-lg font-bold">₹{settlement.leaveEncashment.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Other Benefits</p>
                      <p className="text-lg font-bold">₹{settlement.otherBenefits.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg space-y-3">
                    <p className="font-semibold text-foreground">Settlement Breakdown</p>
                    {calculations.map((calc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-card rounded border border-border/50">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{calc.item}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold">{calc.amount}</span>
                          <Badge variant={calc.status === 'Approved' ? 'default' : 'secondary'}>{calc.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-lg flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-400">
                      Review and approve all settlement components before final processing.
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">Review & Approve Settlement</Button>
                    <Button variant="outline" className="flex-1 bg-transparent">Save as Draft</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-lg text-foreground">No approved settlements pending payment</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paid">
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-foreground">No settlement payments recorded</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
