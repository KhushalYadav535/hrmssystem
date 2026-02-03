'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search, UserPlus, Save, X } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

interface User {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  role: string;
  designation?: string;
  department?: string;
  status: string;
  joinDate?: string;
}

export default function UsersPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: '',
    designation: '',
    department: '',
    status: 'active',
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

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
    setEditingUser(user);
    setUserFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      designation: user.designation || '',
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

      const response = await apiService.updateUser(userId.toString(), userFormData);
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

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'Super Admin': 'bg-red-100 text-red-700',
      'Tenant Admin': 'bg-purple-100 text-purple-700',
      'HR Administrator': 'bg-blue-100 text-blue-700',
      'Payroll Administrator': 'bg-green-100 text-green-700',
      'Finance Administrator': 'bg-yellow-100 text-yellow-700',
      'Manager': 'bg-indigo-100 text-indigo-700',
      'Employee': 'bg-gray-100 text-gray-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (user.name && typeof user.name === 'string' && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && typeof user.email === 'string' && user.email.toLowerCase().includes(searchLower)) ||
      (user.designation && typeof user.designation === 'string' && user.designation.toLowerCase().includes(searchLower));
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
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                  <SelectItem value="Tenant Admin">Tenant Admin</SelectItem>
                  <SelectItem value="HR Administrator">HR Administrator</SelectItem>
                  <SelectItem value="Payroll Administrator">Payroll Administrator</SelectItem>
                  <SelectItem value="Finance Administrator">Finance Administrator</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
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
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleDelete(userId)}
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
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={userFormData.role}
                  onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Tenant Admin">Tenant Admin</SelectItem>
                    <SelectItem value="HR Administrator">HR Administrator</SelectItem>
                    <SelectItem value="Payroll Administrator">Payroll Administrator</SelectItem>
                    <SelectItem value="Finance Administrator">Finance Administrator</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Auditor">Auditor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
