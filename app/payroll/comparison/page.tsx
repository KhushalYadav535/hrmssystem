'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PayrollComparisonPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) redirect('/login');

  const comparisonData = [
    {
      item: 'Basic Salary',
      jan2026: 150000,
      feb2026: 150000,
      change: 0,
    },
    {
      item: 'House Rent Allowance',
      jan2026: 75000,
      feb2026: 75000,
      change: 0,
    },
    {
      item: 'Dearness Allowance',
      jan2026: 45000,
      feb2026: 46350,
      change: 1350,
    },
    {
      item: 'Conveyance',
      jan2026: 24000,
      feb2026: 24000,
      change: 0,
    },
    {
      item: 'Medical Allowance',
      jan2026: 15000,
      feb2026: 15000,
      change: 0,
    },
    {
      item: 'Total Earnings',
      jan2026: 309000,
      feb2026: 310350,
      change: 1350,
      isBold: true,
    },
    {
      item: 'PF',
      jan2026: 18540,
      feb2026: 18540,
      change: 0,
    },
    {
      item: 'ESI',
      jan2026: 5561,
      feb2026: 5561,
      change: 0,
    },
    {
      item: 'Income Tax',
      jan2026: 15000,
      feb2026: 15000,
      change: 0,
    },
    {
      item: 'Total Deductions',
      jan2026: 39101,
      feb2026: 39101,
      change: 0,
      isBold: true,
    },
    {
      item: 'Net Salary',
      jan2026: 269899,
      feb2026: 271249,
      change: 1350,
      isBold: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll Comparison</h1>
          <p className="text-muted-foreground mt-2">Compare payroll data across multiple months</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline">January 2026</Button>
          <Button variant="outline">vs</Button>
          <Button variant="outline">February 2026</Button>
          <Button className="ml-auto">Select Months</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Comparison - January 2026 vs February 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Item</th>
                    <th className="text-right py-3 px-4 font-semibold">January 2026</th>
                    <th className="text-right py-3 px-4 font-semibold">February 2026</th>
                    <th className="text-right py-3 px-4 font-semibold">Change</th>
                    <th className="text-center py-3 px-4 font-semibold">% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => {
                    const percentChange = row.jan2026 ? ((row.change / row.jan2026) * 100).toFixed(2) : '0';
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-border/50 ${row.isBold ? 'bg-secondary/30' : ''}`}
                      >
                        <td className={`py-3 px-4 ${row.isBold ? 'font-bold' : ''}`}>{row.item}</td>
                        <td className={`text-right py-3 px-4 ${row.isBold ? 'font-bold' : ''}`}>
                          ₹{row.jan2026.toLocaleString()}
                        </td>
                        <td className={`text-right py-3 px-4 ${row.isBold ? 'font-bold' : ''}`}>
                          ₹{row.feb2026.toLocaleString()}
                        </td>
                        <td className={`text-right py-3 px-4 ${row.isBold ? 'font-bold' : ''} ${
                          row.change > 0 ? 'text-green-600' : row.change < 0 ? 'text-red-600' : ''
                        }`}>
                          {row.change > 0 ? '+' : ''}₹{row.change.toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4">
                          {percentChange !== '0.00' && (
                            <Badge variant={parseFloat(percentChange) > 0 ? 'default' : 'secondary'}>
                              {parseFloat(percentChange) > 0 ? '+' : ''}
                              {percentChange}%
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Average Monthly Increase</p>
              <p className="text-3xl font-bold text-green-600 mt-2">₹1,350</p>
              <p className="text-xs text-muted-foreground mt-2">Per employee net salary</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Increase (All Employees)</p>
              <p className="text-3xl font-bold text-green-600 mt-2">₹3,84,750</p>
              <p className="text-xs text-muted-foreground mt-2">285 employees × ₹1,350</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Primary Reason</p>
              <p className="text-lg font-bold mt-2">DA Increase</p>
              <p className="text-xs text-muted-foreground mt-2">4.2% DA revision applied</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline">Export to CSV</Button>
          <Button variant="outline">Export to PDF</Button>
          <Button>Print Report</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
