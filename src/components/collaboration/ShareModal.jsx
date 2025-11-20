import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Share2, Loader2, X, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareModal({ isOpen, onClose, resourceType, resourceId, resourceName }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: shares = [] } = useQuery({
    queryKey: ['shares', resourceType, resourceId],
    queryFn: () => base44.entities.SharedResource.filter({ 
      resource_type: resourceType,
      resource_id: resourceId 
    }),
    enabled: isOpen && !!resourceId
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.SharedResource.create({
        resource_type: resourceType,
        resource_id: resourceId,
        owner_email: user.email,
        shared_with_email: email,
        permission,
        shared_at: new Date().toISOString(),
        message
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shares']);
      toast.success(`${resourceType} shared successfully!`);
      setEmail('');
      setMessage('');
    },
    onError: () => {
      toast.error('Failed to share resource');
    }
  });

  const removeMutation = useMutation({
    mutationFn: (shareId) => base44.entities.SharedResource.delete(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries(['shares']);
      toast.success('Access removed');
    }
  });

  const handleShare = () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    shareMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share "{resourceName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Form */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="permission">Permission Level</Label>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div>
                      <div className="font-medium">View Only</div>
                      <div className="text-xs text-slate-500">Can view but not modify</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="comment">
                    <div>
                      <div className="font-medium">Comment</div>
                      <div className="text-xs text-slate-500">Can view and add comments</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div>
                      <div className="font-medium">Edit</div>
                      <div className="text-xs text-slate-500">Can view, comment, and modify</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a note for your colleague..."
                className="mt-1"
                rows={3}
              />
            </div>

            <Button
              onClick={handleShare}
              disabled={shareMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {shareMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </div>

          {/* Current Shares */}
          {shares.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-slate-900 mb-3">
                People with access ({shares.length})
              </h3>
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm text-slate-900">
                        {share.shared_with_email}
                      </div>
                      {share.message && (
                        <p className="text-xs text-slate-600 mt-1">{share.message}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {share.permission}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMutation.mutate(share.id)}
                        disabled={removeMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}