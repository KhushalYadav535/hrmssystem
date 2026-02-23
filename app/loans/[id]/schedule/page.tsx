'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function LoanSchedulePage() {
  const { currentUser } = useAuth();
  const params = useParams();
  const loanId = params.id as string;
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      redirect('/login');
    }
    loadSchedule();
  }, [currentUser, loanId]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLoanSchedule(loanId);
      if (response.success && response.data) {
        setSchedule(response.data);
      } else {
        toast.error('Failed to load EMI schedule');
      }
    } catch (error: any) {
      toast.error('Error loading EMI schedule');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: 'Pending', variant: 'outline' },
      PAID: { label: 'Paid', variant: 'default' },
      OVERDUE: { label: 'Overdue', variant: 'destructive' },
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

  if (!schedule) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No schedule available
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">EMI Repayment Schedule</h1>
          <p className="text-muted-foreground mt-1">
            View your loan EMI payment schedule
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Summary</CardTitle>
            <CardDescription>
              Total EMIs: {schedule.summary.totalEMIs} • Paid: {schedule.summary.paidEMIs} • Pending: {schedule.summary.pendingEMIs}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {schedule.schedule.map((emi: any) => (
                <div
                  key={emi.emiNumber}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs text-muted-foreground">EMI #</p>
                      <p className="font-bold text-lg">{emi.emiNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-semibold">{new Date(emi.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Principal</p>
                      <p className="font-semibold">₹{emi.principalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Interest</p>
                      <p className="font-semibold">₹{emi.interestAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total EMI</p>
                      <p className="font-semibold text-lg">₹{emi.emiAmount.toLocaleString()}</p>
                    </div>
                    {emi.status === 'PAID' && emi.paidDate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Paid Date</p>
                        <p className="font-semibold">{new Date(emi.paidDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    {getStatusBadge(emi.status)}
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
