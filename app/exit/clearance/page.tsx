'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

function ClearanceContent() {
  const { currentUser } = useAuth();
  const searchParams = useSearchParams();
  const separationId = searchParams.get('id');
  const [separation, setSeparation] = useState<any>(null);
  const [clearances, setClearances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clearanceStatus, setClearanceStatus] = useState<'CLEARED' | 'WAIVED'>('CLEARED');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (!currentUser) {
      redirect('/login');
    }
    if (separationId) {
      loadData();
    } else {
      toast.error('Separation ID is required');
      redirect('/exit/admin');
    }
  }, [currentUser, separationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [separationRes, clearancesRes] = await Promise.all([
        apiService.getSeparation(separationId!),
        apiService.getClearances(separationId!),
      ]);

      if (separationRes.success && separationRes.data) {
        setSeparation(separationRes.data);
      }
      if (clearancesRes.success && clearancesRes.data) {
        setClearances(clearancesRes.data);
      }
    } catch (error: any) {
      toast.error('Error loading clearance data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkClearance = (dept: string) => {
    setSelectedDept(dept);
    setClearanceStatus('CLEARED');
    setRemarks('');
    setIsDialogOpen(true);
  };

  const handleSubmitClearance = async () => {
    if (!selectedDept) return;

    try {
      const response = await apiService.markClearance(separationId!, selectedDept, {
        status: clearanceStatus,
        remarks: remarks.trim() || undefined,
      });

      if (response.success) {
        toast.success(`Department clearance ${clearanceStatus.toLowerCase()} successfully`);
        setIsDialogOpen(false);
        loadData();
      } else {
        toast.error(response.message || 'Failed to update clearance');
      }
    } catch (error: any) {
      toast.error('Error updating clearance');
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
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
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Separation record not found
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const allCleared = clearances.every(c => c.status === 'CLEARED' || c.status === 'WAIVED');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Department Clearance</h1>
          <p className="text-muted-foreground mt-1">
            {separation.employeeId?.firstName} {separation.employeeId?.lastName} ({separation.employeeId?.employeeCode})
          </p>
        </div>

        {allCleared && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">All Clearances Completed</p>
                  <p className="text-sm text-green-700">
                    All departments have been cleared. F&F settlement can now be processed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Clearance Checklist</CardTitle>
            <CardDescription>
              Mark each department as cleared or waived
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clearances.map((clearance) => (
                <div
                  key={clearance._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-lg">{clearance.department}</p>
                      {getStatusBadge(clearance.status)}
                    </div>
                    {clearance.remarks && (
                      <p className="text-sm text-muted-foreground mb-2">{clearance.remarks}</p>
                    )}
                    {clearance.clearanceOfficerName && (
                      <p className="text-xs text-muted-foreground">
                        Cleared by: {clearance.clearanceOfficerName}
                        {clearance.clearedDate &&
                          ` on ${new Date(clearance.clearedDate).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                  {clearance.status === 'PENDING' && (
                    <Button
                      variant="outline"
                      onClick={() => handleMarkClearance(clearance.department)}
                    >
                      Mark Clearance
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Department Clearance</DialogTitle>
              <DialogDescription>
                Mark {selectedDept} department as cleared or waived
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={clearanceStatus} onValueChange={(value: any) => setClearanceStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLEARED">Cleared</SelectItem>
                    <SelectItem value="WAIVED">Waived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Remarks</Label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any remarks or notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitClearance}>
                {clearanceStatus === 'CLEARED' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Cleared
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Mark Waived
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default function ClearancePage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </DashboardLayout>
      }
    >
      <ClearanceContent />
    </Suspense>
  );
}
