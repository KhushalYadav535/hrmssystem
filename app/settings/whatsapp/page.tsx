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
import { MessageCircle, Send, Settings, CheckCircle2, Bot, FileText, Image } from 'lucide-react';
import { toast } from 'sonner';

export default function WhatsAppIntegrationPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [businessAccount, setBusinessAccount] = useState('verified');
  const [chatbotEnabled, setChatbotEnabled] = useState(true);

  if (!isAuthenticated || !hasPermission('manage_settings')) {
    redirect('/dashboard');
  }

  const whatsappTemplates = [
    {
      id: 'payroll',
      name: 'Salary Credited',
      template: '✅ Salary Credited | ₹{amount} credited for {month}. Download payslip: [Button: View Payslip]',
      type: 'interactive',
      status: 'approved',
    },
    {
      id: 'leave',
      name: 'Leave Approval',
      template: '🌴 Leave Approved | Your leave from {start_date} to {end_date} approved by {manager}. Enjoy! 😊',
      type: 'text',
      status: 'approved',
    },
    {
      id: 'travel',
      name: 'Travel Advance',
      template: '✈️ Travel Advance Approved | ₹{amount} for {destination} trip. Payment in next salary.',
      type: 'text',
      status: 'pending',
    },
  ];

  const whatsappStats = {
    totalSent: 85000,
    delivered: 84000,
    read: 80000,
    readRate: 95,
    chatbotQueries: 12000,
    chatbotResolved: 8400,
    resolutionRate: 70,
  };

  const chatbotIntents = [
    { intent: 'leave_balance', queries: 3500, resolved: 3150 },
    { intent: 'payslip_download', queries: 2800, resolved: 2520 },
    { intent: 'apply_leave', queries: 2100, resolved: 1680 },
    { intent: 'policy_query', queries: 1800, resolved: 1260 },
    { intent: 'claim_status', queries: 1800, resolved: 1620 },
  ];

  const handleTestWhatsApp = () => {
    toast.success('Test WhatsApp message sent!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">WhatsApp Integration</h1>
          <p className="text-muted-foreground mt-2">Configure WhatsApp Business API and chatbot</p>
        </div>

        {/* Status Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <MessageCircle className={`w-8 h-8 ${whatsappEnabled ? 'text-green-600' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-semibold">WhatsApp Business API Status</p>
                  <p className="text-sm text-muted-foreground">
                    {whatsappEnabled ? 'WhatsApp integration is active' : 'WhatsApp integration is disabled'}
                  </p>
                  {businessAccount === 'verified' && (
                    <Badge className="bg-green-600 mt-2">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified Business Account
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
                <Badge className={whatsappEnabled ? 'bg-green-600' : 'bg-gray-600'}>
                  {whatsappEnabled ? 'Enabled' : 'Disabled'}
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
                <p className="text-sm text-muted-foreground">Messages Sent</p>
                <p className="text-2xl font-bold">{whatsappStats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Read Rate</p>
                <p className="text-2xl font-bold text-green-600">{whatsappStats.readRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">{whatsappStats.read.toLocaleString()} read</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Chatbot Queries</p>
                <p className="text-2xl font-bold">{whatsappStats.chatbotQueries.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-bold text-blue-600">{whatsappStats.resolutionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Auto-resolved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="settings" className="w-full">
          <TabsList>
            <TabsTrigger value="settings">API Settings</TabsTrigger>
            <TabsTrigger value="templates">Message Templates</TabsTrigger>
            <TabsTrigger value="chatbot">Chatbot Configuration</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Business API Configuration</CardTitle>
                <CardDescription>Configure WhatsApp Business Solution Provider (BSP)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bsp">Business Solution Provider</Label>
                  <Select defaultValue="twilio">
                    <SelectTrigger id="bsp">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="messagebird">MessageBird</SelectItem>
                      <SelectItem value="gupshup">Gupshup</SelectItem>
                      <SelectItem value="meta">Meta (Direct)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                  <Input id="phoneNumberId" placeholder="Enter WhatsApp Business Phone Number ID" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input id="accessToken" type="password" placeholder="Enter access token" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input id="webhookUrl" placeholder="https://your-domain.com/webhook/whatsapp" />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Business Account Verification
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Your WhatsApp Business account is verified with green tick. All message templates are approved by Meta.
                  </p>
                </div>

                <Button className="gap-2">
                  <Settings className="w-4 h-4" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Message Templates</CardTitle>
                <CardDescription>Manage approved message templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {whatsappTemplates.map((template) => (
                    <Card key={template.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <p className="font-semibold">{template.name}</p>
                              <Badge className={template.status === 'approved' ? 'bg-green-600' : 'bg-yellow-600'}>
                                {template.status === 'approved' ? 'Approved' : 'Pending'}
                              </Badge>
                              {template.type === 'interactive' && (
                                <Badge variant="outline">Interactive</Badge>
                              )}
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm">{template.template}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Type: {template.type} • Status: {template.status}
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

          <TabsContent value="chatbot" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI Chatbot Configuration</CardTitle>
                    <CardDescription>Configure WhatsApp chatbot for employee queries</CardDescription>
                  </div>
                  <Switch checked={chatbotEnabled} onCheckedChange={setChatbotEnabled} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bot className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Chatbot Capabilities</p>
                      <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside mt-2">
                        <li>Natural language understanding in English and Hindi</li>
                        <li>Intent recognition for common queries</li>
                        <li>Leave balance inquiry</li>
                        <li>Payslip download</li>
                        <li>Policy queries</li>
                        <li>Claim status tracking</li>
                        <li>Escalation to human agent for complex queries</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Chatbot Intents & Performance</Label>
                    <div className="space-y-2 mt-2">
                      {chatbotIntents.map((intent) => (
                        <Card key={intent.intent}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold capitalize">{intent.intent.replace(/_/g, ' ')}</p>
                                <p className="text-sm text-muted-foreground">
                                  {intent.queries.toLocaleString()} queries • {intent.resolved.toLocaleString()} resolved
                                </p>
                              </div>
                              <Badge className="bg-green-600">
                                {Math.round((intent.resolved / intent.queries) * 100)}%
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Test Chatbot</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Type a message to test chatbot..." />
                    <Button onClick={handleTestWhatsApp} className="gap-2">
                      <Send className="w-4 h-4" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Analytics</CardTitle>
                <CardDescription>Message delivery and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Delivery Rate</p>
                      <p className="text-2xl font-bold">
                        {Math.round((whatsappStats.delivered / whatsappStats.totalSent) * 100)}%
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Read Rate</p>
                      <p className="text-2xl font-bold text-green-600">{whatsappStats.readRate}%</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Chatbot Resolution</p>
                      <p className="text-2xl font-bold text-blue-600">{whatsappStats.resolutionRate}%</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Avg Response Time</p>
                      <p className="text-2xl font-bold">2.3s</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
