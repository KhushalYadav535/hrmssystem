'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BonusIncentivesPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) redirect('/login');

  const bonuses = [
    { id: 1, name: 'Performance Bonus', amount: 50000, frequency: 'Quarterly', paidTo: 285, status: 'Active' },
    { id: 2, name: 'Diwali Bonus', amount: 100000, frequency: 'Yearly', paidTo: 280, status: 'Active' },
    { id: 3, name: 'Sales Incentive', amount: 'Variable', frequency: 'Monthly', paidTo: 120, status: 'Active' },
  ];

  const incentives = [
    { id: 1, program: 'Sales Target', metric: 'Revenue', targetValue: '₹50 Cr', currentValue: '₹42.5 Cr', achievement: '85%', bonus: '₹15000/emp' },
    { id: 2, program: 'Customer Retention', metric: 'Satisfaction', targetValue: '95%', currentValue: '92%', achievement: '97%', bonus: '₹8000/emp' },
    { id: 3, program: 'Operational Efficiency', metric: 'Cost Reduction', targetValue: '10%', currentValue: '7.5%', achievement: '75%', bonus: 'Pending' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bonus & Incentives</h1>
            <p className="text-muted-foreground mt-2">Manage bonuses, performance incentives, and variable pay</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Bonus
          </Button>
        </div>

        <Tabs defaultValue="bonuses">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
            <TabsTrigger value="incentives">Incentive Programs</TabsTrigger>
          </TabsList>

          <TabsContent value="bonuses" className="space-y-4">
            <div className="grid gap-4">
              {bonuses.map((bonus) => (
                <Card key={bonus.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{bonus.name}</h3>
                        <p className="text-sm text-muted-foreground">{bonus.frequency}</p>
                      </div>
                      <Badge>{bonus.status}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Amount Per Employee</p>
                        <p className="text-lg font-bold">₹{typeof bonus.amount === 'number' ? bonus.amount.toLocaleString() : bonus.amount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Paid To Employees</p>
                        <p className="text-lg font-bold">{bonus.paidTo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Outgo</p>
                        <p className="text-lg font-bold">₹{(typeof bonus.amount === 'number' ? bonus.amount * bonus.paidTo : 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent"><Edit2 className="w-4 h-4 mr-2" />Edit</Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">Process Bonus</Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="incentives" className="space-y-4">
            <div className="grid gap-4">
              {incentives.map((prog) => (
                <Card key={prog.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="w-5 h-5 text-accent" />
                      <div>
                        <h3 className="text-lg font-semibold">{prog.program}</h3>
                        <p className="text-sm text-muted-foreground">{prog.metric}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="text-lg font-bold">{prog.targetValue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="text-lg font-bold">{prog.currentValue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Achievement</p>
                        <p className="text-lg font-bold text-primary">{prog.achievement}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Bonus Payable</p>
                        <p className="text-lg font-bold text-green-600">{prog.bonus}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">View Details</Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">Approve & Allocate</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
