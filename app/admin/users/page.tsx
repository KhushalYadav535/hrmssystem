'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Search, UserPlus, Save, X, Key, UserCheck, UserX, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatDesignationLabel } from '@/lib/utils';

interface User {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  role: string;
  roles?: string[];
  payrollSubRole?: 'Maker' | 'Checker' | null;
  designation?: string;
  department?: string;
  status: string;
  joinDate?: string;
}

const ALL_ROLE_OPTIONS = [
  'Super Admin',
  'Tenant Admin',
  'HR Administrator',
  'Payroll Administrator',
  'Finance Administrator',
  'Manager',
  'Employee',
  'Auditor',
] as const;

function userEffectiveRoles(u: User): string[] {
  const fromArr = u.roles && Array.isArray(u.roles) && u.roles.length ? [...u.roles] : [];
  const primary = u.role;
  const merged = [...fromArr];
  if (primary && !merged.includes(primary)) merged.push(primary);
  return merged.length ? [...new Set(merged)] : primary ? [primary] : [];
}

/** Roles provisioned at platform level — Tenant Admin cannot change or reset these accounts. */
const PLATFORM_MANAGED_ROLES = ['Super Admin', 'Platform Admin'] as const;

function isPlatformManagedRole(role: string | undefined) {
  return !!role && PLATFORM_MANAGED_ROLES.includes(role as 'Super Admin' | 'Platform Admin');
}

function userHasPlatformManagedRole(user: User) {
  return userEffectiveRoles(user).some((r) => isPlatformManagedRole(r));
}

export default function UsersPage() {
  const { isAuthenticated, hasPermission, hasRole, currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTenantAdmin = hasRole('Tenant Admin');

  const tenantAdminMayManage = (user: User) => !isTenantAdmin || !userHasPlatformManagedRole(user);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    payrollSubRole: '' as '' | 'Maker' | 'Checker',
    designation: '',
    department: '',
    status: 'active',
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  // After creating a user/employee, redirect includes ?refresh=1 so list reloads even when session was already active.
  useEffect(() => {
    if (!isAuthenticated || searchParams.get('refresh') !== '1') return;
    loadUsers();
    router.replace('/admin/users', { scroll: false });
  }, [isAuthenticated, searchParams, router]);

  // Refresh data when page comes into focus (e.g., after navigation)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        loadUsers();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUsers({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });
      
      if (response.success && response.data) {
        const userList = Array.isArray(response.data) ? response.data : [];
        setUsers(userList);
      }
    } catch (error: any) {
      toast.error('Failed to load users');
      console.error('Load users error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  if (!isAuthenticated || !hasPermission('manage_users')) {
    redirect('/dashboard');
  }

  const handleEdit = (user: User) => {
    if (!tenantAdminMayManage(user)) {
      toast.error('Platform-managed roles cannot be edited from Tenant Admin. Contact Platform Admin.');
      return;
    }
    setEditingUser(user);
    const eff = userEffectiveRoles(user);
    setSelectedRoles(eff.length ? eff : user.role ? [user.role] : []);
    setUserFormData({
      name: user.name || '',
      email: user.email || '',
      payrollSubRole:
        userEffectiveRoles(user).includes('Payroll Administrator') &&
        (user.payrollSubRole === 'Maker' || user.payrollSubRole === 'Checker')
          ? user.payrollSubRole
          : '',
      designation: formatDesignationLabel(user.designation) || (typeof user.designation === 'string' ? user.designation : ''),
      department: user.department || '',
      status: user.status === 'active' || user.status === 'Active' ? 'active' : 'inactive',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      const userId = editingUser._id || editingUser.id;
      if (!userId) {
        toast.error('User ID not found');
        return;
      }

      if (selectedRoles.length === 0) {
        toast.error('Select at least one role');
        return;
      }
      const payload = {
        name: userFormData.name,
        designation: userFormData.designation,
        department: userFormData.department,
        status: userFormData.status === 'active' ? 'Active' : 'Inactive',
        roles: selectedRoles,
        payrollSubRole: selectedRoles.includes('Payroll Administrator')
          ? userFormData.payrollSubRole || null
          : null,
      };
      const response = await apiService.updateUser(userId.toString(), payload);
      if (response.success) {
        toast.success('User updated successfully');
        setIsEditDialogOpen(false);
        setEditingUser(null);
        loadUsers();
      } else {
        toast.error(response.message || 'Failed to update user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const userId = id.toString();
        const response = await apiService.deleteUser(userId);
        if (response.success) {
          toast.success('User deleted successfully');
          loadUsers();
        } else {
          toast.error(response.message || 'Failed to delete user');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete user');
      }
    }
  };

  const handleResetPassword = async (userId: string) => {
    const target = users.find((u) => String(u._id || u.id) === String(userId));
    if (target && !tenantAdminMayManage(target)) {
      toast.error('You cannot reset passwords for platform-managed roles.');
      return;
    }
    if (!confirm('Send a new temporary password to this user (and show it here if the API returns it)?')) return;
    try {
      setIsActionLoading(userId);
      const response = await apiService.resetUserPassword(userId);
      if (response.success) {
        const data = response.data as { tempPassword?: string } | undefined;
        const temp = data && typeof data === 'object' && 'tempPassword' in data ? data.tempPassword : undefined;
        if (temp && typeof temp === 'string') {
          toast.success(`Password reset. Temporary password: ${temp}`, { duration: 20_000 });
        } else {
          toast.success(response.message || 'Password reset successfully');
        }
        loadUsers();
      } else {
        toast.error(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleActivate = async (userId: string) => {
    const target = users.find((u) => String(u._id || u.id) === String(userId));
    if (target && !tenantAdminMayManage(target)) {
      toast.error('You cannot change status for platform-managed roles.');
      return;
    }
    try {
      setIsActionLoading(userId);
      const response = await apiService.activateUser(userId);
      if (response.success) {
        toast.success(response.message || 'User activated');
        loadUsers();
      } else {
        toast.error(response.message || 'Failed to activate user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate user');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleDeactivate = async (userId: string) => {
    const target = users.find((u) => String(u._id || u.id) === String(userId));
    if (target && !tenantAdminMayManage(target)) {
      toast.error('You cannot change status for platform-managed roles.');
      return;
    }
    const reason = typeof window !== 'undefined' ? window.prompt('Reason for deactivation (optional):') : null;
    try {
      setIsActionLoading(userId);
      const response = await apiService.deactivateUser(userId, reason || undefined);
      if (response.success) {
        toast.success(response.message || 'User deactivated');
        loadUsers();
      } else {
        toast.error(response.message || 'Failed to deactivate user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to deactivate user');
    } finally {
      setIsActionLoading(null);
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
      'Auditor': 'bg-slate-100 text-slate-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (user.name && typeof user.name === 'string' && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && typeof user.email === 'string' && user.email.toLowerCase().includes(searchLower)) ||
      (formatDesignationLabel(user.designation).toLowerCase().includes(searchLower));
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-2">Manage system users and their access</p>
          </div>
          <Link href="/admin/users/create">
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Create User
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {!isTenantAdmin && <SelectItem value="Super Admin">Super Admin</SelectItem>}
                  <SelectItem value="Tenant Admin">Tenant Admin</SelectItem>
                  <SelectItem value="HR Administrator">HR Administrator</SelectItem>
                  <SelectItem value="Payroll Administrator">Payroll Administrator</SelectItem>
                  <SelectItem value="Finance Administrator">Finance Administrator</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>All system users with login access</CardDescription>
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
                  const mayManage = tenantAdminMayManage(user);
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
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-lg">{user.name || 'Unknown User'}</h3>
                            {userEffectiveRoles(user).map((r) => (
                              <Badge key={r} className={getRoleBadgeColor(r)}>
                                {r}
                                {r === 'Payroll Administrator' &&
                                  (user.payrollSubRole === 'Maker' || user.payrollSubRole === 'Checker') && (
                                    <span className="ml-1 opacity-90">({user.payrollSubRole})</span>
                                  )}
                              </Badge>
                            ))}
                            {user.status && (
                            <Badge
                              variant={user.status === 'active' || user.status === 'Active' ? 'default' : 'secondary'}
                              className={
                                user.status === 'active' || user.status === 'Active'
                                  ? 'bg-green-600'
                                  : user.status === 'inactive' || user.status === 'Inactive'
                                  ? 'bg-red-600'
                                  : ''
                              }
                            >
                              {user.status === 'active' ? 'Active' : user.status === 'inactive' ? 'Inactive' : user.status}
                            </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {user.email && <span>{user.email}</span>}
                            {formatDesignationLabel(user.designation) && (
                              <>
                                {user.email && <span>•</span>}
                                <span>{formatDesignationLabel(user.designation)}</span>
                              </>
                            )}
                            {user.department && (
                              <>
                                {(user.email || formatDesignationLabel(user.designation)) && <span>•</span>}
                                <span>{user.department}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => handleEdit(user)}
                          disabled={!mayManage}
                          title={!mayManage ? 'Platform-managed role' : undefined}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleResetPassword(userId)}
                          disabled={isActionLoading === userId || !mayManage}
                          title={!mayManage ? 'Platform-managed role' : 'Reset Password'}
                        >
                          {isActionLoading === userId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Key className="w-4 h-4" />
                          )}
                        </Button>
                        {(user.status === 'inactive' || user.status === 'Inactive' || user.status === 'Deactivated') ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 text-green-600 hover:text-green-700"
                            onClick={() => handleActivate(userId)}
                            disabled={isActionLoading === userId || !mayManage}
                            title={!mayManage ? 'Platform-managed role' : 'Activate User'}
                          >
                            {isActionLoading === userId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 text-orange-600 hover:text-orange-700"
                            onClick={() => handleDeactivate(userId)}
                            disabled={isActionLoading === userId || !mayManage}
                            title={!mayManage ? 'Platform-managed role' : 'Deactivate User'}
                          >
                            {isActionLoading === userId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleDelete(userId)}
                          disabled={!mayManage}
                          title={!mayManage ? 'Platform-managed role' : undefined}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and access permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="Enter user name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="Enter email address"
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label>Roles</Label>
                <p className="text-xs text-muted-foreground">User can hold multiple roles; permissions are combined.</p>
                <div className="rounded-lg border border-border divide-y max-h-48 overflow-y-auto">
                  {ALL_ROLE_OPTIONS.filter((r) => !isTenantAdmin || r !== 'Super Admin').map((r) => (
                    <div key={r} className="flex items-center gap-3 px-3 py-2">
                      <Checkbox
                        id={`edit-role-${r}`}
                        checked={selectedRoles.includes(r)}
                        onCheckedChange={(v) => {
                          const on = v === true;
                          if (!on && selectedRoles.length <= 1) {
                            toast.error('At least one role is required');
                            return;
                          }
                          setSelectedRoles((prev) =>
                            on
                              ? prev.includes(r)
                                ? prev
                                : [...prev, r]
                              : prev.filter((x) => x !== r)
                          );
                        }}
                      />
                      <label htmlFor={`edit-role-${r}`} className="text-sm cursor-pointer flex-1">
                        {r}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {selectedRoles.includes('Payroll Administrator') && (
                <div className="space-y-2">
                  <Label htmlFor="edit-payroll-subrole">Payroll Type (BRD Maker-Checker)</Label>
                  <Select
                    value={userFormData.payrollSubRole || 'select'}
                    onValueChange={(value) => setUserFormData({ ...userFormData, payrollSubRole: value === 'Maker' || value === 'Checker' ? value : '' })}
                  >
                    <SelectTrigger id="edit-payroll-subrole">
                      <SelectValue placeholder="Select Maker or Checker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select...</SelectItem>
                      <SelectItem value="Maker">Maker (Create/Edit Payroll)</SelectItem>
                      <SelectItem value="Checker">Checker (Approve/Reject Only)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Maker: processes payroll. Checker: reviews and approves only.</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-designation">Designation</Label>
                <Input
                  id="edit-designation"
                  value={userFormData.designation}
                  onChange={(e) => setUserFormData({ ...userFormData, designation: e.target.value })}
                  placeholder="Enter designation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={userFormData.department}
                  onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                  placeholder="Enter department"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={userFormData.status}
                  onValueChange={(value) => setUserFormData({ ...userFormData, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingUser(null);
                }}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button onClick={handleUpdate} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
