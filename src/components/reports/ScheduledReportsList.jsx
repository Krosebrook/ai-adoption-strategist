import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2, Pause, Play, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '../utils/formatters';
import EmptyState from '../ui/EmptyState';

export default function ScheduledReportsList() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: scheduledReports, isLoading } = useQuery({
    queryKey: ['scheduled-reports', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.ScheduledReport.filter({ user_email: user.email }, '-created_date');
    },
    enabled: !!user
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.ScheduledReport.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduled-reports']);
      toast.success('Schedule updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduledReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduled-reports']);
      toast.success('Schedule deleted');
    }
  });

  const getFrequencyBadge = (frequency) => {
    const colors = {
      once: 'bg-blue-100 text-blue-800',
      daily: 'bg-green-100 text-green-800',
      weekly: 'bg-purple-100 text-purple-800',
      monthly: 'bg-amber-100 text-amber-800'
    };
    return colors[frequency] || 'bg-slate-100 text-slate-800';
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-amber-100 text-amber-800',
      completed: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Loading schedules...</div>;
  }

  if (!scheduledReports?.length) {
    return (
      <EmptyState
        icon={Calendar}
        title="No scheduled reports"
        description="Create a schedule to automatically generate reports on a regular basis"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scheduled Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {scheduledReports.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-1">{schedule.report_name}</h4>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Badge className={getFrequencyBadge(schedule.frequency)}>
                    {schedule.frequency}
                  </Badge>
                  <Badge className={getStatusBadge(schedule.status)}>
                    {schedule.status}
                  </Badge>
                  <span className="capitalize">{schedule.report_type}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Next: {formatDate(schedule.next_run, { format: 'long' })}
                  </span>
                  {schedule.last_run && (
                    <span>Last run: {formatDate(schedule.last_run)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {schedule.status === 'active' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatusMutation.mutate({ id: schedule.id, status: 'paused' })}
                  >
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </Button>
                ) : schedule.status === 'paused' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatusMutation.mutate({ id: schedule.id, status: 'active' })}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Resume
                  </Button>
                ) : null}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(schedule.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}