import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

export default function RiskSummaryWidget({ config = {} }) {
  const { data: alerts = [] } = useQuery({
    queryKey: ['riskAlerts'],
    queryFn: () => base44.entities.RiskAlert.list('-created_date', 50),
    initialData: []
  });

  const critical = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;
  const high = alerts.filter(a => a.severity === 'high' && a.status !== 'resolved').length;
  const total = alerts.filter(a => a.status !== 'resolved').length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          Risk Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-gray-600">Active Risks</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <div className="text-lg font-semibold text-red-700">{critical}</div>
              <div className="text-xs text-red-600">Critical</div>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <div className="text-lg font-semibold text-orange-700">{high}</div>
              <div className="text-xs text-orange-600">High</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}