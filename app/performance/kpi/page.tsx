'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChartComponent, BarChartComponent } from '@/components/common/charts';

export default function KPIDashboardPage() {
  const kpiData = [
    { month: 'Jan', target: 100, actual: 85 },
    { month: 'Feb', target: 100, actual: 92 },
    { month: 'Mar', target: 100, actual: 88 },
    { month: 'Apr', target: 100, actual: 95 },
    { month: 'May', target: 100, actual: 98 },
    { month: 'Jun', target: 100, actual: 105 },
  ];

  const departmentKPI = [
    { dept: 'IT', achievement: 92 },
    { dept: 'HR', achievement: 88 },
    { dept: 'Finance', achievement: 95 },
    { dept: 'Operations', achievement: 85 },
    { dept: 'Sales', achievement: 102 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">KPI Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Average Achievement</p>
              <p className="text-3xl font-bold text-blue-600">93.8%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">This Month Target</p>
              <p className="text-3xl font-bold text-foreground">100</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Achieved</p>
              <p className="text-3xl font-bold text-green-600">105</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Variance</p>
              <p className="text-3xl font-bold text-green-600">+5%</p>
            </CardContent>
          </Card>
        </div>

        <LineChartComponent data={kpiData} dataKey="actual" title="KPI Trend" description="Target vs Actual Performance" />
        <BarChartComponent data={departmentKPI} dataKey="achievement" title="Department-wise Achievement" description="% Achievement by Department" />
      </div>
    </DashboardLayout>
  );
}
