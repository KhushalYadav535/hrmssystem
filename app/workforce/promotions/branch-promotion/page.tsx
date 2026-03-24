'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, TrendingUp, Building2, ArrowRight, Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

/**
 * Branch-wise Promotion Page
 * BR-HRMS-01: Promotion with branch transfer support
 * Employees can be promoted within same branch or promoted + transferred to different branch
 */
export default function BranchPromotionPage() {
  const { currentUser } = useAuth();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending HR' | 'Pending Management' | 'Approved' | 'Rejected'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [form, setForm] = useState({
    employeeId: '',
    promotionType: 'Merit' as 'Merit' | 'Seniority' | 'Performance-Based' | 'Cross-Functional' | 'Acting' | 'Other',
    newDesignation: '',
    newGrade: '',
    newSalary: '',
    newDepartment: '',
    effectiveDate: '',
    justification: '',
    includesTransfer: false,
    newPostingUnitId: '',
    newLocation: '',
  });

  useEffect(() => {
    loadData();
  }, [statusFilter, branchFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (branchFilter !== 'all') params.postingUnitId = branchFilter;

      const [promotionsRes, employeesRes, branchesRes, designationsRes] = await Promise.all([
        apiService.getPromotions(params),
        apiService.getEmployees({ status: 'Active' }),
        apiService.getOrganizationUnits({ type: 'BRANCH' }),
        apiService.get<{ success: boolean; data: any[] }>('/designations'),
      ]);

      if (promotionsRes.success && promotionsRes.data) {
        setPromotions(Array.isArray(promotionsRes.data) ? promotionsRes.data : []);
      }
      if (employeesRes.success && employeesRes.data) {
        setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : []);
      }
      if (branchesRes.success && branchesRes.data) {
        setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
      }
      if (designationsRes.success && designationsRes.data) {
        setDesignations(Array.isArray(designationsRes.data) ? designationsRes.data : []);
      } else if (designationsRes.data && Array.isArray(designationsRes.data)) {
        setDesignations(designationsRes.data);
      }
    } catch (error: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setSelectedEmployee(null);
    setForm({
      employeeId: '',
      promotionType: 'Merit',
      newDesignation: '',
      newGrade: '',
      newSalary: '',
      newDepartment: '',
      effectiveDate: '',
      justification: '',
      includesTransfer: false,
      newPostingUnitId: '',
      newLocation: '',
    });
    setDialogOpen(true);
  };

  const handleEmployeeSelect = async (employeeId: string) => {
    const emp = employees.find((e) => e._id === employeeId);
    if (emp) {
      setSelectedEmployee(emp);
      setForm({
        ...form,
        employeeId,
        newDepartment: emp.department || '',
      });
    }
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.newDesignation || !form.effectiveDate || !form.justification) {
      toast.error('Employee, new designation, effective date, and justification are required');
      return;
    }

    if (form.includesTransfer && !form.newPostingUnitId) {
      toast.error('New posting unit is required when promotion includes transfer');
      return;
    }

    try {
      const response = await apiService.createPromotion({
        employeeId: form.employeeId,
        promotionType: form.promotionType,
        newDesignation: form.newDesignation,
        newGrade: form.newGrade || undefined,
        newSalary: form.newSalary ? parseFloat(form.newSalary) : undefined,
        newDepartment: form.newDepartment || undefined,
        effectiveDate: form.effectiveDate,
        justification: form.justification,
        includesTransfer: form.includesTransfer,
        newPostingUnitId: form.includesTransfer ? form.newPostingUnitId : undefined,
        newLocation: form.includesTransfer ? form.newLocation : undefined,
      });

      if (response.success) {
        toast.success('Promotion recommendation created successfully');
        setDialogOpen(false);
        loadData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create promotion');
    }
  };

  const handleApprove = async (promotionId: string) => {
    try {
      const response = await apiService.approvePromotion(promotionId, 'Approved');
      if (response.success) {
        toast.success('Promotion approved successfully');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve promotion');
    }
  };

  const handleReject = async (promotionId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason || reason.trim().length < 10) {
      toast.error('Rejection reason is required (minimum 10 characters)');
      return;
    }

    try {
      const response = await apiService.rejectPromotion(promotionId, reason);
      if (response.success) {
        toast.success('Promotion rejected');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject promotion');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'Pending Management':
        return <Badge className="bg-orange-100 text-orange-700"><Clock className="w-3 h-3 mr-1" />Pending Management</Badge>;
      case 'Pending HR':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending HR</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      !searchTerm ||
      `${promo.employeeId?.firstName} ${promo.employeeId?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.newDesignation?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Branch-wise Promotions</h1>
            <p className="text-muted-foreground mt-2">
              Manage promotions with optional branch transfers
            </p>
          </div>
          {currentUser?.role === 'Tenant Admin' && (
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Promotion
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by employee name or designation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending HR">Pending HR</SelectItem>
                  <SelectItem value="Pending Management">Pending Management</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch._id} value={branch._id}>
                      {branch.unitCode} - {branch.unitName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Promotions List */}
        <div className="grid gap-4">
          {filteredPromotions.map((promo) => (
            <Card key={promo._id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-lg">
                          {promo.employeeId?.firstName} {promo.employeeId?.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{promo.employeeId?.employeeCode}</p>
                      </div>
                      {getStatusBadge(promo.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <Label className="text-muted-foreground text-xs">From</Label>
                        <p className="font-medium">{promo.previousDesignation}</p>
                        {promo.previousPostingUnitId && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {typeof promo.previousPostingUnitId === 'object' ? promo.previousPostingUnitId.unitCode : 'Loading...'}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">To</Label>
                        <p className="font-medium">{promo.newDesignation}</p>
                        {promo.newPostingUnitId && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {typeof promo.newPostingUnitId === 'object' ? promo.newPostingUnitId.unitCode : 'Loading...'}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Effective Date</Label>
                        <p className="font-medium">{formatDateDDMMYYYY(promo.effectiveDate)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Type</Label>
                        <Badge variant="outline">{promo.promotionType}</Badge>
                        {promo.includesTransfer && (
                          <Badge variant="secondary" className="ml-1">+ Transfer</Badge>
                        )}
                      </div>
                    </div>
                    {promo.justification && (
                      <div className="mt-3">
                        <Label className="text-muted-foreground text-xs">Justification</Label>
                        <p className="text-sm">{promo.justification}</p>
                      </div>
                    )}
                  </div>
                  {promo.status === 'Pending Management' && currentUser?.role === 'Tenant Admin' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleReject(promo._id)}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(promo._id)}>
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Promotion Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Promotion Recommendation</DialogTitle>
              <DialogDescription>
                BR-HRMS-01: Promotion can include branch transfer
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList>
                <TabsTrigger value="basic">Basic Details</TabsTrigger>
                <TabsTrigger value="transfer">Branch Transfer (Optional)</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label>Employee *</Label>
                  <Select value={form.employeeId} onValueChange={handleEmployeeSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp._id} value={emp._id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeCode})
                          {emp.postingUnitId && typeof emp.postingUnitId === 'object' && (
                            <span className="text-xs text-muted-foreground ml-2">
                              - {emp.postingUnitId.unitCode}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedEmployee && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <p><strong>Current:</strong> {selectedEmployee.designation} at {typeof selectedEmployee.postingUnitId === 'object' ? selectedEmployee.postingUnitId.unitCode : 'N/A'}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Promotion Type *</Label>
                    <Select
                      value={form.promotionType}
                      onValueChange={(v: any) => setForm({ ...form, promotionType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Merit">Merit</SelectItem>
                        <SelectItem value="Seniority">Seniority</SelectItem>
                        <SelectItem value="Performance-Based">Performance-Based</SelectItem>
                        <SelectItem value="Cross-Functional">Cross-Functional</SelectItem>
                        <SelectItem value="Acting">Acting</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>New Designation *</Label>
                    <Select value={form.newDesignation} onValueChange={(v) => setForm({ ...form, newDesignation: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations
                          .filter((d) => d.status === 'Active')
                          .map((des) => (
                            <SelectItem key={des._id} value={des._id}>
                              {des.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>New Grade</Label>
                    <Input
                      value={form.newGrade}
                      onChange={(e) => setForm({ ...form, newGrade: e.target.value })}
                      placeholder="e.g., M2"
                    />
                  </div>
                  <div>
                    <Label>New Salary</Label>
                    <Input
                      type="number"
                      value={form.newSalary}
                      onChange={(e) => setForm({ ...form, newSalary: e.target.value })}
                      placeholder="New salary amount"
                    />
                  </div>
                </div>
                <div>
                  <Label>New Department</Label>
                  <Input
                    value={form.newDepartment}
                    onChange={(e) => setForm({ ...form, newDepartment: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Effective Date *</Label>
                  <Input
                    type="date"
                    value={form.effectiveDate}
                    onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <Label>Justification *</Label>
                  <Textarea
                    value={form.justification}
                    onChange={(e) => setForm({ ...form, justification: e.target.value })}
                    placeholder="Reason for promotion..."
                    rows={4}
                    required
                  />
                </div>
              </TabsContent>
              <TabsContent value="transfer" className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includesTransfer"
                    checked={form.includesTransfer}
                    onChange={(e) => setForm({ ...form, includesTransfer: e.target.checked })}
                  />
                  <Label htmlFor="includesTransfer">Promotion includes branch transfer</Label>
                </div>
                {form.includesTransfer && (
                  <>
                    <div>
                      <Label>New Posting Branch *</Label>
                      <Select
                        value={form.newPostingUnitId}
                        onValueChange={(v) => setForm({ ...form, newPostingUnitId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches
                            .filter((b) => b._id !== selectedEmployee?.postingUnitId?._id)
                            .map((branch) => (
                              <SelectItem key={branch._id} value={branch._id}>
                                {branch.unitCode} - {branch.unitName} ({branch.city})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Employee will be transferred to this branch along with promotion
                      </p>
                    </div>
                    <div>
                      <Label>New Location (Auto-filled from branch)</Label>
                      <Input value={form.newLocation} disabled placeholder="Will be auto-filled from branch" />
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Create Promotion</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
