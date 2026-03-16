'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Shield, AlertCircle, Info } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

/**
 * US-A1-05: IP Whitelisting for Platform Admin Access
 * Configure allowed IP addresses for Platform Admin login
 */
export default function IPWhitelistPage() {
  const { currentUser } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [ipAddresses, setIpAddresses] = useState<string[]>([]);
  const [newIP, setNewIP] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentIP, setCurrentIP] = useState('');

  useEffect(() => {
    loadSettings();
    fetchCurrentIP();
  }, []);

  const fetchCurrentIP = async () => {
    try {
      // Get current IP from a service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setCurrentIP(data.ip);
    } catch (error) {
      console.error('Failed to fetch current IP:', error);
    }
  };

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getPlatformSettings();
      if (response.success && response.data) {
        setEnabled(response.data.ipWhitelistEnabled === true || response.data.ipWhitelistEnabled === 'true');
        const ips = response.data.ipWhitelist || [];
        setIpAddresses(Array.isArray(ips) ? ips : ips.split(',').filter(Boolean));
      }
    } catch (error: any) {
      toast.error('Failed to load IP whitelist settings');
    } finally {
      setIsLoading(false);
    }
  };

  const validateIP = (ip: string): boolean => {
    // IPv4 validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6 validation (basic)
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    // CIDR notation (e.g., 192.168.1.0/24)
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip) || cidrRegex.test(ip);
  };

  const handleAddIP = () => {
    const trimmedIP = newIP.trim();
    if (!trimmedIP) {
      toast.error('Please enter an IP address');
      return;
    }

    if (!validateIP(trimmedIP)) {
      toast.error('Invalid IP address format. Use IPv4, IPv6, or CIDR notation (e.g., 192.168.1.0/24)');
      return;
    }

    if (ipAddresses.includes(trimmedIP)) {
      toast.error('IP address already in whitelist');
      return;
    }

    setIpAddresses([...ipAddresses, trimmedIP]);
    setNewIP('');
  };

  const handleRemoveIP = (ip: string) => {
    setIpAddresses(ipAddresses.filter(i => i !== ip));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiService.updatePlatformSettings({
        ipWhitelistEnabled: enabled,
        ipWhitelist: ipAddresses,
      });
      
      toast.success('IP whitelist settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save IP whitelist settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading IP whitelist settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">IP Whitelist</h1>
          <p className="text-muted-foreground mt-2">
            Restrict Platform Admin access to specific IP addresses for enhanced security
          </p>
        </div>

        {/* Info Alert */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  IP Whitelisting Security
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  When enabled, only Platform Admins logging in from whitelisted IP addresses will be allowed.
                  Localhost (127.0.0.1) is always allowed. Make sure to add your current IP before enabling.
                </p>
                {currentIP && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Your current IP: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{currentIP}</code>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              IP Whitelist Configuration
            </CardTitle>
            <CardDescription>
              Configure allowed IP addresses for Platform Admin access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Enable IP Whitelisting</Label>
                <p className="text-sm text-muted-foreground">
                  Restrict Platform Admin login to whitelisted IPs only
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>

            {/* IP Address List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Allowed IP Addresses</Label>
                <Badge variant="outline">{ipAddresses.length} IPs</Badge>
              </div>

              {/* Add IP Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter IP address (e.g., 192.168.1.1 or 192.168.1.0/24)"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddIP();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={handleAddIP} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add IP
                </Button>
              </div>

              {/* IP List */}
              {ipAddresses.length === 0 ? (
                <div className="text-center py-8 border rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">No IP addresses added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ipAddresses.map((ip, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                          {ip}
                        </code>
                        {ip === currentIP && (
                          <Badge variant="outline" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveIP(ip)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Warning if enabled but no IPs */}
            {enabled && ipAddresses.length === 0 && (
              <div className="p-4 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      Warning: IP Whitelisting is enabled but no IPs are configured
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      Only localhost will be allowed. Add at least one IP address before enabling.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
