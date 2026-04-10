'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import apiService from '@/lib/api';

interface WorkflowRule {
  _id?: string;
  name: string;
  module: string;
  action: string;
  approverRole: string;
  approvalLevel: number;
  status: string;
}

export default function WorkflowsPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    module: '',
    action: '',
    approverRole: '',
    approvalLevel: 1,
    status: 'Active',
  });

  const canAccess =
    hasPermission('configure_system') ||
    hasPermission('manage_settings') ||
    currentUser?.role === 'Tenant Admin' ||
    currentUser?.role === 'HR Administrator';

  if (!isAuthenticated || !canAccess) {
    redirect('/dashboard');
  }

  useEffect(() => {
    loadWorkflowRules();
  }, []);

  const loadWorkflowRules = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getWorkflowRules?.();
      if (response?.success && response?.data) {
        setWorkflowRules(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load workflow rules:', error);
      setWorkflowRules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (rule?: WorkflowRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        module: rule.module,
        action: rule.action,
        approverRole: rule.approverRole,
        approvalLevel: rule.approvalLevel,
        status: rule.status,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        module: '',
        action: '',
        approverRole: '',
        approvalLevel: 1,
        status: 'Active',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveRule = async () => {
    try {
      setIsLoading(true);
      if (editingRule) {
        const response = await apiService.updateWorkflowRule(editingRule._id!, formData);
        if (response?.success) {
          toast.success('Workflow rule updated successfully');
          setIsDialogOpen(false);
          loadWorkflowRules();
        } else {
          toast.error(response?.message || 'Failed to update workflow rule');
        }
      } else {
        const response = await apiService.createWorkflowRule(formData);
        if (response?.success) {
          toast.success('Workflow rule created successfully');
          setIsDialogOpen(false);
          loadWorkflowRules();
        } else {
          toast.error(response?.message || 'Failed to create workflow rule');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save workflow rule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow rule?')) return;
    try {
      const response = await apiService.deleteWorkflowRule(id);
      if (response?.success) {
        toast.success('Workflow rule deleted successfully');
        loadWorkflowRules();
      } else {
        toast.error(response?.message || 'Failed to delete workflow rule');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete workflow rule');
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
              <h1 className="text-3xl font-bold">Workflow Rules</h1>
              <p className="text-muted-foreground mt-1">Configure approval workflows and rules</p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            New Workflow Rule
          </Button>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">How this works</CardTitle>
            <CardDescription>
              Rules are saved in the database per tenant and returned by the Workflow Rules API. Feature modules (leave,
              expense, etc.) can read these rules to drive approval steps when that integration is enabled.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Workflow Rules Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Workflow Rules</CardTitle>
            <CardDescription>Manage approval hierarchies and workflow configurations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading workflow rules...</div>
            ) : workflowRules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No workflow rules configured yet</p>
                <p className="text-sm">Click "New Workflow Rule" to create one</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Module</th>
                      <th className="text-left py-3 px-4 font-semibold">Action</th>
                      <th className="text-left py-3 px-4 font-semibold">Approver Role</th>
                      <th className="text-left py-3 px-4 font-semibold">Level</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflowRules.map((rule) => (
                      <tr key={rule._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{rule.name}</td>
                        <td className="py-3 px-4 capitalize">{rule.module}</td>
                        <td className="py-3 px-4 capitalize">{rule.action}</td>
                        <td className="py-3 px-4 capitalize">{rule.approverRole}</td>
                        <td className="py-3 px-4">{rule.approvalLevel}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${rule.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {rule.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(rule)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rule._id && handleDeleteRule(rule._id)}
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

        {/* Workflow Rule Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Workflow Rule' : 'Create Workflow Rule'}
              </DialogTitle>
              <DialogDescription>
                {editingRule ? 'Update the workflow rule details' : 'Create a new approval workflow rule'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  placeholder="e.g., Leave Approval - HR"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="module">Module</Label>
                <Select value={formData.module} onValueChange={(value) => setFormData({ ...formData, module: value })}>
                  <SelectTrigger id="module">
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leave">Leave</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="recruitment">Recruitment</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="reimbursement">Reimbursement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                  <SelectTrigger id="action">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approval">Approval</SelectItem>
                    <SelectItem value="rejection">Rejection</SelectItem>
                    <SelectItem value="verification">Verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approver-role">Approver Role</Label>
                <Select value={formData.approverRole} onValueChange={(value) => setFormData({ ...formData, approverRole: value })}>
                  <SelectTrigger id="approver-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR Administrator">HR Administrator</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="CEO">CEO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Approval Level</Label>
                <Select value={formData.approvalLevel.toString()} onValueChange={(value) => setFormData({ ...formData, approvalLevel: parseInt(value) })}>
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRule} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
