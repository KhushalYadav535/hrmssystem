'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockPerformance } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function PerformancePage() {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    redirect('/login');
  }

  const appraisals = mockPerformance;

  const radarData = appraisals.map((appraisal) => ({
    name: 'Rating',
    communication: appraisal.communicationRating,
    teamwork: appraisal.teamworkRating,
    leadership: appraisal.leadershipRating,
    technical: appraisal.technicalSkillsRating,
    overall: appraisal.overallRating,
  }));

  const comparisonData = appraisals.map((appraisal) => ({
    name: 'Metrics',
    communication: appraisal.communicationRating,
    teamwork: appraisal.teamworkRating,
    leadership: appraisal.leadershipRating,
    technical: appraisal.technicalSkillsRating,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance Appraisal</h1>
          <p className="text-muted-foreground mt-2">Track your performance reviews and ratings</p>
        </div>

        {/* Appraisals */}
        {appraisals.map((appraisal) => (
          <Card key={appraisal.id} className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{appraisal.period} Appraisal</CardTitle>
                  <CardDescription>Rated by: {appraisal.raterName}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{appraisal.overallRating}</p>
                  <p className="text-xs text-muted-foreground">/5.0</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ratings Grid */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { label: 'Communication', rating: appraisal.communicationRating },
                      { label: 'Teamwork', rating: appraisal.teamworkRating },
                      { label: 'Leadership', rating: appraisal.leadershipRating },
                      { label: 'Technical Skills', rating: appraisal.technicalSkillsRating },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium">{item.label}</p>
                          <span className="text-sm font-semibold text-primary">{item.rating}/5</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${(item.rating / 5) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={[{ name: 'You', ...radarData[0] }]}>
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
                <p className="text-sm font-semibold mb-2">Feedback</p>
                <p className="text-sm text-muted-foreground">{appraisal.comments}</p>
              </div>

              {/* Status */}
              <div className="mt-4 flex items-center justify-between">
                <Badge className={appraisal.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {appraisal.status}
                </Badge>
                <p className="text-xs text-muted-foreground">Reviewed on: {appraisal.date}</p>
              </div>
            </CardContent>
          </Card>
        ))}

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
