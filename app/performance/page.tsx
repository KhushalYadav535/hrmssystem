'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function PerformancePage() {
  const { isAuthenticated, currentUser, hasPermission } = useAuth();
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformances();
  }, []);

  const loadPerformances = async () => {
    try {
      setIsLoading(true);
      
      // Load manager appraisals (completed appraisals)
      const response = await apiService.getManagerAppraisals({ status: 'Approved' });
      if (response.success && response.data) {
        setAppraisals(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load performance data', error);
      toast.error('Failed to load performance records');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    redirect('/login');
  }

  const comparisonData = appraisals.length > 0 ? appraisals.map((appraisal) => ({
    name: appraisal.period || 'Review',
    communication: appraisal.communicationRating || 0,
    teamwork: appraisal.teamworkRating || 0,
    leadership: appraisal.leadershipRating || 0,
    technical: appraisal.technicalSkillsRating || 0,
  })) : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance Appraisal</h1>
          <p className="text-muted-foreground mt-2">Track your performance reviews and ratings</p>
        </div>

        {/* Appraisals */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading performance records...</div>
        ) : appraisals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No performance records found</div>
        ) : (
          appraisals.map((appraisal) => {
            const appraisalId = appraisal._id || appraisal.id;
            const employeeName = appraisal.employeeId ? `${appraisal.employeeId.firstName} ${appraisal.employeeId.lastName}` : 'Employee';
            const competencyRatings = appraisal.competencyRatings || {};
            const radarData = {
              communication: competencyRatings.communication || 0,
              teamwork: competencyRatings.teamwork || 0,
              leadership: competencyRatings.leadership || 0,
              problemSolving: competencyRatings.problemSolving || 0,
              overall: appraisal.overallRating || 0,
            };
            
            return (
              <Card key={appraisalId} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{appraisal.appraisalCycleId?.cycleName || 'Performance Review'} Appraisal</CardTitle>
                      <CardDescription>
                        {hasPermission('manage_employees') ? `Employee: ${employeeName}` : ''} • Rated by: {appraisal.managerId?.name || 'Manager'}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">{appraisal.overallRating || 0}</p>
                      <p className="text-xs text-muted-foreground">/5.0</p>
                      <Badge className="mt-2">{appraisal.status || 'Draft'}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ratings Grid */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {Object.entries(competencyRatings).map(([key, rating]: [string, any]) => (
                          <div key={key}>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <span className="text-sm font-semibold text-primary">{rating}/5</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: `${(rating / 5) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Radar Chart */}
                    <div className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={[{ name: employeeName, ...radarData }]}>
                          <PolarGrid stroke="var(--color-border)" />
                          <PolarAngleAxis dataKey="name" />
                          <PolarRadiusAxis angle={90} domain={[0, 5]} />
                          <Radar name="Rating" dataKey="overall" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-sm font-semibold mb-2">Overall Comments</p>
                    <p className="text-sm text-muted-foreground">{appraisal.overallComments || 'No comments provided'}</p>
                  </div>

                  {/* Recommendations */}
                  {(appraisal.promotionRecommended !== undefined || appraisal.incrementPercentage) && (
                    <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border">
                      <p className="text-sm font-semibold mb-2">Recommendations</p>
                      <div className="space-y-1 text-sm">
                        {appraisal.promotionRecommended && (
                          <p className="text-green-600">✓ Promotion Recommended</p>
                        )}
                        {appraisal.incrementPercentage > 0 && (
                          <p>Increment: {appraisal.incrementPercentage}%</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}

        {/* Performance Comparison */}
        {appraisals.length > 1 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Skills Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="communication" fill="var(--color-chart-1)" name="Communication" />
                  <Bar dataKey="teamwork" fill="var(--color-chart-2)" name="Teamwork" />
                  <Bar dataKey="leadership" fill="var(--color-chart-3)" name="Leadership" />
                  <Bar dataKey="technical" fill="var(--color-chart-4)" name="Technical" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
