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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CalendarIcon, Plus, CheckCircle2, XCircle, Clock, Loader2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import apiService from '@/lib/api';

interface CertificationCampaign {
  _id: string;
  campaignName: string;
  campaignType: 'Quarterly' | 'Annual' | 'Ad-hoc';
  startDate: string;
  endDate: string;
  deadline: string;
  certifierId: {
    _id: string;
    name: string;
    email: string;
  };
  certifications: Array<{
    userId: {
      _id: string;
      name: string;
      email: string;
    };
    roles: string[];
    permissions: string[];
    status: 'Pending' | 'Certified' | 'Changes Requested' | 'Overdue';
    certifiedDate?: string;
    changesRequested?: Array<{
      type: string;
      role?: string;
      permission?: string;
      reason: string;
    }>;
    comments?: string;
  }>;
  status: 'Draft' | 'Active' | 'In Progress' | 'Completed' | 'Cancelled';
  completedDate?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function AccessCertificationPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [campaigns, setCampaigns] = useState<CertificationCampaign[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CertificationCampaign | null>(null);
  const [showCertifyDialog, setShowCertifyDialog] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    campaignName: '',
    campaignType: 'Quarterly' as 'Quarterly' | 'Annual' | 'Ad-hoc',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    deadline: undefined as Date | undefined,
    certifierId: '',
    userIds: [] as string[],
  });
  const [certifyFormData, setCertifyFormData] = useState({
    status: 'Certified' as 'Certified' | 'Changes Requested',
    changesRequested: [] as Array<{
      type: 'Revoke Role' | 'Revoke Permission' | 'Add Role' | 'Add Permission';
      role?: string;
      permission?: string;
      reason: string;
    }>,
    comments: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadCampaigns();
      loadUsers();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !hasPermission('manage_users')) {
    redirect('/dashboard');
  }

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCertificationCampaigns();
      if (response.success && response.data) {
        setCampaigns(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load certification campaigns');
      console.error('Load campaigns error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers();
      if (response.success && response.data) {
        setUsers(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      console.error('Load users error:', error);
    }
  };

  const handleCreateCampaign = async () => {
    if (!formData.campaignName || !formData.startDate || !formData.endDate || !formData.deadline || !formData.certifierId || formData.userIds.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiService.createCertificationCampaign({
        campaignName: formData.campaignName,
        campaignType: formData.campaignType,
        startDate: format(formData.startDate!, 'yyyy-MM-dd'),
        endDate: format(formData.endDate!, 'yyyy-MM-dd'),
        deadline: format(formData.deadline!, 'yyyy-MM-dd'),
        certifierId: formData.certifierId,
        userIds: formData.userIds,
      });

      if (response.success) {
        toast.success('Certification campaign created successfully!');
        setShowCreateDialog(false);
        setFormData({
          campaignName: '',
          campaignType: 'Quarterly',
          startDate: undefined,
          endDate: undefined,
          deadline: undefined,
          certifierId: '',
          userIds: [],
        });
        loadCampaigns();
      } else {
        toast.error(response.message || 'Failed to create campaign');
      }
    } catch (error: any) {
      toast.error('Failed to create campaign');
      console.error('Create campaign error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCertify = async () => {
    if (!selectedCampaign || !selectedCertification) return;

    try {
      setIsSubmitting(true);
      const response = await apiService.certifyUserAccess(
        selectedCampaign._id,
        selectedCertification.userId._id || selectedCertification.userId,
        {
          status: certifyFormData.status,
          changesRequested: certifyFormData.changesRequested.length > 0 ? certifyFormData.changesRequested : undefined,
          comments: certifyFormData.comments || undefined,
        }
      );

      if (response.success) {
        toast.success('Access certified successfully!');
        setShowCertifyDialog(false);
        setSelectedCertification(null);
        setCertifyFormData({
          status: 'Certified',
          changesRequested: [],
          comments: '',
        });
        loadCampaigns();
      } else {
        toast.error(response.message || 'Failed to certify access');
      }
    } catch (error: any) {
      toast.error('Failed to certify access');
      console.error('Certify error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkCertify = async (campaignId: string, userIds: string[], status: 'Certified' | 'Changes Requested') => {
    try {
      const response = await apiService.bulkCertify(campaignId, userIds, status);
      if (response.success) {
        toast.success('Bulk certification completed');
        loadCampaigns();
      } else {
        toast.error(response.message || 'Failed to bulk certify');
      }
    } catch (error: any) {
      toast.error('Failed to bulk certify');
      console.error('Bulk certify error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Active: 'bg-green-600',
      Draft: 'bg-gray-600',
      'In Progress': 'bg-yellow-600',
      Completed: 'bg-blue-600',
      Cancelled: 'bg-red-600',
    };
    return <Badge className={variants[status] || 'bg-gray-600'}>{status}</Badge>;
  };

  const getCertificationStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Certified: 'bg-green-600',
      Pending: 'bg-yellow-600',
      'Changes Requested': 'bg-orange-600',
      Overdue: 'bg-red-600',
    };
    return <Badge className={variants[status] || 'bg-gray-600'}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Access Certification</h1>
            <p className="text-muted-foreground mt-2">Periodic review and certification of user access rights</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{campaign.campaignName}</CardTitle>
                      <CardDescription>
                        {campaign.campaignType} Campaign • Certifier: {typeof campaign.certifierId === 'object' ? campaign.certifierId.name : 'Unknown'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">{format(new Date(campaign.startDate), 'PPP')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">{format(new Date(campaign.endDate), 'PPP')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deadline</p>
                      <p className="font-medium">{format(new Date(campaign.deadline), 'PPP')}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">Certifications ({campaign.certifications.length})</p>
                    <div className="space-y-2">
                      {campaign.certifications.map((cert, idx) => {
                        const userId = typeof cert.userId === 'object' ? cert.userId._id : cert.userId;
                        const userName = typeof cert.userId === 'object' ? cert.userId.name : 'Unknown';
                        const userEmail = typeof cert.userId === 'object' ? cert.userId.email : '';
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{userName}</p>
                              <p className="text-sm text-muted-foreground">{userEmail}</p>
                              <div className="flex gap-2 mt-2">
                                {cert.roles.map((role) => (
                                  <Badge key={role} variant="outline">{role}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getCertificationStatusBadge(cert.status)}
                              {cert.status === 'Pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCampaign(campaign);
                                    setSelectedCertification(cert);
                                    setShowCertifyDialog(true);
                                  }}
                                >
                                  Certify
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {campaign.status === 'Active' && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const pendingUserIds = campaign.certifications
                            .filter(c => c.status === 'Pending')
                            .map(c => typeof c.userId === 'object' ? c.userId._id : c.userId);
                          if (pendingUserIds.length > 0) {
                            handleBulkCertify(campaign._id, pendingUserIds, 'Certified');
                          }
                        }}
                      >
                        Bulk Certify All
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}

          {campaigns.length === 0 && !isLoading && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No certification campaigns created yet</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Create Campaign Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Certification Campaign</DialogTitle>
              <DialogDescription>Create a new access certification campaign</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Campaign Name <span className="text-red-500">*</span></Label>
                <Input
                  id="campaignName"
                  value={formData.campaignName}
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  placeholder="e.g., Q1 2026 Access Review"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaignType">Campaign Type <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.campaignType}
                  onValueChange={(value: 'Quarterly' | 'Annual' | 'Ad-hoc') => setFormData({ ...formData, campaignType: value })}
                >
                  <SelectTrigger id="campaignType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                    <SelectItem value="Ad-hoc">Ad-hoc</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Start Date <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !formData.startDate && 'text-muted-foreground')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={formData.startDate} onSelect={(date) => setFormData({ ...formData, startDate: date })} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !formData.endDate && 'text-muted-foreground')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={formData.endDate} onSelect={(date) => setFormData({ ...formData, endDate: date })} disabled={(date) => formData.startDate ? date < formData.startDate : false} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Deadline <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !formData.deadline && 'text-muted-foreground')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deadline ? format(formData.deadline, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={formData.deadline} onSelect={(date) => setFormData({ ...formData, deadline: date })} disabled={(date) => formData.endDate ? date < formData.endDate : false} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifierId">Certifier <span className="text-red-500">*</span></Label>
                <Select value={formData.certifierId} onValueChange={(value) => setFormData({ ...formData, certifierId: value })}>
                  <SelectTrigger id="certifierId">
                    <SelectValue placeholder="Select certifier" />
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
                <Label>Users to Certify <span className="text-red-500">*</span></Label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {users.map((u) => (
                    <div key={u._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`user-${u._id}`}
                        checked={formData.userIds.includes(u._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, userIds: [...formData.userIds, u._id] });
                          } else {
                            setFormData({ ...formData, userIds: formData.userIds.filter(id => id !== u._id) });
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`user-${u._id}`} className="cursor-pointer flex-1">
                        {u.name} - {u.role}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Certify Dialog */}
        <Dialog open={showCertifyDialog} onOpenChange={setShowCertifyDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Certify User Access</DialogTitle>
              <DialogDescription>
                Review and certify access for {selectedCertification && (typeof selectedCertification.userId === 'object' ? selectedCertification.userId.name : 'user')}
              </DialogDescription>
            </DialogHeader>
            {selectedCertification && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2">Current Roles:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCertification.roles.map((role: string) => (
                      <Badge key={role}>{role}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Current Permissions:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCertification.permissions.map((perm: string) => (
                      <Badge key={perm} variant="outline">{perm}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Certification Status <span className="text-red-500">*</span></Label>
                  <Select
                    value={certifyFormData.status}
                    onValueChange={(value: 'Certified' | 'Changes Requested') => setCertifyFormData({ ...certifyFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Certified">Certified</SelectItem>
                      <SelectItem value="Changes Requested">Changes Requested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {certifyFormData.status === 'Changes Requested' && (
                  <div className="space-y-2">
                    <Label>Requested Changes</Label>
                    <Textarea
                      placeholder="Describe the changes needed..."
                      value={certifyFormData.comments}
                      onChange={(e) => setCertifyFormData({ ...certifyFormData, comments: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}

                {certifyFormData.status === 'Certified' && (
                  <div className="space-y-2">
                    <Label>Comments (Optional)</Label>
                    <Textarea
                      placeholder="Add any comments..."
                      value={certifyFormData.comments}
                      onChange={(e) => setCertifyFormData({ ...certifyFormData, comments: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCertifyDialog(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleCertify} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Certifying...
                  </>
                ) : (
                  'Certify'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
