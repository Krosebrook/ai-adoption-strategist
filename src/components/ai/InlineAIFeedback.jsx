import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ThumbsUp, ThumbsDown, Star, Flag, 
  MessageSquare, X, CheckCircle 
} from 'lucide-react';
import { toast } from 'sonner';

export default function InlineAIFeedback({ 
  agentName, 
  prompt, 
  response, 
  usageLogId,
  conversationId,
  interactionType = 'chat',
  compact = false 
}) {
  const [showDetail, setShowDetail] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('');
  const [specificIssues, setSpecificIssues] = useState([]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const queryClient = useQueryClient();

  const feedbackMutation = useMutation({
    mutationFn: async (feedbackData) => {
      const user = await base44.auth.me();
      return base44.entities.AIFeedback.create({
        user_email: user.email,
        usage_log_id: usageLogId,
        agent_name: agentName,
        interaction_type: interactionType,
        context: {
          prompt,
          response,
          conversation_id: conversationId
        },
        ...feedbackData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['aiFeedback']);
      setSubmitted(true);
      toast.success('Feedback submitted - thank you!');
      setTimeout(() => {
        setShowDetail(false);
        setSubmitted(false);
      }, 2000);
    }
  });

  const handleQuickFeedback = (type, stars) => {
    setRating(stars);
    setFeedbackType(type);
    
    feedbackMutation.mutate({
      rating: stars,
      feedback_type: type,
      impact_level: stars < 3 ? 'high' : 'low'
    });
  };

  const handleDetailedSubmit = () => {
    if (!rating || !feedbackType) {
      toast.error('Please provide a rating and feedback type');
      return;
    }

    feedbackMutation.mutate({
      rating,
      feedback_type: feedbackType,
      specific_issues: specificIssues,
      comment,
      impact_level: rating < 3 ? 'high' : specificIssues.length > 0 ? 'medium' : 'low'
    });
  };

  const toggleIssue = (issue) => {
    setSpecificIssues(prev => 
      prev.includes(issue) 
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm py-2">
        <CheckCircle className="h-4 w-4" />
        <span>Thank you for your feedback!</span>
      </div>
    );
  }

  if (compact && !showDetail) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleQuickFeedback('helpful', 5)}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <ThumbsUp className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleQuickFeedback('needs_improvement', 2)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <ThumbsDown className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowDetail(true)}
          className="text-slate-600 hover:text-slate-700"
        >
          <MessageSquare className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Star className="h-4 w-4 text-orange-500" />
          Rate this response
        </h4>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setShowDetail(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Star Rating */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="transition-colors"
          >
            <Star 
              className={`h-6 w-6 ${
                star <= rating 
                  ? 'fill-orange-500 text-orange-500' 
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Feedback Type */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-700">What's your feedback?</p>
        <div className="flex flex-wrap gap-2">
          {['helpful', 'excellent', 'inaccurate', 'incomplete', 'biased', 'needs_improvement'].map(type => (
            <Badge
              key={type}
              variant={feedbackType === type ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFeedbackType(type)}
            >
              {type.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </div>

      {/* Specific Issues */}
      {feedbackType && ['inaccurate', 'incomplete', 'biased', 'needs_improvement'].includes(feedbackType) && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-700">Specific issues (optional):</p>
          <div className="flex flex-wrap gap-2">
            {['factual_error', 'outdated_info', 'tone_issue', 'bias_detected', 'unhelpful', 'too_long', 'off_topic'].map(issue => (
              <Badge
                key={issue}
                variant={specificIssues.includes(issue) ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => toggleIssue(issue)}
              >
                {issue.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Comment */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-700">
          Additional details (optional):
        </p>
        <Textarea
          placeholder="Tell us more about your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="text-sm"
          rows={3}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDetail(false)}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleDetailedSubmit}
          disabled={!rating || !feedbackType || feedbackMutation.isPending}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Submit Feedback
        </Button>
      </div>
    </div>
  );
}