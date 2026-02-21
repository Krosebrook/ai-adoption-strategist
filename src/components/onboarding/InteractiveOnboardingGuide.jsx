import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { X, ChevronRight, ChevronLeft, Play, CheckCircle, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function InteractiveOnboardingGuide() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Check if user has completed onboarding
        const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${userData.email}`);
        
        if (!hasCompletedOnboarding) {
          // Show onboarding after a brief delay
          setTimeout(() => setIsOpen(true), 1000);
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
      }
    };

    checkOnboarding();
  }, []);

  const steps = [
    {
      title: "Welcome to INT Inc. AI Platform",
      description: "Your comprehensive AI adoption assessment and planning tool",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-orange-600" />
              <p className="text-sm text-slate-600">Welcome Video Tutorial</p>
              <Button variant="outline" className="mt-2">
                <Play className="h-4 w-4 mr-2" />
                Watch 2-min Overview
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-700">
              <strong>What you'll learn in this guide:</strong>
            </p>
            <ul className="text-sm text-slate-600 space-y-1 ml-4">
              <li>• Explore 75+ AI platforms in our catalog</li>
              <li>• Run comprehensive assessments for your organization</li>
              <li>• Compare platforms side-by-side</li>
              <li>• Generate automated strategies and training plans</li>
            </ul>
          </div>
        </div>
      ),
      action: null
    },
    {
      title: "Discover AI Platforms",
      description: "Browse 75+ platforms across Foundation, Enterprise, Developer, and Specialized categories",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="h-12 w-12 mx-auto mb-3 text-purple-600" />
              <p className="text-sm text-slate-600">Platform Catalog Tutorial (1:30)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-semibold text-sm text-blue-900">Filter & Search</div>
              <p className="text-xs text-blue-700 mt-1">Find platforms by category, tier, and ecosystem</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-semibold text-sm text-green-900">Compare</div>
              <p className="text-xs text-green-700 mt-1">Select up to 4 platforms for side-by-side comparison</p>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-800">
              <strong>💡 Pro Tip:</strong> Use filters to narrow down platforms based on your compliance needs (HIPAA, SOC2, GDPR)
            </p>
          </div>
        </div>
      ),
      action: {
        label: "Explore Catalog",
        onClick: () => {
          navigate(createPageUrl('PlatformCatalog'));
          markStepComplete(1);
          setIsOpen(false);
        }
      }
    },
    {
      title: "Run an Assessment",
      description: "Get personalized AI platform recommendations based on your organization's needs",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="h-12 w-12 mx-auto mb-3 text-indigo-600" />
              <p className="text-sm text-slate-600">Assessment Wizard Tutorial (2:00)</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Assessment Process:</p>
            <div className="space-y-2">
              {['Organization Details', 'Business Goals', 'Technical Requirements', 'Budget & Compliance', 'Get AI-Powered Recommendations'].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-slate-600">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Pro Tip:</strong> The more details you provide, the more accurate your recommendations will be
            </p>
          </div>
        </div>
      ),
      action: {
        label: "Start Assessment",
        onClick: () => {
          navigate(createPageUrl('Assessment'));
          markStepComplete(2);
          setIsOpen(false);
        }
      }
    },
    {
      title: "Compare Platforms",
      description: "See detailed side-by-side comparisons of features, pricing, and capabilities",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="h-12 w-12 mx-auto mb-3 text-pink-600" />
              <p className="text-sm text-slate-600">Comparison Matrix Tutorial (1:45)</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Compare:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Pricing & ROI</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Features & Capabilities</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Compliance Certifications</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Integration Options</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Deployment Models</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Strengths & Limitations</span>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-xs text-purple-800">
              <strong>💡 Pro Tip:</strong> Export comparison reports as PDF for stakeholder presentations
            </p>
          </div>
        </div>
      ),
      action: {
        label: "View Demo Comparison",
        onClick: () => {
          markStepComplete(3);
          setIsOpen(false);
          toast.info('Select platforms from the catalog to start comparing');
        }
      }
    },
    {
      title: "Your Personalized Dashboard",
      description: "Access all your assessments, strategies, and insights in one place",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="h-12 w-12 mx-auto mb-3 text-teal-600" />
              <p className="text-sm text-slate-600">Dashboard Overview (1:15)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-semibold text-sm">Analytics</div>
              <p className="text-xs text-slate-600 mt-1">Track ROI and adoption metrics</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-semibold text-sm">Training</div>
              <p className="text-xs text-slate-600 mt-1">Personalized learning paths</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-semibold text-sm">Governance</div>
              <p className="text-xs text-slate-600 mt-1">Risk & compliance monitoring</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-semibold text-sm">Reports</div>
              <p className="text-xs text-slate-600 mt-1">Automated insights & exports</p>
            </div>
          </div>
        </div>
      ),
      action: {
        label: "Go to Dashboard",
        onClick: () => {
          navigate(createPageUrl('CustomDashboard'));
          markStepComplete(4);
          setIsOpen(false);
        }
      }
    },
    {
      title: "You're All Set! 🎉",
      description: "Start exploring and making data-driven AI adoption decisions",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Ready to Get Started!</h3>
            <p className="text-sm opacity-90">
              You now know the basics. Explore at your own pace.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Quick Links:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigate(createPageUrl('PlatformCatalog'));
                  handleComplete();
                }}
              >
                Platform Catalog
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigate(createPageUrl('Assessment'));
                  handleComplete();
                }}
              >
                Start Assessment
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigate(createPageUrl('Training'));
                  handleComplete();
                }}
              >
                Training Modules
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigate(createPageUrl('Documentation'));
                  handleComplete();
                }}
              >
                Full Documentation
              </Button>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Need help?</strong> Access this guide anytime from Settings → Onboarding Guide
            </p>
          </div>
        </div>
      ),
      action: {
        label: "Complete Onboarding",
        onClick: handleComplete
      }
    }
  ];

  function markStepComplete(stepIndex) {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  }

  function handleComplete() {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.email}`, 'true');
      toast.success('Onboarding completed! Welcome aboard! 🚀');
    }
    setIsOpen(false);
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
                {completedSteps.includes(currentStep) && (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-2xl">{steps[currentStep].title}</DialogTitle>
              <p className="text-sm text-slate-600 mt-1">{steps[currentStep].description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="mt-4" />
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="py-4"
          >
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep
                    ? 'bg-orange-600'
                    : idx < currentStep || completedSteps.includes(idx)
                    ? 'bg-green-500'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => {
                markStepComplete(currentStep);
                setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {steps[currentStep].action?.label || 'Next'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={steps[currentStep].action?.onClick || handleComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              {steps[currentStep].action?.label || 'Finish'}
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {steps[currentStep].action && currentStep < steps.length - 1 && (
          <div className="text-center pt-2 border-t mt-2">
            <Button
              variant="link"
              onClick={steps[currentStep].action.onClick}
              className="text-orange-600"
            >
              {steps[currentStep].action.label}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}