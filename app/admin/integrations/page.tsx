'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import apiService from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Globe, Wifi, MessageSquare, Mail, Building2, Smartphone } from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  BIOMETRIC: <Wifi className="h-5 w-5" />,
  MESSAGING: <MessageSquare className="h-5 w-5" />,
  EMAIL_SMS: <Mail className="h-5 w-5" />,
  BANKING: <Building2 className="h-5 w-5" />,
  MOBILE: <Smartphone className="h-5 w-5" />,
  API: <Globe className="h-5 w-5" />,
};

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getIntegrations();
      if (res.success && res.data) {
        setIntegrations(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleEnabled = async (id: string, current: boolean) => {
    try {
      const res = await apiService.updateIntegration(id, { isEnabled: !current });
      if (res.success) {
        toast({ title: 'Success', description: 'Integration updated' });
        loadData();
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
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
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">Biometric, WhatsApp, Email/SMS, CBS, API access</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((int) => (
          <Card key={int._id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    {ICONS[int.category] || <Globe className="h-5 w-5" />}
                  </div>
                  <div>
                    <CardTitle>{int.integrationName}</CardTitle>
                    <CardDescription>{int.description || int.integrationCode}</CardDescription>
                  </div>
                </div>
                <Badge variant={int.isEnabled ? 'default' : 'secondary'}>
                  {int.isEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                size="sm"
                variant={int.isEnabled ? 'outline' : 'default'}
                onClick={() => toggleEnabled(int._id, int.isEnabled)}
              >
                {int.isEnabled ? 'Disable' : 'Enable'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </DashboardLayout>
  );
}
