'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import apiService from '@/lib/api';

export default function CompliancePage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [epfoConfig, setEpfoConfig] = useState({
    epfoNumber: '',
    epfoUsername: '',
    epfoPassword: '',
    enabled: true,
  });
  const [esicConfig, setEsicConfig] = useState({
    esicNumber: '',
    esicUsername: '',
    esicPassword: '',
    enabled: true,
  });
  const [taxConfig, setTaxConfig] = useState({
    panNumber: '',
    tanNumber: '',
    gstNumber: '',
    enabled: true,
  });

  if (!isAuthenticated || !hasPermission('configure_system')) {
    redirect('/dashboard');
  }

  const handleSaveEpfo = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.updateComplianceConfig('epfo', epfoConfig);
      if (response.success) {
        toast.success('EPFO configuration saved successfully');
      } else {
        toast.error(response.message || 'Failed to save EPFO configuration');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save EPFO configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEsic = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.updateComplianceConfig('esic', esicConfig);
      if (response.success) {
        toast.success('ESIC configuration saved successfully');
      } else {
        toast.error(response.message || 'Failed to save ESIC configuration');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save ESIC configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTax = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.updateComplianceConfig('tax', taxConfig);
      if (response.success) {
        toast.success('Tax configuration saved successfully');
      } else {
        toast.error(response.message || 'Failed to save tax configuration');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save tax configuration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Statutory Compliance</h1>
            <p className="text-muted-foreground mt-1">Configure EPFO, ESIC, and tax settings</p>
          </div>
        </div>

        {/* Configuration Tabs */}
        <Tabs defaultValue="epfo" className="w-full">
          <TabsList>
            <TabsTrigger value="epfo">EPFO</TabsTrigger>
            <TabsTrigger value="esic">ESIC</TabsTrigger>
            <TabsTrigger value="tax">Tax Settings</TabsTrigger>
          </TabsList>

          {/* EPFO Configuration */}
          <TabsContent value="epfo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>EPFO Configuration</CardTitle>
                <CardDescription>Employee Provident Fund Organization settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="epfo-number">EPFO Number</Label>
                    <Input
                      id="epfo-number"
                      placeholder="Enter EPFO registration number"
                      value={epfoConfig.epfoNumber}
                      onChange={(e) => setEpfoConfig({ ...epfoConfig, epfoNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="epfo-username">Username</Label>
                    <Input
                      id="epfo-username"
                      placeholder="Enter EPFO portal username"
                      value={epfoConfig.epfoUsername}
                      onChange={(e) => setEpfoConfig({ ...epfoConfig, epfoUsername: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="epfo-password">Password</Label>
                  <Input
                    id="epfo-password"
                    type="password"
                    placeholder="Enter EPFO portal password"
                    value={epfoConfig.epfoPassword}
                    onChange={(e) => setEpfoConfig({ ...epfoConfig, epfoPassword: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="epfo-enabled"
                    checked={epfoConfig.enabled}
                    onChange={(e) => setEpfoConfig({ ...epfoConfig, enabled: e.target.checked })}
                  />
                  <Label htmlFor="epfo-enabled">Enable EPFO Integration</Label>
                </div>
                <Button onClick={handleSaveEpfo} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save EPFO Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ESIC Configuration */}
          <TabsContent value="esic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ESIC Configuration</CardTitle>
                <CardDescription>Employees State Insurance Corporation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="esic-number">ESIC Number</Label>
                    <Input
                      id="esic-number"
                      placeholder="Enter ESIC registration number"
                      value={esicConfig.esicNumber}
                      onChange={(e) => setEsicConfig({ ...esicConfig, esicNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="esic-username">Username</Label>
                    <Input
                      id="esic-username"
                      placeholder="Enter ESIC portal username"
                      value={esicConfig.esicUsername}
                      onChange={(e) => setEsicConfig({ ...esicConfig, esicUsername: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esic-password">Password</Label>
                  <Input
                    id="esic-password"
                    type="password"
                    placeholder="Enter ESIC portal password"
                    value={esicConfig.esicPassword}
                    onChange={(e) => setEsicConfig({ ...esicConfig, esicPassword: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="esic-enabled"
                    checked={esicConfig.enabled}
                    onChange={(e) => setEsicConfig({ ...esicConfig, enabled: e.target.checked })}
                  />
                  <Label htmlFor="esic-enabled">Enable ESIC Integration</Label>
                </div>
                <Button onClick={handleSaveEsic} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save ESIC Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Configuration */}
          <TabsContent value="tax" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Configuration</CardTitle>
                <CardDescription>PAN, TAN, and GST settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN (Permanent Account Number)</Label>
                    <Input
                      id="pan"
                      placeholder="Enter organization PAN"
                      value={taxConfig.panNumber}
                      onChange={(e) => setTaxConfig({ ...taxConfig, panNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tan">TAN (Tax Deduction Account Number)</Label>
                    <Input
                      id="tan"
                      placeholder="Enter organization TAN"
                      value={taxConfig.tanNumber}
                      onChange={(e) => setTaxConfig({ ...taxConfig, tanNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Number</Label>
                  <Input
                    id="gst"
                    placeholder="Enter organization GST number"
                    value={taxConfig.gstNumber}
                    onChange={(e) => setTaxConfig({ ...taxConfig, gstNumber: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="tax-enabled"
                    checked={taxConfig.enabled}
                    onChange={(e) => setTaxConfig({ ...taxConfig, enabled: e.target.checked })}
                  />
                  <Label htmlFor="tax-enabled">Enable Tax Management</Label>
                </div>
                <Button onClick={handleSaveTax} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Tax Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
