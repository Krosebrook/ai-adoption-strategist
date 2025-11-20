import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Loader2, CheckCircle2, Reply } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '../utils/formatters';

export default function CommentsPanel({ resourceType, resourceId, section = null }) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', resourceType, resourceId, section],
    queryFn: async () => {
      const filter = { 
        resource_type: resourceType,
        resource_id: resourceId 
      };
      if (section) filter.section = section;
      return await base44.entities.Comment.filter(filter, '-created_date');
    },
    enabled: !!resourceId
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content) => {
      return await base44.entities.Comment.create({
        resource_type: resourceType,
        resource_id: resourceId,
        author_email: user.email,
        author_name: user.full_name,
        content,
        section,
        parent_comment_id: replyingTo?.id,
        resolved: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      setNewComment('');
      setReplyingTo(null);
      toast.success('Comment added');
    },
    onError: () => {
      toast.error('Failed to add comment');
    }
  });

  const resolveMutation = useMutation({
    mutationFn: (commentId) => base44.entities.Comment.update(commentId, { resolved: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      toast.success('Comment marked as resolved');
    }
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  const topLevelComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (commentId) => comments.filter(c => c.parent_comment_id === commentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Comments & Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="space-y-2">
          {replyingTo && (
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 p-2 rounded">
              <Reply className="h-3 w-3" />
              Replying to {replyingTo.author_name}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
                className="ml-auto h-6 px-2"
              >
                Cancel
              </Button>
            </div>
          )}
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment or ask a question..."
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={addCommentMutation.isPending || !newComment.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {addCommentMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Post Comment
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-4 mt-6">
          {topLevelComments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No comments yet. Start the conversation!</p>
            </div>
          ) : (
            topLevelComments.map((comment) => {
              const replies = getReplies(comment.id);
              return (
                <div key={comment.id} className="space-y-2">
                  <div className={`p-4 rounded-lg border ${
                    comment.resolved ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-sm text-slate-900">
                          {comment.author_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDate(comment.created_date, { format: 'long' })}
                          {comment.section && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {comment.section}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!comment.resolved && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(comment)}
                            className="h-7 px-2 text-xs"
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resolveMutation.mutate(comment.id)}
                            className="h-7 px-2 text-xs"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      )}
                      {comment.resolved && (
                        <Badge className="bg-green-100 text-green-800">
                          Resolved
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>

                  {/* Replies */}
                  {replies.length > 0 && (
                    <div className="ml-8 space-y-2">
                      {replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="font-semibold text-sm text-slate-900">
                              {reply.author_name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDate(reply.created_date, { format: 'long' })}
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}