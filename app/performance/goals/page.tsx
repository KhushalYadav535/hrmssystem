'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Trash2, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const { isAuthenticated } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      description: 'Increase customer satisfaction score',
      kpi: 'Customer Satisfaction Index',
      target: '4.5/5',
      weightage: 30,
      timeline: 'Q4 2026',
      category: 'Customer Service',
      status: 'approved',
    },
  ]);
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

  if (!isAuthenticated) {
    redirect('/login');
  }

  const totalWeightage = goals.reduce((sum, goal) => sum + goal.weightage, 0);

  const handleAddGoal = () => {
    if (!newGoal.description || !newGoal.kpi || !newGoal.target || !newGoal.weightage) {
      toast.error('Please fill all required fields');
      return;
    }

    if (totalWeightage + (newGoal.weightage || 0) > 100) {
      toast.error('Total weightage cannot exceed 100%');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      description: newGoal.description || '',
      kpi: newGoal.kpi || '',
      target: newGoal.target || '',
      weightage: newGoal.weightage || 0,
      timeline: newGoal.timeline || '',
      category: newGoal.category || '',
      status: 'draft',
    };

    setGoals([...goals, goal]);
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
    toast.success('Goal added successfully');
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    toast.success('Goal deleted');
  };

  const handleSubmitGoals = () => {
    if (goals.length < 5) {
      toast.error('Minimum 5 goals required');
      return;
    }
    if (totalWeightage !== 100) {
      toast.error('Total weightage must be exactly 100%');
      return;
    }
    toast.success('Goals submitted for manager approval');
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
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className={goal.status === 'approved' ? 'border-green-500' : ''}>
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
                          goal.status === 'approved' ? 'bg-green-600' :
                          goal.status === 'submitted' ? 'bg-blue-600' : 'bg-gray-600'
                        }>
                          {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {goal.status === 'draft' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
                  disabled={goals.length < 5 || totalWeightage !== 100}
                  className="gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit for Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
