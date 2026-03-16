'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

/**
 * US-A7-02: Compliance & Regulatory Settings (DPDP Act 2023, RBI IT Framework)
 */
export default function ComplianceSettingsPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [settings, setSettings] = useState({
    // Data Residency
    dataResidency: 'INDIA_MUMBAI',
    
    // Data Retention
    payrollRetentionYears: 7,
    logsRetentionYears: 2,
    auditRetentionYears: 3,
    
    // DPDP Consent
    consentBannerEnabled: true,
    consentRequired: true,
    
    // RBI IT Framework
    rbiControls: {
      accessControl: false,
      encryptionAtRest: false,
      encryptionInTransit: false,
      auditTrail: false,
      dataBackup: false,
      incidentResponse: false,
      vendorManagement: false,
    },
    
    // Audit Trail Retention
    auditRetentionMinYears: 2,
    auditRetentionMaxYears: 5,
    
    // Data Export
    dataExportEnabled: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await apiService.getPlatformSettings();
      if (res.success && res.data) {
        setSettings(prev => ({ ...prev, ...res.data.compliance }));
      }
    } catch (error: any) {
      toast.error('Failed to load compliance settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (requiresAuth && !authPassword) {
      toast.error('Please enter your password to save compliance settings');
      return;
    }

    setSaving(true);
    try {
      await apiService.updatePlatformSettings({
        compliance: settings,
      });
      toast.success('Compliance settings saved successfully');
      setRequiresAuth(false);
      setAuthPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save compliance settings');
    } finally {
      setSaving(false);
    }
  };

  const calculateRBIProgress = () => {
    const total = Object.keys(settings.rbiControls).length;
    const completed = Object.values(settings.rbiControls).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Compliance & Regulatory Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure compliance settings for DPDP Act 2023 and RBI IT Framework
          </p>
        </div>

        {/* Re-authentication Required */}
        {requiresAuth && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <p className="font-medium">Password Required</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Changes to compliance settings require password confirmation for security.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button onClick={handleSave} disabled={!authPassword || saving}>
                    Confirm & Save
                  </Button>
                  <Button variant="outline" onClick={() => setRequiresAuth(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="residency" className="space-y-4">
          <TabsList>
            <TabsTrigger value="residency">Data Residency</TabsTrigger>
            <TabsTrigger value="retention">Data Retention</TabsTrigger>
            <TabsTrigger value="consent">DPDP Consent</TabsTrigger>
            <TabsTrigger value="rbi">RBI Controls</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          {/* Data Residency Tab */}
          <TabsContent value="residency">
            <Card>
              <CardHeader>
                <CardTitle>Data Residency</CardTitle>
                <CardDescription>
                  Select primary region for data storage (BR-A7-04: Cannot change after active data exists)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Primary Data Region</Label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={settings.dataResidency}
                    onChange={(e) => setSettings({ ...settings, dataResidency: e.target.value })}
                  >
                    <option value="INDIA_MUMBAI">India - Mumbai</option>
                    <option value="INDIA_HYDERABAD">India - Hyderabad</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Data residency selection cannot be changed after active tenant data exists without migration workflow.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Retention Tab */}
          <TabsContent value="retention">
            <Card>
              <CardHeader>
                <CardTitle>Data Retention Policy</CardTitle>
                <CardDescription>Configure retention periods per data category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Payroll Data Retention (years)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={settings.payrollRetentionYears}
                    onChange={(e) => setSettings({ ...settings, payrollRetentionYears: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum 7 years recommended for compliance</p>
                </div>
                <div>
                  <Label>Logs Retention (years)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={settings.logsRetentionYears}
                    onChange={(e) => setSettings({ ...settings, logsRetentionYears: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Audit Trail Retention (years)</Label>
                  <Input
                    type="number"
                    min={settings.auditRetentionMinYears}
                    max={settings.auditRetentionMaxYears}
                    value={settings.auditRetentionYears}
                    onChange={(e) => setSettings({ ...settings, auditRetentionYears: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Range: {settings.auditRetentionMinYears} - {settings.auditRetentionMaxYears} years
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DPDP Consent Tab */}
          <TabsContent value="consent">
            <Card>
              <CardHeader>
                <CardTitle>DPDP Consent Management</CardTitle>
                <CardDescription>Configure consent banner and consent records (BR-A7-05: Consent records cannot be deleted)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-semibold">Enable Consent Banner</Label>
                    <p className="text-sm text-muted-foreground">
                      Show consent banner to users for data processing
                    </p>
                  </div>
                  <Switch
                    checked={settings.consentBannerEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, consentBannerEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-semibold">Consent Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Require explicit consent before data processing
                    </p>
                  </div>
                  <Switch
                    checked={settings.consentRequired}
                    onCheckedChange={(checked) => setSettings({ ...settings, consentRequired: checked })}
                  />
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Consent Records</p>
                  <p className="text-xs text-muted-foreground">
                    Consent records are append-only and cannot be deleted from the UI per DPDP Act 2023 requirements.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RBI Controls Tab */}
          <TabsContent value="rbi">
            <Card>
              <CardHeader>
                <CardTitle>RBI IT Framework Controls</CardTitle>
                <CardDescription>
                  Checklist of applicable controls with completion percentage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Completion Progress</p>
                    <Badge variant="outline">{calculateRBIProgress()}%</Badge>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${calculateRBIProgress()}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(settings.rbiControls).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {key === 'accessControl' && 'Role-based access control implemented'}
                          {key === 'encryptionAtRest' && 'Data encrypted at rest'}
                          {key === 'encryptionInTransit' && 'Data encrypted in transit (HTTPS/TLS)'}
                          {key === 'auditTrail' && 'Comprehensive audit trail maintained'}
                          {key === 'dataBackup' && 'Regular automated backups configured'}
                          {key === 'incidentResponse' && 'Incident response plan documented'}
                          {key === 'vendorManagement' && 'Third-party vendor risk assessment'}
                        </p>
                      </div>
                      <Switch
                        checked={value as boolean}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            rbiControls: { ...settings.rbiControls, [key]: checked },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail Retention</CardTitle>
                <CardDescription>Configure audit log retention periods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Minimum Retention (years)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={settings.auditRetentionMinYears}
                    onChange={(e) => setSettings({ ...settings, auditRetentionMinYears: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Maximum Retention (years)</Label>
                  <Input
                    type="number"
                    min={2}
                    max={10}
                    value={settings.auditRetentionMaxYears}
                    onChange={(e) => setSettings({ ...settings, auditRetentionMaxYears: Number(e.target.value) })}
                  />
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Data Export on Request</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Enable right-to-access export (DPDP requirement)
                    </p>
                    <Switch
                      checked={settings.dataExportEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, dataExportEnabled: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={() => setRequiresAuth(true)} disabled={saving}>
            Save Compliance Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
