'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Save, RefreshCw, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/lib/api';

interface DistributionData {
  department: string;
  employees: number;
  currentDistribution: {
    exceptional: number;
    exceeds: number;
    meets: number;
    needsImprovement: number;
    unsatisfactory: number;
  };
  targetDistribution: {
    exceptional: number;
    exceeds: number;
    meets: number;
    needsImprovement: number;
    unsatisfactory: number;
  };
}

export default function NormalizationPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const { toast } = useToast();
  const [cycles, setCycles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [previewData, setPreviewData] = useState<any>(null);
  const [normalizations, setNormalizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [justification, setJustification] = useState('');

  // Check if user has permission to access normalization
  const hasNormalizationAccess = currentUser && ['HR Administrator', 'Tenant Admin', 'Super Admin'].includes(currentUser.role);

  if (!isAuthenticated || !hasNormalizationAccess) {
    redirect('/dashboard');
  }

  useEffect(() => {
    loadCycles();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedCycle) {
      loadPreview();
      loadNormalizations();
    } else {
      setPreviewData(null);
      setNormalizations([]);
    }
  }, [selectedCycle, selectedDepartment]);

  const loadCycles = async () => {
    try {
      const res = await apiService.getAppraisalCycles({ status: 'ACTIVE' });
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : [];
        setCycles(list);
        if (list.length > 0 && !selectedCycle) setSelectedCycle(list[0]._id || list[0].id);
      }
      if (!res.data?.length) {
        const allRes = await apiService.getAppraisalCycles();
        if (allRes.success && allRes.data?.length) {
          const list = Array.isArray(allRes.data) ? allRes.data : [];
          setCycles(list);
          if (list.length > 0 && !selectedCycle) setSelectedCycle(list[0]._id || list[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load cycles', error);
      toast({ title: 'Error', description: 'Failed to load appraisal cycles', variant: 'destructive' });
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await apiService.getDepartments();
      if (res.success && res.data) {
        setDepartments(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to load departments', error);
    }
  };

  const loadPreview = async () => {
    if (!selectedCycle) return;
    try {
      setIsLoading(true);
      const params: any = { appraisalCycleId: selectedCycle };
      if (selectedDepartment && selectedDepartment !== 'all') {
        const dept = departments.find((d) => d.name === selectedDepartment || (d._id || d.id) === selectedDepartment);
        if (dept?._id || dept?.id) params.departmentId = dept._id || dept.id;
        else params.departmentName = selectedDepartment;
      }
      const res = await apiService.getNormalizationPreview(params);
      if (res.success && res.data) {
        setPreviewData(res.data);
      } else {
        setPreviewData(null);
      }
    } catch (error) {
      console.error('Failed to load preview', error);
      toast({ title: 'Error', description: 'Failed to load distribution', variant: 'destructive' });
      setPreviewData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNormalizations = async () => {
    if (!selectedCycle) return;
    try {
      const res = await apiService.getNormalizations({ appraisalCycleId: selectedCycle });
      if (res.success && res.data) {
        setNormalizations(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      setNormalizations([]);
    }
  };

  const handleCreateNormalization = async () => {
    if (!selectedCycle) return;
    try {
      setIsCreating(true);
      const payload: any = { appraisalCycleId: selectedCycle };
      if (selectedDepartment && selectedDepartment !== 'all') {
        const dept = departments.find((d) => (d.name || d._id) === selectedDepartment);
        if (dept) payload.departmentId = dept._id || dept.id;
      }
      const res = await apiService.createNormalization(payload);
      if (res.success) {
        toast({ title: 'Success', description: 'Normalization created' });
        loadNormalizations();
        loadPreview();
      } else {
        toast({ title: 'Error', description: res.message || 'Failed', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCompleteNormalization = async (id: string) => {
    try {
      const res = await apiService.completeNormalization(id);
      if (res.success) {
        toast({ title: 'Success', description: 'Normalization completed' });
        loadNormalizations();
        loadPreview();
      } else {
        toast({ title: 'Error', description: res.message || 'Failed', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed', variant: 'destructive' });
    }
  };

  const departmentsForChart: DistributionData[] = previewData?.byDepartment || [];
  const totalEmp = previewData?.totalEmployees || 0;
  const targetPct = previewData?.targetDistribution || { exceptional: 10, exceeds: 20, meets: 60, needsImprovement: 8, unsatisfactory: 2 };
  const currentDept = selectedDepartment === 'all'
    ? previewData
      ? {
          department: 'All',
          employees: totalEmp,
          currentDistribution: previewData.currentDistribution || {},
          targetDistribution: {
            exceptional: Math.round((targetPct.exceptional / 100) * totalEmp),
            exceeds: Math.round((targetPct.exceeds / 100) * totalEmp),
            meets: Math.round((targetPct.meets / 100) * totalEmp),
            needsImprovement: Math.round((targetPct.needsImprovement / 100) * totalEmp),
            unsatisfactory: Math.round((targetPct.unsatisfactory / 100) * totalEmp),
          },
        }
      : null
    : departmentsForChart.find((d) => d.department === selectedDepartment) || departmentsForChart[0];

  const chartData = currentDept
    ? [
        { rating: 'Exceptional', current: currentDept.currentDistribution?.exceptional || 0, target: currentDept.targetDistribution?.exceptional || 0 },
        { rating: 'Exceeds', current: currentDept.currentDistribution?.exceeds || 0, target: currentDept.targetDistribution?.exceeds || 0 },
        { rating: 'Meets', current: currentDept.currentDistribution?.meets || 0, target: currentDept.targetDistribution?.meets || 0 },
        { rating: 'Needs Improvement', current: currentDept.currentDistribution?.needsImprovement || 0, target: currentDept.targetDistribution?.needsImprovement || 0 },
        { rating: 'Unsatisfactory', current: currentDept.currentDistribution?.unsatisfactory || 0, target: currentDept.targetDistribution?.unsatisfactory || 0 },
      ]
    : [];

  const pendingNorm = normalizations.find((n) => n.status === 'Draft' || n.status === 'In Progress');
  const allCompleted = normalizations.length > 0 && normalizations.every((n) => n.status === 'Completed');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Rating Normalization</h1>
            <p className="text-muted-foreground mt-2">Calibrate ratings across departments to ensure fairness</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedCycle} onValueChange={setSelectedCycle}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select cycle" />
              </SelectTrigger>
              <SelectContent>
                {cycles.map((c) => (
                  <SelectItem key={c._id || c.id} value={c._id || c.id}>
                    {c.cycleName} ({c.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentsForChart.length > 0
                  ? departmentsForChart.map((d) => (
                      <SelectItem key={d.department} value={d.department}>
                        {d.department}
                      </SelectItem>
                    ))
                  : departments.map((d) => (
                      <SelectItem key={d._id || d.id} value={d.name || d._id}>
                        {d.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Bell Curve Distribution</p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>Exceptional (5): 10% of employees</li>
                  <li>Exceeds Expectations (4): 20% of employees</li>
                  <li>Meets Expectations (3): 60% of employees</li>
                  <li>Needs Improvement (2): 8% of employees</li>
                  <li>Unsatisfactory (1): 2% of employees</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedCycle ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No appraisal cycle selected. Select an active cycle to view distribution.
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : !previewData && !isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No manager appraisals submitted for this cycle yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Submit manager appraisals to see distribution and run normalization.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution - {currentDept?.department || 'All'}</CardTitle>
                <CardDescription>Current vs Target Distribution ({previewData?.totalEmployees || 0} employees)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="current" fill="#8884d8" name="Current Distribution" />
                    <Bar dataKey="target" fill="#82ca9d" name="Target Distribution" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Tabs defaultValue="distribution" className="w-full">
              <TabsList>
                <TabsTrigger value="distribution">Distribution</TabsTrigger>
                <TabsTrigger value="comparison">Cross-Department</TabsTrigger>
                <TabsTrigger value="adjustments">Rating Adjustments</TabsTrigger>
              </TabsList>

              <TabsContent value="distribution" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentDept &&
                        Object.entries(currentDept.currentDistribution || {}).map(([key, value]) => {
                          const total = currentDept.employees || 1;
                          return (
                            <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex-1">
                                <p className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                                  <div className="bg-primary h-2 rounded-full" style={{ width: `${(value / total) * 100}%` }} />
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <p className="font-bold">{value}</p>
                                <p className="text-xs text-muted-foreground">{((value / total) * 100).toFixed(1)}%</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cross-Department Comparison</CardTitle>
                    <CardDescription>Compare rating distributions across departments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {departmentsForChart.map((dept) => (
                        <div key={dept.department} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-semibold">{dept.department}</p>
                            <Badge>{dept.employees} employees</Badge>
                          </div>
                          <div className="grid grid-cols-5 gap-2 text-xs">
                            <div className="text-center">
                              <p className="font-semibold text-green-600">{dept.currentDistribution?.exceptional || 0}</p>
                              <p className="text-muted-foreground">Exceptional</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-blue-600">{dept.currentDistribution?.exceeds || 0}</p>
                              <p className="text-muted-foreground">Exceeds</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-yellow-600">{dept.currentDistribution?.meets || 0}</p>
                              <p className="text-muted-foreground">Meets</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-orange-600">{dept.currentDistribution?.needsImprovement || 0}</p>
                              <p className="text-muted-foreground">Needs Imp.</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-red-600">{dept.currentDistribution?.unsatisfactory || 0}</p>
                              <p className="text-muted-foreground">Unsatisfactory</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="adjustments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Normalization Actions</CardTitle>
                    <CardDescription>Create normalization record or complete existing one</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Justification (optional)</Label>
                      <textarea
                        className="w-full p-3 border rounded-lg bg-card"
                        rows={4}
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        placeholder="Provide justification for rating adjustments..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleCreateNormalization} disabled={isCreating} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        {isCreating ? 'Creating...' : 'Create Normalization'}
                      </Button>
                    </div>
                    {normalizations.length > 0 && (
                      <div className="space-y-2 pt-4 border-t">
                        <p className="font-semibold">Normalization Records</p>
                        {normalizations.map((n) => (
                          <div key={n._id || n.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{n.appraisalCycleId?.cycleName || 'Cycle'}</p>
                              <p className="text-xs text-muted-foreground">{n.departmentId?.name || 'All'} • {n.status}</p>
                            </div>
                            {n.status !== 'Completed' && (
                              <Button size="sm" onClick={() => handleCompleteNormalization(n._id || n.id)}>
                                Complete
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {allCompleted && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Normalization Complete</p>
                      <p className="text-sm text-muted-foreground">All normalization records are completed for this cycle.</p>
                    </div>
                    <Badge className="bg-green-600">Completed</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
