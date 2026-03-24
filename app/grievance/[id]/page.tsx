'use client';

import { formatDateDDMMYYYY, formatDateTimeFullDDMMYYYY } from '@/lib/date-format';
import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Clock, User, MessageSquare } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

function GrievanceDetailContent() {
  const { currentUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const grievanceId = params.id as string;
  const [grievance, setGrievance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [assignData, setAssignData] = useState({
    assignedTo: '',
    assignedDepartment: '',
    severity: '',
  });
  const [resolutionData, setResolutionData] = useState({
    resolutionDetails: '',
    actionTaken: '',
  });

  useEffect(() => {
    if (grievanceId) {
      loadGrievance();
    }
  }, [grievanceId]);

  const loadGrievance = async () => {
    try {
      setLoading(true);
      const res = await apiService.getGrievance(grievanceId);
      if (res.success && res.data) {
        setGrievance(res.data);
      }
    } catch (error: any) {
      toast.error('Error loading grievance');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      const res = await apiService.addGrievanceComment(grievanceId, comment, isInternal);
      if (res.success) {
        toast.success('Comment added successfully');
        setComment('');
        setIsInternal(false);
        loadGrievance();
      }
    } catch (error: any) {
      toast.error('Failed to add comment');
    }
  };

  const handleAssign = async () => {
    if (!assignData.assignedTo) {
      toast.error('Please select assignee');
      return;
    }

    try {
      const res = await apiService.assignGrievance(grievanceId, assignData);
      if (res.success) {
        toast.success('Grievance assigned successfully');
        loadGrievance();
      }
    } catch (error: any) {
      toast.error('Failed to assign grievance');
    }
  };

  const handleProposeResolution = async () => {
    if (!resolutionData.resolutionDetails || !resolutionData.actionTaken) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const res = await apiService.proposeResolution(grievanceId, resolutionData);
      if (res.success) {
        toast.success('Resolution proposed successfully');
        loadGrievance();
      }
    } catch (error: any) {
      toast.error('Failed to propose resolution');
    }
  };

  const handleApproveResolution = async () => {
    try {
      const res = await apiService.approveResolution(grievanceId);
      if (res.success) {
        toast.success('Resolution approved successfully');
        loadGrievance();
      }
    } catch (error: any) {
      toast.error('Failed to approve resolution');
    }
  };

  const handleSubmitFeedback = async (rating: number, feedback?: string) => {
    try {
      const res = await apiService.submitGrievanceFeedback(grievanceId, rating, feedback);
      if (res.success) {
        toast.success('Feedback submitted successfully');
        loadGrievance();
      }
    } catch (error: any) {
      toast.error('Failed to submit feedback');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!grievance) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6 text-center">
            Grievance not found
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      SUBMITTED: { label: 'Submitted', variant: 'outline' },
      UNDER_REVIEW: { label: 'Under Review', variant: 'secondary' },
      ASSIGNED: { label: 'Assigned', variant: 'secondary' },
      INVESTIGATION: { label: 'Investigation', variant: 'secondary' },
      RESOLUTION_PROPOSED: { label: 'Resolution Proposed', variant: 'default' },
      RESOLVED: { label: 'Resolved', variant: 'default' },
      CLOSED: { label: 'Closed', variant: 'default' },
    };
    const c = config[status] || { label: status, variant: 'outline' };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const isHR = ['HR Administrator', 'Tenant Admin', 'Super Admin'].includes(currentUser?.role || '');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Grievance Details</h1>
            <p className="text-muted-foreground mt-1">
              Grievance ID: {grievance.grievanceId}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(grievance.status)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={
                grievance.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                grievance.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                grievance.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }>
                {grievance.severity}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">SLA Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={
                grievance.slaStatus === 'BREACHED' ? 'bg-red-100 text-red-800' :
                grievance.slaStatus === 'AT_RISK' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }>
                {grievance.slaStatus}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            {isHR && <TabsTrigger value="actions">Actions</TabsTrigger>}
            {grievance.status === 'RESOLVED' && currentUser?.role === 'Employee' && (
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Grievance Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <p className="text-sm mt-1">{grievance.subject}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm mt-1">{grievance.category.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{grievance.description}</p>
                </div>
                {grievance.incidentDate && (
                  <div>
                    <Label className="text-sm font-medium">Incident Date</Label>
                    <p className="text-sm mt-1">{formatDateDDMMYYYY(grievance.incidentDate)}</p>
                  </div>
                )}
                {grievance.preferredResolution && (
                  <div>
                    <Label className="text-sm font-medium">Preferred Resolution</Label>
                    <p className="text-sm mt-1">{grievance.preferredResolution}</p>
                  </div>
                )}
                {grievance.resolution && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <Label className="text-sm font-medium">Resolution</Label>
                    <p className="text-sm mt-1">{grievance.resolution.resolutionDetails}</p>
                    <p className="text-sm mt-2"><strong>Action Taken:</strong> {grievance.resolution.actionTaken}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {grievance.comments && grievance.comments.length > 0 ? (
                  <div className="space-y-4">
                    {grievance.comments.map((comment: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{comment.commentedBy?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTimeFullDDMMYYYY(comment.commentedDate)}
                            </p>
                          </div>
                          {comment.isInternal && (
                            <Badge variant="secondary">Internal</Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No comments yet</p>
                )}

                <div className="mt-6 space-y-4">
                  <div>
                    <Label>Add Comment</Label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Enter your comment..."
                      rows={4}
                    />
                  </div>
                  {isHR && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="internal"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                      />
                      <Label htmlFor="internal" className="cursor-pointer">
                        Internal comment (not visible to employee)
                      </Label>
                    </div>
                  )}
                  <Button onClick={handleAddComment} disabled={!comment.trim()}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isHR && (
            <TabsContent value="actions" className="space-y-4">
              {grievance.status === 'SUBMITTED' || grievance.status === 'UNDER_REVIEW' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Assign Grievance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Assign To</Label>
                      <Input
                        value={assignData.assignedTo}
                        onChange={(e) => setAssignData({ ...assignData, assignedTo: e.target.value })}
                        placeholder="User ID or email"
                      />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Input
                        value={assignData.assignedDepartment}
                        onChange={(e) => setAssignData({ ...assignData, assignedDepartment: e.target.value })}
                        placeholder="Department name"
                      />
                    </div>
                    <div>
                      <Label>Severity</Label>
                      <Select
                        value={assignData.severity}
                        onValueChange={(value) => setAssignData({ ...assignData, severity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAssign}>Assign</Button>
                  </CardContent>
                </Card>
              ) : null}

              {grievance.status === 'INVESTIGATION' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Propose Resolution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Resolution Details</Label>
                      <Textarea
                        value={resolutionData.resolutionDetails}
                        onChange={(e) => setResolutionData({ ...resolutionData, resolutionDetails: e.target.value })}
                        placeholder="Describe the proposed resolution..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Action Taken</Label>
                      <Textarea
                        value={resolutionData.actionTaken}
                        onChange={(e) => setResolutionData({ ...resolutionData, actionTaken: e.target.value })}
                        placeholder="Describe the action taken..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleProposeResolution}>Propose Resolution</Button>
                  </CardContent>
                </Card>
              )}

              {grievance.status === 'RESOLUTION_PROPOSED' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Approve Resolution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm"><strong>Resolution:</strong> {grievance.resolution?.resolutionDetails}</p>
                      <p className="text-sm mt-2"><strong>Action Taken:</strong> {grievance.resolution?.actionTaken}</p>
                    </div>
                    <Button onClick={handleApproveResolution}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve Resolution
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {grievance.status === 'RESOLVED' && currentUser?.role === 'Employee' && (
            <TabsContent value="feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {grievance.employeeFeedback ? (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Feedback Submitted</AlertTitle>
                      <AlertDescription>
                        Rating: {grievance.employeeFeedback.satisfactionRating}/5
                        {grievance.employeeFeedback.feedback && (
                          <p className="mt-2">{grievance.employeeFeedback.feedback}</p>
                        )}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label>Satisfaction Rating</Label>
                        <div className="flex gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              variant="outline"
                              onClick={() => handleSubmitFeedback(rating)}
                            >
                              {rating} ⭐
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default function GrievanceDetailPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </DashboardLayout>
      }
    >
      <GrievanceDetailContent />
    </Suspense>
  );
}
