import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export default function RiskIndicatorsPanel({ strategies }) {
  const riskData = useMemo(() => {
    const allRisks = strategies.flatMap(s => 
      (s.risk_analysis?.identified_risks || []).map(r => ({
        ...r,
        strategyName: s.organization_name
      }))
    );

    const critical = allRisks.filter(r => r.severity === 'critical');
    const high = allRisks.filter(r => r.severity === 'high');
    const medium = allRisks.filter(r => r.severity === 'medium');
    const low = allRisks.filter(r => r.severity === 'low');

    const activeRisks = allRisks.filter(r => r.status !== 'resolved' && r.status !== 'accepted');

    return {
      total: allRisks.length,
      critical: critical.length,
      high: high.length,
      medium: medium.length,
      low: low.length,
      active: activeRisks.length,
      topRisks: activeRisks
        .filter(r => r.severity === 'critical' || r.severity === 'high')
        .slice(0, 3)
    };
  }, [strategies]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Shield className="h-5 w-5 text-red-500" />
          Risk Indicators
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Summary */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-600">{riskData.critical}</div>
            <div className="text-xs text-red-600">Critical</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <div className="text-xl font-bold text-orange-600">{riskData.high}</div>
            <div className="text-xs text-orange-600">High</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-lg">
            <div className="text-xl font-bold text-yellow-600">{riskData.medium}</div>
            <div className="text-xs text-yellow-600">Medium</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{riskData.low}</div>
            <div className="text-xs text-green-600">Low</div>
          </div>
        </div>

        {/* Active Risks Alert */}
        {riskData.active > 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              <strong>{riskData.active}</strong> active risks require attention
            </span>
          </div>
        )}

        {/* Top Risks */}
        {riskData.topRisks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Priority Risks</p>
            {riskData.topRisks.map((risk, idx) => (
              <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{risk.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getSeverityColor(risk.severity)}`}>
                        {risk.severity}
                      </Badge>
                      <span className="text-xs text-slate-400 truncate">{risk.strategyName}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {riskData.total === 0 && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-800">No risks identified</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}