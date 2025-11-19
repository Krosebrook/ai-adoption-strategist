import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, TrendingUp, Target, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function InsightsSummary({ assessments }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const feedbacks = await base44.entities.Feedback.list('-created_date', 50);
      
      const prompt = `Analyze these assessments and feedback to identify key insights:

**Assessments:** ${assessments.length} completed
**Recent Feedback:** ${feedbacks.length} responses

**Assessment Data:**
${JSON.stringify(assessments.slice(0, 10).map(a => ({
  org: a.organization_name,
  platform: a.recommended_platforms?.[0]?.platform,
  departments: a.departments?.length,
  roi: a.roi_calculations?.[a.recommended_platforms?.[0]?.platform]?.one_year_roi
})), null, 2)}

Provide:
1. Most common risks across assessments
2. Top opportunities organizations are missing
3. Platform recommendation patterns
4. Key trends in deployment success`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            common_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  frequency: { type: "string" },
                  severity: { type: "string", enum: ["high", "medium", "low"] }
                }
              }
            },
            top_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  opportunity: { type: "string" },
                  potential_impact: { type: "string" }
                }
              }
            },
            platform_trends: {
              type: "object",
              properties: {
                most_recommended: { type: "string" },
                highest_satisfaction: { type: "string" },
                emerging_preference: { type: "string" }
              }
            }
          }
        }
      });

      setInsights(response);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  if (loading) {
    return (
      <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          <p style={{ color: 'var(--color-text)' }}>Analyzing patterns across assessments...</p>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
        <CardContent className="py-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            AI Insights Available
          </h3>
          <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Discover patterns, risks, and opportunities across all assessments
          </p>
          <Button 
            onClick={generateInsights}
            className="text-white"
            style={{ 
              background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))',
              border: 'none'
            }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Sparkles className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
          AI-Driven Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Common Risks
          </h4>
          <div className="space-y-2">
            {insights.common_risks?.slice(0, 3).map((risk, idx) => (
              <div key={idx} className="p-3 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    {risk.risk}
                  </span>
                  <Badge className={getSeverityColor(risk.severity)}>{risk.severity}</Badge>
                </div>
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Frequency: {risk.frequency}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Target className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
            Top Opportunities
          </h4>
          <div className="space-y-2">
            {insights.top_opportunities?.slice(0, 3).map((opp, idx) => (
              <div key={idx} className="p-3 rounded-lg" style={{ 
                background: 'rgba(33, 128, 141, 0.05)',
                border: '1px solid var(--color-border)'
              }}>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  {opp.opportunity}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Impact: {opp.potential_impact}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
            Platform Trends
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 rounded" style={{ background: 'rgba(33, 128, 141, 0.05)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Most Recommended:</span>
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                {insights.platform_trends?.most_recommended}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded" style={{ background: 'rgba(33, 128, 141, 0.05)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Highest Satisfaction:</span>
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                {insights.platform_trends?.highest_satisfaction}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}