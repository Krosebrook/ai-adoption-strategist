import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { 
  FileText, MessageSquare, CheckCircle, AlertTriangle, 
  Users, Share2, Clock 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ActivityFeed({ resourceType, resourceId, limit = 10 }) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', resourceType, resourceId],
    queryFn: async () => {
      // Fetch recent comments, shares, and updates
      const [comments, shares] = await Promise.all([
        base44.entities.Comment.filter({ 
          resource_type: resourceType, 
          resource_id: resourceId 
        }, '-created_date', limit),
        base44.entities.SharedResource.filter({ 
          resource_type: resourceType, 
          resource_id: resourceId 
        }, '-created_date', limit)
      ]);

      // Combine and sort by date
      const combined = [
        ...comments.map(c => ({ ...c, activity_type: 'comment' })),
        ...shares.map(s => ({ ...s, activity_type: 'share' }))
      ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

      return combined.slice(0, limit);
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'comment': return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'share': return <Share2 className="h-4 w-4 text-purple-600" />;
      case 'update': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-slate-600" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.activity_type) {
      case 'comment':
        return (
          <span>
            <strong>{activity.author_name || activity.author_email}</strong> commented
          </span>
        );
      case 'share':
        return (
          <span>
            <strong>{activity.owner_email}</strong> shared with{' '}
            <strong>{activity.shared_with_email}</strong>
          </span>
        );
      default:
        return 'Activity occurred';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-slate-500">Loading activity...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!activities || activities.length === 0 ? (
          <p className="text-sm text-slate-500">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                <div className="mt-1">{getActivityIcon(activity.activity_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-700">
                    {getActivityText(activity)}
                  </div>
                  {activity.content && (
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {activity.content}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}