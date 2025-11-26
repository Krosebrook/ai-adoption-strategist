import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StrategyProgressWidget({ strategies }) {
  const activeStrategies = strategies
    .filter(s => s.status === 'active')
    .sort((a, b) => (b.progress_tracking?.overall_progress || 0) - (a.progress_tracking?.overall_progress || 0))
    .slice(0, 4);

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Target className="h-5 w-5 text-purple-500" />
            Strategy Progress
          </CardTitle>
          <Link to={createPageUrl('StrategyAutomation')}>
            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Badge>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeStrategies.length > 0 ? (
          activeStrategies.map((strategy) => {
            const progress = strategy.progress_tracking?.overall_progress || 0;
            return (
              <div key={strategy.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {strategy.organization_name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {strategy.platform} • {strategy.progress_tracking?.current_phase || 'Planning'}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 ml-2">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-slate-500">
            <Target className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No active strategies</p>
            <Link to={createPageUrl('StrategyAutomation')}>
              <Badge variant="outline" className="mt-2 cursor-pointer">
                Create Strategy
              </Badge>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}