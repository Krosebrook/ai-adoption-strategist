import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Check, Settings, Sparkles, AlertTriangle, Award, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ 
      user_email: user.email,
      dismissed: false 
    }, '-created_date', 50),
    enabled: !!user,
    initialData: [],
    refetchInterval: 30000
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { 
      read: true, 
      read_at: new Date().toISOString() 
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { dismissed: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    const icons = {
      recommendation: Sparkles,
      alert: AlertTriangle,
      achievement: Award,
      update: Info,
      reminder: Bell
    };
    return icons[type] || Bell;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'text-red-600 bg-red-50',
      high: 'text-orange-600 bg-orange-50',
      medium: 'text-blue-600 bg-blue-50',
      low: 'text-gray-600 bg-gray-50'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-600">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="border-b p-4 flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          <Link to={createPageUrl('Settings')} onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => dismissMutation.mutate(notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {notification.action_url && (
                          <Link to={notification.action_url} onClick={() => setOpen(false)}>
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              {notification.action_label || 'View'}
                            </Button>
                          </Link>
                        )}
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}