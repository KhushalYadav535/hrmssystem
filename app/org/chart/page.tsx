'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ChevronRight,
  ChevronDown,
  Building2,
  MapPin,
  Users,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Search,
  Loader2,
} from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

interface OrganizationUnit {
  _id: string;
  unitCode: string;
  unitName: string;
  unitType: 'HO' | 'ZO' | 'RO' | 'BRANCH';
  parentUnitId?: {
    _id: string;
    unitCode: string;
    unitName: string;
    unitType: string;
  };
  unitHeadId?: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    email: string;
  };
  state?: string;
  city?: string;
  address?: string;
  pinCode?: string;
  isActive: boolean;
  children?: OrganizationUnit[];
}

interface UnitWithEmployees extends OrganizationUnit {
  employeeCount?: number;
}

export default function OrganizationChartPage() {
  const { currentUser } = useAuth();
  const [hierarchy, setHierarchy] = useState<OrganizationUnit[]>([]);
  const [filteredHierarchy, setFilteredHierarchy] = useState<OrganizationUnit[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<OrganizationUnit | null>(null);
  const [employeeCounts, setEmployeeCounts] = useState<Record<string, number>>({});

  // Form state
  const [formData, setFormData] = useState({
    unitCode: '',
    unitName: '',
    unitType: 'BRANCH' as 'HO' | 'ZO' | 'RO' | 'BRANCH',
    parentUnitId: '',
    unitHeadId: '',
    state: '',
    city: '',
    address: '',
    pinCode: '',
    isActive: true,
  });

  // Check authorization
  useEffect(() => {
    if (!currentUser) {
      redirect('/login');
    }
    // Organization chart visible to all authenticated users, but only Tenant Admin can edit
  }, [currentUser]);

  // Load hierarchy
  useEffect(() => {
    loadHierarchy();
  }, []);

  // Filter hierarchy
  useEffect(() => {
    filterHierarchy();
  }, [hierarchy, searchTerm, filterType]);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrganizationHierarchy();
      if (response.success && response.data) {
        setHierarchy(response.data);
        // Expand HO by default
        if (response.data.length > 0) {
          setExpandedUnits(new Set([response.data[0]._id]));
        }
        // Load employee counts
        loadEmployeeCounts(response.data);
      } else {
        toast.error(response.message || 'Failed to load organization hierarchy');
      }
    } catch (error: any) {
      toast.error('Error loading organization hierarchy');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeCounts = async (units: OrganizationUnit[]) => {
    const counts: Record<string, number> = {};
    for (const unit of units) {
      try {
        const response = await apiService.getUnitEmployees(unit._id);
        if (response.success && response.data) {
          counts[unit._id] = response.data.totalEmployees?.count || 0;
        }
      } catch (error) {
        // Ignore errors for employee counts
      }
      // Recursively load counts for children
      if (unit.children && unit.children.length > 0) {
        const childCounts = await loadEmployeeCounts(unit.children);
        Object.assign(counts, childCounts);
      }
    }
    setEmployeeCounts(counts);
  };

  const filterHierarchy = () => {
    let filtered = [...hierarchy];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filterByType(filtered, filterType as 'HO' | 'ZO' | 'RO' | 'BRANCH');
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filterBySearch(filtered, searchTerm);
    }

    setFilteredHierarchy(filtered);
  };

  const filterByType = (units: OrganizationUnit[], type: 'HO' | 'ZO' | 'RO' | 'BRANCH'): OrganizationUnit[] => {
    return units
      .map(unit => {
        const filteredChildren = unit.children
          ? filterByType(unit.children, type)
          : [];
        
        if (unit.unitType === type || filteredChildren.length > 0) {
          return {
            ...unit,
            children: filteredChildren.length > 0 ? filteredChildren : unit.children,
          };
        }
        return null;
      })
      .filter((unit): unit is OrganizationUnit => unit !== null);
  };

  const filterBySearch = (units: OrganizationUnit[], term: string): OrganizationUnit[] => {
    const lowerTerm = term.toLowerCase();
    return units
      .map(unit => {
        const matchesUnit =
          unit.unitCode.toLowerCase().includes(lowerTerm) ||
          unit.unitName.toLowerCase().includes(lowerTerm) ||
          unit.city?.toLowerCase().includes(lowerTerm) ||
          unit.state?.toLowerCase().includes(lowerTerm);

        const filteredChildren = unit.children
          ? filterBySearch(unit.children, term)
          : [];

        if (matchesUnit || filteredChildren.length > 0) {
          return {
            ...unit,
            children: filteredChildren.length > 0 ? filteredChildren : unit.children,
          };
        }
        return null;
      })
      .filter((unit): unit is OrganizationUnit => unit !== null);
  };

  const toggleExpand = (unitId: string) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const getUnitTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'HO':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'ZO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'RO':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'BRANCH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderUnit = (unit: OrganizationUnit, level: number = 0) => {
    const hasChildren = unit.children && unit.children.length > 0;
    const isExpanded = expandedUnits.has(unit._id);
    const employeeCount = employeeCounts[unit._id] || 0;

    return (
      <div key={unit._id} className="mb-2">
        <div
          className={`
            flex items-center gap-3 p-3 rounded-lg border transition-colors
            ${level === 0 ? 'bg-card shadow-sm' : 'bg-muted/30'}
            hover:bg-muted/50
          `}
          style={{ marginLeft: `${level * 24}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(unit._id)}
              className="p-1 hover:bg-background rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Unit Icon */}
          <Building2 className="w-5 h-5 text-muted-foreground" />

          {/* Unit Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{unit.unitName}</span>
              <Badge className={getUnitTypeBadgeColor(unit.unitType)}>
                {unit.unitType}
              </Badge>
              <span className="text-sm text-muted-foreground">{unit.unitCode}</span>
              {!unit.isActive && (
                <Badge variant="destructive" className="text-xs">Inactive</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              {unit.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {unit.city}
                  {unit.state && `, ${unit.state}`}
                </span>
              )}
              {employeeCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {employeeCount} employee{employeeCount !== 1 ? 's' : ''}
                </span>
              )}
              {unit.unitHeadId && (
                <span className="text-xs">
                  Head: {unit.unitHeadId.firstName} {unit.unitHeadId.lastName}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {(currentUser?.role === 'Tenant Admin' || currentUser?.role === 'Super Admin') && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedUnit(unit);
                  setFormData({
                    unitCode: unit.unitCode,
                    unitName: unit.unitName,
                    unitType: unit.unitType,
                    parentUnitId: unit.parentUnitId?._id || '',
                    unitHeadId: unit.unitHeadId?._id || '',
                    state: unit.state || '',
                    city: unit.city || '',
                    address: unit.address || '',
                    pinCode: unit.pinCode || '',
                    isActive: unit.isActive,
                  });
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-2">
            {unit.children!.map(child => renderUnit(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleCreate = async () => {
    try {
      const response = await apiService.createOrganizationUnit(formData);
      if (response.success) {
        toast.success('Organization unit created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        loadHierarchy();
      } else {
        toast.error(response.message || 'Failed to create organization unit');
      }
    } catch (error: any) {
      toast.error('Error creating organization unit');
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUnit) return;

    try {
      const response = await apiService.updateOrganizationUnit(selectedUnit._id, formData);
      if (response.success) {
        toast.success('Organization unit updated successfully');
        setIsEditDialogOpen(false);
        setSelectedUnit(null);
        resetForm();
        loadHierarchy();
      } else {
        toast.error(response.message || 'Failed to update organization unit');
      }
    } catch (error: any) {
      toast.error('Error updating organization unit');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      unitCode: '',
      unitName: '',
      unitType: 'BRANCH',
      parentUnitId: '',
      unitHeadId: '',
      state: '',
      city: '',
      address: '',
      pinCode: '',
      isActive: true,
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Organization Chart</h1>
            <p className="text-muted-foreground mt-1">
              View and manage organizational hierarchy (HO → ZO → RO → Branch)
            </p>
          </div>
          {(currentUser?.role === 'Tenant Admin' || currentUser?.role === 'Super Admin') && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Unit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Organization Unit</DialogTitle>
                  <DialogDescription>
                    Add a new organizational unit to the hierarchy
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Unit Code *</Label>
                      <Input
                        value={formData.unitCode}
                        onChange={(e) => setFormData({ ...formData, unitCode: e.target.value })}
                        placeholder="e.g., BR-000001"
                      />
                    </div>
                    <div>
                      <Label>Unit Name *</Label>
                      <Input
                        value={formData.unitName}
                        onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
                        placeholder="e.g., Mumbai Branch"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Unit Type *</Label>
                      <Select
                        value={formData.unitType}
                        onValueChange={(value: any) => setFormData({ ...formData, unitType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HO">Head Office (HO)</SelectItem>
                          <SelectItem value="ZO">Zonal Office (ZO)</SelectItem>
                          <SelectItem value="RO">Regional Office (RO)</SelectItem>
                          <SelectItem value="BRANCH">Branch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Parent Unit</Label>
                      <Input
                        value={formData.parentUnitId}
                        onChange={(e) => setFormData({ ...formData, parentUnitId: e.target.value })}
                        placeholder="Parent unit ID (optional)"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>PIN Code</Label>
                    <Input
                      value={formData.pinCode}
                      onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                      maxLength={6}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate}>Create</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, city, or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="HO">Head Office</SelectItem>
                  <SelectItem value="ZO">Zonal Office</SelectItem>
                  <SelectItem value="RO">Regional Office</SelectItem>
                  <SelectItem value="BRANCH">Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Organization Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Hierarchy</CardTitle>
            <CardDescription>
              Click on units to expand/collapse. {filteredHierarchy.length} unit(s) shown.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredHierarchy.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No organization units found. {hierarchy.length === 0 && 'Create your first unit to get started.'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHierarchy.map(unit => renderUnit(unit))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Organization Unit</DialogTitle>
              <DialogDescription>
                Update organization unit details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Unit Code *</Label>
                  <Input
                    value={formData.unitCode}
                    onChange={(e) => setFormData({ ...formData, unitCode: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Unit Name *</Label>
                  <Input
                    value={formData.unitName}
                    onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Unit Type *</Label>
                  <Select
                    value={formData.unitType}
                    onValueChange={(value: any) => setFormData({ ...formData, unitType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HO">Head Office (HO)</SelectItem>
                      <SelectItem value="ZO">Zonal Office (ZO)</SelectItem>
                      <SelectItem value="RO">Regional Office (RO)</SelectItem>
                      <SelectItem value="BRANCH">Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Parent Unit</Label>
                  <Input
                    value={formData.parentUnitId}
                    onChange={(e) => setFormData({ ...formData, parentUnitId: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <Label>PIN Code</Label>
                <Input
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  maxLength={6}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveEdit"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActiveEdit">Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate}>Update</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
