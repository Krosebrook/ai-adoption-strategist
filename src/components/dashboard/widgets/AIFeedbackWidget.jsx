import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare } from 'lucide-react';

export default function AIFeedbackWidget({ config = {} }) {
  const { data: feedback = [] } = useQuery({
    queryKey: ['aiFeedback'],
    queryFn: () => base44.entities.AIFeedback.list('-created_date', 100)
  });

  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : 0;
  const totalFeedback = feedback.length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-yellow-600" />
          AI Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold flex items-center gap-1">
              {avgRating}
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-xs text-gray-600">Average Rating</p>
          </div>
          <div className="text-xs">
            <span className="font-semibold">{totalFeedback}</span>
            <span className="text-gray-500"> feedback submissions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}