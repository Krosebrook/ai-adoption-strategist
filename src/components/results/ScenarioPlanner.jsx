import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, TrendingUp, DollarSign, Users, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { calculateROI } from '../assessment/CalculationEngine';
import { AI_PLATFORMS, PLATFORM_PRICING } from '../assessment/AssessmentData';

export default function ScenarioPlanner({ baseAssessment }) {
  const [scenarios, setScenarios] = useState([]);
  const [editingScenario, setEditingScenario] = useState(null);

  const baseROI = Object.values(baseAssessment.roi_calculations || {});

  const createNewScenario = () => {
    const newScenario = {
      id: Date.now(),
      name: `Scenario ${scenarios.length + 1}`,
      departments: JSON.parse(JSON.stringify(baseAssessment.departments)),
      platformCosts: { ...PLATFORM_PRICING },
      compliance_requirements: [...baseAssessment.compliance_requirements],
      desired_integrations: [...baseAssessment.desired_integrations]
    };
    setEditingScenario(newScenario);
  };

  const saveScenario = () => {
    if (!editingScenario) return;
    
    const updatedScenarios = scenarios.filter(s => s.id !== editingScenario.id);
    setScenarios([...updatedScenarios, editingScenario]);
    setEditingScenario(null);
  };

  const deleteScenario = (id) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const calculateScenarioROI = (scenario) => {
    const platforms = ['google_gemini', 'microsoft_copilot', 'anthropic_claude', 'openai_chatgpt'];
    return platforms.map(platform => {
      // Custom ROI calculation with adjusted pricing
      const costPerUser = scenario.platformCosts[platform] || PLATFORM_PRICING[platform] || 20;
      let totalAnnualSavings = 0;
      let totalCost = 0;

      scenario.departments.forEach(dept => {
        const hoursPerWeek = 2; // Simplified, could use ROI_BENCHMARKS
        const annualHoursSaved = hoursPerWeek * 50 * dept.user_count;
        const annualSavings = annualHoursSaved * (dept.hourly_rate || 50);
        const platformCost = costPerUser * 12 * dept.user_count;
        
        totalCost += platformCost;
        totalAnnualSavings += annualSavings;
      });

      const netAnnualSavings = totalAnnualSavings - totalCost;
      const oneYearROI = totalCost > 0 ? ((netAnnualSavings / totalCost) * 100) : 0;

      return {
        platform,
        total_annual_savings: totalAnnualSavings,
        total_cost: totalCost,
        net_annual_savings: netAnnualSavings,
        one_year_roi: oneYearROI
      };
    });
  };

  const updateScenarioDepartment = (deptIndex, field, value) => {
    const updated = { ...editingScenario };
    updated.departments[deptIndex][field] = parseFloat(value) || 0;
    setEditingScenario(updated);
  };

  const updatePlatformCost = (platform, value) => {
    const updated = { ...editingScenario };
    updated.platformCosts[platform] = parseFloat(value) || 0;
    setEditingScenario(updated);
  };

  const getComparison = (baseValue, scenarioValue) => {
    const diff = scenarioValue - baseValue;
    const percentChange = baseValue !== 0 ? (diff / baseValue) * 100 : 0;
    return { diff, percentChange };
  };

  const findBestScenario = (platform) => {
    const allScenarios = scenarios.map(s => ({
      name: s.name,
      roi: calculateScenarioROI(s).find(r => r.platform === platform)
    }));

    const baseline = { 
      name: 'Baseline', 
      roi: baseROI.find(r => r.platform === platform) 
    };

    const allOptions = [baseline, ...allScenarios];
    return allOptions.reduce((best, current) => {
      if (!current.roi) return best;
      return !best.roi || current.roi.net_annual_savings > best.roi.net_annual_savings ? current : best;
    }, {});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Scenario Planning & Cost Optimization</h2>
          <p className="text-slate-600">Model different configurations and pricing to find the optimal solution</p>
        </div>
        <Button onClick={createNewScenario} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-2" />
          New Scenario
        </Button>
      </div>

      {/* Scenario Editor */}
      {editingScenario && (
        <Card className="border-blue-500 border-2">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Editing: {editingScenario.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <Label htmlFor="scenario-name">Scenario Name</Label>
              <Input
                id="scenario-name"
                value={editingScenario.name}
                onChange={(e) => setEditingScenario({ ...editingScenario, name: e.target.value })}
                className="max-w-md"
              />
            </div>

            {/* Platform Cost Adjustments */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Platform Pricing ($/user/month)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_PLATFORMS.map(platform => (
                  <div key={platform.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <Label htmlFor={`cost-${platform.id}`} className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }} />
                      {platform.name}
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">$</span>
                      <Input
                        id={`cost-${platform.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingScenario.platformCosts[platform.id] || 0}
                        onChange={(e) => updatePlatformCost(platform.id, e.target.value)}
                        className="flex-1"
                      />
                      <Badge variant="outline" className="text-xs">
                        Base: ${PLATFORM_PRICING[platform.id]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Adjustments */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Department Configuration
              </h3>
              <div className="space-y-3">
                {editingScenario.departments.map((dept, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-3">{dept.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Users</Label>
                        <Input
                          type="number"
                          min="0"
                          value={dept.user_count}
                          onChange={(e) => updateScenarioDepartment(idx, 'user_count', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Hourly Rate ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={dept.hourly_rate || 0}
                          onChange={(e) => updateScenarioDepartment(idx, 'hourly_rate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Annual Spend ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={dept.annual_spend || 0}
                          onChange={(e) => updateScenarioDepartment(idx, 'annual_spend', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditingScenario(null)}>
                Cancel
              </Button>
              <Button onClick={saveScenario} className="bg-green-600 hover:bg-green-700">
                Save Scenario
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Comparisons */}
      {scenarios.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Scenario Comparison</h3>
          
          {AI_PLATFORMS.map(platform => {
            const baselinePlatformROI = baseROI.find(r => r.platform === platform.id);
            const bestOption = findBestScenario(platform.id);

            return (
              <Card key={platform.id} className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: platform.color }} />
                    {platform.name}
                    {bestOption.name !== 'Baseline' && (
                      <Badge className="bg-green-600 text-white ml-2">
                        Best: {bestOption.name}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 px-3 text-slate-700 font-semibold">Scenario</th>
                          <th className="text-right py-2 px-3 text-slate-700 font-semibold">Platform Cost</th>
                          <th className="text-right py-2 px-3 text-slate-700 font-semibold">Net Savings</th>
                          <th className="text-right py-2 px-3 text-slate-700 font-semibold">ROI %</th>
                          <th className="text-right py-2 px-3 text-slate-700 font-semibold">vs Baseline</th>
                          <th className="text-center py-2 px-3 text-slate-700 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Baseline */}
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <td className="py-3 px-3 font-semibold text-slate-900">Baseline</td>
                          <td className="text-right py-3 px-3 text-slate-700">
                            ${baselinePlatformROI?.total_cost?.toLocaleString() || 0}
                          </td>
                          <td className="text-right py-3 px-3 text-slate-700">
                            ${baselinePlatformROI?.net_annual_savings?.toLocaleString() || 0}
                          </td>
                          <td className="text-right py-3 px-3 font-medium text-slate-900">
                            {baselinePlatformROI?.one_year_roi?.toFixed(1) || 0}%
                          </td>
                          <td className="text-right py-3 px-3 text-slate-500">—</td>
                          <td className="text-center py-3 px-3"></td>
                        </tr>

                        {/* Scenarios */}
                        {scenarios.map(scenario => {
                          const scenarioROI = calculateScenarioROI(scenario).find(r => r.platform === platform.id);
                          const savingsComp = getComparison(
                            baselinePlatformROI?.net_annual_savings || 0,
                            scenarioROI?.net_annual_savings || 0
                          );
                          const isBest = bestOption.name === scenario.name;

                          return (
                            <tr key={scenario.id} className={`border-b border-slate-100 ${isBest ? 'bg-green-50' : ''}`}>
                              <td className="py-3 px-3 font-medium text-slate-900">
                                {scenario.name}
                                {isBest && (
                                  <Badge variant="secondary" className="ml-2 bg-green-600 text-white text-xs">
                                    Best
                                  </Badge>
                                )}
                              </td>
                              <td className="text-right py-3 px-3 text-slate-700">
                                ${scenarioROI?.total_cost?.toLocaleString() || 0}
                              </td>
                              <td className="text-right py-3 px-3 text-slate-700">
                                ${scenarioROI?.net_annual_savings?.toLocaleString() || 0}
                              </td>
                              <td className="text-right py-3 px-3 font-medium text-slate-900">
                                {scenarioROI?.one_year_roi?.toFixed(1) || 0}%
                              </td>
                              <td className="text-right py-3 px-3">
                                <div className="flex items-center justify-end gap-1">
                                  {savingsComp.diff > 0 ? (
                                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                                  ) : savingsComp.diff < 0 ? (
                                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                                  ) : null}
                                  <span className={savingsComp.diff > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                    {savingsComp.diff > 0 ? '+' : ''}{savingsComp.percentChange.toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                              <td className="text-center py-3 px-3">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingScenario(scenario)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteScenario(scenario.id)}
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {scenarios.length === 0 && !editingScenario && (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-3">No scenarios created yet</p>
            <p className="text-sm text-slate-500 mb-4">
              Create scenarios to model different cost structures, user counts, and configurations
            </p>
            <Button onClick={createNewScenario} className="bg-slate-900 hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Scenario
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}