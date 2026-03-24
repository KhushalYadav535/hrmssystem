'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  FileText,
  Clock,
  CheckCircle2,
  Loader2,
  Eye,
  Calendar,
} from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ExitAdminPage() {
  const { currentUser } = useAuth();
  const [separations, setSeparations] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    separationType: '',
  });

  useEffect(() => {
    if (!currentUser) {
      redirect('/login');
    }
    loadData();
  }, [currentUser, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllExits({
        status: filters.status || undefined,
        separationType: filters.separationType || undefined,
      });

      if (response.success && response.data) {
        setSeparations(response.data);
        if (response.summary) {
          setSummary(response.summary);
        }
      }
    } catch (error: any) {
      toast.error('Error loading exit data');
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const filteredSeparations = separations.filter(sep => {
    if (filters.status && sep.status !== filters.status) return false;
    if (filters.separationType && sep.separationType !== filters.separationType) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Exit Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee separations and exit processes
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{summary.total || 0}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="text-2xl font-bold">{summary.submitted || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Notice Period</p>
                  <p className="text-2xl font-bold">{summary.noticePeriod || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clearance Pending</p>
                  <p className="text-2xl font-bold">{summary.clearancePending || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">F&F Pending</p>
                  <p className="text-2xl font-bold">{summary.fnfPending || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{summary.completed || 0}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={filters.status || 'all'} onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : value })}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="NOTICE_PERIOD">Notice Period</SelectItem>
                    <SelectItem value="CLEARANCE_PENDING">Clearance Pending</SelectItem>
                    <SelectItem value="FNF_PENDING">F&F Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filters.separationType || 'all'} onValueChange={(value) => setFilters({ ...filters, separationType: value === 'all' ? '' : value })}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="RESIGNATION">Resignation</SelectItem>
                    <SelectItem value="RETIREMENT">Retirement</SelectItem>
                    <SelectItem value="VRS">VRS</SelectItem>
                    <SelectItem value="TERMINATION">Termination</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Separations List */}
        <Card>
          <CardHeader>
            <CardTitle>All Separations</CardTitle>
            <CardDescription>{filteredSeparations.length} separation(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSeparations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No separations found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSeparations.map((separation) => (
                  <div
                    key={separation._id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {separation.employeeId?.firstName} {separation.employeeId?.lastName}
                        </h3>
                        {getStatusBadge(separation.status)}
                        <Badge variant="outline">{separation.separationType}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                        <div>
                          <p className="text-muted-foreground">Employee Code</p>
                          <p className="font-medium">{separation.employeeId?.employeeCode}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Working Date</p>
                          <p className="font-medium">
                            {formatDateDDMMYYYY(separation.lastWorkingDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Notice Period</p>
                          <p className="font-medium">{separation.noticePeriodDays} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submitted</p>
                          <p className="font-medium">
                            {formatDateDDMMYYYY(separation.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/exit/clearance?id=${separation._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      {['CLEARANCE_DONE', 'FNF_PENDING', 'FNF_APPROVED'].includes(separation.status) && (
                        <Link href={`/exit/fnf/${separation._id}`}>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            F&F
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
