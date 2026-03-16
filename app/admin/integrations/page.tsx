'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import apiService from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Globe, Wifi, MessageSquare, Mail, Building2, Smartphone, Settings, CheckCircle2, XCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

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
  const [healthStatus, setHealthStatus] = useState<Record<string, any>>({});

  useEffect(() => {
    loadData();
    loadHealthStatus();
  }, []);

  const loadHealthStatus = async () => {
    try {
      const res = await apiService.getIntegrationHealth();
      if (res.success && res.data) {
        const healthMap: Record<string, any> = {};
        res.data.forEach((h: any) => {
          healthMap[h.integrationCode] = h;
        });
        setHealthStatus(healthMap);
      }
    } catch (error) {
      // Silently fail - health status is optional
    }
  };

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Biometric, WhatsApp, Email/SMS, CBS, API access</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/integrations/health">
            <AlertCircle className="w-4 h-4 mr-2" />
            Health Monitor
          </Link>
        </Button>
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
            <CardContent className="space-y-3">
              {/* US-A6-02: Health Status Indicator */}
              {healthStatus[int.integrationCode] && (
                <div className="flex items-center gap-2 text-xs">
                  {healthStatus[int.integrationCode].healthStatus === 'healthy' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Healthy</span>
                    </>
                  )}
                  {healthStatus[int.integrationCode].healthStatus === 'degraded' && (
                    <>
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="text-orange-600">Degraded</span>
                    </>
                  )}
                  {healthStatus[int.integrationCode].healthStatus === 'failed' && (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">Failed</span>
                    </>
                  )}
                  {healthStatus[int.integrationCode].healthStatus === 'not_configured' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Not Configured</span>
                    </>
                  )}
                  {healthStatus[int.integrationCode].lastHealthCheck && (
                    <span className="text-muted-foreground ml-auto">
                      {new Date(healthStatus[int.integrationCode].lastHealthCheck).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                >
                  <Link href={`/admin/integrations/configure/${int._id}`}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant={int.isEnabled ? 'outline' : 'default'}
                  onClick={() => toggleEnabled(int._id, int.isEnabled)}
                >
                  {int.isEnabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </DashboardLayout>
  );
}
