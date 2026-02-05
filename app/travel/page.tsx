'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Plane, MapPin, Briefcase, DollarSign, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function TravelPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [travelRequests, setTravelRequests] = useState<any[]>([]);
  const [travelAdvances, setTravelAdvances] = useState<any[]>([]);
  const [travelClaims, setTravelClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTravelData();
  }, []);

  const loadTravelData = async () => {
    try {
      setIsLoading(true);
      const [requestsRes, advancesRes, claimsRes] = await Promise.all([
        apiService.getTravelRequests(),
        apiService.getTravelAdvances(),
        apiService.getTravelClaims(),
      ]);

      if (requestsRes.success && requestsRes.data) {
        setTravelRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
      }
      if (advancesRes.success && advancesRes.data) {
        setTravelAdvances(Array.isArray(advancesRes.data) ? advancesRes.data : []);
      }
      if (claimsRes.success && claimsRes.data) {
        setTravelClaims(Array.isArray(claimsRes.data) ? claimsRes.data : []);
      }
    } catch (error) {
      console.error('Failed to load travel data', error);
      toast.error('Failed to load travel data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTravelRequest = async (id: string) => {
    try {
      const response = await apiService.approveTravelRequest(id, 'Approved');
      if (response.success) {
        toast.success('Travel request approved successfully');
        loadTravelData();
      } else {
        toast.error(response.message || 'Failed to approve travel request');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve travel request');
    }
  };

  const handleRejectTravelRequest = async (id: string) => {
    try {
      const response = await apiService.approveTravelRequest(id, 'Rejected');
      if (response.success) {
        toast.success('Travel request rejected');
        loadTravelData();
      } else {
        toast.error(response.message || 'Failed to reject travel request');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject travel request');
    }
  };

  if (!isAuthenticated) {
    redirect('/login');
  }

  // Check if user is Tenant Admin - they should see approval dashboard, not create options
  const isTenantAdmin = currentUser?.role === 'Tenant Admin';
  const canSubmitExpense = hasPermission('submit_expense') && !isTenantAdmin;

  const pendingExpenses = expenses.filter((e) => e.status === 'Pending' || e.status === 'Submitted');
  const approvedExpenses = expenses.filter((e) => e.status === 'Approved' || e.status === 'Paid');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Pending':
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const totalPending = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalApproved = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Travel & Expense Management</h1>
            <p className="text-muted-foreground mt-2">
              {isTenantAdmin ? 'Review and approve travel requests and claims' : 'Submit and track your travel requests, advances, and claims'}
            </p>
          </div>
          {canSubmitTravel && (
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" asChild>
                <Link href="/travel/request">
                  <Plus className="w-4 h-4" />
                  Travel Request
                </Link>
              </Button>
              <Button className="gap-2" asChild>
                <Link href="/travel/claim">
                  <Plus className="w-4 h-4" />
                  Submit Claim
                </Link>
              </Button>
            </div>
          )}
          {isTenantAdmin && (
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/approvals/travel">
                <CheckCircle2 className="w-4 h-4" />
                View All Approvals
              </Link>
            </Button>
          )}
        </div>

        {/* Travel Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Travel Requests</p>
                <p className="text-2xl font-bold">{travelRequests.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{pendingRequests.length} pending</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Travel Advances</p>
                <p className="text-2xl font-bold text-blue-600">₹{totalAdvanceAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{pendingAdvances.length} pending</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Pending Claims</p>
                <p className="text-2xl font-bold text-yellow-600">₹{totalPendingAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{pendingClaims.length} claims</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Claims</p>
                <p className="text-2xl font-bold text-green-600">₹{travelClaims.filter(c => c.status === 'Settled' || c.status === 'Paid').reduce((sum, c) => sum + (c.totalClaimAmount || 0), 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{travelClaims.filter(c => c.status === 'Settled' || c.status === 'Paid').length} settled</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Only show for non-Tenant Admin users */}
        {!isTenantAdmin && canSubmitExpense && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" asChild>
              <Link href="/travel/request">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold">Create Travel Request</p>
                      <p className="text-xs text-muted-foreground">Submit new travel request</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" asChild>
              <Link href="/travel/advance">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold">Request Advance</p>
                      <p className="text-xs text-muted-foreground">Get travel advance payment</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" asChild>
              <Link href="/travel/lta">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold">LTA Management</p>
                      <p className="text-xs text-muted-foreground">Manage Leave Travel Allowance</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        )}

        {/* Travel Requests, Advances, and Claims */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Travel Requests & Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="requests" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="requests">Requests ({travelRequests.length})</TabsTrigger>
                <TabsTrigger value="advances">Advances ({travelAdvances.length})</TabsTrigger>
                <TabsTrigger value="claims">Claims ({travelClaims.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="requests" className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading travel requests...</div>
                ) : travelRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No travel requests found</div>
                ) : (
                  travelRequests.map((request) => {
                    const requestId = request._id || request.id;
                    return (
                      <div key={requestId} className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Plane className="w-4 h-4 text-muted-foreground" />
                              <p className="font-semibold text-sm">{request.travelType}</p>
                              <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                            </div>
                            {request.employeeId && (
                              <p className="text-xs text-muted-foreground mb-1">
                                {request.employeeId.firstName} {request.employeeId.lastName} ({request.employeeId.employeeCode})
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground mb-1">{request.purpose}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span><MapPin className="w-3 h-3 inline mr-1" />{request.origin} → {request.destination}</span>
                              <span><Calendar className="w-3 h-3 inline mr-1" />{request.departureDate ? new Date(request.departureDate).toLocaleDateString() : 'N/A'} - {request.returnDate ? new Date(request.returnDate).toLocaleDateString() : 'N/A'}</span>
                              <span>₹{request.estimatedAmount?.toLocaleString() || '0'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4 flex-shrink-0">
                            {isTenantAdmin && request.status === 'Submitted' && (
                              <>
                                <Button size="sm" variant="outline" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproveTravelRequest(requestId)}>
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleRejectTravelRequest(requestId)}>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/travel/request?id=${requestId}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="advances" className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : travelAdvances.length > 0 ? (
                  travelAdvances.map((advance) => {
                    const advanceId = advance._id || advance.id;
                    return (
                      <div key={advanceId} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <p className="font-semibold text-sm">Travel Advance</p>
                              <Badge className={getStatusColor(advance.status)}>{advance.status}</Badge>
                            </div>
                            {advance.employeeId && (
                              <p className="text-xs text-muted-foreground mb-1">
                                {advance.employeeId.firstName} {advance.employeeId.lastName}
                              </p>
                            )}
                            <p className="text-sm font-semibold mb-1">₹{advance.advanceAmount?.toLocaleString() || '0'}</p>
                            <p className="text-xs text-muted-foreground">Requested: {advance.requestedDate ? new Date(advance.requestedDate).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No travel advances found</div>
                )}
              </TabsContent>

              <TabsContent value="claims" className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : travelClaims.length > 0 ? (
                  travelClaims.map((claim) => {
                    const claimId = claim._id || claim.id;
                    return (
                      <div key={claimId} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <p className="font-semibold text-sm">{claim.claimType}</p>
                              <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                            </div>
                            {claim.employeeId && (
                              <p className="text-xs text-muted-foreground mb-1">
                                {claim.employeeId.firstName} {claim.employeeId.lastName}
                              </p>
                            )}
                            <p className="text-sm font-semibold mb-1">Total: ₹{claim.totalClaimAmount?.toLocaleString() || '0'}</p>
                            {claim.netPayable > 0 && (
                              <p className="text-xs text-green-600">Payable: ₹{claim.netPayable.toLocaleString()}</p>
                            )}
                            {claim.netRecoverable > 0 && (
                              <p className="text-xs text-red-600">Recoverable: ₹{claim.netRecoverable.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No travel claims found</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
