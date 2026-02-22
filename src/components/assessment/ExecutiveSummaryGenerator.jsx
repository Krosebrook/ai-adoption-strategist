import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Loader2, Sparkles, AlertCircle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function ExecutiveSummaryGenerator({ assessmentData, scoringWeights, riskAnalysis }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const generateSummary = useCallback(async () => {
    if (!assessmentData) {
      toast.error('No assessment data available');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const prompt = `Generate a comprehensive executive summary for AI platform adoption assessment:

ORGANIZATION PROFILE:
- Name: ${assessmentData.organization_name}
- Departments: ${assessmentData.departments?.map(d => d.name).join(', ')}
- Business Goals: ${assessmentData.business_goals?.join(', ')}
- Budget: ${assessmentData.budget_constraints?.min_budget} - ${assessmentData.budget_constraints?.max_budget}

SCORING PRIORITIES:
- ROI Weight: ${scoringWeights?.roi_weight}%
- Compliance Weight: ${scoringWeights?.compliance_weight}%
- Integration Weight: ${scoringWeights?.integration_weight}%
- Features Weight: ${scoringWeights?.features_weight}%

RISK ASSESSMENT:
- Overall Risk Level: ${riskAnalysis?.risk_level || 'Not analyzed'}
- Key Risks: ${riskAnalysis?.identified_risks?.length || 0} identified

RECOMMENDED PLATFORMS:
${assessmentData.recommended_platforms?.map((p, i) => `${i + 1}. ${p.platform_name} (Score: ${p.score})`).join('\n')}

Generate a professional executive summary including:

## Executive Summary
Brief 2-3 sentence overview of the assessment and top recommendation

## Strategic Objectives
Key business objectives aligned with AI adoption

## Recommended Solution
Top platform recommendation with clear justification

## Implementation Strategy
High-level roadmap (3-6 months)

## Risk Mitigation
Critical risks and mitigation approach

## Expected Outcomes
Quantifiable benefits and ROI projections

## Next Steps
Immediate action items for leadership

Format in professional markdown. Be concise but comprehensive. Include specific numbers and timelines.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_findings: {
              type: "array",
              items: { type: "string" }
            },
            strategic_recommendations: {
              type: "array",
              items: { type: "string" }
            },
            implementation_timeline: { type: "string" },
            estimated_roi: { type: "string" },
            critical_success_factors: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      if (!response) {
        throw new Error('No response from AI');
      }

      setSummary(response);
      toast.success('Executive summary generated!');
    } catch (error) {
      console.error('Error generating summary:', error);
      const errorMessage = error.message || 'Failed to generate summary';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [assessmentData, scoringWeights, riskAnalysis]);

  const downloadSummary = useCallback(() => {
    if (!summary?.executive_summary || !assessmentData?.organization_name) {
      toast.error('No summary available to download');
      return;
    }
    
    const content = `# Executive Assessment Summary - ${assessmentData.organization_name}\n\n${summary.executive_summary}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-summary-${assessmentData.organization_name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded!');
  }, [summary, assessmentData]);

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Executive Summary
        </CardTitle>
        <p className="text-sm text-slate-600">
          AI-generated strategic report for leadership
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">Generation Error</p>
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
        {!summary ? (
          <Button
            onClick={generateSummary}
            disabled={isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Executive Summary
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={downloadSummary}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={generateSummary}
                variant="outline"
                className="flex-1"
              >
                Regenerate
              </Button>
            </div>

            <div className="bg-white rounded-lg border p-4 max-h-96 overflow-y-auto">
              <ReactMarkdown className="prose prose-sm max-w-none">
                {summary.executive_summary}
              </ReactMarkdown>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-slate-600 mb-1">Estimated ROI</p>
                  <p className="font-semibold text-sm">{summary.estimated_roi}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-slate-600 mb-1">Timeline</p>
                  <p className="font-semibold text-sm">{summary.implementation_timeline}</p>
                </CardContent>
              </Card>
            </div>

            {summary.key_findings?.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-semibold text-sm text-blue-900 mb-2">Key Findings:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  {summary.key_findings.map((finding, idx) => (
                    <li key={idx}>• {finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.strategic_recommendations?.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="font-semibold text-sm text-green-900 mb-2">Strategic Recommendations:</p>
                <ul className="text-xs text-green-800 space-y-1">
                  {summary.strategic_recommendations.map((rec, idx) => (
                    <li key={idx}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}