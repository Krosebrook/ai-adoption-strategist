import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, PlayCircle, Trash2, Lightbulb } from 'lucide-react';
import ScenarioEditor from './ScenarioEditor';
import ScenarioComparison from './ScenarioComparison';
import {
  calculateAllROI,
  assessCompliance,
  assessIntegrations,
  assessPainPoints,
  generateRecommendations
} from '../assessment/CalculationEngine';

export default function ScenarioPlanner({ baseAssessment }) {
  const [scenarios, setScenarios] = useState([
    {
      id: 'baseline',
      name: 'Current Assessment (Baseline)',
      departments: baseAssessment.departments,
      compliance_requirements: baseAssessment.compliance_requirements,
      desired_integrations: baseAssessment.desired_integrations,
      pain_points: baseAssessment.pain_points,
      results: {
        roiData: Object.values(baseAssessment.roi_calculations || {}),
        complianceData: baseAssessment.compliance_scores,
        integrationData: baseAssessment.integration_scores,
        recommendations: baseAssessment.recommended_platforms
      }
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeScenario = (scenarioData) => {
    setIsAnalyzing(true);

    // Simulate processing delay for better UX
    setTimeout(() => {
      const roiData = calculateAllROI(scenarioData.departments);
      const complianceData = assessCompliance(scenarioData.compliance_requirements);
      const integrationData = assessIntegrations(scenarioData.desired_integrations);
      const painPointData = assessPainPoints(scenarioData.pain_points);
      const recommendations = generateRecommendations(roiData, complianceData, integrationData, painPointData);

      const newScenario = {
        id: `scenario_${Date.now()}`,
        ...scenarioData,
        results: {
          roiData,
          complianceData,
          integrationData,
          recommendations
        }
      };

      setScenarios([...scenarios, newScenario]);
      setIsCreating(false);
      setIsAnalyzing(false);
    }, 500);
  };

  const deleteScenario = (id) => {
    if (id === 'baseline') return; // Can't delete baseline
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const suggestScenarios = () => {
    const totalUsers = baseAssessment.departments.reduce((sum, d) => sum + d.user_count, 0);
    
    return [
      {
        name: 'Phased Rollout (50% Users)',
        description: 'Start with half the user base to minimize risk',
        action: () => {
          const adjustedDepts = baseAssessment.departments.map(d => ({
            ...d,
            user_count: Math.ceil(d.user_count * 0.5)
          }));
          analyzeScenario({
            name: 'Phased Rollout (50% Users)',
            departments: adjustedDepts,
            compliance_requirements: baseAssessment.compliance_requirements,
            desired_integrations: baseAssessment.desired_integrations,
            pain_points: baseAssessment.pain_points
          });
        }
      },
      {
        name: 'Minimal Compliance',
        description: 'Only essential compliance requirements',
        action: () => {
          analyzeScenario({
            name: 'Minimal Compliance',
            departments: baseAssessment.departments,
            compliance_requirements: ['SOC 2', 'GDPR'],
            desired_integrations: baseAssessment.desired_integrations,
            pain_points: baseAssessment.pain_points
          });
        }
      },
      {
        name: 'Essential Integrations Only',
        description: 'Reduce integration complexity',
        action: () => {
          const essentialIntegrations = baseAssessment.desired_integrations.slice(0, 
            Math.ceil(baseAssessment.desired_integrations.length * 0.4)
          );
          analyzeScenario({
            name: 'Essential Integrations Only',
            departments: baseAssessment.departments,
            compliance_requirements: baseAssessment.compliance_requirements,
            desired_integrations: essentialIntegrations,
            pain_points: baseAssessment.pain_points
          });
        }
      },
      {
        name: 'Aggressive Expansion (150% Users)',
        description: 'Plan for rapid growth',
        action: () => {
          const expandedDepts = baseAssessment.departments.map(d => ({
            ...d,
            user_count: Math.ceil(d.user_count * 1.5)
          }));
          analyzeScenario({
            name: 'Aggressive Expansion (150% Users)',
            departments: expandedDepts,
            compliance_requirements: baseAssessment.compliance_requirements,
            desired_integrations: baseAssessment.desired_integrations,
            pain_points: baseAssessment.pain_points
          });
        }
      }
    ];
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900">Create New Scenario</h3>
        </div>
        <ScenarioEditor
          baselineScenario={baseAssessment}
          onSave={analyzeScenario}
          onCancel={() => setIsCreating(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Scenario Planning</h3>
          <p className="text-slate-600">
            Create and compare different implementation strategies to find the optimal approach
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-slate-900 hover:bg-slate-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Scenario
        </Button>
      </div>

      {/* Quick Suggestions */}
      {scenarios.length === 1 && (
        <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Suggested Scenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Not sure where to start? Try these common scenario variations:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestScenarios().map((suggestion, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <h4 className="font-semibold text-slate-900 mb-1">{suggestion.name}</h4>
                  <p className="text-xs text-slate-600 mb-3">{suggestion.description}</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={suggestion.action}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    <PlayCircle className="h-3 w-3 mr-2" />
                    Analyze Scenario
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario List */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Active Scenarios ({scenarios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scenarios.map((scenario, idx) => (
              <div 
                key={scenario.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-slate-900">{scenario.name}</h4>
                    {scenario.id === 'baseline' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Baseline
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                    <span>
                      {scenario.departments.reduce((sum, d) => sum + d.user_count, 0)} users
                    </span>
                    <span>
                      {scenario.departments.length} departments
                    </span>
                    <span>
                      {scenario.compliance_requirements.length} compliance requirements
                    </span>
                    <span>
                      {scenario.desired_integrations.length} integrations
                    </span>
                  </div>
                  {scenario.results?.recommendations?.[0] && (
                    <div className="mt-2 text-xs">
                      <span className="text-slate-600">Top Recommendation: </span>
                      <span className="font-medium text-slate-900">
                        {scenario.results.recommendations[0].platform_name}
                      </span>
                      <span className="text-slate-500 ml-2">
                        (Score: {scenario.results.recommendations[0].score.toFixed(1)})
                      </span>
                    </div>
                  )}
                </div>
                {scenario.id !== 'baseline' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteScenario(scenario.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison View */}
      {scenarios.length > 1 && (
        <>
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Side-by-Side Comparison</h3>
          </div>
          <ScenarioComparison scenarios={scenarios} />
        </>
      )}

      {/* Analysis Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="pt-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Analyzing Scenario...</h4>
              <p className="text-sm text-slate-600">
                Running calculations for ROI, compliance, and integration compatibility
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}