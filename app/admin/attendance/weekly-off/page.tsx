'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Calendar, Loader2, Pencil, Trash2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

const TENANT_WIDE_DEPARTMENT = '__ENTIRE_TENANT__';

type ApplyScope = 'GLOBAL' | 'DEPARTMENT' | 'LOCATION' | 'EMPLOYEE';

function weeklyOffToFormState(wo: any) {
  let applyScope: ApplyScope = 'GLOBAL';
  let scopeDepartment = '';
  let scopeLocationId = '';
  let scopeEmployeeId = '';

  const empRef = wo.employeeId;
  const empId =
    empRef && typeof empRef === 'object' && empRef !== null && '_id' in empRef
      ? String((empRef as { _id: unknown })._id)
      : empRef
        ? String(empRef)
        : '';

  if (empId) {
    applyScope = 'EMPLOYEE';
    scopeEmployeeId = empId;
  } else if (wo.department === TENANT_WIDE_DEPARTMENT) {
    applyScope = 'GLOBAL';
  } else if (wo.location) {
    applyScope = 'LOCATION';
    scopeLocationId = String(wo.location);
  } else if (wo.department) {
    applyScope = 'DEPARTMENT';
    scopeDepartment = String(wo.department);
  }

  const eff = wo.effectiveDate
    ? new Date(wo.effectiveDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  return {
    applyScope,
    scopeDepartment,
    scopeLocationId,
    scopeEmployeeId,
    offType: wo.offType || 'FIXED',
    fixedDays: (wo.fixedDays || []).map((d: number) => String(d)),
    alternateDays: Array.isArray(wo.alternateDays)
      ? wo.alternateDays.map((a: { dayOfWeek: number; weekNumbers?: number[] }) => ({
          dayOfWeek: a.dayOfWeek,
          weekNumbers: [...(a.weekNumbers || [])],
        }))
      : [],
    effectiveDate: eff,
  };
}

/**
 * Weekly Off Configuration Page
 * BRD: BR-P1-002 - Attendance Enhancements
 */
export default function WeeklyOffPage() {
  const { isAuthenticated, hasPermission, hasRole } = useAuth();
  const [weeklyOffs, setWeeklyOffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mastersLoading, setMastersLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    applyScope: 'GLOBAL' as ApplyScope,
    scopeDepartment: '',
    scopeLocationId: '',
    scopeEmployeeId: '',
    offType: 'FIXED',
    fixedDays: [] as string[],
    alternateDays: [] as { dayOfWeek: number; weekNumbers: number[] }[],
    effectiveDate: '',
  });

  const loadWeeklyOffs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getWeeklyOff();
      if (res.success && res.data) {
        const raw = res.data as unknown;
        const list = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown[] }).data)
            ? (raw as { data: unknown[] }).data
            : [];
        setWeeklyOffs(list as any[]);
      } else {
        toast.error((res as { message?: string }).message || 'Could not load weekly off list');
      }
    } catch {
      toast.error('Error loading weekly off configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWeeklyOffs();
  }, [loadWeeklyOffs]);

  const loadMasters = useCallback(async () => {
    setMastersLoading(true);
    try {
      const [deptRes, locRes, empRes] = await Promise.all([
        apiService.getDepartments(),
        apiService.getActiveLocations(),
        apiService.getEmployees({ status: 'Active' }),
      ]);
      if (deptRes.success && deptRes.data) {
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      }
      if (locRes.success && locRes.data) {
        const raw = locRes.data as unknown;
        const list = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown[] }).data)
            ? (raw as { data: unknown[] }).data
            : [];
        setLocations(list as any[]);
      }
      if (empRes.success && empRes.data) {
        const raw = empRes.data as unknown;
        const list = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown[] }).data)
            ? (raw as { data: unknown[] }).data
            : [];
        setEmployees(list as any[]);
      }
    } catch {
      toast.error('Failed to load departments / locations / employees');
    } finally {
      setMastersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      void loadMasters();
    }
  }, [dialogOpen, loadMasters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.applyScope === 'DEPARTMENT' && !formData.scopeDepartment.trim()) {
      toast.error('Select a department');
      return;
    }
    if (formData.applyScope === 'LOCATION' && !formData.scopeLocationId) {
      toast.error('Select a location');
      return;
    }
    if (formData.applyScope === 'EMPLOYEE' && !formData.scopeEmployeeId) {
      toast.error('Select an employee');
      return;
    }

    const eff = formData.effectiveDate || new Date().toISOString().split('T')[0];

    const body: Record<string, unknown> = {
      offType: formData.offType,
      effectiveDate: eff,
    };

    if (formData.offType === 'FIXED') {
      body.fixedDays = formData.fixedDays.map((d) => parseInt(d, 10));
      body.alternateDays = formData.alternateDays;
    } else {
      body.rotatingPattern = {
        daysPerWeek: 2,
        rotationCycle: 7,
        startDate: eff,
      };
    }

    if (formData.applyScope === 'GLOBAL') {
      body.department = TENANT_WIDE_DEPARTMENT;
    } else if (formData.applyScope === 'DEPARTMENT') {
      body.department = formData.scopeDepartment.trim();
    } else if (formData.applyScope === 'LOCATION') {
      body.location = formData.scopeLocationId;
    } else {
      body.employeeId = formData.scopeEmployeeId;
    }

    const res = editingId
      ? await apiService.updateWeeklyOff(editingId, body)
      : await apiService.createWeeklyOff(body);
    if (!res.success) {
      toast.error((res as { message?: string }).message || 'Failed to save configuration');
      return;
    }
    toast.success(editingId ? 'Weekly off updated' : 'Weekly off configuration saved');
    setDialogOpen(false);
    setEditingId(null);
    resetForm();
    void loadWeeklyOffs();
  };

  const handleOpenEdit = (wo: any) => {
    const id = wo._id != null ? String(wo._id) : '';
    if (!id) return;
    setEditingId(id);
    setFormData(weeklyOffToFormState(wo));
    setDialogOpen(true);
  };

  const handleDelete = async (wo: any) => {
    const id = wo._id != null ? String(wo._id) : '';
    if (!id) return;
    if (
      !confirm(
        'Deactivate this weekly off rule? It will stop applying from today (existing attendance is unchanged).',
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await apiService.deleteWeeklyOff(id);
      if (!res.success) {
        toast.error((res as { message?: string }).message || 'Failed to delete');
        return;
      }
      toast.success('Weekly off configuration removed');
      void loadWeeklyOffs();
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      applyScope: 'GLOBAL',
      scopeDepartment: '',
      scopeLocationId: '',
      scopeEmployeeId: '',
      offType: 'FIXED',
      fixedDays: [],
      alternateDays: [],
      effectiveDate: new Date().toISOString().split('T')[0],
    });
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekOccurrences = [
    { value: 1, label: '1st' },
    { value: 2, label: '2nd' },
    { value: 3, label: '3rd' },
    { value: 4, label: '4th' },
    { value: 5, label: '5th' },
  ];

  const scopeLabel = (wo: any) => {
    if (wo.employeeId) {
      const e = wo.employeeId;
      return `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Employee';
    }
    if (wo.department === TENANT_WIDE_DEPARTMENT) return 'Entire organization';
    if (wo.department) return wo.department;
    if (wo.location) {
      const loc = locations.find((l) => String(l._id || l.id) === String(wo.location));
      return loc?.name ? `${loc.name}` : String(wo.location);
    }
    return '—';
  };

  if (!isAuthenticated) {
    redirect('/login');
  }
  if (
    !hasPermission('manage_employees') &&
    !hasPermission('configure_system') &&
    !hasRole('Tenant Admin') &&
    !hasRole('HR Administrator')
  ) {
    redirect('/dashboard');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Weekly Off Configuration</h1>
            <p className="text-muted-foreground mt-1">
              Configure weekly off days for employees/departments (BR-P1-002)
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              resetForm();
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Configure Weekly Off
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Off Configurations
            </CardTitle>
            <CardDescription>Manage weekly off schedules</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : weeklyOffs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No weekly off configurations. Create your first configuration.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applies to</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Off Days</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyOffs.map((wo) => (
                    <TableRow key={wo._id}>
                      <TableCell>{scopeLabel(wo)}</TableCell>
                      <TableCell>
                        <Badge>{wo.offType}</Badge>
                      </TableCell>
                      <TableCell>
                        {wo.fixedDays?.length > 0
                          ? wo.fixedDays.map((d: number) => daysOfWeek[d]).join(', ')
                          : ''}
                        {wo.alternateDays?.length > 0 && (
                          <span className="text-xs ml-2 text-muted-foreground whitespace-nowrap">
                            | Alt:{' '}
                            {wo.alternateDays
                              .map((a: any) => `${daysOfWeek[a.dayOfWeek]} (${a.weekNumbers.join(', ')})`)
                              .join(', ')}
                          </span>
                        )}
                        {!wo.fixedDays?.length && !wo.alternateDays?.length && wo.rotatingPattern
                          ? 'Rotating'
                          : ''}
                        {!wo.fixedDays?.length && !wo.alternateDays?.length && !wo.rotatingPattern
                          ? '-'
                          : ''}
                      </TableCell>
                      <TableCell>{formatDateDDMMYYYY(wo.effectiveDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Edit"
                            onClick={() => handleOpenEdit(wo)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Remove"
                            disabled={deletingId === String(wo._id)}
                            onClick={() => void handleDelete(wo)}
                          >
                            {deletingId === String(wo._id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingId(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit weekly off' : 'Configure weekly off'}</DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'Update scope, off days, or effective date. Saving applies this rule and deactivates any other active rule for the same scope (except this one).'
                  : 'Set weekly off for the whole organization, a department, a location, or one employee. Alternate rules use calendar weeks (e.g. 2nd &amp; 4th Saturday).'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div className="space-y-2">
                <Label>Apply to *</Label>
                <Select
                  value={formData.applyScope}
                  onValueChange={(value: ApplyScope) =>
                    setFormData({
                      ...formData,
                      applyScope: value,
                      scopeDepartment: '',
                      scopeLocationId: '',
                      scopeEmployeeId: '',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GLOBAL">Entire organization</SelectItem>
                    <SelectItem value="DEPARTMENT">Department</SelectItem>
                    <SelectItem value="LOCATION">Location</SelectItem>
                    <SelectItem value="EMPLOYEE">Specific employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.applyScope === 'DEPARTMENT' && (
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select
                    value={formData.scopeDepartment || undefined}
                    onValueChange={(value) => setFormData({ ...formData, scopeDepartment: value })}
                    disabled={mastersLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={mastersLoading ? 'Loading…' : 'Select department'} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept._id || dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.applyScope === 'LOCATION' && (
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Select
                    value={formData.scopeLocationId || undefined}
                    onValueChange={(value) => setFormData({ ...formData, scopeLocationId: value })}
                    disabled={mastersLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={mastersLoading ? 'Loading…' : 'Select location'} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc: any) => (
                        <SelectItem key={loc._id || loc.id} value={String(loc._id || loc.id)}>
                          {loc.name}
                          {loc.state ? ` (${loc.state})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.applyScope === 'EMPLOYEE' && (
                <div className="space-y-2">
                  <Label>Employee *</Label>
                  <Select
                    value={formData.scopeEmployeeId || undefined}
                    onValueChange={(value) => setFormData({ ...formData, scopeEmployeeId: value })}
                    disabled={mastersLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={mastersLoading ? 'Loading…' : 'Select employee'} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp: any) => {
                        const id = String(emp._id || emp.id);
                        return (
                          <SelectItem key={id} value={id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeCode || id})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Off type *</Label>
                <Select
                  value={formData.offType}
                  onValueChange={(value) => setFormData({ ...formData, offType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Fixed / alternate (e.g. 2nd &amp; 4th Saturday)</SelectItem>
                    <SelectItem value="ROTATING">Rotating (2 days off per 7-day cycle)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.offType === 'ROTATING' && (
                <p className="text-sm text-muted-foreground rounded-md border bg-muted/30 p-3">
                  Uses two off days in each 7-day rotation starting on the effective date. Adjust later if you
                  need a different pattern in the API/model.
                </p>
              )}

              {formData.offType === 'FIXED' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-semibold text-base">Fixed off days (every week)</Label>
                    <p className="text-xs text-muted-foreground">Optional if you only use alternate Saturdays below.</p>
                    <div className="grid grid-cols-2 gap-2 bg-muted/30 p-3 rounded-md border">
                      {daysOfWeek.map((day, index) => (
                        <label key={`fixed-${day}`} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.fixedDays.includes(index.toString())}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  fixedDays: [...formData.fixedDays, index.toString()],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  fixedDays: formData.fixedDays.filter((d) => d !== index.toString()),
                                });
                              }
                            }}
                          />
                          <span>{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-base">Alternate off (e.g. 2nd &amp; 4th Saturday)</Label>
                    <div className="space-y-3 bg-muted/30 p-3 rounded-md border">
                      {daysOfWeek.map((day, dayIndex) => {
                        const currentAlt =
                          formData.alternateDays.find((a) => a.dayOfWeek === dayIndex) || {
                            dayOfWeek: dayIndex,
                            weekNumbers: [],
                          };
                        return (
                          <div
                            key={`alt-${day}`}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 py-1 border-b last:border-0 border-muted"
                          >
                            <span className="w-28 font-medium shrink-0">{day}</span>
                            <div className="flex flex-wrap gap-2">
                              {weekOccurrences.map((occ) => (
                                <label
                                  key={`${day}-${occ.value}`}
                                  className="flex items-center space-x-1 text-sm bg-background px-2 py-1 rounded border cursor-pointer hover:bg-muted/50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={currentAlt.weekNumbers.includes(occ.value)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      let newAlternateDays = [...formData.alternateDays];
                                      let altObjIndex = newAlternateDays.findIndex((a) => a.dayOfWeek === dayIndex);

                                      if (checked) {
                                        if (altObjIndex >= 0) {
                                          newAlternateDays[altObjIndex].weekNumbers.push(occ.value);
                                          newAlternateDays[altObjIndex].weekNumbers = [
                                            ...new Set(newAlternateDays[altObjIndex].weekNumbers),
                                          ].sort((a, b) => a - b);
                                        } else {
                                          newAlternateDays.push({ dayOfWeek: dayIndex, weekNumbers: [occ.value] });
                                        }
                                      } else if (altObjIndex >= 0) {
                                        newAlternateDays[altObjIndex].weekNumbers = newAlternateDays[
                                          altObjIndex
                                        ].weekNumbers.filter((n) => n !== occ.value);
                                        if (newAlternateDays[altObjIndex].weekNumbers.length === 0) {
                                          newAlternateDays.splice(altObjIndex, 1);
                                        }
                                      }

                                      setFormData({ ...formData, alternateDays: newAlternateDays });
                                    }}
                                  />
                                  <span>{occ.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Effective date *</Label>
                <Input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingId(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingId ? 'Update' : 'Save'} configuration</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
