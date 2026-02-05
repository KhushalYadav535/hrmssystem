'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Search, Users, Shield, Settings, CheckCircle2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

interface RolePermission {
  _id?: string;
  role: string;
  permissions: string[];
  status: string;
}

interface User {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  role: string;
  designation?: string;
  department?: string;
}

export default function RolePermissionsPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isRoleAssignmentDialogOpen, setIsRoleAssignmentDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [rolesResponse, permissionsResponse, usersResponse] = await Promise.all([
        apiService.getRolePermissions(),
        apiService.getAvailablePermissions(),
        apiService.getUsers({})
      ]);

      if (rolesResponse.success && rolesResponse.data) {
        setRolePermissions(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
      }

      if (permissionsResponse.success && permissionsResponse.data) {
        setAvailablePermissions(Array.isArray(permissionsResponse.data) ? permissionsResponse.data : []);
      }

      if (usersResponse.success && usersResponse.data) {
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load data');
      console.error('Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || (!hasPermission('manage_roles') && currentUser?.role !== 'Tenant Admin')) {
    redirect('/dashboard');
  }

  const handleEditPermissions = (role: string) => {
    const rolePerm = rolePermissions.find(rp => rp.role === role);
    if (rolePerm) {
      setSelectedRole(role);
      setEditingPermissions([...rolePerm.permissions]);
      setIsPermissionDialogOpen(true);
    }
  };

  const handleSavePermissions = async () => {
    try {
      const response = await apiService.updateRolePermissions(selectedRole, editingPermissions);
      if (response.success) {
        toast.success(`Permissions updated for ${selectedRole}`);
        setIsPermissionDialogOpen(false);
        loadData();
      } else {
        toast.error(response.message || 'Failed to update permissions');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update permissions');
    }
  };

  const handleAssignRole = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role || '');
    setIsRoleAssignmentDialogOpen(true);
  };

  const handleSaveRoleAssignment = async () => {
    if (!selectedUser) return;

    try {
      const userId = selectedUser._id || selectedUser.id;
      const response = await apiService.updateUser(userId!.toString(), { role: newRole });
      if (response.success) {
        toast.success(`Role updated for ${selectedUser.name}`);
        setIsRoleAssignmentDialogOpen(false);
        setSelectedUser(null);
        loadData();
      } else {
        toast.error(response.message || 'Failed to update role');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const togglePermission = (permission: string) => {
    if (editingPermissions.includes(permission)) {
      setEditingPermissions(editingPermissions.filter(p => p !== permission));
    } else {
      setEditingPermissions([...editingPermissions, permission]);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'Super Admin': 'bg-red-100 text-red-700',
      'Tenant Admin': 'bg-purple-100 text-purple-700',
      'HR Administrator': 'bg-blue-100 text-blue-700',
      'Payroll Administrator': 'bg-green-100 text-green-700',
      'Finance Administrator': 'bg-yellow-100 text-yellow-700',
      'Manager': 'bg-indigo-100 text-indigo-700',
      'Employee': 'bg-gray-100 text-gray-700',
      'Auditor': 'bg-orange-100 text-orange-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.role && user.role.toLowerCase().includes(searchLower))
    );
  });

  const roles = [
    'Super Admin',
    'Tenant Admin',
    'HR Administrator',
    'Payroll Administrator',
    'Finance Administrator',
    'Manager',
    'Employee',
    'Auditor',
  ];

  // Group permissions by category
  const permissionCategories: Record<string, string[]> = {
    'Employee Management': availablePermissions.filter(p => p.includes('employee') || p.includes('onboarding') || p.includes('recruitment')),
    'Payroll & Finance': availablePermissions.filter(p => p.includes('payroll') || p.includes('finance') || p.includes('budget') || p.includes('salary') || p.includes('form')),
    'Leave & Attendance': availablePermissions.filter(p => p.includes('leave') || p.includes('attendance')),
    'Approvals': availablePermissions.filter(p => p.includes('approve')),
    'Reports & Analytics': availablePermissions.filter(p => p.includes('report') || p.includes('view') || p.includes('export')),
    'System Administration': availablePermissions.filter(p => p.includes('manage') || p.includes('configure') || p.includes('system') || p.includes('settings') || p.includes('integration')),
    'User & Role Management': availablePermissions.filter(p => p.includes('user') || p.includes('role') || p.includes('permission')),
    'Other': availablePermissions.filter(p => 
      !p.includes('employee') && !p.includes('payroll') && !p.includes('finance') && 
      !p.includes('leave') && !p.includes('attendance') && !p.includes('approve') && 
      !p.includes('report') && !p.includes('view') && !p.includes('export') &&
      !p.includes('manage') && !p.includes('configure') && !p.includes('system') &&
      !p.includes('user') && !p.includes('role')
    ),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Role & Permission Management</h1>
          <p className="text-muted-foreground mt-2">Manage user roles and permissions for your organization</p>
        </div>

        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="roles">
              <Shield className="w-4 h-4 mr-2" />
              Role Permissions
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Assign Roles to Users
            </TabsTrigger>
          </TabsList>

          {/* Role Permissions Tab */}
          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>Configure permissions for each role in your organization</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading role permissions...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((role) => {
                      const rolePerm = rolePermissions.find(rp => rp.role === role);
                      const permissionCount = rolePerm?.permissions.length || 0;
                      
                      return (
                        <Card key={role} className="border-2 hover:border-primary/50 transition">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <Badge className={getRoleBadgeColor(role)}>{role}</Badge>
                              {rolePerm?.status === 'Active' ? (
                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-muted-foreground">Permissions</p>
                                <p className="text-2xl font-bold">{permissionCount}</p>
                              </div>
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleEditPermissions(role)}
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                Manage Permissions
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assign Roles Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                <CardDescription>Assign roles to users in your organization</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map((user) => {
                      const userId = user._id || user.id || '';
                      return (
                        <div
                          key={userId}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-lg font-bold text-primary">
                                {(user.name || 'U')
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{user.name || 'Unknown User'}</h3>
                                {user.role && (
                                  <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {user.email && <span>{user.email}</span>}
                                {user.designation && (
                                  <>
                                    {user.email && <span>•</span>}
                                    <span>{user.designation}</span>
                                  </>
                                )}
                                {user.department && (
                                  <>
                                    {(user.email || user.designation) && <span>•</span>}
                                    <span>{user.department}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => handleAssignRole(user)}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Change Role
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Permissions Dialog */}
        <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Manage Permissions - {selectedRole}</DialogTitle>
              <DialogDescription>
                Select permissions for this role. Changes will apply to all users with this role.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-4">
              <div className="space-y-6 py-4">
                {Object.entries(permissionCategories).map(([category, perms]) => {
                  if (perms.length === 0) return null;
                  return (
                    <div key={category} className="space-y-3">
                      <h4 className="font-semibold text-sm border-b pb-2">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {perms.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission}
                              checked={editingPermissions.includes(permission)}
                              onCheckedChange={() => togglePermission(permission)}
                            />
                            <Label
                              htmlFor={permission}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePermissions} className="gap-2">
                <Save className="w-4 h-4" />
                Save Permissions ({editingPermissions.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Role Dialog */}
        <Dialog open={isRoleAssignmentDialogOpen} onOpenChange={setIsRoleAssignmentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role</DialogTitle>
              <DialogDescription>
                Change role for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Role</Label>
                <Badge className={getRoleBadgeColor(selectedUser?.role || '')}>
                  {selectedUser?.role || 'No Role'}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-role">New Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger id="new-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This will change the user's role and apply all permissions for the selected role.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRoleAssignmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRoleAssignment} className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Assign Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
