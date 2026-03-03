import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Download, CheckCircle, AlertTriangle, TrendingUp, Star } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

export default function AssessmentSummaryReport() {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments-completed'],
    queryFn: () => base44.entities.Assessment.list('-assessment_date', 50),
    initialData: []
  });

  const selectedAssessment = assessments.find(a => a.id === selectedAssessmentId);

  const generateSummary = async () => {
    if (!selectedAssessment) { toast.error('Select an assessment first'); return; }
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert AI strategy consultant. Generate a comprehensive, executive-ready summary of this AI platform assessment.

Assessment Data:
- Organization: ${selectedAssessment.organization_name}
- Date: ${selectedAssessment.assessment_date || 'Recent'}
- Business Goals: ${selectedAssessment.business_goals?.join(', ') || 'Not specified'}
- Pain Points: ${selectedAssessment.pain_points?.join(', ') || 'None listed'}
- Compliance Requirements: ${selectedAssessment.compliance_requirements?.join(', ') || 'None'}
- Desired Integrations: ${selectedAssessment.desired_integrations?.join(', ') || 'None'}
- Recommended Platforms: ${selectedAssessment.recommended_platforms?.map(p => `${p.platform_name} (score: ${p.score})`).join(', ') || 'Not yet generated'}
- Budget: ${selectedAssessment.budget_constraints?.min_budget || 'N/A'} - ${selectedAssessment.budget_constraints?.max_budget || 'N/A'} ${selectedAssessment.budget_constraints?.budget_period || ''}
- Maturity Level: ${selectedAssessment.ai_assessment_score?.maturity_level || 'Not assessed'}
- Overall Score: ${selectedAssessment.ai_assessment_score?.overall_score || 'N/A'}

Provide a structured report with:
1. An executive narrative (2-3 paragraphs)
2. 4-6 key findings with severity/priority
3. Top 4-5 actionable recommendations with owner and timeline
4. Platform fit summary for top 3 recommended platforms
5. Risk flags to watch
6. A one-line strategic recommendation`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            executive_narrative: { type: 'string' },
            key_findings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  finding: { type: 'string' },
                  priority: { type: 'string' },
                  impact: { type: 'string' }
                }
              }
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  owner: { type: 'string' },
                  timeline: { type: 'string' },
                  expected_outcome: { type: 'string' }
                }
              }
            },
            platform_fit_summary: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  platform: { type: 'string' },
                  fit_score: { type: 'number' },
                  why_it_fits: { type: 'string' },
                  watch_out: { type: 'string' }
                }
              }
            },
            risk_flags: { type: 'array', items: { type: 'string' } },
            strategic_recommendation: { type: 'string' }
          }
        }
      });
      setSummary(response);
      toast.success('Assessment summary generated!');
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!summary) return;
    const doc = new jsPDF();
    let y = 20;
    const addLine = (text, size = 10, bold = false, maxWidth = 170) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(size);
      doc.setFont(undefined, bold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, 20, y);
      y += lines.length * (size * 0.45) + 2;
    };

    addLine(`Assessment Report: ${selectedAssessment.organization_name}`, 18, true);
    addLine(`Generated: ${new Date().toLocaleDateString()}`, 9);
    y += 5;
    addLine('Executive Summary', 13, true);
    addLine(summary.executive_narrative || '');
    y += 5;
    addLine('Strategic Recommendation', 13, true);
    addLine(summary.strategic_recommendation || '');
    y += 5;
    addLine('Key Findings', 13, true);
    (summary.key_findings || []).forEach((f, i) => {
      addLine(`${i + 1}. ${f.finding} [${f.priority}]`, 10, true);
      addLine(`   Impact: ${f.impact}`, 9);
    });
    y += 5;
    addLine('Recommendations', 13, true);
    (summary.recommendations || []).forEach((r, i) => {
      addLine(`${i + 1}. ${r.action}`, 10, true);
      addLine(`   Owner: ${r.owner} | Timeline: ${r.timeline}`, 9);
    });
    doc.save(`${selectedAssessment.organization_name}_assessment_summary.pdf`);
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
    critical: 'bg-red-200 text-red-800'
  };

  return (
    <div className="space-y-6">
      {/* Config Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            AI Assessment Summary Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Assessment</label>
              <Select value={selectedAssessmentId} onValueChange={setSelectedAssessmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an assessment..." />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.organization_name} {a.assessment_date ? `(${a.assessment_date})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={generateSummary}
              disabled={loading || !selectedAssessmentId}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {loading ? 'Generating...' : 'Generate Summary'}
            </Button>
          </div>

          {selectedAssessment && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Badge variant="outline">Goals: {selectedAssessment.business_goals?.length || 0}</Badge>
              <Badge variant="outline">Pain Points: {selectedAssessment.pain_points?.length || 0}</Badge>
              <Badge variant="outline">Platforms Assessed: {selectedAssessment.recommended_platforms?.length || 0}</Badge>
              {selectedAssessment.ai_assessment_score?.maturity_level && (
                <Badge className="bg-blue-100 text-blue-700">{selectedAssessment.ai_assessment_score.maturity_level} maturity</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Output */}
      {summary && (
        <div className="space-y-4">
          {/* Strategic Headline */}
          <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  <h3 className="font-bold text-lg">Strategic Recommendation</h3>
                </div>
                <Button size="sm" variant="outline" onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-2" />Export PDF
                </Button>
              </div>
              <p className="text-gray-800 font-medium text-base">{summary.strategic_recommendation}</p>
            </CardContent>
          </Card>

          {/* Executive Narrative */}
          <Card>
            <CardHeader><CardTitle className="text-base">Executive Narrative</CardTitle></CardHeader>
            <CardContent>
              <ReactMarkdown className="prose prose-sm max-w-none text-gray-700">
                {summary.executive_narrative}
              </ReactMarkdown>
            </CardContent>
          </Card>

          {/* Key Findings + Recommendations side by side */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />Key Findings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.key_findings?.map((f, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{f.finding}</p>
                      <Badge className={`text-xs flex-shrink-0 ${priorityColors[f.priority?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                        {f.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{f.impact}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.recommendations?.map((r, i) => (
                  <div key={i} className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm font-medium text-gray-900 mb-1">{r.action}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>👤 {r.owner}</span>
                      <span>⏱ {r.timeline}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Platform Fit Summary */}
          {summary.platform_fit_summary?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Platform Fit Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {summary.platform_fit_summary.map((p, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{p.platform}</h4>
                        <Badge className="bg-orange-100 text-orange-700">{p.fit_score}%</Badge>
                      </div>
                      <p className="text-xs text-green-700 mb-2">✓ {p.why_it_fits}</p>
                      <p className="text-xs text-yellow-700">⚠ {p.watch_out}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Flags */}
          {summary.risk_flags?.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />Risk Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.risk_flags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-red-800 bg-red-50 p-2 rounded">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />{flag}
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