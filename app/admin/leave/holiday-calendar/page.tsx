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
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

/**
 * Holiday Calendar Page
 * BRD: BR-P1-003 - Leave Management Enhancements
 */
export default function HolidayCalendarPage() {
  const { currentUser } = useAuth();
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    holidayName: '',
    holidayDate: '',
    holidayType: 'NATIONAL',
    location: '',
    applicableTo: 'ALL',
    isOptional: false,
    description: '',
  });

  useEffect(() => {
    loadHolidays();
  }, [selectedYear]);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const res = await apiService.getHolidayCalendar({ year: selectedYear });
      if (res.success && res.data) {
        setHolidays(res.data);
      }
    } catch (error: any) {
      toast.error('Error loading holiday calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHoliday) {
        await apiService.updateHoliday(editingHoliday._id, formData);
        toast.success('Holiday updated successfully');
      } else {
        await apiService.createHoliday(formData);
        toast.success('Holiday added successfully');
      }
      setDialogOpen(false);
      resetForm();
      loadHolidays();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save holiday');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;
    
    try {
      await apiService.deleteHoliday(id);
      toast.success('Holiday deleted successfully');
      loadHolidays();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete holiday');
    }
  };

  const resetForm = () => {
    setEditingHoliday(null);
    setFormData({
      holidayName: '',
      holidayDate: '',
      holidayType: 'NATIONAL',
      location: '',
      applicableTo: 'ALL',
      isOptional: false,
      description: '',
    });
  };

  const handleEdit = (holiday: any) => {
    setEditingHoliday(holiday);
    setFormData({
      holidayName: holiday.holidayName,
      holidayDate: holiday.holidayDate.split('T')[0],
      holidayType: holiday.holidayType,
      location: holiday.location || '',
      applicableTo: holiday.applicableTo || 'ALL',
      isOptional: holiday.isOptional || false,
      description: holiday.description || '',
    });
    setDialogOpen(true);
  };

  const getHolidayTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      NATIONAL: 'default',
      STATE: 'secondary',
      REGIONAL: 'outline',
      BANK: 'destructive',
    };
    return <Badge variant={colors[type] as any}>{type}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Holiday Calendar</h1>
            <p className="text-muted-foreground mt-1">
              Manage organization holidays (BR-P1-003)
            </p>
          </div>
          <div className="flex gap-4">
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Holiday
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Holidays for {selectedYear}</CardTitle>
            <CardDescription>All declared holidays</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : holidays.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No holidays configured for {selectedYear}. Add your first holiday.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Holiday Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Optional</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map((holiday) => (
                    <TableRow key={holiday._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {format(new Date(holiday.holidayDate), 'dd MMM yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{holiday.holidayName}</TableCell>
                      <TableCell>{getHolidayTypeBadge(holiday.holidayType)}</TableCell>
                      <TableCell>{holiday.location || 'All Locations'}</TableCell>
                      <TableCell>
                        {holiday.isOptional ? (
                          <Badge variant="outline">Optional</Badge>
                        ) : (
                          <Badge>Mandatory</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(holiday)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(holiday._id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
              <DialogDescription>
                Configure holiday details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Holiday Name *</Label>
                <Input
                  value={formData.holidayName}
                  onChange={(e) => setFormData({ ...formData, holidayName: e.target.value })}
                  required
                  placeholder="e.g., Republic Day"
                />
              </div>
              <div className="space-y-2">
                <Label>Holiday Date *</Label>
                <Input
                  type="date"
                  value={formData.holidayDate}
                  onChange={(e) => setFormData({ ...formData, holidayDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Holiday Type *</Label>
                  <Select
                    value={formData.holidayType}
                    onValueChange={(value) => setFormData({ ...formData, holidayType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NATIONAL">National</SelectItem>
                      <SelectItem value="STATE">State</SelectItem>
                      <SelectItem value="REGIONAL">Regional</SelectItem>
                      <SelectItem value="BANK">Bank Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Leave empty for all locations"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">{editingHoliday ? 'Update' : 'Add'} Holiday</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
