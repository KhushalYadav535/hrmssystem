'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Download } from 'lucide-react';

export default function FullFinalSettlementPage() {
  const [settlements, setSettlements] = useState([
    { id: 1, empName: 'Rajesh Kumar', empId: 'EMP001', exitDate: '2026-02-28', noticePeriod: 60, status: 'Processing', basic: 60000, leave: 40000, gratuity: 125000, deductions: 30000, net: 195000 },
    { id: 2, empName: 'Priya Sharma', empId: 'EMP002', exitDate: '2026-03-15', noticePeriod: 30, status: 'Pending', basic: 55000, leave: 35000, gratuity: 110000, deductions: 28000, net: 172000 },
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Full & Final Settlement</h1>
          <p className="text-muted-foreground mt-2">Process employee exit and final settlements</p>
        </div>

        {/* Settlement Processing Guide */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <p className="font-semibold text-blue-900 dark:text-blue-100">Settlement Process</p>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                  <li>Verify final working days and notice period compliance</li>
                  <li>Calculate leave encashment at applicable rate</li>
                  <li>Process gratuity as per company policy</li>
                  <li>Deduct pending loans and advances</li>
                  <li>Generate settlement voucher and transfer final amount</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settlements List */}
        <div className="space-y-4">
          {settlements.map((settlement) => (
            <Card key={settlement.id} className="border-l-4 border-l-accent">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Employee Info */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Employee</p>
                      <p className="font-semibold text-foreground">{settlement.empName}</p>
                      <p className="text-xs text-muted-foreground">{settlement.empId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Exit Date</p>
                      <p className="font-semibold">{settlement.exitDate}</p>
                      <p className="text-xs text-muted-foreground">Notice Period: {settlement.noticePeriod} days</p>
                    </div>
                    <div>
                      <Badge className={settlement.status === 'Processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900' : 'bg-blue-100 text-blue-800 dark:bg-blue-900'}>
                        {settlement.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Settlement Breakdown */}
                  <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Final Salary</p>
                        <p className="font-bold">₹{settlement.basic.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Leave Encashment</p>
                        <p className="font-bold text-green-600">₹{settlement.leave.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gratuity</p>
                        <p className="font-bold text-green-600">₹{settlement.gratuity.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deductions</p>
                        <p className="font-bold text-red-600">₹{settlement.deductions.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="border-t pt-2">
                      <p className="text-muted-foreground text-sm">Net Payable</p>
                      <p className="text-2xl font-bold text-green-600">₹{settlement.net.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6 pt-4 border-t">
                  <Button variant="outline" size="sm">Review Details</Button>
                  <Button variant="outline" size="sm">Generate Settlement Letter</Button>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                  {settlement.status === 'Processing' && (
                    <Button size="sm" className="ml-auto gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Approve & Process
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Settlement Calculations Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Settlement Calculation Reference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h4 className="font-semibold mb-3">Leave Encashment</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>Accrued leave days × (Monthly Salary / 30)</li>
                  <li>Max applicable days per policy</li>
                  <li>At basic + DA rate</li>
                </ul>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h4 className="font-semibold mb-3">Gratuity (15Y service)</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>(Last salary × Service years) / 2</li>
                  <li>Max limit: ₹20,00,000</li>
                  <li>As per company policy</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
