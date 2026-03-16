'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Search, Loader2, Building2, MapPin, Users, Merge, AlertTriangle } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

/**
 * Branch Master Page
 * Main module for managing branches
 * BR-ORG-09: Branch delete nahi ho sakti agar active employees assign hain — sirf Inactive kar sakte hain
 * BR-ORG-10: Branch merge karne pe employees ka transfer automatically trigger ho
 */
export default function BranchMasterPage() {
  const { currentUser } = useAuth();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive' | 'Merged'>('all');
  const [branchTypeFilter, setBranchTypeFilter] = useState<'all' | 'Urban' | 'Semi-Urban' | 'Rural'>('all');
  const [form, setForm] = useState({
    unitCode: '',
    unitName: '',
    branchCode: '',
    parentUnitId: '',
    branchType: 'Urban' as 'Urban' | 'Semi-Urban' | 'Rural',
    unitHeadId: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    openingDate: '',
    isActive: true,
  });
  const [parentUnits, setParentUnits] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedMergeTarget, setSelectedMergeTarget] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter, branchTypeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch ALL branches for current tenant (no status filter in API call - we'll filter client-side)
      const params: any = { type: 'BRANCH' };
      
      // Fetch branches, zones (ZO), and regions (RO) for parent dropdown
      const [branchesRes, zonesRes, regionsRes] = await Promise.all([
        apiService.getOrganizationUnits(params),
        apiService.getOrganizationUnits({ type: 'ZO' }),
        apiService.getOrganizationUnits({ type: 'RO' }),
      ]);

      if (branchesRes.success && branchesRes.data) {
        let branchesList = Array.isArray(branchesRes.data) ? branchesRes.data : [];
        
        // Filter by status (client-side)
        if (statusFilter === 'Active') {
          branchesList = branchesList.filter((b: any) => b.isActive === true);
        } else if (statusFilter === 'Inactive') {
          branchesList = branchesList.filter((b: any) => b.isActive === false);
        }
        // If 'all', show all branches (no filter)
        
        // Filter by branch type
        if (branchTypeFilter !== 'all') {
          branchesList = branchesList.filter((b: any) => b.branchType === branchTypeFilter);
        }
        
        // Sort by creation date (newest first) so user's created branches appear first
        branchesList.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.openingDate || 0).getTime();
          const dateB = new Date(b.createdAt || b.openingDate || 0).getTime();
          return dateB - dateA; // Newest first
        });
        
        setBranches(branchesList);
      } else {
        // If API call fails or returns no data, set empty array
        setBranches([]);
      }
      
      // Combine zones and regions for parent dropdown
      const allParentUnits: any[] = [];
      if (zonesRes.success && zonesRes.data) {
        const zones = Array.isArray(zonesRes.data) ? zonesRes.data : [];
        allParentUnits.push(...zones);
      }
      if (regionsRes.success && regionsRes.data) {
        const regions = Array.isArray(regionsRes.data) ? regionsRes.data : [];
        allParentUnits.push(...regions);
      }
      
      setParentUnits(allParentUnits);
    } catch (error: any) {
      console.error('Error loading branches:', error);
      toast.error('Failed to load branches');
      setBranches([]); // Set empty array on error
      setParentUnits([]); // Also reset parent units on error
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await apiService.getEmployees({ status: 'Active' });
      if (res.success && res.data) {
        setEmployees(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to load employees');
    }
  };

  const loadParentUnits = async () => {
    try {
      // Fetch both zones (ZO) and regions (RO) for parent dropdown
      const [zonesRes, regionsRes] = await Promise.all([
        apiService.getOrganizationUnits({ type: 'ZO' }),
        apiService.getOrganizationUnits({ type: 'RO' }),
      ]);
      
      const allParentUnits: any[] = [];
      if (zonesRes.success && zonesRes.data) {
        const zones = Array.isArray(zonesRes.data) ? zonesRes.data : [];
        allParentUnits.push(...zones);
      }
      if (regionsRes.success && regionsRes.data) {
        const regions = Array.isArray(regionsRes.data) ? regionsRes.data : [];
        allParentUnits.push(...regions);
      }
      
      setParentUnits(allParentUnits);
    } catch (error: any) {
      console.error('Error loading parent units:', error);
      toast.error('Failed to load parent units');
    }
  };

  const openCreate = async () => {
    setEditingBranch(null);
    setForm({
      unitCode: '',
      unitName: '',
      branchCode: '',
      parentUnitId: '',
      branchType: 'Urban',
      unitHeadId: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      openingDate: new Date().toISOString().split('T')[0],
      isActive: true,
    });
    // Reload parent units to ensure latest data is available
    await loadParentUnits();
    loadEmployees();
    setDialogOpen(true);
  };

  const openEdit = async (branch: any) => {
    setEditingBranch(branch);
    setForm({
      unitCode: branch.unitCode,
      unitName: branch.unitName,
      branchCode: branch.branchCode || '',
      parentUnitId: branch.parentUnitId?._id || branch.parentUnitId || '',
      branchType: branch.branchType || 'Urban',
      unitHeadId: branch.unitHeadId?._id || branch.unitHeadId || '',
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      pinCode: branch.pinCode || '',
      openingDate: branch.openingDate ? new Date(branch.openingDate).toISOString().split('T')[0] : '',
      isActive: branch.isActive,
    });
    // Reload parent units to ensure latest data is available
    await loadParentUnits();
    loadEmployees();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.unitCode || !form.unitName || !form.branchCode) {
      toast.error('Unit Code, Branch Name, and Branch Code/IFSC are required');
      return;
    }

    // BR-ORG-11: Branch must have parent (Region or Zone)
    if (!form.parentUnitId) {
      toast.error('Parent Region/Zone is required');
      return;
    }

    // BR-ORG-12: Validate IFSC format (11 characters: 4 letters + 0 + 6 digits)
    if (form.branchCode && !/^[A-Z]{4}0[0-9]{6}$/.test(form.branchCode.toUpperCase())) {
      toast.error('Invalid IFSC format. Format: AAAA0XXXXXX (e.g., IBKL0000001)');
      return;
    }

    try {
      if (editingBranch) {
        const res = await apiService.updateOrganizationUnit(editingBranch._id, form);
        if (res.success) {
          toast.success('Branch updated successfully');
          setDialogOpen(false);
          await loadData(); // Ensure data reloads
        } else {
          toast.error(res.message || 'Failed to update branch');
        }
      } else {
        const res = await apiService.createOrganizationUnit({
          ...form,
          unitType: 'BRANCH',
        });
        if (res.success) {
          toast.success('Branch created successfully');
          setDialogOpen(false);
          await loadData(); // Ensure data reloads immediately
        } else {
          toast.error(res.message || 'Failed to create branch');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save branch');
    }
  };

  const handleDelete = async (branch: any) => {
    // BR-ORG-09: Cannot delete branch with active employees - only deactivate
    try {
      const employeesRes = await apiService.getUnitEmployees(branch._id);
      if (employeesRes.success && employeesRes.data?.directEmployees?.count > 0) {
        if (confirm(`Branch has ${employeesRes.data.directEmployees.count} active employee(s). Do you want to deactivate it instead?`)) {
          const res = await apiService.updateOrganizationUnit(branch._id, { isActive: false });
          if (res.success) {
            toast.success('Branch deactivated successfully');
            loadData();
          }
        }
        return;
      }

      if (!confirm(`Are you sure you want to delete ${branch.unitName}?`)) return;

      const res = await apiService.deleteOrganizationUnit(branch._id);
      if (res.success) {
        toast.success('Branch deleted successfully');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete branch');
    }
  };

  const handleMerge = async (branch: any) => {
    if (!selectedMergeTarget) {
      toast.error('Please select target branch to merge into');
      return;
    }

    if (!confirm(`Merge ${branch.unitName} into target branch? All employees will be automatically transferred.`)) {
      return;
    }

    try {
      const res = await apiService.mergeOrganizationUnits(branch._id, selectedMergeTarget);
      if (res.success) {
        toast.success(`Branch merged successfully. ${res.data?.employeesTransferred || 0} employees transferred.`);
        setMergeDialogOpen(false);
        setSelectedMergeTarget('');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to merge branch');
    }
  };

  const filteredBranches = branches.filter((branch) => {
    // Ensure only BRANCH types are shown (extra safety check)
    if (branch.unitType !== 'BRANCH') {
      return false;
    }
    
    const matchesSearch = 
      branch.unitCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.unitName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.branchCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Branch Master</h1>
            <p className="text-muted-foreground mt-2">
              Manage branches - main module for organization structure
            </p>
          </div>
          {currentUser?.role === 'Tenant Admin' && (
            <div className="flex gap-2">
              {branches.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm('Are you sure you want to delete all seed/sample branches? This will remove all pre-created branches.')) {
                      return;
                    }
                    try {
                      const res = await apiService.deleteSeedData();
                      if (res.success) {
                        toast.success(`Deleted seed data: ${res.data?.branches || 0} branches`);
                        loadData();
                      }
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to delete seed data');
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Seed Data
                </Button>
              )}
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Branch
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by code, name, IFSC, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={branchTypeFilter} onValueChange={(v: any) => setBranchTypeFilter(v)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Urban">Urban</SelectItem>
                  <SelectItem value="Semi-Urban">Semi-Urban</SelectItem>
                  <SelectItem value="Rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Branches List */}
        {filteredBranches.length === 0 && !loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No branches found</p>
              {currentUser?.role === 'Tenant Admin' && (
                <Button onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Branch
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBranches.map((branch) => (
            <Card key={branch._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {branch.unitName}
                    </CardTitle>
                    <CardDescription>{branch.unitCode}</CardDescription>
                    {branch.branchCode && (
                      <Badge variant="outline" className="mt-1">
                        IFSC: {branch.branchCode}
                      </Badge>
                    )}
                  </div>
                  <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {branch.parentUnitId && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Parent: </span>
                    <span className="font-medium">{branch.parentUnitId.unitName}</span>
                  </div>
                )}
                {branch.branchType && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Type: </span>
                    <Badge variant="outline">{branch.branchType}</Badge>
                  </div>
                )}
                {branch.city && branch.state && (
                  <div className="text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{branch.city}, {branch.state}</span>
                  </div>
                )}
                {branch.unitHeadId && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Manager: </span>
                    <span>{branch.unitHeadId.firstName} {branch.unitHeadId.lastName}</span>
                  </div>
                )}
                {currentUser?.role === 'Tenant Admin' && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(branch)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(branch)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingBranch(branch);
                      setMergeDialogOpen(true);
                    }}>
                      <Merge className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBranch ? 'Edit Branch' : 'Create Branch'}</DialogTitle>
              <DialogDescription>
                {editingBranch ? 'Update branch details' : 'Add a new branch to the organization structure'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Branch Code / IFSC *</Label>
                  <Input
                    value={form.branchCode}
                    onChange={(e) => setForm({ ...form, branchCode: e.target.value.toUpperCase() })}
                    placeholder="IBKL0000001"
                    maxLength={11}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: AAAA0XXXXXX (4 letters + 0 + 6 digits)
                  </p>
                </div>
                <div>
                  <Label>Unit Code *</Label>
                  <Input
                    value={form.unitCode}
                    onChange={(e) => setForm({ ...form, unitCode: e.target.value.toUpperCase() })}
                    placeholder="BR-000001"
                  />
                </div>
              </div>
              <div>
                <Label>Branch Name *</Label>
                <Input
                  value={form.unitName}
                  onChange={(e) => setForm({ ...form, unitName: e.target.value })}
                  placeholder="e.g., Connaught Place Branch"
                />
              </div>
              <div>
                <Label>Parent Region / Zone *</Label>
                <Select
                  value={form.parentUnitId}
                  onValueChange={(v) => setForm({ ...form, parentUnitId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentUnits.length === 0 ? (
                      <SelectItem value="no-parent" disabled>
                        No zones or regions available. Please create a zone or region first.
                      </SelectItem>
                    ) : (
                      parentUnits.map((parent) => (
                        <SelectItem key={parent._id} value={parent._id}>
                          {parent.unitCode} - {parent.unitName} ({parent.unitType})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Branch must be under a Region or Zone
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Branch Type *</Label>
                  <Select
                    value={form.branchType}
                    onValueChange={(v: 'Urban' | 'Semi-Urban' | 'Rural') => setForm({ ...form, branchType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Urban">Urban</SelectItem>
                      <SelectItem value="Semi-Urban">Semi-Urban</SelectItem>
                      <SelectItem value="Rural">Rural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Branch Manager</Label>
                  <Select
                    value={form.unitHeadId}
                    onValueChange={(v) => setForm({ ...form, unitHeadId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp._id} value={emp._id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Address *</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label>PIN Code *</Label>
                  <Input
                    value={form.pinCode}
                    onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                    maxLength={6}
                  />
                </div>
              </div>
              <div>
                <Label>Opening Date</Label>
                <Input
                  type="date"
                  value={form.openingDate}
                  onChange={(e) => setForm({ ...form, openingDate: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Merge Dialog */}
        <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Merge Branch</DialogTitle>
              <DialogDescription>
                BR-ORG-10: Merging will automatically transfer all employees to the target branch
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Source Branch</Label>
                <Input value={editingBranch?.unitName} disabled />
              </div>
              <div>
                <Label>Target Branch *</Label>
                <Select value={selectedMergeTarget} onValueChange={setSelectedMergeTarget}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches
                      .filter((b) => b._id !== editingBranch?._id && b.isActive)
                      .map((branch) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          {branch.unitCode} - {branch.unitName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setMergeDialogOpen(false);
                setSelectedMergeTarget('');
              }}>
                Cancel
              </Button>
              <Button onClick={() => handleMerge(editingBranch)} disabled={!selectedMergeTarget}>
                Merge Branches
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
