'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Eye, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/lib/api';
import Link from 'next/link';

interface Appraisal {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    department: string;
    designation: string;
  };
  cycleId: {
    _id: string;
    cycleName: string;
  };
  status: string;
  finalRating?: number;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  'PENDING': 'secondary',
  'SELF_ASSESSMENT_SUBMITTED': 'outline',
  'MANAGER_REVIEW_SUBMITTED': 'default',
  'APPROVED': 'default',
  'COMPLETED': 'default',
};

const statusLabels: Record<string, string> = {
  'PENDING': 'Pending',
  'SELF_ASSESSMENT_SUBMITTED': 'Self Assessment Done',
  'MANAGER_REVIEW_SUBMITTED': 'Manager Review Done',
  'APPROVED': 'Approved',
  'COMPLETED': 'Completed',
};

const ratingLabels: Record<number, string> = {
  5: 'Outstanding',
  4: 'Exceeds',
  3: 'Meets',
  2: 'Needs Improvement',
  1: 'Unsatisfactory',
};

export default function ManagerAppraisalsPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  if (!isAuthenticated) {
    redirect('/login');
  }

  useEffect(() => {
    loadAppraisals();
    loadCycles();
  }, []);

  const loadAppraisals = async () => {
    try {
      setLoading(true);
      const res = await apiService.request('/performance/manager/appraisals', {
        method: 'GET',
      });

      if (res.success && res.data) {
        let filtered = res.data;

        if (selectedCycle && selectedCycle !== 'all') {
          filtered = filtered.filter((a: Appraisal) => a.cycleId._id === selectedCycle);
        }
        if (selectedStatus && selectedStatus !== 'all') {
          filtered = filtered.filter((a: Appraisal) => a.status === selectedStatus);
        }
        if (searchTerm) {
          filtered = filtered.filter(
            (a: Appraisal) =>
              a.employeeId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.employeeId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.employeeId.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setAppraisals(filtered);
      }
    } catch (error: any) {
      toast.error('Error loading appraisals');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCycles = async () => {
    try {
      const res = await apiService.request('/appraisal/cycles', {
        method: 'GET',
      });

      if (res.success && res.data) {
        setCycles(res.data);
      }
    } catch (error: any) {
      console.error('Error loading cycles:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={statusColors[status] as any}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const getRatingBadge = (rating?: number) => {
    if (!rating) return <span className="text-muted-foreground">Not Rated</span>;
    
    const colors: Record<number, string> = {
      5: 'default',
      4: 'secondary',
      3: 'outline',
      2: 'destructive',
      1: 'destructive',
    };

    return (
      <Badge variant={colors[rating] as any}>
        {rating} - {ratingLabels[rating]}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manager Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Review and rate your team members' appraisals
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Employee name or code"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Appraisal Cycle</label>
                <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cycles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cycles</SelectItem>
                    {cycles.map((cycle) => (
                      <SelectItem key={cycle._id} value={cycle._id}>
                        {cycle.cycleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={loadAppraisals} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Appraisals</CardTitle>
            <CardDescription>
              {appraisals.length} appraisal(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : appraisals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No appraisals found for your team
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Cycle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appraisals.map((appraisal) => (
                      <TableRow key={appraisal._id}>
                        <TableCell className="font-medium">
                          {appraisal.employeeId.firstName} {appraisal.employeeId.lastName}
                        </TableCell>
                        <TableCell>{appraisal.employeeId.employeeCode}</TableCell>
                        <TableCell>{appraisal.employeeId.department}</TableCell>
                        <TableCell>{appraisal.cycleId.cycleName}</TableCell>
                        <TableCell>{getStatusBadge(appraisal.status)}</TableCell>
                        <TableCell>{getRatingBadge(appraisal.finalRating)}</TableCell>
                        <TableCell>
                          <Link href={`/performance/manager-rating?appraisalId=${appraisal._id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
