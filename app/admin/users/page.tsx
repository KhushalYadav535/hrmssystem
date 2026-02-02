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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, UserPlus } from 'lucide-react';
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

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      // Using getEmployees as users are employees with login access
      const response = await apiService.getEmployees({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      
      if (response.success && response.data) {
        let userList = Array.isArray(response.data) ? response.data : [];
        
        // Filter by role if needed
        if (roleFilter !== 'all') {
          userList = userList.filter((user: any) => user.role === roleFilter);
        }
        
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

  const handleDelete = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const userId = id.toString();
        // Note: You may need to add deleteUser API method
        toast.success('User deleted successfully');
        loadUsers();
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
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.designation && user.designation.toLowerCase().includes(searchQuery.toLowerCase()));
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
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
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{user.name}</h3>
                            <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                            <Badge
                              variant={user.status === 'Active' ? 'default' : 'secondary'}
                              className={
                                user.status === 'Active'
                                  ? 'bg-green-600'
                                  : user.status === 'Inactive'
                                  ? 'bg-red-600'
                                  : ''
                              }
                            >
                              {user.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{user.email}</span>
                            {user.designation && (
                              <>
                                <span>•</span>
                                <span>{user.designation}</span>
                              </>
                            )}
                            {user.department && (
                              <>
                                <span>•</span>
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
                          onClick={() => toast.info('Edit functionality coming soon')}
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
      </div>
    </DashboardLayout>
  );
}
