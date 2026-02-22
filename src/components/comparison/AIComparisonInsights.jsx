import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle, XCircle, TrendingUp, Loader2, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIComparisonInsights({ platforms, assessmentId }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    if (assessmentId) {
      base44.entities.Assessment.filter({ id: assessmentId })
        .then(data => setAssessment(data[0]))
        .catch(() => {});
    }
  }, [assessmentId]);

  const generateInsights = async () => {
    if (!platforms || platforms.length < 2) {
      toast.error('Select at least 2 platforms to compare');
      return;
    }

    setLoading(true);
    try {
      const platformDetails = platforms.map(p => ({
        name: p.name,
        provider: p.provider,
        category: p.category,
        tier: p.tier,
        pricing: p.pricing,
        capabilities: p.capabilities,
        strengths: p.strengths,
        limitations: p.limitations,
        compliance: p.compliance_certifications,
        integrations: p.integration_options,
        use_cases: p.use_cases
      }));

      const assessmentContext = assessment ? `
User's Requirements:
- Organization: ${assessment.organization_name}
- Business Goals: ${assessment.business_goals?.join(', ') || 'Not specified'}
- Budget: ${assessment.budget_constraints?.min_budget || 'N/A'} - ${assessment.budget_constraints?.max_budget || 'N/A'}
- Compliance: ${assessment.compliance_requirements?.join(', ') || 'None specified'}
- Integrations Needed: ${assessment.desired_integrations?.join(', ') || 'None specified'}
- Pain Points: ${assessment.pain_points?.join(', ') || 'None specified'}
` : 'No specific assessment criteria available.';

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze and compare these AI platforms for enterprise adoption:

${JSON.stringify(platformDetails, null, 2)}

${assessmentContext}

Provide a comprehensive comparison with:
1. Detailed pros and cons for each platform (3-5 each)
2. Key differentiating features that set each platform apart
3. A "best fit" recommendation based on the user's criteria (if available) or general use cases
4. Head-to-head comparison highlights

Be specific, actionable, and data-driven.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            platforms_analysis: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  platform_name: { type: 'string' },
                  pros: { type: 'array', items: { type: 'string' } },
                  cons: { type: 'array', items: { type: 'string' } },
                  key_differentiators: { type: 'array', items: { type: 'string' } },
                  best_for: { type: 'string' }
                }
              }
            },
            best_fit_recommendation: {
              type: 'object',
              properties: {
                recommended_platform: { type: 'string' },
                rationale: { type: 'string' },
                confidence_score: { type: 'number' },
                alternative: { type: 'string' }
              }
            },
            head_to_head: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  winner: { type: 'string' },
                  insight: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setInsights(response);
      toast.success('AI insights generated successfully');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setLoading(false);
    }
  };

  if (!insights && !loading) {
    return (
      <Card className="border-2 border-dashed border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            AI-Powered Comparison Insights
          </CardTitle>
          <CardDescription>
            Get AI-generated pros/cons analysis, key differentiators, and personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateInsights} 
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            disabled={!platforms || platforms.length < 2}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate AI Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm text-gray-600">Analyzing platforms with AI...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Best Fit Recommendation */}
      {insights?.best_fit_recommendation && (
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-500" />
              AI Recommendation: Best Fit Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-orange-600">
                  {insights.best_fit_recommendation.recommended_platform}
                </h3>
                <Badge variant="outline" className="text-orange-600 border-orange-400">
                  {Math.round(insights.best_fit_recommendation.confidence_score || 85)}% Match
                </Badge>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {insights.best_fit_recommendation.rationale}
              </p>
            </div>
            
            {insights.best_fit_recommendation.alternative && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Alternative option:</strong> {insights.best_fit_recommendation.alternative}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pros and Cons Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {insights?.platforms_analysis?.map((platform, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="text-lg">{platform.platform_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pros */}
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pros
                </h4>
                <ul className="space-y-1.5">
                  {platform.pros?.map((pro, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Cons
                </h4>
                <ul className="space-y-1.5">
                  {platform.cons?.map((con, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Differentiators */}
              {platform.key_differentiators?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-600 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Key Differentiators
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {platform.key_differentiators.map((diff, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-orange-300 text-orange-700">
                        {diff}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Best For */}
              {platform.best_for && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Best for:</strong> {platform.best_for}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Head-to-Head Comparison */}
      {insights?.head_to_head && insights.head_to_head.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Head-to-Head Comparison</CardTitle>
            <CardDescription>Category-by-category analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.head_to_head.map((item, idx) => (
                <div key={idx} className="border-l-4 border-orange-400 pl-4 py-2 bg-gray-50 rounded-r">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{item.category}</h4>
                    <Badge className="bg-orange-500">{item.winner}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{item.insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button 
        onClick={generateInsights} 
        variant="outline" 
        className="w-full"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Regenerate Insights
      </Button>
    </div>
  );
}