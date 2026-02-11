import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: preferences = [] } = useQuery({
    queryKey: ['notificationPrefs', user?.email],
    queryFn: () => base44.entities.NotificationPreferences.filter({ user_email: user.email }),
    enabled: !!user,
    initialData: []
  });

  const createPrefsMutation = useMutation({
    mutationFn: (data) => base44.entities.NotificationPreferences.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPrefs'] });
      toast.success('Preferences saved');
    }
  });

  const updatePrefsMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NotificationPreferences.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPrefs'] });
      toast.success('Preferences updated');
    }
  });

  const currentPrefs = preferences[0];

  const updatePreference = (key, value) => {
    if (currentPrefs) {
      updatePrefsMutation.mutate({
        id: currentPrefs.id,
        data: { [key]: value }
      });
    } else {
      createPrefsMutation.mutate({
        user_email: user.email,
        [key]: value
      });
    }
  };

  const toggleNotificationType = (type) => {
    const current = currentPrefs?.enabled_types || ['recommendation', 'alert', 'achievement'];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updatePreference('enabled_types', updated);
  };

  const notificationTypes = [
    { value: 'recommendation', label: 'AI Recommendations', description: 'Personalized suggestions' },
    { value: 'alert', label: 'Critical Alerts', description: 'Important risk warnings' },
    { value: 'achievement', label: 'Achievements', description: 'Training milestones' },
    { value: 'update', label: 'Updates', description: 'Strategy and project updates' },
    { value: 'reminder', label: 'Reminders', description: 'Task and deadline reminders' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Notification Types</h4>
          <div className="space-y-3">
            {notificationTypes.map(type => (
              <div key={type.value} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </div>
                <Switch
                  checked={currentPrefs?.enabled_types?.includes(type.value) ?? true}
                  onCheckedChange={() => toggleNotificationType(type.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Priority Threshold</h4>
          <Select
            value={currentPrefs?.minimum_priority || 'medium'}
            onValueChange={(val) => updatePreference('minimum_priority', val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Show All (Low and above)</SelectItem>
              <SelectItem value="medium">Medium and above</SelectItem>
              <SelectItem value="high">High and above</SelectItem>
              <SelectItem value="critical">Critical only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h4 className="font-medium mb-3">Delivery Frequency</h4>
          <Select
            value={currentPrefs?.frequency || 'realtime'}
            onValueChange={(val) => updatePreference('frequency', val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <div className="font-medium">Email Notifications</div>
            <div className="text-sm text-gray-600">Receive notifications via email</div>
          </div>
          <Switch
            checked={currentPrefs?.email_notifications ?? false}
            onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}