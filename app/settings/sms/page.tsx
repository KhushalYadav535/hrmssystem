'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Send, Settings, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function SMSIntegrationPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [senderId, setSenderId] = useState('INDBNK');
  const [gatewayProvider, setGatewayProvider] = useState('twilio');

  if (!isAuthenticated || !hasPermission('manage_settings')) {
    redirect('/dashboard');
  }

  const smsTemplates = [
    {
      id: 'payroll',
      name: 'Payroll Notification',
      template: 'Your salary for {month} has been credited. Download payslip: {link}',
      enabled: true,
    },
    {
      id: 'leave',
      name: 'Leave Approval',
      template: 'Your leave from {start_date} to {end_date} has been {status} by {manager_name}',
      enabled: true,
    },
    {
      id: 'travel',
      name: 'Travel Advance',
      template: 'Travel advance of ₹{amount} approved. Amount will be credited in next salary',
      enabled: true,
    },
    {
      id: 'tax',
      name: 'Tax Reminder',
      template: 'Reminder: Submit investment proofs by {deadline}. Pending: ₹{amount}',
      enabled: true,
    },
    {
      id: 'otp',
      name: 'OTP',
      template: 'Your HRMS OTP is {otp}. Valid for 5 minutes',
      enabled: true,
    },
  ];

  const smsStats = {
    totalSent: 125000,
    delivered: 122500,
    failed: 2500,
    deliveryRate: 98,
    costPerSMS: 0.15,
    totalCost: 18750,
  };

  const handleTestSMS = () => {
    toast.success('Test SMS sent successfully!');
  };

  const handleSaveSettings = () => {
    toast.success('SMS settings saved successfully!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SMS Integration</h1>
          <p className="text-muted-foreground mt-2">Configure SMS gateway and notification templates</p>
        </div>

        {/* Status Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <MessageSquare className={`w-8 h-8 ${smsEnabled ? 'text-green-600' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-semibold">SMS Gateway Status</p>
                  <p className="text-sm text-muted-foreground">
                    {smsEnabled ? 'SMS integration is active' : 'SMS integration is disabled'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
                <Badge className={smsEnabled ? 'bg-green-600' : 'bg-gray-600'}>
                  {smsEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{smsStats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
                <p className="text-2xl font-bold text-green-600">{smsStats.deliveryRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">{smsStats.delivered.toLocaleString()} delivered</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{smsStats.failed.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">₹{smsStats.totalCost.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">₹{smsStats.costPerSMS} per SMS</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <Tabs defaultValue="settings" className="w-full">
          <TabsList>
            <TabsTrigger value="settings">Gateway Settings</TabsTrigger>
            <TabsTrigger value="templates">Message Templates</TabsTrigger>
            <TabsTrigger value="test">Test SMS</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SMS Gateway Configuration</CardTitle>
                <CardDescription>Configure SMS gateway provider settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Gateway Provider</Label>
                  <Select value={gatewayProvider} onValueChange={setGatewayProvider}>
                    <SelectTrigger id="provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="msg91">MSG91</SelectItem>
                      <SelectItem value="textlocal">TextLocal</SelectItem>
                      <SelectItem value="custom">Custom Gateway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderId">Sender ID</Label>
                  <Input
                    id="senderId"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="INDBNK"
                  />
                  <p className="text-xs text-muted-foreground">
                    Sender ID must be registered with DND registry
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter API key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    placeholder="Enter API secret"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint">API Endpoint</Label>
                  <Input
                    id="endpoint"
                    placeholder="https://api.gateway.com/send"
                  />
                </div>

                <Button onClick={handleSaveSettings} className="gap-2">
                  <Settings className="w-4 h-4" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SMS Message Templates</CardTitle>
                <CardDescription>Manage SMS templates for different notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {smsTemplates.map((template) => (
                    <Card key={template.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <p className="font-semibold">{template.name}</p>
                              <Switch checked={template.enabled} />
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm font-mono">{template.template}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Variables: {template.template.match(/\{([^}]+)\}/g)?.join(', ') || 'None'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test SMS</CardTitle>
                <CardDescription>Send a test SMS to verify gateway configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testPhone">Phone Number</Label>
                  <Input
                    id="testPhone"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testMessage">Test Message</Label>
                  <textarea
                    id="testMessage"
                    className="w-full p-3 border rounded-lg"
                    rows={3}
                    placeholder="Enter test message..."
                    defaultValue="This is a test SMS from Indian Bank HRMS"
                  />
                </div>
                <Button onClick={handleTestSMS} className="gap-2">
                  <Send className="w-4 h-4" />
                  Send Test SMS
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
