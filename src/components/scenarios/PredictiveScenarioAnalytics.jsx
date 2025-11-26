import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  TrendingUp, Loader2, BarChart3, Target, AlertTriangle,
  DollarSign, Users, Shield, Sparkles, ArrowUp, ArrowDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';

export default function PredictiveScenarioAnalytics({ scenarios, strategy, assessment }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [timeHorizon, setTimeHorizon] = useState(12); // months

  const runPredictiveAnalysis = async () => {
    if (!scenarios || scenarios.length === 0) return;

    setAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert AI predictive analytics engine. Analyze the following combined scenarios and provide quantitative forecasts.

SCENARIOS:
${scenarios.map((s, i) => `
Scenario ${i + 1}: ${s.name || 'Unnamed'}
Type: ${s.type}
Parameters: ${JSON.stringify(s.parameters || s.config)}
`).join('\n')}

STRATEGY CONTEXT:
${strategy ? `
- Organization: ${strategy.organization_name}
- Platform: ${strategy.platform}
- Current Progress: ${strategy.progress_tracking?.overall_progress}%
- Current Phase: ${strategy.progress_tracking?.current_phase}
` : 'No strategy context'}

ASSESSMENT CONTEXT:
${assessment ? `
- Maturity Level: ${assessment.ai_assessment_score?.maturity_level}
- Readiness Score: ${assessment.ai_assessment_score?.readiness_score}
- Current Risk Score: ${assessment.ai_assessment_score?.risk_score}
` : 'No assessment context'}

TIME HORIZON: ${timeHorizon} months

Provide detailed quantitative forecasts including:
1. ROI projections over time with confidence intervals
2. Adoption rate predictions month by month
3. Risk reduction trajectory
4. Cost impact analysis
5. Optimal strategic adjustments based on forecasts`,
        response_json_schema: {
          type: 'object',
          properties: {
            roi_forecast: {
              type: 'object',
              properties: {
                monthly_projections: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      month: { type: 'number' },
                      roi_percent: { type: 'number' },
                      confidence_lower: { type: 'number' },
                      confidence_upper: { type: 'number' }
                    }
                  }
                },
                total_roi: { type: 'number' },
                breakeven_month: { type: 'number' },
                confidence_level: { type: 'string' }
              }
            },
            adoption_forecast: {
              type: 'object',
              properties: {
                monthly_rates: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      month: { type: 'number' },
                      adoption_percent: { type: 'number' },
                      active_users: { type: 'number' }
                    }
                  }
                },
                peak_adoption: { type: 'number' },
                time_to_80_percent: { type: 'number' }
              }
            },
            risk_forecast: {
              type: 'object',
              properties: {
                monthly_risk_scores: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      month: { type: 'number' },
                      risk_score: { type: 'number' },
                      mitigated_risks: { type: 'number' }
                    }
                  }
                },
                risk_reduction_percent: { type: 'number' },
                key_risk_milestones: { type: 'array', items: { type: 'string' } }
              }
            },
            cost_impact: {
              type: 'object',
              properties: {
                total_investment: { type: 'number' },
                monthly_costs: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      month: { type: 'number' },
                      cost: { type: 'number' },
                      savings: { type: 'number' }
                    }
                  }
                },
                net_savings_year1: { type: 'number' },
                cost_per_user: { type: 'number' }
              }
            },
            strategic_adjustments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  timing: { type: 'string' },
                  adjustment: { type: 'string' },
                  expected_impact: { type: 'string' },
                  confidence: { type: 'string' }
                }
              }
            },
            overall_confidence: { type: 'string' },
            key_assumptions: { type: 'array', items: { type: 'string' } },
            scenario_synergies: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setForecast(response);
    } catch (error) {
      console.error('Predictive analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Predictive Scenario Analytics</h2>
                <p className="text-indigo-100">AI-powered forecasting for combined scenario impact</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-indigo-200">Time Horizon</p>
                <p className="text-xl font-bold">{timeHorizon} months</p>
              </div>
              <Slider
                value={[timeHorizon]}
                onValueChange={([v]) => setTimeHorizon(v)}
                min={6}
                max={36}
                step={6}
                className="w-32"
              />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <Badge className="bg-white/20 text-white">
              {scenarios?.length || 0} Scenarios Selected
            </Badge>
            <Button 
              onClick={runPredictiveAnalysis}
              disabled={analyzing || !scenarios?.length}
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              {analyzing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Forecasting...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Run Forecast</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {forecast && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Projected ROI</p>
                    <p className="text-2xl font-bold text-green-600">
                      {forecast.roi_forecast?.total_roi}%
                    </p>
                    <p className="text-xs text-slate-400">
                      Breakeven: Month {forecast.roi_forecast?.breakeven_month}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Peak Adoption</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {forecast.adoption_forecast?.peak_adoption}%
                    </p>
                    <p className="text-xs text-slate-400">
                      80% in {forecast.adoption_forecast?.time_to_80_percent} months
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Risk Reduction</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {forecast.risk_forecast?.risk_reduction_percent}%
                    </p>
                    <p className="text-xs text-slate-400">
                      Over {timeHorizon} months
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Net Savings Y1</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(forecast.cost_impact?.net_savings_year1 || 0)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatCurrency(forecast.cost_impact?.cost_per_user || 0)}/user
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ROI Chart with Confidence Intervals */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                ROI Projection with Confidence Intervals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast.roi_forecast?.monthly_projections || []}>
                    <defs>
                      <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      label={{ value: 'Month', position: 'bottom', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      label={{ value: 'ROI %', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="confidence_upper" 
                      stroke="none"
                      fill="url(#confidenceGradient)"
                      name="Upper Bound"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="confidence_lower" 
                      stroke="none"
                      fill="white"
                      name="Lower Bound"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="roi_percent" 
                      stroke="#22C55E" 
                      strokeWidth={3}
                      dot={{ fill: '#22C55E' }}
                      name="Projected ROI"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Confidence: {forecast.roi_forecast?.confidence_level}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Adoption & Risk Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Adoption Rate Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast.adoption_forecast?.monthly_rates || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="adoption_percent" 
                        stroke="#3B82F6" 
                        fill="#3B82F6"
                        fillOpacity={0.2}
                        name="Adoption %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  Risk Score Trajectory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecast.risk_forecast?.monthly_risk_scores || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="risk_score" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        name="Risk Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strategic Adjustments */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                Recommended Strategic Adjustments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecast.strategic_adjustments?.map((adj, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">{adj.timing}</Badge>
                      <Badge className={
                        adj.confidence === 'high' ? 'bg-green-100 text-green-800' :
                        adj.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {adj.confidence} confidence
                      </Badge>
                    </div>
                    <p className="font-medium text-slate-900">{adj.adjustment}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>Expected Impact:</strong> {adj.expected_impact}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assumptions & Synergies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-amber-50 border border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Key Assumptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {forecast.key_assumptions?.map((assumption, idx) => (
                    <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {assumption}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  Scenario Synergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {forecast.scenario_synergies?.map((synergy, idx) => (
                    <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                      <ArrowUp className="h-4 w-4 text-green-500 mt-0.5" />
                      {synergy}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}