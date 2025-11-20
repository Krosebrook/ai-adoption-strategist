import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { getSeverityStyle } from '../../utils/formatters';

export default function AnomalyAlertsWidget() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: anomalies = [] } = useQuery({
    queryKey: ['anomalies', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.MetricAnomaly.filter(
        { user_email: user.email, status: 'new' },
        '-created_date',
        10
      );
    },
    enabled: !!user
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id) => base44.entities.MetricAnomaly.update(id, { status: 'acknowledged' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['anomalies']);
      toast.success('Anomaly acknowledged');
    }
  });

  if (anomalies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Anomaly Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600">All metrics normal</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          Anomaly Alerts ({anomalies.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {anomalies.slice(0, 5).map((anomaly) => (
            <div
              key={anomaly.id}
              className="p-3 border border-slate-200 rounded-lg hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getSeverityStyle(anomaly.severity)}>
                      {anomaly.severity}
                    </Badge>
                    <span className="text-xs text-slate-500 capitalize">
                      {anomaly.metric_type}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900">{anomaly.metric_name}</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {anomaly.deviation_percent > 0 ? '↑' : '↓'} {Math.abs(anomaly.deviation_percent).toFixed(1)}% deviation from baseline
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => acknowledgeMutation.mutate(anomaly.id)}
                  className="text-xs"
                >
                  Dismiss
                </Button>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Current: {anomaly.current_value.toFixed(2)}</span>
                <span>Expected: {anomaly.expected_value?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}