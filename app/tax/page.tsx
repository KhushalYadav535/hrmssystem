'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockTaxData } from '@/lib/mock-data';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TaxPage() {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    redirect('/login');
  }

  const taxRecords = mockTaxData;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tax Management</h1>
          <p className="text-muted-foreground mt-2">View your tax calculations and filings</p>
        </div>

        {/* Tax Records */}
        {taxRecords.map((tax) => (
          <Card key={tax.id} className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">FY {tax.financialYear}</CardTitle>
                  <CardDescription>Income Tax Assessment</CardDescription>
                </div>
                <Badge className={tax.status === 'Filed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {tax.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Income Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm mb-3">Income Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gross Income</span>
                      <span className="font-medium">₹{tax.grossIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Standard Deduction</span>
                      <span className="font-medium">₹{tax.standardDeduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ch. VI-A Deductions</span>
                      <span className="font-medium">₹{tax.chapter6aDeductions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Other Deductions</span>
                      <span className="font-medium">₹{tax.otherDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Tax Calculation Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm mb-3">Tax Calculation</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxable Income</span>
                      <span className="font-medium">₹{tax.taxableIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax Calculated</span>
                      <span className="font-medium">₹{tax.taxCalculated.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Education Cess (4%)</span>
                      <span className="font-medium">₹{tax.educationCess.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="space-y-4 bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-3">Tax Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-semibold border-b pb-3">
                      <span>Total Tax Liability</span>
                      <span className="text-lg text-primary">₹{tax.totalTax.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>This amount is payable before the due date of ITR filing.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="gap-2 bg-transparent" size="sm">
                  <FileText className="w-4 h-4" />
                  View ITR
                </Button>
                {hasPermission('process_payroll') && (
                  <>
                    <Button variant="outline" className="gap-2 bg-transparent" size="sm">
                      <Download className="w-4 h-4" />
                      Download Certificate
                    </Button>
                    <Button variant="outline" className="gap-2 bg-transparent" size="sm">
                      <Download className="w-4 h-4" />
                      Download Deduction Summary
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Tax Documents */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Tax Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Form 16', year: 'FY 2025-26', status: 'Available' },
                { name: 'Form 12BB', year: 'FY 2025-26', status: 'Available' },
                { name: 'Deduction Certificate', year: 'FY 2025-26', status: 'Available' },
              ].map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.year}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-700">{doc.status}</Badge>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
