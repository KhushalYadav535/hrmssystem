'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, TrendingUp, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

interface Designation {
  _id?: string;
  id?: string;
  name: string;
  grade?: string;
  level: number;
  employees?: number;
  salaryBand?: string;
  minSalary?: number;
  maxSalary?: number;
  description?: string;
  status: string;
}

export default function DesignationManagementPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    level: 1,
    minSalary: '',
    maxSalary: '',
    description: '',
    status: 'Active',
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadDesignations();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !hasPermission('manage_settings')) {
    redirect('/dashboard');
  }

  const loadDesignations = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getDesignations();
      if (response.success && response.data) {
        setDesignations(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load designations');
      console.error('Load designations error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      grade: '',
      level: 1,
      minSalary: '',
      maxSalary: '',
      description: '',
      status: 'Active',
    });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (designation: Designation) => {
    setEditingDesignation(designation);
    setFormData({
      name: designation.name || '',
      grade: designation.grade || '',
      level: designation.level || 1,
      minSalary: designation.minSalary?.toString() || '',
      maxSalary: designation.maxSalary?.toString() || '',
      description: designation.description || '',
      status: designation.status || 'Active',
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Designation name is required');
      return;
    }

    try {
      const data = {
        name: formData.name.trim(),
        grade: formData.grade.trim() || undefined,
        level: parseInt(formData.level.toString()) || 1,
        minSalary: formData.minSalary ? parseFloat(formData.minSalary.toString()) : 0,
        maxSalary: formData.maxSalary ? parseFloat(formData.maxSalary.toString()) : 0,
        description: formData.description.trim() || undefined,
        status: formData.status,
      };

      const response = await apiService.createDesignation(data);
      if (response.success) {
        toast.success('Designation created successfully');
        setIsCreateDialogOpen(false);
        loadDesignations();
      } else {
        toast.error(response.message || 'Failed to create designation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create designation');
    }
  };

  const handleUpdateSubmit = async () => {
    if (!editingDesignation || !formData.name.trim()) {
      toast.error('Designation name is required');
      return;
    }

    try {
      const designationId = editingDesignation._id || editingDesignation.id;
      if (!designationId) {
        toast.error('Designation ID not found');
        return;
      }

      const data = {
        name: formData.name.trim(),
        grade: formData.grade.trim() || undefined,
        level: parseInt(formData.level.toString()) || 1,
        minSalary: formData.minSalary ? parseFloat(formData.minSalary.toString()) : 0,
        maxSalary: formData.maxSalary ? parseFloat(formData.maxSalary.toString()) : 0,
        description: formData.description.trim() || undefined,
        status: formData.status,
      };

      const response = await apiService.updateDesignation(designationId.toString(), data);
      if (response.success) {
        toast.success('Designation updated successfully');
        setIsEditDialogOpen(false);
        setEditingDesignation(null);
        loadDesignations();
      } else {
        toast.error(response.message || 'Failed to update designation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update designation');
    }
  };

  const handleDelete = async (designation: Designation) => {
    if (!confirm(`Are you sure you want to delete "${designation.name}"?`)) {
      return;
    }

    try {
      const designationId = designation._id || designation.id;
      if (!designationId) {
        toast.error('Designation ID not found');
        return;
      }

      const response = await apiService.deleteDesignation(designationId.toString());
      if (response.success) {
        toast.success('Designation deleted successfully');
        loadDesignations();
      } else {
        toast.error(response.message || 'Failed to delete designation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete designation');
    }
  };

  const totalEmployees = designations.reduce((sum, d) => sum + (d.employees || 0), 0);
  const uniqueGrades = new Set(designations.map(d => d.grade).filter(Boolean)).size;
  const levelRange = designations.length > 0
    ? `${Math.min(...designations.map(d => d.level))}-${Math.max(...designations.map(d => d.level))}`
    : '1-10';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Designation Management</h1>
            <p className="text-muted-foreground mt-2">Manage designations and salary bands</p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            New Designation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Designations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{designations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Employees Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalEmployees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{uniqueGrades}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Level Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{levelRange}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Designations & Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading designations...</p>
              </div>
            ) : designations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No designations found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {designations.map((desig) => (
                  <div key={desig._id || desig.id} className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{desig.name}</h3>
                          {desig.grade && (
                            <Badge variant="outline">{desig.grade}</Badge>
                          )}
                          <Badge className="bg-blue-600">L{desig.level}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{desig.salaryBand || 'Salary not specified'}</span>
                          <span>•</span>
                          <span>{desig.employees || 0} employees</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleEdit(desig)}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleDelete(desig)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Designation Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Designation</DialogTitle>
              <DialogDescription>Add a new designation to the organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Designation Name *</Label>
                <Input
                  id="create-name"
                  placeholder="e.g., Senior Manager"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-grade">Grade</Label>
                <Input
                  id="create-grade"
                  placeholder="e.g., A1, Executive, Senior"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-level">Level *</Label>
                  <Input
                    id="create-level"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="1-10"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="create-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-minSalary">Min Salary (₹)</Label>
                  <Input
                    id="create-minSalary"
                    type="number"
                    placeholder="0"
                    value={formData.minSalary}
                    onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-maxSalary">Max Salary (₹)</Label>
                  <Input
                    id="create-maxSalary"
                    type="number"
                    placeholder="0"
                    value={formData.maxSalary}
                    onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Input
                  id="create-description"
                  placeholder="Optional description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button onClick={handleCreateSubmit} className="gap-2">
                <Save className="w-4 h-4" />
                Create Designation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Designation Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Designation</DialogTitle>
              <DialogDescription>Update designation details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Designation Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Senior Manager"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-grade">Grade</Label>
                <Input
                  id="edit-grade"
                  placeholder="e.g., A1, Executive, Senior"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Level *</Label>
                  <Input
                    id="edit-level"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="1-10"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-minSalary">Min Salary (₹)</Label>
                  <Input
                    id="edit-minSalary"
                    type="number"
                    placeholder="0"
                    value={formData.minSalary}
                    onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maxSalary">Max Salary (₹)</Label>
                  <Input
                    id="edit-maxSalary"
                    type="number"
                    placeholder="0"
                    value={formData.maxSalary}
                    onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  placeholder="Optional description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setEditingDesignation(null);
              }} className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button onClick={handleUpdateSubmit} className="gap-2">
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
