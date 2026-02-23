'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertCircle, Plus, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

/**
 * Grievance Management Page
 * BRD: BR-P1-004
 */
export default function GrievancePage() {
  const { currentUser } = useAuth();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
  });

  useEffect(() => {
    loadData();
  }, [currentUser, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (currentUser?.role === 'Employee') {
        const res = await apiService.getMyGrievances(filters);
        if (res.success && res.data) {
          setGrievances(res.data);
        }
      } else {
        const [grievancesRes, statsRes] = await Promise.all([
          apiService.getAllGrievances({ ...filters, limit: 50 }),
          apiService.getGrievanceDashboardStats(),
        ]);
        
        if (grievancesRes.success && grievancesRes.data) {
          setGrievances(grievancesRes.data);
        }
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      }
    } catch (error: any) {
      toast.error('Error loading grievances');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      SUBMITTED: { label: 'Submitted', variant: 'outline' },
      UNDER_REVIEW: { label: 'Under Review', variant: 'secondary' },
      ASSIGNED: { label: 'Assigned', variant: 'secondary' },
      INVESTIGATION: { label: 'Investigation', variant: 'secondary' },
      RESOLUTION_PROPOSED: { label: 'Resolution Proposed', variant: 'default' },
      RESOLVED: { label: 'Resolved', variant: 'default' },
      CLOSED: { label: 'Closed', variant: 'default' },
      REOPENED: { label: 'Reopened', variant: 'destructive' },
      APPEALED: { label: 'Appealed', variant: 'destructive' },
      REJECTED: { label: 'Rejected', variant: 'destructive' },
    };
    const c = config[status] || { label: status, variant: 'outline' };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const config: Record<string, { label: string; className: string }> = {
      LOW: { label: 'Low', className: 'bg-green-100 text-green-800' },
      MEDIUM: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
      HIGH: { label: 'High', className: 'bg-orange-100 text-orange-800' },
      CRITICAL: { label: 'Critical', className: 'bg-red-100 text-red-800' },
    };
    const c = config[severity] || { label: severity, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Grievance Management</h1>
            <p className="text-muted-foreground mt-1">
              Submit and track employee grievances (BR-P1-004)
            </p>
          </div>
          {currentUser?.role === 'Employee' && (
            <Link href="/grievance/submit">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Submit Grievance
              </Button>
            </Link>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Open</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.open}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">At Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.atRisk}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Grievances</CardTitle>
            <CardDescription>
              {currentUser?.role === 'Employee' ? 'Your grievances' : 'All grievances'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : value })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="INVESTIGATION">Investigation</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => setFilters({ ...filters, category: value === 'all' ? '' : value })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="SALARY_BENEFITS">Salary & Benefits</SelectItem>
                  <SelectItem value="LEAVE_ATTENDANCE">Leave & Attendance</SelectItem>
                  <SelectItem value="WORK_ENVIRONMENT">Work Environment</SelectItem>
                  <SelectItem value="WORKPLACE_HARASSMENT">Workplace Harassment</SelectItem>
                  <SelectItem value="MANAGER_PEER_ISSUES">Manager/Peer Issues</SelectItem>
                  <SelectItem value="OTHERS">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {grievances.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No grievances found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grievance ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    {currentUser?.role !== 'Employee' && <TableHead>Assigned To</TableHead>}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grievances.map((grievance) => (
                    <TableRow key={grievance._id}>
                      <TableCell className="font-mono">{grievance.grievanceId}</TableCell>
                      <TableCell>{grievance.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{grievance.category.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>{getSeverityBadge(grievance.severity)}</TableCell>
                      <TableCell>{getStatusBadge(grievance.status)}</TableCell>
                      <TableCell>
                        {new Date(grievance.submittedDate).toLocaleDateString()}
                      </TableCell>
                      {currentUser?.role !== 'Employee' && (
                        <TableCell>
                          {grievance.assignedTo?.name || 'Unassigned'}
                        </TableCell>
                      )}
                      <TableCell>
                        <Link href={`/grievance/${grievance._id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
