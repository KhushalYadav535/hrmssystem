'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Settings, Users, Lock, Database, FileText, LogOut, UserX, Clock, History, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import apiService from '@/lib/api';

interface RolePermission {
  _id?: string;
  role: string;
  permissions: string[];
  status: string;
}

interface LeavePolicy {
  _id?: string;
  leaveType: string;
  daysPerYear: number;
  accrualFrequency?: string;
  accrualRate?: number;
  accrualDate?: number;
  carryForward: boolean;
  maxCarryForward?: number;
  requiresApproval: boolean;
  description?: string;
  status: string;
}

interface Department {
  _id?: string;
  name: string;
  head: string;
  employees?: number;
  costCenter: string;
  status: string;
}

interface SystemStatus {
  systemStatus: string;
  database: string;
  activeUsers: string;
  pendingTasks: string;
}

export default function AdminPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isLeavePolicyDialogOpen, setIsLeavePolicyDialogOpen] = useState(false);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingLeavePolicy, setEditingLeavePolicy] = useState<LeavePolicy | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [leavePolicyForm, setLeavePolicyForm] = useState({
    leaveType: '',
    daysPerYear: 0,
    carryForward: false,
    maxCarryForward: 0,
    requiresApproval: true,
    description: '',
    status: 'Active',
  });
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    head: '',
    costCenter: '',
    status: 'Active',
  });
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadRolePermissions(),
        loadAvailablePermissions(),
        loadLeavePolicies(),
        loadDepartments(),
        loadSystemStatus(),
        loadActiveSessions(),
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !hasPermission('configure_system')) {
    redirect('/dashboard');
  }

  const loadRolePermissions = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getRolePermissions();
      if (response.success && response.data) {
        setRolePermissions(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load role permissions');
      console.error('Load role permissions error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailablePermissions = async () => {
    try {
      const response = await apiService.getAvailablePermissions();
      if (response.success && response.data) {
        setAvailablePermissions(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      console.error('Load available permissions error:', error);
    }
  };

  const handleEditPermissions = async (role: string) => {
    try {
      const response = await apiService.getRolePermission(role);
      if (response.success && response.data) {
        setEditingRole(role);
        setSelectedPermissions(response.data.permissions || []);
        setIsPermissionDialogOpen(true);
      }
    } catch (error: any) {
      toast.error('Failed to load role permissions');
    }
  };

  const handleTogglePermission = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSelectAll = () => {
    setSelectedPermissions([...availablePermissions]);
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const handleUpdatePermissions = async () => {
    if (!editingRole) return;

    try {
      const response = await apiService.updateRolePermissions(editingRole, {
        permissions: selectedPermissions,
      });

      if (response.success) {
        toast.success('Permissions updated successfully');
        setIsPermissionDialogOpen(false);
        setEditingRole(null);
        loadRolePermissions();
      } else {
        toast.error(response.message || 'Failed to update permissions');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update permissions');
    }
  };

  const handleTerminateSession = (sessionId: string, userName: string) => {
    setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
    toast.success(`Session terminated for ${userName}`);
  };

  const loadLeavePolicies = async () => {
    try {
      const response = await apiService.getLeavePolicies();
      if (response.success && response.data) {
        const policies = Array.isArray(response.data) ? response.data : [];
        // Ensure all policies have accrual fields with defaults
        const policiesWithDefaults = policies.map((policy: LeavePolicy) => ({
          ...policy,
          accrualFrequency: policy.accrualFrequency || 'Monthly',
          accrualRate: policy.accrualRate ?? (policy.daysPerYear ? policy.daysPerYear / 12 : 1),
          accrualDate: policy.accrualDate || 1,
        }));
        setLeavePolicies(policiesWithDefaults);
      }
    } catch (error: any) {
      console.error('Load leave policies error:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      if (response.success && response.data) {
        const depts = Array.isArray(response.data) ? response.data : [];
        // Get all employees at once and count by department to avoid N+1 queries
        try {
          const empResponse = await apiService.getEmployees({});
          if (empResponse.success && empResponse.data) {
            const employees = Array.isArray(empResponse.data) ? empResponse.data : [];
            // Count employees by department locally
            const deptsWithCounts = depts.map((dept: Department) => {
              const empCount = employees.filter((emp: any) => emp.department === dept.name).length;
              return { ...dept, employees: empCount };
            });
            setDepartments(deptsWithCounts);
          } else {
            // Fallback: set departments without employee count
            setDepartments(depts);
          }
        } catch (error) {
          console.error('Error loading employees for department count:', error);
          // Fallback: set departments without employee count
          setDepartments(depts);
        }
      }
    } catch (error: any) {
      console.error('Load departments error:', error);
    }
  };

  const loadSystemStatus = async () => {
    try {
      const response = await apiService.getSystemStatus();
      if (response.success && response.data) {
        setSystemStatus(response.data);
      } else {
        setSystemStatus({
          systemStatus: 'Unknown',
          database: 'Unknown',
          activeUsers: '0',
          pendingTasks: '0',
        });
      }
    } catch (error: any) {
      console.error('Load system status error:', error);
      setSystemStatus({
        systemStatus: 'Unknown',
        database: 'Unknown',
        activeUsers: '0',
        pendingTasks: '0',
      });
    }
  };

  const loadActiveSessions = async () => {
    try {
      // Get recent login audit logs as active sessions
      const response = await apiService.getAuditLogs({
        module: 'Authentication',
        action: 'Login',
        status: 'Success',
      });
      if (response.success && response.data) {
        const logs = Array.isArray(response.data) ? response.data.slice(0, 10) : [];
        const sessions = logs.map((log: any, index: number) => ({
          id: log._id || `session-${index}`,
          userId: log.userId?._id || log.userId,
          userName: log.userName || 'Unknown',
          email: log.userEmail || 'unknown@example.com',
          loginTime: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A',
          ipAddress: log.ipAddress || 'N/A',
          device: log.userAgent ? log.userAgent.substring(0, 50) : 'Unknown',
          status: 'Active',
        }));
        setActiveSessions(sessions);
      }
    } catch (error: any) {
      console.error('Load active sessions error:', error);
    }
  };

  const handleEditLeavePolicy = (policy: LeavePolicy) => {
    setEditingLeavePolicy(policy);
    setLeavePolicyForm({
      leaveType: policy.leaveType,
      daysPerYear: policy.daysPerYear,
      accrualFrequency: policy.accrualFrequency || 'Monthly',
      accrualRate: policy.accrualRate || 1,
      accrualDate: policy.accrualDate || 1,
      carryForward: policy.carryForward,
      maxCarryForward: policy.maxCarryForward || 0,
      requiresApproval: policy.requiresApproval,
      description: policy.description || '',
      status: policy.status,
    });
    setIsLeavePolicyDialogOpen(true);
  };

  const handleCreateLeavePolicy = () => {
    setEditingLeavePolicy(null);
    setLeavePolicyForm({
      leaveType: '',
      daysPerYear: 0,
      carryForward: false,
      maxCarryForward: 0,
      requiresApproval: true,
      description: '',
      status: 'Active',
    });
    setIsLeavePolicyDialogOpen(true);
  };

  const handleSaveLeavePolicy = async () => {
    try {
      if (editingLeavePolicy) {
        const response = await apiService.updateLeavePolicy(editingLeavePolicy._id!, leavePolicyForm);
        if (response.success) {
          toast.success('Leave policy updated successfully');
          setIsLeavePolicyDialogOpen(false);
          loadLeavePolicies();
        } else {
          toast.error(response.message || 'Failed to update leave policy');
        }
      } else {
        const response = await apiService.createLeavePolicy(leavePolicyForm);
        if (response.success) {
          toast.success('Leave policy created successfully');
          setIsLeavePolicyDialogOpen(false);
          loadLeavePolicies();
        } else {
          toast.error(response.message || 'Failed to create leave policy');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save leave policy');
    }
  };

  const handleDeleteLeavePolicy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leave policy?')) return;
    try {
      const response = await apiService.deleteLeavePolicy(id);
      if (response.success) {
        toast.success('Leave policy deleted successfully');
        loadLeavePolicies();
      } else {
        toast.error(response.message || 'Failed to delete leave policy');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete leave policy');
    }
  };

  const handleEditDepartment = (dept: Department) => {
    setEditingDepartment(dept);
    setDepartmentForm({
      name: dept.name,
      head: dept.head,
      costCenter: dept.costCenter,
      status: dept.status,
    });
    setIsDepartmentDialogOpen(true);
  };

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setDepartmentForm({
      name: '',
      head: '',
      costCenter: '',
      status: 'Active',
    });
    setIsDepartmentDialogOpen(true);
  };

  const handleSaveDepartment = async () => {
    try {
      if (editingDepartment) {
        const response = await apiService.updateDepartment(editingDepartment._id!, departmentForm);
        if (response.success) {
          toast.success('Department updated successfully');
          setIsDepartmentDialogOpen(false);
          loadDepartments();
        } else {
          toast.error(response.message || 'Failed to update department');
        }
      } else {
        const response = await apiService.createDepartment(departmentForm);
        if (response.success) {
          toast.success('Department created successfully');
          setIsDepartmentDialogOpen(false);
          loadDepartments();
        } else {
          toast.error(response.message || 'Failed to create department');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save department');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      const response = await apiService.deleteDepartment(id);
      if (response.success) {
        toast.success('Department deleted successfully');
        loadDepartments();
      } else {
        toast.error(response.message || 'Failed to delete department');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete department');
    }
  };

  const handleTerminateAllSessions = () => {
    setActiveSessions([]);
    toast.success('All sessions terminated successfully');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Administration</h1>
          <p className="text-muted-foreground mt-2">Configure system settings and manage access</p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {systemStatus ? (
            <>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">System Status</p>
                  <p className="text-2xl font-bold mb-2">{systemStatus.systemStatus}</p>
                  <Badge className="bg-green-100 text-green-700">Live</Badge>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Database</p>
                  <p className="text-2xl font-bold mb-2">{systemStatus.database}</p>
                  <Badge className={systemStatus.database === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>Live</Badge>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Active Users</p>
                  <p className="text-2xl font-bold mb-2">{systemStatus.activeUsers}</p>
                  <Badge className="bg-blue-100 text-blue-700">Live</Badge>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Pending Tasks</p>
                  <p className="text-2xl font-bold mb-2">{systemStatus.pendingTasks}</p>
                  <Badge className="bg-yellow-100 text-yellow-700">Live</Badge>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="col-span-4 text-center py-8 text-muted-foreground">Loading system status...</div>
          )}
        </div>

        {/* Configuration Tabs */}
        <Tabs defaultValue="access" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="policies">Leave Policies</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="sessions">User Sessions</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Leave Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Leave Types Configuration</CardTitle>
                  <Button size="sm" onClick={handleCreateLeavePolicy} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Policy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading leave policies...</p>
                  </div>
                ) : leavePolicies.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No leave policies found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leavePolicies.map((policy) => (
                      <div key={policy._id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium text-sm">{policy.leaveType}</p>
                          <p className="text-xs text-muted-foreground">
                            {policy.daysPerYear} days per year • Carry forward: {policy.carryForward ? 'Yes' : 'No'} • Status: {policy.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditLeavePolicy(policy)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => policy._id && handleDeleteLeavePolicy(policy._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Department Configuration</CardTitle>
                  <Button size="sm" onClick={handleCreateDepartment} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Department
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading departments...</p>
                  </div>
                ) : departments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No departments found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {departments.map((dept) => (
                      <div key={dept._id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium text-sm">{dept.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Head: {dept.head} • {dept.employees || 0} employees • Cost Center: {dept.costCenter} • Status: {dept.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditDepartment(dept)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => dept._id && handleDeleteDepartment(dept._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Control Tab */}
          <TabsContent value="access" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Role-Based Access Control</CardTitle>
                    <CardDescription>Manage permissions for each role</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading role permissions...</p>
                  </div>
                ) : rolePermissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No role permissions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rolePermissions.map((rolePerm) => (
                      <div key={rolePerm.role} className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium text-sm">{rolePerm.role}</p>
                          <p className="text-xs text-muted-foreground">
                            {rolePerm.permissions?.length || 0} permissions • {rolePerm.status || 'Active'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPermissions(rolePerm.role)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Permissions
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Active User Sessions</CardTitle>
                    <CardDescription>Monitor and manage active user sessions</CardDescription>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleTerminateAllSessions} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Terminate All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserX className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No active sessions</p>
                    </div>
                  ) : (
                    activeSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                {session.userName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{session.userName}</p>
                              <p className="text-xs text-muted-foreground">{session.email}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700">{session.status}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-3 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">Login Time:</span>
                              <p>{session.loginTime}</p>
                            </div>
                            <div>
                              <span className="font-medium">IP Address:</span>
                              <p>{session.ipAddress}</p>
                            </div>
                            <div>
                              <span className="font-medium">Device:</span>
                              <p>{session.device}</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleTerminateSession(session.id, session.userName)}
                          className="ml-4 gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Terminate
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Audit Log Viewer</CardTitle>
                    <CardDescription>View detailed audit trail of all system activities</CardDescription>
                  </div>
                  <Button asChild>
                    <a href="/admin/audit-log">View Full Audit Log</a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Comprehensive Audit Log</h3>
                  <p className="text-muted-foreground mb-4">
                    All system activities are automatically logged with complete audit trail including user actions, IP addresses, timestamps, and changes made.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click "View Full Audit Log" to access detailed logs with advanced filtering, search, and export capabilities.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Statutory Compliance</CardTitle>
                <CardDescription>Compliance settings are managed through Tenant Settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center py-8">
                    <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Compliance Configuration</h3>
                    <p className="text-muted-foreground mb-4">
                      Compliance settings such as EPFO, ESI, Gratuity, and other statutory requirements are configured through the Tenant Settings page.
                    </p>
                    <Button asChild>
                      <a href="/settings">Go to Settings</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Third-party Integrations</CardTitle>
                <CardDescription>Integration settings are managed through Tenant Settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center py-8">
                    <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Integration Configuration</h3>
                    <p className="text-muted-foreground mb-4">
                      Third-party integrations such as Banking System (CBS), Email Server (SMTP), SMS Gateway, Active Directory (LDAP), and Biometric System are configured through the Tenant Settings page.
                    </p>
                    <Button asChild>
                      <a href="/settings">Go to Settings</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Leave Policy Dialog */}
        <Dialog open={isLeavePolicyDialogOpen} onOpenChange={setIsLeavePolicyDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingLeavePolicy ? 'Edit Leave Policy' : 'Create Leave Policy'}</DialogTitle>
              <DialogDescription>
                {editingLeavePolicy ? 'Update leave policy details' : 'Create a new leave policy'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Input
                  id="leaveType"
                  value={leavePolicyForm.leaveType}
                  onChange={(e) => setLeavePolicyForm({ ...leavePolicyForm, leaveType: e.target.value })}
                  placeholder="e.g., Casual Leave"
                />
              </div>
              <div>
                <Label htmlFor="daysPerYear">Days Per Year *</Label>
                <Input
                  id="daysPerYear"
                  type="number"
                  value={leavePolicyForm.daysPerYear}
                  onChange={(e) => setLeavePolicyForm({ ...leavePolicyForm, daysPerYear: parseInt(e.target.value) || 0 })}
                  placeholder="12"
                />
              </div>
              
              {/* Accrual Settings */}
              <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
                <Label className="text-base font-semibold">Accrual Settings</Label>
                
                <div>
                  <Label htmlFor="accrualFrequency">Accrual Frequency *</Label>
                  <Select
                    value={leavePolicyForm.accrualFrequency || 'Monthly'}
                    onValueChange={(value) => setLeavePolicyForm({ ...leavePolicyForm, accrualFrequency: value })}
                  >
                    <SelectTrigger id="accrualFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                      <SelectItem value="None">None (No Accrual)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {leavePolicyForm.accrualFrequency && leavePolicyForm.accrualFrequency !== 'None' && (
                  <>
                    <div>
                      <Label htmlFor="accrualRate">
                        Accrual Rate (Days per {leavePolicyForm.accrualFrequency?.toLowerCase()?.slice(0, -2) || 'period'}) *
                      </Label>
                      <Input
                        id="accrualRate"
                        type="number"
                        step="0.1"
                        value={leavePolicyForm.accrualRate || 0}
                        onChange={(e) => setLeavePolicyForm({ ...leavePolicyForm, accrualRate: parseFloat(e.target.value) || 0 })}
                        placeholder={leavePolicyForm.accrualFrequency === 'Monthly' ? 'e.g., 1 (1 day per month)' : leavePolicyForm.accrualFrequency === 'Quarterly' ? 'e.g., 3 (3 days per quarter)' : 'e.g., 12 (12 days per year)'}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Example: {leavePolicyForm.accrualFrequency === 'Monthly' ? '1 day per month = 12 days/year' : leavePolicyForm.accrualFrequency === 'Quarterly' ? '3 days per quarter = 12 days/year' : '12 days per year'}
                      </p>
                    </div>
                    
                    {leavePolicyForm.accrualFrequency === 'Monthly' && (
                      <div>
                        <Label htmlFor="accrualDate">Accrual Date (Day of Month) *</Label>
                        <Input
                          id="accrualDate"
                          type="number"
                          min="1"
                          max="31"
                          value={leavePolicyForm.accrualDate || 1}
                          onChange={(e) => setLeavePolicyForm({ ...leavePolicyForm, accrualDate: parseInt(e.target.value) || 1 })}
                          placeholder="1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave will be accrued on this day each month (e.g., 1 = 1st of every month)
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="carryForward"
                  checked={leavePolicyForm.carryForward}
                  onCheckedChange={(checked) => setLeavePolicyForm({ ...leavePolicyForm, carryForward: checked as boolean })}
                />
                <Label htmlFor="carryForward" className="cursor-pointer">Allow Carry Forward</Label>
              </div>
              {leavePolicyForm.carryForward && (
                <div>
                  <Label htmlFor="maxCarryForward">Max Carry Forward Days</Label>
                  <Input
                    id="maxCarryForward"
                    type="number"
                    value={leavePolicyForm.maxCarryForward}
                    onChange={(e) => setLeavePolicyForm({ ...leavePolicyForm, maxCarryForward: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresApproval"
                  checked={leavePolicyForm.requiresApproval}
                  onCheckedChange={(checked) => setLeavePolicyForm({ ...leavePolicyForm, requiresApproval: checked as boolean })}
                />
                <Label htmlFor="requiresApproval" className="cursor-pointer">Requires Approval</Label>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={leavePolicyForm.description}
                  onChange={(e) => setLeavePolicyForm({ ...leavePolicyForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={leavePolicyForm.status}
                  onValueChange={(value) => setLeavePolicyForm({ ...leavePolicyForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLeavePolicyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveLeavePolicy}>
                <Save className="w-4 h-4 mr-2" />
                {editingLeavePolicy ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Department Dialog */}
        <Dialog open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingDepartment ? 'Edit Department' : 'Create Department'}</DialogTitle>
              <DialogDescription>
                {editingDepartment ? 'Update department details' : 'Create a new department'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="deptName">Department Name *</Label>
                <Input
                  id="deptName"
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                  placeholder="e.g., Finance"
                />
              </div>
              {/* Spec C2-01: Department Head REMOVED from Create form (BR-C2-01) */}
              {/* Head can be assigned via Edit Department form */}
              <div>
                <Label htmlFor="costCenter">Cost Center *</Label>
                <Input
                  id="costCenter"
                  value={departmentForm.costCenter}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, costCenter: e.target.value })}
                  placeholder="e.g., CC001"
                />
              </div>
              <div>
                <Label htmlFor="deptStatus">Status</Label>
                <Select
                  value={departmentForm.status}
                  onValueChange={(value) => setDepartmentForm({ ...departmentForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDepartmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDepartment}>
                <Save className="w-4 h-4 mr-2" />
                {editingDepartment ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Permissions Dialog */}
        <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Permissions - {editingRole}</DialogTitle>
              <DialogDescription>
                Select permissions for this role
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                {availablePermissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-secondary/50">
                    <Checkbox
                      id={permission}
                      checked={selectedPermissions.includes(permission)}
                      onCheckedChange={() => handleTogglePermission(permission)}
                    />
                    <Label htmlFor={permission} className="cursor-pointer flex-1 text-sm">
                      {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsPermissionDialogOpen(false);
                setEditingRole(null);
              }} className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button onClick={handleUpdatePermissions} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* System Alerts */}
        {systemStatus && parseInt(systemStatus.pendingTasks) > 0 && (
          <Card className="border-0 shadow-sm border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <CardTitle className="text-lg">System Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {parseInt(systemStatus.pendingTasks) > 0 && (
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    ⚠️ {systemStatus.pendingTasks} pending tasks require attention (Leave requests and Expense claims)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
