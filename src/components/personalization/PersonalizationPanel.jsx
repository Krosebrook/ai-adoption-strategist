import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Palette, Layout, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function PersonalizationPanel() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userSettings } = useQuery({
    queryKey: ['userSettings', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const settings = await base44.entities.UserSettings.filter({ user_email: user.email });
      return settings[0] || null;
    },
    enabled: !!user?.email
  });

  const [localSettings, setLocalSettings] = useState(userSettings || {
    notification_preferences: {
      new_ai_models: true,
      platform_updates: true,
      assessment_reminders: false,
      risk_alerts: true,
      strategy_progress: true,
      compliance_updates: true
    },
    theme: 'auto',
    chart_style: 'bar',
    roi_display_unit: 'number'
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      if (userSettings?.id) {
        return base44.entities.UserSettings.update(userSettings.id, settings);
      } else {
        return base44.entities.UserSettings.create({ ...settings, user_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast.success('Settings saved');
    }
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(localSettings);
  };

  const toggleNotification = (key) => {
    setLocalSettings({
      ...localSettings,
      notification_preferences: {
        ...localSettings.notification_preferences,
        [key]: !localSettings.notification_preferences[key]
      }
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="notifications">
        <TabsList>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="dashboard">
            <Layout className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="ai-suggestions">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <p className="text-sm text-slate-600">Choose which updates you want to receive</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'new_ai_models', label: 'New AI Models & Features', description: 'Get notified about new AI platforms and capabilities' },
                { key: 'platform_updates', label: 'Platform Updates', description: 'Receive updates about the INT Inc. platform' },
                { key: 'assessment_reminders', label: 'Assessment Reminders', description: 'Reminders to complete or review assessments' },
                { key: 'risk_alerts', label: 'Risk Alerts', description: 'Critical risk notifications and mitigation updates' },
                { key: 'strategy_progress', label: 'Strategy Progress', description: 'Updates on strategy milestones and progress' },
                { key: 'compliance_updates', label: 'Compliance Updates', description: 'Compliance status changes and new requirements' }
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{label}</div>
                    <div className="text-sm text-slate-600">{description}</div>
                  </div>
                  <Switch
                    checked={localSettings.notification_preferences?.[key] || false}
                    onCheckedChange={() => toggleNotification(key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Theme</label>
                <Select
                  value={localSettings.theme || 'auto'}
                  onValueChange={(value) => setLocalSettings({ ...localSettings, theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Chart Style</label>
                <Select
                  value={localSettings.chart_style || 'bar'}
                  onValueChange={(value) => setLocalSettings({ ...localSettings, chart_style: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Charts</SelectItem>
                    <SelectItem value="line">Line Charts</SelectItem>
                    <SelectItem value="area">Area Charts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">ROI Display Format</label>
                <Select
                  value={localSettings.roi_display_unit || 'number'}
                  onValueChange={(value) => setLocalSettings({ ...localSettings, roi_display_unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Full Numbers</SelectItem>
                    <SelectItem value="K">Thousands (K)</SelectItem>
                    <SelectItem value="M">Millions (M)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Customization</CardTitle>
              <p className="text-sm text-slate-600">Customize your dashboard widgets and layout</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Use the Dashboard Builder to create custom views with widgets for:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'ROI Overview',
                    'Platform Trends',
                    'Compliance Matrix',
                    'Risk Indicators',
                    'Recent Assessments',
                    'Cost Comparison',
                    'Adoption Rate',
                    'Time to Value'
                  ].map(widget => (
                    <Badge key={widget} variant="outline" className="justify-center">
                      {widget}
                    </Badge>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Open Dashboard Builder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-suggestions">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Suggestions</CardTitle>
              <p className="text-sm text-slate-600">Based on your role and activity</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-1">Recommended for You</h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• Review compliance analysis for recent assessments</li>
                        <li>• Check risk alerts for active strategies</li>
                        <li>• Complete training modules for new AI features</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Trending Features</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Scenario Planning (85% of users find this valuable)</li>
                    <li>• Automated Report Generation (New!)</li>
                    <li>• Budget Optimization Tools</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} disabled={updateSettingsMutation.isPending} className="w-full">
        Save Preferences
      </Button>
    </div>
  );
}