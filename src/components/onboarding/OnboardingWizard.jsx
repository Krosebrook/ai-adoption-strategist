import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, ArrowRight, CheckCircle, Circle, 
  Lightbulb, Target, BookOpen, X, ChevronRight
} from 'lucide-react';
import { generateOnboardingFlow } from './OnboardingEngine';
import { toast } from 'sonner';

export default function OnboardingWizard({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  // Fetch user
  useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      return currentUser;
    }
  });

  // Fetch existing onboarding flow
  const { data: onboardingFlow, isLoading } = useQuery({
    queryKey: ['onboardingFlow', user?.email],
    queryFn: async () => {
      const flows = await base44.entities.OnboardingFlow.filter({ user_email: user.email });
      return flows[0];
    },
    enabled: !!user
  });

  // Fetch latest assessment
  const { data: assessments = [] } = useQuery({
    queryKey: ['latestAssessment'],
    queryFn: () => base44.entities.Assessment.list('-created_date', 1),
    initialData: []
  });

  const createFlowMutation = useMutation({
    mutationFn: (data) => base44.entities.OnboardingFlow.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboardingFlow'] })
  });

  const updateFlowMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.OnboardingFlow.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboardingFlow'] })
  });

  const handleStartOnboarding = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      const flow = await generateOnboardingFlow(user, assessments[0]);
      await createFlowMutation.mutateAsync(flow);
      toast.success('Personalized onboarding created!');
    } catch (error) {
      toast.error('Failed to create onboarding');
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteStep = async (stepIndex) => {
    if (!onboardingFlow) return;

    const newProgress = {
      ...onboardingFlow.progress,
      steps_completed: Math.max(onboardingFlow.progress.steps_completed, stepIndex + 1)
    };

    await updateFlowMutation.mutateAsync({
      id: onboardingFlow.id,
      data: { 
        progress: newProgress,
        status: newProgress.steps_completed >= newProgress.total_steps ? 'completed' : 'in_progress'
      }
    });

    if (stepIndex < (onboardingFlow.personalized_path?.recommended_first_steps?.length || 0) - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const handleExploreModule = async (moduleName) => {
    if (!onboardingFlow) return;

    const explored = onboardingFlow.progress?.modules_explored || [];
    if (!explored.includes(moduleName)) {
      await updateFlowMutation.mutateAsync({
        id: onboardingFlow.id,
        data: {
          progress: {
            ...onboardingFlow.progress,
            modules_explored: [...explored, moduleName]
          }
        }
      });
    }
  };

  const progressPercent = onboardingFlow 
    ? (onboardingFlow.progress?.steps_completed / onboardingFlow.progress?.total_steps) * 100 
    : 0;

  // No onboarding yet - show start screen
  if (!onboardingFlow && !isLoading) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to AI Decision Platform!</CardTitle>
          <p className="text-slate-600 mt-2">
            Let's create a personalized onboarding experience just for you
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-slate-700">
              Our AI will analyze your role and context to recommend the best features and learning path for your AI adoption journey.
            </p>
          </div>
          <Button
            onClick={handleStartOnboarding}
            disabled={generating}
            className="bg-purple-600 hover:bg-purple-700 px-8"
          >
            {generating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Creating Your Journey...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Start Personalized Onboarding
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!onboardingFlow) return null;

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Your AI Adoption Journey
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              {onboardingFlow.personalized_path?.welcome_message}
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium">{onboardingFlow.progress?.steps_completed}/{onboardingFlow.progress?.total_steps} steps</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Priority Goals */}
        {onboardingFlow.personalized_path?.priority_goals?.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              Your Priority Goals
            </h4>
            <div className="flex flex-wrap gap-2">
              {onboardingFlow.personalized_path.priority_goals.map((goal, idx) => (
                <Badge key={idx} variant="outline" className="bg-purple-50">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Steps */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Recommended First Steps
          </h4>
          <div className="space-y-2">
            {onboardingFlow.personalized_path?.recommended_first_steps?.map((step, idx) => {
              const isCompleted = idx < (onboardingFlow.progress?.steps_completed || 0);
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isCurrent ? 'border-purple-300 bg-purple-50' :
                    isCompleted ? 'border-green-200 bg-green-50' :
                    'border-slate-200'
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-600' :
                    isCurrent ? 'bg-purple-600' :
                    'bg-slate-200'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-xs font-bold text-white">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{step.step}</div>
                    <div className="text-sm text-slate-600">{step.description}</div>
                  </div>
                  {!isCompleted && (
                    <Link to={createPageUrl(step.feature)}>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteStep(idx)}
                        className={isCurrent ? 'bg-purple-600 hover:bg-purple-700' : ''}
                        variant={isCurrent ? 'default' : 'outline'}
                      >
                        {isCurrent ? 'Start' : 'Go'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Suggested Modules */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            Recommended Features for You
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {onboardingFlow.suggested_modules?.slice(0, 4).map((module, idx) => {
              const explored = onboardingFlow.progress?.modules_explored?.includes(module.module_name);

              return (
                <Link
                  key={idx}
                  to={createPageUrl(module.page)}
                  onClick={() => handleExploreModule(module.module_name)}
                >
                  <div className={`p-3 rounded-lg border hover:shadow-md transition-all ${
                    explored ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:border-blue-300'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900">{module.module_name}</span>
                      {explored && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                    <p className="text-xs text-slate-600">{module.description}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {module.relevance}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        {onboardingFlow.interactive_tips?.filter(t => !t.completed).slice(0, 2).map((tip, idx) => (
          <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-amber-900">Tip: {tip.element}</div>
                <div className="text-sm text-amber-800">{tip.message}</div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}