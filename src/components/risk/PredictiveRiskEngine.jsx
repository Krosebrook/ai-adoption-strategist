import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, TrendingUp, Shield, DollarSign, 
  Users, Lock, Brain, Loader2, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

const RISK_CATEGORIES = [
  { id: 'budget', name: 'Budget Overrun', icon: DollarSign, color: 'text-red-600' },
  { id: 'adoption', name: 'Low Adoption Rate', icon: Users, color: 'text-orange-600' },
  { id: 'compliance', name: 'Compliance Violation', icon: Shield, color: 'text-purple-600' },
  { id: 'security', name: 'Security Breach', icon: Lock, color: 'text-blue-600' },
  { id: 'technical', name: 'Technical Issues', icon: AlertTriangle, color: 'text-yellow-600' }
];

export default function PredictiveRiskEngine({ strategyId }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const queryClient = useQueryClient();

  // Fetch historical data
  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.list()
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.AdoptionStrategy.list()
  });

  const { data: usageLogs = [] } = useQuery({
    queryKey: ['aiUsageLogs'],
    queryFn: () => base44.entities.AIUsageLog.list()
  });

  const { data: biasScans = [] } = useQuery({
    queryKey: ['biasMonitoring'],
    queryFn: () => base44.entities.BiasMonitoring.list()
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['riskAlerts'],
    queryFn: () => base44.entities.RiskAlert.list()
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData) => base44.entities.Task.create(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Mitigation task created');
    }
  });

  const analyzePredictiveRisks = async () => {
    setAnalyzing(true);
    try {
      // Prepare historical context
      const context = {
        total_assessments: assessments.length,
        total_strategies: strategies.length,
        active_strategies: strategies.filter(s => s.status === 'active').length,
        total_ai_interactions: usageLogs.length,
        recent_bias_scans: biasScans.slice(0, 5),
        recent_alerts: alerts.slice(0, 10),
        policy_violations: usageLogs.filter(l => l.policy_compliance?.compliant === false).length,
        avg_cost: usageLogs.reduce((sum, l) => sum + (l.cost || 0), 0) / (usageLogs.length || 1),
        critical_alerts: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length
      };

      // Use AI to predict risks
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a risk prediction expert analyzing an AI adoption platform. Based on the following historical data, predict potential future risks:

Historical Context:
${JSON.stringify(context, null, 2)}

For each risk category (budget overrun, low adoption rate, compliance violation, security breach, technical issues), provide:
1. Likelihood Score (0-100): How likely is this risk to occur?
2. Impact Score (0-100): If it occurs, how severe would it be?
3. Key Indicators: What patterns suggest this risk?
4. Preventative Measures: 2-3 specific actions to prevent this risk
5. Timeline: When might this risk materialize (near-term, mid-term, long-term)

Be data-driven and specific. Focus on actionable insights.`,
        response_json_schema: {
          type: 'object',
          properties: {
            predictions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  likelihood_score: { type: 'number' },
                  impact_score: { type: 'number' },
                  risk_score: { type: 'number' },
                  key_indicators: { type: 'array', items: { type: 'string' } },
                  preventative_measures: { type: 'array', items: { type: 'string' } },
                  timeline: { type: 'string' },
                  confidence: { type: 'string' }
                }
              }
            },
            overall_risk_level: { type: 'string' },
            priority_actions: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setPredictions(response);
      toast.success('Risk prediction complete');
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error('Failed to analyze risks');
    } finally {
      setAnalyzing(false);
    }
  };

  const createMitigationTask = async (prediction) => {
    if (!strategyId) {
      toast.error('No strategy selected');
      return;
    }

    const taskData = {
      resource_type: 'strategy',
      resource_id: strategyId,
      title: `Mitigate ${prediction.category} Risk`,
      description: `Predicted risk with ${prediction.likelihood_score}% likelihood and ${prediction.impact_score}% impact.\n\nKey Indicators:\n${prediction.key_indicators.join('\n')}\n\nPreventative Measures:\n${prediction.preventative_measures.join('\n')}`,
      status: 'todo',
      priority: prediction.risk_score > 70 ? 'critical' : prediction.risk_score > 50 ? 'high' : 'medium',
      assigned_to: (await base44.auth.me()).email
    };

    createTaskMutation.mutate(taskData);
  };

  const getRiskLevel = (score) => {
    if (score >= 70) return { label: 'Critical', color: 'bg-red-500', text: 'text-red-700' };
    if (score >= 50) return { label: 'High', color: 'bg-orange-500', text: 'text-orange-700' };
    if (score >= 30) return { label: 'Medium', color: 'bg-yellow-500', text: 'text-yellow-700' };
    return { label: 'Low', color: 'bg-green-500', text: 'text-green-700' };
  };

  const getCategoryIcon = (category) => {
    const cat = RISK_CATEGORIES.find(c => c.id === category || c.name.toLowerCase().includes(category.toLowerCase()));
    return cat || RISK_CATEGORIES[0];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Predictive Risk Analysis Engine
              </CardTitle>
              <CardDescription>
                AI-powered prediction of future risks based on historical patterns
              </CardDescription>
            </div>
            <Button
              onClick={analyzePredictiveRisks}
              disabled={analyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Run Prediction
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {predictions && (
          <CardContent className="space-y-6">
            {/* Overall Risk Level */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900">Overall Risk Level</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    {predictions.overall_risk_level}
                  </p>
                </div>
                <Badge className="bg-purple-600">{predictions.predictions.length} Risks Identified</Badge>
              </div>
            </div>

            {/* Priority Actions */}
            {predictions.priority_actions && predictions.priority_actions.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-2">Priority Actions Required</h3>
                <ul className="space-y-1">
                  {predictions.priority_actions.map((action, idx) => (
                    <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Predictions */}
            <div className="grid gap-4">
              {predictions.predictions.map((pred, idx) => {
                const riskLevel = getRiskLevel(pred.risk_score);
                const categoryInfo = getCategoryIcon(pred.category);
                const Icon = categoryInfo.icon;

                return (
                  <Card key={idx} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg bg-gray-100 ${categoryInfo.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{pred.category}</CardTitle>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge className={`${riskLevel.color} text-white`}>
                                {riskLevel.label} Risk
                              </Badge>
                              <Badge variant="outline">{pred.timeline}</Badge>
                              <Badge variant="outline">{pred.confidence} Confidence</Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => createMitigationTask(pred)}
                          disabled={!strategyId}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Create Task
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Scores */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-600 mb-1">Likelihood</div>
                          <div className="flex items-center gap-2">
                            <Progress value={pred.likelihood_score} className="flex-1" />
                            <span className="text-sm font-semibold">{pred.likelihood_score}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600 mb-1">Impact</div>
                          <div className="flex items-center gap-2">
                            <Progress value={pred.impact_score} className="flex-1" />
                            <span className="text-sm font-semibold">{pred.impact_score}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600 mb-1">Overall Risk</div>
                          <div className="flex items-center gap-2">
                            <Progress value={pred.risk_score} className="flex-1" />
                            <span className={`text-sm font-semibold ${riskLevel.text}`}>
                              {pred.risk_score}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Key Indicators */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Indicators</h4>
                        <ul className="space-y-1">
                          {pred.key_indicators.map((indicator, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              {indicator}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Preventative Measures */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Preventative Measures</h4>
                        <ul className="space-y-1">
                          {pred.preventative_measures.map((measure, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              {measure}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}