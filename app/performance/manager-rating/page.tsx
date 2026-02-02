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
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Target, Star, Save, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

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
  const { isAuthenticated, hasPermission } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Rajesh Kumar',
      designation: 'Senior Analyst',
      goals: [
        {
          id: '1',
          description: 'Increase customer satisfaction score',
          selfRating: 4,
          managerRating: 4,
          comments: '',
        },
        {
          id: '2',
          description: 'Complete process automation project',
          selfRating: 5,
          managerRating: 4.5,
          comments: '',
        },
      ],
      competencies: [
        { name: 'Communication', selfRating: 4, managerRating: 4 },
        { name: 'Teamwork', selfRating: 4.5, managerRating: 4 },
        { name: 'Leadership', selfRating: 3.5, managerRating: 3.5 },
        { name: 'Problem Solving', selfRating: 4, managerRating: 4.5 },
      ],
      overallRating: 4,
      selfOverallRating: 4.2,
      status: 'pending',
    },
    {
      id: '2',
      name: 'Priya Desai',
      designation: 'Software Engineer',
      goals: [],
      competencies: [],
      overallRating: 0,
      selfOverallRating: 0,
      status: 'pending',
    },
  ]);

  if (!isAuthenticated || !hasPermission('approve_appraisal')) {
    redirect('/dashboard');
  }

  const currentMember = teamMembers.find(m => m.id === selectedEmployee) || teamMembers[0];
  const pendingCount = teamMembers.filter(m => m.status === 'pending').length;

  const handleGoalRating = (goalId: string, rating: number) => {
    // In production, this would update the state
    toast.success('Goal rating updated');
  };

  const handleCompetencyRating = (competencyName: string, rating: number) => {
    // In production, this would update the state
    toast.success('Competency rating updated');
  };

  const handleSubmit = () => {
    toast.success('Appraisal submitted successfully!');
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
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Select a team member to review their appraisal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setSelectedEmployee(member.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedEmployee === member.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-accent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.designation}</p>
                    </div>
                    <Badge className={member.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}>
                      {member.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {currentMember && (
          <>
            {/* Employee Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{currentMember.name}</h2>
                    <p className="text-muted-foreground">{currentMember.designation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Self Rating</p>
                    <p className="text-2xl font-bold">{currentMember.selfOverallRating}/5</p>
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
