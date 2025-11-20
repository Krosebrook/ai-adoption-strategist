import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import InlineFeedback from '../feedback/InlineFeedback';
import { getPriorityStyle } from '../utils/formatters';
import { LoadingCard } from '../ui/LoadingState';
import EmptyState from '../ui/EmptyState';

export default function ActionRecommendations({ assessment, risks }) {
  const [actions, setActions] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateActions = async () => {
    setLoading(true);
    try {
      const prompt = `Based on this AI platform assessment, provide specific, actionable recommendations:

**Assessment Data:**
- Organization: ${assessment.organization_name}
- Recommended Platform: ${assessment.recommended_platforms?.[0]?.platform_name}
- Pain Points: ${assessment.pain_points?.join(', ')}

**Identified Risks:**
${JSON.stringify(risks, null, 2)}

**Compliance Gaps:**
${JSON.stringify(assessment.compliance_scores, null, 2)}

**Integration Challenges:**
${JSON.stringify(assessment.integration_scores, null, 2)}

Provide:
1. Immediate actions (within 1 week) - Quick wins and urgent fixes
2. Short-term actions (1-3 months) - Important implementations
3. Long-term strategic actions (3-12 months) - Major initiatives
4. Risk mitigation strategies for each identified risk
5. Configuration recommendations for the recommended platform

Be specific with steps, tools, and expected outcomes.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            immediate_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  rationale: { type: "string" },
                  expected_outcome: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] }
                }
              }
            },
            short_term_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  rationale: { type: "string" },
                  expected_outcome: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            },
            long_term_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  rationale: { type: "string" },
                  expected_impact: { type: "string" },
                  dependencies: { type: "array", items: { type: "string" } }
                }
              }
            },
            risk_mitigation: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  mitigation_strategy: { type: "string" },
                  resources_needed: { type: "array", items: { type: "string" } }
                }
              }
            },
            platform_configuration: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  setting: { type: "string" },
                  recommended_value: { type: "string" },
                  why: { type: "string" }
                }
              }
            }
          }
        }
      });

      setActions(response);
      toast.success('Action recommendations generated');
    } catch (error) {
      console.error('Failed to generate actions:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingCard message="Generating personalized action plan..." />;
  }

  if (!actions) {
    return (
      <EmptyState
        icon={Zap}
        title="AI Action Recommendations"
        description="Get specific, actionable recommendations tailored to your assessment"
        actionLabel="Generate Action Plan"
        onAction={generateActions}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Immediate Actions */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Immediate Actions (This Week)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.immediate_actions?.map((action, idx) => (
            <div key={idx} className="p-4 bg-white rounded-lg border border-red-200">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-slate-900">{action.action}</h4>
                <Badge className={getPriorityStyle(action.priority)}>{action.priority}</Badge>
              </div>
              <p className="text-sm text-slate-600 mb-2">{action.rationale}</p>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span className="text-green-700">{action.expected_outcome}</span>
              </div>
            </div>
          ))}
          
          <div className="pt-3 border-t border-red-200">
            <InlineFeedback 
              assessmentId={assessment.id}
              contentType="general"
              contentId="immediate_actions"
            />
          </div>
        </CardContent>
      </Card>

      {/* Short-term Actions */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Zap className="h-5 w-5" />
            Short-term Actions (1-3 Months)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.short_term_actions?.map((action, idx) => (
            <div key={idx} className="p-4 bg-white rounded-lg border border-amber-200">
              <h4 className="font-semibold text-slate-900 mb-2">{action.action}</h4>
              <p className="text-sm text-slate-600 mb-2">{action.rationale}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-700">{action.expected_outcome}</span>
                </div>
                <Badge variant="outline" className="text-amber-700">
                  {action.timeline}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Long-term Strategic Actions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Long-term Strategic Actions (3-12 Months)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.long_term_actions?.map((action, idx) => (
            <div key={idx} className="p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-slate-900 mb-2">{action.action}</h4>
              <p className="text-sm text-slate-600 mb-2">{action.rationale}</p>
              <p className="text-sm text-blue-700 mb-2">
                <strong>Expected Impact:</strong> {action.expected_impact}
              </p>
              {action.dependencies?.length > 0 && (
                <div className="text-sm">
                  <strong className="text-slate-700">Dependencies:</strong>
                  <ul className="list-disc ml-5 mt-1 text-slate-600">
                    {action.dependencies.map((dep, i) => (
                      <li key={i}>{dep}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk Mitigation */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Risk Mitigation Strategies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.risk_mitigation?.map((item, idx) => (
            <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-slate-900 mb-2">🛡️ {item.risk}</h4>
              <p className="text-sm text-slate-700 mb-2">{item.mitigation_strategy}</p>
              <div className="text-sm">
                <strong className="text-slate-700">Resources Needed:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.resources_needed?.map((resource, i) => (
                    <Badge key={i} variant="outline">{resource}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Platform Configuration */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Recommended Platform Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {actions.platform_configuration?.map((config, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-slate-900">{config.setting}</h5>
                    <p className="text-sm text-slate-600 mt-1">{config.why}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{config.recommended_value}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}