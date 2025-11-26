import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, Brain, Target, Sparkles, Loader2,
  CheckCircle, Clock, ArrowRight, BookOpen, Award
} from 'lucide-react';

export default function PersonalizedTrainingPath({ userId, userRole, onboardingProgress, assessmentData }) {
  const [generating, setGenerating] = useState(false);
  const [trainingPath, setTrainingPath] = useState(null);
  const queryClient = useQueryClient();

  const { data: existingProgress = [] } = useQuery({
    queryKey: ['trainingProgress', userId],
    queryFn: () => base44.entities.TrainingProgress.filter({ user_email: userId }),
    enabled: !!userId
  });

  const generateTrainingPath = async () => {
    setGenerating(true);
    try {
      // Build context for Training Coach
      const context = {
        userRole,
        onboardingProgress: onboardingProgress?.progress || {},
        completedModules: existingProgress.filter(p => p.status === 'completed').length,
        assessmentInsights: assessmentData ? {
          maturityLevel: assessmentData.ai_assessment_score?.maturity_level,
          improvementAreas: assessmentData.ai_assessment_score?.improvement_areas,
          strengths: assessmentData.ai_assessment_score?.strengths
        } : null
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert AI Training Coach. Create a personalized training path.

USER PROFILE:
- Role: ${context.userRole}
- Onboarding Progress: ${JSON.stringify(context.onboardingProgress)}
- Completed Training Modules: ${context.completedModules}
${context.assessmentInsights ? `
ASSESSMENT INSIGHTS:
- Maturity Level: ${context.assessmentInsights.maturityLevel}
- Strengths: ${context.assessmentInsights.strengths?.join(', ')}
- Improvement Areas: ${context.assessmentInsights.improvementAreas?.map(a => a.area).join(', ')}
` : ''}

Create a personalized training path with:
1. Skill gap analysis based on role and progress
2. Recommended learning modules in priority order
3. Estimated time for each module
4. Adaptive recommendations based on their current level
5. Milestone achievements to unlock`,
        response_json_schema: {
          type: 'object',
          properties: {
            skill_gap_analysis: {
              type: 'object',
              properties: {
                current_level: { type: 'string' },
                target_level: { type: 'string' },
                key_gaps: { type: 'array', items: { type: 'string' } },
                strengths_to_leverage: { type: 'array', items: { type: 'string' } }
              }
            },
            recommended_path: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  module_id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  skill_focus: { type: 'array', items: { type: 'string' } },
                  difficulty: { type: 'string' },
                  estimated_duration: { type: 'string' },
                  priority: { type: 'string' },
                  prerequisites: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  badge: { type: 'string' },
                  unlock_criteria: { type: 'string' }
                }
              }
            },
            adaptive_tips: { type: 'array', items: { type: 'string' } },
            estimated_completion: { type: 'string' }
          }
        }
      });

      setTrainingPath(response);
    } catch (error) {
      console.error('Failed to generate training path:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Training Coach</h2>
                <p className="text-blue-100">Personalized learning paths based on your role and progress</p>
              </div>
            </div>
            <Button 
              onClick={generateTrainingPath}
              disabled={generating}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Generate Path</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {trainingPath && (
        <>
          {/* Skill Gap Analysis */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                Skill Gap Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Current Level</span>
                    <Badge>{trainingPath.skill_gap_analysis?.current_level}</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-600">Target Level</span>
                    <Badge className="bg-purple-100 text-purple-800">{trainingPath.skill_gap_analysis?.target_level}</Badge>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Key Gaps to Address</p>
                    <div className="space-y-1">
                      {trainingPath.skill_gap_analysis?.key_gaps?.map((gap, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                          {gap}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Strengths to Leverage</p>
                  <div className="space-y-1">
                    {trainingPath.skill_gap_analysis?.strengths_to_leverage?.map((strength, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Path */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Recommended Learning Path
                </CardTitle>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {trainingPath.estimated_completion}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingPath.recommended_path?.map((module, idx) => (
                  <div 
                    key={idx}
                    className="relative pl-8 pb-4 border-l-2 border-slate-200 last:border-0"
                  >
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{module.title}</h4>
                        <div className="flex gap-2">
                          <Badge className={getDifficultyColor(module.difficulty)}>
                            {module.difficulty}
                          </Badge>
                          <Badge className={getPriorityColor(module.priority)}>
                            {module.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{module.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {module.skill_focus?.map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          {module.estimated_duration}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Achievement Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trainingPath.milestones?.map((milestone, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl mb-2">{milestone.badge}</div>
                    <h4 className="font-semibold text-slate-900">{milestone.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      <strong>Unlock:</strong> {milestone.unlock_criteria}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Adaptive Tips */}
          {trainingPath.adaptive_tips?.length > 0 && (
            <Card className="bg-blue-50 border border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">Adaptive Learning Tips</p>
                    <ul className="space-y-1">
                      {trainingPath.adaptive_tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}