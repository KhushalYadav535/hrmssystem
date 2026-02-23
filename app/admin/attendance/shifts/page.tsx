'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
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
import { Plus, Edit, Clock, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

/**
 * Shift Management Admin Page
 * BRD: BR-P1-002 - Attendance Enhancements
 */
export default function ShiftManagementPage() {
  const { currentUser } = useAuth();
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [formData, setFormData] = useState({
    shiftCode: '',
    shiftName: '',
    shiftType: 'GENERAL',
    startTime: '09:00',
    endTime: '17:00',
    gracePeriod: 15,
    halfDayCutoff: '12:00',
    totalHours: 8,
    breakDuration: 60,
    nightShiftAllowance: 0,
    flexibleShift: false,
    description: '',
  });

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const res = await apiService.getShifts();
      if (res.success && res.data) {
        setShifts(res.data);
      }
    } catch (error: any) {
      toast.error('Error loading shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShift) {
        // Update existing shift
        await apiService.updateShift(editingShift._id, formData);
        toast.success('Shift updated successfully');
      } else {
        // Create new shift
        await apiService.createShift(formData);
        toast.success('Shift created successfully');
      }
      setDialogOpen(false);
      resetForm();
      loadShifts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save shift');
    }
  };

  const resetForm = () => {
    setEditingShift(null);
    setFormData({
      shiftCode: '',
      shiftName: '',
      shiftType: 'GENERAL',
      startTime: '09:00',
      endTime: '17:00',
      gracePeriod: 15,
      halfDayCutoff: '12:00',
      totalHours: 8,
      breakDuration: 60,
      nightShiftAllowance: 0,
      flexibleShift: false,
      description: '',
    });
  };

  const handleEdit = (shift: any) => {
    setEditingShift(shift);
    setFormData({
      shiftCode: shift.shiftCode,
      shiftName: shift.shiftName,
      shiftType: shift.shiftType,
      startTime: shift.startTime,
      endTime: shift.endTime,
      gracePeriod: shift.gracePeriod,
      halfDayCutoff: shift.halfDayCutoff,
      totalHours: shift.totalHours,
      breakDuration: shift.breakDuration,
      nightShiftAllowance: shift.nightShiftAllowance || 0,
      flexibleShift: shift.flexibleShift || false,
      description: shift.description || '',
    });
    setDialogOpen(true);
  };

  const getShiftTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      GENERAL: 'default',
      MORNING: 'secondary',
      EVENING: 'outline',
      NIGHT: 'destructive',
      FLEXIBLE: 'default',
    };
    return <Badge variant={colors[type] as any}>{type}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Shift Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage employee shifts and schedules (BR-P1-002)
            </p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Shift
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Shifts</CardTitle>
            <CardDescription>Manage shift definitions and timings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : shifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No shifts configured. Create your first shift.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shift Code</TableHead>
                    <TableHead>Shift Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Timings</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map((shift) => (
                    <TableRow key={shift._id}>
                      <TableCell className="font-medium">{shift.shiftCode}</TableCell>
                      <TableCell>{shift.shiftName}</TableCell>
                      <TableCell>{getShiftTypeBadge(shift.shiftType)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{shift.startTime} - {shift.endTime}</span>
                        </div>
                      </TableCell>
                      <TableCell>{shift.totalHours} hrs</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(shift)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingShift ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
              <DialogDescription>
                Define shift timings and rules
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shift Code *</Label>
                  <Input
                    value={formData.shiftCode}
                    onChange={(e) => setFormData({ ...formData, shiftCode: e.target.value })}
                    required
                    placeholder="SHIFT-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shift Name *</Label>
                  <Input
                    value={formData.shiftName}
                    onChange={(e) => setFormData({ ...formData, shiftName: e.target.value })}
                    required
                    placeholder="General Shift"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shift Type *</Label>
                  <Select
                    value={formData.shiftType}
                    onValueChange={(value) => setFormData({ ...formData, shiftType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General (9 AM - 5 PM)</SelectItem>
                      <SelectItem value="MORNING">Morning (6 AM - 2 PM)</SelectItem>
                      <SelectItem value="EVENING">Evening (2 PM - 10 PM)</SelectItem>
                      <SelectItem value="NIGHT">Night (10 PM - 6 AM)</SelectItem>
                      <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Total Hours *</Label>
                  <Input
                    type="number"
                    value={formData.totalHours}
                    onChange={(e) => setFormData({ ...formData, totalHours: parseInt(e.target.value) })}
                    required
                    min={1}
                    max={12}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grace Period (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.gracePeriod}
                    onChange={(e) => setFormData({ ...formData, gracePeriod: parseInt(e.target.value) })}
                    min={0}
                    max={60}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Half-Day Cutoff</Label>
                  <Input
                    type="time"
                    value={formData.halfDayCutoff}
                    onChange={(e) => setFormData({ ...formData, halfDayCutoff: e.target.value })}
                  />
                </div>
                {formData.shiftType === 'NIGHT' && (
                  <div className="space-y-2">
                    <Label>Night Shift Allowance (₹)</Label>
                    <Input
                      type="number"
                      value={formData.nightShiftAllowance}
                      onChange={(e) => setFormData({ ...formData, nightShiftAllowance: parseFloat(e.target.value) })}
                      min={0}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Break Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.breakDuration}
                    onChange={(e) => setFormData({ ...formData, breakDuration: parseInt(e.target.value) })}
                    min={0}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingShift ? 'Update' : 'Create'} Shift
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
