import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, Shield, Plug, Target } from 'lucide-react';
import { AI_PLATFORMS } from '../assessment/AssessmentData';
import { calculateROI, assessCompliance, assessIntegrations, assessPainPoints } from '../assessment/CalculationEngine';

export default function ScenarioComparison({ baseAssessment, scenarios }) {
  if (!scenarios || scenarios.length === 0) {
    return null;
  }

  const calculateMetrics = (scenarioData) => {
    const roiData = calculateROI(scenarioData.departments, 'google_gemini'); // Use any platform for structure
    const allROI = ['google_gemini', 'microsoft_copilot', 'anthropic_claude', 'openai_chatgpt'].map(platform => 
      calculateROI(scenarioData.departments, platform)
    );
    const complianceData = assessCompliance(scenarioData.compliance_requirements || []);
    const integrationData = assessIntegrations(scenarioData.desired_integrations || []);
    const painPointData = assessPainPoints(scenarioData.pain_points || []);

    return {
      roiByPlatform: allROI.reduce((acc, roi) => {
        acc[roi.platform] = roi;
        return acc;
      }, {}),
      compliance: complianceData,
      integration: integrationData,
      painPoint: painPointData.platform_scores
    };
  };

  const baseMetrics = calculateMetrics(baseAssessment);
  const scenarioMetrics = scenarios.map(scenario => ({
    ...scenario,
    metrics: calculateMetrics(scenario)
  }));

  const getDelta = (baseValue, scenarioValue) => {
    const diff = scenarioValue - baseValue;
    const percentChange = baseValue !== 0 ? (diff / baseValue) * 100 : 0;
    return { diff, percentChange, direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral' };
  };

  const DeltaIndicator = ({ delta }) => {
    if (delta.direction === 'neutral') {
      return (
        <div className="flex items-center gap-1 text-slate-500">
          <Minus className="h-3 w-3" />
          <span className="text-xs">0%</span>
        </div>
      );
    }

    const isPositive = delta.direction === 'up';
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        <span className="text-xs font-semibold">
          {isPositive ? '+' : ''}{delta.percentChange.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">Cross-Scenario Platform Comparison</h2>
        <p className="text-slate-200">Compare key metrics across all scenarios and platforms</p>
      </div>

      {AI_PLATFORMS.map(platform => {
        const baseROI = baseMetrics.roiByPlatform[platform.id];
        const baseCompliance = baseMetrics.compliance[platform.id]?.compliance_score || 0;
        const baseIntegration = baseMetrics.integration[platform.id]?.integration_score || 0;
        const basePainPoint = baseMetrics.painPoint[platform.id] || 0;

        return (
          <Card key={platform.id} className="border-slate-200">
            <CardHeader className="bg-slate-50">
              <CardTitle className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: platform.color }} />
                <span className="text-slate-900">{platform.name}</span>
                <Badge variant="secondary" className="text-xs">Multi-Scenario Analysis</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300">
                      <th className="text-left py-3 px-3 text-slate-700 font-bold">Metric</th>
                      <th className="text-center py-3 px-3 text-slate-700 font-bold bg-slate-50">
                        <div className="flex flex-col items-center">
                          <span>Baseline</span>
                          <span className="text-xs font-normal text-slate-500">(Reference)</span>
                        </div>
                      </th>
                      {scenarioMetrics.map(scenario => (
                        <th key={scenario.id} className="text-center py-3 px-3 text-slate-700 font-bold">
                          <div className="flex flex-col items-center">
                            <span>{scenario.name}</span>
                            <span className="text-xs font-normal text-slate-500">(Delta vs Base)</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* ROI Row */}
                    <tr className="border-b border-slate-200 hover:bg-blue-50">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-semibold text-slate-900">1-Year ROI</div>
                            <div className="text-xs text-slate-500">Return on Investment</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-3 bg-slate-50">
                        <div className="font-bold text-lg text-slate-900">
                          {baseROI?.one_year_roi?.toFixed(1) || 0}%
                        </div>
                        <div className="text-xs text-slate-500">
                          ${baseROI?.net_annual_savings?.toLocaleString() || 0} savings
                        </div>
                      </td>
                      {scenarioMetrics.map(scenario => {
                        const scenarioROI = scenario.metrics.roiByPlatform[platform.id];
                        const delta = getDelta(baseROI?.one_year_roi || 0, scenarioROI?.one_year_roi || 0);
                        return (
                          <td key={scenario.id} className="text-center py-4 px-3">
                            <div className="font-bold text-lg text-slate-900">
                              {scenarioROI?.one_year_roi?.toFixed(1) || 0}%
                            </div>
                            <DeltaIndicator delta={delta} />
                            <div className="text-xs text-slate-500 mt-1">
                              ${scenarioROI?.net_annual_savings?.toLocaleString() || 0}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Compliance Row */}
                    <tr className="border-b border-slate-200 hover:bg-green-50">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="font-semibold text-slate-900">Compliance Score</div>
                            <div className="text-xs text-slate-500">Standards Coverage</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-3 bg-slate-50">
                        <div className="font-bold text-lg text-slate-900">
                          {baseCompliance.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-500">
                          {baseMetrics.compliance[platform.id]?.certified || 0} certified
                        </div>
                      </td>
                      {scenarioMetrics.map(scenario => {
                        const scenarioCompliance = scenario.metrics.compliance[platform.id]?.compliance_score || 0;
                        const delta = getDelta(baseCompliance, scenarioCompliance);
                        return (
                          <td key={scenario.id} className="text-center py-4 px-3">
                            <div className="font-bold text-lg text-slate-900">
                              {scenarioCompliance.toFixed(1)}%
                            </div>
                            <DeltaIndicator delta={delta} />
                            <div className="text-xs text-slate-500 mt-1">
                              {scenario.metrics.compliance[platform.id]?.certified || 0} certified
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Integration Row */}
                    <tr className="border-b border-slate-200 hover:bg-purple-50">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <Plug className="h-4 w-4 text-purple-600" />
                          <div>
                            <div className="font-semibold text-slate-900">Integration Score</div>
                            <div className="text-xs text-slate-500">System Compatibility</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-3 bg-slate-50">
                        <div className="font-bold text-lg text-slate-900">
                          {baseIntegration.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-500">
                          {baseMetrics.integration[platform.id]?.native || 0} native
                        </div>
                      </td>
                      {scenarioMetrics.map(scenario => {
                        const scenarioIntegration = scenario.metrics.integration[platform.id]?.integration_score || 0;
                        const delta = getDelta(baseIntegration, scenarioIntegration);
                        return (
                          <td key={scenario.id} className="text-center py-4 px-3">
                            <div className="font-bold text-lg text-slate-900">
                              {scenarioIntegration.toFixed(1)}%
                            </div>
                            <DeltaIndicator delta={delta} />
                            <div className="text-xs text-slate-500 mt-1">
                              {scenario.metrics.integration[platform.id]?.native || 0} native
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Pain Point Row */}
                    <tr className="border-b border-slate-200 hover:bg-amber-50">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-amber-600" />
                          <div>
                            <div className="font-semibold text-slate-900">Pain Point Score</div>
                            <div className="text-xs text-slate-500">Challenge Alignment</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-3 bg-slate-50">
                        <div className="font-bold text-lg text-slate-900">
                          {basePainPoint.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500">
                          Alignment score
                        </div>
                      </td>
                      {scenarioMetrics.map(scenario => {
                        const scenarioPainPoint = scenario.metrics.painPoint[platform.id] || 0;
                        const delta = getDelta(basePainPoint, scenarioPainPoint);
                        return (
                          <td key={scenario.id} className="text-center py-4 px-3">
                            <div className="font-bold text-lg text-slate-900">
                              {scenarioPainPoint.toFixed(1)}
                            </div>
                            <DeltaIndicator delta={delta} />
                          </td>
                        );
                      })}
                    </tr>

                    {/* Net Savings Row */}
                    <tr className="bg-slate-50 hover:bg-slate-100">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-indigo-600" />
                          <div>
                            <div className="font-semibold text-slate-900">Net Annual Savings</div>
                            <div className="text-xs text-slate-500">After Platform Costs</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-3 bg-slate-100">
                        <div className="font-bold text-lg text-slate-900">
                          ${baseROI?.net_annual_savings?.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-slate-500">
                          ${baseROI?.total_cost?.toLocaleString() || 0} cost
                        </div>
                      </td>
                      {scenarioMetrics.map(scenario => {
                        const scenarioROI = scenario.metrics.roiByPlatform[platform.id];
                        const delta = getDelta(
                          baseROI?.net_annual_savings || 0, 
                          scenarioROI?.net_annual_savings || 0
                        );
                        return (
                          <td key={scenario.id} className="text-center py-4 px-3">
                            <div className="font-bold text-lg text-slate-900">
                              ${scenarioROI?.net_annual_savings?.toLocaleString() || 0}
                            </div>
                            <DeltaIndicator delta={delta} />
                            <div className="text-xs text-slate-500 mt-1">
                              ${scenarioROI?.total_cost?.toLocaleString() || 0} cost
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}