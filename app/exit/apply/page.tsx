'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ExitApplyPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    separationType: '',
    resignationDate: format(new Date(), 'yyyy-MM-dd'),
    lastWorkingDate: '',
    noticePeriodDays: '',
    resignationReason: '',
    resignationLetterUrl: '',
  });

  useEffect(() => {
    if (!currentUser) {
      redirect('/login');
    }
  }, [currentUser]);

  const calculateLastWorkingDate = (resignationDate: string, noticeDays: number) => {
    if (!resignationDate || !noticeDays) return '';
    const date = new Date(resignationDate);
    date.setDate(date.getDate() + parseInt(noticeDays));
    return format(date, 'yyyy-MM-dd');
  };

  const handleNoticePeriodChange = (value: string) => {
    setFormData({
      ...formData,
      noticePeriodDays: value,
      lastWorkingDate: calculateLastWorkingDate(formData.resignationDate, value),
    });
  };

  const handleResignationDateChange = (value: string) => {
    setFormData({
      ...formData,
      resignationDate: value,
      lastWorkingDate: calculateLastWorkingDate(value, formData.noticePeriodDays),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.separationType || !formData.lastWorkingDate) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiService.submitResignation({
        separationType: formData.separationType,
        resignationDate: formData.resignationDate,
        lastWorkingDate: formData.lastWorkingDate,
        noticePeriodDays: formData.noticePeriodDays ? parseInt(formData.noticePeriodDays) : undefined,
        resignationReason: formData.resignationReason || undefined,
        resignationLetterUrl: formData.resignationLetterUrl || undefined,
      });

      if (response.success) {
        toast.success('Resignation submitted successfully');
        window.location.href = '/exit/my-separation';
      } else {
        toast.error(response.message || 'Failed to submit resignation');
      }
    } catch (error: any) {
      toast.error('Error submitting resignation');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Submit Resignation</h1>
          <p className="text-muted-foreground mt-1">
            Submit your resignation and initiate the exit process
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resignation Details</CardTitle>
              <CardDescription>Fill in the details to submit your resignation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Separation Type *</Label>
                <Select
                  value={formData.separationType}
                  onValueChange={(value) => setFormData({ ...formData, separationType: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select separation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESIGNATION">Voluntary Resignation</SelectItem>
                    <SelectItem value="RETIREMENT">Retirement</SelectItem>
                    <SelectItem value="VRS">Voluntary Retirement Scheme (VRS)</SelectItem>
                    <SelectItem value="TERMINATION">Termination</SelectItem>
                    <SelectItem value="ABSCONDING">Absconding</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Resignation Date *</Label>
                  <Input
                    type="date"
                    value={formData.resignationDate}
                    onChange={(e) => handleResignationDateChange(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Notice Period (Days)</Label>
                  <Input
                    type="number"
                    value={formData.noticePeriodDays}
                    onChange={(e) => handleNoticePeriodChange(e.target.value)}
                    placeholder="e.g., 30, 60, 90"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default: 30 days (will be calculated based on your grade)
                  </p>
                </div>
              </div>

              <div>
                <Label>Last Working Date *</Label>
                <Input
                  type="date"
                  value={formData.lastWorkingDate}
                  onChange={(e) => setFormData({ ...formData, lastWorkingDate: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your last working day with the organization
                </p>
              </div>

              <div>
                <Label>Reason for Resignation</Label>
                <Textarea
                  value={formData.resignationReason}
                  onChange={(e) => setFormData({ ...formData, resignationReason: e.target.value })}
                  placeholder="Please provide reason for resignation..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Resignation Letter (URL)</Label>
                <Input
                  type="url"
                  value={formData.resignationLetterUrl}
                  onChange={(e) => setFormData({ ...formData, resignationLetterUrl: e.target.value })}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your resignation letter and paste the URL here
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Once submitted, your resignation will be sent to your manager for approval.
              You will be able to track the status of your exit process from the Exit Management page.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Resignation'
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
