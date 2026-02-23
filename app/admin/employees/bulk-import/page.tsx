'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, FileCheck, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

/**
 * Bulk Employee Import/Export Page
 * BRD: BR-P0-006
 */
export default function BulkImportExportPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('import');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    exportType: 'complete',
    department: '',
    status: '',
    location: '',
    startDate: '',
    endDate: '',
  });

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      await apiService.downloadImportTemplate();
      toast.success('Template downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download template');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];
      const allowedExtensions = ['.xlsx', '.xls', '.csv'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
        toast.error('Invalid file type. Please upload .xlsx, .xls, or .csv file');
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size exceeds 50MB limit');
        return;
      }
      
      setSelectedFile(file);
      setValidationResult(null);
      setImportResult(null);
    }
  };

  const handleValidate = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    
    try {
      setLoading(true);
      const result = await apiService.validateBulkImport(selectedFile);
      
      if (result.success) {
        setValidationResult(result.data);
        toast.success(`Validation complete: ${result.data.validRows} valid, ${result.data.invalidRows} invalid`);
      } else {
        toast.error(result.message || 'Validation failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!validationResult || !validationResult.filePath) {
      toast.error('Please validate the file first');
      return;
    }
    
    if (validationResult.validRows === 0) {
      toast.error('No valid rows to import');
      return;
    }
    
    try {
      setLoading(true);
      const result = await apiService.bulkImportEmployees(validationResult.filePath, true);
      
      if (result.success) {
        setImportResult(result.data);
        toast.success(`Successfully imported ${result.data.imported} employees`);
        setSelectedFile(null);
        setValidationResult(null);
      } else {
        toast.error(result.message || 'Import failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await apiService.bulkExportEmployees(exportFilters);
      toast.success('Export started. File will download automatically.');
    } catch (error: any) {
      toast.error(error.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bulk Employee Import/Export</h1>
          <p className="text-muted-foreground mt-1">
            Import or export employee data in bulk (BR-P0-006)
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Import Employees</CardTitle>
                <CardDescription>
                  Import up to 10,000 employees at once using Excel or CSV file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={handleDownloadTemplate} disabled={loading}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Select File (.xlsx, .xls, or .csv)</Label>
                  <Input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    disabled={loading}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {selectedFile && (
                  <Button onClick={handleValidate} disabled={loading || !!validationResult}>
                    <FileCheck className="w-4 h-4 mr-2" />
                    Validate File
                  </Button>
                )}

                {validationResult && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Validation Results</AlertTitle>
                      <AlertDescription>
                        Total Rows: {validationResult.totalRows} | Valid: {validationResult.validRows} | Invalid: {validationResult.invalidRows}
                      </AlertDescription>
                    </Alert>

                    {validationResult.invalidRows > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Validation Errors</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="max-h-96 overflow-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Row</TableHead>
                                  <TableHead>Employee Code</TableHead>
                                  <TableHead>Errors</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {validationResult.validationResults
                                  .filter((r: any) => !r.isValid)
                                  .slice(0, 50)
                                  .map((result: any) => (
                                    <TableRow key={result.rowIndex}>
                                      <TableCell>{result.rowIndex}</TableCell>
                                      <TableCell>{result.employeeCode || '-'}</TableCell>
                                      <TableCell>
                                        <div className="space-y-1">
                                          {result.errors.map((error: string, idx: number) => (
                                            <Badge key={idx} variant="destructive" className="mr-1">
                                              {error}
                                            </Badge>
                                          ))}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {validationResult.validRows > 0 && (
                      <Button onClick={handleImport} disabled={loading} className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        Import {validationResult.validRows} Valid Employees
                      </Button>
                    )}
                  </div>
                )}

                {importResult && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Import Complete</AlertTitle>
                    <AlertDescription>
                      Imported: {importResult.imported} | Failed: {importResult.failed}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Export Employees</CardTitle>
                <CardDescription>
                  Export up to 50,000 employees with filters and custom formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Export Type</Label>
                    <Select
                      value={exportFilters.exportType}
                      onValueChange={(value) => setExportFilters({ ...exportFilters, exportType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="complete">Complete Employee Master</SelectItem>
                        <SelectItem value="basic">Basic Details Only</SelectItem>
                        <SelectItem value="statutory">Statutory Compliance</SelectItem>
                        <SelectItem value="payroll">Payroll Details</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      value={exportFilters.department}
                      onChange={(e) => setExportFilters({ ...exportFilters, department: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={exportFilters.status}
                      onValueChange={(value) => setExportFilters({ ...exportFilters, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={exportFilters.location}
                      onChange={(e) => setExportFilters({ ...exportFilters, location: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={exportFilters.startDate}
                      onChange={(e) => setExportFilters({ ...exportFilters, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={exportFilters.endDate}
                      onChange={(e) => setExportFilters({ ...exportFilters, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleExport} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Employees
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
