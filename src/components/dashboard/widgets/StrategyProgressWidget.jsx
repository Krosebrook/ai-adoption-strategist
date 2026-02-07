import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp } from 'lucide-react';

export default function StrategyProgressWidget({ config = {} }) {
  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.AdoptionStrategy.list(),
    initialData: []
  });

  const activeStrategies = strategies.filter(s => s.status === 'active');
  const avgProgress = activeStrategies.length > 0
    ? activeStrategies.reduce((sum, s) => sum + (s.progress_tracking?.overall_progress || 0), 0) / activeStrategies.length
    : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-600" />
          Strategy Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold">{avgProgress.toFixed(0)}%</div>
            <p className="text-xs text-gray-600">Average Progress</p>
          </div>
          <Progress value={avgProgress} className="h-2" />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="font-semibold text-gray-700">{activeStrategies.length}</div>
              <div className="text-gray-500">Active</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">{strategies.filter(s => s.status === 'completed').length}</div>
              <div className="text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}