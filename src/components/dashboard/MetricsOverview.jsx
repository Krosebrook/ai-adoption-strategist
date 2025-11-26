import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, Target, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, Activity, Shield
} from 'lucide-react';

export default function MetricsOverview({ metrics, isLoading }) {
  const cards = [
    {
      title: 'Total Assessments',
      value: metrics.totalAssessments,
      subtitle: `${metrics.completedAssessments} completed`,
      icon: FileText,
      color: '#E88A1D',
      trend: metrics.assessmentTrend,
      trendLabel: 'vs last week'
    },
    {
      title: 'Active Strategies',
      value: metrics.activeStrategies,
      subtitle: `${metrics.completedStrategies} completed`,
      icon: Target,
      color: '#6B5B7A'
    },
    {
      title: 'Avg. Progress',
      value: `${metrics.avgProgress}%`,
      subtitle: 'Across active strategies',
      icon: Activity,
      color: '#22C55E'
    },
    {
      title: 'Risk Score',
      value: metrics.avgRiskScore,
      subtitle: `${metrics.highRisks} high priority`,
      icon: Shield,
      color: metrics.avgRiskScore > 60 ? '#EF4444' : metrics.avgRiskScore > 40 ? '#F59E0B' : '#22C55E'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-500 mb-1">{card.title}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">
                      {isLoading ? '—' : card.value}
                    </span>
                    {card.trend !== undefined && card.trend !== 0 && (
                      <span className={`flex items-center text-sm font-medium ${
                        card.trend > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {card.trend > 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(card.trend)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
                </div>
                <div 
                  className="p-3 rounded-xl"
                  style={{ background: `${card.color}15` }}
                >
                  <Icon className="h-6 w-6" style={{ color: card.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}