import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Calendar, TrendingUp } from 'lucide-react';

export default function RiskPredictionPanel({ prediction }) {
  if (!prediction) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getTrajectoryColor = (trajectory) => {
    switch (trajectory) {
      case 'improving': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'increasing': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Risk Trajectory */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-1">
                Risk Trajectory
              </h3>
              <p className={`text-2xl font-bold capitalize ${getTrajectoryColor(prediction.overall_risk_trajectory)}`}>
                {prediction.overall_risk_trajectory}
              </p>
            </div>
            <TrendingUp className={`h-12 w-12 ${getTrajectoryColor(prediction.overall_risk_trajectory)}`} />
          </div>
        </CardContent>
      </Card>

      {/* Predicted Risks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Predicted Risks (6-24 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prediction.predicted_risks?.map((risk, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{risk.risk_type}</h4>
                    <p className="text-sm text-slate-600 mt-1">{risk.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getSeverityColor(risk.severity)}>
                      {risk.severity}
                    </Badge>
                    <Badge variant="outline">{risk.likelihood}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
                  <div>
                    <div className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Timeline
                    </div>
                    <div className="text-sm text-slate-900">{risk.timeline}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Mitigation Strategy
                    </div>
                    <div className="text-sm text-slate-900">{risk.mitigation_strategy}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Compliance Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prediction.compliance_challenges?.map((challenge, idx) => (
              <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-blue-900">{challenge.regulation}</h4>
                    <p className="text-sm text-blue-700 mt-1">{challenge.challenge}</p>
                  </div>
                  <Badge className={
                    challenge.effort_required === 'high' ? 'bg-red-100 text-red-800' :
                    challenge.effort_required === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {challenge.effort_required} effort
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <div className="text-xs text-blue-600 mb-1">Deadline</div>
                    <div className="text-sm text-blue-900 font-medium">{challenge.deadline}</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">Action Plan</div>
                    <div className="text-sm text-blue-900">{challenge.action_plan}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emerging Threats */}
      {prediction.emerging_threats?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Emerging Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {prediction.emerging_threats.map((threat, idx) => (
                <div key={idx} className="border border-orange-200 rounded-lg p-3 bg-orange-50">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-orange-900 text-sm">{threat.threat}</h5>
                    <Badge variant="outline" className="text-xs">{threat.probability}</Badge>
                  </div>
                  <p className="text-xs text-orange-700">{threat.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {prediction.recommendations?.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}