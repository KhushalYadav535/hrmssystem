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
import { useState } from 'react';
import { toast } from 'sonner';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  status: 'Success' | 'Failed' | 'Warning';
  changes?: string;
}

export default function AuditLogPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  if (!isAuthenticated || !hasPermission('configure_system')) {
    redirect('/dashboard');
  }

  const auditLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: '2026-02-01 14:30:25',
      userId: 'user-003',
      userName: 'Deepa Gupta',
      action: 'Create',
      module: 'Employee Management',
      details: 'Created new employee: Rajesh Kumar (EMP-20001)',
      ipAddress: '192.168.1.110',
      status: 'Success',
      changes: 'New employee record added',
    },
    {
      id: '2',
      timestamp: '2026-02-01 13:15:10',
      userId: 'user-002',
      userName: 'Priya Sharma',
      action: 'Approve',
      module: 'Leave Management',
      details: 'Approved leave request for Amit Verma (3 days)',
      ipAddress: '192.168.1.105',
      status: 'Success',
    },
    {
      id: '3',
      timestamp: '2026-02-01 12:45:33',
      userId: 'user-001',
      userName: 'Rajesh Kumar',
      action: 'Update',
      module: 'Payroll',
      details: 'Updated salary structure for designation: Senior Manager',
      ipAddress: '192.168.1.100',
      status: 'Success',
      changes: 'Basic salary: ₹1,50,000 → ₹1,60,000',
    },
    {
      id: '4',
      timestamp: '2026-02-01 11:20:15',
      userId: 'user-003',
      userName: 'Deepa Gupta',
      action: 'Delete',
      module: 'Settings',
      details: 'Deleted department: Marketing',
      ipAddress: '192.168.1.110',
      status: 'Warning',
      changes: 'Department removed, 15 employees reassigned',
    },
    {
      id: '5',
      timestamp: '2026-02-01 10:05:42',
      userId: 'user-004',
      userName: 'Amit Verma',
      action: 'Login',
      module: 'Authentication',
      details: 'User logged in successfully',
      ipAddress: '192.168.1.115',
      status: 'Success',
    },
    {
      id: '6',
      timestamp: '2026-02-01 09:30:18',
      userId: 'user-002',
      userName: 'Priya Sharma',
      action: 'Export',
      module: 'Reports',
      details: 'Exported payroll report for January 2026',
      ipAddress: '192.168.1.105',
      status: 'Success',
    },
    {
      id: '7',
      timestamp: '2026-02-01 08:15:55',
      userId: 'unknown',
      userName: 'Unknown User',
      action: 'Login',
      module: 'Authentication',
      details: 'Failed login attempt - Invalid credentials',
      ipAddress: '192.168.1.200',
      status: 'Failed',
    },
    {
      id: '8',
      timestamp: '2026-01-31 18:45:22',
      userId: 'user-003',
      userName: 'Deepa Gupta',
      action: 'Update',
      module: 'Permissions',
      details: 'Updated role permissions for Manager role',
      ipAddress: '192.168.1.110',
      status: 'Success',
      changes: 'Added "Approve Expense" permission',
    },
  ];

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

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
    
    return matchesSearch && matchesModule && matchesAction && matchesStatus;
  });

  const modules = ['all', ...Array.from(new Set(auditLogs.map(log => log.module)))];
  const actions = ['all', ...Array.from(new Set(auditLogs.map(log => log.action)))];

  const handleExport = () => {
    toast.success('Exporting audit log...');
    setTimeout(() => {
      toast.success('Audit log exported successfully!');
    }, 1500);
  };

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
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Label>Search</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user, action, or details..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Module</Label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module} value={module}>
                        {module === 'all' ? 'All Modules' : module}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Action</Label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action === 'all' ? 'All Actions' : action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Success">Success</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Date From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Date To</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Logs</p>
              <p className="text-3xl font-bold mt-2">{filteredLogs.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Successful Actions</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {filteredLogs.filter(l => l.status === 'Success').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Failed Actions</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {filteredLogs.filter(l => l.status === 'Failed').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Unique Users</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {new Set(filteredLogs.map(l => l.userId)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Detailed audit trail of all system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold">Timestamp</th>
                    <th className="text-left p-3 font-semibold">User</th>
                    <th className="text-left p-3 font-semibold">Action</th>
                    <th className="text-left p-3 font-semibold">Module</th>
                    <th className="text-left p-3 font-semibold">Details</th>
                    <th className="text-left p-3 font-semibold">IP Address</th>
                    <th className="text-center p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="p-3 text-muted-foreground">{log.timestamp}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {log.userName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{log.userName}</p>
                            <p className="text-xs text-muted-foreground">{log.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="font-medium">{log.action}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{log.module}</td>
                      <td className="p-3">
                        <div>
                          <p className="text-foreground">{log.details}</p>
                          {log.changes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">Changes: {log.changes}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground font-mono text-xs">{log.ipAddress}</td>
                      <td className="p-3 text-center">
                        <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredLogs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No audit logs found matching your filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
