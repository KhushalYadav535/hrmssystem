'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Send, CheckCircle2, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function OfferLetterPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [offerStatus, setOfferStatus] = useState<'draft' | 'sent' | 'accepted'>('draft');
  const [formData, setFormData] = useState({
    candidateName: '',
    position: '',
    department: '',
    joiningDate: '',
    ctc: '',
    basicSalary: '',
    hra: '',
    specialAllowance: '',
    otherBenefits: '',
    probationPeriod: '6',
    noticePeriod: '30',
    terms: '',
  });

  if (!isAuthenticated || !hasPermission('manage_onboarding')) {
    redirect('/dashboard');
  }

  const candidates = [
    { id: '1', name: 'Rajesh Kumar', position: 'Senior Analyst', email: 'rajesh.kumar@email.com' },
    { id: '2', name: 'Priya Desai', position: 'Software Engineer', email: 'priya.desai@email.com' },
  ];

  const handleGenerate = () => {
    if (!formData.candidateName || !formData.position || !formData.ctc) {
      toast.error('Please fill all required fields');
      return;
    }
    toast.success('Offer letter generated successfully!');
    setOfferStatus('draft');
  };

  const handleSend = () => {
    toast.success('Offer letter sent to candidate via email');
    setOfferStatus('sent');
  };

  const handleDownload = () => {
    toast.success('Downloading offer letter PDF...');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Digital Offer Letter</h1>
            <p className="text-muted-foreground mt-2">Generate and send digital offer letters to candidates</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select candidate" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Offer Details</TabsTrigger>
            <TabsTrigger value="ctc">CTC Breakup</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Candidate & Position Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidateName">Candidate Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="candidateName"
                      value={formData.candidateName}
                      onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position <span className="text-red-500">*</span></Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joiningDate">Joining Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="joiningDate"
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probationPeriod">Probation Period (months)</Label>
                    <Select value={formData.probationPeriod} onValueChange={(value) => setFormData({ ...formData, probationPeriod: value })}>
                      <SelectTrigger id="probationPeriod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noticePeriod">Notice Period (days)</Label>
                    <Input
                      id="noticePeriod"
                      type="number"
                      value={formData.noticePeriod}
                      onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ctc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>CTC Breakup</CardTitle>
                <CardDescription>Cost to Company details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ctc">Total CTC (per annum) <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">₹</span>
                    <Input
                      id="ctc"
                      type="number"
                      placeholder="0"
                      value={formData.ctc}
                      onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basicSalary">Basic Salary</Label>
                    <Input
                      id="basicSalary"
                      type="number"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hra">HRA</Label>
                    <Input
                      id="hra"
                      type="number"
                      value={formData.hra}
                      onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialAllowance">Special Allowance</Label>
                    <Input
                      id="specialAllowance"
                      type="number"
                      value={formData.specialAllowance}
                      onChange={(e) => setFormData({ ...formData, specialAllowance: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherBenefits">Other Benefits</Label>
                  <Textarea
                    id="otherBenefits"
                    placeholder="PF, Medical Insurance, Gratuity, etc."
                    value={formData.otherBenefits}
                    onChange={(e) => setFormData({ ...formData, otherBenefits: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Offer Letter Preview</CardTitle>
                    <CardDescription>Review before sending</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownload} className="gap-2">
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                    <Button onClick={handleSend} className="gap-2" disabled={offerStatus === 'sent'}>
                      <Send className="w-4 h-4" />
                      Send to Candidate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-8 space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">INDIAN BANK</h2>
                    <p className="text-muted-foreground">Appointment Letter</p>
                  </div>

                  <div className="space-y-2">
                    <p>Date: {formatDateDDMMYYYY(new Date())}</p>
                    <p className="font-semibold">{formData.candidateName || 'Candidate Name'}</p>
                    <p>{formData.department || 'Department'}</p>
                  </div>

                  <div className="space-y-3">
                    <p>Dear {formData.candidateName || 'Candidate'},</p>
                    <p>
                      We are pleased to offer you the position of <strong>{formData.position || 'Position'}</strong> in the 
                      <strong> {formData.department || 'Department'}</strong> department at Indian Bank.
                    </p>
                    <p>
                      Your joining date will be <strong>{formData.joiningDate || 'Joining Date'}</strong>. 
                      The probation period will be <strong>{formData.probationPeriod} months</strong>.
                    </p>
                  </div>

                  {formData.ctc && (
                    <div className="space-y-2">
                      <p className="font-semibold">Compensation:</p>
                      <p>Total CTC: ₹{parseFloat(formData.ctc).toLocaleString()} per annum</p>
                      {formData.basicSalary && <p>Basic Salary: ₹{parseFloat(formData.basicSalary).toLocaleString()}</p>}
                      {formData.hra && <p>HRA: ₹{parseFloat(formData.hra).toLocaleString()}</p>}
                      {formData.specialAllowance && <p>Special Allowance: ₹{parseFloat(formData.specialAllowance).toLocaleString()}</p>}
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      This offer is subject to background verification and document submission.
                    </p>
                  </div>

                  <div className="pt-4 border-t text-right">
                    <p className="font-semibold">Authorized Signatory</p>
                    <p className="text-sm text-muted-foreground">Indian Bank</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3">
          <Button onClick={handleGenerate} className="gap-2">
            <FileText className="w-4 h-4" />
            Generate Offer Letter
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
