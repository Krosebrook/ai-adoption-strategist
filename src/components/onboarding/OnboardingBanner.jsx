import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, X, ChevronDown, ChevronUp } from 'lucide-react';
import OnboardingWizard from './OnboardingWizard';

export default function OnboardingBanner() {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [user, setUser] = useState(null);

  useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      return currentUser;
    }
  });

  const { data: onboardingFlow } = useQuery({
    queryKey: ['onboardingFlow', user?.email],
    queryFn: async () => {
      const flows = await base44.entities.OnboardingFlow.filter({ user_email: user.email });
      return flows[0];
    },
    enabled: !!user
  });

  // Don't show if dismissed or completed
  if (dismissed || onboardingFlow?.status === 'completed') return null;

  const progressPercent = onboardingFlow 
    ? (onboardingFlow.progress?.steps_completed / onboardingFlow.progress?.total_steps) * 100 
    : 0;

  if (expanded) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
          <OnboardingWizard onClose={() => setExpanded(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sparkles className="h-5 w-5" />
          <div>
            <span className="font-medium">
              {onboardingFlow 
                ? `Continue your AI adoption journey (${onboardingFlow.progress?.steps_completed}/${onboardingFlow.progress?.total_steps} steps)`
                : 'Welcome! Start your personalized AI adoption journey'}
            </span>
          </div>
          {onboardingFlow && (
            <div className="hidden md:block w-32">
              <Progress value={progressPercent} className="h-2 bg-white/30" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExpanded(true)}
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            {onboardingFlow ? 'Continue' : 'Get Started'}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}