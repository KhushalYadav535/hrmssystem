'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import apiService from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Building2, Package, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getPlatformAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const chartData = data.moduleUsage || [];

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Usage</h1>
        <p className="text-muted-foreground">Module usage, billable usage, per-company stats</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tenants</CardDescription>
            <CardTitle className="text-2xl">{data.totalTenants || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 mr-2" />
              {data.activeTenants || 0} active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Module Activations</CardDescription>
            <CardTitle className="text-2xl">{data.totalModuleActivations || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Package className="h-4 w-4 mr-2" />
              Across all companies
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Requests</CardDescription>
            <CardTitle className="text-2xl">{data.pendingRequests || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/modules" className="text-sm text-primary hover:underline">
              View requests →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module Usage</CardTitle>
          <CardDescription>How many tenants use each module</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="moduleCode" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Tenants" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per-Company Stats</CardTitle>
          <CardDescription>Active modules and employees per tenant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Company</th>
                  <th className="text-left py-2">Code</th>
                  <th className="text-right py-2">Employees</th>
                  <th className="text-right py-2">Active Modules</th>
                </tr>
              </thead>
              <tbody>
                {(data.tenantStats || []).map((t: any) => (
                  <tr key={t.id} className="border-b">
                    <td className="py-2">{t.name}</td>
                    <td className="py-2">{t.code}</td>
                    <td className="text-right py-2">{t.employees || 0}</td>
                    <td className="text-right py-2">{t.activeModules || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}
