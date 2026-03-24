'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Eye,
  Calendar,
  DollarSign,
  TrendingDown,
  Loader2,
  FileText,
} from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

interface Loan {
  _id: string;
  loanTypeId: {
    _id: string;
    loanName: string;
    loanCode: string;
  };
  appliedAmount: number;
  sanctionedAmount: number;
  emiAmount: number;
  outstandingAmount: number;
  tenureMonths: number;
  status: string;
  disbursalDate?: string;
  closureDate?: string;
  createdAt: string;
}

export default function MyLoansPage() {
  const { currentUser } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [obligations, setObligations] = useState({ totalEMI: 0, activeLoans: 0 });

  useEffect(() => {
    if (!currentUser) {
      redirect('/login');
    }
    loadMyLoans();
  }, [currentUser]);

  const loadMyLoans = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyLoans();
      if (response.success && response.data) {
        setLoans(response.data);
        if (response.obligations) {
          setObligations(response.obligations);
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

  const activeLoans = loans.filter(l => ['ACTIVE', 'DISBURSED'].includes(l.status));
  const pendingLoans = loans.filter(l => ['APPLIED', 'MANAGER_APPROVED', 'HR_VERIFIED', 'FINANCE_SANCTIONED'].includes(l.status));
  const closedLoans = loans.filter(l => ['CLOSED', 'REJECTED'].includes(l.status));

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Loans</h1>
            <p className="text-muted-foreground mt-1">
              View your loan applications and repayment schedule
            </p>
          </div>
          <Link href="/loans/apply">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Apply for Loan
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Loans</p>
                  <p className="text-2xl font-bold">{activeLoans.length}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Monthly EMI</p>
                  <p className="text-2xl font-bold">₹{obligations.totalEMI.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                  <p className="text-2xl font-bold">{pendingLoans.length}</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loans List */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Loans ({loans.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeLoans.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingLoans.length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({closedLoans.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loans.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No loans found. Apply for your first loan to get started.
                </CardContent>
              </Card>
            ) : (
              loans.map((loan) => (
                <LoanCard key={loan._id} loan={loan} getStatusBadge={getStatusBadge} />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeLoans.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No active loans
                </CardContent>
              </Card>
            ) : (
              activeLoans.map((loan) => (
                <LoanCard key={loan._id} loan={loan} getStatusBadge={getStatusBadge} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingLoans.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No pending loans
                </CardContent>
              </Card>
            ) : (
              pendingLoans.map((loan) => (
                <LoanCard key={loan._id} loan={loan} getStatusBadge={getStatusBadge} />
              ))
            )}
          </TabsContent>

          <TabsContent value="closed" className="space-y-4">
            {closedLoans.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No closed loans
                </CardContent>
              </Card>
            ) : (
              closedLoans.map((loan) => (
                <LoanCard key={loan._id} loan={loan} getStatusBadge={getStatusBadge} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function LoanCard({ loan, getStatusBadge }: { loan: Loan; getStatusBadge: (status: string) => JSX.Element }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">{loan.loanTypeId?.loanName}</h3>
              {getStatusBadge(loan.status)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Applied Amount</p>
                <p className="font-semibold">₹{loan.appliedAmount.toLocaleString()}</p>
              </div>
              {loan.sanctionedAmount > 0 && (
                <div>
                  <p className="text-muted-foreground">Sanctioned Amount</p>
                  <p className="font-semibold">₹{loan.sanctionedAmount.toLocaleString()}</p>
                </div>
              )}
              {loan.emiAmount > 0 && (
                <div>
                  <p className="text-muted-foreground">Monthly EMI</p>
                  <p className="font-semibold">₹{loan.emiAmount.toLocaleString()}</p>
                </div>
              )}
              {loan.outstandingAmount > 0 && (
                <div>
                  <p className="text-muted-foreground">Outstanding</p>
                  <p className="font-semibold">₹{loan.outstandingAmount.toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Applied: {formatDateDDMMYYYY(loan.createdAt)}
              {loan.disbursalDate && ` • Disbursed: ${formatDateDDMMYYYY(loan.disbursalDate)}`}
              {loan.closureDate && ` • Closed: ${formatDateDDMMYYYY(loan.closureDate)}`}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/loans/${loan._id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </Link>
            {['ACTIVE', 'DISBURSED'].includes(loan.status) && (
              <Link href={`/loans/${loan._id}/schedule`}>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
