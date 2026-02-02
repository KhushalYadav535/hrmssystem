'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Form24QPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [selectedQuarter, setSelectedQuarter] = useState('Q4');
  const [selectedYear, setSelectedYear] = useState('2025-26');

  if (!isAuthenticated || !hasPermission('process_payroll')) {
    redirect('/dashboard');
  }

  // Mock Form 24Q data
  const form24QData = {
    'Q4': {
      status: 'Generated',
      generatedDate: '2026-04-25',
      validated: true,
      uploaded: false,
      acknowledgment: null,
      employees: 40000,
      totalTDS: 129875200,
      challans: [
        { bsrCode: '0012345', date: '2026-04-07', amount: 32468800 },
        { bsrCode: '0012346', date: '2026-05-07', amount: 32468800 },
        { bsrCode: '0012347', date: '2026-06-07', amount: 32468800 },
        { bsrCode: '0012348', date: '2026-07-07', amount: 32468800 },
      ],
    },
    'Q3': {
      status: 'Filed',
      generatedDate: '2026-01-25',
      validated: true,
      uploaded: true,
      acknowledgment: 'ACK-2026-Q3-123456',
      employees: 40000,
      totalTDS: 129875200,
    },
  };

  const handleGenerate = () => {
    toast.success('Generating Form 24Q... This may take a few minutes.');
  };

  const handleValidate = () => {
    toast.success('Validating Form 24Q using FVU...');
  };

  const handleUpload = () => {
    toast.success('Uploading Form 24Q to TRACES portal...');
  };

  const handleDownload = (type: 'json' | 'xml' | 'pdf') => {
    toast.success(`Downloading Form 24Q (${type.toUpperCase()})...`);
  };

  const currentData = form24QData[selectedQuarter as keyof typeof form24QData];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Form 24Q - Quarterly TDS Return</h1>
            <p className="text-muted-foreground mt-2">Generate and file quarterly TDS returns to TRACES</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-26">2025-26</SelectItem>
                <SelectItem value="2024-25">2024-25</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Card */}
        <Card className={currentData.status === 'Filed' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-blue-200 bg-blue-50 dark:bg-blue-950/20'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentData.status === 'Filed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
                <div>
                  <p className="font-semibold">
                    Form 24Q - {selectedYear} {selectedQuarter} - {currentData.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Generated on: {new Date(currentData.generatedDate).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  {currentData.acknowledgment && (
                    <p className="text-sm text-muted-foreground">
                      Acknowledgment: {currentData.acknowledgment}
                    </p>
                  )}
                </div>
              </div>
              <Badge className={currentData.status === 'Filed' ? 'bg-green-600' : 'bg-blue-600'}>
                {currentData.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{currentData.employees.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total TDS</p>
                <p className="text-2xl font-bold">₹{currentData.totalTDS.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Validation Status</p>
                <p className="text-2xl font-bold">
                  {currentData.validated ? (
                    <span className="text-green-600">✓ Valid</span>
                  ) : (
                    <span className="text-yellow-600">Pending</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Form 24Q Actions</CardTitle>
            <CardDescription>Generate, validate, and upload Form 24Q to TRACES</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {currentData.status === 'Generated' && (
                <>
                  <Button onClick={handleValidate} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Validate (FVU)
                  </Button>
                  <Button onClick={handleUpload} className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload to TRACES
                  </Button>
                </>
              )}
              {currentData.status !== 'Generated' && (
                <Button onClick={handleGenerate} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Generate Form 24Q
                </Button>
              )}
              <Button onClick={() => handleDownload('json')} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download JSON
              </Button>
              <Button onClick={() => handleDownload('xml')} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download XML
              </Button>
              <Button onClick={() => handleDownload('pdf')} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form 24Q Details */}
        <Tabs defaultValue="annexure1" className="w-full">
          <TabsList>
            <TabsTrigger value="annexure1">Annexure I (Challans)</TabsTrigger>
            <TabsTrigger value="annexure2">Annexure II (Employees)</TabsTrigger>
            <TabsTrigger value="validation">Validation Report</TabsTrigger>
          </TabsList>

          <TabsContent value="annexure1" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Annexure I - Challan Details</CardTitle>
                <CardDescription>BSR code, payment dates, and amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentData.challans ? (
                    currentData.challans.map((challan, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">BSR Code</p>
                            <p className="font-semibold">{challan.bsrCode}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Payment Date</p>
                            <p className="font-semibold">{new Date(challan.date).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="font-semibold">₹{challan.amount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Challan details not available</p>
                    </div>
                  )}
                  {currentData.challans && (
                    <div className="p-4 bg-primary/10 rounded-lg font-bold">
                      <div className="flex justify-between">
                        <span>Total TDS</span>
                        <span>₹{currentData.totalTDS.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="annexure2" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Annexure II - Employee TDS Details</CardTitle>
                <CardDescription>Employee-wise salary, deductions, and TDS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Employee details will be shown here</p>
                  <p className="text-xs mt-2">Total employees: {currentData.employees.toLocaleString()}</p>
                  <Button variant="outline" className="mt-4" onClick={() => handleDownload('pdf')}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Complete Annexure II
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>FVU Validation Report</CardTitle>
                <CardDescription>File Validation Utility validation results</CardDescription>
              </CardHeader>
              <CardContent>
                {currentData.validated ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="font-semibold text-green-900 dark:text-green-100">Validation Successful</p>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-2">
                        Form 24Q file has been validated successfully. No errors found. Ready for upload to TRACES.
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Records</span>
                        <span className="font-medium">{currentData.employees.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Errors</span>
                        <span className="font-medium text-green-600">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Warnings</span>
                        <span className="font-medium text-yellow-600">0</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <p>File not yet validated</p>
                    <Button onClick={handleValidate} className="mt-4">
                      Run Validation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
