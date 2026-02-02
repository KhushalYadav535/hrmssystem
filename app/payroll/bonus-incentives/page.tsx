'use client';

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { bonusService, type Bonus } from '@/lib/mock-service';
import { Plus, Edit2, Trash2, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function BonusIncentivesPage() {
  const { isAuthenticated } = useAuth();
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'Quarterly' as 'Monthly' | 'Quarterly' | 'Yearly' | 'One-time',
    status: 'Active' as 'Active' | 'Inactive' | 'Processed',
    description: '',
  });

  useEffect(() => {
    setBonuses(bonusService.getAll());
  }, []);

  if (!isAuthenticated) redirect('/login');

  const incentives = [
    { id: 1, program: 'Sales Target', metric: 'Revenue', targetValue: '₹50 Cr', currentValue: '₹42.5 Cr', achievement: '85%', bonus: '₹15000/emp' },
    { id: 2, program: 'Customer Retention', metric: 'Satisfaction', targetValue: '95%', currentValue: '92%', achievement: '97%', bonus: '₹8000/emp' },
    { id: 3, program: 'Operational Efficiency', metric: 'Cost Reduction', targetValue: '10%', currentValue: '7.5%', achievement: '75%', bonus: 'Pending' },
  ];

  const handleCreateBonus = () => {
    if (!formData.name || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }
    const amount = formData.amount === 'Variable' ? 'Variable' : parseFloat(formData.amount);
    bonusService.create({
      name: formData.name,
      amount: amount,
      frequency: formData.frequency,
      status: formData.status,
      description: formData.description,
    });
    setBonuses(bonusService.getAll());
    setShowCreateDialog(false);
    setFormData({ name: '', amount: '', frequency: 'Quarterly', status: 'Active', description: '' });
    toast.success('Bonus created successfully!');
  };

  const handleEditBonus = (bonus: Bonus) => {
    setSelectedBonus(bonus);
    setFormData({
      name: bonus.name,
      amount: typeof bonus.amount === 'number' ? bonus.amount.toString() : bonus.amount,
      frequency: bonus.frequency,
      status: bonus.status,
      description: bonus.description || '',
    });
    setShowEditDialog(true);
  };

  const handleUpdateBonus = () => {
    if (!selectedBonus || !formData.name || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }
    const amount = formData.amount === 'Variable' ? 'Variable' : parseFloat(formData.amount);
    bonusService.update(selectedBonus.id, {
      ...formData,
      amount: amount,
    });
    setBonuses(bonusService.getAll());
    setShowEditDialog(false);
    setSelectedBonus(null);
    toast.success('Bonus updated successfully!');
  };

  const handleDeleteBonus = (id: number) => {
    if (confirm('Are you sure you want to delete this bonus?')) {
      bonusService.delete(id);
      setBonuses(bonusService.getAll());
      toast.success('Bonus deleted successfully!');
    }
  };

  const handleProcessBonus = (id: number) => {
    if (confirm('Process this bonus payment?')) {
      bonusService.process(id);
      setBonuses(bonusService.getAll());
      toast.success('Bonus processed successfully!');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bonus & Incentives</h1>
            <p className="text-muted-foreground mt-2">Manage bonuses, performance incentives, and variable pay</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Bonus
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Bonus</DialogTitle>
                <DialogDescription>Add a new bonus program</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Bonus Name *</Label>
                  <Input
                    placeholder="e.g., Performance Bonus"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input
                      placeholder="e.g., 50000 or Variable"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                        <SelectItem value="One-time">One-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Bonus description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateBonus} className="w-full">Create Bonus</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="bonuses">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
            <TabsTrigger value="incentives">Incentive Programs</TabsTrigger>
          </TabsList>

          <TabsContent value="bonuses" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading bonuses...</p>
              </div>
            ) : bonuses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No bonuses found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {bonuses.map((bonus) => {
                  const bonusId = bonus._id || bonus.id || '';
                  return (
                    <Card key={bonusId}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{bonus.name}</h3>
                            <p className="text-sm text-muted-foreground">{bonus.frequency}</p>
                          </div>
                          <Badge>{bonus.status}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Amount Per Employee</p>
                            <p className="text-lg font-bold">₹{typeof bonus.amount === 'number' ? bonus.amount.toLocaleString() : bonus.amount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Paid To Employees</p>
                            <p className="text-lg font-bold">{bonus.paidTo || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Outgo</p>
                            <p className="text-lg font-bold">₹{(typeof bonus.amount === 'number' ? bonus.amount * (bonus.paidTo || 0) : 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={() => handleEditBonus(bonus)}>
                            <Edit2 className="w-4 h-4 mr-2" />Edit
                          </Button>
                          {bonus.status === 'Active' && (
                            <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={() => handleProcessBonus(bonusId)}>
                              Process Bonus
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent text-red-600 hover:text-red-700" onClick={() => handleDeleteBonus(bonusId)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="incentives" className="space-y-4">
            <div className="grid gap-4">
              {incentives.map((prog) => (
                <Card key={prog.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="w-5 h-5 text-accent" />
                      <div>
                        <h3 className="text-lg font-semibold">{prog.program}</h3>
                        <p className="text-sm text-muted-foreground">{prog.metric}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="text-lg font-bold">{prog.targetValue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="text-lg font-bold">{prog.currentValue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Achievement</p>
                        <p className="text-lg font-bold text-primary">{prog.achievement}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Bonus Payable</p>
                        <p className="text-lg font-bold text-green-600">{prog.bonus}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">View Details</Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">Approve & Allocate</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Bonus Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Bonus</DialogTitle>
              <DialogDescription>Update bonus details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Bonus Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                      <SelectItem value="One-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Processed">Processed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdateBonus} className="w-full">Update Bonus</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
