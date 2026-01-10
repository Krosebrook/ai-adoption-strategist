import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, DollarSign, Clock, Shield, Target, 
  CheckCircle, AlertTriangle, Award
} from 'lucide-react';

export default function ScenarioComparison({ scenarioPlans, onSelectScenario }) {
  const [selectedScenario, setSelectedScenario] = useState(null);

  if (!scenarioPlans?.scenarios) return null;

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getScenarioColor = (appetite) => {
    switch (appetite) {
      case 'conservative': return 'border-blue-500 bg-blue-50';
      case 'balanced': return 'border-green-500 bg-green-50';
      case 'aggressive': return 'border-orange-500 bg-orange-50';
      default: return 'border-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Recommendation Banner */}
      {scenarioPlans.recommendation && (
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Award className="h-6 w-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">
                  Recommended: {scenarioPlans.recommendation.recommended_scenario} Scenario
                </h3>
                <p className="text-blue-100">{scenarioPlans.recommendation.rationale}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Matrix */}
      {scenarioPlans.comparison_matrix && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-semibold">Factor</th>
                    <th className="text-center py-2 px-3 font-semibold text-blue-700">Conservative</th>
                    <th className="text-center py-2 px-3 font-semibold text-green-700">Balanced</th>
                    <th className="text-center py-2 px-3 font-semibold text-orange-700">Aggressive</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioPlans.comparison_matrix.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-3 font-medium">{row.factor}</td>
                      <td className="py-2 px-3 text-center">{row.conservative}</td>
                      <td className="py-2 px-3 text-center">{row.balanced}</td>
                      <td className="py-2 px-3 text-center">{row.aggressive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarioPlans.scenarios.map((scenario, idx) => (
          <Card 
            key={idx} 
            className={`border-2 cursor-pointer transition-all ${getScenarioColor(scenario.risk_appetite)} ${
              selectedScenario?.scenario_name === scenario.scenario_name ? 'ring-4 ring-purple-300' : ''
            }`}
            onClick={() => setSelectedScenario(scenario)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{scenario.scenario_name}</CardTitle>
                {scenarioPlans.recommendation?.recommended_scenario === scenario.scenario_name && (
                  <Badge className="bg-purple-600">Recommended</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700">{scenario.executive_summary}</p>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white rounded border">
                  <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                    <Clock className="h-3 w-3" />
                    Timeline
                  </div>
                  <div className="font-bold text-sm">{scenario.timeline?.total_duration}</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                    <DollarSign className="h-3 w-3" />
                    Budget
                  </div>
                  <div className="font-bold text-sm">{scenario.resources?.total_budget}</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                    <TrendingUp className="h-3 w-3" />
                    3-Yr ROI
                  </div>
                  <div className="font-bold text-sm">{scenario.roi_projection?.year_3_roi}%</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                    <Shield className="h-3 w-3" />
                    Risk
                  </div>
                  <Badge className={getRiskColor(scenario.risk_profile?.overall_risk_level)}>
                    {scenario.risk_profile?.overall_risk_level}
                  </Badge>
                </div>
              </div>

              {/* Alignment Score */}
              <div className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">Business Goal Alignment</span>
                  <span className="font-bold text-sm">
                    {scenario.business_goal_alignment?.alignment_score}/100
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${scenario.business_goal_alignment?.alignment_score}%` }}
                  />
                </div>
              </div>

              <Button
                onClick={() => onSelectScenario && onSelectScenario(scenario)}
                className="w-full"
                variant={selectedScenario?.scenario_name === scenario.scenario_name ? 'default' : 'outline'}
              >
                {selectedScenario?.scenario_name === scenario.scenario_name ? 'Selected' : 'Select Scenario'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View of Selected Scenario */}
      {selectedScenario && (
        <Card className="border-2 border-purple-300">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              {selectedScenario.scenario_name} Scenario - Detailed View
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="phases">
              <TabsList>
                <TabsTrigger value="phases">Phases</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="roi">ROI</TabsTrigger>
                <TabsTrigger value="tradeoffs">Trade-offs</TabsTrigger>
              </TabsList>

              <TabsContent value="phases" className="space-y-3">
                {selectedScenario.phases?.map((phase, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{phase.phase_name}</CardTitle>
                        <Badge variant="outline">{phase.duration}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <h5 className="text-sm font-semibold mb-1">Key Activities:</h5>
                        <ul className="text-sm space-y-1">
                          {phase.key_activities?.map((activity, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="resources">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-semibold mb-2">Total Budget</h5>
                        <p className="text-2xl font-bold text-green-600">
                          {selectedScenario.resources?.total_budget}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold mb-2">Team Size</h5>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedScenario.resources?.team_size}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold mb-2">Budget Breakdown</h5>
                      <div className="space-y-2">
                        {selectedScenario.resources?.budget_breakdown?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                            <span className="text-sm">{item.category}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{item.percentage}%</Badge>
                              <span className="font-semibold">{item.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risks">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <span className="font-semibold">Overall Risk Level</span>
                      <Badge className={getRiskColor(selectedScenario.risk_profile?.overall_risk_level)}>
                        {selectedScenario.risk_profile?.overall_risk_level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                      <span className="font-semibold">Success Probability</span>
                      <span className="text-2xl font-bold text-green-600">
                        {selectedScenario.risk_profile?.success_probability}%
                      </span>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold mb-2">Key Risks:</h5>
                      <ul className="space-y-2">
                        {selectedScenario.risk_profile?.key_risks?.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="roi">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="text-xs text-blue-600 mb-1">Year 1 ROI</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {selectedScenario.roi_projection?.year_1_roi}%
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <div className="text-xs text-green-600 mb-1">Year 3 ROI</div>
                        <div className="text-2xl font-bold text-green-900">
                          {selectedScenario.roi_projection?.year_3_roi}%
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded border border-purple-200">
                        <div className="text-xs text-purple-600 mb-1">Payback</div>
                        <div className="text-xl font-bold text-purple-900">
                          {selectedScenario.roi_projection?.payback_period}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700">
                      {selectedScenario.roi_projection?.roi_explanation}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tradeoffs">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-base text-green-900">Advantages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedScenario.trade_offs?.advantages?.map((adv, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {adv}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-base text-red-900">Disadvantages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedScenario.trade_offs?.disadvantages?.map((dis, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            {dis}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}