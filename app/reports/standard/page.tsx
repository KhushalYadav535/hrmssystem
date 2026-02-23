'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import apiService from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function StandardReportsPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const { toast } = useToast();
  const [reportTypes, setReportTypes] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportData, setReportData] = useState<{ rows: any[]; columns: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  if (!isAuthenticated || (!hasPermission('view_reports') && !hasPermission('view_all_reports'))) {
    redirect('/dashboard');
  }

  useEffect(() => {
    loadReportTypes();
  }, []);

  const loadReportTypes = async () => {
    try {
      const res = await apiService.getStandardReportTypes();
      if (res.success && res.data) {
        setReportTypes(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to load report types', error);
      toast({ title: 'Error', description: 'Failed to load report types', variant: 'destructive' });
    }
  };

  const handleGenerate = async () => {
    if (!selectedReport) {
      toast({ title: 'Error', description: 'Select a report type', variant: 'destructive' });
      return;
    }
    try {
      setIsLoading(true);
      setReportData(null);
      const res = await apiService.generateStandardReport(selectedReport, filters);
      if (res.success && res.data) {
        setReportData({ rows: res.data.rows || [], columns: res.data.columns || [] });
        toast({ title: 'Success', description: 'Report generated' });
      } else {
        toast({ title: 'Error', description: res.message || 'Failed to generate', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData || reportData.rows.length === 0) {
      toast({ title: 'Info', description: 'Generate report first', variant: 'default' });
      return;
    }
    const headers = reportData.columns.map((c) => c.label || c.field);
    const csv = [headers.join(','), ...reportData.rows.map((r) => headers.map((_, i) => {
      const val = reportData.columns[i]?.field;
      const v = val ? r[val] : '';
      return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
    }).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Success', description: 'Report exported' });
  };

  const byCategory = reportTypes.reduce((acc, r) => {
    const cat = r.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/reports" className="text-sm text-primary hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Reports
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Standard Reports</h1>
            <p className="text-muted-foreground mt-2">Generate pre-built HR reports</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Types</CardTitle>
                <CardDescription>Select a report and generate</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.entries(byCategory).map(([category, items]) => (
                  <div key={category} className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{category}</p>
                    <div className="space-y-1">
                      {items.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedReport(r.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                            selectedReport === r.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          {r.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-4" onClick={handleGenerate} disabled={isLoading || !selectedReport}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Report Preview</CardTitle>
                  {reportData && reportData.rows.length > 0 && (
                    <Button size="sm" onClick={handleExport} className="gap-2">
                      <Download className="w-4 h-4" />
                      Export CSV
                    </Button>
                  )}
                </div>
                <CardDescription>
                  {reportData ? `${reportData.rows.length} records` : 'Select and generate a report'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!reportData ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a report type and click Generate</p>
                  </div>
                ) : reportData.rows.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No data found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {reportData.columns.map((c) => (
                            <th key={c.field} className="text-left p-2 font-semibold">{c.label || c.field}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.rows.slice(0, 50).map((row, i) => (
                          <tr key={i} className="border-b hover:bg-secondary/30">
                            {reportData.columns.map((c) => (
                              <td key={c.field} className="p-2">
                                {row[c.field] != null ? String(row[c.field]) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {reportData.rows.length > 50 && (
                      <p className="text-xs text-muted-foreground mt-2">Showing first 50 of {reportData.rows.length} rows. Export for full data.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
