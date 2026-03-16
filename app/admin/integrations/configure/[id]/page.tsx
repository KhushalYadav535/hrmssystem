'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, ArrowLeft, TestTube } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

/**
 * US-A6-01: Integration Configuration Panel
 * Configure integration parameters (API endpoints, keys, webhooks) for each integration
 */
export default function IntegrationConfigurePage() {
  const params = useParams();
  const router = useRouter();
  const integrationId = params.id as string;
  
  const [integration, setIntegration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    loadIntegration();
  }, [integrationId]);

  const loadIntegration = async () => {
    try {
      setLoading(true);
      const res = await apiService.getIntegrations();
      if (res.success && res.data) {
        const integrations = Array.isArray(res.data) ? res.data : [];
        const found = integrations.find((i: any) => (i._id || i.id) === integrationId);
        if (found) {
          setIntegration(found);
          setConfig(found.config || {});
        }
      }
    } catch (error: any) {
      toast.error('Failed to load integration');
    } finally {
      setLoading(false);
    }
  };

  const getConfigFields = () => {
    if (!integration) return [];
    
    switch (integration.integrationCode) {
      case 'BIOMETRIC':
        return [
          { key: 'deviceIP', label: 'Device IP Address', type: 'text', required: true },
          { key: 'devicePort', label: 'Device Port', type: 'number', required: true },
          { key: 'vendorType', label: 'Vendor Type', type: 'select', options: ['ZKTeco', 'eSSL', 'RealTime', 'Other'], required: true },
          { key: 'syncInterval', label: 'Sync Interval (minutes)', type: 'number', required: false },
        ];
      case 'WHATSAPP':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true },
          { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: false },
          { key: 'messageTemplate', label: 'Message Template', type: 'textarea', required: false },
        ];
      case 'EMAIL_SMS':
        return [
          { key: 'smtpHost', label: 'SMTP Host', type: 'text', required: true },
          { key: 'smtpPort', label: 'SMTP Port', type: 'number', required: true },
          { key: 'smtpUser', label: 'SMTP Username', type: 'text', required: true },
          { key: 'smtpPassword', label: 'SMTP Password', type: 'password', required: true },
          { key: 'smsProviderApiKey', label: 'SMS Provider API Key', type: 'password', required: false },
          { key: 'senderId', label: 'Sender ID', type: 'text', required: false },
        ];
      case 'CBS':
        return [
          { key: 'baseUrl', label: 'Base URL', type: 'url', required: true },
          { key: 'authType', label: 'Authentication Type', type: 'select', options: ['Bearer Token', 'Basic Auth', 'OAuth2'], required: true },
          { key: 'apiKey', label: 'API Key / Token', type: 'password', required: true },
          { key: 'branchCodeMapping', label: 'Branch Code Mapping', type: 'textarea', required: false },
        ];
      case 'MOBILE_APP':
        return [
          { key: 'bundleIdAndroid', label: 'Android Bundle ID', type: 'text', required: false },
          { key: 'bundleIdIOS', label: 'iOS Bundle ID', type: 'text', required: false },
          { key: 'fcmServerKey', label: 'FCM Server Key', type: 'password', required: false },
          { key: 'apnsKey', label: 'APNs Key', type: 'password', required: false },
          { key: 'domainWhitelist', label: 'Domain Whitelist', type: 'textarea', required: false },
        ];
      case 'API_ACCESS':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: false },
          { key: 'allowedIPs', label: 'Allowed IPs (comma-separated)', type: 'text', required: false },
          { key: 'rateLimit', label: 'Rate Limit (requests/minute)', type: 'number', required: false },
        ];
      default:
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: false },
          { key: 'endpoint', label: 'Endpoint URL', type: 'url', required: false },
        ];
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiService.testIntegrationConnection(integrationId);
      if (res.success) {
        setTestResult(res.testResult);
        if (res.testResult.success) {
          toast.success('Connection test successful!');
        } else {
          toast.error(`Connection test failed: ${res.testResult.message}`);
        }
      }
    } catch (error: any) {
      toast.error('Connection test failed');
      setTestResult({ success: false, message: error.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    // BR-A6-02: Validate webhook URLs are HTTPS
    if (config.webhookUrl && !config.webhookUrl.startsWith('https://')) {
      toast.error('Webhook URLs must use HTTPS');
      return;
    }

    setSaving(true);
    try {
      const res = await apiService.updateIntegration(integrationId, { config });
      if (res.success) {
        toast.success('Configuration saved successfully');
        router.push('/admin/integrations');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
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

  if (!integration) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Integration not found</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const configFields = getConfigFields();
  const isConfigured = Object.keys(config).length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{integration.integrationName}</h1>
              <p className="text-muted-foreground">{integration.description}</p>
            </div>
          </div>
          <Badge variant={integration.isEnabled ? 'default' : 'secondary'}>
            {integration.isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>

        {/* Test Connection Result */}
        {testResult && (
          <Card className={testResult.success ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <p className={testResult.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}>
                  {testResult.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Configure integration parameters. Sensitive fields are encrypted at rest.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {configFields.map((field: any) => {
              const isPassword = field.type === 'password';
              const value = config[field.key] || '';
              const showValue = showSecrets[field.key] || !isPassword;

              return (
                <div key={field.key}>
                  <Label>
                    {field.label} {field.required && <span className="text-red-600">*</span>}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={value}
                      onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={value}
                      onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="relative">
                      <Input
                        type={showValue ? (field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text') : 'password'}
                        value={showValue ? value : '••••••••'}
                        onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className={isPassword ? 'pr-10' : ''}
                      />
                      {isPassword && (
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(field.key)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showSecrets[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  )}
                  {field.type === 'url' && value && !value.startsWith('https://') && (
                    <p className="text-xs text-red-600 mt-1">URLs must use HTTPS</p>
                  )}
                </div>
              );
            })}

            {/* Test Connection Button */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={testing || !isConfigured}
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Test connection before saving to validate configuration
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
