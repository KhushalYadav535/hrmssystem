'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Form16Page() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [selectedYear, setSelectedYear] = useState('2025-26');

  if (!isAuthenticated) {
    redirect('/login');
  }

  // Mock Form 16 data
  const form16Data = {
    '2025-26': {
      status: 'Available',
      generatedDate: '2026-06-15',
      partA: {
        tan: 'CHEN12345A',
        pan: 'ABCDE1234F',
        assessmentYear: '2026-27',
        employeeName: 'Rajesh Kumar',
        employeePAN: 'ABCDE1234F',
      },
      partB: {
        grossSalary: 1800000,
        allowances: 240000,
        perquisites: 0,
        profitInLieuOfSalary: 0,
        totalSalary: 2040000,
        standardDeduction: 50000,
        hraExemption: 72000,
        ltaExemption: 25000,
        totalDeductions: 147000,
        taxableSalary: 1893000,
        taxOnSalary: 312200,
        surcharge: 0,
        healthAndEducationCess: 12488,
        totalTax: 324688,
        tdsDeducted: 324688,
        monthWiseTDS: [
          { month: 'Apr 2025', tds: 27057 },
          { month: 'May 2025', tds: 27057 },
          { month: 'Jun 2025', tds: 27057 },
          { month: 'Jul 2025', tds: 27057 },
          { month: 'Aug 2025', tds: 27057 },
          { month: 'Sep 2025', tds: 27057 },
          { month: 'Oct 2025', tds: 27057 },
          { month: 'Nov 2025', tds: 27057 },
          { month: 'Dec 2025', tds: 27057 },
          { month: 'Jan 2026', tds: 27057 },
          { month: 'Feb 2026', tds: 27057 },
          { month: 'Mar 2026', tds: 27057 },
        ],
      },
    },
    '2024-25': {
      status: 'Available',
      generatedDate: '2025-06-15',
    },
  };

  const handleDownload = (part: 'partA' | 'partB' | 'combined') => {
    toast.success(`Downloading Form 16 ${part === 'combined' ? '(Part A & B)' : part === 'partA' ? 'Part A' : 'Part B'}...`);
    // In production, this would download the PDF
  };

  const handleRegenerate = () => {
    toast.success('Form 16 regeneration initiated. You will be notified when ready.');
  };

  const currentForm16 = form16Data[selectedYear as keyof typeof form16Data];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Form 16</h1>
            <p className="text-muted-foreground mt-2">Download your Form 16 certificate for income tax filing</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-26">FY 2025-26</SelectItem>
                <SelectItem value="2024-25">FY 2024-25</SelectItem>
                <SelectItem value="2023-24">FY 2023-24</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Card */}
        <Card className={currentForm16.status === 'Available' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentForm16.status === 'Available' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                )}
                <div>
                  <p className="font-semibold">
                    Form 16 for {selectedYear} - {currentForm16.status}
                  </p>
                  {currentForm16.status === 'Available' && (
                    <p className="text-sm text-muted-foreground">
                      Generated on: {formatDateDDMMYYYY(currentForm16.generatedDate)}
                    </p>
                  )}
                </div>
              </div>
              <Badge className={currentForm16.status === 'Available' ? 'bg-green-600' : 'bg-yellow-600'}>
                {currentForm16.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {currentForm16.status === 'Available' && 'partA' in currentForm16 ? (
          <>
            {/* Download Options */}
            <Card>
              <CardHeader>
                <CardTitle>Download Form 16</CardTitle>
                <CardDescription>Download Part A, Part B, or combined Form 16</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 flex-wrap">
                  <Button onClick={() => handleDownload('partA')} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Part A (From TRACES)
                  </Button>
                  <Button onClick={() => handleDownload('partB')} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Part B (Salary Details)
                  </Button>
                  <Button onClick={() => handleDownload('combined')} className="gap-2">
                    <Download className="w-4 h-4" />
                    Complete Form 16 (PDF)
                  </Button>
                  {hasPermission('process_payroll') && (
                    <Button onClick={handleRegenerate} variant="outline" className="gap-2">
                      <FileText className="w-4 h-4" />
                      Regenerate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Form 16 Details */}
            <Tabs defaultValue="partA" className="w-full">
              <TabsList>
                <TabsTrigger value="partA">Part A</TabsTrigger>
                <TabsTrigger value="partB">Part B</TabsTrigger>
                <TabsTrigger value="monthwise">Month-wise TDS</TabsTrigger>
              </TabsList>

              <TabsContent value="partA" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Part A - Employer & Employee Details</CardTitle>
                    <CardDescription>Information from TRACES portal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">TAN</p>
                        <p className="font-semibold">{currentForm16.partA.tan}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">PAN</p>
                        <p className="font-semibold">{currentForm16.partA.pan}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Assessment Year</p>
                        <p className="font-semibold">{currentForm16.partA.assessmentYear}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Employee Name</p>
                        <p className="font-semibold">{currentForm16.partA.employeeName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Employee PAN</p>
                        <p className="font-semibold">{currentForm16.partA.employeePAN}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="partB" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Part B - Salary & Tax Details</CardTitle>
                    <CardDescription>Complete salary breakup and tax computation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Salary Details */}
                    <div>
                      <h3 className="font-semibold mb-3">Salary Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gross Salary</span>
                          <span className="font-medium">₹{currentForm16.partB.grossSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Allowances</span>
                          <span className="font-medium">₹{currentForm16.partB.allowances.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Perquisites</span>
                          <span className="font-medium">₹{currentForm16.partB.perquisites.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-semibold">
                          <span>Total Salary</span>
                          <span>₹{currentForm16.partB.totalSalary.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div>
                      <h3 className="font-semibold mb-3">Deductions</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Standard Deduction</span>
                          <span className="font-medium">₹{currentForm16.partB.standardDeduction.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">HRA Exemption</span>
                          <span className="font-medium">₹{currentForm16.partB.hraExemption.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">LTA Exemption</span>
                          <span className="font-medium">₹{currentForm16.partB.ltaExemption.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-semibold">
                          <span>Total Deductions</span>
                          <span>₹{currentForm16.partB.totalDeductions.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tax Computation */}
                    <div>
                      <h3 className="font-semibold mb-3">Tax Computation</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Taxable Salary</span>
                          <span className="font-medium">₹{currentForm16.partB.taxableSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax on Salary</span>
                          <span className="font-medium">₹{currentForm16.partB.taxOnSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Health & Education Cess (4%)</span>
                          <span className="font-medium">₹{currentForm16.partB.healthAndEducationCess.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-bold text-lg">
                          <span>Total Tax</span>
                          <span className="text-primary">₹{currentForm16.partB.totalTax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-muted-foreground">TDS Deducted</span>
                          <span className="font-semibold">₹{currentForm16.partB.tdsDeducted.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monthwise" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Month-wise TDS Deduction</CardTitle>
                    <CardDescription>TDS deducted each month during the financial year</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {currentForm16.partB.monthWiseTDS.map((month, idx) => (
                        <div key={idx} className="flex justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="font-medium">{month.month}</span>
                          <span className="font-semibold">₹{month.tds.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between p-3 bg-primary/10 rounded-lg font-bold mt-2">
                        <span>Total TDS</span>
                        <span>₹{currentForm16.partB.tdsDeducted.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Form 16 Not Available</p>
              <p className="text-muted-foreground">
                Form 16 for {selectedYear} is being generated. You will be notified once it's ready.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
