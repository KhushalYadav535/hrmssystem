'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, TrendingUp, Users, ArrowRight, Download, Loader2, BarChart3, PieChart, Calendar, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

/**
 * Comprehensive Branch-wise Reports Page
 * BR-HRMS-07: Branch-wise headcount, promotions, transfers reporting with charts
 */
export default function BranchReportPage() {
  const { currentUser } = useAuth();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [reportData, setReportData] = useState<any>(null);
  const [allBranchesSummary, setAllBranchesSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    loadBranches();
    loadAllBranchesSummary();
  }, []);

  useEffect(() => {
    if (selectedBranch !== 'all') {
      loadReportData();
    }
  }, [selectedBranch, fromDate, toDate]);

  const loadBranches = async () => {
    try {
      const response = await apiService.getOrganizationUnits({ type: 'BRANCH' });
      if (response.success && response.data) {
        setBranches(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setBranches(response);
      }
    } catch (error) {
      console.error('Failed to load branches');
    }
  };

  const loadAllBranchesSummary = async () => {
    try {
      const response = await apiService.getAllBranchesSummary();
      if (response.success && response.data) {
        setAllBranchesSummary(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load branches summary');
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await apiService.getBranchReport(selectedBranch, params);
      if (response.success && response.data) {
        setReportData(response.data);
      }
    } catch (error: any) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData) return;

    const csvRows: string[][] = [
      ['Branch Report', reportData.branch.name],
      ['Generated Date', formatDateDDMMYYYY(new Date())],
      [],
      ['SUMMARY'],
      ['Total Employees', reportData.summary.totalEmployees.toString()],
      ['Male', reportData.summary.male.toString()],
      ['Female', reportData.summary.female.toString()],
      ['Permanent', reportData.summary.permanent.toString()],
      ['Contract', reportData.summary.contract.toString()],
      [],
      ['DEPARTMENT BREAKDOWN'],
      ['Department', 'Count'],
      ...reportData.departmentBreakdown.map((d: any) => [d.department, d.count.toString()]),
      [],
      ['GRADE BREAKDOWN'],
      ['Grade', 'Count'],
      ...reportData.gradeBreakdown.map((g: any) => [g.grade, g.count.toString()]),
      [],
      ['DESIGNATION BREAKDOWN'],
      ['Designation', 'Count'],
      ...reportData.designationBreakdown.map((d: any) => [d.designation, d.count.toString()]),
      [],
      ['PROMOTIONS'],
      ['Total Promotions', reportData.promotions.total.toString()],
      [],
      ['TRANSFERS'],
      ['Total Transfers', reportData.transfers.total.toString()],
      ['Incoming', reportData.transfers.incoming.toString()],
      ['Outgoing', reportData.transfers.outgoing.toString()],
      [],
      ['POSITIONS'],
      ['Total', reportData.positions.total.toString()],
      ['Vacant', reportData.positions.vacant.toString()],
      ['Filled', reportData.positions.filled.toString()],
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `branch-report-${reportData.branch.code}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

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
            <h1 className="text-3xl font-bold">Branch-wise Reports</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive analytics and insights by branch
            </p>
          </div>
          {reportData && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Select Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches Summary</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.unitCode} - {branch.unitName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Branches Summary View */}
        {selectedBranch === 'all' && (
          <Card>
            <CardHeader>
              <CardTitle>All Branches Summary</CardTitle>
              <CardDescription>Overview of all branches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch Code</TableHead>
                      <TableHead>Branch Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Vacant Positions</TableHead>
                      <TableHead>Filled Positions</TableHead>
                      <TableHead>Total Positions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allBranchesSummary.map((branch) => (
                      <TableRow key={branch.branchId}>
                        <TableCell className="font-medium">{branch.branchCode}</TableCell>
                        <TableCell>{branch.branchName}</TableCell>
                        <TableCell>{branch.city}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{branch.totalEmployees}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{branch.vacantPositions}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{branch.filledPositions}</Badge>
                        </TableCell>
                        <TableCell>{branch.totalPositions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Branch Report */}
        {selectedBranch !== 'all' && reportData && (
          <>
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total Employees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{reportData.summary.totalEmployees}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    M: {reportData.summary.male} | F: {reportData.summary.female}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Vacant Positions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {reportData.positions.vacant}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total: {reportData.positions.total}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Promotions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {reportData.promotions.total}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">In selected period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Transfers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {reportData.transfers.total}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    In: {reportData.transfers.incoming} | Out: {reportData.transfers.outgoing}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="promotions">Promotions</TabsTrigger>
                <TabsTrigger value="transfers">Transfers</TabsTrigger>
                <TabsTrigger value="positions">Positions</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Department Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.departmentBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="department" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#0088FE" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Grade Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={reportData.gradeBreakdown}
                            dataKey="count"
                            nameKey="grade"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {reportData.gradeBreakdown.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Age Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.ageDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#00C49F" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Experience Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.experienceDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#FF8042" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="departments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Department-wise Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department</TableHead>
                          <TableHead>Employee Count</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.departmentBreakdown.map((dept: any) => (
                          <TableRow key={dept.department}>
                            <TableCell className="font-medium">{dept.department}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{dept.count}</Badge>
                            </TableCell>
                            <TableCell>
                              {((dept.count / reportData.summary.totalEmployees) * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="promotions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Promotion Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reportData.promotions.trends.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={reportData.promotions.trends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="count" stroke="#8884d8" name="Promotions" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No promotion data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Promotions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Transfer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.promotions.recent.map((promo: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{promo.employee}</TableCell>
                            <TableCell>{promo.from}</TableCell>
                            <TableCell className="font-medium">{promo.to}</TableCell>
                            <TableCell>{formatDateDDMMYYYY(promo.date)}</TableCell>
                            <TableCell>
                              {promo.includesTransfer ? (
                                <Badge variant="secondary">Yes</Badge>
                              ) : (
                                <Badge variant="outline">No</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transfers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transfer Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reportData.transfers.trends.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.transfers.trends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="incoming" fill="#00C49F" name="Incoming" />
                          <Bar dataKey="outgoing" fill="#FF8042" name="Outgoing" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No transfer data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transfers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.transfers.recent.map((transfer: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{transfer.employee}</TableCell>
                            <TableCell>{transfer.from}</TableCell>
                            <TableCell className="font-medium">{transfer.to}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{transfer.type}</Badge>
                            </TableCell>
                            <TableCell>{formatDateDDMMYYYY(transfer.date)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="positions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Position Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold">{reportData.positions.total}</div>
                        <div className="text-sm text-muted-foreground">Total Positions</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-green-600">{reportData.positions.filled}</div>
                        <div className="text-sm text-muted-foreground">Filled</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-orange-600">{reportData.positions.vacant}</div>
                        <div className="text-sm text-muted-foreground">Vacant</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-gray-600">{reportData.positions.onHold}</div>
                        <div className="text-sm text-muted-foreground">On Hold</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Designation Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.designationBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="designation" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
