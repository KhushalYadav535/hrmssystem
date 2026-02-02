'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingDown, TrendingUp, Info, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TaxRegimeComparisonPage() {
  const { isAuthenticated } = useAuth();
  const [regime, setRegime] = useState<'old' | 'new'>('old');
  const [formData, setFormData] = useState({
    annualSalary: '',
    basicSalary: '',
    hra: '',
    otherAllowances: '',
    standardDeduction: '50000',
    hraExemption: '',
    ltaExemption: '',
    section80C: '',
    section80D: '',
    section80E: '',
    section80G: '',
    section80CCD: '',
    otherDeductions: '',
  });

  if (!isAuthenticated) {
    redirect('/login');
  }

  // Tax calculation functions
  const calculateOldRegimeTax = () => {
    const salary = parseFloat(formData.annualSalary) || 0;
    const standardDeduction = parseFloat(formData.standardDeduction) || 50000;
    const hraExemption = parseFloat(formData.hraExemption) || 0;
    const ltaExemption = parseFloat(formData.ltaExemption) || 0;
    const section80C = Math.min(parseFloat(formData.section80C) || 0, 150000);
    const section80D = parseFloat(formData.section80D) || 0;
    const section80E = parseFloat(formData.section80E) || 0;
    const section80G = parseFloat(formData.section80G) || 0;
    const section80CCD = Math.min(parseFloat(formData.section80CCD) || 0, 50000);
    const otherDeductions = parseFloat(formData.otherDeductions) || 0;

    const totalDeductions = standardDeduction + hraExemption + ltaExemption + section80C + section80D + 
                           section80E + section80G + section80CCD + otherDeductions;
    const taxableIncome = Math.max(0, salary - totalDeductions);

    let tax = 0;
    if (taxableIncome > 1500000) {
      tax = 187500 + (taxableIncome - 1500000) * 0.30;
    } else if (taxableIncome > 1250000) {
      tax = 125000 + (taxableIncome - 1250000) * 0.25;
    } else if (taxableIncome > 1000000) {
      tax = 75000 + (taxableIncome - 1000000) * 0.20;
    } else if (taxableIncome > 500000) {
      tax = 12500 + (taxableIncome - 500000) * 0.10;
    } else if (taxableIncome > 250000) {
      tax = (taxableIncome - 250000) * 0.05;
    }

    // Section 87A rebate
    if (taxableIncome <= 500000) {
      tax = Math.max(0, tax - 12500);
    }

    const cess = tax * 0.04;
    return {
      taxableIncome,
      tax,
      cess,
      totalTax: tax + cess,
      totalDeductions,
    };
  };

  const calculateNewRegimeTax = () => {
    const salary = parseFloat(formData.annualSalary) || 0;
    const standardDeduction = 50000; // Fixed in new regime

    const taxableIncome = Math.max(0, salary - standardDeduction);

    let tax = 0;
    if (taxableIncome > 1500000) {
      tax = 150000 + (taxableIncome - 1500000) * 0.30;
    } else if (taxableIncome > 1200000) {
      tax = 90000 + (taxableIncome - 1200000) * 0.20;
    } else if (taxableIncome > 900000) {
      tax = 45000 + (taxableIncome - 900000) * 0.15;
    } else if (taxableIncome > 600000) {
      tax = 15000 + (taxableIncome - 600000) * 0.10;
    } else if (taxableIncome > 300000) {
      tax = (taxableIncome - 300000) * 0.05;
    }

    // Section 87A rebate
    if (taxableIncome <= 700000) {
      tax = Math.max(0, tax - 25000);
    }

    const cess = tax * 0.04;
    return {
      taxableIncome,
      tax,
      cess,
      totalTax: tax + cess,
      totalDeductions: standardDeduction,
    };
  };

  const oldRegime = calculateOldRegimeTax();
  const newRegime = calculateNewRegimeTax();
  const savings = oldRegime.totalTax - newRegime.totalTax;
  const optimalRegime = savings > 0 ? 'new' : 'old';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRecommendation = () => {
    if (!formData.annualSalary) {
      toast.error('Please enter your annual salary');
      return;
    }
    toast.success(`Recommended regime: ${optimalRegime === 'old' ? 'Old Regime' : 'New Regime'}. You can save ₹${Math.abs(savings).toLocaleString()}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tax Regime Comparison</h1>
          <p className="text-muted-foreground mt-2">Compare old vs new tax regime and choose the optimal one</p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Tax Regime Selection</p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>You can choose tax regime once per financial year</li>
                  <li>Old regime allows all deductions (80C, 80D, HRA, LTA, etc.)</li>
                  <li>New regime has higher tax-free limit but limited deductions</li>
                  <li>Use this calculator to find which regime saves more tax</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Income & Deductions</CardTitle>
              <CardDescription>Enter your salary and investment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="annualSalary">Annual Salary <span className="text-red-500">*</span></Label>
                <Input
                  id="annualSalary"
                  type="number"
                  placeholder="0"
                  value={formData.annualSalary}
                  onChange={(e) => handleInputChange('annualSalary', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hraExemption">HRA Exemption</Label>
                <Input
                  id="hraExemption"
                  type="number"
                  placeholder="0"
                  value={formData.hraExemption}
                  onChange={(e) => handleInputChange('hraExemption', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ltaExemption">LTA Exemption</Label>
                <Input
                  id="ltaExemption"
                  type="number"
                  placeholder="0"
                  value={formData.ltaExemption}
                  onChange={(e) => handleInputChange('ltaExemption', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section80C">Section 80C (Max ₹1.5L)</Label>
                <Input
                  id="section80C"
                  type="number"
                  placeholder="0"
                  max="150000"
                  value={formData.section80C}
                  onChange={(e) => handleInputChange('section80C', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section80D">Section 80D (Health Insurance)</Label>
                <Input
                  id="section80D"
                  type="number"
                  placeholder="0"
                  value={formData.section80D}
                  onChange={(e) => handleInputChange('section80D', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section80CCD">Section 80CCD(1B) - NPS (Max ₹50K)</Label>
                <Input
                  id="section80CCD"
                  type="number"
                  placeholder="0"
                  max="50000"
                  value={formData.section80CCD}
                  onChange={(e) => handleInputChange('section80CCD', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherDeductions">Other Deductions</Label>
                <Input
                  id="otherDeductions"
                  type="number"
                  placeholder="0"
                  value={formData.otherDeductions}
                  onChange={(e) => handleInputChange('otherDeductions', e.target.value)}
                />
              </div>

              <Button onClick={handleRecommendation} className="w-full gap-2">
                <Calculator className="w-4 h-4" />
                Get Recommendation
              </Button>
            </CardContent>
          </Card>

          {/* Comparison Results */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tax Comparison</CardTitle>
              <CardDescription>Side-by-side comparison of both regimes</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="comparison" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="comparison">Comparison</TabsTrigger>
                  <TabsTrigger value="details">Detailed Breakdown</TabsTrigger>
                </TabsList>

                <TabsContent value="comparison" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Old Regime */}
                    <Card className={optimalRegime === 'old' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Old Regime</CardTitle>
                          {optimalRegime === 'old' && (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Taxable Income</span>
                            <span className="font-semibold">₹{oldRegime.taxableIncome.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span className="font-semibold">₹{oldRegime.tax.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Cess (4%)</span>
                            <span className="font-semibold">₹{oldRegime.cess.toLocaleString()}</span>
                          </div>
                          <div className="pt-2 border-t">
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total Tax</span>
                              <span className="text-primary">₹{oldRegime.totalTax.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Total Deductions</p>
                          <p className="text-sm font-semibold">₹{oldRegime.totalDeductions.toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* New Regime */}
                    <Card className={optimalRegime === 'new' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">New Regime</CardTitle>
                          {optimalRegime === 'new' && (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Taxable Income</span>
                            <span className="font-semibold">₹{newRegime.taxableIncome.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span className="font-semibold">₹{newRegime.tax.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Cess (4%)</span>
                            <span className="font-semibold">₹{newRegime.cess.toLocaleString()}</span>
                          </div>
                          <div className="pt-2 border-t">
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total Tax</span>
                              <span className="text-primary">₹{newRegime.totalTax.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Total Deductions</p>
                          <p className="text-sm font-semibold">₹{newRegime.totalDeductions.toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Savings Summary */}
                  <Card className={savings !== 0 ? (savings > 0 ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-950/20') : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Tax Savings</p>
                          <p className={`text-3xl font-bold mt-1 ${savings > 0 ? 'text-green-600' : savings < 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                            {savings > 0 ? (
                              <>
                                <TrendingDown className="inline w-6 h-6 mr-2" />
                                ₹{savings.toLocaleString()}
                              </>
                            ) : savings < 0 ? (
                              <>
                                <TrendingUp className="inline w-6 h-6 mr-2" />
                                ₹{Math.abs(savings).toLocaleString()} more
                              </>
                            ) : (
                              'No difference'
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {savings > 0 
                              ? 'New regime saves more tax' 
                              : savings < 0 
                              ? 'Old regime saves more tax'
                              : 'Both regimes have same tax liability'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={optimalRegime === 'old' ? 'bg-blue-600' : 'bg-green-600'} variant="default">
                            {optimalRegime === 'old' ? 'Choose Old Regime' : 'Choose New Regime'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Old Regime Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Standard Deduction</span>
                          <span>₹{parseFloat(formData.standardDeduction || '50000').toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>HRA Exemption</span>
                          <span>₹{(parseFloat(formData.hraExemption) || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>LTA Exemption</span>
                          <span>₹{(parseFloat(formData.ltaExemption) || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Section 80C</span>
                          <span>₹{Math.min(parseFloat(formData.section80C) || 0, 150000).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Section 80D</span>
                          <span>₹{(parseFloat(formData.section80D) || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Section 80CCD</span>
                          <span>₹{Math.min(parseFloat(formData.section80CCD) || 0, 50000).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Other Deductions</span>
                          <span>₹{(parseFloat(formData.otherDeductions) || 0).toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t font-semibold flex justify-between">
                          <span>Total Deductions</span>
                          <span>₹{oldRegime.totalDeductions.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">New Regime Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Standard Deduction</span>
                          <span>₹50,000</span>
                        </div>
                        <div className="pt-2 border-t font-semibold flex justify-between">
                          <span>Total Deductions</span>
                          <span>₹50,000</span>
                        </div>
                        <div className="pt-4 text-xs text-muted-foreground">
                          <p>New regime allows only standard deduction of ₹50,000</p>
                          <p className="mt-2">No other deductions (80C, HRA, LTA, etc.) are allowed</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
