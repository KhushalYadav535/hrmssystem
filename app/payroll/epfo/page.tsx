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
import { FileText, Download, Upload, CheckCircle2, AlertCircle, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function EPFOPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState('2026');

  if (!isAuthenticated || !hasPermission('process_payroll')) {
    redirect('/dashboard');
  }

  // Mock ECR data
  const ecrData = {
    status: 'Generated',
    generatedDate: '2026-01-25',
    uploaded: false,
    acknowledgment: null,
    totalEmployees: 40000,
    totalContribution: 72000000,
    establishmentId: 'CHEN123456789',
    uanValidated: 39500,
    uanPending: 500,
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleGenerate = () => {
    toast.success('Generating ECR file... This may take a few minutes.');
  };

  const handleValidate = () => {
    toast.success('Validating UAN numbers...');
  };

  const handleUpload = () => {
    toast.success('Uploading ECR file to EPFO portal...');
  };

  const handleDownload = () => {
    toast.success('Downloading ECR file...');
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
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Card */}
        <Card className={ecrData.status === 'Generated' ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20' : 'border-green-200 bg-green-50 dark:bg-green-950/20'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {ecrData.uploaded ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
                <div>
                  <p className="font-semibold">
                    ECR for {selectedMonth} {selectedYear} - {ecrData.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Generated on: {new Date(ecrData.generatedDate).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  {ecrData.acknowledgment && (
                    <p className="text-sm text-muted-foreground">
                      Acknowledgment: {ecrData.acknowledgment}
                    </p>
                  )}
                </div>
              </div>
              <Badge className={ecrData.uploaded ? 'bg-green-600' : 'bg-blue-600'}>
                {ecrData.uploaded ? 'Uploaded' : ecrData.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{ecrData.totalEmployees.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Contribution</p>
                <p className="text-2xl font-bold">₹{ecrData.totalContribution.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Employee + Employer</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">UAN Validated</p>
                <p className="text-2xl font-bold text-green-600">{ecrData.uanValidated.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Verified UANs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">UAN Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{ecrData.uanPending.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>ECR Actions</CardTitle>
            <CardDescription>Generate, validate, and upload ECR file to EPFO portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {ecrData.status !== 'Generated' && (
                <Button onClick={handleGenerate} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Generate ECR
                </Button>
              )}
              {ecrData.status === 'Generated' && (
                <>
                  <Button onClick={handleValidate} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Validate UAN
                  </Button>
                  <Button onClick={handleUpload} className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload to EPFO
                  </Button>
                </>
              )}
              {ecrData.status === 'Generated' && (
                <Button onClick={handleDownload} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download ECR File
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ECR Details */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="employees">Employee Details</TabsTrigger>
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
                    <p className="font-semibold">{ecrData.establishmentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Month</p>
                    <p className="font-semibold">{selectedMonth} {selectedYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employee Contribution (12%)</p>
                    <p className="font-semibold">₹{(ecrData.totalContribution / 2).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employer Contribution (12%)</p>
                    <p className="font-semibold">₹{(ecrData.totalContribution / 2).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pension Fund (8.33%)</p>
                    <p className="font-semibold">₹{(ecrData.totalContribution * 0.0833).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">EPF Fund (3.67%)</p>
                    <p className="font-semibold">₹{(ecrData.totalContribution * 0.0367).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Employee Contribution Details</CardTitle>
                <CardDescription>Member-wise contribution breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Employee details will be shown here</p>
                  <p className="text-xs mt-2">Total employees: {ecrData.totalEmployees.toLocaleString()}</p>
                  <Button variant="outline" className="mt-4" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Complete ECR
                  </Button>
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
                {ecrData.uanPending > 0 ? (
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
                        <span className="font-medium text-green-600">{ecrData.uanValidated.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pending UANs</span>
                        <span className="font-medium text-yellow-600">{ecrData.uanPending.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button onClick={handleValidate} className="w-full">
                      Validate All UANs
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
      </div>
    </DashboardLayout>
  );
}
