import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, Loader2, X, CheckCircle2, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function FeedbackModal({ isOpen, onClose, assessmentId, feedbackType = 'general', context = {} }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [usefulness, setUsefulness] = useState('');
  const [comments, setComments] = useState('');
  const [missingFeatures, setMissingFeatures] = useState('');
  const [recommendationAccurate, setRecommendationAccurate] = useState(null);
  const [riskAccurate, setRiskAccurate] = useState(null);
  const [roiRealistic, setRoiRealistic] = useState(null);

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData) => {
      return await base44.entities.Feedback.create(feedbackData);
    },
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
      resetForm();
      onClose();
    },
    onError: () => {
      toast.error('Failed to submit feedback. Please try again.');
    }
  });

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setUsefulness('');
    setComments('');
    setMissingFeatures('');
    setRecommendationAccurate(null);
    setRiskAccurate(null);
    setRoiRealistic(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    const feedbackData = {
      assessment_id: assessmentId || null,
      rating: rating,
      usefulness_score: parseInt(usefulness) || null,
      feedback_type: feedbackType,
      platform_specific: context.platform || null,
      recommendation_accurate: recommendationAccurate,
      risk_assessment_accurate: riskAccurate,
      roi_realistic: roiRealistic,
      missing_features: missingFeatures ? missingFeatures.split('\n').filter(f => f.trim()) : [],
      comments: comments,
      context: context
    };

    submitFeedbackMutation.mutate(feedbackData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">Share Your Feedback</DialogTitle>
          <DialogDescription className="text-slate-600">
            Help us improve the Enterprise AI Assessment Tool by sharing your experience
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">
              Overall Experience *
            </Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm font-medium text-slate-700">
                  {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                </span>
              )}
            </div>
          </div>

          {/* Specific Feedback Questions */}
          {feedbackType === 'platform_recommendation' && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-slate-700 font-medium">Recommendation Accuracy</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={recommendationAccurate === true ? 'default' : 'outline'}
                  onClick={() => setRecommendationAccurate(true)}
                  className={recommendationAccurate === true ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Accurate
                </Button>
                <Button
                  type="button"
                  variant={recommendationAccurate === false ? 'default' : 'outline'}
                  onClick={() => setRecommendationAccurate(false)}
                  className={recommendationAccurate === false ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Not Accurate
                </Button>
              </div>
            </div>
          )}

          {feedbackType === 'risk_assessment' && (
            <div className="space-y-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <Label className="text-slate-700 font-medium">Risk Assessment Accuracy</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={riskAccurate === true ? 'default' : 'outline'}
                  onClick={() => setRiskAccurate(true)}
                  className={riskAccurate === true ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Accurate
                </Button>
                <Button
                  type="button"
                  variant={riskAccurate === false ? 'default' : 'outline'}
                  onClick={() => setRiskAccurate(false)}
                  className={riskAccurate === false ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Not Accurate
                </Button>
              </div>
            </div>
          )}

          {feedbackType === 'roi_accuracy' && (
            <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <Label className="text-slate-700 font-medium">ROI Projections</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={roiRealistic === true ? 'default' : 'outline'}
                  onClick={() => setRoiRealistic(true)}
                  className={roiRealistic === true ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Realistic
                </Button>
                <Button
                  type="button"
                  variant={roiRealistic === false ? 'default' : 'outline'}
                  onClick={() => setRoiRealistic(false)}
                  className={roiRealistic === false ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Unrealistic
                </Button>
              </div>
            </div>
          )}

          {/* Usefulness Score */}
          <div className="space-y-2">
            <Label htmlFor="usefulness" className="text-slate-700 font-medium">
              How useful was this tool? (1-10)
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="usefulness"
                type="number"
                min="1"
                max="10"
                value={usefulness}
                onChange={(e) => setUsefulness(e.target.value)}
                placeholder="Rate from 1 to 10"
                className="max-w-xs"
              />
              {usefulness && (
                <div className="flex-1">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-green-500 transition-all duration-300"
                      style={{ width: `${(parseInt(usefulness) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="text-slate-700 font-medium">
              Comments
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us about your experience, what worked well, and what could be improved..."
              className="min-h-24 resize-y"
            />
          </div>

          {/* Missing Features */}
          <div className="space-y-2">
            <Label htmlFor="missing_features" className="text-slate-700 font-medium">
              Missing Features or Suggestions
            </Label>
            <Textarea
              id="missing_features"
              value={missingFeatures}
              onChange={(e) => setMissingFeatures(e.target.value)}
              placeholder="One feature per line, e.g.:&#10;Industry-specific benchmarks&#10;Cost comparison calculator&#10;Custom integration builder"
              className="min-h-24 resize-y font-mono text-sm"
            />
            <p className="text-xs text-slate-500">Enter each feature on a new line</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={submitFeedbackMutation.isPending}
              className="border-slate-300"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitFeedbackMutation.isPending || rating === 0}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {submitFeedbackMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}