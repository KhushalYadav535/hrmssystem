'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, UserPlus, Trash2, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import apiService from '@/lib/api';

interface Delegation {
  _id: string;
  delegatorId: {
    _id: string;
    name: string;
    email: string;
  };
  delegateeId: {
    _id: string;
    name: string;
    email: string;
  };
  permissions: string[];
  modules?: string[];
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Active' | 'Expired' | 'Revoked' | 'Completed';
  requiresApproval?: boolean;
  approvedBy?: {
    _id: string;
    name: string;
  };
  approvedDate?: string;
  revokedBy?: {
    _id: string;
    name: string;
  };
  revokedDate?: string;
  revocationReason?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function DelegationPage() {
  const { isAuthenticated, user } = useAuth();
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    delegateeId: '',
    permissions: [] as string[],
    modules: [] as string[],
    reason: '',
    requiresApproval: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadDelegations();
      loadUsers();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    redirect('/login');
  }

  const loadDelegations = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getDelegations();
      if (response.success && response.data) {
        setDelegations(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load delegations');
      console.error('Load delegations error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers();
      if (response.success && response.data) {
        const userList = Array.isArray(response.data) ? response.data : [];
        // Filter out current user
        setUsers(userList.filter((u: User) => u._id !== user?.id));
      }
    } catch (error: any) {
      console.error('Load users error:', error);
    }
  };

  const availablePermissions = [
    { id: 'approve_leave', name: 'Approve Leave Applications' },
    { id: 'approve_travel', name: 'Approve Travel Requests' },
    { id: 'approve_expense', name: 'Approve Expense Claims' },
    { id: 'approve_appraisal', name: 'Approve Appraisals' },
    { id: 'approve_payroll', name: 'Approve Payroll' },
  ];

  const availableModules = [
    { id: 'Leave', name: 'Leave Management' },
    { id: 'Travel', name: 'Travel & Expense' },
    { id: 'Expense', name: 'Expense Management' },
    { id: 'Appraisal', name: 'Performance Appraisal' },
    { id: 'Payroll', name: 'Payroll' },
    { id: 'All', name: 'All Modules' },
  ];

  const handleCreateDelegation = async () => {
    if (!formData.delegateeId || !formData.permissions.length || !startDate || !endDate || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    if (endDate < startDate) {
      toast.error('End date must be after start date');
      return;
    }

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 90) {
      toast.error('Delegation cannot exceed 90 days');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiService.createDelegation({
        delegateeId: formData.delegateeId,
        permissions: formData.permissions,
        modules: formData.modules.length > 0 ? formData.modules : undefined,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        reason: formData.reason,
        requiresApproval: formData.requiresApproval,
      });

      if (response.success) {
        toast.success('Delegation created successfully!');
        setShowCreateDialog(false);
        setFormData({ delegateeId: '', permissions: [], modules: [], reason: '', requiresApproval: false });
        setStartDate(undefined);
        setEndDate(undefined);
        loadDelegations();
      } else {
        toast.error(response.message || 'Failed to create delegation');
      }
    } catch (error: any) {
      toast.error('Failed to create delegation');
      console.error('Create delegation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this delegation?')) {
      return;
    }

    try {
      const response = await apiService.revokeDelegation(id, 'Revoked by delegator');
      if (response.success) {
        toast.success('Delegation revoked');
        loadDelegations();
      } else {
        toast.error(response.message || 'Failed to revoke delegation');
      }
    } catch (error: any) {
      toast.error('Failed to revoke delegation');
      console.error('Revoke delegation error:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await apiService.approveDelegation(id);
      if (response.success) {
        toast.success('Delegation approved');
        loadDelegations();
      } else {
        toast.error(response.message || 'Failed to approve delegation');
      }
    } catch (error: any) {
      toast.error('Failed to approve delegation');
      console.error('Approve delegation error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Active: 'bg-green-600',
      Pending: 'bg-yellow-600',
      Expired: 'bg-gray-600',
      Revoked: 'bg-red-600',
      Completed: 'bg-blue-600',
    };
    return <Badge className={variants[status] || 'bg-gray-600'}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Delegation Management</h1>
            <p className="text-muted-foreground mt-2">Delegate your approval authority to team members</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Create Delegation
          </Button>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Delegation Policy</p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>Maximum delegation period: 90 days</li>
                  <li>You can only delegate permissions you have</li>
                  <li>Delegated user cannot further delegate (no cascading)</li>
                  <li>All delegated actions are tagged in audit log</li>
                  <li>Delegation automatically expires on end date</li>
                  <li>You can revoke delegation anytime before expiry</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delegations List */}
        <Card>
          <CardHeader>
            <CardTitle>My Delegations</CardTitle>
            <CardDescription>Active and expired delegations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {delegations.map((delegation) => (
                  <Card key={delegation._id} className={delegation.status === 'Active' ? 'border-green-500' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-semibold">
                                {typeof delegation.delegateeId === 'object' 
                                  ? delegation.delegateeId.name 
                                  : 'Unknown User'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {typeof delegation.delegateeId === 'object' 
                                  ? delegation.delegateeId.email 
                                  : ''}
                              </p>
                            </div>
                            {getStatusBadge(delegation.status)}
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-semibold">Delegated Permissions:</p>
                            <div className="flex flex-wrap gap-2">
                              {delegation.permissions.map((perm) => {
                                const permName = availablePermissions.find(p => p.id === perm);
                                return permName ? (
                                  <Badge key={perm} variant="outline">{permName.name}</Badge>
                                ) : (
                                  <Badge key={perm} variant="outline">{perm}</Badge>
                                );
                              })}
                            </div>
                          </div>

                          {delegation.modules && delegation.modules.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold">Modules:</p>
                              <div className="flex flex-wrap gap-2">
                                {delegation.modules.map((module) => (
                                  <Badge key={module} variant="secondary">{module}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Start Date</p>
                              <p className="font-medium">{format(new Date(delegation.startDate), 'PPP')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">End Date</p>
                              <p className="font-medium">{format(new Date(delegation.endDate), 'PPP')}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Reason</p>
                            <p className="text-sm">{delegation.reason}</p>
                          </div>

                          {delegation.requiresApproval && delegation.status === 'Pending' && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                This delegation requires approval
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {delegation.status === 'Active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevoke(delegation._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Revoke
                            </Button>
                          )}
                          {delegation.status === 'Pending' && delegation.requiresApproval && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(delegation._id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {delegations.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No delegations created yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Delegation Dialog */}
        {showCreateDialog && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Create New Delegation</CardTitle>
              <CardDescription>Delegate approval authority to a team member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="delegatee">Delegate To <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.delegateeId} 
                  onValueChange={(value) => setFormData({ ...formData, delegateeId: value })}
                >
                  <SelectTrigger id="delegatee">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.name} - {u.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Modules to Delegate</Label>
                <div className="space-y-2">
                  {availableModules.map((module) => (
                    <div key={module.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50">
                      <input
                        type="checkbox"
                        id={`module-${module.id}`}
                        checked={formData.modules.includes(module.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, modules: [...formData.modules, module.id] });
                          } else {
                            setFormData({ ...formData, modules: formData.modules.filter(m => m !== module.id) });
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`module-${module.id}`} className="cursor-pointer flex-1">
                        {module.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Permissions to Delegate <span className="text-red-500">*</span></Label>
                <div className="space-y-2">
                  {availablePermissions.map((perm) => (
                    <div key={perm.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50">
                      <input
                        type="checkbox"
                        id={perm.id}
                        checked={formData.permissions.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, permissions: [...formData.permissions, perm.id] });
                          } else {
                            setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm.id) });
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={perm.id} className="cursor-pointer flex-1">
                        {perm.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : 'Select start date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : 'Select end date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        disabled={(date) => startDate ? date < startDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {startDate && endDate && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <strong>Delegation Period:</strong> {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                    {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) > 90 && (
                      <span className="text-red-600 ml-2">(Exceeds 90-day limit)</span>
                    )}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Delegation <span className="text-red-500">*</span></Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why you're delegating authority..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresApproval"
                  checked={formData.requiresApproval}
                  onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="requiresApproval" className="cursor-pointer">
                  Requires approval from manager
                </Label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={handleCreateDelegation} 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Delegation'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
