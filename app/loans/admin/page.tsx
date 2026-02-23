'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  DollarSign,
  FileText,
  TrendingUp,
  Loader2,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

interface Loan {
  _id: string;
  employeeId: {
    firstName: string;
    lastName: string;
    employeeCode: string;
    email: string;
    designation: string;
    department: string;
  };
  loanTypeId: {
    loanName: string;
    loanCode: string;
  };
  appliedAmount: number;
  sanctionedAmount: number;
  emiAmount: number;
  outstandingAmount: number;
  status: string;
  createdAt: string;
  disbursalDate?: string;
}

export default function LoanAdminPage() {
  const { currentUser } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalLoans: 0,
    activeLoans: 0,
    pendingApprovals: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    if (!currentUser) {
      redirect('/login');
    }
    loadLoans();
  }, [currentUser, filters]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllLoans({
        status: filters.status || undefined,
        limit: 50,
      });
      if (response.success && response.data) {
        let filteredLoans = response.data;
        
        // Client-side search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredLoans = filteredLoans.filter(loan =>
            loan.employeeId.firstName.toLowerCase().includes(searchLower) ||
            loan.employeeId.lastName.toLowerCase().includes(searchLower) ||
            loan.employeeId.employeeCode.toLowerCase().includes(searchLower) ||
            loan.loanTypeId.loanName.toLowerCase().includes(searchLower)
          );
        }
        
        setLoans(filteredLoans);
        if (response.summary) {
          setSummary(response.summary);
        }
      } else {
        toast.error('Failed to load loans');
      }
    } catch (error: any) {
      toast.error('Error loading loans');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      APPLIED: { label: 'Applied', variant: 'outline' },
      MANAGER_APPROVED: { label: 'Manager Approved', variant: 'secondary' },
      HR_VERIFIED: { label: 'HR Verified', variant: 'secondary' },
      FINANCE_SANCTIONED: { label: 'Finance Sanctioned', variant: 'default' },
      DISBURSED: { label: 'Disbursed', variant: 'default' },
      ACTIVE: { label: 'Active', variant: 'default' },
      CLOSED: { label: 'Closed', variant: 'secondary' },
      REJECTED: { label: 'Rejected', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Loan Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all employee loans
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Loans</p>
                  <p className="text-2xl font-bold">{summary.totalLoans}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Loans</p>
                  <p className="text-2xl font-bold">{summary.activeLoans}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                  <p className="text-2xl font-bold">{summary.pendingApprovals}</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by employee name, code, or loan type..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <Select value={filters.status || 'all'} onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : value })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="APPLIED">Applied</SelectItem>
                  <SelectItem value="MANAGER_APPROVED">Manager Approved</SelectItem>
                  <SelectItem value="HR_VERIFIED">HR Verified</SelectItem>
                  <SelectItem value="FINANCE_SANCTIONED">Finance Sanctioned</SelectItem>
                  <SelectItem value="DISBURSED">Disbursed</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loans List */}
        <Card>
          <CardHeader>
            <CardTitle>All Loans</CardTitle>
            <CardDescription>{loans.length} loan(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            {loans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No loans found
              </div>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <div
                    key={loan._id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{loan.loanTypeId.loanName}</h3>
                        {getStatusBadge(loan.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                        <div>
                          <p className="text-muted-foreground">Employee</p>
                          <p className="font-medium">
                            {loan.employeeId.firstName} {loan.employeeId.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{loan.employeeId.employeeCode}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-medium">₹{loan.appliedAmount.toLocaleString()}</p>
                          {loan.sanctionedAmount > 0 && loan.sanctionedAmount !== loan.appliedAmount && (
                            <p className="text-xs text-muted-foreground">
                              Sanctioned: ₹{loan.sanctionedAmount.toLocaleString()}
                            </p>
                          )}
                        </div>
                        {loan.emiAmount > 0 && (
                          <div>
                            <p className="text-muted-foreground">Monthly EMI</p>
                            <p className="font-medium">₹{loan.emiAmount.toLocaleString()}</p>
                          </div>
                        )}
                        {loan.outstandingAmount > 0 && (
                          <div>
                            <p className="text-muted-foreground">Outstanding</p>
                            <p className="font-medium">₹{loan.outstandingAmount.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Applied: {new Date(loan.createdAt).toLocaleDateString()}
                        {loan.disbursalDate && ` • Disbursed: ${new Date(loan.disbursalDate).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/loans/${loan._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
