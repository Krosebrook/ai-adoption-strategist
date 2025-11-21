import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowRight, Target, Zap } from 'lucide-react';
import { simulateMarketTrendImpact, simulateComplianceChangeImpact, simulatePlatformChangeImpact } from '../scenarios/ScenarioSimulationEngine';
import { toast } from 'sonner';

export default function AIScenarioPlanner({ baseAssessment }) {
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [scenarioType, setScenarioType] = useState('market_trend');
  const [scenarioConfig, setScenarioConfig] = useState({
    trendType: '',
    description: '',
    timeline: '',
    severity: 'medium',
    regulation: '',
    changeType: '',
    effectiveDate: '',
    alternativePlatform: '',
    reason: '',
  });

  const handleRunSimulation = async () => {
    setLoadingSimulation(true);
    try {
      let result;
      
      if (scenarioType === 'market_trend') {
        result = await simulateMarketTrendImpact(baseAssessment, {
          trendType: scenarioConfig.trendType,
          description: scenarioConfig.description,
          timeline: scenarioConfig.timeline,
          severity: scenarioConfig.severity
        });
      } else if (scenarioType === 'compliance_change') {
        result = await simulateComplianceChangeImpact(baseAssessment, {
          regulation: scenarioConfig.regulation,
          changeType: scenarioConfig.changeType,
          description: scenarioConfig.description,
          effectiveDate: scenarioConfig.effectiveDate,
          severity: scenarioConfig.severity
        });
      } else if (scenarioType === 'platform_change') {
        result = await simulatePlatformChangeImpact(baseAssessment, {
          alternativePlatform: scenarioConfig.alternativePlatform,
          reason: scenarioConfig.reason,
          priorityFactors: []
        });
      }

      setActiveSimulation({ type: scenarioType, config: scenarioConfig, result });
      toast.success('Simulation complete!');
    } catch (error) {
      console.error('Simulation failed:', error);
      toast.error('Failed to run simulation');
    } finally {
      setLoadingSimulation(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[severity] || 'bg-slate-100 text-slate-800';
  };

  const getViabilityIcon = (change) => {
    if (change === 'significantly_improved') return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (change === 'improved') return <TrendingUp className="h-5 w-5 text-blue-600" />;
    if (change === 'decreased') return <TrendingDown className="h-5 w-5 text-orange-600" />;
    if (change === 'significantly_decreased') return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <CheckCircle className="h-5 w-5 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Scenario Simulator
          </CardTitle>
          <p className="text-sm text-slate-600">
            Simulate impact of market trends, compliance changes, and platform switches with AI-powered analysis
          </p>
        </CardHeader>
      </Card>

      {/* Scenario Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Scenario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Scenario Type</Label>
            <Select value={scenarioType} onValueChange={setScenarioType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market_trend">Market Trend Impact</SelectItem>
                <SelectItem value="compliance_change">Compliance Change</SelectItem>
                <SelectItem value="platform_change">Platform Switch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scenarioType === 'market_trend' && (
            <>
              <div>
                <Label>Trend Type</Label>
                <Input
                  placeholder="e.g., Major price reduction, New competitor, Tech breakthrough"
                  value={scenarioConfig.trendType}
                  onChange={(e) => setScenarioConfig({...scenarioConfig, trendType: e.target.value})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the market trend and its potential impact..."
                  value={scenarioConfig.description}
                  onChange={(e) => setScenarioConfig({...scenarioConfig, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Timeline</Label>
                  <Input
                    placeholder="e.g., 3-6 months"
                    value={scenarioConfig.timeline}
                    onChange={(e) => setScenarioConfig({...scenarioConfig, timeline: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select 
                    value={scenarioConfig.severity} 
                    onValueChange={(val) => setScenarioConfig({...scenarioConfig, severity: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {scenarioType === 'compliance_change' && (
            <>
              <div>
                <Label>Regulation</Label>
                <Input
                  placeholder="e.g., GDPR, HIPAA, New AI Act"
                  value={scenarioConfig.regulation}
                  onChange={(e) => setScenarioConfig({...scenarioConfig, regulation: e.target.value})}
                />
              </div>
              <div>
                <Label>Change Type</Label>
                <Input
                  placeholder="e.g., New requirement, Stricter enforcement, Expanded scope"
                  value={scenarioConfig.changeType}
                  onChange={(e) => setScenarioConfig({...scenarioConfig, changeType: e.target.value})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the compliance change and requirements..."
                  value={scenarioConfig.description}
                  onChange={(e) => setScenarioConfig({...scenarioConfig, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={scenarioConfig.effectiveDate}
                    onChange={(e) => setScenarioConfig({...scenarioConfig, effectiveDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select 
                    value={scenarioConfig.severity} 
                    onValueChange={(val) => setScenarioConfig({...scenarioConfig, severity: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {scenarioType === 'platform_change' && (
            <>
              <div>
                <Label>Alternative Platform</Label>
                <Select 
                  value={scenarioConfig.alternativePlatform}
                  onValueChange={(val) => setScenarioConfig({...scenarioConfig, alternativePlatform: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google Gemini">Google Gemini</SelectItem>
                    <SelectItem value="Microsoft Copilot">Microsoft Copilot</SelectItem>
                    <SelectItem value="Anthropic Claude">Anthropic Claude</SelectItem>
                    <SelectItem value="OpenAI ChatGPT">OpenAI ChatGPT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reason for Change</Label>
                <Textarea
                  placeholder="Why consider switching platforms? (e.g., cost, features, compliance)"
                  value={scenarioConfig.reason}
                  onChange={(e) => setScenarioConfig({...scenarioConfig, reason: e.target.value})}
                />
              </div>
            </>
          )}

          <Button 
            onClick={handleRunSimulation}
            disabled={loadingSimulation}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loadingSimulation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Simulation...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Run AI Simulation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Simulation Results */}
      {activeSimulation && (
        <div className="space-y-6">
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Simulation Results: {activeSimulation.type.replace(/_/g, ' ')}
              </CardTitle>
            </CardHeader>
          </Card>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="platforms">Platform Impact</TabsTrigger>
              <TabsTrigger value="financials">Financial Impact</TabsTrigger>
              <TabsTrigger value="risks">Risks & Mitigation</TabsTrigger>
              <TabsTrigger value="strategy">Strategy & Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {activeSimulation.result.scenario_analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>Scenario Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="text-sm text-slate-600 mb-1">Impact Severity</div>
                        <Badge className={getSeverityColor(activeSimulation.result.scenario_analysis.impact_severity)}>
                          {activeSimulation.result.scenario_analysis.impact_severity}
                        </Badge>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="text-sm text-slate-600 mb-1">Probability</div>
                        <div className="text-2xl font-bold text-slate-900">
                          {activeSimulation.result.scenario_analysis.probability}%
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900">Affected Areas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeSimulation.result.scenario_analysis.affected_areas?.map((area, idx) => (
                          <Badge key={idx} variant="outline">{area}</Badge>
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        <strong>Timeframe:</strong> {activeSimulation.result.scenario_analysis.timeframe_to_impact}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="platforms">
              <div className="space-y-3">
                {activeSimulation.result.platform_impact?.map((platform, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getViabilityIcon(platform.viability_change)}
                          <h4 className="font-semibold text-slate-900">{platform.platform}</h4>
                        </div>
                        <Badge className="bg-blue-600 text-white">
                          Score: {platform.new_score}
                        </Badge>
                      </div>
                      <Badge className={`mb-2 ${
                        platform.viability_change.includes('improved') ? 'bg-green-100 text-green-800' :
                        platform.viability_change.includes('decreased') ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {platform.viability_change.replace(/_/g, ' ')}
                      </Badge>
                      <p className="text-sm text-slate-700">{platform.reasoning}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="financials">
              {(activeSimulation.result.roi_impact || activeSimulation.result.financial_impact) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Impact Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeSimulation.result.roi_impact && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="text-sm text-blue-600 mb-1">Original ROI</div>
                          <div className="text-2xl font-bold text-blue-900">
                            {activeSimulation.result.roi_impact.original_roi.toFixed(1)}%
                          </div>
                        </div>
                        <div className={`border rounded-lg p-4 ${
                          activeSimulation.result.roi_impact.change_percentage >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="text-sm mb-1" style={{
                            color: activeSimulation.result.roi_impact.change_percentage >= 0 ? 'rgb(22 101 52)' : 'rgb(153 27 27)'
                          }}>
                            Projected ROI
                          </div>
                          <div className="text-2xl font-bold" style={{
                            color: activeSimulation.result.roi_impact.change_percentage >= 0 ? 'rgb(20 83 45)' : 'rgb(127 29 29)'
                          }}>
                            {activeSimulation.result.roi_impact.projected_roi.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                          <div className="text-sm text-slate-600 mb-1">Change</div>
                          <div className={`text-2xl font-bold ${
                            activeSimulation.result.roi_impact.change_percentage >= 0 ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {activeSimulation.result.roi_impact.change_percentage >= 0 ? '+' : ''}
                            {activeSimulation.result.roi_impact.change_percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeSimulation.result.financial_impact && (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <h5 className="font-semibold text-slate-900 mb-2">Cost Breakdown</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Current Platform Annual Cost:</span>
                            <span className="font-medium">
                              ${activeSimulation.result.financial_impact.current_platform_annual_cost?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Alternative Platform Annual Cost:</span>
                            <span className="font-medium">
                              ${activeSimulation.result.financial_impact.alternative_platform_annual_cost?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Migration Cost:</span>
                            <span className="font-medium">
                              ${activeSimulation.result.financial_impact.migration_cost?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t font-semibold">
                            <span>3-Year Cost Difference:</span>
                            <span className={activeSimulation.result.financial_impact.three_year_cost_difference < 0 ? 'text-green-600' : 'text-red-600'}>
                              ${Math.abs(activeSimulation.result.financial_impact.three_year_cost_difference)?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="risks">
              <div className="space-y-3">
                {activeSimulation.result.new_risks?.map((risk, idx) => (
                  <Card key={idx} className={`border-l-4 ${
                    risk.severity === 'critical' ? 'border-l-red-600' :
                    risk.severity === 'high' ? 'border-l-orange-600' :
                    risk.severity === 'medium' ? 'border-l-yellow-600' :
                    'border-l-blue-600'
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{risk.risk}</h4>
                        <Badge className={getSeverityColor(risk.severity)}>
                          {risk.severity}
                        </Badge>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <h5 className="text-sm font-semibold text-blue-900 mb-1">Mitigation Strategy</h5>
                        <p className="text-sm text-blue-800">{risk.mitigation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="strategy">
              <div className="space-y-4">
                {activeSimulation.result.optimal_response && (
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-900">
                        <Zap className="h-5 w-5" />
                        Optimal Response Strategy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-green-900 mb-4 font-medium">
                        {activeSimulation.result.optimal_response.recommended_action}
                      </p>

                      {activeSimulation.result.optimal_response.strategy_adjustments?.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-green-900 mb-2">Strategy Adjustments:</h5>
                          <ul className="space-y-1">
                            {activeSimulation.result.optimal_response.strategy_adjustments.map((adj, idx) => (
                              <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                {adj}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activeSimulation.result.optimal_response.immediate_steps?.length > 0 && (
                        <div className="bg-white border border-green-200 rounded-lg p-3">
                          <h5 className="text-sm font-semibold text-green-900 mb-2">Immediate Action Steps:</h5>
                          <ol className="space-y-1 list-decimal list-inside">
                            {activeSimulation.result.optimal_response.immediate_steps.map((step, idx) => (
                              <li key={idx} className="text-sm text-green-800">{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeSimulation.result.contingency_plan && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Contingency Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-semibold text-slate-900 mb-1">Trigger Conditions:</h5>
                          <ul className="space-y-1">
                            {activeSimulation.result.contingency_plan.trigger_conditions?.map((condition, idx) => (
                              <li key={idx} className="text-sm text-slate-700">• {condition}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded p-3">
                          <h5 className="text-sm font-semibold text-amber-900 mb-1">Backup Strategy:</h5>
                          <p className="text-sm text-amber-800">{activeSimulation.result.contingency_plan.backup_strategy}</p>
                        </div>
                        {activeSimulation.result.contingency_plan.budget_buffer_needed > 0 && (
                          <div className="text-sm text-slate-700">
                            <strong>Budget Buffer Needed:</strong> ${activeSimulation.result.contingency_plan.budget_buffer_needed?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}