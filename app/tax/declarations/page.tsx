'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const declarationSchema = z.object({
  financialYear: z.enum(['2023-2024', '2024-2025', '2025-2026', '2026-2027']),
  regime: z.enum(['Old', 'New']),
  declarations: z.array(z.object({
    section: z.string().min(1, 'Section is required'),
    amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
    proofUrl: z.string().optional(),
  })).min(1, 'At least one declaration is required'),
});

type DeclarationFormValues = z.infer<typeof declarationSchema>;

export default function TaxDeclarationsPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const form = useForm<DeclarationFormValues>({
    resolver: zodResolver(declarationSchema),
    defaultValues: {
      financialYear: '2024-2025',
      regime: 'New',
      declarations: [{ section: '', amount: 0, proofUrl: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'declarations',
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchDeclarations();
    }
  }, [isAuthenticated]);

  const fetchDeclarations = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTaxDeclarations();
      if (response.success && response.data) {
        setDeclarations(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch declarations');
      }
    } catch (error) {
      toast.error('An error occurred while fetching declarations');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: DeclarationFormValues) => {
    try {
      const response = await apiService.createTaxDeclaration(data);
      if (response.success) {
        toast.success('Tax declaration submitted successfully');
        setIsSubmitOpen(false);
        form.reset();
        fetchDeclarations();
      } else {
        toast.error(response.message || 'Failed to submit declaration');
      }
    } catch (error) {
      toast.error('An error occurred while submitting declaration');
    }
  };

  if (!isAuthenticated) {
    redirect('/login');
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</Badge>;
      case 'Submitted':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Submitted</Badge>;
      case 'Draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tax Declarations</h1>
            <p className="text-muted-foreground mt-2">Submit and manage your investment declarations</p>
          </div>
          <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Declaration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Tax Declaration</DialogTitle>
                <DialogDescription>
                  Declare your investments for tax saving. Please ensure proofs are uploaded where required.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Financial Year</Label>
                    <Controller
                      control={form.control}
                      name="financialYear"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2023-2024">2023-2024</SelectItem>
                            <SelectItem value="2024-2025">2024-2025</SelectItem>
                            <SelectItem value="2025-2026">2025-2026</SelectItem>
                            <SelectItem value="2026-2027">2026-2027</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Regime</Label>
                    <Controller
                      control={form.control}
                      name="regime"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Regime" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Old">Old Regime</SelectItem>
                            <SelectItem value="New">New Regime</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Declarations</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ section: '', amount: 0, proofUrl: '' })}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 bg-muted/50">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-sm font-medium">Item {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-6 w-6"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Section / Type</Label>
                          <Input
                            {...form.register(`declarations.${index}.section`)}
                            placeholder="e.g. 80C - LIC"
                          />
                          {form.formState.errors.declarations?.[index]?.section && (
                            <p className="text-xs text-destructive">{form.formState.errors.declarations[index]?.section?.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Amount (₹)</Label>
                          <Input
                            type="number"
                            {...form.register(`declarations.${index}.amount`)}
                            placeholder="0.00"
                          />
                          {form.formState.errors.declarations?.[index]?.amount && (
                            <p className="text-xs text-destructive">{form.formState.errors.declarations[index]?.amount?.message}</p>
                          )}
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label>Proof URL (Optional)</Label>
                          <Input
                            {...form.register(`declarations.${index}.proofUrl`)}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                  {form.formState.errors.declarations?.root && (
                    <p className="text-sm text-destructive">{form.formState.errors.declarations.root.message}</p>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsSubmitOpen(false)}>Cancel</Button>
                  <Button type="submit">Submit Declaration</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">Loading...</div>
        ) : declarations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p>No tax declarations found.</p>
              <p className="text-sm">Submit your first declaration to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {declarations.map((decl) => (
              <Card key={decl._id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">FY {decl.financialYear}</CardTitle>
                    <CardDescription>{decl.regime} Regime</CardDescription>
                  </div>
                  {getStatusBadge(decl.status)}
                </CardHeader>
                <CardContent>
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Declared Items:</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Section</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {decl.declarations.map((item: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{item.section}</TableCell>
                            <TableCell className="text-right">₹{item.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              {item.status === 'Approved' ? (
                                <span className="text-green-600 flex items-center text-xs"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</span>
                              ) : item.status === 'Rejected' ? (
                                <span className="text-red-600 flex items-center text-xs"><AlertCircle className="w-3 h-3 mr-1" /> Rejected</span>
                              ) : (
                                <span className="text-yellow-600 flex items-center text-xs"><Clock className="w-3 h-3 mr-1" /> Pending</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <span className="font-semibold">Total Declared:</span>
                      <span className="text-lg font-bold">
                        ₹{decl.declarations.reduce((sum: number, item: any) => sum + item.amount, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
