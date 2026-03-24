'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Calendar, Loader2, Play, Edit } from 'lucide-react';
import apiService from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const CYCLE_TYPES = ['ANNUAL', 'HALF_YEARLY', 'QUARTERLY', 'PROBATION_REVIEW'];
const APPLICABLE_TO = ['ALL', 'DEPARTMENTS', 'GRADES'];

export default function AppraisalCyclesPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const { toast } = useToast();
  const [cycles, setCycles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cycleName: '',
    cycleType: 'ANNUAL',
    startDate: '',
    endDate: '',
    selfAssessmentDeadline: '',
    managerReviewDeadline: '',
    normalizationDeadline: '',
    applicableTo: 'ALL',
    applicableDepartments: [] as string[],
  });

  const canManage = ['HR Administrator', 'Tenant Admin', 'Super Admin'].includes(currentUser?.role || '');
  if (!isAuthenticated || !canManage) {
    redirect('/dashboard');
  }

  useEffect(() => {
    loadCycles();
    loadDepartments();
  }, []);

  const loadCycles = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.getAppraisalCycles();
      if (res.success && res.data) {
        setCycles(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to load cycles', error);
      toast({ title: 'Error', description: 'Failed to load appraisal cycles', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await apiService.getDepartments();
      if (res.success && res.data) {
        setDepartments(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to load departments', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cycleName || !formData.startDate || !formData.endDate) {
      toast({ title: 'Error', description: 'Fill required fields', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        cycleName: formData.cycleName,
        cycleType: formData.cycleType,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        selfAssessmentDeadline: formData.selfAssessmentDeadline
          ? new Date(formData.selfAssessmentDeadline).toISOString()
          : new Date(formData.endDate).toISOString(),
        managerReviewDeadline: formData.managerReviewDeadline
          ? new Date(formData.managerReviewDeadline).toISOString()
          : new Date(formData.endDate).toISOString(),
        normalizationDeadline: formData.normalizationDeadline
          ? new Date(formData.normalizationDeadline).toISOString()
          : new Date(formData.endDate).toISOString(),
        applicableTo: formData.applicableTo,
        applicableDepartments: formData.applicableTo === 'DEPARTMENTS' ? formData.applicableDepartments : [],
      };
      const res = await apiService.createAppraisalCycle(payload);
      if (res.success) {
        toast({ title: 'Success', description: 'Appraisal cycle created' });
        setIsDialogOpen(false);
        setFormData({ cycleName: '', cycleType: 'ANNUAL', startDate: '', endDate: '', selfAssessmentDeadline: '', managerReviewDeadline: '', normalizationDeadline: '', applicableTo: 'ALL', applicableDepartments: [] });
        loadCycles();
      } else {
        toast({ title: 'Error', description: res.message || 'Failed', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const res = await apiService.activateAppraisalCycle(id);
      if (res.success) {
        toast({ title: 'Success', description: 'Cycle activated' });
        loadCycles();
      } else {
        toast({ title: 'Error', description: res.message || 'Failed', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'ACTIVE':
        return <Badge className="bg-green-600">Active</Badge>;
      case 'CLOSED':
      case 'Completed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Appraisal Cycles</h1>
            <p className="text-muted-foreground mt-2">Create and manage appraisal cycles for performance reviews</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Cycle
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : cycles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No appraisal cycles yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Create a cycle to start the appraisal workflow.</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>Create Cycle</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {cycles.map((cycle) => (
              <Card key={cycle._id || cycle.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{cycle.cycleName}</CardTitle>
                      <CardDescription>
                        {cycle.cycleType} • {cycle.startDate ? formatDateDDMMYYYY(cycle.startDate) : '-'} to {cycle.endDate ? formatDateDDMMYYYY(cycle.endDate) : '-'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(cycle.status)}
                      {cycle.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => handleActivate(cycle._id || cycle.id)}
                        >
                          <Play className="w-4 h-4" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Self Assessment Deadline</p>
                      <p className="font-medium">{cycle.selfAssessmentDeadline ? formatDateDDMMYYYY(cycle.selfAssessmentDeadline) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Manager Review Deadline</p>
                      <p className="font-medium">{cycle.managerReviewDeadline ? formatDateDDMMYYYY(cycle.managerReviewDeadline) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Normalization Deadline</p>
                      <p className="font-medium">{cycle.normalizationDeadline ? formatDateDDMMYYYY(cycle.normalizationDeadline) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Applicable To</p>
                      <p className="font-medium">{cycle.applicableTo} {cycle.applicableDepartments?.length ? `(${cycle.applicableDepartments.length} depts)` : ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create Appraisal Cycle</DialogTitle>
              <DialogDescription>Set up a new appraisal cycle for performance reviews.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Cycle Name *</Label>
                <Input
                  value={formData.cycleName}
                  onChange={(e) => setFormData({ ...formData, cycleName: e.target.value })}
                  placeholder="e.g. FY 2026 Annual Review"
                  required
                />
              </div>
              <div>
                <Label>Cycle Type</Label>
                <Select value={formData.cycleType} onValueChange={(v) => setFormData({ ...formData, cycleType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CYCLE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Self Assessment Deadline</Label>
                  <Input
                    type="date"
                    value={formData.selfAssessmentDeadline}
                    onChange={(e) => setFormData({ ...formData, selfAssessmentDeadline: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Manager Review Deadline</Label>
                  <Input
                    type="date"
                    value={formData.managerReviewDeadline}
                    onChange={(e) => setFormData({ ...formData, managerReviewDeadline: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Normalization Deadline</Label>
                  <Input
                    type="date"
                    value={formData.normalizationDeadline}
                    onChange={(e) => setFormData({ ...formData, normalizationDeadline: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Applicable To</Label>
                <Select value={formData.applicableTo} onValueChange={(v) => setFormData({ ...formData, applicableTo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {APPLICABLE_TO.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.applicableTo === 'DEPARTMENTS' && (
                <div>
                  <Label>Departments</Label>
                  <Select
                    onValueChange={(v) => {
                      if (v && !formData.applicableDepartments.includes(v)) {
                        setFormData({ ...formData, applicableDepartments: [...formData.applicableDepartments, v] });
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Add department" /></SelectTrigger>
                    <SelectContent>
                      {departments.filter((d) => !formData.applicableDepartments.includes(d.name || d._id)).map((d) => (
                        <SelectItem key={d._id} value={d.name || d._id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.applicableDepartments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.applicableDepartments.map((dept) => (
                        <Badge key={dept} variant="secondary" className="cursor-pointer" onClick={() => setFormData({ ...formData, applicableDepartments: formData.applicableDepartments.filter((d) => d !== dept) })}>
                          {dept} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</> : 'Create Cycle'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
