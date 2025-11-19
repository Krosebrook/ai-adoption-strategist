import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, TrendingUp, Settings, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { 
  analyzeOverlookedRisks, 
  suggestOptimalConfiguration,
  generateDataDrivenSummary,
  refineWeightsFromFeedback 
} from './InsightsEngine';

export default function InsightsPanel({ assessment }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    risks: true,
    config: false,
    summary: false,
    weights: false
  });

  const loadInsights = async () => {
    setLoading(true);
    try {
      const [feedbacks, assessments] = await Promise.all([
        base44.entities.Feedback.list('-created_date', 50),
        base44.entities.Assessment.list('-created_date', 50)
      ]);

      const topPlatform = assessment.recommended_platforms?.[0];

      const [risks, config, summary, weights] = await Promise.all([
        analyzeOverlookedRisks(assessment, feedbacks),
        suggestOptimalConfiguration(assessment, topPlatform),
        generateDataDrivenSummary(assessment, assessments, feedbacks),
        refineWeightsFromFeedback(feedbacks, assessments)
      ]);

      setInsights({ risks, config, summary, weights });
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  if (!insights && !loading) {
    return (
      <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
        <CardContent className="py-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            AI-Driven Insights Available
          </h3>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Generate deep analysis, risk detection, and optimization recommendations
          </p>
          <Button 
            onClick={loadInsights}
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

  if (loading) {
    return (
      <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          <p style={{ color: 'var(--color-text)' }}>Analyzing data and generating insights...</p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            This may take 20-30 seconds
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overlooked Risks */}
      {insights?.risks && (
        <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => toggleSection('risks')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Overlooked Risks & Hidden Opportunities
              </CardTitle>
              {expandedSections.risks ? <ChevronUp /> : <ChevronDown />}
            </div>
          </CardHeader>
          {expandedSections.risks && (
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                  Critical Risks
                </h4>
                <div className="space-y-3">
                  {insights.risks.critical_risks?.map((risk, idx) => (
                    <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold" style={{ color: 'var(--color-text)' }}>{risk.title}</h5>
                        <Badge className={getSeverityColor(risk.severity)}>
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {risk.description}
                      </p>
                      <div className="text-sm">
                        <span className="font-medium" style={{ color: 'var(--color-text)' }}>Mitigation: </span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{risk.mitigation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                  Opportunities
                </h4>
                <div className="space-y-3">
                  {insights.risks.opportunities?.map((opp, idx) => (
                    <div key={idx} className="p-4 rounded-lg" style={{ 
                      background: 'rgba(33, 128, 141, 0.05)',
                      border: '1px solid var(--color-border)'
                    }}>
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold" style={{ color: 'var(--color-text)' }}>{opp.title}</h5>
                        <Badge style={{ background: 'var(--color-teal-500)', color: 'white' }}>
                          {opp.potential_value}
                        </Badge>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {opp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Optimal Configuration */}
      {insights?.config && (
        <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => toggleSection('config')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <Settings className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                Optimal Platform Configuration
              </CardTitle>
              {expandedSections.config ? <ChevronUp /> : <ChevronDown />}
            </div>
          </CardHeader>
          {expandedSections.config && (
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Licensing</h4>
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Recommended: <strong>{insights.config.licensing?.recommended_tier}</strong>
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Est. ${insights.config.licensing?.estimated_cost_per_user}/user/month
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Rollout Phases</h4>
                <div className="space-y-2">
                  {insights.config.rollout_phases?.map((phase, idx) => (
                    <div key={idx} className="p-3 rounded-lg" style={{ background: 'rgba(33, 128, 141, 0.05)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                          {phase.phase}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {phase.duration_weeks} weeks
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {phase.target_departments?.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Cost Optimization</h4>
                <div className="space-y-2">
                  {insights.config.cost_optimization?.map((opt, idx) => (
                    <div key={idx} className="flex justify-between text-sm p-2 rounded" style={{ 
                      background: 'rgba(33, 128, 141, 0.05)' 
                    }}>
                      <span style={{ color: 'var(--color-text)' }}>{opt.strategy}</span>
                      <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {opt.potential_savings}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Data-Driven Summary */}
      {insights?.summary && (
        <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => toggleSection('summary')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <TrendingUp className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                Data-Driven Executive Summary
              </CardTitle>
              {expandedSections.summary ? <ChevronUp /> : <ChevronDown />}
            </div>
          </CardHeader>
          {expandedSections.summary && (
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Confidence Level:
                </span>
                <Badge style={{ background: 'var(--color-teal-500)', color: 'white' }}>
                  {insights.summary.confidence_level}
                </Badge>
              </div>

              <div className="prose prose-sm max-w-none">
                <p style={{ color: 'var(--color-text)' }}>{insights.summary.executive_summary}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Key Findings</h4>
                <ul className="space-y-1">
                  {insights.summary.key_findings?.map((finding, idx) => (
                    <li key={idx} className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Immediate Actions</h4>
                <div className="space-y-2">
                  {insights.summary.immediate_actions?.map((action, idx) => (
                    <div key={idx} className="p-3 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          {action.action}
                        </span>
                        <Badge className={
                          action.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          action.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {action.priority}
                        </Badge>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        Timeline: {action.timeline}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}