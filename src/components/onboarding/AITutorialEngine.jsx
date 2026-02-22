import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { Sparkles, ArrowRight, Check, X, Lightbulb, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AITutorialEngine({ feature, onComplete }) {
  const [tutorial, setTutorial] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});
  const [showTutorial, setShowTutorial] = useState(true);

  useEffect(() => {
    generateTutorial();
  }, [feature]);

  const generateTutorial = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create an interactive tutorial for the "${feature}" feature of an enterprise AI platform adoption tool.

User Context:
- Role: ${user.role || 'user'}
- Feature: ${feature}

Generate a step-by-step tutorial with:
1. 4-6 steps that progressively teach the feature
2. Each step should have a title, description, action, and tip
3. Include practical examples relevant to enterprise AI adoption
4. Make it engaging and easy to follow

Available features:
- AI Readiness Assessment: Evaluate organization's AI maturity
- Platform Comparison: Compare 70+ AI platforms side-by-side
- Dashboard Customization: Create personalized KPI dashboards
- ROI Simulator: Calculate potential returns on AI investment
- Training Modules: AI literacy training for teams`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            estimated_time: { type: 'string' },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  action: { type: 'string' },
                  tip: { type: 'string' },
                  key_points: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      });

      setTutorial(response);
      
      // Load user progress
      const savedProgress = localStorage.getItem(`tutorial_${feature}`);
      if (savedProgress) {
        setUserProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Error generating tutorial:', error);
      toast.error('Failed to load tutorial');
    } finally {
      setLoading(false);
    }
  };

  const markStepComplete = (stepIndex) => {
    const newProgress = { ...userProgress, [stepIndex]: true };
    setUserProgress(newProgress);
    localStorage.setItem(`tutorial_${feature}`, JSON.stringify(newProgress));
    
    if (stepIndex === tutorial.steps.length - 1) {
      toast.success('Tutorial completed! 🎉');
      setTimeout(() => {
        onComplete?.();
        setShowTutorial(false);
      }, 1500);
    }
  };

  const nextStep = () => {
    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    onComplete?.();
  };

  if (loading) {
    return (
      <Card className="border-2 border-orange-200">
        <CardContent className="py-8 text-center">
          <Sparkles className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Generating personalized tutorial...</p>
        </CardContent>
      </Card>
    );
  }

  if (!showTutorial || !tutorial) return null;

  const completedSteps = Object.values(userProgress).filter(Boolean).length;
  const progressPercentage = (completedSteps / tutorial.steps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-6 right-6 z-50 w-full max-w-md"
      >
        <Card className="border-2 border-orange-300 shadow-2xl bg-white">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{tutorial.title}</h3>
                  <p className="text-xs text-gray-500">{tutorial.estimated_time}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTutorial}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Step {currentStep + 1} of {tutorial.steps.length}
                </span>
                <span className="text-sm font-semibold text-orange-600">
                  {Math.round(progressPercentage)}% Complete
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Current Step */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">
                    {tutorial.steps[currentStep].title}
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    {tutorial.steps[currentStep].description}
                  </p>
                  
                  {tutorial.steps[currentStep].key_points && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          {tutorial.steps[currentStep].key_points.map((point, idx) => (
                            <p key={idx} className="text-xs text-blue-900">• {point}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-400">
                    <p className="text-sm font-medium text-orange-900 mb-1">Action:</p>
                    <p className="text-sm text-orange-800">{tutorial.steps[currentStep].action}</p>
                  </div>

                  {tutorial.steps[currentStep].tip && (
                    <div className="mt-3 bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-800">
                        <span className="font-semibold">💡 Tip:</span> {tutorial.steps[currentStep].tip}
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  
                  {!userProgress[currentStep] && (
                    <Button
                      size="sm"
                      onClick={() => markStepComplete(currentStep)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    onClick={nextStep}
                    disabled={currentStep === tutorial.steps.length - 1}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}