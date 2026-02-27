'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Upload, CheckCircle2, AlertCircle, Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';

interface ESICData {
  status: 'Not Generated' | 'Generated' | 'Uploaded';
  generatedDate?: string;
  uploaded: boolean;
  returnNumber?: string;
  acknowledgmentNumber?: string;
  eligibleEmployees?: number;
  totalContribution?: number;
  employeeContribution?: number;
  employerContribution?: number;
  ipNumber?: string;
  fileName?: string;
  fileContent?: string;
  paymentStatus?: {
    paymentStatus?: string;
    paymentDate?: string;
    challanNumber?: string;
    amount?: number;
  };
}

export default function ESICPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [esicData, setEsicData] = useState<ESICData>({
    status: 'Not Generated',
    uploaded: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');

  if (!isAuthenticated || !hasPermission('process_payroll')) {
    redirect('/dashboard');
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  useEffect(() => {
    setEsicData({
      status: 'Not Generated',
      uploaded: false,
    });
    setFileContent('');
  }, [selectedMonth, selectedYear]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      toast.info('Generating ESIC return file...');

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl.replace(/\/api$/, '') : baseUrl;

      const response = await fetch(
        `${apiUrl}/api/payroll/esic/generate?month=${selectedMonth}&year=${selectedYear}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate ESIC file' }));
        throw new Error(errorData.message || 'Failed to generate ESIC file');
      }

      const content = await response.text();
      setFileContent(content);

      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        const headerParts = lines[0].split('|');
        const recordCount = parseInt(headerParts[3]) || 0;
        const totalWages = parseFloat(headerParts[4]) || 0;
        const totalEmployeeContribution = parseFloat(headerParts[5]) || 0;
        const totalEmployerContribution = parseFloat(headerParts[6]) || 0;
        const totalContribution = parseFloat(headerParts[7]) || 0;

        setEsicData({
          status: 'Generated',
          generatedDate: new Date().toISOString(),
          uploaded: false,
          eligibleEmployees: recordCount,
          totalContribution,
          employeeContribution: totalEmployeeContribution,
          employerContribution: totalEmployerContribution,
          ipNumber: headerParts[0],
          fileName: `ESIC_${selectedMonth}_${selectedYear}_${new Date().toISOString().slice(0, 10)}.txt`,
          fileContent: content,
        });

        toast.success('ESIC return file generated successfully');
      }
    } catch (error: any) {
      console.error('ESIC generation error:', error);
      toast.error(error.message || 'Failed to generate ESIC file');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = async () => {
    if (!fileContent || !esicData.fileName) {
      toast.error('Please generate ESIC file first');
      return;
    }

    try {
      setIsUploading(true);
      toast.info('Uploading ESIC return to portal...');

      const response = await apiService.uploadESICFile(selectedMonth, parseInt(selectedYear), fileContent, esicData.fileName);

      if (response.success) {
        setEsicData(prev => ({
          ...prev,
          status: 'Uploaded',
          uploaded: true,
          returnNumber: (response.data as any)?.returnNumber,
          acknowledgmentNumber: (response.data as any)?.acknowledgmentNumber,
        }));

        toast.success('ESIC return uploaded successfully');
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('ESIC upload error:', error);
      toast.error(error.message || 'Failed to upload ESIC return');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!fileContent) {
      toast.error('Please generate ESIC file first');
      return;
    }

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = esicData.fileName || `ESIC_${selectedMonth}_${selectedYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('ESIC file downloaded');
  };

  const handleCheckPaymentStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getESICPaymentStatus(selectedMonth, parseInt(selectedYear));

      if (response.success && response.data) {
        setEsicData(prev => ({
          ...prev,
          paymentStatus: response.data as any,
        }));

        toast.success('Payment status retrieved');
      } else {
        toast.warning((response.data as any)?.message || 'Payment status unavailable');
      }
    } catch (error: any) {
      console.error('Payment status error:', error);
      toast.error(error.message || 'Failed to get payment status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ESIC Monthly Return</h1>
            <p className="text-muted-foreground mt-2">Generate and upload ESIC monthly contribution return</p>
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
        <Card className={esicData.status === 'Uploaded' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : esicData.status === 'Generated' ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {esicData.uploaded ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : esicData.status === 'Generated' ? (
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-semibold">
                    ESIC Return for {selectedMonth} {selectedYear} - {esicData.status}
                  </p>
                  {esicData.generatedDate && (
                    <p className="text-sm text-muted-foreground">
                      Generated on: {new Date(esicData.generatedDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  {esicData.returnNumber && (
                    <p className="text-sm text-muted-foreground">
                      Return Number: {esicData.returnNumber}
                    </p>
                  )}
                </div>
              </div>
              <Badge className={esicData.uploaded ? 'bg-green-600' : esicData.status === 'Generated' ? 'bg-blue-600' : 'bg-gray-600'}>
                {esicData.uploaded ? 'Uploaded' : esicData.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {esicData.status !== 'Not Generated' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Eligible Employees</p>
                    <p className="text-2xl font-bold">{esicData.eligibleEmployees?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Gross ≤ ₹21,000</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Contribution</p>
                  <p className="text-2xl font-bold">₹{esicData.totalContribution?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Employee + Employer</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Employee (0.75%)</p>
                  <p className="text-2xl font-bold">₹{esicData.employeeContribution?.toLocaleString() || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Employer (3.25%)</p>
                  <p className="text-2xl font-bold">₹{esicData.employerContribution?.toLocaleString() || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        {(currentUser?.role === 'Payroll Administrator' || currentUser?.role === 'Super Admin') && (
          <Card>
            <CardHeader>
              <CardTitle>ESIC Return Actions</CardTitle>
              <CardDescription>Generate and upload ESIC monthly return file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap">
                {esicData.status === 'Not Generated' && (
                  <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Generate ESIC Return
                      </>
                    )}
                  </Button>
                )}
                {esicData.status === 'Generated' && (
                  <>
                    <Button onClick={handleUpload} disabled={isUploading} className="gap-2">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload to ESIC Portal
                        </>
                      )}
                    </Button>
                    <Button onClick={handleDownload} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download Return File
                    </Button>
                  </>
                )}
                {esicData.status === 'Uploaded' && (
                  <>
                    <Button onClick={handleCheckPaymentStatus} disabled={isLoading} variant="outline" className="gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Check Payment Status
                        </>
                      )}
                    </Button>
                    <Button onClick={handleDownload} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download Return File
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Status */}
        {esicData.paymentStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
              <CardDescription>ESIC contribution payment tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge className={esicData.paymentStatus.paymentStatus === 'Paid' ? 'bg-green-600' : 'bg-yellow-600'}>
                    {esicData.paymentStatus.paymentStatus || 'Pending'}
                  </Badge>
                </div>
                {esicData.paymentStatus.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Date</span>
                    <span className="font-medium">{new Date(esicData.paymentStatus.paymentDate).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
                {esicData.paymentStatus.challanNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Challan Number</span>
                    <span className="font-medium">{esicData.paymentStatus.challanNumber}</span>
                  </div>
                )}
                {esicData.paymentStatus.amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-medium">₹{esicData.paymentStatus.amount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {esicData.status !== 'Not Generated' && (
          <Card>
            <CardHeader>
              <CardTitle>ESIC Return Summary</CardTitle>
              <CardDescription>Monthly contribution details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">IP Number</p>
                  <p className="font-semibold">{esicData.ipNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Month</p>
                  <p className="font-semibold">{selectedMonth} {selectedYear}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employee Contribution (0.75%)</p>
                  <p className="font-semibold">₹{esicData.employeeContribution?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employer Contribution (3.25%)</p>
                  <p className="font-semibold">₹{esicData.employerContribution?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
