'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CheckCircle2, Clock, BarChart3 } from 'lucide-react';

export default function Feedback360Page() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    redirect('/login');
  }

  const feedbackRounds = [
    { id: 1, employee: 'Rajesh Kumar', status: 'In Progress', peersGiven: 2, peersNeeded: 4, response: '50%' },
    { id: 2, employee: 'Priya Sharma', status: 'Completed', peersGiven: 4, peersNeeded: 4, response: '100%' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">360-Degree Feedback</h1>
          <p className="text-muted-foreground mt-2">Comprehensive multi-rater feedback collection and analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Rounds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">65%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rounds" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rounds">Feedback Rounds</TabsTrigger>
            <TabsTrigger value="give">Give Feedback</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="rounds">
            <div className="space-y-4">
              {feedbackRounds.map((round) => (
                <Card key={round.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{round.employee}</CardTitle>
                        <CardDescription>360-Degree Feedback Round 2026</CardDescription>
                      </div>
                      <Badge className={round.status === 'Completed' ? 'bg-green-600' : 'bg-yellow-600'}>
                        {round.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Peer Feedback</p>
                        <p className="text-2xl font-bold">{round.peersGiven}/{round.peersNeeded}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Manager Feedback</p>
                        <Badge>Completed</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Subordinate Feedback</p>
                        <Badge>Pending</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Response Rate</p>
                        <p className="text-lg font-bold">{round.response}</p>
                      </div>
                    </div>
                    <Button className="mt-4 gap-2">
                      <BarChart3 className="w-4 h-4" />
                      View Report
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="give">
            <Card>
              <CardHeader>
                <CardTitle>Give Feedback</CardTitle>
                <CardDescription>Provide 360 feedback for colleagues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Priya Sharma', 'Amit Verma', 'Suresh Patel'].map((name) => (
                    <div key={name} className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{name}</span>
                        <Button size="sm">Provide Feedback</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="font-semibold mb-2">Overall Rating</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-secondary rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-3" style={{ width: '78%' }} />
                      </div>
                      <span className="font-bold">3.9/5</span>
                    </div>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="font-semibold mb-3">Competency Scores</p>
                    <div className="space-y-2">
                      {['Communication', 'Leadership', 'Teamwork', 'Problem Solving'].map((comp) => (
                        <div key={comp} className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span>{comp}</span>
                            <span className="font-semibold">3.8/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>360 Feedback Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-semibold">Feedback Categories</p>
                  <div className="space-y-1 text-sm">
                    <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Peer Feedback</label>
                    <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Manager Feedback</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Subordinate Feedback</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Self Feedback</label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
