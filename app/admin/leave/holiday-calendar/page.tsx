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
  const [editingHolidayIndex, setEditingHolidayIndex] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [holidayCalendarId, setHolidayCalendarId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    type: 'NATIONAL',
    applicableLocations: [] as string[],
    isOptional: false,
  });

  useEffect(() => {
    loadHolidays();
  }, [selectedYear]);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const res = await apiService.getHolidayCalendar({ year: selectedYear });
      if (res.success && res.data) {
        // Handle array of calendars from the response
        if (Array.isArray(res.data)) {
          const currentYearCalendar = res.data.find((cal: any) => cal.year === selectedYear);
          if (currentYearCalendar) {
            setHolidayCalendarId(currentYearCalendar._id);
            setHolidays(currentYearCalendar.holidays || []);
          } else {
            setHolidayCalendarId(null);
            setHolidays([]);
          }
        } else {
          // Handle single calendar object
          setHolidayCalendarId(res.data._id);
          setHolidays(res.data.holidays || []);
        }
      }
    } catch (error: any) {
      toast.error('Error loading holiday calendar');
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.date || !formData.name) {
        toast.error('Date and name are required');
        return;
      }

      if (editingHolidayIndex !== null) {
        // Update existing holiday
        if (!holidayCalendarId) {
          toast.error('Holiday calendar not found');
          return;
        }
        const updatedHolidays = [...holidays];
        updatedHolidays[editingHolidayIndex] = {
          ...formData,
          date: new Date(formData.date),
        };
        await apiService.updateHoliday(holidayCalendarId, {
          year: selectedYear,
          holidays: updatedHolidays,
        });
        toast.success('Holiday updated successfully');
      } else {
        // Create new holiday calendar or add to existing
        if (holidayCalendarId) {
          // Add to existing calendar
          const updatedHolidays = [...holidays, {
            ...formData,
            date: new Date(formData.date),
          }];
          await apiService.updateHoliday(holidayCalendarId, {
            year: selectedYear,
            holidays: updatedHolidays,
          });
          toast.success('Holiday added successfully');
        } else {
          // Create new holiday calendar
          await apiService.createHoliday({
            year: selectedYear,
            holidays: [{
              ...formData,
              date: new Date(formData.date),
            }],
          });
          toast.success('Holiday calendar created successfully');
        }
      }
      setDialogOpen(false);
      resetForm();
      loadHolidays();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save holiday');
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;
    
    try {
      if (!holidayCalendarId) {
        toast.error('Holiday calendar not found');
        return;
      }
      
      const updatedHolidays = holidays.filter((_, i) => i !== index);
      
      if (updatedHolidays.length === 0) {
        // Delete entire calendar if no holidays left
        await apiService.deleteHoliday(holidayCalendarId);
        toast.success('Holiday calendar deleted successfully');
      } else {
        await apiService.updateHoliday(holidayCalendarId, {
          year: selectedYear,
          holidays: updatedHolidays,
        });
        toast.success('Holiday deleted successfully');
      }
      loadHolidays();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete holiday');
    }
  };

  const resetForm = () => {
    setEditingHolidayIndex(null);
    setFormData({
      date: '',
      name: '',
      type: 'NATIONAL',
      applicableLocations: [],
      isOptional: false,
    });
  };

  const handleEdit = (index: number, holiday: any) => {
    setEditingHolidayIndex(index);
    setFormData({
      date: holiday.date ? new Date(holiday.date).toISOString().split('T')[0] : '',
      name: holiday.name,
      type: holiday.type || 'NATIONAL',
      applicableLocations: holiday.applicableLocations || [],
      isOptional: holiday.isOptional || false,
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
                  {holidays.map((holiday, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {format(new Date(holiday.date), 'dd MMM yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{holiday.name}</TableCell>
                      <TableCell>{getHolidayTypeBadge(holiday.type)}</TableCell>
                      <TableCell>{holiday.applicableLocations?.length > 0 ? holiday.applicableLocations.join(', ') : 'All Locations'}</TableCell>
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
                            onClick={() => handleEdit(index, holiday)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(index)}
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
              <DialogTitle>{editingHolidayIndex !== null ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
              <DialogDescription>
                Configure holiday details for {selectedYear}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Holiday Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Republic Day"
                />
              </div>
              <div className="space-y-2">
                <Label>Holiday Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Holiday Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NATIONAL">National</SelectItem>
                      <SelectItem value="STATE">State</SelectItem>
                      <SelectItem value="REGIONAL">Regional</SelectItem>
                      <SelectItem value="BANK">Bank Holiday</SelectItem>
                      <SelectItem value="OPTIONAL">Optional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Optional Holiday</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={formData.isOptional}
                      onChange={(e) => setFormData({ ...formData, isOptional: e.target.checked })}
                      id="optional"
                      className="rounded"
                    />
                    <Label htmlFor="optional" className="text-sm font-normal">Mark as optional</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">{editingHolidayIndex !== null ? 'Update' : 'Add'} Holiday</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
