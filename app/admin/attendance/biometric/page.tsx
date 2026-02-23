'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, RefreshCw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

/**
 * Biometric Sync Page
 * BRD: BR-P1-002 - Attendance Enhancements
 */
export default function BiometricSyncPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [processData, setProcessData] = useState({
    startDate: '',
    endDate: '',
  });

  const handleSync = async () => {
    try {
      setSyncing(true);
      // In real implementation, this would fetch from biometric device API
      // For now, showing manual upload option
      toast.info('Biometric sync feature - Connect to biometric device API');
    } catch (error: any) {
      toast.error(error.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleProcess = async () => {
    if (!processData.startDate || !processData.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    try {
      setProcessing(true);
      const res = await apiService.processBiometricPunches({
        startDate: processData.startDate,
        endDate: processData.endDate,
      });
      
      if (res.success) {
        toast.success('Biometric punches processed successfully');
        setProcessData({ startDate: '', endDate: '' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Biometric Integration</h1>
          <p className="text-muted-foreground mt-1">
            Sync and process biometric attendance data (BR-P1-002)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync Biometric Data</CardTitle>
              <CardDescription>
                Sync punches from biometric devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Connect to biometric device API to sync punches automatically.
                  Manual sync option available for file-based imports.
                </AlertDescription>
              </Alert>
              <Button onClick={handleSync} disabled={syncing} className="w-full">
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Process Punches</CardTitle>
              <CardDescription>
                Process synced punches into attendance records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={processData.startDate}
                  onChange={(e) => setProcessData({ ...processData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={processData.endDate}
                  onChange={(e) => setProcessData({ ...processData, endDate: e.target.value })}
                />
              </div>
              <Button onClick={handleProcess} disabled={processing} className="w-full">
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Process Punches
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Biometric Punches</CardTitle>
            <CardDescription>View synced biometric punch records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Punch records will appear here after sync
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
