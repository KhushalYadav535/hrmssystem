'use client';

import { useState } from 'react';
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
import { CalendarIcon, UserPlus, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function DelegationPage() {
  const { isAuthenticated } = useAuth();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    delegatee: '',
    permissions: [] as string[],
    reason: '',
  });

  if (!isAuthenticated) {
    redirect('/login');
  }

  // Mock delegations
  const [delegations, setDelegations] = useState([
    {
      id: '1',
      delegatee: 'Priya Desai',
      delegateeEmail: 'priya.desai@indianbank.com',
      permissions: ['approve_leave', 'approve_travel'],
      startDate: '2026-02-01',
      endDate: '2026-02-15',
      status: 'active',
      reason: 'Manager on leave',
    },
    {
      id: '2',
      delegatee: 'Suresh Kumar',
      delegateeEmail: 'suresh.kumar@indianbank.com',
      permissions: ['approve_expense'],
      startDate: '2026-01-20',
      endDate: '2026-01-25',
      status: 'expired',
      reason: 'Temporary delegation',
    },
  ]);

  const availablePermissions = [
    { id: 'approve_leave', name: 'Approve Leave Applications' },
    { id: 'approve_travel', name: 'Approve Travel Requests' },
    { id: 'approve_expense', name: 'Approve Expense Claims' },
    { id: 'approve_appraisal', name: 'Approve Appraisals' },
  ];

  const handleCreateDelegation = () => {
    if (!formData.delegatee || !formData.permissions.length || !startDate || !endDate) {
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

    const newDelegation = {
      id: Date.now().toString(),
      delegatee: formData.delegatee,
      delegateeEmail: `${formData.delegatee.toLowerCase().replace(' ', '.')}@indianbank.com`,
      permissions: formData.permissions,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      status: 'active' as const,
      reason: formData.reason,
    };

    setDelegations([...delegations, newDelegation]);
    setShowCreateDialog(false);
    setFormData({ delegatee: '', permissions: [], reason: '' });
    setStartDate(undefined);
    setEndDate(undefined);
    toast.success('Delegation created successfully!');
  };

  const handleRevoke = (id: string) => {
    setDelegations(delegations.map(d => d.id === id ? { ...d, status: 'revoked' as const } : d));
    toast.success('Delegation revoked');
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

        {/* Active Delegations */}
        <Card>
          <CardHeader>
            <CardTitle>My Delegations</CardTitle>
            <CardDescription>Active and expired delegations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {delegations.map((delegation) => (
                <Card key={delegation.id} className={delegation.status === 'active' ? 'border-green-500' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold">{delegation.delegatee}</p>
                            <p className="text-sm text-muted-foreground">{delegation.delegateeEmail}</p>
                          </div>
                          <Badge className={
                            delegation.status === 'active' ? 'bg-green-600' :
                            delegation.status === 'expired' ? 'bg-gray-600' : 'bg-red-600'
                          }>
                            {delegation.status === 'active' ? 'Active' :
                             delegation.status === 'expired' ? 'Expired' : 'Revoked'}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Delegated Permissions:</p>
                          <div className="flex flex-wrap gap-2">
                            {delegation.permissions.map((perm) => {
                              const permName = availablePermissions.find(p => p.id === perm);
                              return permName ? (
                                <Badge key={perm} variant="outline">{permName.name}</Badge>
                              ) : null;
                            })}
                          </div>
                        </div>

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
                      </div>

                      {delegation.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevoke(delegation.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {delegations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No delegations created yet</p>
                </div>
              )}
            </div>
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
                <Select value={formData.delegatee} onValueChange={(value) => setFormData({ ...formData, delegatee: value })}>
                  <SelectTrigger id="delegatee">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Priya Desai">Priya Desai - Software Engineer</SelectItem>
                    <SelectItem value="Suresh Kumar">Suresh Kumar - HR Manager</SelectItem>
                    <SelectItem value="Rajesh Kumar">Rajesh Kumar - Senior Analyst</SelectItem>
                  </SelectContent>
                </Select>
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

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleCreateDelegation} className="flex-1">
                  Create Delegation
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
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
