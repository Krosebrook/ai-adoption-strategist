import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, AlertCircle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Platform Feedback Collector Component
 * Allows users to provide explicit feedback on AI platform recommendations
 * Feeds into reinforcement learning system for improved future recommendations
 */

export default function PlatformFeedbackCollector({ platform, assessmentId, onClose }) {
  const [feedbackType, setFeedbackType] = useState(null);
  const [missingFeatures, setMissingFeatures] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const queryClient = useQueryClient();

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData) => {
      return await base44.entities.Feedback.create(feedbackData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['feedback']);
      toast.success('Feedback submitted! This helps improve future recommendations.');
      if (onClose) onClose();
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    }
  });

  const handleSubmit = () => {
    if (!feedbackType) {
      toast.error('Please select a feedback type');
      return;
    }

    const feedbackData = {
      assessment_id: assessmentId,
      feedback_type: 'platform_recommendation',
      platform_specific: platform.platform_name,
      recommendation_accurate: feedbackType === 'good_fit',
      rating: feedbackType === 'good_fit' ? 5 : feedbackType === 'poor_fit' ? 2 : 3,
      missing_features: missingFeatures ? [missingFeatures] : [],
      comments: additionalComments || undefined,
      context: {
        platform_id: platform.platform,
        platform_score: platform.score,
        feedback_category: feedbackType,
        roi_score: platform.roi_score,
        compliance_score: platform.compliance_score,
        integration_score: platform.integration_score
      }
    };

    submitFeedbackMutation.mutate(feedbackData);
  };

  const feedbackOptions = [
    {
      id: 'good_fit',
      label: 'Good Fit',
      icon: ThumbsUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      description: 'This platform is a great match for our needs'
    },
    {
      id: 'poor_fit',
      label: 'Poor Fit',
      icon: ThumbsDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      description: 'This platform doesn\'t meet our requirements'
    },
    {
      id: 'missing_feature',
      label: 'Missing Key Feature',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      description: 'Close, but lacks critical functionality'
    }
  ];

  return (
    <Card className="border-2 border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Rate: {platform.platform_name}
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Your feedback helps improve future recommendations
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Platform Score Display */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <span className="text-sm text-slate-600">Current Match Score</span>
          <Badge className="bg-blue-600 text-white">
            {platform.score.toFixed(1)}/100
          </Badge>
        </div>

        {/* Feedback Type Selection */}
        <div>
          <label className="text-sm font-medium text-slate-900 mb-3 block">
            How well does this platform fit your needs?
          </label>
          <div className="grid grid-cols-1 gap-3">
            {feedbackOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = feedbackType === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setFeedbackType(option.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected 
                      ? `${option.bgColor} ${option.borderColor} shadow-md` 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? option.color : 'text-slate-400'}`} />
                    <div>
                      <div className="font-medium text-slate-900">{option.label}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{option.description}</div>
                    </div>
                    {isSelected && (
                      <CheckCircle className={`h-5 w-5 ml-auto ${option.color}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Missing Features Input */}
        {feedbackType === 'missing_feature' && (
          <div>
            <label className="text-sm font-medium text-slate-900 mb-2 block">
              What key feature is missing?
            </label>
            <Textarea
              value={missingFeatures}
              onChange={(e) => setMissingFeatures(e.target.value)}
              placeholder="e.g., 'Lacks integration with our ERP system', 'No support for on-premise deployment'"
              rows={2}
              className="resize-none"
            />
          </div>
        )}

        {/* Additional Comments */}
        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">
            Additional Comments (Optional)
          </label>
          <Textarea
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            placeholder="Share any other thoughts about this recommendation..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!feedbackType || submitFeedbackMutation.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {submitFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Skip
            </Button>
          )}
        </div>

        {/* Info Message */}
        <div className="text-xs text-slate-500 text-center">
          Your feedback is analyzed using AI to continuously improve recommendation accuracy
        </div>
      </CardContent>
    </Card>
  );
}