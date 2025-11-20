import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from "@/components/ui/badge";
import { Users, Lock } from 'lucide-react';

export default function AccessControlBadge({ resourceType, resourceId }) {
  const { data: shares = [] } = useQuery({
    queryKey: ['shares', resourceType, resourceId],
    queryFn: () => base44.entities.SharedResource.filter({ 
      resource_type: resourceType,
      resource_id: resourceId 
    }),
    enabled: !!resourceId
  });

  if (shares.length === 0) {
    return (
      <Badge variant="outline" className="bg-slate-50">
        <Lock className="h-3 w-3 mr-1" />
        Private
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
      <Users className="h-3 w-3 mr-1" />
      Shared with {shares.length}
    </Badge>
  );
}