'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Loader2, CheckCircle2, Clock } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function MyTrainingsPage() {
  const { currentUser } = useAuth();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      setLoading(true);
      const res = await apiService.getMyTrainings();
      if (res.success && res.data) {
        setTrainings(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load trainings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (assignmentId: string, progress: number, completed?: boolean) => {
    try {
      const res = await apiService.updateTrainingProgress(assignmentId, { progress, completed });
      if (res.success) {
        toast.success('Progress updated');
        loadTrainings();
      } else {
        toast.error(res.message || 'Failed to update');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      ASSIGNED: { label: 'Assigned', variant: 'outline' },
      IN_PROGRESS: { label: 'In Progress', variant: 'secondary' },
      COMPLETED: { label: 'Completed', variant: 'default' },
      OVERDUE: { label: 'Overdue', variant: 'destructive' as any },
    };
    const c = map[status] || { label: status, variant: 'outline' };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Trainings</h1>
          <p className="text-muted-foreground">View and complete your assigned trainings</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : trainings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No trainings assigned to you</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {trainings.map((t: any) => (
              <Card key={t._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{t.courseId?.courseName || 'Course'}</CardTitle>
                      <CardDescription>{t.courseId?.courseCode}</CardDescription>
                    </div>
                    {getStatusBadge(t.status || 'ASSIGNED')}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{t.progress || 0}%</span>
                    </div>
                    <Progress value={t.progress || 0} className="h-2" />
                  </div>
                  {t.dueDate && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Due: {new Date(t.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  {t.status !== 'COMPLETED' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateProgress(t._id, Math.min((t.progress || 0) + 25, 100))}
                      >
                        Update Progress
                      </Button>
                      {(t.progress || 0) >= 100 && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateProgress(t._id, 100, true)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
