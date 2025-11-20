import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDate } from '../utils/formatters';
import { EmptyState } from '../ui/EmptyState';

export default function SharedResourcesList() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: sharedWithMe = [] } = useQuery({
    queryKey: ['shared-with-me', user?.email],
    queryFn: () => base44.entities.SharedResource.filter({ 
      shared_with_email: user.email 
    }, '-created_date'),
    enabled: !!user
  });

  const getResourceLink = (share) => {
    if (share.resource_type === 'assessment') {
      return createPageUrl('Results') + `?id=${share.resource_id}`;
    }
    if (share.resource_type === 'dashboard') {
      return createPageUrl('Dashboard');
    }
    if (share.resource_type === 'report') {
      return createPageUrl('Reports');
    }
    return '#';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Shared With Me
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sharedWithMe.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No shared resources"
            description="Resources shared by colleagues will appear here"
          />
        ) : (
          <div className="space-y-3">
            {sharedWithMe.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="capitalize">
                      {share.resource_type}
                    </Badge>
                    <Badge className="capitalize">{share.permission}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Shared by {share.owner_email}
                  </p>
                  {share.message && (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      "{share.message}"
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(share.shared_at || share.created_date, { format: 'long' })}
                  </p>
                </div>
                <Link to={getResourceLink(share)}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}