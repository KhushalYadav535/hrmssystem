'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Upload, CheckCircle2, Building2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function BankFilePage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [fileFormat, setFileFormat] = useState<'neft' | 'rtgs' | 'internal'>('neft');

  if (!isAuthenticated || !hasPermission('process_payroll')) {
    redirect('/dashboard');
  }

  // Mock bank file data
  const bankFileData = {
    status: 'Generated',
    generatedDate: '2026-01-28',
    uploaded: false,
    totalAmount: 2040000000,
    totalEmployees: 40000,
    indianBankEmployees: 15000,
    otherBankEmployees: 25000,
    transactions: {
      neft: 25000,
      rtgs: 0,
      internal: 15000,
    },
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleGenerate = () => {
    toast.success(`Generating ${fileFormat.toUpperCase()} bank file...`);
  };

  const handleUpload = () => {
    toast.success('Uploading bank file to CBS...');
  };

  const handleDownload = () => {
    toast.success(`Downloading ${fileFormat.toUpperCase()} bank file...`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bank File Generation</h1>
            <p className="text-muted-foreground mt-2">Generate salary credit files for bank transfer</p>
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
        <Card className={bankFileData.status === 'Generated' ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20' : 'border-green-200 bg-green-50 dark:bg-green-950/20'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {bankFileData.uploaded ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
                <div>
                  <p className="font-semibold">
                    Bank File for {selectedMonth} {selectedYear} - {bankFileData.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Generated on: {new Date(bankFileData.generatedDate).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <Badge className={bankFileData.uploaded ? 'bg-green-600' : 'bg-blue-600'}>
                {bankFileData.uploaded ? 'Uploaded' : bankFileData.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">₹{bankFileData.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Net salary payable</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Indian Bank</p>
                  <p className="text-2xl font-bold">{bankFileData.indianBankEmployees.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Internal transfer</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Other Banks</p>
                  <p className="text-2xl font-bold">{bankFileData.otherBankEmployees.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">NEFT/RTGS</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{bankFileData.totalEmployees.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Salary credit</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File Format Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select File Format</CardTitle>
            <CardDescription>Choose the bank transfer file format</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={fileFormat} onValueChange={(value: any) => setFileFormat(value)} className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neft" id="neft" />
                <Label htmlFor="neft" className="cursor-pointer">
                  <div>
                    <p className="font-semibold">NEFT</p>
                    <p className="text-xs text-muted-foreground">National Electronic Funds Transfer</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rtgs" id="rtgs" />
                <Label htmlFor="rtgs" className="cursor-pointer">
                  <div>
                    <p className="font-semibold">RTGS</p>
                    <p className="text-xs text-muted-foreground">Real Time Gross Settlement</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="internal" id="internal" />
                <Label htmlFor="internal" className="cursor-pointer">
                  <div>
                    <p className="font-semibold">Internal Transfer</p>
                    <p className="text-xs text-muted-foreground">Indian Bank accounts only</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Bank File Actions</CardTitle>
            <CardDescription>Generate and upload bank transfer file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {bankFileData.status !== 'Generated' && (
                <Button onClick={handleGenerate} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Generate {fileFormat.toUpperCase()} File
                </Button>
              )}
              {bankFileData.status === 'Generated' && (
                <>
                  <Button onClick={handleUpload} className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload to CBS
                  </Button>
                  <Button onClick={handleDownload} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download {fileFormat.toUpperCase()} File
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File Details */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>File Summary</CardTitle>
                <CardDescription>Bank file generation summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">File Format</p>
                    <p className="font-semibold">{fileFormat.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="font-semibold">{bankFileData.transactions[fileFormat].toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-semibold">₹{bankFileData.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credit Date</p>
                    <p className="font-semibold">Last working day of {selectedMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
                <CardDescription>Employee-wise transaction list</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Transaction details will be shown here</p>
                  <p className="text-xs mt-2">Total transactions: {bankFileData.transactions[fileFormat].toLocaleString()}</p>
                  <Button variant="outline" className="mt-4" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Complete File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Validation</CardTitle>
                <CardDescription>Bank account validation status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <p className="font-semibold text-green-900 dark:text-green-100">All Accounts Validated</p>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-2">
                    All employee bank accounts have been validated. File is ready for upload.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
