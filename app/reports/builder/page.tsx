'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Eye, Share2, Trash2, Copy } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { formatDateDDMMYYYY } from '@/lib/date-format';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type CustomReportRow = {
  id: string;
  name: string;
  created: string;
  author: string;
  frequency: string;
  shared: number;
  status: string;
  /** Primary dataset for the report definition */
  dataSource?: string;
  /** Selected columns/fields to include */
  columns?: string[];
};

const REPORT_DATA_SOURCES: { id: string; label: string; columns: string[] }[] = [
  { id: 'employees', label: 'Employees', columns: ['Employee code', 'Name', 'Department', 'Designation', 'Join date', 'Status'] },
  { id: 'attendance', label: 'Attendance', columns: ['Date', 'Employee', 'Shift', 'In time', 'Out time', 'Status'] },
  { id: 'leave', label: 'Leave', columns: ['Employee', 'Leave type', 'From', 'To', 'Days', 'Status'] },
  { id: 'payroll', label: 'Payroll', columns: ['Period', 'Employee', 'Gross', 'Deductions', 'Net pay', 'Status'] },
];

const SEED_REPORTS: CustomReportRow[] = [
  { id: 'seed-1', name: 'Department Wise Payroll', created: '2026-02-01', author: 'You', frequency: 'Monthly', shared: 5, status: 'Active' },
  { id: 'seed-2', name: 'Attrition Analysis Q1', created: '2026-01-15', author: 'You', frequency: 'Quarterly', shared: 3, status: 'Active' },
];

function storageKey(tenantId: string | undefined, userId: string | undefined) {
  return `hrms-custom-reports:${tenantId || 'na'}:${userId || 'na'}`;
}

export default function CustomReportBuilderPage() {
  const { isAuthenticated, currentUser, currentTenant, hasPermission, hasRole } = useAuth();
  const [newReportOpen, setNewReportOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<CustomReportRow | null>(null);
  const [newReportName, setNewReportName] = useState('');
  const [newReportDataSource, setNewReportDataSource] = useState(REPORT_DATA_SOURCES[0]?.id ?? 'employees');
  const [newReportColumns, setNewReportColumns] = useState<string[]>(() => [...(REPORT_DATA_SOURCES[0]?.columns ?? [])]);
  const [customReports, setCustomReports] = useState<CustomReportRow[]>(SEED_REPORTS);

  const canUseReportBuilder = useMemo(() => {
    if (!isAuthenticated || !currentUser) return false;
    if (hasRole('Tenant Admin')) return true;
    return hasPermission('view_reports') || hasPermission('view_all_reports');
  }, [isAuthenticated, currentUser, hasPermission, hasRole]);

  useEffect(() => {
    if (!canUseReportBuilder || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(storageKey(currentTenant?.id, currentUser?.id));
      if (raw) {
        const parsed = JSON.parse(raw) as CustomReportRow[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomReports(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  }, [canUseReportBuilder, currentTenant?.id, currentUser?.id]);

  const persistReports = useCallback(
    (nextOrFn: CustomReportRow[] | ((prev: CustomReportRow[]) => CustomReportRow[])) => {
      setCustomReports((prev) => {
        const next = typeof nextOrFn === 'function' ? nextOrFn(prev) : nextOrFn;
        try {
          localStorage.setItem(storageKey(currentTenant?.id, currentUser?.id), JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [currentTenant?.id, currentUser?.id]
  );

  if (!isAuthenticated) {
    redirect('/login');
  }

  if (!canUseReportBuilder) {
    redirect('/dashboard');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Custom Report Builder</h1>
            <p className="text-muted-foreground mt-2">Create and manage custom reports with advanced filtering</p>
          </div>
          <Button className="gap-2" type="button" onClick={() => setNewReportOpen(true)}>
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </div>

        <Dialog
          open={newReportOpen}
          onOpenChange={(open) => {
            setNewReportOpen(open);
            if (open) {
              const src = REPORT_DATA_SOURCES[0];
              setNewReportDataSource(src?.id ?? 'employees');
              setNewReportColumns(src ? [...src.columns] : []);
            }
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New custom report</DialogTitle>
              <DialogDescription>
                Choose a name, data source, and fields. The definition is stored with the report in this browser for your user.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 max-h-[min(70vh,28rem)] overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label htmlFor="nr-name">Report name</Label>
                <Input
                  id="nr-name"
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  placeholder="e.g. Branch-wise attendance"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      (e.target as HTMLInputElement).form?.requestSubmit?.();
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Data source</Label>
                <Select
                  value={newReportDataSource}
                  onValueChange={(id) => {
                    setNewReportDataSource(id);
                    const def = REPORT_DATA_SOURCES.find((s) => s.id === id);
                    setNewReportColumns(def ? [...def.columns] : []);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_DATA_SOURCES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Include columns</Label>
                <p className="text-xs text-muted-foreground">Toggle individual fields for this report.</p>
                <div className="rounded-lg border border-border divide-y divide-border">
                  {(REPORT_DATA_SOURCES.find((s) => s.id === newReportDataSource)?.columns ?? []).map((col) => {
                    const checked = newReportColumns.includes(col);
                    return (
                      <div key={col} className="flex items-center gap-3 px-3 py-2">
                        <Checkbox
                          id={`nr-col-${col}`}
                          checked={checked}
                          onCheckedChange={(v) => {
                            const on = v === true;
                            setNewReportColumns((prev) =>
                              on ? (prev.includes(col) ? prev : [...prev, col]) : prev.filter((c) => c !== col)
                            );
                          }}
                        />
                        <label htmlFor={`nr-col-${col}`} className="text-sm cursor-pointer flex-1">
                          {col}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" type="button" onClick={() => setNewReportOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const name = newReportName.trim();
                  if (!name) {
                    toast.error('Please enter a report name');
                    return;
                  }
                  if (newReportColumns.length === 0) {
                    toast.error('Select at least one column');
                    return;
                  }
                  const today = new Date().toISOString().split('T')[0];
                  const row: CustomReportRow = {
                    id: `r-${Date.now()}`,
                    name,
                    created: today,
                    author: currentUser?.name || 'You',
                    frequency: 'On demand',
                    shared: 0,
                    status: 'Draft',
                    dataSource: newReportDataSource,
                    columns: [...newReportColumns],
                  };
                  persistReports((prev) => [row, ...prev]);
                  setNewReportName('');
                  setNewReportOpen(false);
                  toast.success(`Report “${name}” added to My Reports`);
                }}
              >
                Create report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!previewReport} onOpenChange={(open) => !open && setPreviewReport(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{previewReport?.name ?? 'Report'}</DialogTitle>
              <DialogDescription>
                Definition stored in this browser. Export runs a placeholder until a data API is connected.
              </DialogDescription>
            </DialogHeader>
            {previewReport && (
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                  <p>
                    <span className="text-muted-foreground">Created: </span>
                    {formatDateDDMMYYYY(previewReport.created)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Frequency: </span>
                    {previewReport.frequency}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Author: </span>
                    {previewReport.author}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status: </span>
                    {previewReport.status}
                  </p>
                  {previewReport.dataSource && (
                    <p>
                      <span className="text-muted-foreground">Data source: </span>
                      {REPORT_DATA_SOURCES.find((s) => s.id === previewReport.dataSource)?.label ??
                        previewReport.dataSource}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-foreground">Columns</Label>
                  {previewReport.columns && previewReport.columns.length > 0 ? (
                    <ul className="mt-2 list-inside list-disc text-muted-foreground">
                      {previewReport.columns.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-muted-foreground">
                      No column list (e.g. sample reports). Edit via Duplicate + delete old, or recreate from New Report.
                    </p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPreviewReport(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="my-reports" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-reports">My Reports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="my-reports">
            <div className="space-y-4">
              {customReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{report.name}</CardTitle>
                        <CardDescription>
                          Created {formatDateDDMMYYYY(report.created)} • {report.frequency}
                          {report.dataSource
                            ? ` • ${REPORT_DATA_SOURCES.find((s) => s.id === report.dataSource)?.label ?? report.dataSource}`
                            : ''}
                          {report.shared > 0 ? ` • Shared with ${report.shared} people` : ''}
                          {report.columns?.length ? ` • ${report.columns.length} column(s)` : ''}
                        </CardDescription>
                      </div>
                      <Badge className={report.status === 'Draft' ? 'bg-amber-600' : 'bg-green-600'}>{report.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {report.columns && report.columns.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Fields: </span>
                        {report.columns.join(', ')}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="gap-2"
                        type="button"
                        onClick={() => setPreviewReport(report)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent" type="button">
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent" type="button">
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent" type="button">
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-2"
                        type="button"
                        onClick={() => {
                          persistReports((prev) => prev.filter((r) => r.id !== report.id));
                          toast.success('Report removed');
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Employee Headcount', desc: 'Track employee count by department' },
                { name: 'Payroll Summary', desc: 'Monthly payroll breakdown' },
                { name: 'Leave Analysis', desc: 'Leave utilization statistics' },
                { name: 'Attrition Report', desc: 'Employee separation analysis' },
              ].map((template) => (
                <Card key={template.name} className="hover:shadow-lg transition cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      type="button"
                      onClick={() => {
                        const row: CustomReportRow = {
                          id: `tpl-${Date.now()}`,
                          name: `${template.name} (from template)`,
                          created: new Date().toISOString().split('T')[0],
                          author: currentUser?.name || 'You',
                          frequency: 'On demand',
                          shared: 0,
                          status: 'Draft',
                          dataSource: 'employees',
                          columns: ['Employee code', 'Name', 'Department'],
                        };
                        persistReports((prev) => [row, ...prev]);
                        toast.success('Template added to My Reports');
                      }}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Report Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { report: 'Department Wise Payroll', frequency: 'Monthly', nextRun: '2026-03-01 09:00', recipients: 'finance@company.com' },
                    { report: 'Attrition Analysis Q1', frequency: 'Quarterly', nextRun: '2026-04-01 08:00', recipients: 'hr-team@company.com' },
                  ].map((scheduled) => (
                    <div key={scheduled.report} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{scheduled.report}</p>
                          <p className="text-sm text-muted-foreground">{scheduled.frequency} • Next: {scheduled.nextRun}</p>
                        </div>
                        <Badge>{scheduled.frequency}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">To: {scheduled.recipients}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" type="button">
                          Edit Schedule
                        </Button>
                        <Button size="sm" variant="destructive" type="button">
                          Disable
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
