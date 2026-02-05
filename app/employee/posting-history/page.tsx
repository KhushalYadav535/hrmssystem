'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect, useParams, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, TrendingUp, CheckCircle2, X, Clock, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

interface Posting {
  _id?: string;
  id?: string;
  employeeId: string;
  employeeName?: string;
  postingType: string;
  fromDesignation?: string;
  toDesignation: string;
  fromDepartment?: string;
  toDepartment: string;
  fromLocation?: string;
  toLocation: string;
  effectiveDate: string;
  endDate?: string;
  tenureDays?: number;
  status: string;
  previousSalary?: number;
  newSalary?: number;
}

function PostingHistoryContent() {
  const { isAuthenticated, currentUser } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('employeeId') || params?.id || currentUser?.id;

  const [postings, setPostings] = useState<Posting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  if (!isAuthenticated) redirect('/login');

  useEffect(() => {
    if (employeeId) {
      loadPostingHistory();
    }
  }, [employeeId, selectedType]);

  const loadPostingHistory = async () => {
    if (!employeeId) return;
    try {
      setIsLoading(true);
      const params: any = { employeeId };
      if (selectedType !== 'all') {
        params.postingType = selectedType;
      }
      const response = await apiService.getPostingHistory(params);
      if (response.success && response.data) {
        setPostings(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load posting history');
    } finally {
      setIsLoading(false);
    }
  };

  const getPostingsByType = (type: string) => {
    if (type === 'all') return postings;
    return postings.filter(p => p.postingType === type);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'Approved': return 'secondary';
      case 'Pending': return 'outline';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Promotion': return <TrendingUp className="w-5 h-5" />;
      case 'Transfer': return <MapPin className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Posting History</h1>
          <p className="text-muted-foreground mt-2">Complete career posting and transfer history</p>
        </div>

        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({postings.length})</TabsTrigger>
            <TabsTrigger value="Transfer">Transfer</TabsTrigger>
            <TabsTrigger value="Promotion">Promotion</TabsTrigger>
            <TabsTrigger value="Deputation">Deputation</TabsTrigger>
            <TabsTrigger value="Lateral Movement">Lateral</TabsTrigger>
            <TabsTrigger value="Other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedType} className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center">Loading...</CardContent>
              </Card>
            ) : getPostingsByType(selectedType).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No posting history found</p>
                </CardContent>
              </Card>
            ) : (
              getPostingsByType(selectedType).map((posting) => {
                const id = posting._id || posting.id;
                return (
                  <Card key={id} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getTypeIcon(posting.postingType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold">{posting.postingType}</h3>
                              <p className="text-sm text-muted-foreground">
                                {posting.fromDesignation || 'N/A'} → {posting.toDesignation}
                              </p>
                            </div>
                            <Badge variant={getStatusBadgeVariant(posting.status)}>
                              {posting.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Department</p>
                              <p className="text-sm font-medium">
                                {posting.fromDepartment || 'N/A'} → {posting.toDepartment}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Location</p>
                              <p className="text-sm font-medium">
                                {posting.fromLocation || 'N/A'} → {posting.toLocation}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Effective Date</p>
                              <p className="text-sm font-medium">
                                {new Date(posting.effectiveDate).toLocaleDateString()}
                              </p>
                            </div>
                            {posting.endDate && (
                              <div>
                                <p className="text-xs text-muted-foreground">End Date</p>
                                <p className="text-sm font-medium">
                                  {new Date(posting.endDate).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>

                          {posting.tenureDays !== undefined && (
                            <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Tenure</span>
                                <span className="text-lg font-bold">
                                  {posting.tenureDays} days
                                  {posting.tenureDays >= 365 && ` (${Math.floor(posting.tenureDays / 365)} years)`}
                                </span>
                              </div>
                            </div>
                          )}

                          {(posting.previousSalary || posting.newSalary) && (
                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Salary Impact</span>
                                <div className="flex items-center gap-2">
                                  {posting.previousSalary && (
                                    <span className="text-sm text-muted-foreground">
                                      ₹{posting.previousSalary.toLocaleString()}
                                    </span>
                                  )}
                                  {posting.previousSalary && posting.newSalary && (
                                    <span>→</span>
                                  )}
                                  {posting.newSalary && (
                                    <span className="text-sm font-bold text-green-600">
                                      ₹{posting.newSalary.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default function PostingHistoryPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    }>
      <PostingHistoryContent />
    </Suspense>
  );
}
