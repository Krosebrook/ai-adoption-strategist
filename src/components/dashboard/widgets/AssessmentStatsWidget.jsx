import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle } from 'lucide-react';

export default function AssessmentStatsWidget({ config = {} }) {
  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.list(),
    initialData: []
  });

  const completed = assessments.filter(a => a.status === 'completed').length;
  const total = assessments.length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-green-600" />
          Assessments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-gray-600">Total Assessments</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="font-semibold">{completed}</span>
            <span className="text-gray-500">Completed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}