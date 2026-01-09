import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function RiskAlertsPanel({ riskAlerts, strategy }) {
  const queryClient = useQueryClient();

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId) => {
      return await base44.entities.RiskAlert.update(alertId, {
        status: 'acknowledged',
        acknowledged_by: (await base44.auth.me()).email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riskAlerts'] });
      toast.success('Alert acknowledged');
    }
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId) => {
      return await base44.entities.RiskAlert.update(alertId, {
        status: 'resolved',
        resolved_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riskAlerts'] });
      toast.success('Alert resolved');
    }
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <Bell className="h-4 w-4" />;
      case 'acknowledged': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const activeAlerts = riskAlerts.filter(a => a.status !== 'resolved' && a.status !== 'dismissed');
  const resolvedAlerts = riskAlerts.filter(a => a.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-red-600" />
          Active Alerts ({activeAlerts.length})
        </h3>
        
        {activeAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-slate-600">No active alerts - all risks are managed</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <Card key={alert.id} className="border-l-4" style={{
                borderLeftColor: 
                  alert.severity === 'critical' ? '#dc2626' :
                  alert.severity === 'high' ? '#f97316' :
                  alert.severity === 'medium' ? '#eab308' : '#22c55e'
              }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(alert.status)}
                        <CardTitle className="text-base">
                          {alert.risk_description}
                        </CardTitle>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">{alert.risk_category}</Badge>
                        {alert.status === 'new' && (
                          <Badge className="bg-red-100 text-red-800 animate-pulse">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-700 mb-2">
                      <strong>Trigger:</strong> {alert.trigger_reason}
                    </p>
                    <p className="text-sm text-slate-700">
                      <strong>Impact:</strong> {alert.potential_impact}
                    </p>
                  </div>

                  {alert.risk_score && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">Risk Score:</span>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.risk_score}/100
                      </Badge>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {alert.status === 'new' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                        disabled={acknowledgeAlertMutation.isPending}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {alert.status !== 'new' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => resolveAlertMutation.mutate(alert.id)}
                        disabled={resolveAlertMutation.isPending}
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Resolved Alerts ({resolvedAlerts.length})
          </h3>
          <div className="space-y-2">
            {resolvedAlerts.slice(0, 5).map(alert => (
              <Card key={alert.id} className="bg-green-50 border-green-200">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        {alert.risk_description}
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-white text-xs">
                      Resolved {new Date(alert.resolved_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}