import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, GraduationCap, Sparkles, BookOpen, BarChart3, Plus } from 'lucide-react';
import { generateTrainingModule, generateProgressFeedback, analyzeSkillGaps } from '../components/training/TrainingContentGenerator';
import InteractiveTrainingViewer from '../components/training/InteractiveTrainingViewer';
import ProgressTracker from '../components/training/ProgressTracker';
import { toast } from 'sonner';

export default function TrainingPage() {
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
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

  // Fetch assessments
  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.filter({ status: 'completed' }, '-created_date', 50),
    initialData: []
  });

  // Fetch training modules
  const { data: modules = [] } = useQuery({
    queryKey: ['trainingModules'],
    queryFn: () => base44.entities.TrainingModule.list('-created_date', 100),
    initialData: []
  });

  // Fetch user's progress
  const { data: progressData = [] } = useQuery({
    queryKey: ['trainingProgress', user?.email],
    queryFn: () => user ? base44.entities.TrainingProgress.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: []
  });

  const createModuleMutation = useMutation({
    mutationFn: (moduleData) => base44.entities.TrainingModule.create(moduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingModules'] });
      toast.success('Training module created!');
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TrainingProgress.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingProgress'] });
    }
  });

  const createProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.TrainingProgress.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingProgress'] });
    }
  });

  const handleGenerateModule = async () => {
    if (!selectedAssessment || !selectedRole || !selectedPlatform) {
      toast.error('Please select assessment, role, and platform');
      return;
    }

    setGenerating(true);
    try {
      const moduleData = await generateTrainingModule(selectedAssessment, selectedPlatform, selectedRole);
      await createModuleMutation.mutateAsync(moduleData);
    } catch (error) {
      toast.error('Failed to generate training module');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnalyzeSkillGaps = async () => {
    if (!selectedAssessment || !selectedRole) {
      toast.error('Please select assessment and role');
      return;
    }

    setGenerating(true);
    try {
      const gaps = await analyzeSkillGaps(selectedAssessment, selectedRole);
      setSkillGaps(gaps);
      toast.success('Skill gap analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze skill gaps');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartModule = async (module) => {
    const existingProgress = progressData.find(p => p.module_id === module.id);
    
    if (!existingProgress) {
      await createProgressMutation.mutateAsync({
        user_email: user.email,
        module_id: module.id,
        status: 'in_progress',
        started_at: new Date().toISOString()
      });
    }
    
    setActiveModule(module);
  };

  const handleProgressUpdate = async (updates) => {
    if (!activeModule || !user) return;

    const existingProgress = progressData.find(p => p.module_id === activeModule.id);
    
    if (existingProgress) {
      await updateProgressMutation.mutateAsync({
        id: existingProgress.id,
        data: updates
      });
    }
  };

  const handleGenerateFeedback = async () => {
    if (!activeModule) return;

    const progress = progressData.find(p => p.module_id === activeModule.id);
    if (!progress) return;

    setGenerating(true);
    try {
      const feedback = await generateProgressFeedback(activeModule, progress);
      setAiFeedback(feedback);
      toast.success('AI feedback generated!');
    } catch (error) {
      toast.error('Failed to generate feedback');
    } finally {
      setGenerating(false);
    }
  };

  const roles = ['Executive', 'Manager', 'Technical Lead', 'Developer', 'Business Analyst', 'Data Scientist', 'End User'];
  const platforms = ['Google Gemini', 'Microsoft Copilot', 'Anthropic Claude', 'OpenAI ChatGPT'];

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              AI-Powered Training
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Personalized training modules with AI-driven feedback and progress tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList>
            <TabsTrigger value="modules">
              <BookOpen className="h-4 w-4 mr-2" />
              Training Modules
            </TabsTrigger>
            <TabsTrigger value="progress">
              <BarChart3 className="h-4 w-4 mr-2" />
              My Progress
            </TabsTrigger>
            <TabsTrigger value="generate">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-6">
            {activeModule ? (
              <div className="space-y-4">
                <Button variant="outline" onClick={() => setActiveModule(null)}>
                  ← Back to Modules
                </Button>
                <InteractiveTrainingViewer
                  module={activeModule}
                  progress={progressData.find(p => p.module_id === activeModule.id)}
                  onProgressUpdate={handleProgressUpdate}
                />
                <div className="flex justify-end">
                  <Button onClick={handleGenerateFeedback} disabled={generating}>
                    {generating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Get AI Feedback
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module) => {
                  const progress = progressData.find(p => p.module_id === module.id);
                  const status = progress?.status || 'not_started';

                  return (
                    <Card key={module.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <p className="text-sm text-slate-600 mt-1">{module.description}</p>
                          </div>
                          <Badge className={
                            status === 'completed' ? 'bg-green-600' :
                            status === 'in_progress' ? 'bg-blue-600' :
                            'bg-slate-400'
                          }>
                            {status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{module.platform}</Badge>
                            <Badge variant="outline">{module.user_role}</Badge>
                            <Badge variant="outline">{module.difficulty_level}</Badge>
                          </div>
                          <div className="text-sm text-slate-600">
                            Duration: {module.estimated_duration}
                          </div>
                          <Button
                            onClick={() => handleStartModule(module)}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            {status === 'completed' ? 'Review' : status === 'in_progress' ? 'Continue' : 'Start Training'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress">
            <ProgressTracker
              modules={modules}
              progressData={progressData}
              aiFeedback={aiFeedback}
            />
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Generate AI Training Module
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Assessment</label>
                  <Select value={selectedAssessment?.id} onValueChange={(id) => {
                    const assessment = assessments.find(a => a.id === id);
                    setSelectedAssessment(assessment);
                    setSelectedPlatform(assessment?.recommended_platforms?.[0]?.platform_name || '');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessments.map((assessment) => (
                        <SelectItem key={assessment.id} value={assessment.id}>
                          {assessment.organization_name} - {assessment.recommended_platforms?.[0]?.platform_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Target Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Platform</label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleAnalyzeSkillGaps}
                    disabled={generating || !selectedAssessment || !selectedRole}
                    variant="outline"
                    className="flex-1"
                  >
                    {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Analyze Skill Gaps
                  </Button>
                  <Button
                    onClick={handleGenerateModule}
                    disabled={generating || !selectedAssessment || !selectedRole || !selectedPlatform}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Generate Module
                  </Button>
                </div>
              </CardContent>
            </Card>

            {skillGaps && (
              <Card className="border-2 border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle>Skill Gap Analysis - {selectedRole}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Priority Training Areas</h4>
                    <div className="space-y-2">
                      {skillGaps.priority_training_areas?.map((area, idx) => (
                        <div key={idx} className="bg-amber-50 border border-amber-200 rounded p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-amber-900">{area.area}</h5>
                              <p className="text-sm text-amber-800 mt-1">{area.rationale}</p>
                            </div>
                            <Badge className="bg-amber-600">{area.urgency}</Badge>
                          </div>
                          <div className="text-xs text-amber-700 mt-2">
                            Est. Time: {area.estimated_training_time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Recommended Learning Path</h4>
                    <ol className="space-y-2">
                      {skillGaps.recommended_learning_path?.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-bold text-purple-600">{idx + 1}.</span>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}