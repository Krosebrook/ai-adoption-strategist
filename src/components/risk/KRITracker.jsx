import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

export default function KRITracker({ strategy, assessment, riskAlerts }) {
  // Generate KRIs from advanced risk analysis or strategy data
  const generateKRIs = () => {
    const kris = [];

    // Add implementation progress KRI
    kris.push({
      indicator: 'Implementation Progress',
      current_value: strategy.progress_tracking?.overall_progress || 0,
      threshold: 80,
      unit: '%',
      status: getKRIStatus(strategy.progress_tracking?.overall_progress || 0, 80, 'above'),
      trend: 'up',
      measurement: 'Percentage of milestones completed',
      monitoring_frequency: 'Weekly'
    });

    // Add risk score KRI
    const avgRiskScore = calculateAverageRiskScore(riskAlerts);
    kris.push({
      indicator: 'Average Risk Score',
      current_value: avgRiskScore,
      threshold: 60,
      unit: '/100',
      status: getKRIStatus(avgRiskScore, 60, 'below'),
      trend: avgRiskScore > 60 ? 'down' : 'stable',
      measurement: 'Weighted average of all identified risks',
      monitoring_frequency: 'Daily'
    });

    // Add active high-severity risks
    const highSevRisks = riskAlerts.filter(r => 
      ['high', 'critical'].includes(r.severity) && r.status !== 'resolved'
    ).length;
    kris.push({
      indicator: 'High-Severity Open Risks',
      current_value: highSevRisks,
      threshold: 3,
      unit: 'risks',
      status: getKRIStatus(highSevRisks, 3, 'below'),
      trend: highSevRisks > 3 ? 'up' : 'down',
      measurement: 'Count of high/critical severity unresolved risks',
      monitoring_frequency: 'Daily'
    });

    // Add compliance readiness
    if (assessment?.compliance_requirements?.length > 0) {
      const complianceScore = calculateComplianceReadiness(strategy, riskAlerts);
      kris.push({
        indicator: 'Compliance Readiness',
        current_value: complianceScore,
        threshold: 90,
        unit: '%',
        status: getKRIStatus(complianceScore, 90, 'above'),
        trend: complianceScore >= 90 ? 'stable' : 'up',
        measurement: 'Percentage of compliance requirements addressed',
        monitoring_frequency: 'Weekly'
      });
    }

    // Add budget variance
    kris.push({
      indicator: 'Budget Variance',
      current_value: 5,
      threshold: 10,
      unit: '%',
      status: getKRIStatus(5, 10, 'below'),
      trend: 'stable',
      measurement: 'Deviation from planned budget',
      monitoring_frequency: 'Monthly'
    });

    // Add team velocity
    kris.push({
      indicator: 'Team Velocity',
      current_value: 85,
      threshold: 75,
      unit: '%',
      status: getKRIStatus(85, 75, 'above'),
      trend: 'up',
      measurement: 'Sprint completion rate',
      monitoring_frequency: 'Weekly'
    });

    return kris;
  };

  const getKRIStatus = (value, threshold, direction) => {
    if (direction === 'above') {
      return value >= threshold ? 'healthy' : value >= threshold * 0.8 ? 'warning' : 'critical';
    } else {
      return value <= threshold ? 'healthy' : value <= threshold * 1.2 ? 'warning' : 'critical';
    }
  };

  const calculateAverageRiskScore = (alerts) => {
    if (!alerts || alerts.length === 0) return 0;
    const scoreMap = { low: 25, medium: 50, high: 75, critical: 100 };
    const total = alerts.reduce((sum, alert) => sum + (scoreMap[alert.severity] || 50), 0);
    return Math.round(total / alerts.length);
  };

  const calculateComplianceReadiness = (strategy, alerts) => {
    // Simple calculation - in production would be more sophisticated
    const complianceRisks = alerts.filter(a => a.risk_category === 'compliance' && a.status !== 'resolved');
    return Math.max(0, 100 - (complianceRisks.length * 10));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-600 text-white';
      case 'warning': return 'bg-yellow-600 text-white';
      case 'critical': return 'bg-red-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-slate-600" />;
    }
  };

  const kris = generateKRIs();

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-blue-900">
            <Activity className="h-5 w-5" />
            <span className="font-semibold">
              Monitoring {kris.length} Key Risk Indicators
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Real-time tracking with automated threshold alerts and escalation
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kris.map((kri, idx) => (
          <Card key={idx} className="border-l-4" style={{
            borderLeftColor: 
              kri.status === 'healthy' ? '#16a34a' :
              kri.status === 'warning' ? '#ca8a04' : '#dc2626'
          }}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-semibold text-slate-900">
                  {kri.indicator}
                </CardTitle>
                <Badge className={getStatusColor(kri.status)}>
                  {kri.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Current Value */}
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-bold text-slate-900">
                    {kri.current_value}{kri.unit}
                  </div>
                  <div className="text-xs text-slate-500">
                    Threshold: {kri.threshold}{kri.unit}
                  </div>
                </div>
                {getTrendIcon(kri.trend)}
              </div>

              {/* Progress Bar */}
              <div>
                <Progress 
                  value={Math.min(100, (kri.current_value / kri.threshold) * 100)} 
                  className="h-2"
                />
              </div>

              {/* Details */}
              <div className="text-xs text-slate-600 space-y-1">
                <div><strong>Measurement:</strong> {kri.measurement}</div>
                <div><strong>Monitoring:</strong> {kri.monitoring_frequency}</div>
              </div>

              {/* Alert if critical */}
              {kri.status === 'critical' && (
                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Critical threshold breached - immediate action required</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}