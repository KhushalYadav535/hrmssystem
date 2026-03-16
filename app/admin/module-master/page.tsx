'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import apiService from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Settings, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const CATEGORIES = ['CORE', 'STANDARD', 'ADVANCED', 'INTEGRATION'];
const PRICING_MODELS = ['FLAT_FEE', 'PER_USER', 'PER_TRANSACTION', 'BUNDLED'];

export default function ModuleMasterPage() {
  const { toast } = useToast();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    moduleCode: '',
    moduleName: '',
    moduleCategory: 'STANDARD',
    description: '',
    keyFeatures: [] as string[],
    isCore: false,
    pricingModel: 'FLAT_FEE',
    basePrice: 0,
    dependsOnModules: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllPlatformModules();
      if (res.success) {
        const list = res.data?.modules || res.modules || (Array.isArray(res.data) ? res.data : []);
        setModules(Array.isArray(list) ? list : []);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      moduleCode: '',
      moduleName: '',
      moduleCategory: 'STANDARD',
      description: '',
      keyFeatures: [],
      isCore: false,
      pricingModel: 'FLAT_FEE',
      basePrice: 0,
      dependsOnModules: [],
      isActive: true,
    });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (m: any) => {
    setEditing(m);
    setForm({
      moduleCode: m.moduleCode || '',
      moduleName: m.moduleName || '',
      moduleCategory: m.moduleCategory || 'STANDARD',
      description: m.description || '',
      keyFeatures: m.keyFeatures || [],
      isCore: m.isCore || false,
      pricingModel: m.pricingModel || 'FLAT_FEE',
      basePrice: m.basePrice || 0,
      dependsOnModules: m.dependsOnModules || [],
      isActive: m.isActive !== false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.moduleCode?.trim() || !form.moduleName?.trim()) {
      toast({ title: 'Error', description: 'Code and name required', variant: 'destructive' });
      return;
    }
    // US-A5-01: BR-A5-01: Description required, min 50 chars, max 500 chars
    if (!form.description || form.description.trim().length < 50 || form.description.trim().length > 500) {
      toast({ 
        title: 'Error', 
        description: 'Description is required and must be between 50 and 500 characters', 
        variant: 'destructive' 
      });
      return;
    }
    // BR-A5-02: No module can be toggled Active if description is empty
    if (form.isActive && !form.description) {
      toast({ 
        title: 'Error', 
        description: 'Active modules must have a description', 
        variant: 'destructive' 
      });
      return;
    }
    try {
      if (editing) {
        const res = await apiService.updatePlatformModule(editing._id, form);
        if (res.success) {
          toast({ title: 'Success', description: 'Module updated' });
          setDialogOpen(false);
          loadData();
        }
      } else {
        const res = await apiService.createPlatformModule(form);
        if (res.success) {
          toast({ title: 'Success', description: 'Module created' });
          setDialogOpen(false);
          loadData();
        }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Platform Module Master</h1>
          <p className="text-muted-foreground">Create and edit platform modules</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      <div className="grid gap-4">
        {modules.map((m) => (
          <Card key={m._id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {m.moduleName}
                    <Badge variant={m.isCore ? 'secondary' : 'outline'}>{m.moduleCategory}</Badge>
                    {m.isCore && <Badge variant="secondary">Core</Badge>}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {m.description || 'No description available'}
                  </CardDescription>
                  {m.keyFeatures && m.keyFeatures.length > 0 && (
                    <ul className="text-xs text-muted-foreground mt-2 list-disc list-inside">
                      {m.keyFeatures.slice(0, 3).map((feature: string, idx: number) => (
                        <li key={idx}>{feature}</li>
                      ))}
                      {m.keyFeatures.length > 3 && <li>+{m.keyFeatures.length - 3} more</li>}
                    </ul>
                  )}
                </div>
                <div className="flex gap-2">
                  <span className="text-sm text-muted-foreground">
                    {m.pricingModel} ₹{Number(m.basePrice || 0).toLocaleString()}/mo
                  </span>
                  <Button size="sm" variant="outline" onClick={() => openEdit(m)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Module' : 'Create Module'}</DialogTitle>
            <DialogDescription>Platform module configuration</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Module Code</Label>
                <Input
                  value={form.moduleCode}
                  onChange={e => setForm(f => ({ ...f, moduleCode: e.target.value.toUpperCase() }))}
                  placeholder="PAYROLL"
                  disabled={!!editing}
                />
              </div>
              <div>
                <Label>Module Name</Label>
                <Input
                  value={form.moduleName}
                  onChange={e => setForm(f => ({ ...f, moduleName: e.target.value }))}
                  placeholder="Payroll Management"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.moduleCategory}
                onChange={e => setForm(f => ({ ...f, moduleCategory: e.target.value }))}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Description * (50-500 characters)</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Enter a detailed description of this module (minimum 50 characters)..."
                rows={4}
                minLength={50}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.description.length}/500 characters
                {form.description.length > 0 && form.description.length < 50 && (
                  <span className="text-red-600"> (minimum 50 characters required)</span>
                )}
              </p>
            </div>
            <div>
              <Label>Key Features (max 5)</Label>
              <div className="space-y-2">
                {form.keyFeatures.map((feature, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={e => {
                        const updated = [...form.keyFeatures];
                        updated[idx] = e.target.value;
                        setForm(f => ({ ...f, keyFeatures: updated }));
                      }}
                      placeholder={`Feature ${idx + 1}`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setForm(f => ({
                          ...f,
                          keyFeatures: f.keyFeatures.filter((_, i) => i !== idx)
                        }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {form.keyFeatures.length < 5 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setForm(f => ({ ...f, keyFeatures: [...f.keyFeatures, ''] }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pricing Model</Label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.pricingModel}
                  onChange={e => setForm(f => ({ ...f, pricingModel: e.target.value }))}
                >
                  {PRICING_MODELS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Base Price (₹/mo)</Label>
                <Input
                  type="number"
                  value={form.basePrice || ''}
                  onChange={e => setForm(f => ({ ...f, basePrice: Number(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCore"
                checked={form.isCore}
                onChange={e => setForm(f => ({ ...f, isCore: e.target.checked }))}
              />
              <Label htmlFor="isCore">Core module (cannot be disabled)</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  );
}
