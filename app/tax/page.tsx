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
    loadTaxRecords();
  }, []);

  const loadTaxRecords = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTaxDeclarations();
      if (response.success && response.data) {
        setTaxRecords(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load tax records', error);
      toast.error('Failed to load tax records');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    redirect('/login');
  }

  const handleDownload = async (docName: string, docUrl: string) => {
    if (!docUrl || docUrl === '#') {
      toast.error('Document URL not available');
      return;
    }
    try {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = docUrl;
      link.download = `${docName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Document download started');
    } catch (error: any) {
      toast.error('Failed to download document');
      console.error('Download error:', error);
    }
  };

  const handleViewDocument = async (docUrl: string, docName: string = 'Document') => {
    if (!docUrl || docUrl === '#') {
      toast.error('Document not available for viewing');
      return;
    }
    try {
      setSelectedDocument({
        name: docName,
        url: docUrl,
        type: docUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'
      });
    } catch (error: any) {
      toast.error('Failed to load document');
      console.error('View document error:', error);
    }
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
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading tax records...</div>
        ) : taxRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No tax records found</div>
        ) : (
          taxRecords.map((tax) => {
            const taxId = tax._id || tax.id;
            // Calculate totals from declarations array
            const totalDeclarations = tax.declarations?.reduce((sum: number, dec: any) => sum + (dec.amount || 0), 0) || 0;
            const approvedDeclarations = tax.declarations?.filter((dec: any) => dec.status === 'Approved').reduce((sum: number, dec: any) => sum + (dec.amount || 0), 0) || 0;

            return (
              <Card key={taxId} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">FY {tax.financialYear}</CardTitle>
                      <CardDescription>
                        {tax.employeeId ? `${tax.employeeId.firstName} ${tax.employeeId.lastName}` : 'Income Tax Assessment'}
                      </CardDescription>
                    </div>
                    <Badge className={tax.status === 'Verified' ? 'bg-green-100 text-green-700' : tax.status === 'Submitted' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}>
                      {tax.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {/* Declarations Section */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm mb-3">Tax Declarations</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Regime</span>
                          <span className="font-medium">{tax.regime || 'New'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Declarations</span>
                          <span className="font-medium">₹{totalDeclarations.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Approved Amount</span>
                          <span className="font-medium">₹{approvedDeclarations.toLocaleString()}</span>
                        </div>
                        {tax.declarations && tax.declarations.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-semibold mb-2">Breakdown:</p>
                            {tax.declarations.map((dec: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">{dec.section}:</span>
                                <span className="font-medium">₹{dec.amount?.toLocaleString() || '0'} ({dec.status || 'Pending'})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Section */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm mb-3">Status Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Submission Date</span>
                          <span className="font-medium">{tax.submissionDate ? new Date(tax.submissionDate).toLocaleDateString() : 'Not submitted'}</span>
                        </div>
                        {tax.verifiedBy && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Verified By</span>
                            <span className="font-medium">{tax.verifiedBy?.name || 'N/A'}</span>
                          </div>
                        )}
                        {tax.verifiedDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Verified Date</span>
                            <span className="font-medium">{new Date(tax.verifiedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-4 bg-primary/5 p-4 rounded-lg">
                      <h3 className="font-semibold text-sm mb-3">Actions</h3>
                      <div className="space-y-2">
                        {tax.declarations && tax.declarations.some((dec: any) => dec.proofUrl) && (
                          <Button variant="outline" className="w-full gap-2" size="sm" onClick={() => {
                            const proofDec = tax.declarations.find((dec: any) => dec.proofUrl);
                            if (proofDec) handleViewDocument(proofDec.proofUrl, proofDec.section || 'Proof Document');
                          }}>
                            <Eye className="w-4 h-4" />
                            View Documents
                          </Button>
                        )}
                        {hasPermission('process_payroll') && tax.status === 'Verified' && (
                          <Button variant="outline" className="w-full gap-2" size="sm" onClick={() => handleDownload('Form 16', `/api/tax/form16/download/${taxId}`)}>
                            <Download className="w-4 h-4" />
                            Download Form 16
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/tax/declarations">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Tax Declarations</p>
                    <p className="text-xs text-muted-foreground">Submit investments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tax/regime-comparison">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
            </Card>
          </Link>

          <Link href="/tax/form16">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
            </Card>
          </Link>

          {hasPermission('process_payroll') && (
            <Link href="/tax/form24q">
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
              </Card>
            </Link>
          )}

          <Link href="/tax/proof-uploads">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
            </Card>
          </Link>
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
                    <Button size="sm" variant="outline" onClick={() => handleViewDocument(doc.link, doc.name)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(doc.name, doc.link)}>
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
