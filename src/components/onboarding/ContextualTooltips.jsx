import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ContextualTooltips({ page, userAction }) {
  const [tooltip, setTooltip] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (userAction) {
      generateContextualHelp();
    }
  }, [userAction, page]);

  const generateContextualHelp = async () => {
    // Check if user has seen this tooltip before
    const seenTooltips = JSON.parse(localStorage.getItem('seenTooltips') || '{}');
    const tooltipKey = `${page}_${userAction}`;
    
    if (seenTooltips[tooltipKey]) {
      return; // Don't show again
    }

    try {
      const helpTexts = {
        'Assessment_start': 'Start by entering your organization details. The AI will analyze your needs and recommend the best platforms.',
        'PlatformCatalog_filter': 'Use filters to narrow down platforms by category, compliance, or ecosystem. Click on any platform to see detailed information.',
        'CustomDashboard_customize': 'Click "Customize" to add, remove, or rearrange widgets. Your dashboard will automatically save your preferences.',
        'PlatformComparison_compare': 'Select 2-4 platforms to compare side-by-side. The AI will generate insights highlighting pros, cons, and best fits.',
        'Training_start': 'Choose a training module to begin. Each module includes interactive exercises and a certification upon completion.',
        'Results_view': 'Review your AI recommendations here. The platform analyzed your requirements and scored each option based on fit.',
        'Settings_preferences': 'Customize your experience by setting notification preferences, ROI display units, and dashboard themes.'
      };

      const tooltipContent = helpTexts[tooltipKey] || await getAIHelp();
      
      setTooltip(tooltipContent);
      setShowTooltip(true);

      // Mark as seen
      seenTooltips[tooltipKey] = true;
      localStorage.setItem('seenTooltips', JSON.stringify(seenTooltips));

      // Auto-hide after 10 seconds
      setTimeout(() => setShowTooltip(false), 10000);
    } catch (error) {
      console.error('Error generating tooltip:', error);
    }
  };

  const getAIHelp = async () => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide a brief, helpful tooltip (max 2 sentences) for a user on the "${page}" page who just did this action: "${userAction}". 
      
      Make it actionable and specific to enterprise AI platform adoption context.`,
      add_context_from_internet: false
    });

    return typeof response === 'string' ? response : response.tooltip || 'Click for more information';
  };

  const dismissTooltip = () => {
    setShowTooltip(false);
  };

  if (!showTooltip || !tooltip) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        className="fixed bottom-20 right-6 z-50 max-w-sm"
      >
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-2xl p-4 border-2 border-blue-400">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                Quick Tip
                <Sparkles className="h-3 w-3" />
              </h4>
              <p className="text-sm text-blue-50">{tooltip}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissTooltip}
              className="text-white hover:bg-white/20 p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for using tooltips
export function useContextualTooltip(pageName) {
  const [userAction, setUserAction] = useState(null);

  const triggerTooltip = (action) => {
    setUserAction(action);
  };

  return {
    TooltipComponent: () => <ContextualTooltips page={pageName} userAction={userAction} />,
    triggerTooltip
  };
}