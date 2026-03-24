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
import { FileText, Download, Upload, CheckCircle2, AlertCircle, RefreshCw, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';

interface ECRData {
  status: 'Not Generated' | 'Generated' | 'Uploaded';
  generatedDate?: string;
  uploaded: boolean;
  acknowledgment?: {
    acknowledgmentNumber?: string;
    challanNumber?: string;
    status?: string;
    date?: string;
  } | null;
  totalEmployees?: number;
  totalContribution?: number;
  totalEPF?: number;
  totalEPS?: number;
  totalEPFDiff?: number;
  establishmentId?: string;
  uanValidated?: number;
  uanPending?: number;
  fileName?: string;
  fileContent?: string;
}

export default function EPFOPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [ecrData, setEcrData] = useState<ECRData>({
    status: 'Not Generated',
    uploaded: false,
    acknowledgment: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');

  if (!isAuthenticated || !hasPermission('process_payroll')) {
    redirect('/dashboard');
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Load ECR status when month/year changes
  useEffect(() => {
    // In a real implementation, you might want to fetch ECR status from backend
    // For now, reset to Not Generated when month/year changes
    setEcrData({
      status: 'Not Generated',
      uploaded: false,
      acknowledgment: null,
    });
    setFileContent('');
  }, [selectedMonth, selectedYear]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      toast.info('Generating ECR file... This may take a few minutes.');

      // Generate ECR file - this will download the file
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl.replace(/\/api$/, '') : baseUrl;

      const response = await fetch(
        `${apiUrl}/api/payroll/ecr/generate?month=${selectedMonth}&year=${selectedYear}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate ECR file' }));
        throw new Error(errorData.message || 'Failed to generate ECR file');
      }

      // Get file content
      const content = await response.text();
      setFileContent(content);

      // Extract data from file content (first line is header)
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        const headerParts = lines[0].split('|');
        const recordCount = parseInt(headerParts[3]) || 0;
        const totalWages = parseFloat(headerParts[4]) || 0;
        const totalEPF = parseFloat(headerParts[5]) || 0;
        const totalEPS = parseFloat(headerParts[6]) || 0;
        const totalEPFDiff = parseFloat(headerParts[7]) || 0;

        setEcrData({
          status: 'Generated',
          generatedDate: new Date().toISOString(),
          uploaded: false,
          acknowledgment: null,
          totalEmployees: recordCount,
          totalContribution: totalEPF * 2, // Employee + Employer
          totalEPF,
          totalEPS,
          totalEPFDiff,
          establishmentId: headerParts[0],
          fileName: `ECR_${selectedMonth}_${selectedYear}_${new Date().toISOString().slice(0, 10)}.txt`,
          fileContent: content,
        });

        toast.success('ECR file generated successfully');
      }
    } catch (error: any) {
      console.error('ECR generation error:', error);
      toast.error(error.message || 'Failed to generate ECR file');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidate = async () => {
    try {
      setIsValidating(true);
      toast.info('Validating UAN numbers...');

      // Get all UANs from file content
      if (!fileContent) {
        toast.error('Please generate ECR file first');
        return;
      }

      const lines = fileContent.split('\n').filter(line => line.trim());
      const uans = lines.slice(1).map(line => line.split('|')[0]).filter(uan => uan);

      if (uans.length === 0) {
        toast.error('No UANs found in ECR file');
        return;
      }

      // Bulk validate UANs
      const response = await apiService.bulkValidateUANs(uans);

      if (response.success && response.data) {
        const validCount = (response.data as any).valid || 0;
        const invalidCount = (response.data as any).invalid || 0;

        setEcrData(prev => ({
          ...prev,
          uanValidated: validCount,
          uanPending: invalidCount,
        }));

        if (invalidCount === 0) {
          toast.success('All UANs validated successfully');
        } else {
          toast.warning(`${invalidCount} UANs failed validation. Please review.`);
        }
      }
    } catch (error: any) {
      console.error('UAN validation error:', error);
      toast.error(error.message || 'Failed to validate UANs');
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpload = async () => {
    if (!fileContent || !ecrData.fileName) {
      toast.error('Please generate ECR file first');
      return;
    }

    try {
      setIsUploading(true);
      toast.info('Uploading ECR file to EPFO portal...');

      const response = await apiService.uploadECRFile(selectedMonth, parseInt(selectedYear), fileContent, ecrData.fileName);

      if (response.success) {
        setEcrData(prev => ({
          ...prev,
          status: 'Uploaded',
          uploaded: true,
        }));

        toast.success('ECR file uploaded successfully to EPFO portal');
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('ECR upload error:', error);
      toast.error(error.message || 'Failed to upload ECR file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!fileContent) {
      toast.error('Please generate ECR file first');
      return;
    }

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ecrData.fileName || `ECR_${selectedMonth}_${selectedYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('ECR file downloaded');
  };

  const handleDownloadAcknowledgment = async () => {
    if (!ecrData.fileName) {
      toast.error('No ECR file found');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.downloadEPFOAcknowledgment(ecrData.fileName, selectedMonth, parseInt(selectedYear));

      if (response.success && response.data) {
        setEcrData(prev => ({
          ...prev,
          acknowledgment: response.data as any,
        }));

        toast.success('Acknowledgment downloaded successfully');
      } else {
        toast.warning((response.data as any)?.message || 'Acknowledgment not yet available');
      }
    } catch (error: any) {
      console.error('Acknowledgment download error:', error);
      toast.error(error.message || 'Failed to download acknowledgment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">EPFO ECR Filing</h1>
            <p className="text-muted-foreground mt-2">Generate and upload Electronic Challan-cum-Return (ECR) to EPFO portal</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Card */}
        <Card className={ecrData.status === 'Uploaded' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : ecrData.status === 'Generated' ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {ecrData.uploaded ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : ecrData.status === 'Generated' ? (
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-semibold">
                    ECR for {selectedMonth} {selectedYear} - {ecrData.status}
                  </p>
                  {ecrData.generatedDate && (
                    <p className="text-sm text-muted-foreground">
                      Generated on: {formatDateDDMMYYYY(ecrData.generatedDate)}
                    </p>
                  )}
                  {ecrData.acknowledgment?.acknowledgmentNumber && (
                    <p className="text-sm text-muted-foreground">
                      Acknowledgment: {ecrData.acknowledgment.acknowledgmentNumber}
                    </p>
                  )}
                </div>
              </div>
              <Badge className={ecrData.uploaded ? 'bg-green-600' : ecrData.status === 'Generated' ? 'bg-blue-600' : 'bg-gray-600'}>
                {ecrData.uploaded ? 'Uploaded' : ecrData.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {ecrData.status !== 'Not Generated' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold">{ecrData.totalEmployees?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Contribution</p>
                  <p className="text-2xl font-bold">₹{ecrData.totalContribution?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Employee + Employer</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">UAN Validated</p>
                  <p className="text-2xl font-bold text-green-600">{ecrData.uanValidated?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Verified UANs</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">UAN Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{ecrData.uanPending?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions - Only visible to authorized roles */}
        {(currentUser?.role === 'Payroll Administrator' || currentUser?.role === 'Super Admin') && (
          <Card>
            <CardHeader>
              <CardTitle>ECR Actions</CardTitle>
              <CardDescription>Generate, validate, and upload ECR file to EPFO portal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap">
                {ecrData.status === 'Not Generated' && (
                  <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Generate ECR
                      </>
                    )}
                  </Button>
                )}
                {ecrData.status === 'Generated' && (
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
                          Validate UAN
                        </>
                      )}
                    </Button>
                    <Button onClick={handleUpload} disabled={isUploading || !!(ecrData.uanPending && ecrData.uanPending > 0)} className="gap-2">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload to EPFO
                        </>
                      )}
                    </Button>
                    <Button onClick={handleDownload} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download ECR File
                    </Button>
                  </>
                )}
                {ecrData.status === 'Uploaded' && (
                  <>
                    <Button onClick={handleDownloadAcknowledgment} disabled={isLoading} variant="outline" className="gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download Acknowledgment
                        </>
                      )}
                    </Button>
                    <Button onClick={handleDownload} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download ECR File
                    </Button>
                  </>
                )}
              </div>
              {ecrData.uanPending && ecrData.uanPending > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ {ecrData.uanPending} UANs are pending validation. Please validate before uploading.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ECR Details */}
        {ecrData.status !== 'Not Generated' && (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="validation">UAN Validation</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>ECR Summary</CardTitle>
                  <CardDescription>Monthly contribution summary</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Establishment ID</p>
                      <p className="font-semibold">{ecrData.establishmentId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Month</p>
                      <p className="font-semibold">{selectedMonth} {selectedYear}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Employee Contribution (12%)</p>
                      <p className="font-semibold">₹{ecrData.totalEPF?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Employer Contribution (12%)</p>
                      <p className="font-semibold">₹{ecrData.totalEPF?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pension Fund (EPS - 8.33%)</p>
                      <p className="font-semibold">₹{ecrData.totalEPS?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">EPF Fund (3.67%)</p>
                      <p className="font-semibold">₹{ecrData.totalEPFDiff?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>UAN Validation Status</CardTitle>
                  <CardDescription>UAN validation results</CardDescription>
                </CardHeader>
                <CardContent>
                  {ecrData.uanPending && ecrData.uanPending > 0 ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                            {ecrData.uanPending} UANs require validation
                          </p>
                        </div>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2">
                          Some employee UANs are invalid or pending. Please verify and update before uploading.
                        </p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Validated UANs</span>
                          <span className="font-medium text-green-600">{ecrData.uanValidated?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pending UANs</span>
                          <span className="font-medium text-yellow-600">{ecrData.uanPending.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button onClick={handleValidate} disabled={isValidating} className="w-full">
                        {isValidating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          'Validate All UANs'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="font-semibold text-green-900 dark:text-green-100">All UANs Validated</p>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-2">
                        All employee UANs have been validated. ECR file is ready for upload.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
