'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calculator, Receipt, CheckCircle2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DocumentViewer from '@/components/document-viewer';
import apiService from '@/lib/api';

export default function TaxPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [taxRecords, setTaxRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load tax records from API when available
    // For now, use empty array - API endpoint will be added later
    setIsLoading(false);
  }, []);

  if (!isAuthenticated) {
    redirect('/login');
  }

  const handleDownload = async (docName: string) => {
    // TODO: Implement API call to download tax document
    toast.info('Document download will be available once API is implemented.');
  };

  const handleViewDocument = async (docName: string) => {
    // TODO: Implement API call to view tax document
    toast.info('Document preview will be available once API is implemented.');
  };

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
                <Button variant="outline" className="gap-2 bg-transparent" size="sm" onClick={() => handleViewDocument('Form 16')}>
                  <Eye className="w-4 h-4" />
                  View ITR
                </Button>
                {hasPermission('process_payroll') && (
                  <>
                    <Button variant="outline" className="gap-2 bg-transparent" size="sm" onClick={() => handleDownload('Form 16')}>
                      <Download className="w-4 h-4" />
                      Download Certificate
                    </Button>
                    <Button variant="outline" className="gap-2 bg-transparent" size="sm" onClick={() => handleDownload('Deduction')}>
                      <Download className="w-4 h-4" />
                      Download Deduction Summary
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" asChild>
            <Link href="/tax/regime-comparison">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Regime Comparison</p>
                    <p className="text-xs text-muted-foreground">Compare old vs new</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" asChild>
            <Link href="/tax/form16">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Form 16</p>
                    <p className="text-xs text-muted-foreground">Download certificate</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {hasPermission('process_payroll') && (
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" asChild>
              <Link href="/tax/form24q">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Receipt className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold">Form 24Q</p>
                      <p className="text-xs text-muted-foreground">Quarterly TDS return</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          )}

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" asChild>
            <Link href="/tax/proof-uploads">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Proof Verification</p>
                    <p className="text-xs text-muted-foreground">Upload & verify</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Tax Documents */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Tax Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Form 16', year: 'FY 2025-26', status: 'Available', link: '/tax/form16' },
                { name: 'Form 12BB', year: 'FY 2025-26', status: 'Available', link: '#' },
                { name: 'Deduction Certificate', year: 'FY 2025-26', status: 'Available', link: '#' },
              ].map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.year}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-700">{doc.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => handleViewDocument(doc.name)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(doc.name)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Viewer */}
        <DocumentViewer
          open={!!selectedDocument}
          onOpenChange={(open) => {
            if (!open) setSelectedDocument(null);
          }}
          document={selectedDocument}
        />
      </div>
    </DashboardLayout>
  );
}
