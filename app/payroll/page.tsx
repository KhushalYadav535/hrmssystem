'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Eye, Send, FileText, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PayrollPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (!isAuthenticated) {
    redirect('/login');
  }

  // Permission check
  const canViewAll = hasPermission('process_payroll') || hasPermission('view_payroll_reports');
  const isEmployee = !canViewAll;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = ['2024', '2025', '2026'];

  const generatePayslipPDF = (payroll: any) => {
    const doc = new jsPDF();
    
    // Company Header
    doc.setFontSize(18);
    doc.text('HRMS System', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Payslip for the month of ' + payroll.month + ' ' + payroll.year, 105, 25, { align: 'center' });
    
    // Employee Details
    doc.setFontSize(10);
    doc.text(`Employee Name: ${payroll.employeeId?.firstName || ''} ${payroll.employeeId?.lastName || ''}`, 15, 40);
    doc.text(`Employee Code: ${payroll.employeeId?.employeeCode || 'N/A'}`, 15, 46);
    doc.text(`Department: ${payroll.employeeId?.department || 'N/A'}`, 120, 40);
    doc.text(`Designation: ${payroll.employeeId?.designation || 'N/A'}`, 120, 46);
    
    // Earnings & Deductions Table
    const earnings = [
      ['Basic Salary', `Rs. ${payroll.basicSalary?.toLocaleString()}`],
      ['HRA', `Rs. ${payroll.hra?.toLocaleString() || '0'}`],
      ['DA', `Rs. ${payroll.da?.toLocaleString() || '0'}`],
      ['Other Allowances', `Rs. ${payroll.allowances?.toLocaleString() || '0'}`],
      ['Total Earnings', `Rs. ${((payroll.basicSalary || 0) + (payroll.hra || 0) + (payroll.da || 0) + (payroll.allowances || 0)).toLocaleString()}`]
    ];
    
    const deductions = [
      ['PF Contribution', `Rs. ${payroll.pfDeduction?.toLocaleString() || '0'}`],
      ['ESI Contribution', `Rs. ${payroll.esiDeduction?.toLocaleString() || '0'}`],
      ['Income Tax (TDS)', `Rs. ${payroll.incomeTax?.toLocaleString() || '0'}`],
      ['Total Deductions', `Rs. ${((payroll.pfDeduction || 0) + (payroll.esiDeduction || 0) + (payroll.incomeTax || 0)).toLocaleString()}`]
    ];
    
    autoTable(doc, {
      startY: 55,
      head: [['Earnings', 'Amount', 'Deductions', 'Amount']],
      body: earnings.map((e, i) => {
        const d = deductions[i] || ['', ''];
        return [e[0], e[1], d[0], d[1]];
      }),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
    
    // Net Salary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Net Salary Payable: Rs. ${payroll.netSalary?.toLocaleString()}`, 15, finalY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`(In words: ${toWords(payroll.netSalary || 0)} Only)`, 15, finalY + 6);
    
    // Footer
    doc.text('This is a computer-generated payslip and does not require a signature.', 105, 280, { align: 'center' });
    
    doc.save(`Payslip_${payroll.month}_${payroll.year}.pdf`);
  };

  // Helper to convert number to words (simplified)
  const toWords = (num: number) => {
    // Simple placeholder - for a real app, use a library like 'number-to-words'
    return num.toString(); 
  };

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const params: any = { year: parseInt(selectedYear) };
      if (selectedMonth) params.month = selectedMonth;
      
      const res = await apiService.getPayrolls(params);
      
      if (res.success && res.data) {
        setPayrolls(Array.isArray(res.data) ? res.data : []);
      } else {
        setPayrolls([]);
      }
    } catch (error) {
      console.error('Failed to fetch payrolls', error);
      toast.error('Failed to load payroll records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayrolls();
    }
  }, [isAuthenticated, selectedMonth, selectedYear]);

  // Employee View Component
  const EmployeePayrollView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Payslips</h1>
          <p className="text-muted-foreground mt-2">View and download your monthly payslips</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex gap-4 items-end">
            <div className="w-48">
              <label className="text-sm font-semibold mb-2 block">Select Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payslips List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Salary History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-semibold">Month & Year</th>
                  <th className="text-right p-3 font-semibold">Basic</th>
                  <th className="text-right p-3 font-semibold">Allowances</th>
                  <th className="text-right p-3 font-semibold">Deductions</th>
                  <th className="text-right p-3 font-semibold">Net Salary</th>
                  <th className="text-center p-3 font-semibold">Status</th>
                  <th className="text-center p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No payslips found for {selectedYear}
                    </td>
                  </tr>
                ) : (
                  payrolls.map((payroll) => (
                    <tr key={payroll._id} className="border-b border-border hover:bg-secondary/50">
                      <td className="p-3 font-medium">{payroll.month} {payroll.year}</td>
                      <td className="text-right p-3">₹{payroll.basicSalary?.toLocaleString()}</td>
                      <td className="text-right p-3">₹{((payroll.da || 0) + (payroll.hra || 0) + (payroll.allowances || 0)).toLocaleString()}</td>
                      <td className="text-right p-3 text-red-600">-₹{((payroll.pfDeduction || 0) + (payroll.esiDeduction || 0) + (payroll.incomeTax || 0)).toLocaleString()}</td>
                      <td className="text-right p-3 font-bold text-green-600">₹{payroll.netSalary?.toLocaleString()}</td>
                      <td className="text-center p-3">
                        <Badge variant={payroll.status === 'Paid' ? 'default' : 'secondary'} className={payroll.status === 'Paid' ? 'bg-green-100 text-green-700' : ''}>
                          {payroll.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="ghost" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" title="Download PDF" onClick={() => generatePayslipPDF(payroll)}>
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Admin View Component
  const AdminPayrollView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
        <p className="text-muted-foreground mt-2">View and manage employee payroll</p>
      </div>

      {/* Month/Year Selection */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-64">
              <label className="text-sm font-semibold mb-2 block">Select Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-64">
              <label className="text-sm font-semibold mb-2 block">Select Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasPermission('process_payroll') && (
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Process Payroll
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payroll Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Salary</p>
              <p className="text-2xl font-bold">₹{payrolls.reduce((sum, p) => sum + (p.basicSalary || 0), 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Deductions</p>
              <p className="text-2xl font-bold">₹{payrolls.reduce((sum, p) => sum + ((p.pfDeduction || 0) + (p.esiDeduction || 0) + (p.incomeTax || 0)), 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Net Payroll</p>
              <p className="text-2xl font-bold text-green-600">₹{payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Details */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Payroll Details</CardTitle>
          <CardDescription>{payrolls.length} records found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-semibold">Employee</th>
                  <th className="text-left p-3 font-semibold">Period</th>
                  <th className="text-right p-3 font-semibold">Basic</th>
                  <th className="text-right p-3 font-semibold">Allowances</th>
                  <th className="text-right p-3 font-semibold">Deductions</th>
                  <th className="text-right p-3 font-semibold">Net Salary</th>
                  <th className="text-center p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll._id} className="border-b border-border hover:bg-secondary/50">
                    <td className="p-3">
                      <div className="font-medium">{payroll.employeeId?.firstName} {payroll.employeeId?.lastName}</div>
                      <div className="text-xs text-muted-foreground">{payroll.employeeId?.employeeCode}</div>
                    </td>
                    <td className="p-3">{payroll.month} {payroll.year}</td>
                    <td className="text-right p-3">₹{payroll.basicSalary?.toLocaleString()}</td>
                    <td className="text-right p-3">₹{((payroll.da || 0) + (payroll.hra || 0) + (payroll.allowances || 0)).toLocaleString()}</td>
                    <td className="text-right p-3 text-red-600">-₹{((payroll.pfDeduction || 0) + (payroll.esiDeduction || 0) + (payroll.incomeTax || 0)).toLocaleString()}</td>
                    <td className="text-right p-3 font-semibold text-green-600">₹{payroll.netSalary?.toLocaleString()}</td>
                    <td className="text-center p-3">
                      <Badge className={payroll.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {payroll.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      {hasPermission('process_payroll') && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Export & Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export as Excel
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export as PDF
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Bank File (NEFT)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      {isEmployee ? <EmployeePayrollView /> : <AdminPayrollView />}
    </DashboardLayout>
  );
}
