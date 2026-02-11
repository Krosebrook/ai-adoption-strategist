import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Clock, Award, Target, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProgressTracker({ modules, progressData, aiFeedback }) {
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userSettings } = useQuery({
    queryKey: ['userSettings', user?.email],
    queryFn: () => base44.entities.UserSettings.filter({ user_email: user.email }),
    enabled: !!user,
    initialData: []
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserSettings.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userSettings'] })
  });

  const currentSettings = userSettings?.[0];
  const trainingPrefs = currentSettings?.training_preferences || {};

  const savePreference = (key, value) => {
    if (currentSettings) {
      updateSettingsMutation.mutate({
        id: currentSettings.id,
        data: {
          training_preferences: {
            ...trainingPrefs,
            [key]: value
          }
        }
      });
    }
  };

  const completedModules = progressData?.filter(p => p.status === 'completed').length || 0;
  const inProgressModules = progressData?.filter(p => p.status === 'in_progress').length || 0;
  const totalModules = modules?.length || 0;
  const overallProgress = totalModules > 0 ? Math.floor((completedModules / totalModules) * 100) : 0;

  const totalTimeSpent = progressData?.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) || 0;
  const avgQuizScore = progressData?.reduce((sum, p) => {
    const latestScore = p.quiz_scores?.[p.quiz_scores.length - 1];
    return sum + (latestScore ? (latestScore.score / latestScore.total_questions) * 100 : 0);
  }, 0) / (progressData?.length || 1);

  // Extract unique skills
  const allSkills = [...new Set(modules?.flatMap(m => m.skills_covered || []))];

  // Filter modules
  const filteredModules = modules?.filter(module => {
    const progress = progressData?.find(p => p.module_id === module.id);
    
    if (priorityFilter === 'in_progress' && progress?.status !== 'in_progress') return false;
    if (priorityFilter === 'completed' && progress?.status !== 'completed') return false;
    if (priorityFilter === 'not_started' && progress) return false;
    
    if (skillFilter !== 'all' && !(module.skills_covered || []).includes(skillFilter)) return false;
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Training Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-slate-600 mb-1">Overall Progress</div>
              <div className="text-3xl font-bold text-purple-900">{overallProgress}%</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-slate-600 mb-1">Completed</div>
              <div className="text-3xl font-bold text-blue-900">{completedModules}/{totalModules}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <div className="text-sm text-slate-600 mb-1">In Progress</div>
              <div className="text-3xl font-bold text-amber-900">{inProgressModules}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-sm text-slate-600 mb-1">Time Invested</div>
              <div className="text-3xl font-bold text-green-900">{Math.floor(totalTimeSpent / 60)}h</div>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Module Progress Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Module Progress</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={priorityFilter} onValueChange={(val) => {
                setPriorityFilter(val);
                savePreference('priority_filter', val);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                </SelectContent>
              </Select>
              <Select value={skillFilter} onValueChange={(val) => {
                setSkillFilter(val);
                savePreference('skill_filter', val);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredModules?.map((module) => {
              const progress = progressData?.find(p => p.module_id === module.id);
              const status = progress?.status || 'not_started';
              const percentage = progress?.progress_percentage || 0;
              const latestQuiz = progress?.quiz_scores?.[progress.quiz_scores.length - 1];

              return (
                <div key={module.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{module.title}</h4>
                      <p className="text-sm text-slate-600">{module.platform} - {module.user_role}</p>
                    </div>
                    <Badge className={
                      status === 'completed' ? 'bg-green-600' :
                      status === 'in_progress' ? 'bg-blue-600' :
                      'bg-slate-400'
                    }>
                      {status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      {progress?.time_spent_minutes > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {progress.time_spent_minutes} min
                        </div>
                      )}
                      {latestQuiz && (
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Score: {latestQuiz.score}/{latestQuiz.total_questions}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Feedback */}
      {aiFeedback && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Target className="h-5 w-5" />
              AI-Powered Feedback & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Overall Assessment</h4>
              <p className="text-sm text-slate-700">{aiFeedback.overall_assessment}</p>
            </div>

            {aiFeedback.strengths?.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {aiFeedback.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-green-800">• {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiFeedback.areas_for_improvement?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-1">
                  {aiFeedback.areas_for_improvement.map((area, idx) => (
                    <li key={idx} className="text-sm text-amber-800">• {area}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiFeedback.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Recommendations</h4>
                <div className="space-y-2">
                  {aiFeedback.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="flex items-start gap-2">
                        <Badge className={`mt-0.5 ${
                          rec.priority === 'high' ? 'bg-red-600' :
                          rec.priority === 'medium' ? 'bg-yellow-600' :
                          'bg-blue-600'
                        }`}>
                          {rec.priority}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium text-blue-900 text-sm">{rec.action}</p>
                          <p className="text-xs text-blue-800 mt-1">{rec.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiFeedback.motivational_message && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <p className="text-sm text-purple-900 italic">"{aiFeedback.motivational_message}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}