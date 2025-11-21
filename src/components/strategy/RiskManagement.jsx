import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, CheckCircle, Clock } from 'lucide-react';

export default function RiskManagement({ riskAnalysis, onUpdateRiskStatus }) {
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[severity] || 'bg-slate-100 text-slate-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      identified: 'bg-red-600',
      mitigating: 'bg-yellow-600',
      resolved: 'bg-green-600',
      accepted: 'bg-slate-600'
    };
    return colors[status] || 'bg-slate-400';
  };

  const risks = riskAnalysis?.identified_risks || [];
  const risksByCategory = risks.reduce((acc, risk) => {
    if (!acc[risk.category]) acc[risk.category] = [];
    acc[risk.category].push(risk);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Risk Score Overview */}
      <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Risk Analysis Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <div className="text-sm text-slate-600 mb-1">Overall Risk Score</div>
              <div className="text-3xl font-bold text-red-900">{riskAnalysis?.risk_score || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <div className="text-sm text-slate-600 mb-1">Total Risks</div>
              <div className="text-3xl font-bold text-orange-900">{risks.length}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <div className="text-sm text-slate-600 mb-1">Active Risks</div>
              <div className="text-3xl font-bold text-yellow-900">
                {risks.filter(r => r.status !== 'resolved' && r.status !== 'accepted').length}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-sm text-slate-600 mb-1">Resolved</div>
              <div className="text-3xl font-bold text-green-900">
                {risks.filter(r => r.status === 'resolved').length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risks by Category */}
      {Object.entries(risksByCategory).map(([category, categoryRisks]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category} Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryRisks.map((risk, idx) => (
                <div
                  key={idx}
                  className={`border-l-4 rounded-lg p-4 ${
                    risk.severity === 'critical' ? 'border-l-red-600 bg-red-50' :
                    risk.severity === 'high' ? 'border-l-orange-600 bg-orange-50' :
                    risk.severity === 'medium' ? 'border-l-yellow-600 bg-yellow-50' :
                    'border-l-blue-600 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{risk.description}</h4>
                      <p className="text-sm text-slate-600 mt-1">{risk.impact}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge className={getSeverityColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                      <Badge className={getStatusColor(risk.status)}>
                        {risk.status === 'identified' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {risk.status === 'mitigating' && <Clock className="h-3 w-3 mr-1" />}
                        {risk.status === 'resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {risk.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-blue-900 text-sm">Mitigation Strategy</h5>
                        <p className="text-sm text-blue-800 mt-1">{risk.mitigation_plan?.strategy}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <h6 className="font-semibold text-slate-900 text-xs">Action Items:</h6>
                      <ul className="space-y-1">
                        {risk.mitigation_plan?.actions?.map((action, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
                      <div>
                        <strong>Owner:</strong> {risk.mitigation_plan?.responsible_party}
                      </div>
                      <div>
                        <strong>Timeline:</strong> {risk.mitigation_plan?.timeline}
                      </div>
                      <div>
                        <strong>Probability:</strong> {risk.probability}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}