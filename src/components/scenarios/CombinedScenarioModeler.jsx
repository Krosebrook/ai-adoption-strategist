import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Loader2, TrendingUp, Shield, AlertTriangle, 
  CheckCircle, Target, DollarSign, Clock, Users, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { analyzeCombinedScenarios, scenarioTemplates } from './CombinedScenarioEngine';

export default function CombinedScenarioModeler({ strategy, assessment }) {
  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const toggleScenario = (scenario) => {
    setSelectedScenarios(prev => {
      const exists = prev.find(s => s.id === scenario.id);
      if (exists) return prev.filter(s => s.id !== scenario.id);
      return [...prev, scenario];
    });
  };

  const handleAnalyze = async () => {
    if (selectedScenarios.length < 2) {
      toast.error('Select at least 2 scenarios to analyze combined impact');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeCombinedScenarios(strategy, assessment, selectedScenarios);
      setAnalysis(result);
      toast.success('Combined analysis complete!');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => ({
    low: 'bg-green-600', moderate: 'bg-yellow-600', significant: 'bg-orange-600', critical: 'bg-red-600'
  }[severity] || 'bg-slate-600');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2" style={{ borderColor: '#E88A1D', background: 'linear-gradient(135deg, rgba(232,138,29,0.1), rgba(208,118,20,0.05))' }}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-6 w-6" style={{ color: '#E88A1D' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Combined Scenario Modeler</h2>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Select multiple scenarios to analyze their cumulative impact on your AI adoption strategy
          </p>
        </CardContent>
      </Card>

      {/* Scenario Selection */}
      <Card className="sunrise-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Select Scenarios ({selectedScenarios.length} selected)</span>
            <Button 
              onClick={handleAnalyze} 
              disabled={analyzing || selectedScenarios.length < 2}
              style={{ background: '#E88A1D' }}
            >
              {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Analyze Combined Impact
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="market_trends">
            <TabsList className="mb-4">
              <TabsTrigger value="market_trends">Market Trends</TabsTrigger>
              <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
              <TabsTrigger value="technology">Technology</TabsTrigger>
              <TabsTrigger value="organizational">Organizational</TabsTrigger>
            </TabsList>

            {Object.entries(scenarioTemplates).map(([category, scenarios]) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scenarios.map((scenario) => {
                    const isSelected = selectedScenarios.find(s => s.id === scenario.id);
                    return (
                      <div
                        key={scenario.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected ? 'border-2 bg-orange-50' : 'hover:bg-slate-50'
                        }`}
                        style={{ borderColor: isSelected ? '#E88A1D' : 'var(--color-border)' }}
                        onClick={() => toggleScenario(scenario)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox checked={!!isSelected} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium" style={{ color: 'var(--color-text)' }}>{scenario.name}</span>
                              <Badge variant="outline" className="text-xs">{scenario.impact_level}</Badge>
                            </div>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{scenario.description}</p>
                            <span className="text-xs" style={{ color: 'var(--color-gray-400)' }}>{scenario.timeframe}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Summary */}
          <Card className="sunrise-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" style={{ color: '#E88A1D' }} />
                Combined Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4" style={{ color: 'var(--color-text)' }}>{analysis.analysis_summary}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Timeline Impact</div>
                  <div className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {analysis.cumulative_impact?.timeline_change}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Overall Severity</div>
                  <Badge className={getSeverityColor(analysis.cumulative_impact?.overall_severity)}>
                    {analysis.cumulative_impact?.overall_severity}
                  </Badge>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Budget Impact</div>
                  <div className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {analysis.financial_implications?.budget_impact_percent > 0 ? '+' : ''}{analysis.financial_implications?.budget_impact_percent}%
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>ROI Adjustment</div>
                  <div className="text-xl font-bold" style={{ color: analysis.financial_implications?.roi_adjustment >= 0 ? '#22c55e' : '#ef4444' }}>
                    {analysis.financial_implications?.roi_adjustment > 0 ? '+' : ''}{analysis.financial_implications?.roi_adjustment}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compound Risks */}
          {analysis.compound_risks?.length > 0 && (
            <Card className="sunrise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Compound Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.compound_risks.map((risk, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-red-900">{risk.risk}</span>
                        <Badge className={risk.severity === 'critical' ? 'bg-red-600' : risk.severity === 'high' ? 'bg-orange-600' : 'bg-yellow-600'}>
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-red-800 mb-2">{risk.mitigation}</p>
                      <div className="flex flex-wrap gap-1">
                        {risk.contributing_scenarios?.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Synergies & Conflicts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.scenario_synergies?.length > 0 && (
              <Card className="sunrise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Synergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.scenario_synergies.map((s, idx) => (
                      <div key={idx} className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-sm font-medium text-green-900">{s.synergy}</p>
                        <p className="text-xs text-green-700 mt-1">{s.benefit}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {analysis.scenario_conflicts?.length > 0 && (
              <Card className="sunrise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Conflicts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.scenario_conflicts.map((c, idx) => (
                      <div key={idx} className="bg-amber-50 border border-amber-200 rounded p-3">
                        <p className="text-sm font-medium text-amber-900">{c.conflict}</p>
                        <p className="text-xs text-amber-700 mt-1">Resolution: {c.resolution}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Unified Response Plan */}
          <Card className="sunrise-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" style={{ color: '#6B5B7A' }} />
                Unified Response Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <Zap className="h-4 w-4 text-red-600" /> Immediate Actions
                  </h4>
                  <ul className="space-y-1">
                    {analysis.unified_response_plan?.immediate_actions?.map((a, i) => (
                      <li key={i} className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>• {a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <Clock className="h-4 w-4 text-blue-600" /> Medium-term Actions
                  </h4>
                  <ul className="space-y-1">
                    {analysis.unified_response_plan?.medium_term_actions?.map((a, i) => (
                      <li key={i} className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>• {a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Priority Actions */}
          {analysis.priority_actions?.length > 0 && (
            <Card className="sunrise-card">
              <CardHeader>
                <CardTitle>Priority Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.priority_actions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: 'var(--color-secondary)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ background: '#E88A1D' }}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: 'var(--color-text)' }}>{action.action}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          <span>Owner: {action.owner}</span>
                          <span>•</span>
                          <span>Deadline: {action.deadline}</span>
                        </div>
                      </div>
                      <Badge className={action.urgency === 'immediate' ? 'bg-red-600' : action.urgency === 'high' ? 'bg-orange-600' : 'bg-blue-600'}>
                        {action.urgency}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}