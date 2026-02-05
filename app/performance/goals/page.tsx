'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Trash2, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/lib/api';

interface Goal {
  id: string;
  description: string;
  kpi: string;
  target: string;
  weightage: number;
  timeline: string;
  category: string;
  status: 'draft' | 'submitted' | 'approved';
}

export default function GoalsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    description: '',
    kpi: '',
    target: '',
    weightage: 0,
    timeline: '',
    category: '',
    status: 'draft',
  });

  useEffect(() => {
    loadActiveCycleAndGoals();
  }, []);

  const loadActiveCycleAndGoals = async () => {
    try {
      setIsLoading(true);
      const [cycleRes, goalsRes] = await Promise.all([
        apiService.getActiveAppraisalCycle(),
        apiService.getGoals({ status: 'Draft' }),
      ]);

      if (cycleRes.success && cycleRes.data) {
        setActiveCycle(cycleRes.data);
        // Load goals for this cycle
        const cycleGoalsRes = await apiService.getGoals({ appraisalCycleId: cycleRes.data._id });
        if (cycleGoalsRes.success && cycleGoalsRes.data) {
          setGoals(Array.isArray(cycleGoalsRes.data) ? cycleGoalsRes.data : []);
        }
      } else if (goalsRes.success && goalsRes.data) {
        setGoals(Array.isArray(goalsRes.data) ? goalsRes.data : []);
      }
    } catch (error) {
      console.error('Failed to load goals', error);
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    redirect('/login');
  }

  const totalWeightage = goals.reduce((sum, goal) => sum + (goal.weightage || 0), 0);

  const handleAddGoal = async () => {
    if (!newGoal.description || !newGoal.kpi || !newGoal.target || !newGoal.weightage || !newGoal.timeline) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!activeCycle) {
      toast.error('No active appraisal cycle found');
      return;
    }

    if (totalWeightage + (newGoal.weightage || 0) > 100) {
      toast.error('Total weightage cannot exceed 100%');
      return;
    }

    try {
      setIsSubmitting(true);

      // Get current employee
      const empResponse = await apiService.getEmployees({ email: user?.email });
      if (!empResponse.success || !empResponse.data || !Array.isArray(empResponse.data) || empResponse.data.length === 0) {
        toast.error('Employee record not found');
        return;
      }

      const employee = empResponse.data[0];
      const employeeId = employee._id || employee.id;

      const payload = {
        appraisalCycleId: activeCycle._id || activeCycle.id,
        employeeId,
        description: newGoal.description,
        kpi: newGoal.kpi,
        target: newGoal.target,
        weightage: newGoal.weightage,
        timeline: newGoal.timeline,
        category: newGoal.category || 'Operational',
        goalLevel: 'Individual',
        status: 'Draft',
      };

      const response = await apiService.createGoal(payload);

      if (response.success) {
        toast.success('Goal added successfully');
        setNewGoal({
          description: '',
          kpi: '',
          target: '',
          weightage: 0,
          timeline: '',
          category: '',
          status: 'draft',
        });
        setShowAddGoal(false);
        loadActiveCycleAndGoals();
      } else {
        toast.error(response.message || 'Failed to add goal');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      // Note: Backend doesn't have delete endpoint, so we'll just remove from UI
      // In production, you'd call delete API
      setGoals(goals.filter(g => (g._id || g.id) !== id));
      toast.success('Goal removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete goal');
    }
  };

  const handleSubmitGoals = async () => {
    if (goals.length < 5) {
      toast.error('Minimum 5 goals required');
      return;
    }
    if (totalWeightage !== 100) {
      toast.error('Total weightage must be exactly 100%');
      return;
    }

    try {
      setIsSubmitting(true);
      // Submit each goal for approval
      for (const goal of goals) {
        if (goal.status === 'Draft' || goal.status === 'draft') {
          await apiService.updateGoal(goal._id || goal.id, { status: 'Submitted' });
        }
      }
      toast.success('Goals submitted for manager approval');
      loadActiveCycleAndGoals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit goals');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">SMART Goals Setting</h1>
            <p className="text-muted-foreground mt-2">Set Specific, Measurable, Achievable, Relevant, Time-bound goals</p>
          </div>
          {!showAddGoal && (
            <Button onClick={() => setShowAddGoal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          )}
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">SMART Goals Guidelines</p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li><strong>Specific:</strong> Clear and well-defined goal</li>
                  <li><strong>Measurable:</strong> Quantifiable with KPIs and targets</li>
                  <li><strong>Achievable:</strong> Realistic and attainable</li>
                  <li><strong>Relevant:</strong> Aligned with department and organizational objectives</li>
                  <li><strong>Time-bound:</strong> Clear deadline or timeline</li>
                  <li>Minimum 5 goals, maximum 10 goals per employee</li>
                  <li>Total weightage must equal 100%</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weightage Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Weightage</p>
                <p className={`text-2xl font-bold ${totalWeightage === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {totalWeightage}%
                </p>
              </div>
              <Badge className={totalWeightage === 100 ? 'bg-green-600' : 'bg-yellow-600'}>
                {totalWeightage === 100 ? 'Complete' : `${100 - totalWeightage}% remaining`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Add Goal Form */}
        {showAddGoal && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Add New Goal</CardTitle>
              <CardDescription>Create a SMART goal for this appraisal period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Goal Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal clearly..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kpi">KPI/Metric <span className="text-red-500">*</span></Label>
                  <Input
                    id="kpi"
                    placeholder="e.g., Customer Satisfaction Index"
                    value={newGoal.kpi}
                    onChange={(e) => setNewGoal({ ...newGoal, kpi: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Target Value <span className="text-red-500">*</span></Label>
                  <Input
                    id="target"
                    placeholder="e.g., 4.5/5 or 95%"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weightage">Weightage (%) <span className="text-red-500">*</span></Label>
                  <Input
                    id="weightage"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="0"
                    value={newGoal.weightage || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, weightage: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline <span className="text-red-500">*</span></Label>
                  <Input
                    id="timeline"
                    placeholder="e.g., Q4 2026 or Dec 2026"
                    value={newGoal.timeline}
                    onChange={(e) => setNewGoal({ ...newGoal, timeline: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Customer Service">Customer Service</SelectItem>
                      <SelectItem value="Process Improvement">Process Improvement</SelectItem>
                      <SelectItem value="Learning & Development">Learning & Development</SelectItem>
                      <SelectItem value="Innovation">Innovation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleAddGoal} className="gap-2">
                  <Save className="w-4 h-4" />
                  Add Goal
                </Button>
                <Button variant="outline" onClick={() => setShowAddGoal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading goals...
          </div>
        ) : goals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No goals found. Add your first goal to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const goalId = goal._id || goal.id;
              const status = goal.status || 'Draft';
              return (
                <Card key={goalId} className={status === 'Approved' ? 'border-green-500' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <p className="font-semibold">{goal.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>KPI: {goal.kpi}</span>
                              <span>Target: {goal.target}</span>
                              <span>Timeline: {goal.timeline}</span>
                              {goal.category && (
                                <Badge variant="outline">{goal.category}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Weightage</p>
                            <p className="font-semibold">{goal.weightage}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <Badge className={
                              status === 'Approved' ? 'bg-green-600' :
                              status === 'Submitted' ? 'bg-blue-600' : 'bg-gray-600'
                            }>
                              {status}
                            </Badge>
                          </div>
                          {goal.progress !== undefined && (
                            <div>
                              <p className="text-xs text-muted-foreground">Progress</p>
                              <p className="font-semibold">{goal.progress}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {(status === 'Draft' || status === 'draft') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGoal(goalId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Submit Button */}
        {goals.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Ready to Submit?</p>
                  <p className="text-sm text-muted-foreground">
                    {goals.length} goals • Total weightage: {totalWeightage}%
                  </p>
                </div>
                <Button
                  onClick={handleSubmitGoals}
                  disabled={goals.length < 5 || totalWeightage !== 100 || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit for Approval
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
