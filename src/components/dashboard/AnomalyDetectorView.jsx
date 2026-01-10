import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Shield, CheckCircle } from 'lucide-react';
import { detectAnomalies } from './AnomalyDetector';
import { toast } from 'sonner';

export default function AnomalyDetectorView() {
  const [scanning, setScanning] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: anomalies = [] } = useQuery({
    queryKey: ['anomalies', user?.email],
    queryFn: () => base44.entities.MetricAnomaly.filter({ user_email: user.email }, '-detected_at', 50),
    enabled: !!user?.email
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.list('-created_date', 100)
  });

  const updateAnomalyMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MetricAnomaly.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomalies'] });
    }
  });

  const handleScan = async () => {
    setScanning(true);
    try {
      const detected = await detectAnomalies(assessments, user.email);
      queryClient.invalidateQueries({ queryKey: ['anomalies'] });
      toast.success(`Detected ${detected?.length || 0} anomalies`);
    } catch (error) {
      toast.error('Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  const getMetricIcon = (type) => {
    switch (type) {
      case 'roi': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'cost': return <DollarSign className="h-5 w-5 text-blue-600" />;
      case 'compliance': return <Shield className="h-5 w-5 text-purple-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    }
  };

  const newAnomalies = anomalies.filter(a => a.status === 'new');
  const acknowledgedAnomalies = anomalies.filter(a => a.status === 'acknowledged');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Anomaly Detection
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                AI-powered detection of unusual patterns in your metrics
              </p>
            </div>
            <Button onClick={handleScan} disabled={scanning}>
              {scanning ? 'Scanning...' : 'Run Scan'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">{newAnomalies.length}</div>
            <div className="text-sm text-slate-600">New Anomalies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-600">{acknowledgedAnomalies.length}</div>
            <div className="text-sm text-slate-600">Under Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">
              {anomalies.filter(a => a.status === 'resolved').length}
            </div>
            <div className="text-sm text-slate-600">Resolved</div>
          </CardContent>
        </Card>
      </div>

      {newAnomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-900">New Anomalies Detected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {newAnomalies.map((anomaly) => (
              <div key={anomaly.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    {getMetricIcon(anomaly.metric_type)}
                    <div>
                      <h4 className="font-semibold text-slate-900">{anomaly.metric_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                        <span className="text-sm text-slate-600">
                          {Math.abs(anomaly.deviation_percent).toFixed(1)}% deviation
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateAnomalyMutation.mutate({
                      id: anomaly.id,
                      data: { status: 'acknowledged' }
                    })}
                  >
                    Acknowledge
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <span className="text-slate-600">Current Value:</span>
                    <span className="ml-2 font-semibold">{anomaly.current_value.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Expected:</span>
                    <span className="ml-2 font-semibold">{anomaly.expected_value.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {acknowledgedAnomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-900">Under Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {acknowledgedAnomalies.map((anomaly) => (
              <div key={anomaly.id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getMetricIcon(anomaly.metric_type)}
                    <div>
                      <h4 className="font-semibold text-slate-900">{anomaly.metric_name}</h4>
                      <Badge className={getSeverityColor(anomaly.severity)}>
                        {anomaly.severity}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateAnomalyMutation.mutate({
                      id: anomaly.id,
                      data: { status: 'resolved' }
                    })}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}