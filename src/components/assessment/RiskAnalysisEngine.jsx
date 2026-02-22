import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function RiskAnalysisEngine({ assessmentData, onRisksIdentified }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [risks, setRisks] = useState(null);
  const [error, setError] = useState(null);

  const analyzeRisks = useCallback(async () => {
    if (!assessmentData) {
      toast.error('No assessment data available');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const prompt = `Analyze potential risks for AI platform adoption based on the following assessment:

Organization: ${assessmentData.organization_name}
Budget: ${assessmentData.budget_constraints?.min_budget} - ${assessmentData.budget_constraints?.max_budget}
Compliance Needs: ${assessmentData.compliance_requirements?.join(', ')}
Technical Constraints: ${JSON.stringify(assessmentData.technical_constraints)}
Business Goals: ${assessmentData.business_goals?.join(', ')}

Identify and categorize risks:
1. Technical risks (integration, scalability, performance)
2. Security & compliance risks
3. Financial risks (cost overruns, ROI concerns)
4. Organizational risks (change management, training)
5. Vendor risks (lock-in, reliability)

For each risk, provide:
- Severity (Critical/High/Medium/Low)
- Likelihood (High/Medium/Low)
- Impact description
- Specific mitigation strategies
- Priority for addressing`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            overall_risk_score: { type: "number" },
            risk_level: { type: "string" },
            identified_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  title: { type: "string" },
                  severity: { type: "string" },
                  likelihood: { type: "string" },
                  impact: { type: "string" },
                  mitigation_strategies: {
                    type: "array",
                    items: { type: "string" }
                  },
                  priority: { type: "string" }
                }
              }
            },
            quick_wins: {
              type: "array",
              items: { type: "string" }
            },
            immediate_actions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      if (!response) {
        throw new Error('No response from AI');
      }

      setRisks(response);
      if (onRisksIdentified) {
        onRisksIdentified(response);
      }
      toast.success('Risk analysis complete!');
    } catch (error) {
      console.error('Error analyzing risks:', error);
      const errorMessage = error.message || 'Failed to analyze risks';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, [assessmentData, onRisksIdentified]);

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-800 border-red-300',
      'High': 'bg-orange-100 text-orange-800 border-orange-300',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Low': 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[severity] || 'bg-slate-100 text-slate-800';
  };

  const getRiskIcon = (severity) => {
    if (severity === 'Critical' || severity === 'High') return AlertTriangle;
    if (severity === 'Medium') return AlertCircle;
    return CheckCircle;
  };

  return (
    <div className="space-y-4">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            AI Risk Analysis
          </CardTitle>
          <p className="text-sm text-slate-600">
            Identify potential risks and receive mitigation strategies
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Analysis Error</p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {!risks ? (
            <Button
              onClick={analyzeRisks}
              disabled={isAnalyzing}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Risks...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Run Risk Analysis
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <p className="text-sm text-slate-600">Overall Risk Score</p>
                  <p className="text-2xl font-bold">{risks.overall_risk_score}/100</p>
                </div>
                <Badge className={getSeverityColor(risks.risk_level)}>
                  {risks.risk_level} Risk
                </Badge>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Identified Risks:</h4>
                {risks.identified_risks?.map((risk, idx) => {
                  const Icon = getRiskIcon(risk.severity);
                  return (
                    <Card key={idx} className="border-l-4" style={{ borderLeftColor: risk.severity === 'Critical' ? '#ef4444' : risk.severity === 'High' ? '#f97316' : '#eab308' }}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${risk.severity === 'Critical' || risk.severity === 'High' ? 'text-red-600' : 'text-yellow-600'}`} />
                            <div>
                              <p className="font-semibold text-sm">{risk.title}</p>
                              <p className="text-xs text-slate-500">{risk.category}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {risk.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Priority: {risk.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700">{risk.impact}</p>
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <p className="text-xs font-semibold text-blue-900 mb-1">Mitigation Strategies:</p>
                          <ul className="text-xs text-blue-800 space-y-0.5">
                            {risk.mitigation_strategies?.map((strategy, sidx) => (
                              <li key={sidx}>• {strategy}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {risks.immediate_actions?.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="font-semibold text-sm text-green-900 mb-2">Immediate Actions:</p>
                  <ul className="text-xs text-green-800 space-y-1">
                    {risks.immediate_actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}