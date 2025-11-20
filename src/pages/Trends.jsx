import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp, AlertCircle, Target, Award } from 'lucide-react';
import { analyzeTrends } from '../components/trends/AITrendAnalyzer';
import { ReadinessTrendChart, ComplianceTrendChart, MaturityDistributionChart, TrendIndicator } from '../components/trends/TrendCharts';
import { toast } from 'sonner';

export default function Trends() {
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['assessments-trends'],
    queryFn: async () => {
      return await base44.entities.Assessment.filter({ status: 'completed' }, '-assessment_date', 100);
    }
  });

  const handleAnalyzeTrends = async () => {
    if (!assessments || assessments.length < 2) {
      toast.error('Need at least 2 assessments to analyze trends');
      return;
    }

    setAnalyzing(true);
    try {
      const analysis = await analyzeTrends(assessments);
      setTrendAnalysis(analysis);
      toast.success('Trend analysis complete!');
    } catch (error) {
      console.error('Failed to analyze trends:', error);
      toast.error('Failed to analyze trends');
    } finally {
      setAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <Loader2 className="h-12 w-12 animate-spin text-slate-400" />
      </div>
    );
  }

  const hasEnoughData = assessments && assessments.length >= 2;

  // Calculate quick stats
  const latestAssessment = assessments?.[0];
  const previousAssessment = assessments?.[1];

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              AI Adoption Trends
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Track compliance, risk, and maturity changes across {assessments?.length || 0} assessments
            </p>
          </div>
          <Button
            onClick={handleAnalyzeTrends}
            disabled={!hasEnoughData || analyzing}
            className="text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))' }}
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Trend Analysis
              </>
            )}
          </Button>
        </div>

        {!hasEnoughData ? (
          <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text)' }} />
              <p className="mb-2" style={{ color: 'var(--color-text)' }}>
                Not enough data for trend analysis
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Complete at least 2 assessments to see trends
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            {latestAssessment && previousAssessment && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
                  <CardContent className="pt-6">
                    <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Avg AI Readiness
                    </div>
                    <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                      {latestAssessment.ai_assessment_score?.readiness_score || 0}/100
                    </div>
                    <TrendIndicator
                      value={latestAssessment.ai_assessment_score?.readiness_score || 0}
                      previousValue={previousAssessment.ai_assessment_score?.readiness_score || 0}
                      label="vs previous"
                    />
                  </CardContent>
                </Card>

                <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
                  <CardContent className="pt-6">
                    <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Risk Level
                    </div>
                    <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                      {latestAssessment.ai_assessment_score?.risk_score || 0}/100
                    </div>
                    <TrendIndicator
                      value={100 - (latestAssessment.ai_assessment_score?.risk_score || 0)}
                      previousValue={100 - (previousAssessment.ai_assessment_score?.risk_score || 0)}
                      label="improvement"
                    />
                  </CardContent>
                </Card>

                <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
                  <CardContent className="pt-6">
                    <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Maturity Level
                    </div>
                    <div className="text-2xl font-bold mb-2 capitalize" style={{ color: 'var(--color-text)' }}>
                      {latestAssessment.ai_assessment_score?.maturity_level || 'N/A'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Latest assessment
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
                  <CardContent className="pt-6">
                    <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Total Assessments
                    </div>
                    <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                      {assessments.length}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Completed
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReadinessTrendChart assessments={assessments} />
              <ComplianceTrendChart assessments={assessments} />
            </div>

            <MaturityDistributionChart assessments={assessments} />

            {/* AI Analysis Results */}
            {trendAnalysis && (
              <div className="space-y-6">
                {/* Overall Summary */}
                <Card className="border-2" style={{ 
                  background: 'var(--color-surface)', 
                  borderColor: 'var(--color-teal-500)' 
                }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                      <Sparkles className="h-5 w-5" style={{ color: 'var(--color-teal-500)' }} />
                      AI Trend Analysis
                      <Badge className="ml-2" style={{ 
                        background: trendAnalysis.trend_direction === 'improving' ? '#10b981' :
                                   trendAnalysis.trend_direction === 'declining' ? '#ef4444' : '#6b7280'
                      }}>
                        {trendAnalysis.trend_direction}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                      {trendAnalysis.overall_summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Detailed Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Readiness Trend */}
                  <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Readiness Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            Direction:
                          </span>
                          <Badge variant="outline">{trendAnalysis.readiness_trend.direction}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            Avg Change:
                          </span>
                          <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                            {trendAnalysis.readiness_trend.average_change > 0 ? '+' : ''}
                            {trendAnalysis.readiness_trend.average_change.toFixed(1)} points
                          </span>
                        </div>
                        <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                          {trendAnalysis.readiness_trend.insight}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Trend */}
                  <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        Risk Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            Direction:
                          </span>
                          <Badge variant="outline">{trendAnalysis.risk_trend.direction}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            Avg Change:
                          </span>
                          <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                            {trendAnalysis.risk_trend.average_change > 0 ? '+' : ''}
                            {trendAnalysis.risk_trend.average_change.toFixed(1)} points
                          </span>
                        </div>
                        <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                          {trendAnalysis.risk_trend.insight}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Maturity Progression */}
                <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                      <Award className="h-5 w-5 text-purple-600" />
                      Maturity Progression
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {trendAnalysis.maturity_progression.beginner_count}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Beginner</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {trendAnalysis.maturity_progression.intermediate_count}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Intermediate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {trendAnalysis.maturity_progression.advanced_count}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Advanced</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">
                          {trendAnalysis.maturity_progression.expert_count}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Expert</div>
                      </div>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {trendAnalysis.maturity_progression.insight}
                    </p>
                  </CardContent>
                </Card>

                {/* Platform Trends & Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
                    <CardHeader>
                      <CardTitle className="text-lg" style={{ color: 'var(--color-text)' }}>
                        Platform Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {trendAnalysis.platform_trends?.map((trend, idx) => (
                          <div key={idx} className="p-3 rounded-lg" style={{ background: 'rgba(33, 128, 141, 0.05)' }}>
                            <div className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                              {trend.platform}
                            </div>
                            <Badge variant="outline" className="mb-2">{trend.trend}</Badge>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              {trend.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <Target className="h-5 w-5 text-green-600" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {trendAnalysis.recommendations?.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Forecast */}
                {trendAnalysis.forecast && (
                  <Card style={{ 
                    background: 'linear-gradient(135deg, rgba(33, 128, 141, 0.1), rgba(50, 184, 198, 0.1))',
                    borderColor: 'var(--color-teal-500)'
                  }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <Sparkles className="h-5 w-5" style={{ color: 'var(--color-teal-500)' }} />
                        Forecast
                        <Badge style={{ background: 'var(--color-teal-500)' }}>
                          {trendAnalysis.forecast.confidence} confidence
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                          Predicted Direction: 
                        </span>
                        <span className="ml-2 capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                          {trendAnalysis.forecast.predicted_direction}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {trendAnalysis.forecast.reasoning}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}