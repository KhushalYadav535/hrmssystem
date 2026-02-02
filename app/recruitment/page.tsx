'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import apiService from '@/lib/api';
import { Briefcase, Plus, Users, TrendingUp, Edit2, Trash2, Eye, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Job {
  _id?: string;
  id?: string;
  title: string;
  department: string;
  status: 'Open' | 'Closed' | 'On Hold';
  openPositions: number;
  applications?: number;
  description?: string;
  location?: string;
  salaryRange?: string;
  postedDate?: string;
}

export default function RecruitmentPage() {
  const { isAuthenticated, hasPermission, currentTenant } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showApplicationsDialog, setShowApplicationsDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    department: '',
    status: 'Open',
    openPositions: 1,
    description: '',
    location: '',
    salaryRange: '',
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getJobs();
      if (response.success && response.data) {
        setJobs(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !hasPermission('manage_employees')) {
    redirect('/dashboard');
  }

  const openPositions = jobs.filter((j) => j.status === 'Open');
  const totalApplications = jobs.reduce((sum, j) => sum + (j.applications || 0), 0);

  const handleCreateJob = async () => {
    if (!formData.title || !formData.department) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      const response = await apiService.createJob({
        title: formData.title!,
        department: formData.department!,
        status: formData.status || 'Open',
        openPositions: formData.openPositions || 1,
        description: formData.description,
        location: formData.location,
        salaryRange: formData.salaryRange,
      });
      if (response.success) {
        toast.success('Job posted successfully!');
        setShowCreateDialog(false);
        setFormData({ title: '', department: '', status: 'Open', openPositions: 1 });
        loadJobs();
      } else {
        toast.error(response.message || 'Failed to create job');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create job');
    }
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      status: job.status,
      openPositions: job.openPositions,
      description: job.description,
      location: job.location,
      salaryRange: job.salaryRange,
    });
    setShowEditDialog(true);
  };

  const handleUpdateJob = async () => {
    if (!selectedJob || !formData.title || !formData.department) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      const jobId = selectedJob._id || selectedJob.id;
      if (!jobId) return;
      
      const response = await apiService.updateJob(jobId, formData);
      if (response.success) {
        toast.success('Job updated successfully!');
        setShowEditDialog(false);
        setSelectedJob(null);
        loadJobs();
      } else {
        toast.error(response.message || 'Failed to update job');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update job');
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      try {
        const response = await apiService.deleteJob(id);
        if (response.success) {
          toast.success('Job deleted successfully!');
          loadJobs();
        } else {
          toast.error(response.message || 'Failed to delete job');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete job');
      }
    }
  };

  const handleViewApplications = (job: Job) => {
    setSelectedJob(job);
    setShowApplicationsDialog(true);
    // Load applications for this job
    // For now, we'll use mock data structure
    setApplications([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Recruitment Management</h1>
            <p className="text-muted-foreground mt-2">Manage job openings and candidates</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post New Job</DialogTitle>
                <DialogDescription>Create a new job posting</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Input
                      placeholder="e.g., IT"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Open Positions</Label>
                    <Input
                      type="number"
                      value={formData.openPositions}
                      onChange={(e) => setFormData({ ...formData, openPositions: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="e.g., Mumbai"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Salary Range</Label>
                  <Input
                    placeholder="e.g., ₹8-12 LPA"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job Description</Label>
                  <Textarea
                    placeholder="Enter job description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button onClick={handleCreateJob} className="w-full">Post Job</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Recruitment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Positions</p>
                  <p className="text-2xl font-bold">{openPositions.length}</p>
                </div>
                <Briefcase className="w-10 h-10 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{totalApplications}</p>
                </div>
                <Users className="w-10 h-10 text-accent/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Applications</p>
                  <p className="text-2xl font-bold">{jobs.length > 0 ? (totalApplications / jobs.length).toFixed(1) : 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Per position</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Openings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Job Openings</CardTitle>
            <CardDescription>{jobs.length} active and inactive positions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No jobs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const jobId = job._id || job.id || '';
                  return (
                    <div key={jobId} className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.department}</p>
                        </div>
                        <Badge className={job.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {job.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Open Positions</p>
                          <p className="text-lg font-bold">{job.openPositions}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Applications</p>
                          <p className="text-lg font-bold">{job.applications || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Posted Date</p>
                          <p className="text-sm">{job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewApplications(job)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View Applications ({job.applications || 0})
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditJob(job)}>
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit Job
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast.info('Interview scheduling feature coming soon!')}>
                          <Calendar className="w-4 h-4 mr-1" />
                          Schedule Interview
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteJob(jobId)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Pipeline */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Application Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { stage: 'Applied', count: 0, color: 'bg-blue-100 text-blue-700' },
                { stage: 'Screened', count: 0, color: 'bg-purple-100 text-purple-700' },
                { stage: 'Interviewed', count: 0, color: 'bg-yellow-100 text-yellow-700' },
                { stage: 'Offered', count: 0, color: 'bg-green-100 text-green-700' },
              ].map((stage) => (
                <Card key={stage.stage} className="border-0 shadow-sm bg-secondary/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">{stage.stage}</p>
                    <p className="text-3xl font-bold mb-2">{stage.count}</p>
                    <Badge className={stage.color}>Active</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Job Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>Update job posting details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Open Positions</Label>
                  <Input
                    type="number"
                    value={formData.openPositions}
                    onChange={(e) => setFormData({ ...formData, openPositions: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Salary Range</Label>
                <Input
                  value={formData.salaryRange}
                  onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Job Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <Button onClick={handleUpdateJob} className="w-full">Update Job</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Applications Dialog */}
        <Dialog open={showApplicationsDialog} onOpenChange={setShowApplicationsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Applications for {selectedJob?.title}</DialogTitle>
              <DialogDescription>{applications.length} applications received</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {applications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No applications yet</p>
              ) : (
                applications.map((app) => (
                  <Card key={app.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{app.candidateName}</h4>
                          <p className="text-sm text-muted-foreground">{app.email} • {app.phone}</p>
                          <p className="text-xs text-muted-foreground mt-1">Applied on {app.appliedDate}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge>{app.status}</Badge>
                          <Select
                            value={app.status}
                            onValueChange={(value) => {
                              applicationService.updateStatus(app.id, value as any);
                              setShowApplicationsDialog(false);
                              setTimeout(() => setShowApplicationsDialog(true), 100);
                              toast.success('Application status updated!');
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Applied">Applied</SelectItem>
                              <SelectItem value="Screened">Screened</SelectItem>
                              <SelectItem value="Interviewed">Interviewed</SelectItem>
                              <SelectItem value="Offered">Offered</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
