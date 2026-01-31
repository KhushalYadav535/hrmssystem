'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function ProofUploadPage() {
  const [proofs] = useState([
    { id: 1, type: 'Life Insurance (80C)', status: 'Approved', uploadDate: '2025-12-15', docName: 'insurance_policy.pdf', amount: 150000 },
    { id: 2, type: 'PPF Statement (80C)', status: 'Approved', uploadDate: '2025-12-18', docName: 'ppf_statement.pdf', amount: 100000 },
    { id: 3, type: 'Medical Insurance (80D)', status: 'Pending', uploadDate: '2026-01-10', docName: 'health_insurance.pdf', amount: 25000 },
    { id: 4, type: 'Education Loan (80E)', status: 'Rejected', uploadDate: '2026-01-15', docName: 'loan_statement.pdf', amount: 50000 },
    { id: 5, type: 'NPS Statement (80CCD)', status: 'Under Review', uploadDate: '2026-02-01', docName: 'nps_statement.pdf', amount: 50000 },
  ]);

  const statusConfig = {
    'Approved': { icon: CheckCircle2, color: 'bg-green-100 text-green-800 dark:bg-green-900' },
    'Pending': { icon: Clock, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900' },
    'Rejected': { icon: AlertCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900' },
    'Under Review': { icon: Clock, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900' },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Tax Proof Upload Status</h1>
          <Button className="gap-2"><Upload className="w-4 h-4" /> Upload Document</Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Proofs</p>
              <p className="text-3xl font-bold text-foreground">5</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-3xl font-bold text-green-600">2</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600">2</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-3xl font-bold text-red-600">1</p>
            </CardContent>
          </Card>
        </div>

        {/* Proofs List */}
        <Card>
          <CardHeader>
            <CardTitle>Document Submission Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proofs.map((proof) => {
              const config = statusConfig[proof.status as keyof typeof statusConfig];
              const Icon = config.icon;
              return (
                <div key={proof.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold text-foreground">{proof.type}</h4>
                        <p className="text-xs text-muted-foreground">{proof.docName} • Uploaded: {proof.uploadDate}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-foreground">₹{proof.amount.toLocaleString()}</p>
                  </div>
                  <Badge className={config.color}>{proof.status}</Badge>
                  <Button size="sm" variant="ghost" className="ml-2"><Download className="w-4 h-4" /></Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Action Required</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span>•</span> Medical Insurance proof (80D) - Pending HR approval</li>
              <li className="flex gap-2"><span>•</span> Education Loan proof (80E) - Rejected: Upload certified copy</li>
              <li className="flex gap-2"><span>•</span> NPS Statement - Under review by Finance</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
