'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Upload, Palette, Loader2, RotateCcw } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

/**
 * US-A7-03: Activate White-Label Configuration
 * Upload custom logo, set brand colors, configure tenant-facing display name
 */
export default function WhiteLabelPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [settings, setSettings] = useState({
    whitelabelEnabled: false,
    organizationLogo: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    loginPageTagline: 'Welcome to Indian Bank HRMS',
    appDisplayName: 'Indian Bank HRMS',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await apiService.getPlatformSettings();
      if (res.success && res.data) {
        setSettings(prev => ({ ...prev, ...res.data.whiteLabel }));
      }
    } catch (error: any) {
      toast.error('Failed to load white-label settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo file size must be less than 2MB');
      return;
    }

    if (!file.type.match(/^image\/(png|svg|jpeg|jpg)$/)) {
      toast.error('Logo must be PNG, SVG, or JPEG format');
      return;
    }

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings({ ...settings, organizationLogo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updatePlatformSettings({
        whiteLabel: settings,
      });
      toast.success('White-label settings saved successfully. Changes will apply within 5 minutes.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save white-label settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      whitelabelEnabled: false,
      organizationLogo: '',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      loginPageTagline: 'Welcome to Indian Bank HRMS',
      appDisplayName: 'Indian Bank HRMS',
    });
    toast.success('Settings reset to default');
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">White-Label Configuration</h1>
            <p className="text-muted-foreground mt-2">
              Customize branding for tenant-facing pages
            </p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>

        {/* Enable Toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-semibold">Enable White-Label</Label>
                <p className="text-sm text-muted-foreground">
                  Activate custom branding configuration
                </p>
              </div>
              <Switch
                checked={settings.whitelabelEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, whitelabelEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {settings.whitelabelEnabled && (
          <>
            {/* Branding Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Branding Settings
                  </CardTitle>
                  <CardDescription>Configure logo, colors, and display name</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Logo Upload */}
                  <div>
                    <Label>Organization Logo</Label>
                    <div className="mt-2 space-y-2">
                      {settings.organizationLogo && (
                        <div className="w-32 h-32 border rounded-lg p-2 bg-white">
                          <img
                            src={settings.organizationLogo}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/png,image/svg+xml,image/jpeg,image/jpg"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Button variant="outline" asChild>
                          <label htmlFor="logo-upload" className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Logo
                          </label>
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          PNG/SVG, max 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Primary Color */}
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div>
                    <Label>Secondary Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        placeholder="#8b5cf6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* App Display Name */}
                  <div>
                    <Label>App Display Name</Label>
                    <Input
                      value={settings.appDisplayName}
                      onChange={(e) => setSettings({ ...settings, appDisplayName: e.target.value })}
                      placeholder="Indian Bank HRMS"
                    />
                  </div>

                  {/* Login Page Tagline */}
                  <div>
                    <Label>Login Page Tagline</Label>
                    <Input
                      value={settings.loginPageTagline}
                      onChange={(e) => setSettings({ ...settings, loginPageTagline: e.target.value })}
                      placeholder="Welcome to Indian Bank HRMS"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Live Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>How the login page and dashboard header will appear</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Login Page Preview */}
                    <div className="border rounded-lg p-4 bg-gradient-to-br" style={{ background: `linear-gradient(to bottom right, ${settings.primaryColor}, ${settings.secondaryColor})` }}>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                        {settings.organizationLogo && (
                          <div className="flex justify-center mb-4">
                            <img
                              src={settings.organizationLogo}
                              alt="Logo"
                              className="h-12 object-contain"
                            />
                          </div>
                        )}
                        <h2 className="text-2xl font-bold text-center mb-2">{settings.appDisplayName}</h2>
                        <p className="text-sm text-center text-muted-foreground mb-4">
                          {settings.loginPageTagline}
                        </p>
                        <div className="space-y-2">
                          <div className="h-10 bg-secondary rounded" />
                          <div className="h-10 bg-secondary rounded" />
                          <Button className="w-full" style={{ backgroundColor: settings.primaryColor }}>
                            Sign In
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard Header Preview */}
                    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: settings.primaryColor + '20' }}>
                        <div className="flex items-center gap-3">
                          {settings.organizationLogo && (
                            <img
                              src={settings.organizationLogo}
                              alt="Logo"
                              className="h-8 object-contain"
                            />
                          )}
                          <span className="font-semibold">{settings.appDisplayName}</span>
                        </div>
                        <Badge style={{ backgroundColor: settings.primaryColor }}>
                          User
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="min-w-[150px]">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save White-Label Settings'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
