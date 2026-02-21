import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Lightbulb } from 'lucide-react';

export default function OnboardingTooltip({ children, title, description, tips, side = "top" }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <div className="space-y-2">
            {title && (
              <div className="font-semibold text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                {title}
              </div>
            )}
            {description && (
              <p className="text-xs text-slate-600">{description}</p>
            )}
            {tips && tips.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1 text-xs font-semibold text-orange-700 mb-1">
                  <Lightbulb className="h-3 w-3" />
                  Quick Tips:
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  {tips.map((tip, idx) => (
                    <li key={idx}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}