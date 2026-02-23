'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

/**
 * Submit Grievance Page
 * BRD: BR-P1-004
 */
export default function SubmitGrievancePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    subject: '',
    description: '',
    incidentDate: '',
    incidentLocation: '',
    preferredResolution: '',
    confidentialityRequired: false,
    anonymousSubmission: false,
  });

  const categorySubCategories: Record<string, string[]> = {
    SALARY_BENEFITS: ['Salary Discrepancy', 'Increment/Promotion Issues', 'Allowance Not Received', 'Reimbursement Delays'],
    LEAVE_ATTENDANCE: ['Leave Rejection', 'Attendance Marking Errors', 'Leave Balance Mismatch'],
    WORK_ENVIRONMENT: ['Infrastructure Issues', 'Safety Concerns', 'Facility Problems'],
    WORKPLACE_HARASSMENT: ['Sexual Harassment (POSH)', 'Bullying', 'Discrimination'],
    MANAGER_PEER_ISSUES: ['Behavior Issues', 'Conflict with Manager', 'Team Conflicts'],
    TRANSFER_POSTING: ['Transfer Issues', 'Location Hardship'],
    TRAINING_DEVELOPMENT: ['Training Not Provided', 'Career Growth Concerns'],
    DISCIPLINARY_ACTION: ['Unfair Action', 'Procedural Issues'],
    OTHERS: ['Miscellaneous'],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.subject || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.description.length < 50) {
      toast.error('Description must be at least 50 characters');
      return;
    }

    try {
      setLoading(true);
      const result = await apiService.submitGrievance(formData);
      
      if (result.success) {
        toast.success(`Grievance submitted successfully. Grievance ID: ${result.data?.grievanceId}`);
        router.push('/grievance');
      } else {
        toast.error(result.message || 'Failed to submit grievance');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit grievance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Submit Grievance</h1>
          <p className="text-muted-foreground mt-1">
            Submit a formal grievance for resolution (BR-P1-004)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grievance Form</CardTitle>
            <CardDescription>
              Please provide detailed information about your grievance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      setFormData({ ...formData, category: value, subCategory: '' });
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SALARY_BENEFITS">Salary & Benefits</SelectItem>
                      <SelectItem value="LEAVE_ATTENDANCE">Leave & Attendance</SelectItem>
                      <SelectItem value="WORK_ENVIRONMENT">Work Environment</SelectItem>
                      <SelectItem value="WORKPLACE_HARASSMENT">Workplace Harassment</SelectItem>
                      <SelectItem value="MANAGER_PEER_ISSUES">Manager/Peer Issues</SelectItem>
                      <SelectItem value="TRANSFER_POSTING">Transfer & Posting</SelectItem>
                      <SelectItem value="TRAINING_DEVELOPMENT">Training & Development</SelectItem>
                      <SelectItem value="DISCIPLINARY_ACTION">Disciplinary Action</SelectItem>
                      <SelectItem value="OTHERS">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.category && categorySubCategories[formData.category] && (
                  <div className="space-y-2">
                    <Label>Sub-Category</Label>
                    <Select
                      value={formData.subCategory}
                      onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorySubCategories[formData.category].map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of the grievance"
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Detailed Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information (minimum 50 characters)"
                  rows={8}
                  minLength={50}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  {formData.description.length}/50 characters (minimum)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Incident Date</Label>
                  <Input
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Incident Location</Label>
                  <Input
                    value={formData.incidentLocation}
                    onChange={(e) => setFormData({ ...formData, incidentLocation: e.target.value })}
                    placeholder="Location where incident occurred"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Resolution</Label>
                <Textarea
                  value={formData.preferredResolution}
                  onChange={(e) => setFormData({ ...formData, preferredResolution: e.target.value })}
                  placeholder="What resolution do you expect?"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="confidentiality"
                    checked={formData.confidentialityRequired}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, confidentialityRequired: checked as boolean })
                    }
                  />
                  <Label htmlFor="confidentiality" className="cursor-pointer">
                    Confidentiality Required
                  </Label>
                </div>

                {formData.category === 'WORKPLACE_HARASSMENT' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={formData.anonymousSubmission}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, anonymousSubmission: checked as boolean })
                      }
                    />
                    <Label htmlFor="anonymous" className="cursor-pointer">
                      Anonymous Submission
                    </Label>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Grievance'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
