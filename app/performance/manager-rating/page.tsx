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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Target, Star, Save, CheckCircle2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/lib/api';

interface TeamMember {
  id: string;
  name: string;
  designation: string;
  goals: {
    id: string;
    description: string;
    selfRating: number;
    managerRating: number;
    comments: string;
  }[];
  competencies: {
    name: string;
    selfRating: number;
    managerRating: number;
  }[];
  overallRating: number;
  selfOverallRating: number;
  status: 'pending' | 'completed';
}

export default function ManagerRatingPage() {
  const { isAuthenticated, hasPermission, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedSelfAppraisal, setSelectedSelfAppraisal] = useState<any>(null);
  const [selectedManagerAppraisal, setSelectedManagerAppraisal] = useState<any>(null);
  const [goalRatings, setGoalRatings] = useState<any[]>([]);
  const [competencyRatings, setCompetencyRatings] = useState({
    leadership: 3,
    communication: 3,
    teamwork: 3,
    problemSolving: 3,
    customerFocus: 3,
    innovation: 3,
    integrity: 3,
    accountability: 3,
  });
  const [valuesRating, setValuesRating] = useState(3);
  const [overallRating, setOverallRating] = useState(3);
  const [promotionRecommended, setPromotionRecommended] = useState(false);
  const [incrementPercentage, setIncrementPercentage] = useState(0);
  const [strengths, setStrengths] = useState('');
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [overallComments, setOverallComments] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeAppraisal();
    }
  }, [selectedEmployee]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get active cycle
      const cycleRes = await apiService.getActiveAppraisalCycle();
      if (cycleRes.success && cycleRes.data) {
        setActiveCycle(cycleRes.data);
      }

      // Get team members (employees reporting to this manager)
      const empRes = await apiService.getEmployees({ reportingManager: user?._id });
      if (empRes.success && empRes.data && Array.isArray(empRes.data)) {
        setTeamMembers(empRes.data);
        if (empRes.data.length > 0) {
          setSelectedEmployee(empRes.data[0]._id || empRes.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load data', error);
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployeeAppraisal = async () => {
    if (!selectedEmployee || !activeCycle) return;

    try {
      // Load self-appraisal
      const selfAppRes = await apiService.getSelfAppraisals({
        employeeId: selectedEmployee,
        appraisalCycleId: activeCycle._id || activeCycle.id,
      });

      if (selfAppRes.success && selfAppRes.data && Array.isArray(selfAppRes.data) && selfAppRes.data.length > 0) {
        const selfApp = selfAppRes.data[0];
        setSelectedSelfAppraisal(selfApp);

        // Load goals from self-appraisal
        if (selfApp.goalAchievements) {
          setGoalRatings(selfApp.goalAchievements.map((ga: any) => ({
            goalId: ga.goalId?._id || ga.goalId?.id || ga.goalId,
            goalDescription: ga.goalId?.description || '',
            selfRating: ga.selfRating || 3,
            managerRating: 3,
            achievementComments: '',
            gapComments: '',
          })));
        }
      }

      // Load existing manager appraisal if any
      const mgrAppRes = await apiService.getManagerAppraisals({
        employeeId: selectedEmployee,
        appraisalCycleId: activeCycle._id || activeCycle.id,
      });

      if (mgrAppRes.success && mgrAppRes.data && Array.isArray(mgrAppRes.data) && mgrAppRes.data.length > 0) {
        const mgrApp = mgrAppRes.data[0];
        setSelectedManagerAppraisal(mgrApp);
        
        if (mgrApp.goalRatings) {
          setGoalRatings(mgrApp.goalRatings.map((gr: any) => ({
            goalId: gr.goalId?._id || gr.goalId?.id || gr.goalId,
            goalDescription: gr.goalId?.description || '',
            selfRating: gr.selfRating || 3,
            managerRating: gr.managerRating || 3,
            achievementComments: gr.achievementComments || '',
            gapComments: gr.gapComments || '',
          })));
        }

        if (mgrApp.competencyRatings) {
          setCompetencyRatings(mgrApp.competencyRatings);
        }

        setValuesRating(mgrApp.valuesRating || 3);
        setOverallRating(mgrApp.overallRating || 3);
        setPromotionRecommended(mgrApp.promotionRecommended || false);
        setIncrementPercentage(mgrApp.incrementPercentage || 0);
        setStrengths(mgrApp.strengths || '');
        setAreasForImprovement(mgrApp.areasForImprovement || '');
        setOverallComments(mgrApp.overallComments || '');
      }
    } catch (error) {
      console.error('Failed to load employee appraisal', error);
    }
  };

  if (!isAuthenticated || !hasPermission('approve_appraisal')) {
    redirect('/dashboard');
  }

  const currentMember = teamMembers.find(m => (m._id || m.id) === selectedEmployee);
  const pendingCount = teamMembers.filter(m => m.status === 'pending').length;

  const handleGoalRating = (goalId: string, rating: number) => {
    setGoalRatings(goalRatings.map(gr =>
      gr.goalId === goalId ? { ...gr, managerRating: rating } : gr
    ));
  };

  const handleCompetencyRating = (competencyName: string, rating: number) => {
    setCompetencyRatings({
      ...competencyRatings,
      [competencyName]: rating,
    });
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !activeCycle || !selectedSelfAppraisal) {
      toast.error('Please select an employee with submitted self-appraisal');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        employeeId: selectedEmployee,
        appraisalCycleId: activeCycle._id || activeCycle.id,
        goalRatings: goalRatings.map(gr => ({
          goalId: gr.goalId,
          managerRating: gr.managerRating,
          selfRating: gr.selfRating,
          achievementComments: gr.achievementComments,
          gapComments: gr.gapComments,
        })),
        competencyRatings,
        valuesRating,
        overallRating,
        promotionRecommended,
        incrementPercentage,
        strengths,
        areasForImprovement,
        overallComments,
      };

      let response;
      if (selectedManagerAppraisal) {
        // Update existing
        response = await apiService.createManagerAppraisal(payload);
      } else {
        // Create new
        response = await apiService.createManagerAppraisal(payload);
      }

      if (response.success) {
        // Submit it
        const submitResponse = await apiService.submitManagerAppraisal(response.data._id || response.data.id);
        if (submitResponse.success) {
          toast.success('Appraisal submitted successfully!');
          router.push('/performance');
        } else {
          toast.error(submitResponse.message || 'Failed to submit appraisal');
        }
      } else {
        toast.error(response.message || 'Failed to save appraisal');
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
            <h1 className="text-3xl font-bold text-foreground">Manager Appraisal Rating</h1>
            <p className="text-muted-foreground mt-2">Rate your team members' performance</p>
          </div>
          <Badge className="bg-yellow-600">
            {pendingCount} Pending Appraisals
          </Badge>
        </div>

        {/* Team Members List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading team members...
          </div>
        ) : teamMembers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No team members found.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Select a team member to review their appraisal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teamMembers.map((member) => {
                  const memberId = member._id || member.id;
                  return (
                    <div
                      key={memberId}
                      onClick={() => setSelectedEmployee(memberId)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedEmployee === memberId
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{member.firstName} {member.lastName}</p>
                          <p className="text-sm text-muted-foreground">{member.designation || member.employeeCode}</p>
                        </div>
                        <Badge className={selectedManagerAppraisal ? 'bg-green-600' : 'bg-yellow-600'}>
                          {selectedManagerAppraisal ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {currentMember && selectedSelfAppraisal && (
          <>
            {/* Employee Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{currentMember.firstName} {currentMember.lastName}</h2>
                    <p className="text-muted-foreground">{currentMember.designation || currentMember.employeeCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Self Rating</p>
                    <p className="text-2xl font-bold">{selectedSelfAppraisal.overallSelfRating || 0}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appraisal Tabs */}
            <Tabs defaultValue="goals" className="w-full">
              <TabsList>
                <TabsTrigger value="goals">Goals ({currentMember.goals.length})</TabsTrigger>
                <TabsTrigger value="competencies">Competencies</TabsTrigger>
                <TabsTrigger value="overall">Overall Rating</TabsTrigger>
              </TabsList>

              <TabsContent value="goals" className="space-y-4">
                {currentMember.goals.map((goal) => (
                  <Card key={goal.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        {goal.description}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Self Rating</p>
                          <Badge className="text-lg px-3 py-1">{goal.selfRating}/5</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                          <div className="space-y-2">
                            <Slider
                              value={[goal.managerRating]}
                              onValueChange={(value) => handleGoalRating(goal.id, value[0])}
                              min={1}
                              max={5}
                              step={0.5}
                              className="w-full"
                            />
                            <Badge className="text-lg px-3 py-1">{goal.managerRating}/5</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Comments</Label>
                        <Textarea
                          placeholder="Provide feedback on goal achievement..."
                          value={goal.comments}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="competencies" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Behavioral Competencies</CardTitle>
                    <CardDescription>Rate competencies on a scale of 1-5</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {currentMember.competencies.map((comp, idx) => (
                      <div key={idx} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold">{comp.name}</Label>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Self</p>
                              <Badge variant="outline">{comp.selfRating}/5</Badge>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Your Rating</p>
                              <Badge>{comp.managerRating}/5</Badge>
                            </div>
                          </div>
                        </div>
                        <Slider
                          value={[comp.managerRating]}
                          onValueChange={(value) => handleCompetencyRating(comp.name, value[0])}
                          min={1}
                          max={5}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overall" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Performance Rating</CardTitle>
                    <CardDescription>Provide overall rating and recommendations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label>Self Overall Rating</Label>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-3xl font-bold">{currentMember.selfOverallRating}</p>
                          <p className="text-sm text-muted-foreground">out of 5</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Your Overall Rating</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[currentMember.overallRating]}
                            onValueChange={() => {}}
                            min={1}
                            max={5}
                            step={0.5}
                            className="w-full"
                          />
                          <div className="p-4 bg-primary/10 rounded-lg text-center">
                            <p className="text-3xl font-bold">{currentMember.overallRating}</p>
                            <p className="text-sm text-muted-foreground">out of 5</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Performance Summary</Label>
                      <Textarea
                        placeholder="Summarize employee's performance, strengths, and areas for improvement..."
                        rows={5}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Increment Recommendation (%)</Label>
                        <Select defaultValue="7">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0%</SelectItem>
                            <SelectItem value="3">3%</SelectItem>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="7">7%</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="12">12%</SelectItem>
                            <SelectItem value="15">15%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Promotion Recommendation</Label>
                        <Select defaultValue="no">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Training & Development Needs</Label>
                      <Textarea
                        placeholder="Suggest training programs or development areas..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Submit Section */}
            <Card className="border-2 border-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Complete Appraisal for {currentMember.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Review all sections before submitting
                    </p>
                  </div>
                  <Button onClick={handleSubmit} className="gap-2" size="lg">
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Appraisal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
