import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sparkles, ThumbsUp, ThumbsDown, TrendingUp, Star, Activity } from 'lucide-react';

export default function AIInsightsPerformance({ assessments }) {
  const { data: feedbacks = [] } = useQuery({
    queryKey: ['allFeedback'],
    queryFn: () => base44.entities.Feedback.list('-created_date', 100),
    initialData: []
  });

  // Calculate AI insights generation rate
  const getAIInsightsMetrics = () => {
    const withAI = assessments.filter(a => a.ai_insights).length;
    const total = assessments.length;
    const adoptionRate = total > 0 ? (withAI / total) * 100 : 0;

    return {
      total,
      withAI,
      adoptionRate,
      withoutAI: total - withAI
    };
  };

  // Calculate feedback satisfaction
  const getFeedbackMetrics = () => {
    if (feedbacks.length === 0) return null;

    const avgRating = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length;
    const avgUsefulness = feedbacks.reduce((sum, f) => sum + (f.usefulness_score || 0), 0) / feedbacks.length;
    
    const accuracyMetrics = {
      recommendations: feedbacks.filter(f => f.recommendation_accurate === true).length,
      risks: feedbacks.filter(f => f.risk_assessment_accurate === true).length,
      roi: feedbacks.filter(f => f.roi_realistic === true).length,
      total: feedbacks.filter(f => 
        f.recommendation_accurate !== undefined || 
        f.risk_assessment_accurate !== undefined || 
        f.roi_realistic !== undefined
      ).length
    };

    return {
      avgRating,
      avgUsefulness,
      totalFeedback: feedbacks.length,
      accuracyMetrics
    };
  };

  // AI insights adoption over time
  const getAdoptionTimeline = () => {
    const grouped = {};
    
    assessments.forEach(assessment => {
      const date = new Date(assessment.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthKey,
          withAI: 0,
          withoutAI: 0
        };
      }
      
      if (assessment.ai_insights) {
        grouped[monthKey].withAI++;
      } else {
        grouped[monthKey].withoutAI++;
      }
    });
    
    return Object.values(grouped)
      .map(item => ({
        ...item,
        adoptionRate: item.withAI + item.withoutAI > 0 
          ? ((item.withAI / (item.withAI + item.withoutAI)) * 100).toFixed(1) 
          : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const metrics = getAIInsightsMetrics();
  const feedbackMetrics = getFeedbackMetrics();
  const adoptionTimeline = getAdoptionTimeline();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 mb-1">AI Adoption Rate</p>
                <p className="text-3xl font-bold text-purple-900">
                  {metrics.adoptionRate.toFixed(0)}%
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {metrics.withAI} of {metrics.total} assessments
                </p>
              </div>
              <Sparkles className="h-10 w-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {feedbackMetrics && (
          <>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 mb-1">Avg Satisfaction</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {feedbackMetrics.avgRating.toFixed(1)}/5
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {feedbackMetrics.totalFeedback} responses
                    </p>
                  </div>
                  <Star className="h-10 w-10 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 mb-1">Usefulness Score</p>
                    <p className="text-3xl font-bold text-green-900">
                      {feedbackMetrics.avgUsefulness.toFixed(1)}/10
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      AI recommendations
                    </p>
                  </div>
                  <ThumbsUp className="h-10 w-10 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Adoption Timeline */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            AI Insights Adoption Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adoptionTimeline.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No timeline data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={adoptionTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="withAI" stroke="#8B5CF6" strokeWidth={2} name="With AI Insights" />
                <Line type="monotone" dataKey="withoutAI" stroke="#94a3b8" strokeWidth={2} name="Without AI" />
                <Line type="monotone" dataKey="adoptionRate" stroke="#10b981" strokeWidth={2} name="Adoption Rate %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Accuracy Metrics */}
      {feedbackMetrics && feedbackMetrics.accuracyMetrics.total > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-600" />
              AI Accuracy & Quality Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Recommendation Accuracy</span>
                <span className="text-sm font-semibold text-slate-900">
                  {((feedbackMetrics.accuracyMetrics.recommendations / feedbackMetrics.accuracyMetrics.total) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={(feedbackMetrics.accuracyMetrics.recommendations / feedbackMetrics.accuracyMetrics.total) * 100} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Risk Assessment Accuracy</span>
                <span className="text-sm font-semibold text-slate-900">
                  {((feedbackMetrics.accuracyMetrics.risks / feedbackMetrics.accuracyMetrics.total) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={(feedbackMetrics.accuracyMetrics.risks / feedbackMetrics.accuracyMetrics.total) * 100} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">ROI Projection Realism</span>
                <span className="text-sm font-semibold text-slate-900">
                  {((feedbackMetrics.accuracyMetrics.roi / feedbackMetrics.accuracyMetrics.total) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={(feedbackMetrics.accuracyMetrics.roi / feedbackMetrics.accuracyMetrics.total) * 100} 
                className="h-2"
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Based on {feedbackMetrics.accuracyMetrics.total} feedback responses from {feedbackMetrics.totalFeedback} total users
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}