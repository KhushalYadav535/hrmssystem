'use client';

import { TooltipProvider } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Legend, Line, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChartComponent, LineChartComponent, PieChartComponent, RadarChartComponent } from '@/components/common/charts';
import { Download, Filter, RefreshCw, Plus, X, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

const headcountData = [
  { month: 'Jan', employees: 250, attrition: 2 },
  { month: 'Feb', employees: 258, attrition: 1 },
  { month: 'Mar', employees: 265, attrition: 3 },
  { month: 'Apr', employees: 272, attrition: 2 },
  { month: 'May', employees: 280, attrition: 4 },
  { month: 'Jun', employees: 285, attrition: 1 },
];

const departmentData = [
  { department: 'Finance', employees: 45 },
  { department: 'Operations', employees: 65 },
  { department: 'IT', employees: 85 },
  { department: 'HR', employees: 35 },
  { department: 'Sales', employees: 55 },
];

const leaveData = [
  { type: 'Annual Leave', count: 450 },
  { type: 'Sick Leave', count: 120 },
  { type: 'Casual Leave', count: 280 },
  { type: 'Comp Off', count: 85 },
];

const performanceData = [
  { name: 'Communication', A: 80, B: 70, C: 60 },
  { name: 'Technical', A: 85, B: 75, C: 65 },
  { name: 'Leadership', A: 75, B: 65, C: 55 },
  { name: 'Problem Solving', A: 90, B: 80, C: 70 },
  { name: 'Team Work', A: 88, B: 78, C: 68 },
];

const mockChartData = [
  { month: 'Jan', applications: 100, hires: 50 },
  { month: 'Feb', applications: 150, hires: 75 },
  { month: 'Mar', applications: 200, hires: 100 },
  { month: 'Apr', applications: 250, hires: 125 },
  { month: 'May', applications: 300, hires: 150 },
];

const departmentWiseData = [
  { department: 'Finance', count: 45 },
  { department: 'Operations', count: 65 },
  { department: 'IT', count: 85 },
  { department: 'HR', count: 35 },
  { department: 'Sales', count: 55 },
];

const designationData = [
  { name: 'Manager', value: 50, fill: '#8884d8' },
  { name: 'Developer', value: 100, fill: '#82ca9d' },
  { name: 'Designer', value: 75, fill: '#ffc658' },
  { name: 'Analyst', value: 25, fill: '#a4de6c' },
];

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export default function ReportsPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [showPreview, setShowPreview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [filterField, setFilterField] = useState('');
  const [filterOperator, setFilterOperator] = useState('equals');
  const [filterValue, setFilterValue] = useState('');

  // Allow access for: managers, HR admins, payroll admins, finance admins, and auditors
  if (!isAuthenticated || (!hasPermission('view_reports') && !hasPermission('view_all_reports'))) {
    redirect('/dashboard');
  }

  // Ensure all chart data is valid
  const validHeadcountData = Array.isArray(headcountData) && headcountData.length > 0 ? headcountData : [];
  const validDepartmentData = Array.isArray(departmentData) && departmentData.length > 0 ? departmentData : [];
  const validLeaveData = Array.isArray(leaveData) && leaveData.length > 0 ? leaveData : [];
  const validPerformanceData = Array.isArray(performanceData) && performanceData.length > 0 ? performanceData : [];

  const addFilter = () => {
    if (!filterField || !filterValue) {
      toast.error('Please fill all filter fields');
      return;
    }
    setFilters([...filters, {
      id: Date.now().toString(),
      field: filterField,
      operator: filterOperator,
      value: filterValue,
    }]);
    setFilterField('');
    setFilterValue('');
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const handleExport = () => {
    toast.success('Exporting report...');
    setTimeout(() => {
      toast.success('Report exported successfully!');
    }, 1500);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-2">Comprehensive HR metrics and insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4" />
              Filters {filters.length > 0 && `(${filters.length})`}
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent" onClick={handlePreview}>
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <Card className="border-accent/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Advanced Filters</span>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
              <CardDescription>Create multi-condition filters for detailed reporting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Field</Label>
                  <Select value={filterField} onValueChange={setFilterField}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="designation">Designation</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="date_range">Date Range</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Operator</Label>
                  <Select value={filterOperator} onValueChange={setFilterOperator}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="between">Between</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="Enter value"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addFilter} className="w-full gap-2">
                    <Plus className="w-4 h-4" /> Add Filter
                  </Button>
                </div>
              </div>

              {filters.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>Active Filters:</Label>
                  <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                      <div
                        key={filter.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm"
                      >
                        <span className="font-medium">{filter.field}</span>
                        <span className="text-muted-foreground">{filter.operator}</span>
                        <span>{filter.value}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => removeFilter(filter.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setFilters([])} className="mt-2">
                    Clear All Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Report Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Preview</DialogTitle>
              <DialogDescription>Preview your report before exporting</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Report Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Records:</span>
                    <span className="ml-2 font-semibold">285</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date Range:</span>
                    <span className="ml-2 font-semibold">Jan 2026 - Feb 2026</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Filters Applied:</span>
                    <span className="ml-2 font-semibold">{filters.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <span className="ml-2 font-semibold">PDF / Excel</span>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Preview Data (First 10 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Employee</th>
                        <th className="text-left p-2">Department</th>
                        <th className="text-left p-2">Designation</th>
                        <th className="text-right p-2">Salary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2">Employee {i}</td>
                          <td className="p-2">IT</td>
                          <td className="p-2">Developer</td>
                          <td className="p-2 text-right">₹75,000</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Cancel
                </Button>
                <Button onClick={() => { setShowPreview(false); handleExport(); }}>
                  <Download className="w-4 h-4 mr-2" /> Export Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">285</div>
              <p className="text-xs text-green-600 mt-2">↑ 2.2% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Attrition Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">1.4%</div>
              <p className="text-xs text-muted-foreground mt-2">2 employees left this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">3.8/5</div>
              <p className="text-xs text-muted-foreground mt-2">Performance appraisals</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Leave Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">62%</div>
              <p className="text-xs text-muted-foreground mt-2">Of annual entitlement</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChartComponent
            data={validHeadcountData}
            dataKey="employees"
            xAxisKey="month"
            title="Headcount Trend"
            description="Employee count over the last 6 months"
          />
          <BarChartComponent
            data={validDepartmentData}
            dataKey="employees"
            xAxisKey="department"
            title="Department Distribution"
            description="Employee count by department"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChartComponent
            data={validLeaveData}
            dataKey="count"
            nameKey="type"
            title="Leave Distribution"
            description="Types of leaves taken YTD"
          />
          <RadarChartComponent
            data={validPerformanceData}
            dataKey="A"
            title="Performance Comparison"
            description="Competency levels across teams"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payroll Summary</CardTitle>
                <CardDescription>Monthly payroll distribution</CardDescription>
              </div>
              <Select defaultValue="2026-02">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026-02">February 2026</SelectItem>
                  <SelectItem value="2026-01">January 2026</SelectItem>
                  <SelectItem value="2025-12">December 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold text-foreground mt-2">₹45,62,500</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Average Salary</p>
                <p className="text-2xl font-bold text-foreground mt-2">₹1,60,088</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600 mt-2">₹8,45,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}
