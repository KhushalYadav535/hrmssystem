'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Loader2, UserPen } from 'lucide-react';
import apiService from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const REQUEST_TYPES = [
  { value: 'PERSONAL', label: 'Personal Info' },
  { value: 'CONTACT', label: 'Contact' },
  { value: 'ADDRESS', label: 'Address' },
  { value: 'BANK', label: 'Bank Details' },
  { value: 'OTHER', label: 'Other' },
];

const ALLOWED_FIELDS: { field: string; label: string; type: string }[] = [
  { field: 'phone', label: 'Phone Number', type: 'tel' },
  { field: 'address', label: 'Address', type: 'text' },
  { field: 'bloodGroup', label: 'Blood Group', type: 'text' },
  { field: 'maritalStatus', label: 'Marital Status', type: 'text' },
  { field: 'passportNumber', label: 'Passport Number', type: 'text' },
];

export default function ProfileUpdatePage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    requestType: 'PERSONAL',
    reason: '',
    fields: {} as Record<string, string>,
  });

  if (!isAuthenticated) redirect('/login');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const empRes = await apiService.getEmployees({ email: user?.email });
      if (empRes.success && empRes.data && Array.isArray(empRes.data) && empRes.data.length > 0) {
        setEmployee(empRes.data[0]);
      }
      const res = await apiService.getProfileUpdateRequests();
      if (res.success && res.data) {
        setRequests(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to load data', error);
      toast({ title: 'Error', description: 'Failed to load requests', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const requestedFields = ALLOWED_FIELDS
      .filter((f) => formData.fields[f.field] !== undefined && String(formData.fields[f.field]).trim() !== '')
      .map((f) => ({
        field: f.field,
        requestedValue: formData.fields[f.field],
        label: f.label,
      }));

    if (requestedFields.length === 0) {
      toast({ title: 'Error', description: 'Please provide at least one field to update', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiService.createProfileUpdateRequest({
        requestType: formData.requestType,
        requestedFields,
        reason: formData.reason.trim() || undefined,
      });
      if (response.success) {
        toast({ title: 'Success', description: 'Profile update request submitted successfully' });
        setIsDialogOpen(false);
        setFormData({ requestType: 'PERSONAL', reason: '', fields: {} });
        loadData();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to submit', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to submit', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case 'Approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile Update Requests</h1>
            <p className="text-muted-foreground mt-2">Request updates to your profile information</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <UserPen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No profile update requests yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Click "New Request" to request changes to your profile.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req._id || req.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {REQUEST_TYPES.find((t) => t.value === req.requestType)?.label || req.requestType}
                      </CardTitle>
                      <CardDescription>
                        {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : '-'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {req.requestedFields?.map((f: any, i: number) => (
                      <div key={i} className="flex gap-4 text-sm">
                        <span className="text-muted-foreground w-32">{f.label || f.field}:</span>
                        <span className="line-through text-muted-foreground">{String(f.currentValue || '-')}</span>
                        <span className="text-green-600 font-medium">→ {String(f.requestedValue || '-')}</span>
                      </div>
                    ))}
                  </div>
                  {req.reason && (
                    <p className="text-sm text-muted-foreground mt-3">Reason: {req.reason}</p>
                  )}
                  {req.status !== 'Pending' && req.reviewComments && (
                    <p className="text-sm mt-2 p-2 bg-secondary/50 rounded">Review: {req.reviewComments}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request Profile Update</DialogTitle>
              <DialogDescription>Enter the new values for the fields you want to update. HR will review your request.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Request Type</Label>
                <Select value={formData.requestType} onValueChange={(v) => setFormData({ ...formData, requestType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {ALLOWED_FIELDS.map((f) => (
                <div key={f.field}>
                  <Label>{f.label}</Label>
                  <Input
                    type={f.type}
                    placeholder={`Current: ${employee?.[f.field] || '-'}`}
                    value={formData.fields[f.field] || ''}
                    onChange={(e) => setFormData({ ...formData, fields: { ...formData.fields, [f.field]: e.target.value } })}
                  />
                </div>
              ))}
              <div>
                <Label>Reason (optional)</Label>
                <Textarea
                  placeholder="Brief reason for the update"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
