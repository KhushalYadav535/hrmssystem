'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect, useParams, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Award, MapPin, Calendar, Target, Lightbulb, Save, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function CareerPlanningContent() {
  const { isAuthenticated, currentUser } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('employeeId') || params?.id || currentUser?.id;

  const [careerPath, setCareerPath] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('path');

  if (!isAuthenticated) redirect('/login');

  useEffect(() => {
    if (employeeId) {
      loadCareerData();
    }
  }, [employeeId, activeTab]);

  const loadCareerData = async () => {
    if (!employeeId) return;
    try {
      setIsLoading(true);
      
      if (activeTab === 'path') {
        const response = await apiService.getCareerPath(employeeId);
        if (response.success && response.data) {
          setCareerPath(response.data);
        }
      } else if (activeTab === 'timeline') {
        const response = await apiService.getCareerTimeline(employeeId);
        if (response.success && response.data) {
          setTimeline(Array.isArray(response.data) ? response.data : []);
        }
      } else if (activeTab === 'recommendations') {
        const response = await apiService.getCareerRecommendations(employeeId);
        if (response.success && response.data) {
          setRecommendations(response.data);
        }
      }
    } catch (error: any) {
      toast.error('Failed to load career data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Career Planning</h1>
          <p className="text-muted-foreground mt-2">View career path, timeline, and recommendations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="path">Career Path</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="path" className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center">Loading...</CardContent>
              </Card>
            ) : careerPath ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Employee Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Employee Code</p>
                        <p className="text-lg font-semibold">{careerPath.employee?.employeeCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="text-lg font-semibold">{careerPath.employee?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Designation</p>
                        <p className="text-lg font-semibold">{careerPath.employee?.designation}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Years of Service</p>
                        <p className="text-lg font-semibold">{careerPath.metrics?.yearsOfService || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Current Posting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {careerPath.currentPosting ? (
                      <div className="space-y-2">
                        <p className="font-semibold">{careerPath.currentPosting.toDesignation}</p>
                        <p className="text-sm text-muted-foreground">
                          {careerPath.currentPosting.toDepartment} • {careerPath.currentPosting.toLocation}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Since {new Date(careerPath.currentPosting.effectiveDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No current posting information</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Career Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Postings</p>
                        <p className="text-2xl font-bold">{careerPath.metrics?.totalPostings || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Tenure (Days)</p>
                        <p className="text-2xl font-bold">{careerPath.metrics?.totalTenureDays || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Tenure (Days)</p>
                        <p className="text-2xl font-bold">{careerPath.metrics?.avgTenureDays || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Skills</p>
                        <p className="text-2xl font-bold">{careerPath.skills?.total || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(careerPath.skills?.byCategory || {}).map(([category, count]: [string, any]) => (
                        <div key={category} className="flex justify-between">
                          <span className="text-sm">{category}</span>
                          <Badge>{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Training Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Completed Trainings</p>
                        <p className="text-2xl font-bold">{careerPath.training?.totalCompleted || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Hours</p>
                        <p className="text-2xl font-bold">{careerPath.training?.totalHours || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No career path data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center">Loading...</CardContent>
              </Card>
            ) : timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.map((event, idx) => (
                  <Card key={idx} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{event.title}</h3>
                            <Badge>{event.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No timeline events found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center">Loading...</CardContent>
              </Card>
            ) : recommendations ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Current Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Postings</p>
                        <p className="text-lg font-bold">{recommendations.currentStatus?.totalPostings || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed Trainings</p>
                        <p className="text-lg font-bold">{recommendations.currentStatus?.completedTrainings || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Skills</p>
                        <p className="text-lg font-bold">{recommendations.currentStatus?.totalSkills || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Verified Skills</p>
                        <p className="text-lg font-bold">{recommendations.currentStatus?.verifiedSkills || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {recommendations.recommendations?.map((rec: any, idx: number) => (
                    <Card key={idx} className={rec.priority === 'High' ? 'border-l-4 border-l-red-500' : rec.priority === 'Medium' ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-blue-500'}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5" />
                            {rec.title}
                          </CardTitle>
                          <Badge variant={rec.priority === 'High' ? 'destructive' : rec.priority === 'Medium' ? 'default' : 'secondary'}>
                            {rec.priority} Priority
                          </Badge>
                        </div>
                        <CardDescription>{rec.type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{rec.description}</p>
                        <div>
                          <p className="text-sm font-medium mb-2">Action Items:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {rec.actionItems?.map((item: string, itemIdx: number) => (
                              <li key={itemIdx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No recommendations available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default function CareerPlanningPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    }>
      <CareerPlanningContent />
    </Suspense>
  );
}
