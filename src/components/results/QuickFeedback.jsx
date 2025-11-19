import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import FeedbackModal from '../feedback/FeedbackModal';

export default function QuickFeedback({ assessmentId, feedbackType, context, label = "Was this helpful?" }) {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [quickResponse, setQuickResponse] = useState(null);

  const handleQuickFeedback = (isPositive) => {
    setQuickResponse(isPositive);
    // Could auto-submit simple feedback here if needed
  };

  return (
    <>
      <div className="flex items-center gap-3 py-2">
        <span className="text-sm text-slate-600">{label}</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickFeedback(true)}
            className={`border-slate-300 ${quickResponse === true ? 'bg-green-50 border-green-500' : ''}`}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickFeedback(false)}
            className={`border-slate-300 ${quickResponse === false ? 'bg-red-50 border-red-500' : ''}`}
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFeedbackModalOpen(true)}
            className="border-slate-300"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Details
          </Button>
        </div>
      </div>

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        assessmentId={assessmentId}
        feedbackType={feedbackType}
        context={context}
      />
    </>
  );
}