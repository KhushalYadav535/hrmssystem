'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import apiService from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Department {
  _id?: string;
  id?: string;
  name: string;
  head: string;
  employees: number;
  costCenter: string;
  status: 'Active' | 'Inactive';
  parentDepartment?: string;
}

export default function DepartmentManagementPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    head: '',
    costCenter: '',
    status: 'Active' as 'Active' | 'Inactive',
    parentDepartment: '',
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getDepartments();
      if (response.success && response.data) {
        setDepartments(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !hasPermission('manage_settings')) {
    redirect('/dashboard');
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.head || !formData.costCenter) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      const response = await apiService.createDepartment(formData);
      if (response.success) {
        toast.success('Department created successfully!');
        setIsOpen(false);
        setFormData({ name: '', head: '', costCenter: '', status: 'Active', parentDepartment: '' });
        loadDepartments();
      } else {
        toast.error(response.message || 'Failed to create department');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create department');
    }
  };

  const handleEdit = (dept: Department) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      head: dept.head,
      costCenter: dept.costCenter,
      status: dept.status,
      parentDepartment: dept.parentDepartment || '',
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedDept || !formData.name || !formData.head || !formData.costCenter) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      const deptId = selectedDept._id || selectedDept.id;
      if (!deptId) return;
      
      const response = await apiService.updateDepartment(deptId.toString(), formData);
      if (response.success) {
        toast.success('Department updated successfully!');
        setShowEditDialog(false);
        setSelectedDept(null);
        loadDepartments();
      } else {
        toast.error(response.message || 'Failed to update department');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update department');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        const response = await apiService.deleteDepartment(id.toString());
        if (response.success) {
          toast.success('Department deleted successfully!');
          loadDepartments();
        } else {
          toast.error(response.message || 'Failed to delete department');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete department');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Department Management</h1>
            <p className="text-muted-foreground mt-2">Create and manage organizational departments</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Department</DialogTitle>
                <DialogDescription>Add a new department to the organization</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Department Name *</Label>
                  <Input
                    placeholder="e.g., Sales"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department Head *</Label>
                  <Input
                    placeholder="Enter head name"
                    value={formData.head}
                    onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cost Center *</Label>
                  <Input
                    placeholder="e.g., CC005"
                    value={formData.costCenter}
                    onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Parent Department (Optional)</Label>
                  <Select value={formData.parentDepartment || "none"} onValueChange={(value) => setFormData({ ...formData, parentDepartment: value === "none" ? "" : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {departments.map((d) => {
                        const deptId = d._id || d.id || '';
                        return (
                          <SelectItem key={deptId} value={d.name}>{d.name}</SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full">Create Department</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{departments.reduce((sum, d) => sum + d.employees, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Employees/Dept</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(departments.reduce((sum, d) => sum + d.employees, 0) / departments.length)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{departments.filter(d => d.status === 'Active').length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.id} className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{dept.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Head: {dept.head}</Badge>
                        <Badge variant="outline">{dept.costCenter}</Badge>
                        <Badge className="bg-green-600">{dept.status}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{dept.employees}</p>
                      <p className="text-xs text-muted-foreground">employees</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2 bg-transparent" onClick={() => handleEdit(dept)}>
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-2" onClick={() => handleDelete(dept.id)}>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>Update department information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Department Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Department Head *</Label>
                <Input
                  value={formData.head}
                  onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cost Center *</Label>
                <Input
                  value={formData.costCenter}
                  onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Parent Department (Optional)</Label>
                <Select value={formData.parentDepartment || "none"} onValueChange={(value) => setFormData({ ...formData, parentDepartment: value === "none" ? "" : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent department" />
                  </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {departments.filter(d => {
                        const dId = d._id || d.id || '';
                        const selectedId = selectedDept?._id || selectedDept?.id || '';
                        return dId !== selectedId;
                      }).map((d) => {
                        const deptId = d._id || d.id || '';
                        return (
                          <SelectItem key={deptId} value={d.name}>{d.name}</SelectItem>
                        );
                      })}
                    </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdate} className="w-full">Update Department</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
