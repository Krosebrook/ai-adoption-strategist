import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, Shield, Plug, Target } from 'lucide-react';
import { AI_PLATFORMS } from '../assessment/AssessmentData';

const DeltaIndicator = ({ current, baseline, isCurrency = false, isPercentage = false }) => {
  if (!baseline || baseline === 0) return null;
  
  const delta = current - baseline;
  const percentChange = ((delta / baseline) * 100).toFixed(1);
  const isPositive = delta > 0;
  const isNeutral = Math.abs(delta) < 0.1;

  if (isNeutral) {
    return (
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <Minus className="h-3 w-3" />
        <span>No change</span>
      </div>
    );
  }

  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}>
      <Icon className="h-3 w-3" />
      {isCurrency && <span>$</span>}
      {Math.abs(delta).toLocaleString()}
      {isPercentage && <span>%</span>}
      <span className="text-slate-400">({isPositive ? '+' : ''}{percentChange}%)</span>
    </div>
  );
};

export default function ScenarioComparison({ scenarios }) {
  if (scenarios.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p>No scenarios to compare</p>
      </div>
    );
  }

  const baseline = scenarios[0];
  const compareScenarios = scenarios.slice(1);

  // Get top platform for each scenario
  const getTopPlatform = (scenario) => {
    const topRec = scenario.results?.recommendations?.[0];
    if (!topRec) return null;
    return AI_PLATFORMS.find(p => p.id === topRec.platform);
  };

  return (
    <div className="space-y-6">
      {/* Overview Comparison */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Scenario Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Metric</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    {baseline.name}
                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">Baseline</Badge>
                  </th>
                  {compareScenarios.map((scenario, idx) => (
                    <th key={idx} className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                      {scenario.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Total Users */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    Total Users
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="text-lg font-bold text-slate-900">
                      {baseline.departments.reduce((sum, d) => sum + d.user_count, 0)}
                    </div>
                  </td>
                  {compareScenarios.map((scenario, idx) => {
                    const total = scenario.departments.reduce((sum, d) => sum + d.user_count, 0);
                    const baselineTotal = baseline.departments.reduce((sum, d) => sum + d.user_count, 0);
                    return (
                      <td key={idx} className="text-center py-3 px-4">
                        <div className="text-lg font-bold text-slate-900">{total}</div>
                        <DeltaIndicator current={total} baseline={baselineTotal} />
                      </td>
                    );
                  })}
                </tr>

                {/* Departments */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-medium text-slate-700">
                    Departments
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="text-lg font-bold text-slate-900">
                      {baseline.departments.length}
                    </div>
                  </td>
                  {compareScenarios.map((scenario, idx) => (
                    <td key={idx} className="text-center py-3 px-4">
                      <div className="text-lg font-bold text-slate-900">
                        {scenario.departments.length}
                      </div>
                      <DeltaIndicator 
                        current={scenario.departments.length} 
                        baseline={baseline.departments.length} 
                      />
                    </td>
                  ))}
                </tr>

                {/* Top Platform */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-medium text-slate-700">
                    Top Recommendation
                  </td>
                  <td className="text-center py-3 px-4">
                    {getTopPlatform(baseline) ? (
                      <div className="flex items-center justify-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getTopPlatform(baseline).color }} 
                        />
                        <span className="text-sm font-medium text-slate-900">
                          {getTopPlatform(baseline).name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  {compareScenarios.map((scenario, idx) => {
                    const platform = getTopPlatform(scenario);
                    return (
                      <td key={idx} className="text-center py-3 px-4">
                        {platform ? (
                          <div className="flex items-center justify-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: platform.color }} 
                            />
                            <span className="text-sm font-medium text-slate-900">
                              {platform.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Overall Score */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-medium text-slate-700">
                    Top Platform Score
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="text-lg font-bold text-slate-900">
                      {baseline.results?.recommendations?.[0]?.score?.toFixed(1) || '-'}
                    </div>
                  </td>
                  {compareScenarios.map((scenario, idx) => {
                    const score = scenario.results?.recommendations?.[0]?.score;
                    const baselineScore = baseline.results?.recommendations?.[0]?.score;
                    return (
                      <td key={idx} className="text-center py-3 px-4">
                        <div className="text-lg font-bold text-slate-900">
                          {score?.toFixed(1) || '-'}
                        </div>
                        {score && baselineScore && (
                          <DeltaIndicator current={score} baseline={baselineScore} />
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Compliance Requirements */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    Compliance Requirements
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="text-lg font-bold text-slate-900">
                      {baseline.compliance_requirements.length}
                    </div>
                  </td>
                  {compareScenarios.map((scenario, idx) => (
                    <td key={idx} className="text-center py-3 px-4">
                      <div className="text-lg font-bold text-slate-900">
                        {scenario.compliance_requirements.length}
                      </div>
                      <DeltaIndicator 
                        current={scenario.compliance_requirements.length} 
                        baseline={baseline.compliance_requirements.length} 
                      />
                    </td>
                  ))}
                </tr>

                {/* Integrations */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Plug className="h-4 w-4 text-slate-400" />
                    Required Integrations
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="text-lg font-bold text-slate-900">
                      {baseline.desired_integrations.length}
                    </div>
                  </td>
                  {compareScenarios.map((scenario, idx) => (
                    <td key={idx} className="text-center py-3 px-4">
                      <div className="text-lg font-bold text-slate-900">
                        {scenario.desired_integrations.length}
                      </div>
                      <DeltaIndicator 
                        current={scenario.desired_integrations.length} 
                        baseline={baseline.desired_integrations.length} 
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ROI Comparison */}
      {scenarios.every(s => s.results?.roiData) && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              ROI Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Platform</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                      {baseline.name}
                    </th>
                    {compareScenarios.map((scenario, idx) => (
                      <th key={idx} className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                        {scenario.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AI_PLATFORMS.map(platform => {
                    const baselineROI = baseline.results.roiData.find(r => r.platform === platform.id);
                    return (
                      <tr key={platform.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }} />
                            <span className="text-sm font-medium text-slate-900">{platform.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="text-sm font-bold text-slate-900">
                            ${baselineROI?.net_annual_savings?.toLocaleString() || '0'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {baselineROI?.one_year_roi?.toFixed(0) || '0'}% ROI
                          </div>
                        </td>
                        {compareScenarios.map((scenario, idx) => {
                          const scenarioROI = scenario.results.roiData.find(r => r.platform === platform.id);
                          return (
                            <td key={idx} className="text-center py-3 px-4">
                              <div className="text-sm font-bold text-slate-900">
                                ${scenarioROI?.net_annual_savings?.toLocaleString() || '0'}
                              </div>
                              <div className="text-xs text-slate-500">
                                {scenarioROI?.one_year_roi?.toFixed(0) || '0'}% ROI
                              </div>
                              <DeltaIndicator 
                                current={scenarioROI?.net_annual_savings || 0} 
                                baseline={baselineROI?.net_annual_savings || 0}
                                isCurrency={true}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Breakdown Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario, scenarioIdx) => {
          const topRec = scenario.results?.recommendations?.[0];
          if (!topRec) return null;

          return (
            <Card key={scenarioIdx} className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900 text-lg">
                  {scenario.name}
                  {scenarioIdx === 0 && (
                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">Baseline</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">ROI Score</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{topRec.roi_score.toFixed(1)}%</span>
                      {scenarioIdx > 0 && (
                        <DeltaIndicator 
                          current={topRec.roi_score} 
                          baseline={scenarios[0].results.recommendations[0].roi_score}
                          isPercentage={true}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Compliance Score</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{topRec.compliance_score.toFixed(1)}%</span>
                      {scenarioIdx > 0 && (
                        <DeltaIndicator 
                          current={topRec.compliance_score} 
                          baseline={scenarios[0].results.recommendations[0].compliance_score}
                          isPercentage={true}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Integration Score</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{topRec.integration_score.toFixed(1)}%</span>
                      {scenarioIdx > 0 && (
                        <DeltaIndicator 
                          current={topRec.integration_score} 
                          baseline={scenarios[0].results.recommendations[0].integration_score}
                          isPercentage={true}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Pain Point Score</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{topRec.pain_point_score.toFixed(1)}%</span>
                      {scenarioIdx > 0 && (
                        <DeltaIndicator 
                          current={topRec.pain_point_score} 
                          baseline={scenarios[0].results.recommendations[0].pain_point_score}
                          isPercentage={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}