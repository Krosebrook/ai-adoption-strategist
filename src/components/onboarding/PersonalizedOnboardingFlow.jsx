import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { Sparkles, CheckCircle2, ArrowRight, Target, Zap, BookOpen, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PersonalizedOnboardingFlow() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [onboardingPlan, setOnboardingPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTask, setCurrentTask] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    initializeOnboarding();
  }, []);

  const initializeOnboarding = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Check if onboarding is already complete
      const onboardingStatus = localStorage.getItem(`onboarding_${userData.email}`);
      if (onboardingStatus === 'completed') {
        setLoading(false);
        return;
      }

      // Check for saved progress
      const savedProgress = localStorage.getItem(`onboarding_progress_${userData.email}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setOnboardingPlan(progress.plan);
        setCompletedTasks(progress.completed || []);
        setCurrentTask(progress.currentTask || 0);
        setLoading(false);
        return;
      }

      // Generate AI-powered personalized onboarding plan
      await generateOnboardingPlan(userData);
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      setLoading(false);
    }
  };

  const generateOnboardingPlan = async (userData) => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a personalized onboarding plan for a new user of an enterprise AI platform adoption tool.

User Profile:
- Role: ${userData.role || 'user'}
- Email: ${userData.email}
- Name: ${userData.full_name || 'User'}

The platform helps organizations:
1. Assess AI readiness and maturity
2. Compare 70+ AI platforms (Claude, ChatGPT, Gemini, etc.)
3. Generate ROI projections
4. Create implementation roadmaps
5. Monitor governance and compliance
6. Train teams with personalized learning paths

Generate 4-6 onboarding tasks tailored to their role:
- Executives: Focus on ROI, strategy, executive dashboards
- Product Managers: Platform comparison, feature analysis, roadmaps
- Analysts: Data analysis, reports, metrics
- General Users: Basic assessment, platform exploration, training

Each task should include:
- Title
- Description
- Page to visit
- Estimated time
- Priority (high/medium/low)
- Icon name (Target, Zap, BookOpen, BarChart3, CheckCircle2)`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            welcome_message: { type: 'string' },
            role_specific_intro: { type: 'string' },
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  page: { type: 'string' },
                  estimated_time: { type: 'string' },
                  priority: { type: 'string' },
                  icon: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setOnboardingPlan(response);
      saveProgress(response, [], 0);
    } catch (error) {
      console.error('Error generating onboarding plan:', error);
      toast.error('Failed to generate onboarding plan');
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = (plan, completed, current) => {
    if (!user) return;
    const progress = {
      plan,
      completed,
      currentTask: current
    };
    localStorage.setItem(`onboarding_progress_${user.email}`, JSON.stringify(progress));
  };

  const completeTask = (taskIndex) => {
    const newCompleted = [...completedTasks, taskIndex];
    setCompletedTasks(newCompleted);
    saveProgress(onboardingPlan, newCompleted, taskIndex + 1);
    
    if (newCompleted.length === onboardingPlan.tasks.length) {
      localStorage.setItem(`onboarding_${user.email}`, 'completed');
      toast.success('🎉 Onboarding completed! Welcome aboard!');
    } else {
      toast.success('Task completed!');
    }
  };

  const goToTask = (task, index) => {
    if (task.page) {
      navigate(createPageUrl(task.page));
      setTimeout(() => completeTask(index), 3000); // Auto-complete after visiting
    }
  };

  const skipOnboarding = () => {
    if (!user) return;
    localStorage.setItem(`onboarding_${user.email}`, 'completed');
    toast.info('Onboarding skipped');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Creating your personalized onboarding...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!onboardingPlan || localStorage.getItem(`onboarding_${user?.email}`) === 'completed') {
    return null;
  }

  const progress = (completedTasks.length / onboardingPlan.tasks.length) * 100;

  const iconMap = {
    Target,
    Zap,
    BookOpen,
    BarChart3,
    CheckCircle2,
    Sparkles
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl"
      >
        <Card className="border-2 border-orange-300 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">
                  Welcome, {user?.full_name || 'User'}! 👋
                </CardTitle>
                <p className="text-orange-100 text-sm">{onboardingPlan.welcome_message}</p>
              </div>
              <Button
                variant="ghost"
                onClick={skipOnboarding}
                className="text-white hover:bg-white/20"
              >
                Skip
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Role-specific intro */}
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm text-blue-900">{onboardingPlan.role_specific_intro}</p>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Your Progress: {completedTasks.length} of {onboardingPlan.tasks.length} completed
                </span>
                <span className="text-sm text-orange-600 font-bold">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Your Personalized Onboarding Path</h3>
              <AnimatePresence>
                {onboardingPlan.tasks.map((task, index) => {
                  const isCompleted = completedTasks.includes(index);
                  const Icon = iconMap[task.icon] || Target;
                  const priorityColors = {
                    high: 'bg-red-100 text-red-700 border-red-200',
                    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    low: 'bg-green-100 text-green-700 border-green-200'
                  };

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`transition-all ${isCompleted ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-orange-100'}`}>
                              {isCompleted ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                              ) : (
                                <Icon className="h-6 w-6 text-orange-600" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{task.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                </div>
                                <Badge className={priorityColors[task.priority] || 'bg-gray-100'}>
                                  {task.priority}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-3 mt-3">
                                <span className="text-xs text-gray-500">⏱️ {task.estimated_time}</span>
                                {!isCompleted && (
                                  <Button
                                    size="sm"
                                    onClick={() => goToTask(task, index)}
                                    className="bg-orange-500 hover:bg-orange-600"
                                  >
                                    Start
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}