'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';

export default function HRAExemptionPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) redirect('/login');

  const hraData = {
    basicSalary: 150000,
    hraPaid: 60000,
    rentPaid: 65000,
    basicPercentage: 50,
    cityClassification: 'Metro',
    exemptionPercentage: 50,
    calculation: {
      hraReceived: 60000,
      basicSalaryPercentage: 75000,
      rentMinusBasicTenPercent: 59000,
      exemption: 59000,
      taxableHRA: 1000,
    },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">HRA Exemption Calculator</h1>
          <p className="text-muted-foreground mt-2">Calculate HRA exemption under Section 10(13A)</p>
        </div>

        <Tabs defaultValue="calculator">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator">HRA Calculator</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>HRA Exemption Calculation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground mb-2 block">Basic Salary (Monthly)</Label>
                    <p className="text-2xl font-bold text-foreground">₹{hraData.basicSalary.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground mb-2 block">HRA Paid (Monthly)</Label>
                    <p className="text-2xl font-bold text-foreground">₹{hraData.hraPaid.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground mb-2 block">Rent Paid (Monthly)</Label>
                    <p className="text-2xl font-bold text-foreground">₹{hraData.rentPaid.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground mb-2 block">City Classification</Label>
                    <p className="text-2xl font-bold text-foreground">{hraData.cityClassification}</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-400">
                    HRA Exemption is the <strong>minimum of:</strong> (1) HRA received, (2) 50% of Basic (Metro), (3) Rent paid - 10% of Basic
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-semibold text-foreground">Exemption Calculation</p>
                  {[
                    { label: 'HRA Received', value: `₹${hraData.calculation.hraReceived.toLocaleString()}` },
                    { label: `${hraData.basicPercentage}% of Basic Salary (${hraData.cityClassification})`, value: `₹${hraData.calculation.basicSalaryPercentage.toLocaleString()}` },
                    { label: 'Rent Paid - 10% of Basic', value: `₹${hraData.calculation.rentMinusBasicTenPercent.toLocaleString()}` },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-card border border-border/50 rounded">
                      <span className="text-sm">{item.label}</span>
                      <span className="font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">HRA Exemption Allowed</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-500 mt-2">₹{hraData.calculation.exemption.toLocaleString()}</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-2">Taxable HRA: ₹{hraData.calculation.taxableHRA.toLocaleString()}</p>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">Save & Submit</Button>
                  <Button variant="outline" className="flex-1 bg-transparent">Download Certificate</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Section 10(13A) - House Rent Allowance</h3>
                  <p className="text-sm text-muted-foreground">
                    HRA is exempt from income tax only when the employee is paying rent for residential accommodation. The exemption is limited to the lowest of:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>The amount of HRA received</li>
                    <li>The percentage of basic salary as per city classification (50% for metros, 40% for non-metros)</li>
                    <li>The amount by which rent exceeds 10% of basic salary</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">City Classification</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-secondary/30 rounded"><strong>Metro Cities:</strong> 50%</div>
                    <div className="p-2 bg-secondary/30 rounded"><strong>Non-Metro:</strong> 40%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
