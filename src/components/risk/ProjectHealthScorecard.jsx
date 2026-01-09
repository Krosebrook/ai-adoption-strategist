import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function ProjectHealthScorecard({ strategy, assessment, riskAlerts }) {
  const calculateHealthScore = () => {
    let score = 100;

    // Deduct for open high/critical risks
    const highRisks = riskAlerts.filter(a => 
      ['high', 'critical'].includes(a.severity) && a.status !== 'resolved'
    ).length;
    score -= highRisks * 10;

    // Bonus for progress
    const progress = strategy.progress_tracking?.overall_progress || 0;
    if (progress >= 80) score += 10;
    else if (progress < 40) score -= 10;

    // Deduct for delayed milestones
    const delayedMilestones = strategy.milestones?.filter(m => m.status === 'delayed').length || 0;
    score -= delayedMilestones * 5;

    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();
  const progress = strategy.progress_tracking?.overall_progress || 0;
  
  const activeRisks = riskAlerts.filter(a => a.status !== 'resolved').length;
  const criticalRisks = riskAlerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;
  
  const completedMilestones = strategy.milestones?.filter(m => m.status === 'completed').length || 0;
  const totalMilestones = strategy.milestones?.length || 1;

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'At Risk';
    return 'Critical';
  };

  return (
    <div className="mb-6">
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Overall Health */}
            <div className="md:col-span-2 border-r border-white/20 pr-4">
              <div className="text-sm text-blue-100 mb-1">Project Health Score</div>
              <div className={`text-5xl font-bold ${getHealthColor(healthScore)}`} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {healthScore}
              </div>
              <div className="text-lg text-blue-100 mt-1">{getHealthLabel(healthScore)}</div>
              <Progress value={healthScore} className="h-2 mt-3 bg-white/20" />
            </div>

            {/* Key Metrics */}
            <div className="flex flex-col justify-center">
              <div className="text-sm text-blue-100 mb-1">Implementation Progress</div>
              <div className="text-2xl font-bold">{progress}%</div>
              <div className="flex items-center gap-1 text-xs text-blue-100 mt-1">
                {progress >= 50 ? (
                  <><TrendingUp className="h-3 w-3" /> On Track</>
                ) : (
                  <><TrendingDown className="h-3 w-3" /> Behind</>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="text-sm text-blue-100 mb-1">Active Risks</div>
              <div className="text-2xl font-bold">{activeRisks}</div>
              {criticalRisks > 0 && (
                <Badge className="bg-red-600 text-white mt-1 w-fit">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {criticalRisks} Critical
                </Badge>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <div className="text-sm text-blue-100 mb-1">Milestones</div>
              <div className="text-2xl font-bold">
                {completedMilestones}/{totalMilestones}
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-100 mt-1">
                <CheckCircle className="h-3 w-3" />
                {Math.round((completedMilestones / totalMilestones) * 100)}% Complete
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}