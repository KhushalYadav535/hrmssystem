'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function FamilyManagementPage() {
  const [members] = useState([
    { id: 1, name: 'Priya Sharma', relation: 'Spouse', dob: '1985-05-15', dependent: true, income: 0 },
    { id: 2, name: 'Aditya Sharma', relation: 'Son', dob: '2010-08-22', dependent: true, income: 0 },
    { id: 3, name: 'Ananya Sharma', relation: 'Daughter', dob: '2008-12-10', dependent: true, income: 0 },
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Family Details</h1>
          <Button className="gap-2"><Plus className="w-4 h-4" /> Add Family Member</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Family Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((member) => {
              const age = new Date().getFullYear() - new Date(member.dob).getFullYear();
              return (
                <div key={member.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{member.name}</h4>
                    <p className="text-xs text-muted-foreground">{member.relation} • Age: {age} • DOB: {member.dob}</p>
                  </div>
                  <div className="flex gap-2">
                    {member.dependent && <Badge variant="default">Dependent</Badge>}
                    <Button size="sm" variant="ghost"><Edit2 className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4 text-red-600" /></Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
