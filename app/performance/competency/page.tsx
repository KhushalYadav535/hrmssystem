'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Plus, Info, Edit2 } from 'lucide-react';
import { useState } from 'react';

export default function CompetencyMatrixPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('technical');

  if (!isAuthenticated) redirect('/login');

  const competencies = {
    technical: [
      { id: 1, name: 'Frontend Development', level: 4, target: 5, gap: -1, description: 'React, Next.js, TypeScript expertise' },
      { id: 2, name: 'Backend Architecture', level: 3, target: 4, gap: -1, description: 'Microservices, API design, Database schema' },
      { id: 3, name: 'DevOps & CI/CD', level: 2, target: 3, gap: -1, description: 'Docker, Kubernetes, GitHub Actions' },
      { id: 4, name: 'System Design', level: 3, target: 5, gap: -2, description: 'Scalability, Security, Performance optimization' },
    ],
    behavioral: [
      { id: 5, name: 'Communication', level: 4, target: 4, gap: 0, description: 'Verbal and written communication skills' },
      { id: 6, name: 'Teamwork', level: 5, target: 5, gap: 0, description: 'Collaboration and conflict resolution' },
      { id: 7, name: 'Problem Solving', level: 4, target: 5, gap: -1, description: 'Analytical thinking and troubleshooting' },
    ],
    leadership: [
      { id: 8, name: 'Mentorship', level: 3, target: 4, gap: -1, description: 'Guiding junior developers' },
      { id: 9, name: 'Project Management', level: 2, target: 3, gap: -1, description: 'Agile methodologies, Sprint planning' },
    ]
  };

  const levels = [
    { value: 1, label: 'Novice', color: 'bg-red-500' },
    { value: 2, label: 'Beginner', color: 'bg-orange-500' },
    { value: 3, label: 'Competent', color: 'bg-yellow-500' },
    { value: 4, label: 'Proficient', color: 'bg-blue-500' },
    { value: 5, label: 'Expert', color: 'bg-green-500' },
  ];

  const getLevelLabel = (val: number) => levels.find(l => l.value === val)?.label || 'Unknown';
  const getLevelColor = (val: number) => levels.find(l => l.value === val)?.color || 'bg-gray-500';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Competency Matrix</h1>
            <p className="text-muted-foreground mt-2">Evaluate and track employee skills and competencies</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Competency
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Overall Skill Score</p>
              <p className="text-3xl font-bold text-blue-600">3.4 / 5.0</p>
              <Progress value={68} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Skill Gaps Identified</p>
              <p className="text-3xl font-bold text-orange-600">5</p>
              <p className="text-xs text-muted-foreground mt-1">Areas requiring improvement</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Ready for Promotion</p>
              <p className="text-3xl font-bold text-green-600">85%</p>
              <p className="text-xs text-muted-foreground mt-1">Match with Senior Role</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="technical" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="technical">Technical Skills</TabsTrigger>
            <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
            <TabsTrigger value="leadership">Leadership</TabsTrigger>
          </TabsList>

          {Object.entries(competencies).map(([category, items]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            <Button size="icon" variant="ghost"><Edit2 className="w-4 h-4" /></Button>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Current: {getLevelLabel(item.level)}</Badge>
                            <span className="text-muted-foreground">→</span>
                            <Badge variant="secondary">Target: {getLevelLabel(item.target)}</Badge>
                          </div>
                        </div>

                        <div className="flex-1 space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Proficiency Level</span>
                              <span className="font-bold">{item.level} / 5</span>
                            </div>
                            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getLevelColor(item.level)} transition-all duration-500`} 
                                style={{ width: `${(item.level / 5) * 100}%` }} 
                              />
                            </div>
                          </div>

                          {item.gap < 0 && (
                            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-900 flex gap-2 items-start">
                              <Info className="w-4 h-4 text-red-600 mt-0.5" />
                              <div className="text-xs text-red-700 dark:text-red-400">
                                <span className="font-semibold">Gap Analysis:</span> Employee is {Math.abs(item.gap)} level(s) below the required target for this role. Recommended training: Advanced {item.name} Workshop.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Proficiency Levels Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {levels.map((level) => (
                <div key={level.value} className="p-4 border border-border rounded-lg text-center">
                  <div className={`w-8 h-8 rounded-full ${level.color} text-white flex items-center justify-center mx-auto mb-2 font-bold`}>
                    {level.value}
                  </div>
                  <div className="font-semibold">{level.label}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {level.value === 1 && "Has basic knowledge but cannot perform tasks independently."}
                    {level.value === 2 && "Can perform routine tasks with guidance."}
                    {level.value === 3 && "Can perform tasks independently and reliably."}
                    {level.value === 4 && "Can guide others and handle complex situations."}
                    {level.value === 5 && "Recognized authority, innovates and sets standards."}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
