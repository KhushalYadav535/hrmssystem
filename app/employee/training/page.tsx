'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect, useParams, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, X, Save, CheckCircle2, Award, TrendingUp, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Training {
  _id?: string;
  id?: string;
  employeeId: string;
  employeeName?: string;
  trainingProgram: string;
  trainingType: string;
  trainingCategory: string;
  provider?: string;
  startDate: string;
  endDate: string;
  duration?: number;
  location?: string;
  cost?: number;
  status: string;
  assessmentScore?: number;
  grade?: string;
  passed?: boolean;
  certificateIssued?: boolean;
}

function TrainingHistoryContent() {
  const { isAuthenticated, currentUser } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('employeeId') || params?.id || currentUser?.id;

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [statistics, setStatistics] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<Training>>({
    trainingProgram: '',
    trainingType: 'Internal',
    trainingCategory: 'Technical',
    provider: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    location: '',
    cost: 0,
    status: 'Scheduled',
  });

  if (!isAuthenticated) redirect('/login');

  useEffect(() => {
    if (employeeId) {
      loadTrainings();
      loadStatistics();
    }
  }, [employeeId, selectedStatus]);

  const loadTrainings = async () => {
    if (!employeeId) return;
    try {
      setIsLoading(true);
      const params: any = { employeeId };
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      const response = await apiService.getTrainingHistory(params);
      if (response.success && response.data) {
        setTrainings(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load training history');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    if (!employeeId) return;
    try {
      const response = await apiService.getTrainingStatistics(employeeId);
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error: any) {
      // Ignore statistics error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error('Employee ID is required');
      return;
    }

    try {
      const data = {
        ...formData,
        employeeId,
      };

      if (editingTraining?._id || editingTraining?.id) {
        const id = editingTraining._id || editingTraining.id;
        const response = await apiService.updateTraining(id!, data);
        if (response.success) {
          toast.success('Training updated successfully');
          setShowForm(false);
          setEditingTraining(null);
          resetForm();
          loadTrainings();
          loadStatistics();
        } else {
          toast.error(response.message || 'Failed to update training');
        }
      } else {
        const response = await apiService.createTraining(data);
        if (response.success) {
          toast.success('Training created successfully');
          setShowForm(false);
          resetForm();
          loadTrainings();
          loadStatistics();
        } else {
          toast.error(response.message || 'Failed to create training');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleComplete = async (id: string, score?: number, grade?: string, passed?: boolean) => {
    try {
      const response = await apiService.completeTraining(id, {
        assessmentScore: score,
        grade,
        passed,
        certificateIssued: passed,
      });
      if (response.success) {
        toast.success('Training completed successfully');
        loadTrainings();
        loadStatistics();
      } else {
        toast.error(response.message || 'Failed to complete training');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await apiService.approveTraining(id);
      if (response.success) {
        toast.success('Training approved successfully');
        loadTrainings();
      } else {
        toast.error(response.message || 'Failed to approve training');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this training record?')) return;

    try {
      const response = await apiService.deleteTraining(id);
      if (response.success) {
        toast.success('Training deleted successfully');
        loadTrainings();
        loadStatistics();
      } else {
        toast.error(response.message || 'Failed to delete training');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      trainingProgram: '',
      trainingType: 'Internal',
      trainingCategory: 'Technical',
      provider: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      location: '',
      cost: 0,
      status: 'Scheduled',
    });
    setEditingTraining(null);
  };

  const getTrainingsByStatus = (status: string) => {
    if (status === 'all') return trainings;
    return trainings.filter(t => t.status === status);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'secondary';
      case 'Scheduled': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Training History</h1>
            <p className="text-muted-foreground mt-2">Track training programs and certifications</p>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Training
          </Button>
        </div>

        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Trainings</p>
                <p className="text-2xl font-bold">{statistics.overall?.totalTrainings || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{statistics.overall?.completedTrainings || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{statistics.overall?.totalHours || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{statistics.overall?.avgScore ? Math.round(statistics.overall.avgScore) : 'N/A'}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({trainings.length})</TabsTrigger>
            <TabsTrigger value="Scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="In Progress">In Progress</TabsTrigger>
            <TabsTrigger value="Completed">Completed</TabsTrigger>
            <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center">Loading...</CardContent>
              </Card>
            ) : getTrainingsByStatus(selectedStatus).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No training records found</p>
                </CardContent>
              </Card>
            ) : (
              getTrainingsByStatus(selectedStatus).map((training) => {
                const id = training._id || training.id;
                return (
                  <Card key={id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{training.trainingProgram}</h3>
                          <p className="text-sm text-muted-foreground">
                            {training.trainingCategory} • {training.trainingType}
                            {training.provider && ` • ${training.provider}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateDDMMYYYY(training.startDate)} - {formatDateDDMMYYYY(training.endDate)}
                            {training.duration && ` • ${training.duration} hours`}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={getStatusBadgeVariant(training.status)}>
                            {training.status}
                          </Badge>
                          {training.certificateIssued && (
                            <Badge variant="default" className="gap-1">
                              <Award className="w-3 h-3" /> Certified
                            </Badge>
                          )}
                        </div>
                      </div>
                      {training.assessmentScore !== undefined && (
                        <div className="mb-4 p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Assessment Score</span>
                            <span className="text-lg font-bold">{training.assessmentScore}/100</span>
                          </div>
                          {training.grade && (
                            <p className="text-sm text-muted-foreground mt-1">Grade: {training.grade}</p>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {training.status === 'Scheduled' && (
                          <Button size="sm" variant="outline" onClick={() => handleApprove(id!)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                          </Button>
                        )}
                        {training.status === 'In Progress' && (
                          <Button size="sm" variant="outline" onClick={() => handleComplete(id!)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Complete
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => { setEditingTraining(training); setShowForm(true); }}>
                          <Edit2 className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTraining ? 'Edit Training' : 'Add Training'}</DialogTitle>
              <DialogDescription>
                Enter training program details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Training Program *</Label>
                <Input
                  value={formData.trainingProgram}
                  onChange={(e) => setFormData({ ...formData, trainingProgram: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Training Type *</Label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                    value={formData.trainingType}
                    onChange={(e) => setFormData({ ...formData, trainingType: e.target.value })}
                    required
                  >
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                    <option value="Online">Online</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Conference">Conference</option>
                    <option value="Certification">Certification</option>
                  </select>
                </div>
                <div>
                  <Label>Category *</Label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                    value={formData.trainingCategory}
                    onChange={(e) => setFormData({ ...formData, trainingCategory: e.target.value })}
                    required
                  >
                    <option value="Technical">Technical</option>
                    <option value="Functional">Functional</option>
                    <option value="Behavioral">Behavioral</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Safety">Safety</option>
                  </select>
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Provider/Organization</Label>
                  <Input
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Cost</Label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" /> {editingTraining ? 'Update' : 'Add'} Training
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default function TrainingHistoryPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    }>
      <TrainingHistoryContent />
    </Suspense>
  );
}
