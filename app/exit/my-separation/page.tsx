'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Calendar, FileText, CheckCircle2, Clock, AlertCircle, DollarSign } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function MySeparationPage() {
  const { currentUser } = useAuth();
  const [separation, setSeparation] = useState<any>(null);
  const [clearances, setClearances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      redirect('/login');
    }
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [separationRes, clearancesRes] = await Promise.all([
        apiService.getMySeparation(),
        separationRes?.data?._id ? apiService.getClearances(separationRes.data._id) : Promise.resolve(null),
      ]);

      if (separationRes.success && separationRes.data) {
        setSeparation(separationRes.data);
        if (clearancesRes?.success && clearancesRes.data) {
          setClearances(clearancesRes.data);
        }
      }
    } catch (error: any) {
      toast.error('Error loading separation data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      SUBMITTED: { label: 'Submitted', variant: 'outline' },
      ACCEPTED: { label: 'Accepted', variant: 'secondary' },
      NOTICE_PERIOD: { label: 'Notice Period', variant: 'secondary' },
      CLEARANCE_PENDING: { label: 'Clearance Pending', variant: 'outline' },
      CLEARANCE_DONE: { label: 'Clearance Done', variant: 'default' },
      FNF_PENDING: { label: 'F&F Pending', variant: 'outline' },
      FNF_APPROVED: { label: 'F&F Approved', variant: 'default' },
      COMPLETED: { label: 'Completed', variant: 'default' },
    };
    const c = config[status] || { label: status, variant: 'outline' };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getClearanceStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: 'Pending', variant: 'outline' },
      CLEARED: { label: 'Cleared', variant: 'default' },
      WAIVED: { label: 'Waived', variant: 'secondary' },
    };
    const c = config[status] || { label: status, variant: 'outline' };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!separation) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Exit Process</h1>
            <p className="text-muted-foreground mt-1">
              Track your exit process and clearance status
            </p>
          </div>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No active separation process found</p>
              <Link href="/exit/apply">
                <Button>Submit Resignation</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(separation.lastWorkingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Exit Process</h1>
            <p className="text-muted-foreground mt-1">
              Track your exit process and clearance status
            </p>
          </div>
          {getStatusBadge(separation.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Working Date</p>
                  <p className="text-2xl font-bold">
                    {new Date(separation.lastWorkingDate).toLocaleDateString()}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="text-2xl font-bold">{daysRemaining > 0 ? daysRemaining : 0}</p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Notice Period</p>
                  <p className="text-2xl font-bold">{separation.noticePeriodDays} days</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Separation Details</TabsTrigger>
            <TabsTrigger value="clearance">Clearance Status</TabsTrigger>
            {['FNF_PENDING', 'FNF_APPROVED', 'COMPLETED'].includes(separation.status) && (
              <TabsTrigger value="fnf">F&F Settlement</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Separation Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Separation Type</p>
                    <p className="font-semibold">{separation.separationType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Resignation Date</p>
                    <p className="font-semibold">
                      {separation.resignationDate
                        ? new Date(separation.resignationDate).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Notice Period Served</p>
                    <p className="font-semibold">{separation.noticePeriodServedDays} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Notice Period Waived</p>
                    <p className="font-semibold">{separation.noticePeriodWaived ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                {separation.resignationReason && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="font-semibold">{separation.resignationReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clearance">
            <Card>
              <CardHeader>
                <CardTitle>Department Clearance Status</CardTitle>
                <CardDescription>
                  {clearances.filter(c => c.status === 'CLEARED' || c.status === 'WAIVED').length} of {clearances.length} departments cleared
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clearances.map((clearance) => (
                    <div
                      key={clearance._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{clearance.department}</p>
                        {clearance.remarks && (
                          <p className="text-sm text-muted-foreground mt-1">{clearance.remarks}</p>
                        )}
                        {clearance.clearedDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Cleared: {new Date(clearance.clearedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {getClearanceStatusBadge(clearance.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fnf">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    F&F settlement details will be available once clearance is completed
                  </p>
                  <Link href={`/exit/fnf/${separation._id}`}>
                    <Button>View F&F Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
