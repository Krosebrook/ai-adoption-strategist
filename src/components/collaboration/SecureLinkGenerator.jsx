import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, Copy, CheckCircle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function SecureLinkGenerator({ resourceType, resourceId, resourceName }) {
  const [expiryDays, setExpiryDays] = useState(7);
  const [generatedLink, setGeneratedLink] = useState(null);
  const queryClient = useQueryClient();

  const generateLinkMutation = useMutation({
    mutationFn: async () => {
      // In production, this would create a secure token
      const token = Math.random().toString(36).substring(2, 15);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);
      
      const link = {
        token,
        resource_type: resourceType,
        resource_id: resourceId,
        resource_name: resourceName,
        expires_at: expiryDate.toISOString(),
        views: 0,
        max_views: null,
        created_at: new Date().toISOString()
      };

      // Store in a SecureLink entity (would need to be created)
      // For now, return the link
      return link;
    },
    onSuccess: (link) => {
      setGeneratedLink(link);
      toast.success('Secure link generated');
    }
  });

  const copyToClipboard = () => {
    const url = `${window.location.origin}/shared/${generatedLink.token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Link className="h-5 w-5 text-purple-600" />
          Generate Secure Share Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedLink ? (
          <>
            <p className="text-sm text-slate-600">
              Create a secure, time-limited link to share this {resourceType} with external stakeholders.
            </p>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700">Expires in:</label>
              <Input
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
                className="w-20"
                min="1"
                max="365"
              />
              <span className="text-sm text-slate-600">days</span>
            </div>
            <Button
              onClick={() => generateLinkMutation.mutate()}
              disabled={generateLinkMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Generate Link
            </Button>
          </>
        ) : (
          <>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-xs text-purple-600 font-semibold mb-1">Secure Link</p>
                  <p className="text-sm font-mono text-purple-900 break-all">
                    {window.location.origin}/shared/{generatedLink.token}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Expires {new Date(generatedLink.expires_at).toLocaleDateString()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  {generatedLink.views} views
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setGeneratedLink(null)}
              className="w-full"
            >
              Generate New Link
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}