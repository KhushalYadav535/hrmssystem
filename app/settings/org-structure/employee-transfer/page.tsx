'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Loader2, ArrowRight, Users } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

/**
 * Employee Transfer Page
 * BR-ORG-02: Transfer is a history event with effective date
 * BR-ORG-03: Employee can have one primary branch, temporary posting in multiple branches also possible
 */
export default function EmployeeTransferPage() {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    toUnitId: '',
    transferType: 'Permanent' as 'Permanent' | 'Temporary' | 'Deputation',
    effectiveDate: '',
    reason: '',
    remarks: '',
    isTemporary: false,
    temporaryEndDate: '',
  });
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  /** Controlled search text; must not be derived only from employeeId or typed input never shows. */
  const [employeeSearchInput, setEmployeeSearchInput] = useState('');

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    if (form.employeeId) {
      loadEmployeeDetails(form.employeeId);
    }
  }, [form.employeeId]);

  const loadUnits = async () => {
    try {
      const response = await apiService.getOrganizationUnits({ type: undefined });
      if (response.success && response.data) {
        setUnits(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load units');
    }
  };

  const loadEmployeeDetails = async (employeeId: string) => {
    try {
      const response = await apiService.getEmployee(employeeId);
      if (response.success && response.data) {
        setSelectedEmployee(response.data);
      }
    } catch (error) {
      console.error('Failed to load employee details');
    }
  };

  const searchEmployees = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setEmployees([]);
      return;
    }
    try {
      const response = await apiService.getEmployees({ search: searchTerm });
      if (response.success && response.data) {
        setEmployees(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to search employees');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.employeeId || !form.toUnitId || !form.effectiveDate) {
      toast.error('Employee, destination unit, and effective date are required');
      return;
    }

    // BR-ORG-04: Cannot transfer to same unit
    if (selectedEmployee?.postingUnitId === form.toUnitId) {
      toast.error('Employee is already posted to this unit');
      return;
    }

    // Validate temporary posting
    if (form.isTemporary && !form.temporaryEndDate) {
      toast.error('Temporary end date is required for temporary postings');
      return;
    }

    if (form.isTemporary && new Date(form.temporaryEndDate) <= new Date(form.effectiveDate)) {
      toast.error('Temporary end date must be after effective date');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.createEmployeeTransfer({
        employeeId: form.employeeId,
        toUnitId: form.toUnitId,
        transferType: form.transferType,
        effectiveDate: form.effectiveDate,
        reason: form.reason,
        remarks: form.remarks,
        isTemporary: form.isTemporary,
        temporaryEndDate: form.isTemporary ? form.temporaryEndDate : undefined,
      });

      if (response.success) {
        toast.success('Transfer request created successfully');
        setForm({
          employeeId: '',
          toUnitId: '',
          transferType: 'Permanent',
          effectiveDate: '',
          reason: '',
          remarks: '',
          isTemporary: false,
          temporaryEndDate: '',
        });
        setSelectedEmployee(null);
        setEmployees([]);
        setEmployeeSearchInput('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create transfer request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Employee Transfer</h1>
          <p className="text-muted-foreground mt-2">
            Transfer employees across organization units (HO/ZO/RO/Branch)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transfer Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Transfer Request</CardTitle>
              <CardDescription>
                BR-ORG-02: Transfer is a history event with effective date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Employee *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or employee code..."
                      value={employeeSearchInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEmployeeSearchInput(value);
                        if (!value) {
                          setForm({ ...form, employeeId: '' });
                          setSelectedEmployee(null);
                          setEmployees([]);
                          return;
                        }
                        const selectedLabel =
                          selectedEmployee && form.employeeId === selectedEmployee._id
                            ? `${selectedEmployee.firstName} ${selectedEmployee.lastName} (${selectedEmployee.employeeCode})`
                            : null;
                        if (selectedLabel && value !== selectedLabel) {
                          setForm({ ...form, employeeId: '' });
                          setSelectedEmployee(null);
                        }
                        searchEmployees(value);
                      }}
                      className="pl-10"
                    />
                    {employees.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {employees.map((emp) => (
                          <div
                            key={emp._id}
                            onClick={() => {
                              setForm({ ...form, employeeId: emp._id });
                              setSelectedEmployee(emp);
                              setEmployees([]);
                              setEmployeeSearchInput(
                                `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`
                              );
                            }}
                            className="p-2 hover:bg-muted cursor-pointer"
                          >
                            {emp.firstName} {emp.lastName} ({emp.employeeCode})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedEmployee && selectedEmployee.postingUnitId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Current posting: {selectedEmployee.postingUnitId?.unitCode || 'N/A'}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Destination Unit *</Label>
                  <Select
                    value={form.toUnitId}
                    onValueChange={(v) => setForm({ ...form, toUnitId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units
                        .filter((u) => u._id !== selectedEmployee?.postingUnitId)
                        .map((unit) => (
                          <SelectItem key={unit._id} value={unit._id}>
                            {unit.unitCode} - {unit.unitName} ({unit.unitType})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Transfer Type *</Label>
                    <Select
                      value={form.transferType}
                      onValueChange={(v: 'Permanent' | 'Temporary' | 'Deputation') => setForm({ ...form, transferType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Permanent">Permanent</SelectItem>
                        <SelectItem value="Temporary">Temporary</SelectItem>
                        <SelectItem value="Deputation">Deputation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Effective Date *</Label>
                    <Input
                      type="date"
                      value={form.effectiveDate}
                      onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isTemporary"
                    checked={form.isTemporary}
                    onChange={(e) => setForm({ ...form, isTemporary: e.target.checked })}
                  />
                  <Label htmlFor="isTemporary">Temporary Posting</Label>
                </div>

                {form.isTemporary && (
                  <div>
                    <Label>Temporary End Date *</Label>
                    <Input
                      type="date"
                      value={form.temporaryEndDate}
                      onChange={(e) => setForm({ ...form, temporaryEndDate: e.target.value })}
                      min={form.effectiveDate || new Date().toISOString().split('T')[0]}
                      required={form.isTemporary}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      BR-ORG-03: Temporary posting allows multiple branch assignments
                    </p>
                  </div>
                )}

                <div>
                  <Label>Reason</Label>
                  <Textarea
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Reason for transfer"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Remarks</Label>
                  <Textarea
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    placeholder="Additional remarks"
                    rows={2}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Transfer Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Current Posting Info */}
          {selectedEmployee && (
            <Card>
              <CardHeader>
                <CardTitle>Current Posting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Employee</Label>
                  <p className="font-medium">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.employeeCode}</p>
                </div>
                {selectedEmployee.postingUnitId && (
                  <div>
                    <Label className="text-muted-foreground">Current Unit</Label>
                    <p className="font-medium">
                      {typeof selectedEmployee.postingUnitId === 'object'
                        ? `${selectedEmployee.postingUnitId.unitCode} - ${selectedEmployee.postingUnitId.unitName}`
                        : 'Loading...'}
                    </p>
                  </div>
                )}
                {selectedEmployee.department && (
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p className="font-medium">{selectedEmployee.department}</p>
                  </div>
                )}
                {selectedEmployee.designation && (
                  <div>
                    <Label className="text-muted-foreground">Designation</Label>
                    <p className="font-medium">
                      {typeof selectedEmployee.designation === 'object'
                        ? selectedEmployee.designation.name
                        : selectedEmployee.designation}
                    </p>
                  </div>
                )}
                {selectedEmployee.transferHistory && selectedEmployee.transferHistory.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Transfer History</Label>
                    <div className="space-y-2 mt-2">
                      {selectedEmployee.transferHistory.slice(0, 5).map((transfer: any, idx: number) => (
                        <div key={idx} className="text-sm p-2 bg-muted rounded">
                          <p className="font-medium">
                            {formatDateDDMMYYYY(transfer.effectiveDate)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transfer.transferType} transfer
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
