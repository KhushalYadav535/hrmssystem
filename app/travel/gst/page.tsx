'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, Download, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function GSTCompliancePage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('January 2026');

  if (!isAuthenticated) {
    redirect('/login');
  }

  // Mock GST data
  const gstData = {
    totalClaims: 150,
    totalGSTAmount: 450000,
    eligibleITC: 380000,
    ineligibleITC: 70000,
    gstDetails: [
      {
        id: '1',
        claimId: 'TC-001',
        vendorName: 'Hotel Grand',
        gstin: '29ABCDE1234F1Z5',
        amount: 50000,
        cgst: 4500,
        sgst: 4500,
        igst: 0,
        hsnSac: '9963',
        eligible: true,
        category: 'Accommodation',
      },
      {
        id: '2',
        claimId: 'TC-002',
        vendorName: 'Airline Services',
        gstin: '27FGHIJ5678G2Z6',
        amount: 30000,
        cgst: 0,
        sgst: 0,
        igst: 2700,
        hsnSac: '9965',
        eligible: true,
        category: 'Travel',
      },
      {
        id: '3',
        claimId: 'TC-003',
        vendorName: 'Restaurant ABC',
        gstin: '19KLMNO9012H3Z7',
        amount: 20000,
        cgst: 1800,
        sgst: 1800,
        igst: 0,
        hsnSac: '9963',
        eligible: false,
        category: 'Meals',
      },
    ],
  };

  const handleExportGSTR = () => {
    toast.success('Exporting GST input register...');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">GST Compliance Tracking</h1>
            <p className="text-muted-foreground mt-2">Track GST on travel expenses and input tax credit</p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="January 2026">January 2026</SelectItem>
              <SelectItem value="December 2025">December 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Claims</p>
                <p className="text-2xl font-bold">{gstData.totalClaims}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total GST</p>
                <p className="text-2xl font-bold">₹{gstData.totalGSTAmount.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Eligible ITC</p>
                <p className="text-2xl font-bold text-green-600">₹{gstData.eligibleITC.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Ineligible ITC</p>
                <p className="text-2xl font-bold text-red-600">₹{gstData.ineligibleITC.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GST Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>GST Input Register</CardTitle>
                <CardDescription>GST details from all travel expense claims</CardDescription>
              </div>
              {hasPermission('process_payroll') && (
                <Button onClick={handleExportGSTR} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export GSTR-2A
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gstData.gstDetails.map((item) => (
                <Card key={item.id} className={item.eligible ? 'border-green-500' : 'border-red-500'}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Receipt className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">{item.vendorName}</p>
                            <p className="text-sm text-muted-foreground">
                              Claim: {item.claimId} • {item.category}
                            </p>
                          </div>
                          <Badge className={item.eligible ? 'bg-green-600' : 'bg-red-600'}>
                            {item.eligible ? 'Eligible ITC' : 'Ineligible ITC'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">GSTIN</p>
                            <p className="font-mono font-semibold">{item.gstin}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">HSN/SAC</p>
                            <p className="font-semibold">{item.hsnSac}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-semibold">₹{item.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">GST</p>
                            <p className="font-semibold">
                              {item.cgst > 0 && `CGST: ₹${item.cgst.toLocaleString()}`}
                              {item.sgst > 0 && `SGST: ₹${item.sgst.toLocaleString()}`}
                              {item.igst > 0 && `IGST: ₹${item.igst.toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                        {!item.eligible && (
                          <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded text-xs text-red-800 dark:text-red-200">
                            Ineligible for ITC: {item.category === 'Meals' ? 'Food expenses are not eligible for ITC' : 'Other reason'}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ITC Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Input Tax Credit Summary</CardTitle>
            <CardDescription>ITC eligible for claiming in GSTR-2A</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total CGST</p>
                  <p className="text-2xl font-bold">₹{(gstData.eligibleITC * 0.5).toLocaleString()}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total SGST</p>
                  <p className="text-2xl font-bold">₹{(gstData.eligibleITC * 0.5).toLocaleString()}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total IGST</p>
                  <p className="text-2xl font-bold">₹0</p>
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">Total Eligible ITC</p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Can be claimed in GSTR-2A reconciliation
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">₹{gstData.eligibleITC.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
