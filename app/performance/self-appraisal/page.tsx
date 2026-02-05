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
import { Slider } from '@/components/ui/slider';
import { FileText, Save, Upload, CheckCircle2, Target, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/lib/api';

interface GoalAppraisal {
  goalId: string;
  goalDescription: string;
  selfRating: number;
  achievement: string;
  evidence: string;
  challenges: string;
}

export default function SelfAppraisalPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [goals, setGoals] = useState<GoalAppraisal[]>([]);
  const [overallRating, setOverallRating] = useState(4);
  const [trainingNeeds, setTrainingNeeds] = useState('');
  const [careerAspirations, setCareerAspirations] = useState('');
  const [keyAccomplishments, setKeyAccomplishments] = useState('');
  const [challengesFaced, setChallengesFaced] = useState('');
  const [supportNeeded, setSupportNeeded] = useState('');
  const [developmentNeeds, setDevelopmentNeeds] = useState('');
  const [selfAppraisal, setSelfAppraisal] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get active cycle
      const cycleRes = await apiService.getActiveAppraisalCycle();
      if (cycleRes.success && cycleRes.data) {
        setActiveCycle(cycleRes.data);
      }

      // Get current employee
      const empRes = await apiService.getEmployees({ email: user?.email });
      if (empRes.success && empRes.data && Array.isArray(empRes.data) && empRes.data.length > 0) {
        const emp = empRes.data[0];
        setEmployee(emp);
        const employeeId = emp._id || emp.id;

        // Load goals for this cycle
        if (cycleRes.success && cycleRes.data) {
          const goalsRes = await apiService.getGoals({ 
            employeeId, 
            appraisalCycleId: cycleRes.data._id || cycleRes.data.id,
            status: 'Approved' 
          });
          
          if (goalsRes.success && goalsRes.data) {
            const approvedGoals = Array.isArray(goalsRes.data) ? goalsRes.data : [];
            setGoals(approvedGoals.map((g: any) => ({
              goalId: g._id || g.id,
              goalDescription: g.description,
              selfRating: 3,
              achievement: '',
              evidence: '',
              challenges: '',
            })));
          }

          // Load existing self-appraisal if any
          const selfAppRes = await apiService.getSelfAppraisals({ 
            employeeId, 
            appraisalCycleId: cycleRes.data._id || cycleRes.data.id 
          });
          
          if (selfAppRes.success && selfAppRes.data && Array.isArray(selfAppRes.data) && selfAppRes.data.length > 0) {
            const existing = selfAppRes.data[0];
            setSelfAppraisal(existing);
            
            if (existing.goalAchievements) {
              setGoals(existing.goalAchievements.map((ga: any) => ({
                goalId: ga.goalId?._id || ga.goalId?.id || ga.goalId,
                goalDescription: ga.goalId?.description || '',
                selfRating: ga.selfRating || 3,
                achievement: ga.achievementDescription || '',
                evidence: ga.quantifiableAchievements || '',
                challenges: ga.challengesFaced || '',
              })));
            }
            
            setOverallRating(existing.overallSelfRating || 4);
            setTrainingNeeds(existing.trainingNeeds || '');
            setCareerAspirations(existing.careerAspirations || '');
            setKeyAccomplishments(existing.keyAccomplishments || '');
            setChallengesFaced(existing.challengesFaced || '');
            setSupportNeeded(existing.supportNeeded || '');
            setDevelopmentNeeds(existing.developmentNeeds || '');
          }
        }
      }
    } catch (error) {
      console.error('Failed to load data', error);
      toast.error('Failed to load appraisal data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    redirect('/login');
  }

  const handleGoalUpdate = (goalId: string, field: keyof GoalAppraisal, value: any) => {
    setGoals(goals.map(goal =>
      goal.goalId === goalId ? { ...goal, [field]: value } : goal
    ));
  };

  const handleSaveDraft = async () => {
    if (!activeCycle || !employee) {
      toast.error('Appraisal cycle or employee data not found');
      return;
    }

    try {
      setIsSubmitting(true);

      const employeeId = employee._id || employee.id;
      const cycleId = activeCycle._id || activeCycle.id;

      const goalAchievements = goals.map(g => ({
        goalId: g.goalId,
        selfRating: g.selfRating,
        achievementDescription: g.achievement,
        quantifiableAchievements: g.evidence,
        challengesFaced: g.challenges,
        evidence: [],
      }));

      const payload = {
        appraisalCycleId: cycleId,
        goalAchievements,
        overallSelfRating: overallRating,
        keyAccomplishments,
        challengesFaced,
        supportNeeded,
        trainingNeeds,
        developmentNeeds,
        careerAspirations,
        status: 'Draft',
      };

      const response = await apiService.createOrUpdateSelfAppraisal(payload);

      if (response.success) {
        toast.success('Draft saved successfully');
        setSelfAppraisal(response.data);
      } else {
        toast.error(response.message || 'Failed to save draft');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeCycle || !employee) {
      toast.error('Appraisal cycle or employee data not found');
      return;
    }

    const incompleteGoals = goals.filter(g => !g.achievement);
    if (incompleteGoals.length > 0) {
      toast.error('Please complete all goal appraisals');
      return;
    }

    if (!selfAppraisal) {
      toast.error('Please save draft first');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await apiService.submitSelfAppraisal(selfAppraisal._id || selfAppraisal.id);

      if (response.success) {
        toast.success('Self-appraisal submitted successfully!');
        router.push('/performance');
      } else {
        toast.error(response.message || 'Failed to submit self-appraisal');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Self-Appraisal</h1>
            <p className="text-muted-foreground mt-2">
              Appraisal Period: {activeCycle?.cycleName || 'Loading...'}
              {selfAppraisal?.status === 'Locked' && (
                <Badge className="ml-2 bg-red-600">Locked</Badge>
              )}
            </p>
          </div>
          {selfAppraisal?.status !== 'Locked' && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft} className="gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Draft
                  </>
                )}
              </Button>
              <Button onClick={handleSubmit} className="gap-2" disabled={isSubmitting || !selfAppraisal}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Appraisal
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Self-Appraisal Guidelines</p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Rate each goal based on your achievement (1-5 scale)</li>
                <li>Provide specific achievements with quantifiable results</li>
                <li>Upload evidence documents to support your achievements</li>
                <li>Describe challenges faced and how you overcame them</li>
                <li>Be honest and objective in your self-assessment</li>
                <li>Deadline: March 31, 2026</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Goals Appraisal */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading goals...
          </div>
        ) : goals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No approved goals found. Please set and get your goals approved first.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
            <Card key={goal.goalId}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {goal.goalDescription}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Self Rating */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Self Rating (1-5)</Label>
                    <Badge className="text-lg px-3 py-1">{goal.selfRating}/5</Badge>
                  </div>
                  <Slider
                    value={[goal.selfRating]}
                    onValueChange={(value) => handleGoalUpdate(goal.goalId, 'selfRating', value[0])}
                    min={1}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Unsatisfactory</span>
                    <span>Meets Expectations</span>
                    <span>Exceptional</span>
                  </div>
                </div>

                {/* Achievement */}
                <div className="space-y-2">
                  <Label htmlFor={`achievement-${goal.goalId}`}>
                    Achievements & Accomplishments <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id={`achievement-${goal.goalId}`}
                    placeholder="Describe your achievements with specific numbers, percentages, or metrics..."
                    value={goal.achievement}
                    onChange={(e) => handleGoalUpdate(goal.goalId, 'achievement', e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: "Increased customer satisfaction from 3.8 to 4.5, handled 150+ customer queries..."
                  </p>
                </div>

                {/* Evidence Upload */}
                <div className="space-y-2">
                  <Label>Upload Evidence</Label>
                  <div className="flex items-center gap-2">
                    <Input type="file" accept=".pdf,.doc,.docx,.jpg,.png" multiple />
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload documents, certificates, or screenshots supporting your achievements
                  </p>
                </div>

                {/* Challenges */}
                <div className="space-y-2">
                  <Label htmlFor={`challenges-${goal.goalId}`}>Challenges Faced</Label>
                  <Textarea
                    id={`challenges-${goal.goalId}`}
                    placeholder="Describe any challenges you faced and how you overcame them..."
                    value={goal.challenges}
                    onChange={(e) => handleGoalUpdate(goal.goalId, 'challenges', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {/* Overall Rating */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Self-Rating</CardTitle>
            <CardDescription>Rate your overall performance for this period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Overall Rating (1-5)</Label>
                <Badge className="text-lg px-3 py-1">{overallRating}/5</Badge>
              </div>
              <Slider
                value={[overallRating]}
                onValueChange={(value) => setOverallRating(value[0])}
                min={1}
                max={5}
                step={0.5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Training & Development */}
        <Card>
          <CardHeader>
            <CardTitle>Training & Development Needs</CardTitle>
            <CardDescription>Specify training requirements for your growth</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trainingNeeds">Training Needs</Label>
              <Textarea
                id="trainingNeeds"
                placeholder="List specific training programs, courses, or skills you need..."
                value={trainingNeeds}
                onChange={(e) => setTrainingNeeds(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Career Aspirations */}
        <Card>
          <CardHeader>
            <CardTitle>Career Aspirations</CardTitle>
            <CardDescription>Share your career goals and aspirations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="careerAspirations">Career Goals</Label>
              <Textarea
                id="careerAspirations"
                placeholder="Describe your short-term (1 year) and long-term (3-5 years) career goals..."
                value={careerAspirations}
                onChange={(e) => setCareerAspirations(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Section */}
        <Card className="border-2 border-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Ready to Submit?</p>
                <p className="text-sm text-muted-foreground">
                  Once submitted, you cannot edit your self-appraisal. Please review all sections.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveDraft}>
                  Save Draft
                </Button>
                <Button onClick={handleSubmit} className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Appraisal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
