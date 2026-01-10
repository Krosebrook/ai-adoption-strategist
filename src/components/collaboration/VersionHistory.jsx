import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, User, GitBranch, Eye, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function VersionHistory({ resourceType, resourceId, onRestore }) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const queryClient = useQueryClient();

  const { data: versions, isLoading } = useQuery({
    queryKey: ['versions', resourceType, resourceId],
    queryFn: () => base44.entities.DocumentVersion.filter({
      resource_type: resourceType,
      resource_id: resourceId
    }, '-version_number', 50)
  });

  const restoreMutation = useMutation({
    mutationFn: async (version) => {
      if (onRestore) {
        await onRestore(version.content_snapshot);
      }
      return version;
    },
    onSuccess: () => {
      toast.success('Version restored successfully');
      queryClient.invalidateQueries({ queryKey: ['versions'] });
    }
  });

  const getChangeTypeColor = (type) => {
    switch (type) {
      case 'created': return 'bg-blue-600';
      case 'updated': return 'bg-green-600';
      case 'reviewed': return 'bg-purple-600';
      case 'approved': return 'bg-amber-600';
      default: return 'bg-slate-600';
    }
  };

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading version history...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-blue-600" />
            Version History ({versions?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!versions || versions.length === 0 ? (
            <p className="text-sm text-slate-500">No version history available</p>
          ) : (
            <div className="space-y-3">
              {versions.map((version, idx) => (
                <div key={version.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getChangeTypeColor(version.change_type)}>
                        v{version.version_number}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {version.change_type}
                      </Badge>
                      {idx === 0 && (
                        <Badge className="bg-green-600 text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 mb-1">
                      {version.changes_summary || 'No summary provided'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {version.changed_by}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(version.created_date), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedVersion(version)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {idx > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => restoreMutation.mutate(version)}
                        disabled={restoreMutation.isPending}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedVersion && (
        <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Version {selectedVersion.version_number} Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getChangeTypeColor(selectedVersion.change_type)}>
                  {selectedVersion.change_type}
                </Badge>
                <span className="text-sm text-slate-600">
                  by {selectedVersion.changed_by} • {new Date(selectedVersion.created_date).toLocaleString()}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(selectedVersion.content_snapshot, null, 2)}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}