'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Search, Loader2, Building2, AlertTriangle } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

/**
 * Zone/Region Master Page
 * Create/edit/view zones and regions
 * BR-ORG-01: Levels flexible - some banks don't have Zone, go directly Bank → Region → Branch
 */
export default function ZoneMasterPage() {
  const { currentUser } = useAuth();
  const pathname = usePathname();
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState<'all' | 'ZO' | 'RO' | 'HO'>('all');
  const [form, setForm] = useState({
    unitCode: '',
    unitName: '',
    unitType: 'ZO' as 'ZO' | 'RO' | 'HO',
    parentUnitId: '',
    unitHeadId: '',
    headquartersCity: '',
    state: '',
    city: '',
    address: '',
    pinCode: '',
    effectiveDate: '',
    isActive: true,
  });
  const [parentUnits, setParentUnits] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [unitTypeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [zonesRes, regionsRes, hoRes] = await Promise.all([
        apiService.getOrganizationUnits({ type: 'ZO' }),
        apiService.getOrganizationUnits({ type: 'RO' }),
        apiService.getOrganizationUnits({ type: 'HO' }),
      ]);

      let allUnits: any[] = [];
      if (hoRes.success && hoRes.data) {
        allUnits = allUnits.concat(Array.isArray(hoRes.data) ? hoRes.data : []);
      }
      if (zonesRes.success && zonesRes.data) {
        allUnits = allUnits.concat(Array.isArray(zonesRes.data) ? zonesRes.data : []);
      }
      if (regionsRes.success && regionsRes.data) {
        allUnits = allUnits.concat(Array.isArray(regionsRes.data) ? regionsRes.data : []);
      }

      let filteredUnits = allUnits;
      if (unitTypeFilter === 'ZO') {
        filteredUnits = allUnits.filter((u: any) => u.unitType === 'ZO');
      } else if (unitTypeFilter === 'RO') {
        filteredUnits = allUnits.filter((u: any) => u.unitType === 'RO');
      } else if (unitTypeFilter === 'HO') {
        filteredUnits = allUnits.filter((u: any) => u.unitType === 'HO');
      }

      setZones(filteredUnits);
      setParentUnits(hoRes.success && hoRes.data ? (Array.isArray(hoRes.data) ? hoRes.data : []) : []);
    } catch (error: any) {
      toast.error('Failed to load zones/regions');
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

  const openCreate = () => {
    setEditingZone(null);
    setForm({
      unitCode: '',
      unitName: '',
      unitType: 'ZO',
      parentUnitId: '',
      unitHeadId: '',
      headquartersCity: '',
      state: '',
      city: '',
      address: '',
      pinCode: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      isActive: true,
    });
    loadEmployees();
    setDialogOpen(true);
  };

  const openCreateHeadOffice = useCallback(() => {
    setEditingZone(null);
    setUnitTypeFilter('HO');
    setForm({
      unitCode: 'HO-001',
      unitName: '',
      unitType: 'HO',
      parentUnitId: '',
      unitHeadId: '',
      headquartersCity: '',
      state: '',
      city: '',
      address: '',
      pinCode: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      isActive: true,
    });
    loadEmployees();
    setDialogOpen(true);
  }, []);

  useEffect(() => {
    if (currentUser?.role !== 'Tenant Admin' || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('create') !== 'ho') return;
    const t = window.setTimeout(() => {
      openCreateHeadOffice();
      window.history.replaceState({}, '', pathname || '/settings/org-structure/zone-master');
    }, 0);
    return () => window.clearTimeout(t);
  }, [pathname, currentUser?.role, openCreateHeadOffice]);

  const openEdit = (zone: any) => {
    setEditingZone(zone);
    setForm({
      unitCode: zone.unitCode,
      unitName: zone.unitName,
      unitType: zone.unitType,
      parentUnitId: zone.parentUnitId?._id || '',
      unitHeadId: zone.unitHeadId?._id || '',
      headquartersCity: zone.headquartersCity || '',
      state: zone.state || '',
      city: zone.city || '',
      address: zone.address || '',
      pinCode: zone.pinCode || '',
      effectiveDate: zone.effectiveDate ? new Date(zone.effectiveDate).toISOString().split('T')[0] : '',
      isActive: zone.isActive,
    });
    loadEmployees();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.unitCode || !form.unitName) {
      toast.error('Unit Code and Unit Name are required');
      return;
    }

    // Validate unit code format
    let formattedCode = form.unitCode.trim().toUpperCase();

    if (form.unitType === 'HO') {
      if (!/^HO-\d{3}$/.test(formattedCode)) {
        const m = formattedCode.match(/^HO[-_]?(\d{1,3})$/i);
        if (m) {
          formattedCode = `HO-${m[1].padStart(3, '0')}`;
          setForm({ ...form, unitCode: formattedCode });
        } else {
          toast.error('Invalid Head Office code. Use format: HO-001 (three digits).');
          return;
        }
      }
    } else if (form.unitType === 'ZO') {
      // ZO format: ZO-NAME-01 (e.g., ZO-SOUTH-01, ZO-NORTH-01)
      if (!/^ZO-[A-Z]{3,6}-\d{2}$/.test(formattedCode)) {
        // Try to auto-format if user entered something like ZO_SOUTH or ZO-SOUTH
        if (/^ZO[-_]?[A-Z]{3,6}$/i.test(formattedCode)) {
          const namePart = formattedCode.replace(/^ZO[-_]?/i, '');
          formattedCode = `ZO-${namePart}-01`;
          setForm({ ...form, unitCode: formattedCode });
        } else {
          toast.error('Invalid Zone Code format. Use format: ZO-NAME-01 (e.g., ZO-SOUTH-01)');
          return;
        }
      }
    } else if (form.unitType === 'RO') {
      // RO format: RO-XXXX (e.g., RO-DEL01, RO-MUM01)
      if (!/^RO-[A-Z0-9]{4,6}$/.test(formattedCode)) {
        // Try to auto-format if user entered something like RO_DELHI or RO-DELHI
        if (/^RO[-_]?[A-Z]{3,6}$/i.test(formattedCode)) {
          const namePart = formattedCode.replace(/^RO[-_]?/i, '').substring(0, 6);
          formattedCode = `RO-${namePart}01`;
          setForm({ ...form, unitCode: formattedCode });
        } else {
          toast.error('Invalid Region Code format. Use format: RO-XXXX (e.g., RO-DEL01)');
          return;
        }
      }
    }

    // BR-ORG-01: Parent unit required for ZO/RO
    if (form.unitType !== 'HO' && !form.parentUnitId) {
      toast.error('Parent Unit is required for Zone/Region');
      return;
    }

    try {
      const dataToSave = {
        ...form,
        unitCode: formattedCode,
        parentUnitId: form.unitType === 'HO' ? '' : form.parentUnitId,
      };
      if (editingZone) {
        const res = await apiService.updateOrganizationUnit(editingZone._id, dataToSave);
        if (res.success) {
          toast.success('Zone/Region updated successfully');
          setDialogOpen(false);
          loadData();
        } else {
          toast.error(res.message || 'Failed to update zone/region');
        }
      } else {
        const res = await apiService.createOrganizationUnit(dataToSave);
        if (res.success) {
          toast.success('Zone/Region created successfully');
          setDialogOpen(false);
          loadData();
        } else {
          toast.error(res.message || 'Failed to create zone/region');
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save zone/region';
      toast.error(errorMessage);
      console.error('Error saving zone/region:', error);
    }
  };

  const handleDelete = async (zone: any) => {
    if (!confirm(`Are you sure you want to delete ${zone.unitName}?`)) return;

    // BR-ORG-07: Check if unit has children
    try {
      const childrenRes = await apiService.getOrganizationUnitChildren(zone._id);
      if (childrenRes.success && childrenRes.data && childrenRes.data.length > 0) {
        toast.error(`Cannot delete unit with ${childrenRes.data.length} child unit(s). Please delete or reassign children first.`);
        return;
      }

      // BR-ORG-08: Check if unit has employees
      const employeesRes = await apiService.getUnitEmployees(zone._id);
      if (employeesRes.success && employeesRes.data?.directEmployees?.count > 0) {
        toast.error(`Cannot delete unit with ${employeesRes.data.directEmployees.count} employee(s). Please reassign employees first.`);
        return;
      }

      const res = await apiService.deleteOrganizationUnit(zone._id);
      if (res.success) {
        toast.success('Zone/Region deleted successfully');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete zone/region');
    }
  };

  const filteredZones = zones.filter((zone) => {
    if (zone.unitType !== 'ZO' && zone.unitType !== 'RO' && zone.unitType !== 'HO') {
      return false;
    }
    
    const matchesSearch = 
      zone.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.city?.toLowerCase().includes(searchTerm.toLowerCase());
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
            <h1 className="text-3xl font-bold">Zone / Region / Head Office Master</h1>
            <p className="text-muted-foreground mt-2">
              Manage Head Office, zones, and regions. Add Head Office first if you use HO → branches without zones.
            </p>
          </div>
          {currentUser?.role === 'Tenant Admin' && (
            <div className="flex gap-2">
              {zones.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm('Are you sure you want to delete all seed/sample data? This will remove all pre-created zones and regions.')) {
                      return;
                    }
                    try {
                      const res = await apiService.deleteSeedData();
                      if (res.success) {
                        toast.success(`Deleted seed data: ${res.data?.zones || 0} zones, ${res.data?.regions || 0} regions`);
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
              <Button variant="default" className="bg-emerald-700 hover:bg-emerald-800" onClick={openCreateHeadOffice}>
                <Plus className="w-4 h-4 mr-2" />
                Add Head Office
              </Button>
              <Button variant="outline" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Zone / Region
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
                    placeholder="Search by code, name, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={unitTypeFilter} onValueChange={(v: any) => setUnitTypeFilter(v)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="HO">Head Office</SelectItem>
                  <SelectItem value="ZO">Zones Only</SelectItem>
                  <SelectItem value="RO">Regions Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Zones/Regions List */}
        {filteredZones.length === 0 && !loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No zones/regions found</p>
              {currentUser?.role === 'Tenant Admin' && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const res = await apiService.seedOrganizationSampleData();
                      if (res.success) {
                        toast.success(`Sample data created: ${res.data?.zones || 0} zones, ${res.data?.regions || 0} regions`);
                        loadData();
                      }
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to create sample data');
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Sample Data
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredZones.map((zone) => (
              <Card key={zone._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {zone.unitName}
                    </CardTitle>
                    <CardDescription>{zone.unitCode}</CardDescription>
                  </div>
                  <Badge variant={zone.isActive ? 'default' : 'secondary'}>
                    {zone.unitType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {zone.parentUnitId && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Parent: </span>
                    <span className="font-medium">{zone.parentUnitId.unitName}</span>
                  </div>
                )}
                {zone.headquartersCity && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">HQ City: </span>
                    <span>{zone.headquartersCity}</span>
                  </div>
                )}
                {zone.unitHeadId && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Head: </span>
                    <span>{zone.unitHeadId.firstName} {zone.unitHeadId.lastName}</span>
                  </div>
                )}
                {currentUser?.role === 'Tenant Admin' && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(zone)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(zone)}>
                      <Trash2 className="w-4 h-4" />
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingZone ? 'Edit unit' : 'Add Head Office / Zone / Region'}</DialogTitle>
              <DialogDescription>
                Head Office has no parent. Zones and regions must sit under a Head Office.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Unit Type *</Label>
                  <Select
                    value={form.unitType}
                    onValueChange={(v: 'ZO' | 'RO' | 'HO') => setForm({ ...form, unitType: v, parentUnitId: v === 'HO' ? '' : form.parentUnitId })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HO">Head Office</SelectItem>
                      <SelectItem value="ZO">Zone</SelectItem>
                      <SelectItem value="RO">Region</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unit Code *</Label>
                  <Input
                    value={form.unitCode}
                    onChange={(e) => setForm({ ...form, unitCode: e.target.value.toUpperCase() })}
                    placeholder={form.unitType === 'ZO' ? 'ZO-SOUTH-01' : 'RO-DEL01'}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.unitType === 'HO'
                      ? 'Format: HO-001, HO-002, ...'
                      : form.unitType === 'ZO'
                      ? 'Format: ZO-NAME-01 (e.g., ZO-SOUTH-01, ZO-NORTH-01)'
                      : 'Format: RO-XXXX (e.g., RO-DEL01, RO-MUM01)'}
                  </p>
                </div>
              </div>
              <div>
                <Label>Unit Name *</Label>
                <Input
                  value={form.unitName}
                  onChange={(e) => setForm({ ...form, unitName: e.target.value })}
                  placeholder={form.unitType === 'HO' ? 'e.g., Corporate Head Office' : 'e.g., North Zone'}
                />
              </div>
              {form.unitType !== 'HO' && (
              <div>
                <Label>Parent (Head Office) *</Label>
                <Select
                  value={form.parentUnitId || '__none__'}
                  onValueChange={(v) => setForm({ ...form, parentUnitId: v === '__none__' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Head Office" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentUnits.length === 0 ? (
                      <SelectItem value="__none__" disabled>Create a Head Office first (unit type HO)</SelectItem>
                    ) : (
                      parentUnits.map((parent) => (
                        <SelectItem key={parent._id} value={parent._id}>
                          {parent.unitCode} - {parent.unitName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Zones and regions must report to a Head Office.
                </p>
              </div>
              )}
              <div>
                <Label>Zonal/Regional Head</Label>
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
              <div>
                <Label>Headquarters City</Label>
                <Input
                  value={form.headquartersCity}
                  onChange={(e) => setForm({ ...form, headquartersCity: e.target.value })}
                  placeholder="e.g., Mumbai"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>State</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>PIN Code</Label>
                  <Input
                    value={form.pinCode}
                    onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                    maxLength={6}
                  />
                </div>
                <div>
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={form.effectiveDate}
                    onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                  />
                </div>
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
      </div>
    </DashboardLayout>
  );
}
