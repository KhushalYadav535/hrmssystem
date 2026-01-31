'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Download, Upload, Plus } from 'lucide-react';
import { useState } from 'react';

export default function ShiftRosterPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState('current');

  if (!isAuthenticated || !hasPermission('manage_attendance')) {
    redirect('/dashboard');
  }

  const shiftTemplates = [
    { name: 'Morning Shift', time: '08:00 - 16:00', color: '#3b82f6' },
    { name: 'Afternoon Shift', time: '12:00 - 20:00', color: '#10b981' },
    { name: 'Night Shift', time: '20:00 - 04:00', color: '#8b5cf6' },
    { name: 'General', time: '09:00 - 17:00', color: '#f59e0b' },
  ];

  const employees = [
    { id: 1, name: 'Rajesh Kumar', dept: 'Finance', current: 'General' },
    { id: 2, name: 'Priya Sharma', dept: 'IT', current: 'Morning' },
    { id: 3, name: 'Amit Verma', dept: 'Operations', current: 'Afternoon' },
    { id: 4, name: 'Suresh Patel', dept: 'Finance', current: 'Night' },
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shift Roster Management</h1>
            <p className="text-muted-foreground mt-2">Create and manage employee shift schedules</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Upload className="w-4 h-4" />
              Import
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">285</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rosters Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Swap Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">2</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="roster" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roster">Roster View</TabsTrigger>
            <TabsTrigger value="templates">Shift Templates</TabsTrigger>
            <TabsTrigger value="swaps">Shift Swaps</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="roster">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Weekly Roster</CardTitle>
                    <CardDescription>Employee shift assignments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Week</SelectItem>
                        <SelectItem value="next">Next Week</SelectItem>
                        <SelectItem value="next2">Week After Next</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-semibold">Employee</th>
                        {weekDays.map((day) => (
                          <th key={day} className="text-center p-3 font-semibold">{day}</th>
                        ))}
                        <th className="text-center p-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id} className="border-b border-border hover:bg-secondary/30">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{emp.dept}</p>
                            </div>
                          </td>
                          {weekDays.map((day) => (
                            <td key={day} className="p-3 text-center">
                              <div className="flex justify-center">
                                <Badge className={day === 'Sun' ? 'bg-red-600' : 'bg-green-600'}>
                                  {day === 'Sun' ? 'Off' : 'Gen'}
                                </Badge>
                              </div>
                            </td>
                          ))}
                          <td className="p-3 text-center">
                            <Button size="sm" variant="outline">Edit</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-4">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create New Template
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shiftTemplates.map((template) => (
                  <Card key={template.name}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: template.color }} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm font-medium">{template.time}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="swaps">
            <Card>
              <CardHeader>
                <CardTitle>Shift Swap Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { from: 'Rajesh Kumar', to: 'Priya Sharma', fromShift: 'Morning', toShift: 'Afternoon', date: '2026-02-05', status: 'Pending' },
                    { from: 'Amit Verma', to: 'Suresh Patel', fromShift: 'Night', toShift: 'Morning', date: '2026-02-10', status: 'Approved' },
                  ].map((swap, idx) => (
                    <div key={idx} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold">{swap.from} ↔ {swap.to}</p>
                          <p className="text-sm text-muted-foreground">{swap.fromShift} → {swap.toShift}</p>
                        </div>
                        <Badge className={swap.status === 'Pending' ? 'bg-yellow-600' : 'bg-green-600'}>
                          {swap.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {swap.status === 'Pending' && (
                          <>
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">Approve</Button>
                            <Button size="sm" variant="destructive" className="flex-1">Reject</Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Roster Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 font-semibold text-sm bg-secondary/50 rounded">{day}</div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="aspect-square p-2 border border-border rounded hover:bg-secondary/30 transition cursor-pointer">
                      <p className="text-sm">{(i % 28) + 1}</p>
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
