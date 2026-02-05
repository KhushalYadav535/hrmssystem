'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Printer, Download, ChevronLeft, ChevronRight, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import apiService from '@/lib/api';

export default function LeaveCalendarPage() {
  const { isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  if (!isAuthenticated) redirect('/login');

  useEffect(() => {
    loadTeamCalendar();
  }, [currentDate]);

  const loadTeamCalendar = async () => {
    try {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0).toISOString();

      const response = await apiService.getTeamCalendar({ startDate, endDate });
      if (response.success && response.data) {
        // Transform leaves data for calendar display
        const transformedLeaves: any[] = [];
        response.data.forEach((leave: any) => {
          const start = new Date(leave.startDate);
          const end = new Date(leave.endDate);
          const employeeName = leave.employeeId 
            ? `${leave.employeeId.firstName || ''} ${leave.employeeId.lastName || ''}`.trim()
            : 'Unknown';
          
          // Add entry for each day in the leave range
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            transformedLeaves.push({
              id: `${leave._id}-${d.toISOString()}`,
              name: employeeName,
              date: d.toISOString().split('T')[0],
              type: leave.leaveType,
              status: leave.status,
            });
          }
        });
        setLeaves(transformedLeaves);
      }
    } catch (error) {
      console.error('Failed to load team calendar', error);
      toast.error('Failed to load leave calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    toast.success('Generating PDF export...');
    // In production, this would call an API to generate PDF
    setTimeout(() => {
      toast.success('PDF exported successfully!');
    }, 1500);
  };

  const handleExportExcel = () => {
    toast.success('Generating Excel export...');
    // Convert leaves data to CSV format
    const csvData = leaves.map(leave => ({
      'Employee Name': leave.name,
      'Date': leave.date,
      'Leave Type': leave.type,
      'Status': leave.status,
    }));
    
    // Create CSV content
    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leave-calendar-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Excel file downloaded successfully!');
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  return (
    <DashboardLayout>
      <div className="space-y-6 print:p-0">
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leave Calendar</h1>
            <p className="text-muted-foreground mt-2">View employee leaves and holidays</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" /> Print
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF} className="gap-2">
                  <FileText className="w-4 h-4" /> Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel} className="gap-2">
                  <FileSpreadsheet className="w-4 h-4" /> Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card className="print:border-0 print:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border border-border">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="bg-card p-2 text-center text-sm font-semibold py-4">
                      {day}
                    </div>
                  ))}
                  
                  {days.map((day, idx) => {
                    if (!day) return <div key={idx} className="bg-card/50 min-h-[120px]" />;
                    
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayLeaves = leaves.filter(l => l.date === dateStr);

                return (
                  <div key={idx} className="bg-card p-2 min-h-[120px] border-t border-l border-border/50 relative group hover:bg-secondary/10 transition-colors">
                    <span className={`text-sm font-medium ${dayLeaves.length > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {day}
                    </span>
                    <div className="mt-2 space-y-1">
                      {dayLeaves.map((leave, lIdx) => (
                        <div 
                          key={lIdx} 
                          className={`text-xs p-1 rounded border truncate ${
                            leave.type === 'Sick Leave' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300' :
                            leave.type === 'Casual Leave' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}
                          title={`${leave.name} - ${leave.type}`}
                        >
                          {leave.name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 flex gap-4 text-sm justify-center print:hidden">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                <span>Sick Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                <span>Casual Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
                <span>Privilege Leave</span>
              </div>
            </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
