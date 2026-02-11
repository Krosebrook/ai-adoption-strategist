import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingDown, TrendingUp, Activity, Loader2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PerformanceDriftMonitor() {
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [scanning, setScanning] = useState(false);
  const [driftData, setDriftData] = useState(null);

  const agents = ['all', 'StrategyAdvisor', 'SecurityAdvisor', 'EngineeringManagerAdvisor', 'UXAdvisor', 'TrainingCoach', 'ComplianceAnalyst'];

  const handleRunDriftDetection = async () => {
    setScanning(true);
    try {
      const response = await base44.functions.invoke('detectPerformanceDrift', {
        agent_name: selectedAgent === 'all' ? null : selectedAgent,
        lookback_days: 30
      });
      setDriftData(response.data);
      
      if (response.data.drift_detected) {
        toast.warning('Performance drift detected! Review the alerts below.');
      } else {
        toast.success('No significant drift detected');
      }
    } catch (error) {
      toast.error('Failed to run drift detection');
    } finally {
      setScanning(false);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'bg-red-600';
    if (severity === 'warning') return 'bg-yellow-600';
    return 'bg-blue-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Performance Drift Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem key={agent} value={agent}>
                    {agent === 'all' ? 'All Agents' : agent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleRunDriftDetection}
              disabled={scanning}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {scanning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Run Drift Analysis
            </Button>
          </div>

          {driftData && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className={driftData.drift_detected ? 'border-2 border-red-200 bg-red-50' : 'border-2 border-green-200 bg-green-50'}>
                  <CardContent className="pt-6 text-center">
                    {driftData.drift_detected ? (
                      <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-red-600" />
                    ) : (
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 text-green-600" />
                    )}
                    <p className="font-semibold">
                      {driftData.drift_detected ? 'Drift Detected' : 'No Drift Detected'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-slate-600 mb-1">Baseline Period</p>
                    <p className="text-sm font-semibold">{driftData.baseline_period}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-slate-600 mb-1">Recent Period</p>
                    <p className="text-sm font-semibold">{driftData.recent_period}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Metrics */}
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(driftData.metrics || {}).map(([metricName, data]) => (
                  <Card key={metricName} className={data.drift_detected ? 'border-2 border-orange-200' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold capitalize">{metricName.replace(/_/g, ' ')}</h4>
                        {data.drift_detected && (
                          <Badge className="bg-orange-600">Drift</Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Baseline:</span>
                          <span className="font-medium">{data.baseline_avg}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Recent:</span>
                          <span className="font-medium">{data.recent_avg}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Change:</span>
                          <span className={`font-bold flex items-center gap-1 ${
                            parseFloat(data.drift_percentage) > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {parseFloat(data.drift_percentage) > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {Math.abs(parseFloat(data.drift_percentage)).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Alerts */}
              {driftData.alerts?.length > 0 && (
                <Card className="border-2 border-red-200">
                  <CardHeader className="bg-red-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Drift Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {driftData.alerts.map((alert, idx) => (
                        <div key={idx} className="p-4 bg-white border rounded-lg">
                          <div className="flex items-start gap-3">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{alert.message}</h4>
                              <p className="text-sm text-slate-600 mb-2">
                                Metric: {alert.metric}
                              </p>
                              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                <p className="text-sm">
                                  <strong>Recommendation:</strong> {alert.recommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!driftData && !scanning && (
            <div className="text-center py-12 text-slate-500">
              Select an agent and run drift analysis to see performance trends
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}