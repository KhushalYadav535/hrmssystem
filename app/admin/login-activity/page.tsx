'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Filter, Search, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

/**
 * US-A1-06: Login Activity Audit Log UI
 * Shows all login attempts (successful and failed) for Platform Admin
 */
export default function LoginActivityPage() {
  const { currentUser } = useAuth();
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    outcome: 'all',
    ip: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadLoginActivity();
  }, [currentPage, filters]);

  const loadLoginActivity = async () => {
    setIsLoading(true);
    try {
      // Filter audit logs for login-related actions
      const params: any = {
        module: 'Authentication',
        action: filters.outcome === 'all' ? undefined : (filters.outcome === 'success' ? 'Login Success' : 'Login Failed'),
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        search: filters.ip || undefined,
      };

      const response = await apiService.getAuditLogs(params);
      
      if (response.success && response.data) {
        const logs = Array.isArray(response.data) ? response.data : response.data.logs || [];
        // Filter for login-related actions only
        const loginActions = logs.filter((log: any) => 
          log.action === 'Login' || 
          log.action === 'Login Success' || 
          log.action === 'Login Failed' ||
          log.action === 'Account Locked' ||
          log.action === 'MFA Verified' ||
          log.action === 'MFA Failed'
        );
        
        // Paginate
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        setLoginLogs(loginActions.slice(start, end));
        setTotalPages(Math.ceil(loginActions.length / itemsPerPage));
      }
    } catch (error: any) {
      toast.error('Failed to load login activity');
      console.error('Login activity error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiService.get('/audit-logs/export', {
        module: 'Authentication',
        format: 'csv',
      });
      
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `login-activity-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Login activity exported successfully');
      }
    } catch (error: any) {
      toast.error('Failed to export login activity');
    }
  };

  const getOutcomeBadge = (action: string, status: string) => {
    if (action === 'Login Success' || action === 'Login' || action === 'MFA Verified') {
      return <Badge className="bg-green-100 text-green-700">Success</Badge>;
    }
    if (action === 'Login Failed' || action === 'MFA Failed') {
      return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
    }
    if (action === 'Account Locked') {
      return <Badge className="bg-orange-100 text-orange-700">Blocked</Badge>;
    }
    return <Badge variant="outline">{status || 'Unknown'}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Login Activity</h1>
            <p className="text-muted-foreground mt-2">
              View all login attempts (successful and failed) for security monitoring
            </p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              <div>
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
              <div>
                <Label>Outcome</Label>
                <Select
                  value={filters.outcome}
                  onValueChange={(value) => setFilters({ ...filters, outcome: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>IP Address</Label>
                <Input
                  placeholder="Search by IP..."
                  value={filters.ip}
                  onChange={(e) => setFilters({ ...filters, ip: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Activity Table */}
        <Card>
          <CardHeader>
            <CardTitle>Login Attempts</CardTitle>
            <CardDescription>
              Showing {loginLogs.length} login attempts (retained for 90 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading login activity...</p>
              </div>
            ) : loginLogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No login activity found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold text-sm">Timestamp</th>
                      <th className="text-left p-3 font-semibold text-sm">Email</th>
                      <th className="text-left p-3 font-semibold text-sm">IP Address</th>
                      <th className="text-left p-3 font-semibold text-sm">Device/Browser</th>
                      <th className="text-left p-3 font-semibold text-sm">Outcome</th>
                      <th className="text-left p-3 font-semibold text-sm">Failure Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginLogs.map((log: any) => (
                      <tr key={log._id || log.id} className="border-b hover:bg-secondary/50">
                        <td className="p-3 text-sm">
                          {new Date(log.timestamp || log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3 text-sm font-medium">{log.userEmail || log.email}</td>
                        <td className="p-3 text-sm text-muted-foreground">{log.ipAddress || 'Unknown'}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {log.userAgent ? log.userAgent.substring(0, 50) + '...' : 'Unknown'}
                        </td>
                        <td className="p-3 text-sm">
                          {getOutcomeBadge(log.action, log.status)}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {log.details || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
