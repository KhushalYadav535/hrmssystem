'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';

interface Rule {
  _id?: string;
  name: string;
  module: string;
  action: string;
  approverRole: string;
  approvalLevel: number;
  status: string;
}

export default function ApprovalHierarchyMasterPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const canAccess =
    hasPermission('configure_system') ||
    hasPermission('manage_settings') ||
    currentUser?.role === 'Tenant Admin' ||
    currentUser?.role === 'HR Administrator';

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        setLoading(true);
        const res = await apiService.getWorkflowRules();
        if (res.success && res.data) setRules(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error('Failed to load workflow rules');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  const byLevel = useMemo(() => {
    const m = new Map<number, Rule[]>();
    for (const r of rules) {
      const lv = r.approvalLevel || 1;
      if (!m.has(lv)) m.set(lv, []);
      m.get(lv)!.push(r);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [rules]);

  if (!isAuthenticated || !canAccess) redirect('/dashboard');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Approval Hierarchy Master</h1>
            <p className="text-muted-foreground mt-2">
              Read-only view of approval levels derived from workflow rules. Edit rules under Approval Workflow Master.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/settings/workflows">Edit workflow rules</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Levels</CardTitle>
            <CardDescription>{loading ? 'Loading…' : `${rules.length} rules across ${byLevel.length} levels`}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {byLevel.length === 0 && !loading ? (
              <p className="text-sm text-muted-foreground">No workflow rules yet. Create them in Approval Workflow Master.</p>
            ) : (
              byLevel.map(([level, list]) => (
                <div key={level}>
                  <h3 className="font-semibold mb-2">Level {level}</h3>
                  <ul className="list-disc pl-6 text-sm space-y-1 text-muted-foreground">
                    {list.map((r) => (
                      <li key={r._id || r.name}>
                        <span className="text-foreground font-medium">{r.name}</span> — {r.module} / {r.action} →{' '}
                        {r.approverRole} ({r.status})
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
