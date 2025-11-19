import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Plug, CheckCircle2, XCircle } from 'lucide-react';
import { AI_PLATFORMS } from '../assessment/AssessmentData';

export default function RiskIndicators({ complianceScores, integrationScores, complianceRequirements, integrations }) {
  // Identify critical compliance gaps
  const complianceRisks = [];
  Object.entries(complianceScores || {}).forEach(([platformId, data]) => {
    const platform = AI_PLATFORMS.find(p => p.id === platformId);
    if (data.not_certified > 0) {
      complianceRisks.push({
        platform: platform?.name,
        platformId: platformId,
        color: platform?.color,
        gaps: data.not_certified,
        score: data.compliance_score
      });
    }
  });

  // Identify integration challenges
  const integrationRisks = [];
  Object.entries(integrationScores || {}).forEach(([platformId, data]) => {
    const platform = AI_PLATFORMS.find(p => p.id === platformId);
    if (data.not_supported > 0) {
      integrationRisks.push({
        platform: platform?.name,
        platformId: platformId,
        color: platform?.color,
        unsupported: data.not_supported,
        score: data.integration_score
      });
    }
  });

  const hasRisks = complianceRisks.length > 0 || integrationRisks.length > 0;
  const overallRiskLevel = (complianceRisks.length + integrationRisks.length) > 5 ? 'high' : 
                           (complianceRisks.length + integrationRisks.length) > 2 ? 'medium' : 'low';

  const riskLevelConfig = {
    high: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800' },
    medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800' },
    low: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800' }
  };

  const config = riskLevelConfig[overallRiskLevel];

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${config.color}`} />
            Risk Assessment
          </CardTitle>
          <Badge className={config.badge}>
            {overallRiskLevel.toUpperCase()} RISK
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!hasRisks ? (
          <div className={`${config.bg} ${config.border} border rounded-lg p-6 text-center`}>
            <CheckCircle2 className={`h-12 w-12 ${config.color} mx-auto mb-3`} />
            <p className="font-semibold text-slate-900 mb-1">No Critical Risks Identified</p>
            <p className="text-sm text-slate-600">All platforms meet your basic requirements</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Compliance Risks */}
            {complianceRisks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-red-600" />
                  <h4 className="text-sm font-semibold text-slate-900">Compliance Gaps</h4>
                </div>
                <div className="space-y-2">
                  {complianceRisks.map((risk) => (
                    <div key={risk.platformId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: risk.color }} />
                        <span className="text-sm font-medium text-slate-900">{risk.platform}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white border-red-300 text-red-700 text-xs">
                          {risk.gaps} gaps
                        </Badge>
                        <span className="text-xs text-slate-600">{risk.score.toFixed(0)}% compliant</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  ⚠️ Required standards: {complianceRequirements?.join(', ')}
                </p>
              </div>
            )}

            {/* Integration Risks */}
            {integrationRisks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Plug className="h-4 w-4 text-amber-600" />
                  <h4 className="text-sm font-semibold text-slate-900">Integration Challenges</h4>
                </div>
                <div className="space-y-2">
                  {integrationRisks.map((risk) => (
                    <div key={risk.platformId} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: risk.color }} />
                        <span className="text-sm font-medium text-slate-900">{risk.platform}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white border-amber-300 text-amber-700 text-xs">
                          {risk.unsupported} unsupported
                        </Badge>
                        <span className="text-xs text-slate-600">{risk.score.toFixed(0)}% compatible</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  🔌 Required integrations: {integrations?.slice(0, 3).join(', ')}{integrations?.length > 3 ? '...' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}