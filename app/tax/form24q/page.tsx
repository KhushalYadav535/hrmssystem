'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Upload, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';

interface Form24QData {
  _id?: string;
  financialYear: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  status: 'Draft' | 'Generated' | 'Uploaded' | 'Acknowledged';
  generatedDate?: string;
  uploadedDate?: string;
  tracesAcknowledgmentNumber?: string;
  totalTdsAmount?: number;
  totalTdsDeposited?: number;
  totalChallans?: number;
  employeeTdsDetails?: any[];
  validated?: boolean;
  validationErrors?: string[];
}

export default function Form24QPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q4');
  const [selectedYear, setSelectedYear] = useState('2025-26');
  const [form24QData, setForm24QData] = useState<Form24QData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  if (!isAuthenticated || !hasPermission('process_payroll')) {
    redirect('/dashboard');
  }

  useEffect(() => {
    loadForm24Q();
  }, [selectedYear, selectedQuarter]);

  const loadForm24Q = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getForm24Qs({
        financialYear: selectedYear,
        quarter: selectedQuarter,
      });

      if (response.success && response.data && response.data.length > 0) {
        setForm24QData(response.data[0]);
      } else {
        setForm24QData({
          financialYear: selectedYear,
          quarter: selectedQuarter,
          status: 'Draft',
        });
      }
    } catch (error: any) {
      console.error('Failed to load Form 24Q:', error);
      setForm24QData({
        financialYear: selectedYear,
        quarter: selectedQuarter,
        status: 'Draft',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      toast.info('Generating Form 24Q... This may take a few minutes.');

      const response = await apiService.generateForm24Q({
        financialYear: selectedYear,
        quarter: selectedQuarter,
      });

      if (response.success) {
        setForm24QData(response.data?.form24Q || response.data);
        toast.success('Form 24Q generated successfully');
        await loadForm24Q();
      } else {
        throw new Error(response.message || 'Failed to generate Form 24Q');
      }
    } catch (error: any) {
      console.error('Form 24Q generation error:', error);
      toast.error(error.message || 'Failed to generate Form 24Q');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidate = async () => {
    if (!form24QData?._id) {
      toast.error('Please generate Form 24Q first');
      return;
    }

    try {
      setIsValidating(true);
      toast.info('Validating Form 24Q using FVU...');

      const response = await apiService.validateForm24Q(form24QData._id);

      if (response.success) {
        setValidationResult(response.data);
        if (response.data.valid) {
          toast.success('Form 24Q validation passed');
        } else {
          toast.warning(`Validation failed: ${response.data.errors?.length || 0} errors found`);
        }
      } else {
        throw new Error(response.message || 'Validation failed');
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      toast.error(error.message || 'Failed to validate Form 24Q');
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpload = async () => {
    if (!form24QData?._id) {
      toast.error('Please generate Form 24Q first');
      return;
    }

    if (!validationResult?.valid) {
      toast.error('Please validate Form 24Q before uploading');
      return;
    }

    try {
      setIsUploading(true);
      toast.info('Uploading Form 24Q to TRACES portal...');

      const response = await apiService.uploadForm24Q(form24QData._id);

      if (response.success) {
        setForm24QData(prev => ({
          ...prev!,
          status: 'Uploaded',
          uploadedDate: new Date().toISOString(),
          tracesAcknowledgmentNumber: response.data?.uploadResult?.acknowledgmentNumber,
        }));
        toast.success('Form 24Q uploaded successfully to TRACES');
        await loadForm24Q();
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload Form 24Q');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (type: 'json' | 'xml' | 'pdf') => {
    if (!form24QData?._id) {
      toast.error('Please generate Form 24Q first');
      return;
    }

    try {
      if (type === 'json') {
        // Download JSON file
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tax/form24q/${form24QData._id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Form24Q_${selectedYear}_${selectedQuarter}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast.success('Form 24Q JSON downloaded');
        }
      } else {
        toast.info(`${type.toUpperCase()} download not yet implemented`);
      }
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const currentData = form24QData || {
    financialYear: selectedYear,
    quarter: selectedQuarter,
    status: 'Draft' as const,
  };

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
                {Array.from({ length: 3 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return `${year - 1}-${year.toString().slice(2)}`;
                }).map((fy) => (
                  <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedQuarter} onValueChange={(value: 'Q1' | 'Q2' | 'Q3' | 'Q4') => setSelectedQuarter(value)}>
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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Status Card */}
            <Card className={currentData.status === 'Acknowledged' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : currentData.status === 'Uploaded' ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentData.status === 'Acknowledged' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : currentData.status === 'Uploaded' ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : currentData.status === 'Generated' ? (
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-semibold">
                        Form 24Q - {selectedYear} {selectedQuarter} - {currentData.status}
                      </p>
                      {currentData.generatedDate && (
                        <p className="text-sm text-muted-foreground">
                          Generated on: {formatDateDDMMYYYY(currentData.generatedDate)}
                        </p>
                      )}
                      {currentData.tracesAcknowledgmentNumber && (
                        <p className="text-sm text-muted-foreground">
                          Acknowledgment: {currentData.tracesAcknowledgmentNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={
                    currentData.status === 'Acknowledged' ? 'bg-green-600' :
                    currentData.status === 'Uploaded' ? 'bg-blue-600' :
                    currentData.status === 'Generated' ? 'bg-blue-600' :
                    'bg-gray-600'
                  }>
                    {currentData.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            {currentData.status !== 'Draft' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Employees</p>
                      <p className="text-2xl font-bold">{currentData.employeeTdsDetails?.length?.toLocaleString() || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Total TDS</p>
                      <p className="text-2xl font-bold">₹{currentData.totalTdsAmount?.toLocaleString() || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Validation Status</p>
                      <p className="text-2xl font-bold">
                        {validationResult?.valid ? (
                          <span className="text-green-600">✓ Valid</span>
                        ) : validationResult ? (
                          <span className="text-red-600">✗ Invalid</span>
                        ) : (
                          <span className="text-yellow-600">Pending</span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Form 24Q Actions</CardTitle>
                <CardDescription>Generate, validate, and upload Form 24Q to TRACES</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 flex-wrap">
                  {currentData.status === 'Draft' && (
                    <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Generate Form 24Q
                        </>
                      )}
                    </Button>
                  )}
                  {currentData.status === 'Generated' && (
                    <>
                      <Button onClick={handleValidate} disabled={isValidating} variant="outline" className="gap-2">
                        {isValidating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Validate (FVU)
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={handleUpload} 
                        disabled={isUploading || !validationResult?.valid} 
                        className="gap-2"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload to TRACES
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  {currentData.status !== 'Draft' && (
                    <>
                      <Button onClick={() => handleDownload('json')} variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download JSON
                      </Button>
                    </>
                  )}
                </div>
                {validationResult && !validationResult.valid && validationResult.errors && validationResult.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">Validation Errors:</p>
                    <ul className="text-xs text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                      {validationResult.errors.slice(0, 5).map((error: string, idx: number) => (
                        <li key={idx}>{error}</li>
                      ))}
                      {validationResult.errors.length > 5 && (
                        <li>... and {validationResult.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form 24Q Details */}
            {currentData.status !== 'Draft' && (
              <Tabs defaultValue="summary" className="w-full">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="employees">Employee Details</TabsTrigger>
                  <TabsTrigger value="validation">Validation Report</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Form 24Q Summary</CardTitle>
                      <CardDescription>Quarterly TDS return summary</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Financial Year</p>
                          <p className="font-semibold">{currentData.financialYear}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Quarter</p>
                          <p className="font-semibold">{currentData.quarter}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total TDS Amount</p>
                          <p className="font-semibold">₹{currentData.totalTdsAmount?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total TDS Deposited</p>
                          <p className="font-semibold">₹{currentData.totalTdsDeposited?.toLocaleString() || 0}</p>
                        </div>
                        {currentData.tracesAcknowledgmentNumber && (
                          <div>
                            <p className="text-sm text-muted-foreground">TRACES Acknowledgment</p>
                            <p className="font-semibold">{currentData.tracesAcknowledgmentNumber}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="employees" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Employee TDS Details</CardTitle>
                      <CardDescription>Employee-wise TDS breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Employee details: {currentData.employeeTdsDetails?.length || 0} records</p>
                        <p className="text-xs mt-2">Total employees: {currentData.employeeTdsDetails?.length?.toLocaleString() || 0}</p>
                        <Button variant="outline" className="mt-4" onClick={() => handleDownload('json')}>
                          <Download className="w-4 h-4 mr-2" />
                          Download Complete Form 24Q
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
                      {validationResult ? (
                        validationResult.valid ? (
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
                                <span className="font-medium">{currentData.employeeTdsDetails?.length?.toLocaleString() || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Errors</span>
                                <span className="font-medium text-green-600">0</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">FVU Available</span>
                                <span className="font-medium">{validationResult.fvuAvailable ? 'Yes' : 'No (Basic validation)'}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <p className="font-semibold text-red-900 dark:text-red-100">Validation Failed</p>
                              </div>
                              <p className="text-sm text-red-800 dark:text-red-200 mt-2">
                                Form 24Q validation failed. Please fix errors before uploading.
                              </p>
                            </div>
                            {validationResult.errors && validationResult.errors.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-semibold">Errors:</p>
                                <ul className="text-xs list-disc list-inside space-y-1">
                                  {validationResult.errors.map((error: string, idx: number) => (
                                    <li key={idx} className="text-red-700 dark:text-red-300">{error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                          <p>File not yet validated</p>
                          <Button onClick={handleValidate} disabled={isValidating} className="mt-4">
                            {isValidating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Validating...
                              </>
                            ) : (
                              'Run Validation'
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
