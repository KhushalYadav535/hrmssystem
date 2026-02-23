'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, Filter, Eye, User, Calendar, Shield, FileText, Settings, Trash2, Edit2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import apiService from '@/lib/api';

interface AuditLogEntry {
  _id?: string;
  id?: string;
  timestamp: string | Date;
  userId?: string;
  userName: string;
  userEmail?: string;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'Success' | 'Failed' | 'Warning';
  changes?: string;
}

export default function AuditLogPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedModule !== 'all') params.module = selectedModule;
      if (selectedAction !== 'all') params.action = selectedAction;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (searchTerm) params.search = searchTerm;

      const response = await apiService.getAuditLogs(params);
      if (response.success && response.data) {
        const logs = Array.isArray(response.data) ? response.data : [];
        setAuditLogs(logs);
      }
    } catch (error: any) {
      toast.error('Failed to load audit logs');
      console.error('Load audit logs error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAuditLogs();
    }
  }, [isAuthenticated, selectedModule, selectedAction, selectedStatus, dateFrom, dateTo]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isAuthenticated) {
        loadAuditLogs();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, isAuthenticated]);

  if (!isAuthenticated) redirect('/login');
  if (!hasPermission('view_audit_logs')) redirect('/dashboard');

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'add':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'update':
      case 'edit':
        return <Edit2 className="w-4 h-4 text-blue-600" />;
      case 'delete':
      case 'remove':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'approve':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'export':
        return <Download className="w-4 h-4 text-orange-600" />;
      case 'login':
        return <User className="w-4 h-4 text-indigo-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200';
      case 'Failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleExport = async () => {
    try {
      const params: any = {};
      if (selectedModule !== 'all') params.module = selectedModule;
      if (selectedAction !== 'all') params.action = selectedAction;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await apiService.exportAuditLogs(params);
      if (response.success && response.data) {
        // Convert to CSV
        const logs = Array.isArray(response.data) ? response.data : [];
        const csvHeaders = ['Timestamp', 'User', 'Action', 'Module', 'Details', 'Status', 'IP Address'];
        const csvRows = logs.map((log: any) => [
          new Date(log.timestamp).toLocaleString(),
          log.userName || 'Unknown',
          log.action,
          log.module,
          log.details,
          log.status,
          log.ipAddress || 'N/A',
        ]);

        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success('Audit log exported successfully!');
      } else {
        toast.error('Failed to export audit log');
      }
    } catch (error: any) {
      toast.error('Failed to export audit log');
      console.error('Export audit log error:', error);
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const modules = ['all', ...Array.from(new Set(auditLogs.map(log => log.module)))];
  const actions = ['all', ...Array.from(new Set(auditLogs.map(log => log.action)))];

  const filteredLogs = auditLogs.filter((log) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (log.userName && log.userName.toLowerCase().includes(searchLower)) ||
        (log.details && log.details.toLowerCase().includes(searchLower)) ||
        (log.module && log.module.toLowerCase().includes(searchLower)) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Log</h1>
            <p className="text-muted-foreground mt-2">Track all system activities and user actions</p>
          </div>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export Log
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.filter(m => m !== 'all').map((module) => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actions.filter(a => a !== 'all').map((action) => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs List */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `${filteredLogs.length} log entries found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading audit logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No audit logs found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => {
                  const logId = log._id || log.id || '';
                  return (
                    <div
                      key={logId}
                      className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="mt-1">
                            {getActionIcon(log.action)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{log.userName || 'Unknown User'}</h3>
                              <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                              <Badge variant="outline">{log.module}</Badge>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {log.action}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground mb-1">{log.details}</p>
                            {log.changes && (
                              <p className="text-xs text-muted-foreground mb-2">
                                Changes: {log.changes}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatTimestamp(log.timestamp)}
                              </span>
                              {log.ipAddress && (
                                <>
                                  <span>•</span>
                                  <span>IP: {log.ipAddress}</span>
                                </>
                              )}
                              {log.userEmail && (
                                <>
                                  <span>•</span>
                                  <span>{log.userEmail}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
