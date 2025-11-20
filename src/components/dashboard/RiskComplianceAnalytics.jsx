import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Shield, TrendingDown } from 'lucide-react';
import { SEVERITY_LEVELS, CHART_COLORS } from '../utils/constants';
import { getSeverityStyle } from '../utils/formatters';
import EmptyState from '../ui/EmptyState';

export default function RiskComplianceAnalytics({ assessments }) {
  // Aggregate compliance gaps across all assessments
  const getComplianceGaps = () => {
    const gapCounts = {};
    
    assessments.forEach(assessment => {
      const complianceScores = assessment.compliance_scores || {};
      
      Object.entries(complianceScores).forEach(([platform, data]) => {
        if (data.status_details) {
          Object.entries(data.status_details).forEach(([requirement, status]) => {
            if (status === 'not_certified' || status === 'in_progress') {
              const key = `${requirement}`;
              if (!gapCounts[key]) {
                gapCounts[key] = {
                  requirement,
                  count: 0,
                  severity: status === 'not_certified' ? 'high' : 'medium'
                };
              }
              gapCounts[key].count++;
            }
          });
        }
      });
    });
    
    return Object.values(gapCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Aggregate integration challenges
  const getIntegrationChallenges = () => {
    const challengeCounts = {};
    
    assessments.forEach(assessment => {
      const integrationScores = assessment.integration_scores || {};
      
      Object.entries(integrationScores).forEach(([platform, data]) => {
        if (data.integration_details) {
          Object.entries(data.integration_details).forEach(([integration, support]) => {
            if (support === 'not_supported' || support === 'limited') {
              const key = integration;
              if (!challengeCounts[key]) {
                challengeCounts[key] = {
                  integration,
                  count: 0,
                  severity: support === 'not_supported' ? 'high' : 'medium'
                };
              }
              challengeCounts[key].count++;
            }
          });
        }
      });
    });
    
    return Object.values(challengeCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Common pain points
  const getPainPointFrequency = () => {
    const painPointCounts = {};
    
    assessments.forEach(assessment => {
      (assessment.pain_points || []).forEach(painPoint => {
        if (!painPointCounts[painPoint]) {
          painPointCounts[painPoint] = { name: painPoint, count: 0 };
        }
        painPointCounts[painPoint].count++;
      });
    });
    
    return Object.values(painPointCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  const complianceGaps = getComplianceGaps();
  const integrationChallenges = getIntegrationChallenges();
  const painPointData = getPainPointFrequency();

  return (
    <div className="space-y-6">
      {/* Compliance Gaps */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Most Common Compliance Gaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          {complianceGaps.length === 0 ? (
            <EmptyState 
              icon={Shield}
              title="No compliance gaps identified"
              description="All assessments meet compliance requirements"
            />
          ) : (
            <div className="space-y-3">
              {complianceGaps.map((gap, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{gap.requirement}</h4>
                    <p className="text-sm text-slate-600">Found in {gap.count} assessment{gap.count > 1 ? 's' : ''}</p>
                  </div>
                  <Badge className={getSeverityStyle(gap.severity)}>{gap.severity}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Challenges */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Common Integration Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {integrationChallenges.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No integration challenges identified</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={integrationChallenges} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="integration" type="category" stroke="#64748b" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS.WARNING} name="Occurrences" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Pain Points Frequency */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-purple-600" />
            Most Frequent Pain Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          {painPointData.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <TrendingDown className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pain points data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={painPointData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS.TERTIARY} name="Frequency" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}