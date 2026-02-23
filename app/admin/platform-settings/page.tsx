'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import apiService from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings } from 'lucide-react';

export default function PlatformSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    billingCycle: 'MONTHLY',
    autoRenew: true,
    currency: 'INR',
    whitelabelEnabled: false,
    appName: 'Indian Bank HRMS',
    supportEmail: 'support@example.com',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getPlatformSettings();
      if (res.success && res.data) {
        setForm(f => ({ ...f, ...res.data }));
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await apiService.updatePlatformSettings(form);
      if (res.success) {
        toast({ title: 'Success', description: 'Settings saved' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">White-label, billing cycle, general config</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General
          </CardTitle>
          <CardDescription>App name, support email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>App Name</Label>
            <Input
              value={form.appName}
              onChange={e => setForm(f => ({ ...f, appName: e.target.value }))}
            />
          </div>
          <div>
            <Label>Support Email</Label>
            <Input
              type="email"
              value={form.supportEmail}
              onChange={e => setForm(f => ({ ...f, supportEmail: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Billing cycle, auto-renew, currency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default Billing Cycle</Label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.billingCycle}
              onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value }))}
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="ANNUAL">Annual</option>
            </select>
          </div>
          <div>
            <Label>Currency</Label>
            <Input
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRenew"
              checked={form.autoRenew}
              onChange={e => setForm(f => ({ ...f, autoRenew: e.target.checked }))}
            />
            <Label htmlFor="autoRenew">Auto-renew subscriptions</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>White-label</CardTitle>
          <CardDescription>Client-wise customization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="whitelabel"
              checked={form.whitelabelEnabled}
              onChange={e => setForm(f => ({ ...f, whitelabelEnabled: e.target.checked }))}
            />
            <Label htmlFor="whitelabel">Enable white-label (client-wise customization)</Label>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Save Settings
      </Button>
    </div>
    </DashboardLayout>
  );
}
