import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, Users, Target, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Setting {
  id: number;
  key: string;
  value: any;
  updatedAt: string;
}

export default function Settings() {
  const [emailRecipients, setEmailRecipients] = useState('');
  const [dailyReportTime, setDailyReportTime] = useState('06:00');
  const [scrapingInterval, setScrapingInterval] = useState('0 */2 * * *');
  const [schedulerEnabled, setSchedulerEnabled] = useState(true);
  const [brandCategory, setBrandCategory] = useState('fashion');
  const [targetAudience, setTargetAudience] = useState('');
  const [focusKeywords, setFocusKeywords] = useState('');
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: ['/api/settings'],
  });

  const { data: schedulerStatus } = useQuery({
    queryKey: ['/api/scheduler/status'],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      return await apiRequest('PUT', `/api/settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduler/status'] });
    }
  });

  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest('POST', '/api/email/test', { email });
    },
    onSuccess: () => {
      toast({
        title: "Test email sent",
        description: "Check your inbox for the test email.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send test email",
        description: error instanceof Error ? error.message : "Please check your email configuration",
        variant: "destructive",
      });
    }
  });

  // Load settings into form state
  useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);

      if (settingsMap.email_recipients) {
        const recipients = Array.isArray(settingsMap.email_recipients) 
          ? settingsMap.email_recipients.map((r: any) => typeof r === 'string' ? r : r.email).join('\n')
          : '';
        setEmailRecipients(recipients);
      }

      if (settingsMap.daily_report_time) {
        // Convert cron to time format "0 6 * * *" -> "06:00"
        const cronParts = settingsMap.daily_report_time.split(' ');
        if (cronParts.length >= 2) {
          const hour = cronParts[1].padStart(2, '0');
          const minute = cronParts[0].padStart(2, '0');
          setDailyReportTime(`${hour}:${minute}`);
        }
      }

      setScrapingInterval(settingsMap.scraping_interval || '0 */2 * * *');
      setSchedulerEnabled(settingsMap.scheduler_enabled ?? true);
      setBrandCategory(settingsMap.brand_category || 'fashion');
      setTargetAudience(settingsMap.target_audience || '');
      
      if (settingsMap.focus_keywords) {
        const keywords = Array.isArray(settingsMap.focus_keywords) 
          ? settingsMap.focus_keywords.join('\n')
          : settingsMap.focus_keywords;
        setFocusKeywords(keywords);
      }
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      // Parse email recipients
      const recipients = emailRecipients
        .split('\n')
        .map(email => email.trim())
        .filter(email => email.length > 0)
        .map(email => ({ email }));

      // Convert time to cron format "06:00" -> "0 6 * * *"
      const [hour, minute] = dailyReportTime.split(':');
      const cronTime = `${minute} ${hour} * * *`;

      // Parse focus keywords
      const keywords = focusKeywords
        .split('\n')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);

      // Update all settings
      const updates = [
        { key: 'email_recipients', value: recipients },
        { key: 'daily_report_time', value: cronTime },
        { key: 'scraping_interval', value: scrapingInterval },
        { key: 'scheduler_enabled', value: schedulerEnabled },
        { key: 'brand_category', value: brandCategory },
        { key: 'target_audience', value: targetAudience },
        { key: 'focus_keywords', value: keywords },
      ];

      await Promise.all(
        updates.map(update => updateSettingMutation.mutateAsync(update))
      );

      toast({
        title: "Settings saved",
        description: "Your configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: error instanceof Error ? error.message : "An error occurred while saving",
        variant: "destructive",
      });
    }
  };

  const handleTestEmail = () => {
    const firstEmail = emailRecipients.split('\n')[0]?.trim();
    if (!firstEmail) {
      toast({
        title: "No email configured",
        description: "Please add at least one email recipient first.",
        variant: "destructive",
      });
      return;
    }
    testEmailMutation.mutate(firstEmail);
  };

  const handleResetToDefaults = () => {
    setEmailRecipients('');
    setDailyReportTime('06:00');
    setScrapingInterval('0 */2 * * *');
    setSchedulerEnabled(true);
    setBrandCategory('fashion');
    setTargetAudience('Gen Z, Millennials, Sustainable fashion enthusiasts');
    setFocusKeywords('sustainable fashion\nethical clothing\nminimalist style\ncottagecore\nvintage fashion');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your trend monitoring and reporting preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="recipients">Recipients</Label>
                <Textarea
                  id="recipients"
                  rows={4}
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="Enter email addresses, one per line&#10;example@company.com&#10;team@company.com"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter one email address per line
                </p>
              </div>

              <div>
                <Label htmlFor="send-time">Daily Report Time</Label>
                <Input
                  id="send-time"
                  type="time"
                  value={dailyReportTime}
                  onChange={(e) => setDailyReportTime(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={schedulerEnabled}
                  onCheckedChange={setSchedulerEnabled}
                />
                <Label>Enable automated reports</Label>
              </div>

              {schedulerStatus && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Scheduler Status:</span>
                    <Badge variant={schedulerStatus.enabled ? "default" : "secondary"}>
                      {schedulerStatus.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  {schedulerStatus.nextReport && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Next Report:</span>
                      <span className="font-medium">{schedulerStatus.nextReport}</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleTestEmail}
                disabled={testEmailMutation.isPending || !emailRecipients.trim()}
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {testEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}
              </Button>
            </CardContent>
          </Card>

          {/* Brand Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Brand Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="brand-category">Brand Category</Label>
                <Select value={brandCategory} onValueChange={setBrandCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion">Fashion & Lifestyle</SelectItem>
                    <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target-audience">Target Audience</Label>
                <Input
                  id="target-audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Gen Z, Millennials, Sustainable fashion enthusiasts"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="keywords">Focus Keywords</Label>
                <Textarea
                  id="keywords"
                  rows={4}
                  value={focusKeywords}
                  onChange={(e) => setFocusKeywords(e.target.value)}
                  placeholder="Enter keywords important to your brand, one per line&#10;sustainable fashion&#10;ethical clothing&#10;minimalist style"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Keywords help AI focus on relevant trends
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scheduler Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Scheduler Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="scraping-interval">Data Collection Interval</Label>
                <Select value={scrapingInterval} onValueChange={setScrapingInterval}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0 */1 * * *">Every hour</SelectItem>
                    <SelectItem value="0 */2 * * *">Every 2 hours</SelectItem>
                    <SelectItem value="0 */4 * * *">Every 4 hours</SelectItem>
                    <SelectItem value="0 */6 * * *">Every 6 hours</SelectItem>
                    <SelectItem value="0 */12 * * *">Every 12 hours</SelectItem>
                    <SelectItem value="0 0 * * *">Once daily</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  How often to collect new trend data
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Current Schedule</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Data Collection:</span>
                    <p className="font-medium">
                      {scrapingInterval === '0 */1 * * *' ? 'Every hour' :
                       scrapingInterval === '0 */2 * * *' ? 'Every 2 hours' :
                       scrapingInterval === '0 */4 * * *' ? 'Every 4 hours' :
                       scrapingInterval === '0 */6 * * *' ? 'Every 6 hours' :
                       scrapingInterval === '0 */12 * * *' ? 'Every 12 hours' :
                       scrapingInterval === '0 0 * * *' ? 'Once daily' : scrapingInterval}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email Reports:</span>
                    <p className="font-medium">Daily at {dailyReportTime}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Scheduler:</span>
                  <p className="font-medium">
                    {schedulerStatus?.enabled ? 'Running' : 'Stopped'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Email Recipients:</span>
                  <p className="font-medium">
                    {emailRecipients.split('\n').filter(e => e.trim()).length}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Focus Keywords:</span>
                  <p className="font-medium">
                    {focusKeywords.split('\n').filter(k => k.trim()).length}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium capitalize">{brandCategory}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={handleTestEmail}>
                    Test Email
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleResetToDefaults}>
                    Reset Defaults
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Settings */}
        <div className="mt-8 flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={handleResetToDefaults}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSaveSettings}
            disabled={updateSettingMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateSettingMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
