'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Copy, 
  GripVertical, 
  Calculator,
  Save,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Types ---
interface SalaryComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  calculationType: 'percentage' | 'fixed';
  value: number;
  isFixed?: boolean; // Cannot be deleted/moved if true (e.g., Basic)
}

interface SalaryStructure {
  id: number;
  name: string;
  baseSalary: number;
  components: SalaryComponent[];
  active: boolean;
}

// --- Sortable Item Component ---
function SortableComponentItem({ 
  component, 
  baseSalary, 
  onRemove, 
  onUpdate 
}: { 
  component: SalaryComponent; 
  baseSalary: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: component.id, disabled: component.isFixed });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const calculatedAmount = component.calculationType === 'percentage' 
    ? (baseSalary * component.value) / 100 
    : component.value;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center gap-3 p-3 rounded-lg border mb-2 ${
        component.type === 'earning' ? 'bg-card border-border/50' : 'bg-red-50/50 dark:bg-red-900/10 border-red-200/50'
      }`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className={`p-2 rounded hover:bg-secondary cursor-move ${component.isFixed ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-4">
          <Input 
            value={component.name} 
            onChange={(e) => onUpdate(component.id, 'name', e.target.value)}
            disabled={component.isFixed}
            className="h-8 font-medium"
          />
        </div>
        
        <div className="col-span-3">
          <select 
            className="w-full h-8 px-2 text-sm border border-input rounded-md bg-background"
            value={component.calculationType}
            onChange={(e) => onUpdate(component.id, 'calculationType', e.target.value)}
          >
            <option value="percentage">% of Base</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>

        <div className="col-span-2">
          <Input 
            type="number" 
            value={component.value} 
            onChange={(e) => onUpdate(component.id, 'value', parseFloat(e.target.value) || 0)}
            className="h-8"
          />
        </div>

        <div className="col-span-3 text-right font-mono font-medium">
          ₹{calculatedAmount.toLocaleString()}
        </div>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onRemove(component.id)}
        disabled={component.isFixed}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function SalaryStructurePage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  
  // --- State ---
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStructure, setCurrentStructure] = useState<SalaryStructure | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadStructures();
    }
  }, [isAuthenticated]);

  // BRD Access Control: Payroll Administrator can configure salary structures
  // According to BRD: "Configure salary structures and components" is a Payroll Administrator permission
  // Allow Payroll Administrator, Tenant Admin, Super Admin, or users with manage_settings permission
  const allowedRoles = ['Payroll Administrator', 'Tenant Admin', 'Super Admin'];
  const hasAccess = hasPermission('manage_settings') || 
                    (currentUser?.role && allowedRoles.includes(currentUser.role));

  if (!isAuthenticated) {
    redirect('/login');
  }

  if (!hasAccess) {
    redirect('/dashboard');
  }

  const loadStructures = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSalaryStructures({ status: 'Active' });
      if (response.success && response.data) {
        const loadedStructures = Array.isArray(response.data) ? response.data : [];
        setStructures(loadedStructures.map((s: any) => ({
          _id: s._id,
          id: s._id,
          name: s.name,
          grade: s.grade,
          location: s.location,
          version: s.version,
          effectiveFrom: s.effectiveFrom,
          effectiveTo: s.effectiveTo,
          status: s.status,
          baseSalary: s.baseSalary || 50000,
          active: s.status === 'Active',
          components: (s.components || []).map((c: any, idx: number) => ({
            id: c._id || `comp-${idx}`,
            name: c.name,
            type: c.type,
            calculationType: c.calculationType,
            value: c.value,
            isFixed: c.name?.toLowerCase().includes('basic'),
          })),
        })));
      }
    } catch (error: any) {
      toast.error('Failed to load salary structures');
    } finally {
      setIsLoading(false);
    }
  };

  // --- DnD Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Permission check already done above

  // --- Handlers ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (currentStructure && over && active.id !== over.id) {
      const oldIndex = currentStructure.components.findIndex((c) => c.id === active.id);
      const newIndex = currentStructure.components.findIndex((c) => c.id === over.id);

      setCurrentStructure({
        ...currentStructure,
        components: arrayMove(currentStructure.components, oldIndex, newIndex),
      });
    }
  };

  const handleCreateNew = () => {
    setCurrentStructure({
      name: 'New Structure',
      grade: '',
      baseSalary: 50000,
      active: true,
      status: 'Active',
      components: [
        { id: 'basic', name: 'Basic Salary', type: 'earning', calculationType: 'percentage', value: 40, isFixed: true },
        { id: 'hra', name: 'HRA', type: 'earning', calculationType: 'percentage', value: 20 },
        { id: 'pf', name: 'PF', type: 'deduction', calculationType: 'percentage', value: 12 },
      ]
    });
    setIsEditing(true);
  };

  const handleEdit = (structure: SalaryStructure) => {
    setCurrentStructure({ ...structure });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentStructure) return;
    
    try {
      const structureData = {
        name: currentStructure.name,
        grade: currentStructure.grade || 'General',
        location: currentStructure.location || '',
        effectiveFrom: currentStructure.effectiveFrom || new Date().toISOString().split('T')[0],
        status: currentStructure.status || 'Active',
        components: currentStructure.components.map((c, idx) => ({
          name: c.name,
          type: c.type,
          calculationType: c.calculationType,
          base: c.calculationType === 'percentage' ? 'Basic' : undefined,
          value: c.value,
          isFixed: c.isFixed || false,
          applicable: true,
          order: idx,
        })),
      };

      if (currentStructure._id) {
        // Update existing
        const response = await apiService.updateSalaryStructure(currentStructure._id, structureData);
        if (response.success) {
          toast.success('Salary structure updated successfully');
          loadStructures();
          setIsEditing(false);
          setCurrentStructure(null);
        } else {
          toast.error(response.message || 'Failed to update structure');
        }
      } else {
        // Create new
        const response = await apiService.createSalaryStructure(structureData);
        if (response.success) {
          toast.success('Salary structure created successfully');
          loadStructures();
          setIsEditing(false);
          setCurrentStructure(null);
        } else {
          toast.error(response.message || 'Failed to create structure');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const addComponent = (type: 'earning' | 'deduction') => {
    if (!currentStructure) return;
    const newComponent: SalaryComponent = {
      id: `comp-${Date.now()}`,
      name: type === 'earning' ? 'New Allowance' : 'New Deduction',
      type,
      calculationType: 'fixed',
      value: 0
    };
    setCurrentStructure({
      ...currentStructure,
      components: [...currentStructure.components, newComponent]
    });
  };

  const updateComponent = (id: string, field: string, value: any) => {
    if (!currentStructure) return;
    setCurrentStructure({
      ...currentStructure,
      components: currentStructure.components.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    });
  };

  const removeComponent = (id: string) => {
    if (!currentStructure) return;
    setCurrentStructure({
      ...currentStructure,
      components: currentStructure.components.filter(c => c.id !== id)
    });
  };

  // --- Calculations ---
  const calculateTotals = (structure: SalaryStructure) => {
    let earnings = 0;
    let deductions = 0;

    structure.components.forEach(comp => {
      const amount = comp.calculationType === 'percentage' 
        ? (structure.baseSalary * comp.value) / 100 
        : comp.value;
      
      if (comp.type === 'earning') earnings += amount;
      else deductions += amount;
    });

    return { earnings, deductions, net: earnings - deductions };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Salary Structure Builder</h1>
            <p className="text-muted-foreground mt-2">Design complex salary structures with drag & drop components</p>
          </div>
          {!isEditing && (
            <Button onClick={handleCreateNew} className="gap-2 shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4" />
              New Structure
            </Button>
          )}
        </div>

        {isEditing && currentStructure ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Editor Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Structure Configuration</CardTitle>
                      <CardDescription>Drag components to reorder priority</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => addComponent('earning')} className="text-green-600 border-green-200 hover:bg-green-50">
                        <Plus className="w-4 h-4 mr-1" /> Earning
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addComponent('deduction')} className="text-red-600 border-red-200 hover:bg-red-50">
                        <Plus className="w-4 h-4 mr-1" /> Deduction
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label>Structure Name *</Label>
                      <Input 
                        value={currentStructure.name} 
                        onChange={(e) => setCurrentStructure({...currentStructure, name: e.target.value})}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label>Grade/Level</Label>
                      <Input 
                        value={currentStructure.grade || ''} 
                        onChange={(e) => setCurrentStructure({...currentStructure, grade: e.target.value})}
                        className="mt-1"
                        placeholder="e.g., Manager, Executive"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input 
                        value={currentStructure.location || ''} 
                        onChange={(e) => setCurrentStructure({...currentStructure, location: e.target.value})}
                        className="mt-1"
                        placeholder="e.g., Metro, Non-Metro"
                      />
                    </div>
                    <div>
                      <Label>Effective From</Label>
                      <Input 
                        type="date"
                        value={currentStructure.effectiveFrom || new Date().toISOString().split('T')[0]} 
                        onChange={(e) => setCurrentStructure({...currentStructure, effectiveFrom: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Reference Base Salary (for simulation)</Label>
                      <Input 
                        type="number" 
                        value={currentStructure.baseSalary || 50000} 
                        onChange={(e) => setCurrentStructure({...currentStructure, baseSalary: parseFloat(e.target.value) || 0})}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={currentStructure.components} 
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {currentStructure.components.map((component) => (
                          <SortableComponentItem
                            key={component.id}
                            component={component}
                            baseSalary={currentStructure.baseSalary}
                            onRemove={removeComponent}
                            onUpdate={updateComponent}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="space-y-6">
              <Card className="bg-secondary/20 border-0 sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Simulation Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(() => {
                    const { earnings, deductions, net } = calculateTotals(currentStructure);
                    return (
                      <>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Gross Earnings</span>
                            <span className="font-semibold text-green-600">₹{earnings.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Deductions</span>
                            <span className="font-semibold text-red-600">₹{deductions.toLocaleString()}</span>
                          </div>
                          <div className="h-px bg-border my-2" />
                          <div className="flex justify-between text-lg font-bold">
                            <span>Net Salary</span>
                            <span>₹{net.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Monthly</span>
                            <span>Annual: ₹{(net * 12).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button className="flex-1 gap-2" onClick={handleSave}>
                            <Save className="w-4 h-4" /> Save
                          </Button>
                          <Button variant="outline" className="flex-1 gap-2" onClick={() => setIsEditing(false)}>
                            <X className="w-4 h-4" /> Cancel
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            {isLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Loading salary structures...</p>
                </CardContent>
              </Card>
            ) : structures.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No salary structures found</p>
                  <Button onClick={handleCreateNew} className="gap-2">
                    <Plus className="w-4 h-4" /> Create First Structure
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {structures.map((structure) => {
                  const { net } = calculateTotals(structure);
                  const id = structure._id || structure.id;
                  return (
                    <Card key={id} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer" onClick={() => handleEdit(structure)}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{structure.name}</CardTitle>
                          <Badge variant={structure.active || structure.status === 'Active' ? 'default' : 'secondary'}>
                            {structure.active || structure.status === 'Active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <CardDescription>
                          {structure.components.length} components
                          {structure.grade && ` • ${structure.grade}`}
                          {structure.version && ` • v${structure.version}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {structure.components.slice(0, 3).map((comp, idx) => (
                            <div key={idx} className="flex justify-between text-sm text-muted-foreground">
                              <span>{comp.name}</span>
                              <span>
                                {comp.calculationType === 'percentage' ? `${comp.value}%` : `₹${comp.value}`}
                              </span>
                            </div>
                          ))}
                          {structure.components.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center pt-1">+ {structure.components.length - 3} more</p>
                          )}
                        </div>
                        <div className="pt-3 border-t border-border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Est. Net Pay</span>
                            <span className="text-lg font-bold text-primary">₹{net.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
