import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, ChevronRight, X, Sparkles, 
  Target, BookOpen, ArrowRight, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { generateContextualGuidance } from './ContextualGuidanceEngine';
import { toast } from 'sonner';

export default function ContextualGuidancePanel({ currentPage, minimized = false }) {
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(!minimized);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: onboardingFlow } = useQuery({
    queryKey: ['onboardingFlow', user?.email],
    queryFn: async () => {
      const flows = await base44.entities.OnboardingFlow.filter({ user_email: user.email });
      return flows[0];
    },
    enabled: !!user
  });

  const loadGuidance = async () => {
    if (!user || !currentPage) return;
    
    setLoading(true);
    try {
      const result = await generateContextualGuidance(
        currentPage,
        user.role || 'user',
        onboardingFlow?.progress,
        []
      );
      setGuidance(result);
    } catch (error) {
      console.error('Failed to load guidance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage && user && !guidance) {
      loadGuidance();
    }
  }, [currentPage, user]);

  if (dismissed) return null;

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-40"
        style={{ background: 'linear-gradient(135deg, #E88A1D, #D07612)' }}
      >
        <HelpCircle className="h-6 w-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 overflow-auto bg-white rounded-xl shadow-xl border z-40" style={{ borderColor: 'var(--color-border)' }}>
      <div className="sticky top-0 bg-white border-b p-3 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: '#E88A1D' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>AI Assistant</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(false)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDismissed(true)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {loading ? (
          <div className="text-center py-4">
            <Sparkles className="h-6 w-6 animate-spin mx-auto mb-2" style={{ color: '#E88A1D' }} />
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Loading guidance...</p>
          </div>
        ) : guidance ? (
          <>
            {/* Contextual Tip */}
            {guidance.contextual_tip && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-900">{guidance.contextual_tip.title}</h4>
                    <p className="text-xs text-amber-800 mt-1">{guidance.contextual_tip.message}</p>
                    {guidance.contextual_tip.action_target && (
                      <Link to={createPageUrl(guidance.contextual_tip.action_target)}>
                        <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
                          {guidance.contextual_tip.action_label}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {guidance.proactive_suggestions?.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
                  <Target className="h-3 w-3" /> Suggestions
                </h5>
                <div className="space-y-2">
                  {guidance.proactive_suggestions.slice(0, 2).map((s, idx) => (
                    <div key={idx} className="bg-slate-50 rounded p-2">
                      <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{s.suggestion}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{s.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unexplored Features */}
            {guidance.unexplored_features?.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
                  <BookOpen className="h-3 w-3" /> Explore
                </h5>
                <div className="flex flex-wrap gap-1">
                  {guidance.unexplored_features.slice(0, 3).map((f, idx) => (
                    <Link key={idx} to={createPageUrl(f.page)}>
                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-100">
                        {f.feature}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <Button onClick={loadGuidance} className="w-full" size="sm" style={{ background: '#E88A1D' }}>
            <Sparkles className="h-4 w-4 mr-2" />
            Get AI Guidance
          </Button>
        )}
      </div>
    </div>
  );
}