'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import apiService from '@/lib/api';

interface LeavePolicy {
  _id?: string;
  leaveType: string;
  daysPerYear: number;
  accrualFrequency?: string;
  accrualRate?: number;
  accrualDate?: number;
  carryForward: boolean;
  maxCarryForward?: number;
  requiresApproval: boolean;
  description?: string;
  status: string;
}

export default function LeavePoliciesPage() {
  const { isAuthenticated, user, hasPermission } = useAuth();
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null);
  const [formData, setFormData] = useState({
    leaveType: '',
    daysPerYear: 0,
    accrualFrequency: 'Monthly',
    accrualRate: 0,
    accrualDate: 1,
    carryForward: false,
    maxCarryForward: 0,
    requiresApproval: true,
    description: '',
    status: 'Active',
  });

  // Role-based access control: Only HR Administrators can access this page
  if (!isAuthenticated) {
    redirect('/login');
  }

  if (user?.role !== 'HR Administrator' && !hasPermission('configure_system')) {
    redirect('/dashboard');
  }

  useEffect(() => {
    loadLeavePolicies();
  }, []);

  const loadLeavePolicies = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getLeavePolicies();
      if (response.success && response.data) {
        const policies = Array.isArray(response.data) ? response.data : [];
        const policiesWithDefaults = policies.map((policy: LeavePolicy) => ({
          ...policy,
          accrualFrequency: policy.accrualFrequency || 'Monthly',
          accrualRate: policy.accrualRate ?? (policy.daysPerYear ? policy.daysPerYear / 12 : 1),
          accrualDate: policy.accrualDate || 1,
        }));
        setLeavePolicies(policiesWithDefaults);
      }
    } catch (error: any) {
      toast.error('Failed to load leave policies');
      console.error('Load leave policies error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (policy?: LeavePolicy) => {
    if (policy) {
      setEditingPolicy(policy);
      setFormData({
        leaveType: policy.leaveType,
        daysPerYear: policy.daysPerYear,
        accrualFrequency: policy.accrualFrequency || 'Monthly',
        accrualRate: policy.accrualRate || 1,
        accrualDate: policy.accrualDate || 1,
        carryForward: policy.carryForward,
        maxCarryForward: policy.maxCarryForward || 0,
        requiresApproval: policy.requiresApproval,
        description: policy.description || '',
        status: policy.status,
      });
    } else {
      setEditingPolicy(null);
      setFormData({
        leaveType: '',
        daysPerYear: 0,
        accrualFrequency: 'Monthly',
        accrualRate: 0,
        accrualDate: 1,
        carryForward: false,
        maxCarryForward: 0,
        requiresApproval: true,
        description: '',
        status: 'Active',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSavePolicy = async () => {
    if (!formData.leaveType) {
      toast.error('Please enter leave type');
      return;
    }

    try {
      setIsLoading(true);
      if (editingPolicy) {
        const response = await apiService.updateLeavePolicy(editingPolicy._id!, formData);
        if (response.success) {
          toast.success('Leave policy updated successfully');
          setIsDialogOpen(false);
          loadLeavePolicies();
        } else {
          toast.error(response.message || 'Failed to update leave policy');
        }
      } else {
        const response = await apiService.createLeavePolicy(formData);
        if (response.success) {
          toast.success('Leave policy created successfully');
          setIsDialogOpen(false);
          loadLeavePolicies();
        } else {
          toast.error(response.message || 'Failed to create leave policy');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save leave policy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leave policy?')) return;
    try {
      const response = await apiService.deleteLeavePolicy(id);
      if (response.success) {
        toast.success('Leave policy deleted successfully');
        loadLeavePolicies();
      } else {
        toast.error(response.message || 'Failed to delete leave policy');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete leave policy');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Leave Policies</h1>
              <p className="text-muted-foreground mt-1">Configure leave types, balances, and accrual rules</p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            New Policy
          </Button>
        </div>

        {/* Leave Policies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Configured Leave Policies</CardTitle>
            <CardDescription>Manage leave types, days per year, and accrual settings</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading leave policies...</div>
            ) : leavePolicies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No leave policies configured yet</p>
                <p className="text-sm">Click "New Policy" to create one</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Leave Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Days/Year</th>
                      <th className="text-left py-3 px-4 font-semibold">Accrual Frequency</th>
                      <th className="text-left py-3 px-4 font-semibold">Carry Forward</th>
                      <th className="text-left py-3 px-4 font-semibold">Requires Approval</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leavePolicies.map((policy) => (
                      <tr key={policy._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{policy.leaveType}</td>
                        <td className="py-3 px-4">{policy.daysPerYear}</td>
                        <td className="py-3 px-4 capitalize">{policy.accrualFrequency || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${policy.carryForward ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {policy.carryForward ? `Yes (Max: ${policy.maxCarryForward})` : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${policy.requiresApproval ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                            {policy.requiresApproval ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${policy.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {policy.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(policy)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => policy._id && handleDeletePolicy(policy._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave Policy Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? 'Edit Leave Policy' : 'Create New Leave Policy'}
              </DialogTitle>
              <DialogDescription>
                {editingPolicy ? 'Update the leave policy details' : 'Create a new leave policy with accrual rules'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leave-type">Leave Type *</Label>
                <Input
                  id="leave-type"
                  placeholder="e.g., Casual Leave, Sick Leave"
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="days-per-year">Days Per Year *</Label>
                <Input
                  id="days-per-year"
                  type="number"
                  placeholder="e.g., 12"
                  value={formData.daysPerYear}
                  onChange={(e) => setFormData({ ...formData, daysPerYear: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accrual-frequency">Accrual Frequency</Label>
                <select
                  id="accrual-frequency"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.accrualFrequency}
                  onChange={(e) => setFormData({ ...formData, accrualFrequency: e.target.value })}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half Yearly">Half Yearly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accrual-rate">Accrual Rate (per period)</Label>
                <Input
                  id="accrual-rate"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 1.0"
                  value={formData.accrualRate}
                  onChange={(e) => setFormData({ ...formData, accrualRate: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accrual-date">Accrual Date (day of month)</Label>
                <Input
                  id="accrual-date"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="e.g., 1"
                  value={formData.accrualDate}
                  onChange={(e) => setFormData({ ...formData, accrualDate: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="e.g., Annual casual leave for all employees"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-4 border-t pt-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="carry-forward"
                    checked={formData.carryForward}
                    onChange={(e) => setFormData({ ...formData, carryForward: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="carry-forward">Allow Carry Forward</Label>
                </div>

                {formData.carryForward && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="max-carry-forward">Max Carry Forward Days</Label>
                    <Input
                      id="max-carry-forward"
                      type="number"
                      placeholder="e.g., 5"
                      value={formData.maxCarryForward}
                      onChange={(e) => setFormData({ ...formData, maxCarryForward: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="requires-approval"
                    checked={formData.requiresApproval}
                    onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="requires-approval">Requires Manager Approval</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePolicy} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {editingPolicy ? 'Update Policy' : 'Create Policy'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
