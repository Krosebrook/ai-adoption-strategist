import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, TrendingUp, Shield, Users, Plus, Trash2, 
  BarChart3, AlertTriangle, Lightbulb, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  simulateMarketTrendImpact, 
  simulateRegulatoryImpact, 
  simulateCompetitorImpact,
  compareScenarios 
} from './AdvancedScenarioEngine';

export default function AdvancedScenarioModeler({ strategy }) {
  const [scenarios, setScenarios] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [activeScenario, setActiveScenario] = useState('market');
  
  const [marketConfig, setMarketConfig] = useState({
    trend_type: 'ai_breakthrough',
    description: '',
    timeframe: '6-12 months',
    probability: 'high'
  });

  const [regulatoryConfig, setRegulatoryConfig] = useState({
    regulation_name: '',
    jurisdiction: 'US',
    effective_date: '',
    key_requirements: []
  });

  const [competitorConfig, setCompetitorConfig] = useState({
    competitor_name: '',
    action_type: 'product_launch',
    description: '',
    expected_market_impact: 'significant'
  });

  const [newRequirement, setNewRequirement] = useState('');

  const handleSimulateMarket = async () => {
    if (!marketConfig.description) {
      toast.error('Please provide trend description');
      return;
    }

    setGenerating(true);
    try {
      const result = await simulateMarketTrendImpact(strategy, marketConfig);
      setScenarios([...scenarios, result]);
      toast.success('Market trend scenario simulated!');
    } catch (error) {
      toast.error('Failed to simulate scenario');
    } finally {
      setGenerating(false);
    }
  };

  const handleSimulateRegulatory = async () => {
    if (!regulatoryConfig.regulation_name) {
      toast.error('Please provide regulation name');
      return;
    }

    setGenerating(true);
    try {
      const result = await simulateRegulatoryImpact(strategy, regulatoryConfig);
      setScenarios([...scenarios, result]);
      toast.success('Regulatory scenario simulated!');
    } catch (error) {
      toast.error('Failed to simulate scenario');
    } finally {
      setGenerating(false);
    }
  };

  const handleSimulateCompetitor = async () => {
    if (!competitorConfig.competitor_name) {
      toast.error('Please provide competitor name');
      return;
    }

    setGenerating(true);
    try {
      const result = await simulateCompetitorImpact(strategy, competitorConfig);
      setScenarios([...scenarios, result]);
      toast.success('Competitor scenario simulated!');
    } catch (error) {
      toast.error('Failed to simulate scenario');
    } finally {
      setGenerating(false);
    }
  };

  const handleCompareScenarios = async () => {
    if (scenarios.length < 2) {
      toast.error('Need at least 2 scenarios to compare');
      return;
    }

    setComparing(true);
    try {
      const result = await compareScenarios(scenarios, strategy);
      setComparison(result);
      toast.success('Scenario comparison complete!');
    } catch (error) {
      toast.error('Failed to compare scenarios');
    } finally {
      setComparing(false);
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRegulatoryConfig({
        ...regulatoryConfig,
        key_requirements: [...regulatoryConfig.key_requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeScenario = (idx) => {
    setScenarios(scenarios.filter((_, i) => i !== idx));
    setComparison(null);
  };

  const getImpactColor = (impact) => ({
    major_positive: 'bg-green-600',
    positive: 'bg-green-500',
    neutral: 'bg-slate-500',
    negative: 'bg-orange-500',
    major_negative: 'bg-red-600',
    critical: 'bg-red-600',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  }[impact] || 'bg-slate-500');

  return (
    <div className="space-y-6">
      {/* Scenario Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Advanced Scenario Modeler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeScenario} onValueChange={setActiveScenario}>
            <TabsList className="mb-4">
              <TabsTrigger value="market">
                <TrendingUp className="h-4 w-4 mr-1" />
                Market Trends
              </TabsTrigger>
              <TabsTrigger value="regulatory">
                <Shield className="h-4 w-4 mr-1" />
                Regulatory Changes
              </TabsTrigger>
              <TabsTrigger value="competitor">
                <Users className="h-4 w-4 mr-1" />
                Competitor Moves
              </TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Trend Type</Label>
                  <Select
                    value={marketConfig.trend_type}
                    onValueChange={(v) => setMarketConfig({ ...marketConfig, trend_type: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai_breakthrough">AI Breakthrough</SelectItem>
                      <SelectItem value="market_shift">Market Shift</SelectItem>
                      <SelectItem value="technology_obsolescence">Technology Obsolescence</SelectItem>
                      <SelectItem value="new_entrant">New Market Entrant</SelectItem>
                      <SelectItem value="pricing_change">Major Pricing Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Timeframe</Label>
                  <Select
                    value={marketConfig.timeframe}
                    onValueChange={(v) => setMarketConfig({ ...marketConfig, timeframe: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-3 months">0-3 months</SelectItem>
                      <SelectItem value="3-6 months">3-6 months</SelectItem>
                      <SelectItem value="6-12 months">6-12 months</SelectItem>
                      <SelectItem value="1-2 years">1-2 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Trend Description</Label>
                <Textarea
                  value={marketConfig.description}
                  onChange={(e) => setMarketConfig({ ...marketConfig, description: e.target.value })}
                  placeholder="Describe the market trend (e.g., GPT-5 release with 10x performance)"
                />
              </div>
              <Button onClick={handleSimulateMarket} disabled={generating} className="w-full">
                {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                Simulate Market Impact
              </Button>
            </TabsContent>

            <TabsContent value="regulatory" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Regulation Name</Label>
                  <Input
                    value={regulatoryConfig.regulation_name}
                    onChange={(e) => setRegulatoryConfig({ ...regulatoryConfig, regulation_name: e.target.value })}
                    placeholder="e.g., EU AI Act"
                  />
                </div>
                <div>
                  <Label>Jurisdiction</Label>
                  <Select
                    value={regulatoryConfig.jurisdiction}
                    onValueChange={(v) => setRegulatoryConfig({ ...regulatoryConfig, jurisdiction: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="EU">European Union</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="Global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={regulatoryConfig.effective_date}
                  onChange={(e) => setRegulatoryConfig({ ...regulatoryConfig, effective_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Key Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add requirement"
                  />
                  <Button onClick={addRequirement} variant="outline"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {regulatoryConfig.key_requirements.map((req, i) => (
                    <Badge key={i} variant="outline" className="flex items-center gap-1">
                      {req}
                      <button onClick={() => setRegulatoryConfig({
                        ...regulatoryConfig,
                        key_requirements: regulatoryConfig.key_requirements.filter((_, idx) => idx !== i)
                      })}>×</button>
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={handleSimulateRegulatory} disabled={generating} className="w-full">
                {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                Simulate Regulatory Impact
              </Button>
            </TabsContent>

            <TabsContent value="competitor" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Competitor Name</Label>
                  <Input
                    value={competitorConfig.competitor_name}
                    onChange={(e) => setCompetitorConfig({ ...competitorConfig, competitor_name: e.target.value })}
                    placeholder="e.g., Main Competitor Inc."
                  />
                </div>
                <div>
                  <Label>Action Type</Label>
                  <Select
                    value={competitorConfig.action_type}
                    onValueChange={(v) => setCompetitorConfig({ ...competitorConfig, action_type: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product_launch">Product Launch</SelectItem>
                      <SelectItem value="acquisition">Acquisition</SelectItem>
                      <SelectItem value="partnership">Strategic Partnership</SelectItem>
                      <SelectItem value="pricing_war">Pricing War</SelectItem>
                      <SelectItem value="market_expansion">Market Expansion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Action Description</Label>
                <Textarea
                  value={competitorConfig.description}
                  onChange={(e) => setCompetitorConfig({ ...competitorConfig, description: e.target.value })}
                  placeholder="Describe the competitor's action"
                />
              </div>
              <Button onClick={handleSimulateCompetitor} disabled={generating} className="w-full">
                {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
                Simulate Competitor Impact
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Simulated Scenarios */}
      {scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Simulated Scenarios ({scenarios.length})</CardTitle>
              <Button
                onClick={handleCompareScenarios}
                disabled={comparing || scenarios.length < 2}
                variant="outline"
              >
                {comparing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
                Compare All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarios.map((scenario, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {scenario.scenario_type === 'market_trend' && <TrendingUp className="h-5 w-5 text-blue-600" />}
                      {scenario.scenario_type === 'regulatory' && <Shield className="h-5 w-5 text-purple-600" />}
                      {scenario.scenario_type === 'competitor' && <Users className="h-5 w-5 text-orange-600" />}
                      <h4 className="font-semibold text-slate-900">
                        {scenario.config?.description || scenario.config?.regulation_name || scenario.config?.competitor_name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(
                        scenario.strategy_impact?.overall_impact || 
                        scenario.threat_assessment?.threat_level
                      )}>
                        {scenario.strategy_impact?.overall_impact || scenario.threat_assessment?.threat_level}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => removeScenario(idx)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    {scenario.roi_implications && (
                      <div className="bg-green-50 rounded p-2">
                        <div className="text-xs text-green-600">ROI Impact</div>
                        <div className="font-semibold text-green-900">
                          {scenario.roi_implications.adjusted_roi}%
                        </div>
                      </div>
                    )}
                    {scenario.timeline_impact && (
                      <div className="bg-blue-50 rounded p-2">
                        <div className="text-xs text-blue-600">Timeline Delay</div>
                        <div className="font-semibold text-blue-900">
                          {scenario.timeline_impact.delay_months || 0} months
                        </div>
                      </div>
                    )}
                    {scenario.cost_of_compliance && (
                      <div className="bg-amber-50 rounded p-2">
                        <div className="text-xs text-amber-600">Compliance Cost</div>
                        <div className="font-semibold text-amber-900">
                          ${(scenario.cost_of_compliance.one_time_costs / 1000).toFixed(0)}K
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommendations Preview */}
                  {(scenario.strategic_recommendations || scenario.strategic_responses) && (
                    <div className="bg-slate-50 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">Top Recommendations</span>
                      </div>
                      <ul className="text-sm text-slate-700 space-y-1">
                        {(scenario.strategic_recommendations || scenario.strategic_responses)?.slice(0, 3).map((rec, i) => (
                          <li key={i}>• {rec.recommendation || rec.action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Comparison */}
      {comparison && (
        <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Combined Scenario Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Combined Impact */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-slate-600">Risk Level</span>
                </div>
                <div className="font-bold text-slate-900">{comparison.combined_impact?.overall_risk_level}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-slate-600">Timeline Impact</span>
                </div>
                <div className="font-bold text-slate-900">{comparison.combined_impact?.timeline_impact}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-sm text-slate-600 mb-1">Budget Impact</div>
                <div className="font-bold text-slate-900">{comparison.combined_impact?.budget_impact}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-sm text-slate-600 mb-1">Success Probability</div>
                <div className="font-bold text-slate-900">
                  {comparison.combined_impact?.success_probability_change > 0 ? '+' : ''}
                  {comparison.combined_impact?.success_probability_change}%
                </div>
              </div>
            </div>

            {/* Prioritization */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Scenario Prioritization</h4>
              <div className="space-y-2">
                {comparison.scenario_prioritization?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white rounded p-3 border">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      {item.priority}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{item.scenario}</div>
                      <div className="text-sm text-slate-600">{item.rationale}</div>
                    </div>
                    <Badge className={item.urgency === 'immediate' ? 'bg-red-600' : item.urgency === 'high' ? 'bg-orange-600' : 'bg-blue-600'}>
                      {item.urgency}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimal Response */}
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-semibold text-slate-900 mb-3">Optimal Response Strategy</h4>
              <div className="mb-3">
                <span className="text-sm text-slate-600">Primary Focus:</span>
                <p className="font-medium text-slate-900">{comparison.optimal_response_strategy?.primary_focus}</p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Secondary Actions:</span>
                <ul className="mt-1 space-y-1">
                  {comparison.optimal_response_strategy?.secondary_actions?.map((action, i) => (
                    <li key={i} className="text-sm text-slate-700">• {action}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-semibold text-slate-900 mb-3">Risk-Adjusted Timeline</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-slate-600">Original</div>
                  <div className="font-bold text-slate-900">{comparison.risk_adjusted_timeline?.original_completion}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Risk-Adjusted</div>
                  <div className="font-bold text-orange-900">{comparison.risk_adjusted_timeline?.risk_adjusted_completion}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Confidence</div>
                  <div className="font-bold text-blue-900">{comparison.risk_adjusted_timeline?.confidence_level}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}