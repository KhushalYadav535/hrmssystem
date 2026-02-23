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
import { Plus, Calendar, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

/**
 * Weekly Off Configuration Page
 * BRD: BR-P1-002 - Attendance Enhancements
 */
export default function WeeklyOffPage() {
  const { currentUser } = useAuth();
  const [weeklyOffs, setWeeklyOffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    department: '',
    location: '',
    offType: 'FIXED',
    fixedDays: [] as string[],
    rotatingPattern: '',
    effectiveDate: '',
  });

  useEffect(() => {
    loadWeeklyOffs();
  }, []);

  const loadWeeklyOffs = async () => {
    try {
      setLoading(true);
      const res = await apiService.getWeeklyOff();
      if (res.success && res.data) {
        setWeeklyOffs(res.data);
      }
    } catch (error: any) {
      toast.error('Error loading weekly off configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createWeeklyOff(formData);
      toast.success('Weekly off configuration saved');
      setDialogOpen(false);
      resetForm();
      loadWeeklyOffs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save configuration');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      department: '',
      location: '',
      offType: 'FIXED',
      fixedDays: [],
      rotatingPattern: '',
      effectiveDate: new Date().toISOString().split('T')[0],
    });
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Configure Weekly Off
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Off Configurations</CardTitle>
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
                    <TableHead>Employee/Department</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Off Days</TableHead>
                    <TableHead>Effective Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyOffs.map((wo) => (
                    <TableRow key={wo._id}>
                      <TableCell>
                        {wo.employeeId
                          ? `${wo.employeeId.firstName} ${wo.employeeId.lastName}`
                          : wo.department || wo.location || 'All'}
                      </TableCell>
                      <TableCell>
                        <Badge>{wo.offType}</Badge>
                      </TableCell>
                      <TableCell>
                        {wo.fixedDays?.join(', ') || wo.rotatingPattern || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(wo.effectiveDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure Weekly Off</DialogTitle>
              <DialogDescription>
                Set weekly off days for employee, department, or location
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Apply To</Label>
                <Select
                  value={formData.employeeId ? 'employee' : formData.department ? 'department' : formData.location ? 'location' : ''}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      employeeId: '',
                      department: '',
                      location: '',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Specific Employee</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Off Type</Label>
                <Select
                  value={formData.offType}
                  onValueChange={(value) => setFormData({ ...formData, offType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Fixed Days</SelectItem>
                    <SelectItem value="ROTATING">Rotating Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.offType === 'FIXED' && (
                <div className="space-y-2">
                  <Label>Select Off Days</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map((day) => (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.fixedDays.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                fixedDays: [...formData.fixedDays, day],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                fixedDays: formData.fixedDays.filter((d) => d !== day),
                              });
                            }
                          }}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">Save Configuration</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
