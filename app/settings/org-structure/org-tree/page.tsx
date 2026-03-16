'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  ChevronRight,
  ChevronDown,
  Building2,
  MapPin,
  Users,
  Edit2,
  Move,
  Loader2,
  Info,
} from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

/**
 * Org Tree Builder (Visual Interactive Tree)
 * BR-ORG-13: Interactive tree view - click any node to open details in side panel
 * BR-ORG-14: Drag-and-drop to move units from one parent to another (transfer)
 */
export default function OrgTreePage() {
  const { currentUser } = useAuth();
  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [draggedUnit, setDraggedUnit] = useState<any>(null);
  const [employeeCounts, setEmployeeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadHierarchy();
  }, []);

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
        loadEmployeeCounts(response.data);
      }
    } catch (error: any) {
      toast.error('Failed to load organization hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeCounts = async (units: any[]) => {
    const counts: Record<string, number> = {};
    for (const unit of units) {
      try {
        const response = await apiService.getUnitEmployees(unit._id);
        if (response.success && response.data) {
          counts[unit._id] = response.data.totalEmployees?.count || 0;
        }
      } catch (error) {
        // Ignore errors
      }
      if (unit.children && unit.children.length > 0) {
        const childCounts = await loadEmployeeCounts(unit.children);
        Object.assign(counts, childCounts);
      }
    }
    setEmployeeCounts(counts);
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

  const handleUnitClick = async (unit: any) => {
    // Load full unit details
    try {
      const response = await apiService.getOrganizationUnit(unit._id);
      if (response.success) {
        setSelectedUnit(response.data);
      }
    } catch (error) {
      setSelectedUnit(unit);
    }
  };

  const handleDragStart = (e: React.DragEvent, unit: any) => {
    if (currentUser?.role !== 'Tenant Admin') return;
    setDraggedUnit(unit);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetUnit: any) => {
    e.preventDefault();
    if (!draggedUnit || !targetUnit || draggedUnit._id === targetUnit._id) {
      setDraggedUnit(null);
      return;
    }

    // BR-ORG-14: Validate hierarchy before move
    const validHierarchy: Record<string, string[]> = {
      'ZO': ['HO'],
      'RO': ['ZO'],
      'BRANCH': ['RO', 'ZO'],
      'DEPARTMENT': ['BRANCH', 'HO'],
    };

    if (validHierarchy[draggedUnit.unitType] && !validHierarchy[draggedUnit.unitType].includes(targetUnit.unitType)) {
      toast.error(`Invalid hierarchy: ${draggedUnit.unitType} cannot be under ${targetUnit.unitType}`);
      setDraggedUnit(null);
      return;
    }

    // Prevent circular reference
    if (targetUnit._id === draggedUnit.parentUnitId) {
      toast.error('Unit is already under this parent');
      setDraggedUnit(null);
      return;
    }

    try {
      const response = await apiService.updateOrganizationUnit(draggedUnit._id, {
        parentUnitId: targetUnit._id,
      });
      if (response.success) {
        toast.success(`Moved ${draggedUnit.unitName} under ${targetUnit.unitName}`);
        loadHierarchy();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to move unit');
    } finally {
      setDraggedUnit(null);
    }
  };

  const getUnitTypeColor = (type: string) => {
    switch (type) {
      case 'HO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ZO': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'RO': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'BRANCH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'DEPARTMENT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderUnit = (unit: any, level: number = 0) => {
    const hasChildren = unit.children && unit.children.length > 0;
    const isExpanded = expandedUnits.has(unit._id);
    const employeeCount = employeeCounts[unit._id] || 0;
    const isDraggable = currentUser?.role === 'Tenant Admin' && unit.unitType !== 'HO';

    return (
      <div key={unit._id} className="mb-1">
        <div
          draggable={isDraggable}
          onDragStart={(e) => handleDragStart(e, unit)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, unit)}
          onClick={() => handleUnitClick(unit)}
          className={`
            flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
            ${level === 0 ? 'bg-card shadow-sm' : 'bg-muted/30'}
            hover:bg-muted/50 ${draggedUnit?._id === unit._id ? 'opacity-50' : ''}
            ${draggedUnit && draggedUnit._id !== unit._id ? 'border-dashed border-primary' : ''}
          `}
          style={{ marginLeft: `${level * 24}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(unit._id);
              }}
              className="p-1 hover:bg-background rounded"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <Building2 className="w-5 h-5 text-muted-foreground" />

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{unit.unitName}</span>
              <Badge className={getUnitTypeColor(unit.unitType)}>
                {unit.unitType}
              </Badge>
              <span className="text-sm text-muted-foreground">{unit.unitCode}</span>
              {employeeCount > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {employeeCount}
                </span>
              )}
            </div>
            {unit.city && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {unit.city}{unit.state && `, ${unit.state}`}
              </div>
            )}
          </div>

          {isDraggable && (
            <Move className="w-4 h-4 text-muted-foreground" title="Drag to move" />
          )}
        </div>

        {isExpanded && hasChildren && (
          <div>
            {unit.children.map((child: any) => renderUnit(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tree View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Organization Tree</CardTitle>
              <CardDescription>
                Visual hierarchy view. {currentUser?.role === 'Tenant Admin' && 'Drag units to reorganize.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentUser?.role === 'Tenant Admin' && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium mb-1">Drag-and-Drop Instructions</p>
                    <p>Drag any unit (except Head Office) to move it under a different parent. The system will validate hierarchy rules automatically.</p>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                {hierarchy.map((unit) => renderUnit(unit))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel - Unit Details */}
        {selectedUnit && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Unit Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUnit(null)}
                  className="absolute top-4 right-4"
                >
                  ×
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Unit Code</Label>
                  <p className="font-medium">{selectedUnit.unitCode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Unit Name</Label>
                  <p className="font-medium">{selectedUnit.unitName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <Badge className={getUnitTypeColor(selectedUnit.unitType)}>
                    {selectedUnit.unitType}
                  </Badge>
                </div>
                {selectedUnit.parentUnitId && (
                  <div>
                    <Label className="text-muted-foreground">Parent Unit</Label>
                    <p className="font-medium">
                      {typeof selectedUnit.parentUnitId === 'object'
                        ? `${selectedUnit.parentUnitId.unitCode} - ${selectedUnit.parentUnitId.unitName}`
                        : 'Loading...'}
                    </p>
                  </div>
                )}
                {selectedUnit.branchCode && (
                  <div>
                    <Label className="text-muted-foreground">IFSC Code</Label>
                    <p className="font-medium">{selectedUnit.branchCode}</p>
                  </div>
                )}
                {selectedUnit.branchType && (
                  <div>
                    <Label className="text-muted-foreground">Branch Type</Label>
                    <Badge variant="outline">{selectedUnit.branchType}</Badge>
                  </div>
                )}
                {selectedUnit.city && (
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <p className="font-medium">
                      {selectedUnit.address && `${selectedUnit.address}, `}
                      {selectedUnit.city}
                      {selectedUnit.state && `, ${selectedUnit.state}`}
                      {selectedUnit.pinCode && ` ${selectedUnit.pinCode}`}
                    </p>
                  </div>
                )}
                {selectedUnit.unitHeadId && (
                  <div>
                    <Label className="text-muted-foreground">Unit Head</Label>
                    <p className="font-medium">
                      {typeof selectedUnit.unitHeadId === 'object'
                        ? `${selectedUnit.unitHeadId.firstName} ${selectedUnit.unitHeadId.lastName} (${selectedUnit.unitHeadId.employeeCode})`
                        : 'Loading...'}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={selectedUnit.isActive ? 'default' : 'secondary'}>
                    {selectedUnit.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {currentUser?.role === 'Tenant Admin' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Navigate to edit page based on type
                      if (selectedUnit.unitType === 'BRANCH') {
                        window.location.href = `/settings/org-structure/branch-master`;
                      } else {
                        window.location.href = `/settings/org-structure/zone-master`;
                      }
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Unit
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
