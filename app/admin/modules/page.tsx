'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import apiService from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Save,
  Search,
  CheckCircle2,
  XCircle,
  Package,
  Building2,
  Shield,
} from 'lucide-react';
import { Tenant } from '@/lib/types';

export default function PlatformModuleManagementPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const preselectedTenant = searchParams.get('tenant');

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [allModules, setAllModules] = useState<any[]>([]);
  const [enabledModuleIds, setEnabledModuleIds] = useState<Set<string>>(new Set());
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [originalEnabled, setOriginalEnabled] = useState<Set<string>>(new Set());
  const [loadingTenantModules, setLoadingTenantModules] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (selectedTenantId) loadTenantModules(selectedTenantId);
  }, [selectedTenantId]);

  const loadInitial = async () => {
    try {
      setLoading(true);
      const [tRes, mRes] = await Promise.all([
        apiService.getTenants(),
        apiService.getAllPlatformModules(),
      ]);

      let tenantList: Tenant[] = [];
      if (tRes.success && tRes.data) {
        tenantList = Array.isArray(tRes.data) ? tRes.data : [];
        setTenants(tenantList);
      }
      if (mRes.success && mRes.data) {
        const mods = Array.isArray(mRes.data) ? mRes.data : (mRes as any).modules ?? [];
        setAllModules(mods);
      }

      const firstId = preselectedTenant || (tenantList[0]?.id ?? '');
      if (firstId) setSelectedTenantId(firstId);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadTenantModules = async (tenantId: string) => {
    try {
      setLoadingTenantModules(true);
      const res = await apiService.getCompanyModules(tenantId, true);
      const raw = (res as any).data ?? (res as any).modules ?? [];
      const list: any[] = Array.isArray(raw) ? raw : [];
      const enabled = new Set<string>(
        list
          .filter((cm: any) => cm.isEnabled)
          .map((cm: any) => (cm.moduleId?._id ?? cm.moduleId ?? '').toString())
      );
      setEnabledModuleIds(new Set(enabled));
      setOriginalEnabled(new Set(enabled));
      setPendingChanges(new Set());
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingTenantModules(false);
    }
  };

  const toggleModule = (moduleId: string, isCore: boolean) => {
    if (isCore) return; // Core modules cannot be toggled
    setEnabledModuleIds(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
    setPendingChanges(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedTenantId || pendingChanges.size === 0) return;

    setSaving(true);
    let successCount = 0;
    let failCount = 0;

    for (const moduleId of Array.from(pendingChanges)) {
      const nowEnabled = enabledModuleIds.has(moduleId);
      const wasEnabled = originalEnabled.has(moduleId);

      try {
        if (nowEnabled && !wasEnabled) {
          // Enable
          await apiService.enableModule(selectedTenantId, moduleId, {
            pricingModel: 'FLAT_FEE',
            monthlyCost: 0,
          });
          successCount++;
        } else if (!nowEnabled && wasEnabled) {
          // Disable
          await apiService.disableModule(selectedTenantId, moduleId, 'Disabled by Super Admin');
          successCount++;
        }
      } catch {
        failCount++;
      }
    }

    setSaving(false);

    if (failCount === 0) {
      toast({ title: 'Saved!', description: `${successCount} module(s) updated for this tenant.` });
    } else {
      toast({
        title: 'Partial Success',
        description: `${successCount} updated, ${failCount} failed.`,
        variant: 'destructive',
      });
    }

    // Reload to get fresh state
    await loadTenantModules(selectedTenantId);
  };

  const handleReset = () => {
    setEnabledModuleIds(new Set(originalEnabled));
    setPendingChanges(new Set());
  };

  // Unique categories
  const categories = ['ALL', ...Array.from(new Set(allModules.map(m => m.moduleCategory).filter(Boolean)))];

  const filteredModules = allModules.filter(m => {
    const matchesSearch =
      !search ||
      m.moduleName?.toLowerCase().includes(search.toLowerCase()) ||
      m.description?.toLowerCase().includes(search.toLowerCase()) ||
      m.moduleCode?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || m.moduleCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const enabledCount = allModules.filter(m => enabledModuleIds.has(m._id?.toString())).length;
  const totalNonCore = allModules.filter(m => !m.isCore).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Module Assignment</h1>
            <p className="text-muted-foreground">
              Select which modules a tenant can access. Changes reflect in their sidebar immediately.
            </p>
          </div>
          {pendingChanges.size > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} disabled={saving}>
                Reset
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />Save Changes ({pendingChanges.size})</>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Tenant Selector */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
              <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a tenant/company" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({(t as any).code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedTenantId && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Enabled</p>
                  <p className="text-2xl font-bold text-green-600">{enabledCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Disabled</p>
                  <p className="text-2xl font-bold text-red-500">{totalNonCore - (enabledCount - allModules.filter(m => m.isCore && enabledModuleIds.has(m._id?.toString())).length)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Total Modules</p>
                  <p className="text-2xl font-bold">{allModules.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Pending Changes</p>
                  <p className="text-2xl font-bold text-amber-500">{pendingChanges.size}</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Module Grid */}
            {loadingTenantModules ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredModules.map(module => {
                  const mid = module._id?.toString();
                  const isEnabled = enabledModuleIds.has(mid);
                  const isCore = module.isCore;
                  const hasPending = pendingChanges.has(mid);

                  return (
                    <div
                      key={mid}
                      onClick={() => toggleModule(mid, isCore)}
                      className={[
                        'relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 select-none',
                        isCore
                          ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 cursor-not-allowed opacity-80'
                          : isEnabled
                            ? 'border-green-400 bg-green-50/60 dark:bg-green-950/20 dark:border-green-700 hover:shadow-md'
                            : 'border-border bg-card hover:border-muted-foreground/40 hover:shadow-sm',
                        hasPending ? 'ring-2 ring-amber-400 ring-offset-1' : '',
                      ].join(' ')}
                    >
                      {/* Top-right indicator */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {isCore && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            <Shield className="h-3 w-3 mr-1" />Core
                          </Badge>
                        )}
                        {hasPending && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                        {isEnabled ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>

                      {/* Module Info */}
                      <div className="pr-16">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="font-semibold text-sm leading-tight">{module.moduleName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {module.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {module.moduleCategory && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              {module.moduleCategory}
                            </Badge>
                          )}
                          <span className="text-xs font-mono text-muted-foreground">
                            {module.moduleCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredModules.length === 0 && (
                  <div className="col-span-full text-center text-muted-foreground py-12">
                    No modules found matching your search.
                  </div>
                )}
              </div>
            )}

            {/* Bottom Save Bar (sticky) */}
            {pendingChanges.size > 0 && (
              <div className="sticky bottom-4 z-10">
                <div className="bg-background border rounded-xl shadow-lg px-4 py-3 flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">
                    <span className="text-amber-500 font-bold">{pendingChanges.size}</span> unsaved change
                    {pendingChanges.size !== 1 ? 's' : ''} for{' '}
                    <span className="font-bold">{selectedTenant?.name}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleReset} disabled={saving}>
                      Reset
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" />Save Changes</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
