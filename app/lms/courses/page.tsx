'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Plus, Search, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function LMSCoursesPage() {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    category: 'TECHNICAL',
    courseType: 'E_LEARNING',
    mode: 'ONLINE',
    duration: 0,
    isMandatory: false,
  });

  useEffect(() => {
    loadCourses();
  }, [search]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await apiService.getCourses({ search: search || undefined });
      if (res.success && res.data) {
        const d = res.data;
        setCourses(Array.isArray(d) ? d : (d as any)?.data || []);
      }
    } catch (error: any) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.duration || formData.duration < 1) {
      toast.error('Duration (hours) is required and must be at least 1');
      return;
    }
    try {
      setCreating(true);
      const res = await apiService.createCourse({
        ...formData,
        duration: Number(formData.duration),
      });
      if (res.success) {
        toast.success('Course created successfully');
        setCreateOpen(false);
        setFormData({ courseCode: '', courseName: '', description: '', category: 'TECHNICAL', courseType: 'E_LEARNING', mode: 'ONLINE', duration: 0, isMandatory: false });
        loadCourses();
      } else {
        toast.error(res.message || 'Failed to create course');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const isAdmin = ['HR Administrator', 'Tenant Admin', 'Super Admin'].includes(currentUser?.role || '');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Course Catalog</h1>
            <p className="text-muted-foreground">Browse and manage training courses</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No courses found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: any) => (
              <Card key={course._id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{course.courseName}</CardTitle>
                    <Badge variant={course.isMandatory ? 'default' : 'secondary'}>
                      {course.isMandatory ? 'Mandatory' : 'Optional'}
                    </Badge>
                  </div>
                  <CardDescription>{course.courseCode}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {course.description || 'No description'}
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{course.category}</span>
                    <span>•</span>
                    <span>{course.courseType}</span>
                    {course.duration && (
                      <>
                        <span>•</span>
                        <span>{course.duration} hrs</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>Create a new training course</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Course Code</Label>
                  <Input
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    placeholder="e.g. COMP-101"
                    required
                  />
                </div>
                <div>
                  <Label>Course Name</Label>
                  <Input
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    placeholder="Course title"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Course description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TECHNICAL">Technical</SelectItem>
                      <SelectItem value="SOFT_SKILLS">Soft Skills</SelectItem>
                      <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                      <SelectItem value="LEADERSHIP">Leadership</SelectItem>
                      <SelectItem value="DOMAIN">Domain</SelectItem>
                      <SelectItem value="CERTIFICATION">Certification</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Course Type</Label>
                  <Select
                    value={formData.courseType}
                    onValueChange={(v) => setFormData({ ...formData, courseType: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="E_LEARNING">E-Learning</SelectItem>
                      <SelectItem value="INTERNAL">Internal</SelectItem>
                      <SelectItem value="EXTERNAL">External</SelectItem>
                      <SelectItem value="BLENDED">Blended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Delivery Mode</Label>
                  <Select
                    value={formData.mode}
                    onValueChange={(v) => setFormData({ ...formData, mode: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="CLASSROOM">Classroom</SelectItem>
                      <SelectItem value="BLENDED">Blended</SelectItem>
                      <SelectItem value="SELF_PACED">Self-Paced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (hours) *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 8"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={formData.isMandatory}
                  onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                />
                <Label htmlFor="mandatory">Mandatory for all employees</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={creating}>
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Course
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
