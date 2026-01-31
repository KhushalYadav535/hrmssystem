'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function ProofUploadsPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) redirect('/login');

  const proofs = [
    { id: 1, category: 'Life Insurance', description: 'LIC Premium Certificate', fileName: 'LIC_Policy_2026.pdf', uploadDate: '2026-01-15', status: 'Approved', remarks: 'Document verified' },
    { id: 2, category: 'Health Insurance', description: 'Self Health Insurance Premium', fileName: 'Health_Insurance_2026.pdf', uploadDate: '2026-01-16', status: 'Approved', remarks: 'Valid premium receipt' },
    { id: 3, category: 'PPF Statement', description: 'Public Provident Fund', fileName: 'PPF_Account_Statement.pdf', uploadDate: '2026-01-10', status: 'Pending', remarks: 'Under review' },
    { id: 4, category: 'Home Loan', description: 'Home Loan Principal Certificate', fileName: 'Home_Loan_Certificate.pdf', uploadDate: '2026-01-20', status: 'Rejected', remarks: 'Please upload latest certificate' },
    { id: 5, category: 'Education Loan', description: 'Education Loan Interest Certificate', fileName: 'Edu_Loan_Interest.pdf', uploadDate: '2026-01-18', status: 'Approved', remarks: 'Verified from lender' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-50 dark:bg-green-950/20';
      case 'Rejected':
        return 'bg-red-50 dark:bg-red-950/20';
      default:
        return 'bg-yellow-50 dark:bg-yellow-950/20';
    }
  };

  const approvedCount = proofs.filter(p => p.status === 'Approved').length;
  const pendingCount = proofs.filter(p => p.status === 'Pending').length;
  const rejectedCount = proofs.filter(p => p.status === 'Rejected').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proof Uploads & Verification</h1>
          <p className="text-muted-foreground mt-2">Upload and track status of tax deduction supporting documents</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground">Total Documents</p>
              <p className="text-3xl font-bold mt-2">{proofs.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{approvedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{rejectedCount}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({proofs.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {proofs.map((proof) => (
              <Card key={proof.id} className={`${getStatusColor(proof.status)} border-l-4`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="flex-shrink-0">{getStatusIcon(proof.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{proof.category}</h3>
                          <Badge variant={proof.status === 'Approved' ? 'default' : proof.status === 'Rejected' ? 'destructive' : 'secondary'}>
                            {proof.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{proof.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>File: {proof.fileName}</span>
                          <span>Uploaded: {proof.uploadDate}</span>
                        </div>
                        {proof.remarks && (
                          <p className="text-sm mt-2 p-2 bg-card rounded">{proof.remarks}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline"><Download className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline"><Upload className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {proofs.filter(p => p.status === 'Approved').map((proof) => (
              <Card key={proof.id} className="bg-green-50 dark:bg-green-950/20 border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{proof.category}</p>
                        <p className="text-sm text-muted-foreground">{proof.description}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline"><Download className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {proofs.filter(p => p.status === 'Pending').map((proof) => (
              <Card key={proof.id} className="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-l-yellow-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{proof.category}</p>
                        <p className="text-sm text-muted-foreground">{proof.description} - Under Review</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {proofs.filter(p => p.status === 'Rejected').map((proof) => (
              <Card key={proof.id} className="bg-red-50 dark:bg-red-950/20 border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{proof.category}</p>
                        <p className="text-sm text-muted-foreground">{proof.remarks}</p>
                      </div>
                    </div>
                    <Button size="sm" className="gap-2"><Upload className="w-4 h-4" />Reupload</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
