import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, Settings as SettingsIcon, Bell, DollarSign, BarChart3, Shield, Plug } from 'lucide-react';
import { toast } from 'sonner';
import { COMPLIANCE_STANDARDS, INTEGRATION_CATEGORIES } from '../components/assessment/AssessmentData';
import NotificationSettings from '../components/settings/NotificationSettings';

export default function Settings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    roi_display_unit: 'number',
    chart_style: 'bar',
    theme: 'auto',
    notification_preferences: {
      new_ai_models: true,
      platform_updates: true,
      assessment_reminders: false
    },
    default_assessment_params: {
      compliance_requirements: [],
      desired_integrations: []
    }
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: userSettings, isLoading } = useQuery({
    queryKey: ['userSettings', user?.email],
    queryFn: async () => {
      const result = await base44.entities.UserSettings.filter({ user_email: user.email });
      return result[0] || null;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (userSettings) {
      setSettings({
        roi_display_unit: userSettings.roi_display_unit || 'number',
        chart_style: userSettings.chart_style || 'bar',
        theme: userSettings.theme || 'auto',
        notification_preferences: userSettings.notification_preferences || {
          new_ai_models: true,
          platform_updates: true,
          assessment_reminders: false
        },
        default_assessment_params: userSettings.default_assessment_params || {
          compliance_requirements: [],
          desired_integrations: []
        }
      });
    }
  }, [userSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (data) => {
      if (userSettings) {
        return await base44.entities.UserSettings.update(userSettings.id, data);
      } else {
        return await base44.entities.UserSettings.create({ ...data, user_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast.success('Settings saved successfully!');
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const toggleCompliance = (requirement) => {
    const current = settings.default_assessment_params.compliance_requirements || [];
    const updated = current.includes(requirement)
      ? current.filter(r => r !== requirement)
      : [...current, requirement];
    
    setSettings({
      ...settings,
      default_assessment_params: {
        ...settings.default_assessment_params,
        compliance_requirements: updated
      }
    });
  };

  const toggleIntegration = (integration) => {
    const current = settings.default_assessment_params.desired_integrations || [];
    const updated = current.includes(integration)
      ? current.filter(i => i !== integration)
      : [...current, integration];
    
    setSettings({
      ...settings,
      default_assessment_params: {
        ...settings.default_assessment_params,
        desired_integrations: updated
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Settings</h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Customize your assessment experience and preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            {/* ROI Display Settings */}
            <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <DollarSign className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
              ROI Display Format
            </CardTitle>
            <CardDescription style={{ color: 'var(--color-text-secondary)' }}>
              Choose how financial values are displayed in reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label style={{ color: 'var(--color-text)' }}>Number Format</Label>
              <Select
                value={settings.roi_display_unit}
                onValueChange={(value) => setSettings({ ...settings, roi_display_unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Full Numbers (e.g., 1,250,000)</SelectItem>
                  <SelectItem value="K">Thousands - K (e.g., 1,250K)</SelectItem>
                  <SelectItem value="M">Millions - M (e.g., 1.25M)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Example: $1,250,000 → {
                  settings.roi_display_unit === 'K' ? '$1,250K' : 
                  settings.roi_display_unit === 'M' ? '$1.25M' : 
                  '$1,250,000'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Visualization Settings */}
        <Card className="mb-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <BarChart3 className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
              Data Visualization
            </CardTitle>
            <CardDescription style={{ color: 'var(--color-text-secondary)' }}>
              Customize how charts and graphs are displayed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label style={{ color: 'var(--color-text)' }}>Chart Style</Label>
                <Select
                  value={settings.chart_style}
                  onValueChange={(value) => setSettings({ ...settings, chart_style: value })}
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

              <div className="space-y-2">
                <Label style={{ color: 'var(--color-text)' }}>Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => setSettings({ ...settings, theme: value })}
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
            </div>
          </CardContent>
        </Card>

        {/* Default Assessment Parameters */}
        <Card className="mb-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Shield className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
              Default Assessment Parameters
            </CardTitle>
            <CardDescription style={{ color: 'var(--color-text-secondary)' }}>
              Pre-select common compliance and integration requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block" style={{ color: 'var(--color-text)' }}>
                Default Compliance Requirements
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {COMPLIANCE_STANDARDS.map((standard, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer"
                    style={{ 
                      borderColor: settings.default_assessment_params.compliance_requirements?.includes(standard) 
                        ? 'var(--color-primary)' 
                        : 'var(--color-card-border)',
                      background: settings.default_assessment_params.compliance_requirements?.includes(standard)
                        ? 'rgba(33, 128, 141, 0.05)'
                        : 'transparent'
                    }}
                    onClick={() => toggleCompliance(standard)}
                  >
                    <Checkbox
                      checked={settings.default_assessment_params.compliance_requirements?.includes(standard)}
                      onCheckedChange={() => toggleCompliance(standard)}
                    />
                    <label className="text-sm cursor-pointer" style={{ color: 'var(--color-text)' }}>
                      {standard}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block" style={{ color: 'var(--color-text)' }}>
                Default Integrations
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {INTEGRATION_CATEGORIES.map((integration, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer"
                    style={{ 
                      borderColor: settings.default_assessment_params.desired_integrations?.includes(integration) 
                        ? 'var(--color-primary)' 
                        : 'var(--color-card-border)',
                      background: settings.default_assessment_params.desired_integrations?.includes(integration)
                        ? 'rgba(33, 128, 141, 0.05)'
                        : 'transparent'
                    }}
                    onClick={() => toggleIntegration(integration)}
                  >
                    <Checkbox
                      checked={settings.default_assessment_params.desired_integrations?.includes(integration)}
                      onCheckedChange={() => toggleIntegration(integration)}
                    />
                    <label className="text-sm cursor-pointer" style={{ color: 'var(--color-text)' }}>
                      {integration}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="mb-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Bell className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
              Notifications
            </CardTitle>
            <CardDescription style={{ color: 'var(--color-text-secondary)' }}>
              Manage what updates you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label style={{ color: 'var(--color-text)' }}>New AI Models</Label>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Get notified when new AI platforms are added to the tool
                </p>
              </div>
              <Switch
                checked={settings.notification_preferences.new_ai_models}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notification_preferences: {
                    ...settings.notification_preferences,
                    new_ai_models: checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label style={{ color: 'var(--color-text)' }}>Platform Updates</Label>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Receive updates about changes to existing AI platforms
                </p>
              </div>
              <Switch
                checked={settings.notification_preferences.platform_updates}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notification_preferences: {
                    ...settings.notification_preferences,
                    platform_updates: checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label style={{ color: 'var(--color-text)' }}>Assessment Reminders</Label>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Periodic reminders to review and update your assessments
                </p>
              </div>
              <Switch
                checked={settings.notification_preferences.assessment_reminders}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notification_preferences: {
                    ...settings.notification_preferences,
                    assessment_reminders: checked
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saveSettingsMutation.isPending}
                size="lg"
                className="text-white"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))',
                  border: 'none'
                }}
              >
                {saveSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}