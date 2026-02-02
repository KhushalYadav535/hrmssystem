'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Upload, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function ESICPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState('2026');

  if (!isAuthenticated || !hasPermission('process_payroll')) {
    redirect('/dashboard');
  }

  // Mock ESIC data
  const esicData = {
    status: 'Generated',
    generatedDate: '2026-01-25',
    uploaded: false,
    acknowledgment: null,
    eligibleEmployees: 25000,
    totalContribution: 21000000,
    employeeContribution: 1575000,
    employerContribution: 19425000,
    ipNumber: 'CHEN123456789',
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleGenerate = () => {
    toast.success('Generating ESIC return file...');
  };

  const handleUpload = () => {
    toast.success('Uploading ESIC return to portal...');
  };

  const handleDownload = () => {
    toast.success('Downloading ESIC return file...');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ESIC Return Filing</h1>
            <p className="text-muted-foreground mt-2">Generate and upload monthly ESIC return</p>
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
        <Card className={esicData.status === 'Generated' ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20' : 'border-green-200 bg-green-50 dark:bg-green-950/20'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {esicData.uploaded ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
                <div>
                  <p className="font-semibold">
                    ESIC Return for {selectedMonth} {selectedYear} - {esicData.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Generated on: {new Date(esicData.generatedDate).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  {esicData.acknowledgment && (
                    <p className="text-sm text-muted-foreground">
                      Acknowledgment: {esicData.acknowledgment}
                    </p>
                  )}
                </div>
              </div>
              <Badge className={esicData.uploaded ? 'bg-green-600' : 'bg-blue-600'}>
                {esicData.uploaded ? 'Uploaded' : esicData.status}
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
                  <p className="text-sm text-muted-foreground">Eligible Employees</p>
                  <p className="text-2xl font-bold">{esicData.eligibleEmployees.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Salary &lt; ₹21,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Employee Contribution</p>
                <p className="text-2xl font-bold">₹{esicData.employeeContribution.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">0.75% of salary</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Employer Contribution</p>
                <p className="text-2xl font-bold">₹{esicData.employerContribution.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">3.25% of salary</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Contribution</p>
                <p className="text-2xl font-bold">₹{esicData.totalContribution.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">4% of salary</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>ESIC Return Actions</CardTitle>
            <CardDescription>Generate and upload ESIC return file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {esicData.status !== 'Generated' && (
                <Button onClick={handleGenerate} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Generate Return
                </Button>
              )}
              {esicData.status === 'Generated' && (
                <>
                  <Button onClick={handleUpload} className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload to ESIC Portal
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

        {/* ESIC Details */}
        <Card>
          <CardHeader>
            <CardTitle>ESIC Return Details</CardTitle>
            <CardDescription>Monthly contribution details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">IP Number</p>
                <p className="font-semibold">{esicData.ipNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Month</p>
                <p className="font-semibold">{selectedMonth} {selectedYear}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contribution Rate (Employee)</p>
                <p className="font-semibold">0.75%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contribution Rate (Employer)</p>
                <p className="font-semibold">3.25%</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Note:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>ESIC applies to employees with gross salary up to ₹21,000 per month</li>
                <li>Total contribution is 4% (0.75% employee + 3.25% employer)</li>
                <li>Return must be filed by 15th of following month</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
