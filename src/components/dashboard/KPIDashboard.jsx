import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

export default function KPIDashboard({ assessments, trainingProgress, strategies, platforms }) {
  const kpis = useMemo(() => {
    // AI Adoption Rate
    const completedAssessments = assessments.filter(a => a.status === 'completed').length;
    const adoptionRate = assessments.length > 0 ? (completedAssessments / assessments.length) * 100 : 0;

    // Average ROI
    const roiValues = assessments
      .filter(a => a.roi_calculations)
      .flatMap(a => Object.values(a.roi_calculations || {}))
      .map(roi => roi.roi_percentage || 0);
    const avgROI = roiValues.length > 0 ? roiValues.reduce((sum, v) => sum + v, 0) / roiValues.length : 0;

    // Total Potential Savings
    const totalSavings = assessments
      .filter(a => a.roi_calculations)
      .flatMap(a => Object.values(a.roi_calculations || {}))
      .reduce((sum, roi) => sum + (roi.total_annual_savings || 0), 0);

    // Training Completion Rate
    const completedTraining = trainingProgress.filter(p => p.status === 'completed').length;
    const trainingCompletionRate = trainingProgress.length > 0 ? (completedTraining / trainingProgress.length) * 100 : 0;

    // Readiness Score
    const readinessScores = assessments
      .filter(a => a.ai_assessment_score?.overall_score)
      .map(a => a.ai_assessment_score.overall_score);
    const avgReadiness = readinessScores.length > 0 
      ? readinessScores.reduce((sum, s) => sum + s, 0) / readinessScores.length 
      : 0;

    // Active Platforms
    const activePlatforms = new Set(
      assessments
        .flatMap(a => a.recommended_platforms || [])
        .map(p => p.platform_name)
    ).size;

    return {
      adoptionRate: { value: adoptionRate, trend: adoptionRate > 75 ? 'up' : 'down' },
      avgROI: { value: avgROI, trend: avgROI > 100 ? 'up' : 'down' },
      totalSavings: { value: totalSavings, trend: 'up' },
      trainingCompletion: { value: trainingCompletionRate, trend: trainingCompletionRate > 70 ? 'up' : 'down' },
      readinessScore: { value: avgReadiness, trend: avgReadiness > 70 ? 'up' : 'down' },
      activePlatforms: { value: activePlatforms, trend: 'neutral' }
    };
  }, [assessments, trainingProgress]);

  const kpiCards = [
    {
      title: 'AI Adoption Rate',
      value: `${kpis.adoptionRate.value.toFixed(1)}%`,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: kpis.adoptionRate.trend
    },
    {
      title: 'Average ROI',
      value: `${kpis.avgROI.value.toFixed(0)}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: kpis.avgROI.trend
    },
    {
      title: 'Potential Savings',
      value: `$${(kpis.totalSavings.value / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: kpis.totalSavings.trend
    },
    {
      title: 'Training Completion',
      value: `${kpis.trainingCompletion.value.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: kpis.trainingCompletion.trend
    },
    {
      title: 'Readiness Score',
      value: `${kpis.readinessScore.value.toFixed(0)}/100`,
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: kpis.readinessScore.trend
    },
    {
      title: 'Active Platforms',
      value: kpis.activePlatforms.value,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      trend: kpis.activePlatforms.trend
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpiCards.map((kpi, index) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : null;
        
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                {TrendIcon && (
                  <TrendIcon className={`h-4 w-4 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                )}
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">{kpi.title}</p>
                <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}