'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function AssignTrainingPage() {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, employeesRes] = await Promise.all([
        apiService.getCourses({}),
        apiService.getEmployees({}),
      ]);
      if (coursesRes.success && coursesRes.data) {
        const c = coursesRes.data;
        setCourses(Array.isArray(c) ? c : (c as any).data || []);
      }
      if (employeesRes.success && employeesRes.data) {
        const e = employeesRes.data;
        setEmployees(Array.isArray(e) ? e : (e as any).data || []);
      }
    } catch (error: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || selectedEmployees.length === 0 || !dueDate) {
      toast.error('Please select course, employees and due date');
      return;
    }
    try {
      setSubmitting(true);
      const res = await apiService.assignTraining({
        courseId: selectedCourse,
        employeeIds: selectedEmployees,
        dueDate,
        trainingEndDate: dueDate,
      });
      if (res.success) {
        toast.success('Training assigned successfully');
        setSelectedCourse('');
        setSelectedEmployees([]);
        setDueDate('');
      } else {
        toast.error(res.message || 'Failed to assign');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Assign Training</h1>
          <p className="text-muted-foreground">Assign courses to employees</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Assign Course
            </CardTitle>
            <CardDescription>Select a course and employees to assign</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <Label>Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c: any) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.courseName} ({c.courseCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Employees</Label>
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                  {employees.map((emp: any) => (
                    <label
                      key={emp._id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp._id)}
                        onChange={() => toggleEmployee(emp._id)}
                      />
                      <span>
                        {emp.firstName} {emp.lastName} ({emp.employeeCode})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Assign Training
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
