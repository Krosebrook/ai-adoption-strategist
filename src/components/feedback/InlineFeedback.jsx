import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, MessageSquare, X, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function InlineFeedback({ 
  assessmentId, 
  contentType, 
  contentId,
  onFeedbackSubmitted 
}) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Feedback.create({
        assessment_id: assessmentId,
        feedback_type: contentType,
        rating: data.rating,
        usefulness_score: data.rating === 'positive' ? 8 : 3,
        comments: data.feedback,
        context: {
          content_type: contentType,
          content_id: contentId,
          timestamp: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['allFeedback'] });
      toast.success('Feedback submitted - Thank you!');
      setTimeout(() => {
        setShowForm(false);
        setSubmitted(false);
        setRating(null);
        setFeedback('');
      }, 2000);
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    }
  });

  const handleRating = (ratingValue) => {
    setRating(ratingValue);
    if (ratingValue === 'positive') {
      submitFeedbackMutation.mutate({ rating: 5, feedback: '' });
    } else {
      setShowForm(true);
    }
  };

  const handleSubmitFeedback = () => {
    submitFeedbackMutation.mutate({ 
      rating: rating === 'positive' ? 5 : 2, 
      feedback 
    });
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm py-2">
        <Check className="h-4 w-4" />
        <span>Feedback received!</span>
      </div>
    );
  }

  if (!showForm && rating === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span>Was this helpful?</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRating('positive')}
          className="h-8 px-2 hover:text-green-600 hover:bg-green-50"
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRating('negative')}
          className="h-8 px-2 hover:text-red-600 hover:bg-red-50"
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <MessageSquare className="h-4 w-4" />
            Help us improve AI insights
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowForm(false);
              setRating(null);
            }}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What could be improved? (optional)"
          className="h-20 text-sm"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmitFeedback}
            disabled={submitFeedbackMutation.isPending}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            Submit
          </Button>
        </div>
      </div>
    );
  }

  return null;
}